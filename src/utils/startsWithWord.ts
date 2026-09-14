/** True if any letter/digit word in `text` starts with `query` (case-insensitive). */
export function matchesWordStart(text: string | null | undefined, query: string): boolean {
  const q = query.trim().toLowerCase()
  if (!q || !text) return false
  const tokens = text.toLowerCase().split(/[^\p{L}\p{N}]+/u).filter(Boolean)
  return tokens.some((token) => token.startsWith(q))
}
