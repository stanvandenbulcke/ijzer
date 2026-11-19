import { ArrowRight } from 'lucide-react'
import { Link, useNavigate } from 'react-router'
import { APP_NAME, APP_VERSION } from '../../app/config'
import { accountsEnabled } from '../../data/supabase/config'
import { t } from '../../i18n'
import { Button } from '../../ui/Button'
import { isStandalone } from '../../ui/standalone'
import { BarbellHero } from './BarbellHero'
import { DemoScreens } from './DemoScreens'

/**
 * Public landing page (SPEC §4.1): a brand, not a SaaS template. Left-aligned type, a bar
 * being loaded, and real app components with demo data instead of screenshots.
 */
export function LandingPage() {
  const navigate = useNavigate()
  const standalone = isStandalone()

  return (
    <main className="relative mx-auto flex min-h-dvh max-w-md flex-col overflow-x-hidden px-4 pt-[max(2rem,env(safe-area-inset-top))] pb-[max(2rem,env(safe-area-inset-bottom))]">
      <div className="knurling pointer-events-none absolute inset-x-0 top-0 h-80" aria-hidden />

      <header className="relative">
        <h1 className="font-display text-[6rem] leading-[0.8] font-black tracking-tight uppercase">
          {APP_NAME}
        </h1>
        <p className="mt-3 font-display text-4xl leading-none font-bold text-accent-text uppercase">
          {t.landing.tagline}
        </p>
        <div className="-mr-4 mt-6">
          <BarbellHero />
        </div>
        <p className="mt-6 text-lg leading-snug">{t.landing.promise}</p>
      </header>

      <section className="relative mt-8 flex flex-col gap-3">
        {accountsEnabled ? (
          <>
            <Button size="lg" block icon={ArrowRight} onClick={() => navigate('/registreren')}>
              {t.auth.register.title}
            </Button>
            <Button variant="secondary" block onClick={() => navigate('/login')}>
              {t.auth.login.title}
            </Button>
            <Link
              to="/welkom"
              className="mt-1 min-h-11 py-3 text-center font-semibold text-accent-text"
            >
              {t.auth.localTry}
            </Link>
            <p className="text-center text-sm text-muted">{t.auth.localTryNote}</p>
          </>
        ) : (
          <>
            <Button size="lg" block icon={ArrowRight} onClick={() => navigate('/welkom')}>
              {t.landing.start}
            </Button>
            <p className="text-sm text-muted">{t.landing.localNote}</p>
          </>
        )}
      </section>

      <section className="relative mt-12">
        <h2 className="mb-4 font-display text-3xl font-bold uppercase">{t.landing.demoTitle}</h2>
        <DemoScreens />
      </section>

      <section className="relative mt-12 border-t border-line pt-5">
        <h2 className="font-display text-3xl font-bold uppercase">{t.landing.installTitle}</h2>
        {standalone ? (
          <p className="mt-2 text-green-text">{t.landing.installedNote}</p>
        ) : (
          <ol className="mt-4 space-y-3">
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

      <footer className="relative mt-auto pt-12 text-sm text-muted">
        {t.landing.version} {APP_VERSION}
      </footer>
    </main>
  )
}
