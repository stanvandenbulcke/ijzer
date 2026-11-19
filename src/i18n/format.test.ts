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
