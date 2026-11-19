import { describe, expect, it } from 'vitest'
import { formatDateDigits, parseDutchDate, toDutchDate } from './dateInput'

describe('formatDateDigits', () => {
  it('adds slashes while typing', () => {
    expect(formatDateDigits('1')).toBe('1')
    expect(formatDateDigits('15')).toBe('15')
    expect(formatDateDigits('150')).toBe('15/0')
    expect(formatDateDigits('1503')).toBe('15/03')
    expect(formatDateDigits('15032')).toBe('15/03/2')
    expect(formatDateDigits('15032007')).toBe('15/03/2007')
  })

  it('ignores typed slashes, spaces and extra digits', () => {
    expect(formatDateDigits('15/03/2007')).toBe('15/03/2007')
    expect(formatDateDigits('15 03 20071')).toBe('15/03/2007')
    expect(formatDateDigits('')).toBe('')
  })
})

describe('parseDutchDate', () => {
  const today = new Date('2026-11-20T12:00:00Z')
  it('accepts real dates', () => {
    expect(parseDutchDate('15/03/2007', today)).toBe('2007-03-15')
    expect(parseDutchDate('29/02/2004', today)).toBe('2004-02-29')
  })

  it('rejects incomplete, impossible or future dates', () => {
    expect(parseDutchDate('15/03/20', today)).toBeNull()
    expect(parseDutchDate('31/02/2007', today)).toBeNull()
    expect(parseDutchDate('29/02/2007', today)).toBeNull()
    expect(parseDutchDate('01/01/1890', today)).toBeNull()
    expect(parseDutchDate('01/01/2030', today)).toBeNull()
  })

  it('round-trips', () => {
    expect(toDutchDate('2007-03-15')).toBe('15/03/2007')
  })
})
