// Checks WCAG 2.x contrast for every text/background pair we use, in both themes.
// Reads the real values from src/ui/tokens.css so the check can never drift from the CSS.
// Usage: npm run check:contrast   (part of `npm run check`)
import { readFile } from 'node:fs/promises'

const css = await readFile(new URL('../src/ui/tokens.css', import.meta.url), 'utf8')

/** Extracts `--name: #hex` declarations from the first block matching `selector {`. */
function readTheme(selector) {
  const start = css.indexOf(selector)
  if (start === -1) throw new Error(`Theme block not found: ${selector}`)
  const block = css.slice(css.indexOf('{', start) + 1, css.indexOf('}', start))
  const vars = {}
  for (const [, name, hex] of block.matchAll(/--([\w-]+):\s*(#[0-9a-fA-F]{6})/g)) vars[name] = hex
  return vars
}

const dark = readTheme(":root[data-theme='dark']")
const light = { ...dark, ...readTheme(":root[data-theme='light']") }

function luminance(hex) {
  const channels = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
  const [r, g, b] = channels.map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/** WCAG contrast ratio between two hex colours (1–21). */
function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

// [foreground, background, minimum ratio, why]
// 4.5 = normal text, 3 = large/bold text (≥ 24 px or ≥ 19 px bold) and UI component boundaries.
const backgrounds = ['bg', 'surface', 'surface-2']
const pairs = [
  ...backgrounds.flatMap((bg) => [
    ['text', bg, 4.5, 'body text'],
    ['text-muted', bg, 4.5, 'secondary text'],
    ['accent-text', bg, 4.5, 'accent as text'],
    ['red-text', bg, 4.5, 'PR / warning text'],
    ['blue-text', bg, 4.5, 'info text'],
    ['green-text', bg, 4.5, 'success text'],
    ['line-strong', bg, 3, 'input / control border'],
  ]),
  ['on-accent', 'plate-yellow', 4.5, 'text on primary button'],
  ['on-plate', 'plate-red', 4.5, 'text on red badge'],
  ['on-plate', 'plate-blue', 4.5, 'text on blue fill'],
  ['on-accent', 'plate-green', 4.5, 'text on green fill'],
  ['focus', 'bg', 3, 'focus ring / active tab indicator'],
  ['focus', 'surface', 3, 'focus ring on cards'],
]

let failures = 0
for (const [themeName, theme] of [
  ['dark', dark],
  ['light', light],
]) {
  console.log(`\n${themeName}`)
  for (const [fg, bg, min, why] of pairs) {
    if (!theme[fg] || !theme[bg])
      throw new Error(`Missing token --${fg} or --${bg} in ${themeName}`)
    const ratio = contrast(theme[fg], theme[bg])
    const ok = ratio >= min
    if (!ok) failures++
    console.log(
      `${ok ? ' ok ' : 'FAIL'} ${ratio.toFixed(2).padStart(5)} ≥ ${min}  ${fg} on ${bg}  (${why})`,
    )
  }
}

if (failures) {
  console.error(`\n${failures} contrast pair(s) below WCAG AA`)
  process.exit(1)
}
console.log('\nAll contrast pairs meet WCAG AA')
