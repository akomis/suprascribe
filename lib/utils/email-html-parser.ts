import { convert } from 'html-to-text'

const URL_REGEX = /https?:\/\/[^\s<>"{}|\\^`[\]]+/gi

const INVISIBLE_CHARS_REGEX = new RegExp(
  [
    '\u200B',
    '\u200C',
    '\u200D',
    '\u200E',
    '\u200F',
    '\u034F',
    '\u061C',
    '\u00AD',
    '\uFEFF',
    '\u2060',
    '\u2061',
    '\u2062',
    '\u2063',
    '\u2064',
    '\u034F',
    '\u17B4',
    '\u17B5',
    '\u115F',
    '\u1160',
    '\u3164',
    '\uFFA0',
    '\u180E',
    '\u034F',
  ].join('|'),
  'g',
)

function stripInvisibleChars(text: string): string {
  return text.replace(INVISIBLE_CHARS_REGEX, '')
}

export function stripHtmlFromEmail(html: string): string {
  if (!html) return ''

  const text = convert(html, {
    wordwrap: false,
    preserveNewlines: false,
    selectors: [
      {
        selector: 'a',
        options: {
          ignoreHref: true,
        },
      },
      { selector: 'img', format: 'skip' },
      { selector: 'table', format: 'dataTable' },
      { selector: 'style', format: 'skip' },
      { selector: 'script', format: 'skip' },
    ],
  })

  return stripInvisibleChars(text)
    .replace(URL_REGEX, '')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/ {2,}/g, ' ')
    .trim()
}
