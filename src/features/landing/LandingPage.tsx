import { APP_NAME, APP_VERSION } from '../../app/config'
import { t } from '../../i18n'

/** True when the app runs from the iOS/Android home screen instead of a browser tab. */
function isStandalone(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches
}

/**
 * Phase 0 placeholder for the landing page. It proves the stack end to end
 * (fonts, tokens, i18n, PWA) and is replaced by the real landing page in phase 1.
 */
export function LandingPage() {
  const standalone = isStandalone()

  return (
    <main className="relative mx-auto flex min-h-dvh max-w-md flex-col px-5 pt-[max(2.5rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))]">
      <div className="knurling pointer-events-none absolute inset-x-0 top-0 h-64" aria-hidden />

      <header className="relative">
        <h1 className="font-display text-[5.5rem] leading-[0.85] font-black tracking-tight uppercase">
          {APP_NAME}
        </h1>
        <p className="mt-3 font-display text-4xl leading-none font-bold text-accent-text uppercase">
          {t.landing.tagline}
        </p>
        <p className="mt-5 text-lg leading-snug text-muted">{t.landing.promise}</p>
      </header>

      <section className="relative mt-10 border-t border-line pt-5">
        <h2 className="text-sm font-semibold tracking-widest text-muted uppercase">
          {t.landing.statusTitle}
        </h2>
        <p className="mt-2 leading-relaxed">{t.landing.statusBody}</p>
      </section>

      <section className="relative mt-8 border-t border-line pt-5">
        <h2 className="text-sm font-semibold tracking-widest text-muted uppercase">
          {t.landing.installTitle}
        </h2>
        {standalone ? (
          <p className="mt-2 leading-relaxed text-plate-green">{t.landing.installedNote}</p>
        ) : (
          <ol className="mt-3 space-y-3">
            {t.landing.installSteps.map((step, i) => (
              <li key={step} className="flex items-baseline gap-4">
                <span className="w-6 font-display text-3xl leading-none font-black text-accent-text">
                  {i + 1}
                </span>
                <span className="leading-snug">{step}</span>
              </li>
            ))}
          </ol>
        )}
      </section>

      <footer className="relative mt-auto pt-10 text-sm text-muted">
        {t.landing.version} {APP_VERSION}
      </footer>
    </main>
  )
}
