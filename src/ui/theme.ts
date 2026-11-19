export type Theme = 'dark' | 'light'

const STORAGE_KEY = 'ijzer.theme'
const THEME_COLOR: Record<Theme, string> = { dark: '#111110', light: '#f4f1e8' }

/** The theme saved on this device; dark is the default (SPEC §4.11). */
export function getStoredTheme(): Theme {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'light' ? 'light' : 'dark'
  } catch {
    return 'dark'
  }
}

/** Applies a theme to the document and the iOS status bar, and remembers it. */
export function applyTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLOR[theme])
  try {
    localStorage.setItem(STORAGE_KEY, theme)
  } catch {
    // Private mode or blocked storage: the theme still applies for this visit.
  }
}
