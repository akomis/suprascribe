import {
  buildSearchQuery,
  EMAIL_DISCOVERY_CONFIG,
  searchWindowStart,
} from '@/lib/config/email-discovery'
import type { EmailData } from '@/lib/types/email'
import { mapWithConcurrency } from '@/lib/utils/concurrency'
import Imap from 'imap'
import type { Readable } from 'stream'
import { simpleParser } from 'mailparser'

export type { EmailData }

// Gmail wants one request per message. Unbounded fan-out earned 429s and, since
// an exhausted retry returned null, the dropped messages were invisible.
const GMAIL_MESSAGE_CONCURRENCY = 10

const MAX_FETCH_ATTEMPTS = 3

const BASE_BACKOFF_MS = 500

const MAX_BACKOFF_MS = 8_000

// A page of message ids. Gmail caps this at 500 regardless of what we ask for.
const GMAIL_PAGE_SIZE = 500

// Graph rejects $top above 1000 on a $search query.
const OUTLOOK_PAGE_SIZE = 250

// Whole-mailbox ceiling for one IMAP fetch, after which whatever has been
// parsed is returned. Without it a callback that never fires hangs the request
// for as long as the platform allows.
const IMAP_FETCH_TIMEOUT_MS = 120_000

interface GmailHeader {
  name: string
  value: string
}

interface GmailPayload {
  body?: { data: string }
  mimeType?: string
  parts?: GmailPayload[]
  headers?: GmailHeader[]
}

interface OutlookMessage {
  subject?: string
  from?: { emailAddress?: { address?: string } }
  receivedDateTime?: string
  body?: { content?: string }
  internetMessageHeaders?: { name?: string; value?: string }[]
}

/**
 * Pulls the usable opt-out link out of a List-Unsubscribe header.
 *
 * The header holds one or more angle-bracketed URIs, comma separated, e.g.
 * `<https://acme.com/unsub?u=1>, <mailto:unsub@acme.com>`. Only the https form
 * is useful to show a user, and it is preferred even when a mailto comes first.
 */
export function parseListUnsubscribe(raw: string | undefined): string | undefined {
  if (!raw) return undefined

  const uris = Array.from(raw.matchAll(/<([^>]+)>/g), (m) => m[1].trim())
  const candidates = uris.length > 0 ? uris : [raw.trim()]

  return candidates.find((uri) => /^https:\/\//i.test(uri))
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** Whether it is worth trying this status again, and how long to wait first. */
function retryDelayMs(response: Response, attempt: number): number | null {
  // 4xx other than 429 will fail again identically; only 429 and 5xx are worth
  // a second attempt.
  if (response.status !== 429 && response.status < 500) return null

  const retryAfter = response.headers.get('retry-after')
  if (retryAfter) {
    const seconds = Number(retryAfter)
    if (Number.isFinite(seconds)) return Math.min(seconds * 1_000, MAX_BACKOFF_MS)
  }

  const exponential = BASE_BACKOFF_MS * 2 ** attempt
  // Jitter so a burst of parallel workers does not retry in lockstep.
  return Math.min(exponential, MAX_BACKOFF_MS) * (0.5 + Math.random())
}

async function fetchWithBackoff(url: string, accessToken: string): Promise<Response | null> {
  for (let attempt = 0; attempt < MAX_FETCH_ATTEMPTS; attempt++) {
    let response: Response
    try {
      response = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } })
    } catch {
      if (attempt === MAX_FETCH_ATTEMPTS - 1) return null
      await sleep(BASE_BACKOFF_MS * 2 ** attempt)
      continue
    }

    if (response.ok) return response

    const delay = retryDelayMs(response, attempt)
    if (delay === null || attempt === MAX_FETCH_ATTEMPTS - 1) return response

    await sleep(delay)
  }

  return null
}

export async function fetchGmailEmails(
  accessToken: string,
  keywords: readonly string[],
): Promise<EmailData[]> {
  try {
    const { maxEmailsPerProvider, billingSenderDomains } = EMAIL_DISCOVERY_CONFIG
    const searchQuery = buildSearchQuery(keywords, 'gmail', {
      senders: billingSenderDomains,
      since: searchWindowStart(),
    })

    const messageIds: string[] = []
    let pageToken: string | undefined

    // Gmail returns ids a page at a time; the token was never read before, so a
    // heavy inbox silently stopped at the first page.
    do {
      const params = new URLSearchParams({
        q: searchQuery,
        maxResults: String(Math.min(GMAIL_PAGE_SIZE, maxEmailsPerProvider - messageIds.length)),
      })
      if (pageToken) params.set('pageToken', pageToken)

      const listResponse = await fetchWithBackoff(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages?${params}`,
        accessToken,
      )

      if (!listResponse || !listResponse.ok) {
        const status = listResponse?.status ?? 'network failure'
        const errorData = listResponse ? await listResponse.json().catch(() => ({})) : {}
        // A later page failing still leaves the earlier ones worth analysing.
        if (messageIds.length > 0) break
        throw new Error(`Gmail API error: ${status} - ${JSON.stringify(errorData)}`)
      }

      const listData = await listResponse.json()
      for (const message of listData.messages || []) messageIds.push(message.id)
      pageToken = listData.nextPageToken
    } while (pageToken && messageIds.length < maxEmailsPerProvider)

    if (messageIds.length === 0) return []

    const fetched = await mapWithConcurrency(
      messageIds,
      GMAIL_MESSAGE_CONCURRENCY,
      async (msgId): Promise<EmailData | null> => {
        const messageResponse = await fetchWithBackoff(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msgId}?format=full`,
          accessToken,
        )

        if (!messageResponse || !messageResponse.ok) return null

        const messageData = await messageResponse.json().catch(() => null)
        if (!messageData) return null

        const headers: GmailHeader[] = messageData.payload?.headers || []
        const header = (name: string) => headers.find((h) => h.name?.toLowerCase() === name)?.value

        const subject = header('subject') || 'No Subject'
        const from = header('from') || 'Unknown'
        const date = header('date') || new Date().toISOString()
        const listUnsubscribe = parseListUnsubscribe(header('list-unsubscribe'))

        const body = extractGmailBody(messageData.payload)
        return { subject, from, date, body, ...(listUnsubscribe && { listUnsubscribe }) }
      },
    )

    return fetched
      .filter((email): email is EmailData => email !== null)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  } catch (error) {
    throw new Error(
      `Failed to fetch Gmail emails: ${error instanceof Error ? error.message : 'Unknown error'}`,
    )
  }
}

function extractGmailBody(payload: GmailPayload | undefined): string {
  if (!payload) return ''

  if (payload.body?.data) {
    return decodeBase64(payload.body.data)
  }

  if (payload.parts) {
    let bodyText = ''
    for (const part of payload.parts) {
      if (part.mimeType === 'text/plain' && part.body?.data) {
        bodyText = decodeBase64(part.body.data)
        break
      } else if (part.mimeType === 'text/html' && part.body?.data && !bodyText) {
        bodyText = decodeBase64(part.body.data)
      } else if (part.parts) {
        bodyText = extractGmailBody(part)
        if (bodyText) break
      }
    }
    return bodyText
  }

  return ''
}

function decodeBase64(data: string): string {
  try {
    const base64 = data.replace(/-/g, '+').replace(/_/g, '/')
    return Buffer.from(base64, 'base64').toString('utf-8')
  } catch {
    return ''
  }
}

export async function fetchOutlookEmails(
  accessToken: string,
  keywords: readonly string[],
): Promise<EmailData[]> {
  try {
    const { maxEmailsPerProvider, billingSenderDomains } = EMAIL_DISCOVERY_CONFIG
    const searchQuery = buildSearchQuery(keywords, 'outlook', {
      senders: billingSenderDomains,
      since: searchWindowStart(),
    })

    const params = new URLSearchParams({
      $search: searchQuery,
      $top: String(OUTLOOK_PAGE_SIZE),
      $select: 'subject,body,from,receivedDateTime,internetMessageHeaders',
    })

    // No $orderby: Graph refuses to sort a $search result set, so the ordering
    // is applied client-side once every page is in.
    let url: string | undefined = `https://graph.microsoft.com/v1.0/me/messages?${params}`
    const messages: OutlookMessage[] = []

    while (url && messages.length < maxEmailsPerProvider) {
      const response: Response | null = await fetchWithBackoff(url, accessToken)

      if (!response || !response.ok) {
        const status = response?.status ?? 'network failure'
        const errorData = response ? await response.json().catch(() => ({})) : {}
        if (messages.length > 0) break
        throw new Error(`Microsoft Graph API error: ${status} - ${JSON.stringify(errorData)}`)
      }

      const data = await response.json()
      messages.push(...(data.value || []))
      url = data['@odata.nextLink']
    }

    return messages
      .slice(0, maxEmailsPerProvider)
      .map((msg) => {
        const listUnsubscribe = parseListUnsubscribe(
          msg.internetMessageHeaders?.find((h) => h.name?.toLowerCase() === 'list-unsubscribe')
            ?.value,
        )

        return {
          subject: msg.subject || 'No Subject',
          from: msg.from?.emailAddress?.address || 'Unknown',
          date: msg.receivedDateTime || new Date().toISOString(),
          body: msg.body?.content || '',
          ...(listUnsubscribe && { listUnsubscribe }),
        }
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  } catch (error) {
    throw new Error(
      `Failed to fetch Outlook emails: ${error instanceof Error ? error.message : 'Unknown error'}`,
    )
  }
}

/**
 * Folds a list of IMAP criteria into a right-nested OR tree.
 *
 * IMAP's OR is strictly binary, so `a OR b OR c` has to be written
 * `OR a (OR b c)`.
 */
export function orCriteria(criteria: unknown[][]): unknown[] {
  if (criteria.length === 0) return []
  if (criteria.length === 1) return criteria[0]

  return ['OR', criteria[0], orCriteria(criteria.slice(1))]
}

export function buildImapSearchCriteria(
  keywords: readonly string[],
  senders: readonly string[] = [],
  since?: Date,
): unknown[][] {
  const matchers: unknown[][] = [
    ...keywords.map((kw) => ['SUBJECT', kw]),
    ...senders.map((domain) => ['FROM', domain]),
  ]

  const criteria: unknown[][] = []
  // Sibling criteria are AND-ed, so the window applies to whichever clause hit.
  if (since) criteria.push(['SINCE', since])
  if (matchers.length > 0) criteria.push(orCriteria(matchers))

  return criteria.length > 0 ? criteria : [['ALL']]
}

function connectImap(imap: Imap): Promise<void> {
  return new Promise((resolve, reject) => {
    imap.once('ready', () => resolve())
    imap.once('error', (err: Error) => {
      reject(
        new Error(
          `IMAP connection error: ${err.message}. Please check your credentials and server settings.`,
        ),
      )
    })
    imap.connect()
  })
}

/**
 * Names of the mailboxes worth searching.
 *
 * INBOX alone misses every archived receipt, which on a tidy mailbox is most of
 * them. Trash and Junk are skipped: a cancelled-then-deleted receipt would
 * resurrect a subscription the user no longer has.
 */
function listSearchableBoxes(imap: Imap): Promise<string[]> {
  return new Promise((resolve) => {
    imap.getBoxes((err, boxes) => {
      if (err || !boxes) return resolve(['INBOX'])

      const found: string[] = []

      const walk = (node: Imap.MailBoxes, prefix: string) => {
        for (const [name, box] of Object.entries(node)) {
          const path = prefix ? `${prefix}${box.delimiter || '/'}${name}` : name
          const attribs = (box.attribs || []).map((a) => a.toUpperCase())

          const skip = attribs.includes('\\TRASH') || attribs.includes('\\JUNK')
          const archive = attribs.includes('\\ALL') || attribs.includes('\\ARCHIVE')

          if (!skip && archive) found.push(path)
          if (box.children) walk(box.children, path)
        }
      }

      walk(boxes, '')

      // INBOX first so its results survive the cap on a huge mailbox.
      return resolve(['INBOX', ...found.filter((name) => name.toUpperCase() !== 'INBOX')])
    })
  })
}

function openBox(imap: Imap, name: string): Promise<boolean> {
  return new Promise((resolve) => {
    imap.openBox(name, true, (err) => resolve(!err))
  })
}

function searchBox(imap: Imap, criteria: unknown[][]): Promise<number[]> {
  return new Promise((resolve) => {
    imap.search(criteria as never[], (err, results) => resolve(err || !results ? [] : results))
  })
}

function fetchAndParseEmails(imap: Imap, messageIds: number[]): Promise<EmailData[]> {
  return new Promise((resolve) => {
    const emails: EmailData[] = []
    let settled = false

    const finish = () => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      emails.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      resolve(emails)
    }

    // Resolves with whatever parsed in time rather than hanging forever on a
    // parser callback that never fires.
    const timer = setTimeout(finish, IMAP_FETCH_TIMEOUT_MS)

    const imapFetch = imap.fetch(messageIds, { bodies: '', struct: true })
    let parsedCount = 0

    const countOne = () => {
      parsedCount++
      if (parsedCount === messageIds.length) finish()
    }

    imapFetch.on('message', (msg) => {
      msg.on('body', (stream) => {
        simpleParser(stream as unknown as Readable, (err, parsed) => {
          if (err) return countOne()

          const body = parsed.html || parsed.text || parsed.textAsHtml || ''
          const rawListUnsubscribe = parsed.headers?.get('list-unsubscribe')
          const listUnsubscribe = parseListUnsubscribe(
            typeof rawListUnsubscribe === 'string' ? rawListUnsubscribe : undefined,
          )

          emails.push({
            subject: parsed.subject || 'No Subject',
            from: parsed.from?.text || 'Unknown',
            date: parsed.date?.toISOString() || new Date().toISOString(),
            body,
            ...(listUnsubscribe && { listUnsubscribe }),
          })

          countOne()
        })
      })
    })

    imapFetch.once('error', finish)
    imapFetch.once('end', () => {
      // Parsing is async and outlives the fetch stream, so only settle here if
      // every message already came back.
      if (parsedCount === messageIds.length) finish()
    })
  })
}

export async function fetchGmailProfileEmail(token: string): Promise<string> {
  const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!response.ok) throw new Error('Failed to get Google email address')
  const data = await response.json()
  return data.emailAddress
}

export async function fetchOutlookProfileEmail(token: string): Promise<string> {
  const response = await fetch('https://graph.microsoft.com/v1.0/me', {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!response.ok) throw new Error('Failed to get Microsoft email address')
  const data = await response.json()
  return data.mail || data.userPrincipalName
}

export async function fetchImapEmails(
  credentials: {
    email: string
    password: string
    server?: string
    port?: number
    useTls?: boolean
  },
  keywords: readonly string[],
): Promise<EmailData[]> {
  const { maxEmailsPerProvider, billingSenderDomains } = EMAIL_DISCOVERY_CONFIG
  const useTls = credentials.useTls !== false

  const imap = new Imap({
    user: credentials.email,
    password: credentials.password,
    host: credentials.server!,
    port: credentials.port!,
    tls: useTls,
    tlsOptions: useTls ? { rejectUnauthorized: true, servername: credentials.server! } : undefined,
  })

  await connectImap(imap)

  try {
    const criteria = buildImapSearchCriteria(keywords, billingSenderDomains, searchWindowStart())
    const boxes = await listSearchableBoxes(imap)
    const collected: EmailData[] = []
    const seen = new Set<string>()

    for (const box of boxes) {
      if (collected.length >= maxEmailsPerProvider) break
      if (!(await openBox(imap, box))) continue

      const ids = await searchBox(imap, criteria)
      if (ids.length === 0) continue

      const budget = maxEmailsPerProvider - collected.length
      const emails = await fetchAndParseEmails(imap, ids.slice(-budget))

      for (const email of emails) {
        // Gmail exposes the same message in INBOX and in All Mail.
        const key = `${email.date}|${email.from}|${email.subject}`
        if (seen.has(key)) continue
        seen.add(key)
        collected.push(email)
      }
    }

    return collected.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  } finally {
    imap.end()
  }
}
