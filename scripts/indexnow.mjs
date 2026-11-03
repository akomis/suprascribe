#!/usr/bin/env node
/**
 * Submits the live sitemap's URLs to IndexNow, which fans them out to every
 * participating engine (Bing, Yandex, Seznam, Naver, Yep). Google does not
 * participate, so this complements Search Console rather than replacing it.
 *
 * Runs AFTER a deploy has landed, so the engines that crawl in response see the
 * new content rather than the previous build. .github/workflows/indexnow.yml
 * does this on every successful production deploy; the commands below are for
 * running it by hand.
 *
 *   yarn indexnow                           submit every URL in the live sitemap
 *   yarn indexnow --changed-since=<date>    only URLs whose lastmod is on/after <date>
 *   yarn indexnow --dry-run                 print the payload, submit nothing
 *   yarn indexnow --url=<url>               submit a single URL
 */

import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

// Canonical origin lives in lib/utils/metadata.ts (SITE_URL); repeated here
// because this script runs outside the TypeScript build.
const HOST = 'www.suprascribe.com'
const ORIGIN = `https://${HOST}`
const ENDPOINT = 'https://api.indexnow.org/indexnow'
const PUBLIC_DIR = join(import.meta.dirname, '..', 'public')

function fail(message) {
  console.error(`indexnow: ${message}`)
  process.exit(1)
}

/**
 * The key file is named after its own contents, so the filename is the key.
 * Asserting the two match makes it impossible to submit a key that the file
 * at keyLocation would not validate.
 */
function readKey() {
  const files = readdirSync(PUBLIC_DIR).filter((name) => name.endsWith('.txt'))

  if (files.length !== 1) {
    fail(
      files.length === 0
        ? 'no key file found in public/ - create public/<key>.txt containing exactly <key>'
        : `expected exactly one .txt in public/, found ${files.length}: ${files.join(', ')}`,
    )
  }

  const key = files[0].replace(/\.txt$/, '')
  const contents = readFileSync(join(PUBLIC_DIR, files[0]), 'utf8').trim()

  if (contents !== key) {
    fail(`public/${files[0]} contains "${contents}" but its filename implies "${key}"`)
  }

  return key
}

/**
 * `since` is a YYYY-MM-DD date; when set, only entries whose lastmod falls on or
 * after it are kept. The comparison is by day because lastmod is a content date
 * (midnight UTC), not a build time. Entries without a lastmod are always kept.
 */
async function fetchSitemapUrls(since) {
  // The query string only busts any edge cache; Next ignores it.
  const response = await fetch(`${ORIGIN}/sitemap.xml?t=${Date.now()}`)

  if (!response.ok) {
    fail(`GET ${ORIGIN}/sitemap.xml returned ${response.status}`)
  }

  const entries = [...(await response.text()).matchAll(/<url>([\s\S]*?)<\/url>/g)].map(
    ([, block]) => ({
      loc: block.match(/<loc>(.*?)<\/loc>/)?.[1],
      lastmod: block.match(/<lastmod>(.*?)<\/lastmod>/)?.[1],
    }),
  )

  if (entries.length === 0 || entries.some((entry) => !entry.loc)) {
    fail('sitemap contained no <loc> entries, or a <url> without one')
  }

  return entries
    .filter((entry) => !since || !entry.lastmod || entry.lastmod.slice(0, 10) >= since)
    .map((entry) => entry.loc)
}

async function main() {
  const args = process.argv.slice(2)
  const dryRun = args.includes('--dry-run')
  const single = args.find((arg) => arg.startsWith('--url='))?.slice('--url='.length)
  const since = args
    .find((arg) => arg.startsWith('--changed-since='))
    ?.slice('--changed-since='.length)

  if (since !== undefined && !/^\d{4}-\d{2}-\d{2}$/.test(since)) {
    fail(`--changed-since expects YYYY-MM-DD, got "${since}"`)
  }

  const key = readKey()
  const urlList = single ? [single] : await fetchSitemapUrls(since)

  if (urlList.length === 0) {
    console.log(`indexnow: no sitemap URLs changed since ${since} - nothing to submit`)
    return
  }

  const offSite = urlList.filter((url) => !url.startsWith(ORIGIN))
  if (offSite.length > 0) {
    fail(`refusing to submit URLs outside ${ORIGIN}: ${offSite.join(', ')}`)
  }

  const payload = {
    host: HOST,
    key,
    keyLocation: `${ORIGIN}/${key}.txt`,
    urlList,
  }

  if (dryRun) {
    console.log(JSON.stringify(payload, null, 2))
    console.log(`\nindexnow: dry run - ${urlList.length} URL(s) not submitted`)
    return
  }

  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(payload),
  })

  // 200 = accepted, 202 = accepted with key validation still pending.
  if (response.status === 200 || response.status === 202) {
    console.log(`indexnow: submitted ${urlList.length} URL(s) - HTTP ${response.status}`)
    return
  }

  fail(`HTTP ${response.status} - ${(await response.text()).trim() || '(empty body)'}`)
}

await main()
