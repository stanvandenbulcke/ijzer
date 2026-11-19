/** Path of one of the two photos (start / end position) of a catalog exercise. */
export function exerciseImage(id: string, index: 0 | 1): string {
  return `/exercises/${encodeURIComponent(id)}/${index}.webp`
}

/** Initials for exercises without a photo: "Cable Rope Fly" → "CR". */
export function initials(name: string): string {
  const words = name
    .replace(/[^\p{L}\p{N} ]/gu, ' ')
    .split(/\s+/)
    .filter(Boolean)
  return words
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('')
}
