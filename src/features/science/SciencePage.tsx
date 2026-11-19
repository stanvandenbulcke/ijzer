import { useNavigate } from 'react-router'
import { t } from '../../i18n'
import { Badge } from '../../ui/Badge'
import { ListRow } from '../../ui/ListRow'
import { Page, PageHeader } from '../../ui/PageHeader'

const s = t.science

/** /wetenschap — list of short articles (SPEC Bijlage A). */
export function SciencePage() {
  const navigate = useNavigate()
  return (
    <Page>
      <PageHeader title={s.title} back="/ik" />
      <p className="mb-4 text-muted">{s.intro}</p>
      <div className="border-t border-line">
        {s.articles.map((a) => (
          <ListRow
            key={a.id}
            title={a.title}
            subtitle={a.short}
            trailing={
              <Badge tone={a.level === 'evidentie' ? 'info' : 'estimate'}>
                {s.levels[a.level]}
              </Badge>
            }
            onClick={() => navigate(`/wetenschap/${a.id}`)}
          />
        ))}
      </div>
    </Page>
  )
}
