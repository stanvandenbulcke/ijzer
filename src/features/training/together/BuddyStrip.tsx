import { Radio } from 'lucide-react'
import { useBuddies } from '../../../data/live/buddies'
import { useBuddyLive } from '../../../data/live/liveStore'
import { latestSet } from '../../../domain/training/liveSnapshot'
import { t } from '../../../i18n'
import { setText } from './liveText'

/** On the workout screen: one line per buddy who is training right now, with their last set. */
export function BuddyStrip() {
  const { buddies } = useBuddies()
  const live = useBuddyLive()
  const training = (buddies ?? []).filter((b) => live[b.id]?.snapshot)
  if (training.length === 0) return null
  return (
    <div className="flex flex-col gap-1" aria-live="polite">
      {training.map((b) => {
        const last = latestSet(live[b.id]!.snapshot!)
        const name = b.name || t.together.unnamed
        return (
          <p key={b.id} className="flex items-center gap-2 truncate text-sm">
            <Radio aria-hidden size={14} className="shrink-0 text-green-text" />
            <span className="truncate">
              {t.together.live.strip(
                name,
                last ? `${last.exercise} ${setText(last.set)}` : t.together.live.noSets,
              )}
            </span>
          </p>
        )
      })}
    </div>
  )
}
