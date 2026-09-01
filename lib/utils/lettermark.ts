/**
 * Deterministic lettermark used when no logo can be resolved for a service.
 * Same name always yields the same initials and colour, across renders and SSR.
 */

/** Mid-lightness hues, all legible under white text. */
const LETTERMARK_HUES = [25, 50, 85, 140, 165, 195, 230, 265, 300, 340]

function hashName(name: string): number {
  let hash = 2166136261
  for (let i = 0; i < name.length; i++) {
    hash ^= name.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

function normalize(name: string): string {
  return name.trim().toLowerCase()
}

export function getLettermarkInitials(name: string): string {
  const words = name
    .split(/[\s\-_/&.,]+/)
    .map((word) => word.replace(/[^\p{L}\p{N}]/gu, ''))
    .filter(Boolean)

  if (words.length === 0) return '?'
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return (words[0][0] + words[1][0]).toUpperCase()
}

export function getLettermarkColor(name: string): string {
  const hue = LETTERMARK_HUES[hashName(normalize(name)) % LETTERMARK_HUES.length]
  return `oklch(0.58 0.14 ${hue})`
}
