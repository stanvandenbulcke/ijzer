import { describe, expect, it } from 'vitest'
import {
  initialInput,
  parseInput,
  reduceInput,
  toInputText,
  type NumberInputAction,
  type NumberInputState,
} from './numberInput'

const weight = { maxDecimals: 2, maxIntegerDigits: 4 }
const reps = { maxDecimals: 0, maxIntegerDigits: 3 }

function press(state: NumberInputState, keys: NumberInputAction[], options = weight) {
  return keys.reduce((s, a) => reduceInput(s, a, options), state)
}
const d = (digit: string): NumberInputAction => ({ type: 'digit', digit })

describe('parseInput / toInputText', () => {
  it('converts between display text and numbers', () => {
    expect(parseInput('82,5')).toBe(82.5)
    expect(parseInput('82,')).toBe(82)
    expect(parseInput('')).toBeNull()
    expect(parseInput(',')).toBeNull()
    expect(toInputText(82.5, 2)).toBe('82,5')
    expect(toInputText(80, 2)).toBe('80')
    expect(toInputText(0.1 + 0.2, 2)).toBe('0,3')
  })
})

describe('reduceInput', () => {
  it('replaces the value on the first digit after opening', () => {
    const s = press(initialInput(80, 2), [d('8'), d('5')])
    expect(s.text).toBe('85')
  })

  it('appends decimals with a comma and respects the decimal limit', () => {
    const s = press(initialInput(null, 2), [
      d('8'),
      d('2'),
      { type: 'comma' },
      d('5'),
      d('5'),
      d('5'),
    ])
    expect(s.text).toBe('82,55')
  })

  it('starts with 0, when the comma comes first and ignores a second comma', () => {
    const s = press(initialInput(null, 2), [{ type: 'comma' }, d('5'), { type: 'comma' }])
    expect(s.text).toBe('0,5')
  })

  it('has no comma for whole-number fields like reps', () => {
    const s = press(initialInput(null, 0), [d('1'), { type: 'comma' }, d('2')], reps)
    expect(s.text).toBe('12')
  })

  it('limits the number of integer digits and strips leading zeros', () => {
    expect(press(initialInput(null, 0), [d('0'), d('7')], reps).text).toBe('7')
    expect(press(initialInput(null, 0), [d('1'), d('2'), d('3'), d('4')], reps).text).toBe('123')
  })

  it('backspace clears a fresh value and otherwise removes one character', () => {
    expect(press(initialInput(80, 2), [{ type: 'backspace' }]).text).toBe('')
    expect(press(initialInput(null, 2), [d('8'), d('2'), { type: 'backspace' }]).text).toBe('8')
  })

  it('steps up and down without floating point noise and never below zero', () => {
    const up = press(initialInput(80, 2), [{ type: 'step', delta: 2.5 }])
    expect(up).toEqual({ text: '82,5', fresh: true })
    const steps = Array.from({ length: 3 }, () => ({ type: 'step', delta: 0.1 }) as const)
    expect(press(initialInput(0, 2), steps).text).toBe('0,3')
    expect(press(initialInput(1, 2), [{ type: 'step', delta: -2.5 }]).text).toBe('0')
  })

  it('treats an empty value as 0 when stepping', () => {
    expect(press(initialInput(null, 2), [{ type: 'step', delta: 2.5 }]).text).toBe('2,5')
  })

  it('can be set directly, e.g. "same as last time"', () => {
    expect(press(initialInput(null, 2), [d('5'), { type: 'set', value: 77.5 }])).toEqual({
      text: '77,5',
      fresh: true,
    })
  })

  it('ignores anything that is not a single digit', () => {
    const s = initialInput(null, 2)
    expect(reduceInput(s, d('a'), weight)).toBe(s)
    expect(reduceInput(s, d('12'), weight)).toBe(s)
  })
})
