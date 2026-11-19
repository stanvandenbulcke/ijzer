import { useState } from 'react'
import { t } from '../../i18n'
import { Chip } from '../../ui/Chip'
import { applyTheme, getStoredTheme, type Theme } from '../../ui/theme'
import { APP_NAME, APP_VERSION } from '../config'
import { ButtonsSection } from './ButtonsSection'
import { ColorsSection } from './ColorsSection'
import { DataSection } from './DataSection'
import { FeedbackSection } from './FeedbackSection'
import { InputsSection } from './InputsSection'
import { KeypadSection } from './KeypadSection'
import { NavigationSection } from './NavigationSection'
import { TypeSection } from './TypeSection'

/**
 * /design — every token and component on one page, so Stan can approve the style
 * before the rest is built (SPEC §6.2). Dev tool: technical captions (font and token
 * names) are inline on purpose. Online only until the style is approved.
 */
export function DesignPage() {
  const [theme, setTheme] = useState<Theme>(getStoredTheme)
  const choose = (next: Theme) => {
    setTheme(next)
    applyTheme(next)
  }

  const sections = [
    ColorsSection,
    TypeSection,
    ButtonsSection,
    InputsSection,
    KeypadSection,
    NavigationSection,
    DataSection,
    FeedbackSection,
  ]

  return (
    <main className="mx-auto max-w-md px-4 pt-[max(1.5rem,env(safe-area-inset-top))] pb-[max(4rem,env(safe-area-inset-bottom))]">
      <header>
        <p className="text-xs font-semibold tracking-widest text-muted uppercase">
          {APP_NAME} · {APP_VERSION}
        </p>
        <h1 className="mt-1 font-display text-7xl leading-none font-black uppercase">
          {t.design.title}
        </h1>
        <p className="mt-3 text-muted">{t.design.intro}</p>
        <div role="group" aria-label={t.design.theme} className="mt-5 flex gap-2">
          <Chip selected={theme === 'dark'} onClick={() => choose('dark')}>
            {t.design.themeDark}
          </Chip>
          <Chip selected={theme === 'light'} onClick={() => choose('light')}>
            {t.design.themeLight}
          </Chip>
        </div>
      </header>
      {sections.map((Component, i) => (
        <Component key={i} index={i + 1} />
      ))}
    </main>
  )
}
