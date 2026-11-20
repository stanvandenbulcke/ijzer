/** What the user picked. 'auto' follows the iPhone's light/dark setting. */
export type Theme = 'dark' | 'light' | 'auto'
type Resolved = 'dark' | 'light'

const STORAGE_KEY = 'ijzer.theme'
const THEME_COLOR: Record<Resolved, string> = { dark: '#111110', light: '#f4f1e8' }
const media = () => window.matchMedia?.('(prefers-color-scheme: light)')

/** The theme saved on this device; dark is the default (SPEC §4.11). */
export function getStoredTheme(): Theme {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored === 'light' || stored === 'auto' ? stored : 'dark'
  } catch {
    return 'dark'
  }
}

function resolve(theme: Theme): Resolved {
  if (theme !== 'auto') return theme
  return media()?.matches ? 'light' : 'dark'
}

function paint(theme: Theme): void {
  const resolved = resolve(theme)
  document.documentElement.dataset.theme = resolved
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLOR[resolved])
}

let following = false

/** Applies a theme to the document and the iOS status bar, and remembers it. */
export function applyTheme(theme: Theme): void {
  paint(theme)
  if (!following) {
    following = true
    // In 'auto', switch along when the iPhone changes between light and dark.
    media()?.addEventListener?.('change', () => getStoredTheme() === 'auto' && paint('auto'))
  }
  try {
    localStorage.setItem(STORAGE_KEY, theme)
  } catch {
    // Private mode or blocked storage: the theme still applies for this visit.
  }
}
