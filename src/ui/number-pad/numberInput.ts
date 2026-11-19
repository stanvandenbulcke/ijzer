/**
 * Pure state logic for the custom number keypad (SPEC §4.4 "Snelle invoer").
 * The value is kept as the string the user sees, with a decimal comma ("82,5"),
 * so typing "82," keeps the comma on screen.
 */
export interface NumberInputState {
  /** Text shown on the display, e.g. "82,5". Empty string means "no value". */
  text: string
  /**
   * True right after the keypad opens or after a −/+ step: the next digit replaces
   * the value instead of appending (like selecting the field on open).
   */
  fresh: boolean
}

export interface NumberInputOptions {
  /** Maximum digits after the comma; 0 disables the comma key. */
  maxDecimals: number
  /** Maximum digits before the comma. */
  maxIntegerDigits: number
}

export type NumberInputAction =
  | { type: 'digit'; digit: string }
  | { type: 'comma' }
  | { type: 'backspace' }
  | { type: 'step'; delta: number }
  | { type: 'set'; value: number | null }

/** Parses the display text ("82,5") to a number; null when empty or incomplete. */
export function parseInput(text: string): number | null {
  if (text === '' || text === ',') return null
  const value = Number(text.replace(',', '.'))
  return Number.isFinite(value) ? value : null
}

/** Formats a number for the display, rounded to `maxDecimals`, without trailing zeros. */
export function toInputText(value: number, maxDecimals: number): string {
  const factor = 10 ** maxDecimals
  const rounded = Math.round(value * factor) / factor
  return String(rounded).replace('.', ',')
}

export function initialInput(value: number | null, maxDecimals: number): NumberInputState {
  return { text: value === null ? '' : toInputText(value, maxDecimals), fresh: true }
}

export function reduceInput(
  state: NumberInputState,
  action: NumberInputAction,
  options: NumberInputOptions,
): NumberInputState {
  switch (action.type) {
    case 'digit': {
      if (!/^\d$/.test(action.digit)) return state
      const base = state.fresh ? '' : state.text
      const [integer = '', decimals] = base.split(',')
      if (decimals !== undefined) {
        if (decimals.length >= options.maxDecimals) return { ...state, fresh: false }
        return { text: base + action.digit, fresh: false }
      }
      // No leading zeros: "0" followed by "5" becomes "5".
      if (integer === '0') return { text: action.digit, fresh: false }
      if (integer.length >= options.maxIntegerDigits) return { ...state, fresh: false }
      return { text: base + action.digit, fresh: false }
    }
    case 'comma': {
      if (options.maxDecimals === 0) return state
      const base = state.fresh ? '' : state.text
      if (base.includes(',')) return { ...state, fresh: false }
      return { text: (base === '' ? '0' : base) + ',', fresh: false }
    }
    case 'backspace':
      return { text: state.fresh ? '' : state.text.slice(0, -1), fresh: false }
    case 'step': {
      const current = parseInput(state.text) ?? 0
      const next = Math.max(0, current + action.delta)
      return { text: toInputText(next, options.maxDecimals), fresh: true }
    }
    case 'set':
      return initialInput(action.value, options.maxDecimals)
  }
}
