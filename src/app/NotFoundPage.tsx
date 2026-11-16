import { Link } from 'react-router'
import { t } from '../i18n'

export function NotFoundPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-4 px-5">
      <p className="font-display text-7xl leading-none font-black text-accent-text">404</p>
      <h1 className="font-display text-3xl font-bold uppercase">{t.notFound.title}</h1>
      <p className="text-muted">{t.notFound.body}</p>
      <Link
        to="/"
        className="mt-2 flex min-h-12 items-center justify-center rounded-md bg-plate-yellow px-5 font-semibold text-on-accent"
      >
        {t.common.backToStart}
      </Link>
    </main>
  )
}
