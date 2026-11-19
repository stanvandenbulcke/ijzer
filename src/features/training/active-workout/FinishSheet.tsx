import { t } from '../../../i18n'
import { Button } from '../../../ui/Button'
import { Sheet } from '../../../ui/Sheet'

const w = t.training.workout

/** Confirms ending the workout; unfinished exercises are saved as skipped, never as zeros. */
export function FinishSheet({
  open,
  onOpenChange,
  openCount,
  onFinish,
  onDiscard,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  openCount: number
  onFinish: () => void
  onDiscard: () => void
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange} title={w.finishTitle}>
      <div className="flex flex-col gap-3">
        {openCount > 0 && <p className="text-muted">{w.finishOpen(openCount)}</p>}
        <Button size="lg" block onClick={onFinish}>
          {w.finishConfirm}
        </Button>
        <Button variant="secondary" block onClick={() => onOpenChange(false)}>
          {w.keepGoing}
        </Button>
        <Button variant="danger" block onClick={onDiscard}>
          {w.discardConfirm}
        </Button>
      </div>
    </Sheet>
  )
}
