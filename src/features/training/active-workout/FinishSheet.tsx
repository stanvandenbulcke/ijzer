import { CheckCheck } from 'lucide-react'
import { useState } from 'react'
import { t } from '../../../i18n'
import { Button } from '../../../ui/Button'
import { Sheet } from '../../../ui/Sheet'

const w = t.training.workout

/**
 * Confirms ending the workout. Names what is still open (saved as skipped, never as zeros),
 * offers to tick sets that were typed in but not ticked, and asks twice before throwing away.
 */
export function FinishSheet({
  open,
  onOpenChange,
  openNames,
  filledCount,
  onTickFilled,
  onFinish,
  onDiscard,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  openNames: string[]
  filledCount: number
  onTickFilled: () => void
  onFinish: () => void
  onDiscard: () => void
}) {
  const [discarding, setDiscarding] = useState(false)
  const change = (o: boolean) => {
    if (!o) setDiscarding(false)
    onOpenChange(o)
  }
  return (
    <Sheet open={open} onOpenChange={change} title={w.finishTitle}>
      <div className="flex flex-col gap-3">
        {filledCount > 0 && (
          <div className="flex flex-col gap-2 rounded-md border border-accent-edge p-3">
            <p className="font-semibold">{w.filledNotTicked(filledCount)}</p>
            <Button variant="secondary" icon={CheckCheck} block onClick={onTickFilled}>
              {w.tickAll}
            </Button>
          </div>
        )}
        {openNames.length > 0 && (
          <div>
            <p className="text-muted">{w.finishOpen(openNames.length)}</p>
            <ul className="mt-1 list-disc pl-5 text-muted">
              {openNames.map((name) => (
                <li key={name}>{name}</li>
              ))}
            </ul>
          </div>
        )}
        <Button size="lg" block onClick={onFinish}>
          {w.finishConfirm}
        </Button>
        <Button variant="secondary" block onClick={() => change(false)}>
          {w.keepGoing}
        </Button>
        {discarding ? (
          <div className="flex flex-col gap-2 rounded-md border border-plate-red p-3">
            <p>{w.discardSure}</p>
            <Button variant="danger" block onClick={onDiscard}>
              {w.discardConfirm}
            </Button>
          </div>
        ) : (
          <Button variant="ghost" block onClick={() => setDiscarding(true)}>
            {w.discard}
          </Button>
        )}
      </div>
    </Sheet>
  )
}
