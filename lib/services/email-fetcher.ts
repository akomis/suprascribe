import { buildSearchQuery, EMAIL_DISCOVERY_CONFIG } from '@/lib/config/email-discovery'
import Imap from 'imap'
import type { Readable } from 'stream'
import { simpleParser } from 'mailparser'

export interface EmailData {
  subject: string
  body: string
  from: string
  date: string
}

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
}

export async function fetchGmailEmails(
  accessToken: string,
  keywords: readonly string[],
): Promise<EmailData[]> {
  try {
    const { maxEmailsPerProvider } = EMAIL_DISCOVERY_CONFIG
    const searchQuery = buildSearchQuery(keywords, 'gmail')
    const listUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(searchQuery)}&maxResults=${maxEmailsPerProvider}`

    const listResponse = await fetch(listUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })

    if (!listResponse.ok) {
      const errorData = await listResponse.json().catch(() => ({}))
      throw new Error(`Gmail API error: ${listResponse.status} - ${JSON.stringify(errorData)}`)
    }

    const listData = await listResponse.json()
    const messages = listData.messages || []

    if (messages.length === 0) {
      return []
    }

    const fetchWithRetry = async (msgId: string, retries = 3): Promise<EmailData | null> => {
      const messageUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msgId}?format=full`

      for (let attempt = 0; attempt < retries; attempt++) {
        try {
          const messageResponse = await fetch(messageUrl, {
            headers: { Authorization: `Bearer ${accessToken}` },
          })

          if (!messageResponse.ok) {
            if (attempt < retries - 1) {
              await new Promise((r) => setTimeout(r, 500 * (attempt + 1)))
              continue
            }
            return null
          }

          const messageData = await messageResponse.json()
          const headers: GmailHeader[] = messageData.payload?.headers || []
          const subject = headers.find((h) => h.name === 'Subject')?.value || 'No Subject'
          const from = headers.find((h) => h.name === 'From')?.value || 'Unknown'
          const date = headers.find((h) => h.name === 'Date')?.value || new Date().toISOString()

          const body = extractGmailBody(messageData.payload)
          return { subject, from, date, body }
        } catch (error) {
          console.warn(`Gmail fetch attempt ${attempt + 1}/${retries} failed for ${msgId}:`, error)
          if (attempt < retries - 1) {
            await new Promise((r) => setTimeout(r, 500 * (attempt + 1)))
          }
        }
      }
      return null
    }

    const emailPromises = messages.map((msg: { id: string }) => fetchWithRetry(msg.id))
    const emails = await Promise.all(emailPromises)
    const validEmails = emails.filter((email): email is EmailData => email !== null)

    return validEmails.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
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
    const { maxEmailsPerProvider } = EMAIL_DISCOVERY_CONFIG
    const filterQuery = buildSearchQuery(keywords, 'outlook')
    const url = `https://graph.microsoft.com/v1.0/me/messages?$search=${encodeURIComponent(filterQuery)}&$orderby=receivedDateTime desc&$top=${maxEmailsPerProvider}&$select=subject,body,from,receivedDateTime`

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(
        `Microsoft Graph API error: ${response.status} - ${JSON.stringify(errorData)}`,
      )
    }

    const data = await response.json()
    const messages: OutlookMessage[] = data.value || []

    return messages.map((msg) => ({
      subject: msg.subject || 'No Subject',
      from: msg.from?.emailAddress?.address || 'Unknown',
      date: msg.receivedDateTime || new Date().toISOString(),
      body: msg.body?.content || '',
    }))
  } catch (error) {
    throw new Error(
      `Failed to fetch Outlook emails: ${error instanceof Error ? error.message : 'Unknown error'}`,
    )
  }
}

function buildImapSearchCriteria(keywords: readonly string[]): unknown {
  if (keywords.length === 0) return []
  if (keywords.length === 1) return ['SUBJECT', keywords[0]]
  if (keywords.length === 2) {
    return ['OR', ['SUBJECT', keywords[0]], ['SUBJECT', keywords[1]]]
  }
  return ['OR', ['SUBJECT', keywords[0]], buildImapSearchCriteria(keywords.slice(1))]
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

function searchImapEmails(
  imap: Imap,
  keywords: readonly string[],
  maxResults: number,
): Promise<number[]> {
  return new Promise((resolve, reject) => {
    imap.openBox('INBOX', true, (err) => {
      if (err) {
        imap.end()
        return reject(new Error(`Failed to open INBOX: ${err.message}`))
      }

      const searchCriteria = buildImapSearchCriteria(keywords)

      imap.search([searchCriteria] as unknown[], (err, results) => {
        if (err) {
          imap.end()
          return reject(new Error(`IMAP search failed: ${err.message}`))
        }

        if (!results || results.length === 0) {
          imap.end()
          return resolve([])
        }

        resolve(results.slice(-maxResults))
      })
    })
  })
}

function fetchAndParseEmails(imap: Imap, messageIds: number[]): Promise<EmailData[]> {
  return new Promise((resolve, reject) => {
    const emails: EmailData[] = []
    const imapFetch = imap.fetch(messageIds, { bodies: '', struct: true })

    let parsedCount = 0
    const totalToFetch = messageIds.length

    const checkIfComplete = () => {
      if (parsedCount === totalToFetch) {
        imap.end()
      }
    }

    imapFetch.on('message', (msg) => {
      msg.on('body', (stream) => {
        simpleParser(stream as unknown as Readable, (err, parsed) => {
          if (err) {
            parsedCount++
            checkIfComplete()
            return
          }

          const body = parsed.html || parsed.text || parsed.textAsHtml || ''

          emails.push({
            subject: parsed.subject || 'No Subject',
            from: parsed.from?.text || 'Unknown',
            date: parsed.date?.toISOString() || new Date().toISOString(),
            body,
          })

          parsedCount++
          checkIfComplete()
        })
      })
    })

    imapFetch.once('error', (err: unknown) => {
      const message = err instanceof Error ? err.message : String(err)
      imap.end()
      reject(new Error(`Fetch error: ${message}`))
    })

    imap.once('end', () => {
      emails.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      resolve(emails)
    })
  })
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
  const { maxEmailsPerProvider } = EMAIL_DISCOVERY_CONFIG
  const useTls = credentials.useTls !== false

  const imapConfig = {
    user: credentials.email,
    password: credentials.password,
    host: credentials.server!,
    port: credentials.port!,
    tls: useTls,
    tlsOptions: useTls
      ? {
          rejectUnauthorized: true,
          servername: credentials.server!,
        }
      : undefined,
  }

  const imap = new Imap(imapConfig)

  await connectImap(imap)

  const messageIds = await searchImapEmails(imap, keywords, maxEmailsPerProvider)
  if (messageIds.length === 0) {
    return []
  }

  return fetchAndParseEmails(imap, messageIds)
}
