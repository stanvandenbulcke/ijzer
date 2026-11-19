import { Footprints } from 'lucide-react'
import { t } from '../../../i18n'
import { EmptyState } from '../../../ui/EmptyState'

export function StepsTab() {
  return (
    <div className="mt-6 rounded-md border border-line">
      <EmptyState
        title={t.progress.steps.title}
        body={t.progress.steps.body}
        illustration={
          <Footprints aria-hidden size={72} strokeWidth={1.25} className="mx-auto text-muted" />
        }
      />
    </div>
  )
}
