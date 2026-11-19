import {
  Clock,
  Flame,
  NotebookPen,
  Repeat2,
  SkipForward,
  Trash2,
  TriangleExclamationPoint,
} from 'lucide-react'
import { useState } from 'react'
import type { SkipReason } from '../../../domain/training/types'
import { t } from '../../../i18n'
import { Button } from '../../../ui/Button'
import { Chip } from '../../../ui/Chip'
import { ListRow } from '../../../ui/ListRow'
import { Sheet } from '../../../ui/Sheet'
import { TextField } from '../../../ui/TextField'

const w = t.training.workout
const REASONS: SkipReason[] = ['busy', 'time', 'pain', 'motivation', 'other']

export interface MenuActions {
  later: () => void
  substitute: () => void
  skip: (reason: SkipReason | null) => void
  addWarmups: (() => void) | null
  remove: (() => void) | null
  note: string
  setNote: (note: string) => void
  pain: string
  setPain: (where: string) => void
}

type View = 'main' | 'skip' | 'note' | 'pain'

/** The "…" menu of an exercise during a workout (SPEC §4.4 "Overslaan & flexibiliteit"). */
export function ExerciseMenuSheet({
  open,
  onOpenChange,
  title,
  actions,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  title: string
  actions: MenuActions
}) {
  const [view, setView] = useState<View>('main')
  const [note, setNote] = useState(actions.note)
  const [pain, setPain] = useState(actions.pain)
  const close = () => {
    onOpenChange(false)
    setView('main')
  }
  const run = (fn: () => void) => () => {
    fn()
    close()
  }

  return (
    <Sheet open={open} onOpenChange={(o) => (o ? onOpenChange(true) : close())} title={title}>
      {view === 'main' && (
        <div className="border-t border-line">
          <ListRow title={w.later} leading={<Clock aria-hidden />} onClick={run(actions.later)} />
          <ListRow
            title={w.substitute}
            leading={<Repeat2 aria-hidden />}
            onClick={run(actions.substitute)}
          />
          <ListRow
            title={w.skip}
            leading={<SkipForward aria-hidden />}
            onClick={() => setView('skip')}
          />
          {actions.addWarmups && (
            <ListRow
              title={w.addWarmups}
              leading={<Flame aria-hidden />}
              onClick={run(actions.addWarmups)}
            />
          )}
          <ListRow
            title={w.note}
            subtitle={actions.note || undefined}
            leading={<NotebookPen aria-hidden />}
            onClick={() => setView('note')}
          />
          <ListRow
            title={w.pain}
            subtitle={actions.pain || undefined}
            leading={<TriangleExclamationPoint aria-hidden />}
            onClick={() => setView('pain')}
          />
          {actions.remove && (
            <ListRow
              title={w.removeExercise}
              leading={<Trash2 aria-hidden />}
              onClick={run(actions.remove)}
            />
          )}
        </div>
      )}
      {view === 'skip' && (
        <div className="flex flex-col gap-4">
          <p className="font-semibold">{w.skipTitle}</p>
          <div className="flex flex-wrap gap-2">
            {REASONS.map((reason) => (
              <Chip key={reason} onClick={run(() => actions.skip(reason))}>
                {w.skipReasons[reason]}
              </Chip>
            ))}
          </div>
          <Button variant="secondary" block onClick={run(() => actions.skip(null))}>
            {w.skipWithout}
          </Button>
        </div>
      )}
      {view === 'note' && (
        <div className="flex flex-col gap-3">
          <TextField
            label={w.note}
            placeholder={w.notePlaceholder}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            autoFocus
          />
          <Button block onClick={run(() => actions.setNote(note.trim()))}>
            {t.common.save}
          </Button>
        </div>
      )}
      {view === 'pain' && (
        <div className="flex flex-col gap-3">
          <TextField
            label={w.pain}
            placeholder={w.painPlaceholder}
            value={pain}
            onChange={(e) => setPain(e.target.value)}
            autoFocus
          />
          <Button block onClick={run(() => actions.setPain(pain.trim()))}>
            {t.common.save}
          </Button>
        </div>
      )}
    </Sheet>
  )
}
