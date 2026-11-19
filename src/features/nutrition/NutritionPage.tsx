import { CircleDashed } from 'lucide-react'
import { t } from '../../i18n'
import { EmptyState } from '../../ui/EmptyState'
import { Page, PageHeader } from '../../ui/PageHeader'

const n = t.nutrition

/** /voeding — placeholder until phase 5, honest about what is coming. */
export function NutritionPage() {
  return (
    <Page>
      <PageHeader title={n.title} />
      <div className="rounded-md border border-line">
        <EmptyState title={n.soonTitle} body={n.soonBody} />
      </div>
      <ul className="mt-6 flex flex-col gap-2">
        {n.planned.map((item) => (
          <li key={item} className="flex items-start gap-2 text-muted">
            <CircleDashed aria-hidden size={18} className="mt-0.5 shrink-0" />
            {item}
          </li>
        ))}
      </ul>
    </Page>
  )
}
