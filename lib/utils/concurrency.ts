/**
 * Runs an async task over every item with a fixed ceiling on how many are in
 * flight at once, preserving input order in the results.
 *
 * Both the mail fetchers and the analyzer fan out per message or per sender,
 * where an unbounded `Promise.all` is what earns a provider rate limit.
 */
export async function mapWithConcurrency<T, R>(
  items: readonly T[],
  limit: number,
  run: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length)
  let cursor = 0

  const worker = async () => {
    while (cursor < items.length) {
      const index = cursor++
      results[index] = await run(items[index])
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker))

  return results
}
