import { TriangleAlert } from 'lucide-react'
import { t } from '../../../i18n'
import { Button } from '../../../ui/Button'

/** Shown when the workout could not be written to this device: honest, with a retry. */
export function SaveFailedBanner({ onRetry }: { onRetry: () => void }) {
  return (
    <div
      role="alert"
      className="mx-auto mt-3 flex max-w-md items-center gap-3 border-y border-plate-red bg-surface px-4 py-3"
    >
      <TriangleAlert aria-hidden className="shrink-0 text-red-text" />
      <p className="flex-1 text-sm">{t.training.workout.saveFailed}</p>
      <Button variant="secondary" onClick={onRetry}>
        {t.training.workout.saveRetry}
      </Button>
    </div>
  )
}
