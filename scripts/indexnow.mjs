#!/usr/bin/env node
/**
 * Submits the live sitemap's URLs to IndexNow, which fans them out to every
 * participating engine (Bing, Yandex, Seznam, Naver, Yep). Google does not
 * participate, so this complements Search Console rather than replacing it.
 *
 * Manual only - run it AFTER a deploy has landed, so the engines that crawl in
 * response see the new content rather than the previous build.
 *
 *   yarn indexnow              submit every URL in the live sitemap
 *   yarn indexnow --dry-run    print the payload, submit nothing
 *   yarn indexnow --url=<url>  submit a single URL
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

async function fetchSitemapUrls() {
  const response = await fetch(`${ORIGIN}/sitemap.xml`)

  if (!response.ok) {
    fail(`GET ${ORIGIN}/sitemap.xml returned ${response.status}`)
  }

  const urls = [...(await response.text()).matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1])

  if (urls.length === 0) {
    fail('sitemap contained no <loc> entries')
  }

  return urls
}

async function main() {
  const args = process.argv.slice(2)
  const dryRun = args.includes('--dry-run')
  const single = args.find((arg) => arg.startsWith('--url='))?.slice('--url='.length)

  const key = readKey()
  const urlList = single ? [single] : await fetchSitemapUrls()

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
