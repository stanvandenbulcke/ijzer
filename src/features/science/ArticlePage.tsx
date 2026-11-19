import { useParams } from 'react-router'
import { NotFoundPage } from '../../app/NotFoundPage'
import { t } from '../../i18n'
import { Badge } from '../../ui/Badge'
import { Page, PageHeader } from '../../ui/PageHeader'

const s = t.science

/** /wetenschap/:id — one article: in short, the evidence, what the app does, sources. */
export function ArticlePage() {
  const { id } = useParams()
  const article = s.articles.find((a) => a.id === id)
  if (!article) return <NotFoundPage />
  return (
    <Page>
      <PageHeader title={article.title} back="/wetenschap" />
      <article className="selectable flex flex-col gap-4">
        <div className="flex gap-2">
          <Badge tone={article.level === 'evidentie' ? 'info' : 'estimate'}>
            {s.levels[article.level]}
          </Badge>
          <span className="text-sm text-muted">{s.updated}</span>
        </div>
        <section className="rounded-md border-l-4 border-focus bg-surface p-3">
          <h2 className="text-xs font-semibold tracking-widest text-muted uppercase">{s.short}</h2>
          <p className="mt-1 text-lg font-semibold">{article.short}</p>
        </section>
        {article.body.map((p, i) => (
          <p key={i} className="leading-relaxed">
            {p}
          </p>
        ))}
        <section>
          <h2 className="mb-1 font-display text-2xl font-bold uppercase">{s.app}</h2>
          <p className="leading-relaxed">{article.app}</p>
        </section>
        <section>
          <h2 className="mb-1 font-display text-xl font-bold uppercase">{s.sources}</h2>
          <ul className="list-disc pl-5 text-sm text-muted">
            {article.sources.map((src) => (
              <li key={src}>{src}</li>
            ))}
          </ul>
        </section>
      </article>
    </Page>
  )
}
