import { describe, expect, it } from 'vitest'
import { formatDuration, formatNumber } from './format'

describe('formatNumber', () => {
  it('uses a decimal comma and dot thousands separator', () => {
    expect(formatNumber(82.5)).toBe('82,5')
    expect(formatNumber(1640)).toBe('1.640')
    expect(formatNumber(1.25, 2)).toBe('1,25')
  })

  it('drops trailing zeros and rounds to the allowed decimals', () => {
    expect(formatNumber(80)).toBe('80')
    expect(formatNumber(82.46)).toBe('82,5')
    expect(formatNumber(82.46, 0)).toBe('82')
  })
})

describe('formatDuration', () => {
  it('formats minutes and seconds', () => {
    expect(formatDuration(0)).toBe('0:00')
    expect(formatDuration(65)).toBe('1:05')
    expect(formatDuration(180)).toBe('3:00')
  })

  it('never shows negative time', () => {
    expect(formatDuration(-4)).toBe('0:00')
  })
})

describe('dates and times', () => {
  it('formats days in Dutch', async () => {
    const { formatDayShort, formatDayLong, formatClock, formatMinutes } = await import('./format')
    expect(formatDayShort('2026-11-16')).toMatch(/^16 nov/)
    expect(formatDayLong('2026-11-16')).toBe('maandag 16 november')
    expect(formatClock('2026-11-16T16:42:00Z')).toBe('17:42')
    expect(formatMinutes(48)).toBe('48 min')
    expect(formatMinutes(65)).toBe('1 u 05')
  })
})

describe('parseDecimal', () => {
  it('accepts a comma or a dot and rejects garbage', async () => {
    const { parseDecimal } = await import('./format')
    expect(parseDecimal('78,4')).toBe(78.4)
    expect(parseDecimal(' 78.4 ')).toBe(78.4)
    expect(parseDecimal('')).toBeNull()
    expect(parseDecimal('abc')).toBeNull()
  })
})
