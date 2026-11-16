import { t } from '../i18n'

/** Shown when a route crashes, instead of a white screen. */
export function RouteError() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-4 px-5">
      <h1 className="font-display text-3xl font-bold uppercase">{t.error.title}</h1>
      <p className="text-muted">{t.error.body}</p>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="mt-2 min-h-12 rounded-md bg-plate-yellow px-5 font-semibold text-on-accent"
      >
        {t.error.reload}
      </button>
    </main>
  )
}
