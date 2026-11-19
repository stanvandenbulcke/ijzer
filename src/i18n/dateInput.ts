/**
 * Typing a Belgian date: "15032007" shows as "15/03/2007" while you type; slashes are added
 * automatically and typed slashes or spaces are ignored.
 */
export function formatDateDigits(input: string): string {
  const digits = input.replace(/\D/g, '').slice(0, 8)
  if (digits.length <= 2) return digits
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`
}

/** "15/03/2007" → "2007-03-15"; null for incomplete or impossible dates (31/02, 1890…). */
export function parseDutchDate(text: string, today = new Date()): string | null {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(text)
  if (!match) return null
  const [, dd, mm, yyyy] = match
  const iso = `${yyyy}-${mm}-${dd}`
  const date = new Date(`${iso}T00:00:00Z`)
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== iso) return null
  const year = Number(yyyy)
  if (year < 1920 || date.getTime() > today.getTime()) return null
  return iso
}

/** "2007-03-15" → "15/03/2007". */
export function toDutchDate(iso: string): string {
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}
