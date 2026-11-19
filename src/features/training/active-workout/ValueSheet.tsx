import { useState } from 'react'
import { platesPerSide, type PlateInventory } from '../../../domain/strength/plates'
import { t } from '../../../i18n'
import { formatNumber } from '../../../i18n/format'
import { Chip } from '../../../ui/Chip'
import { NumberPad, type QuickValue } from '../../../ui/number-pad/NumberPad'
import { Sheet } from '../../../ui/Sheet'

const w = t.training.workout

export interface ValueEdit {
  title: string
  label: string
  value: number | null
  unit: string
  step: number
  maxDecimals: number
  quickValues: QuickValue[]
  /** Show RIR chips (when editing reps). */
  rir?: number | null
  /** Show the plate calculator (when editing a barbell weight). */
  plates?: { barKg: number; inventory: PlateInventory[] }
  onDone: (value: number | null, rir?: number | null) => void
}

function PlateLine({
  kg,
  barKg,
  inventory,
}: {
  kg: number
  barKg: number
  inventory: PlateInventory[]
}) {
  const load = platesPerSide(kg, barKg, inventory)
  return (
    <p className="text-center text-sm text-muted" aria-live="polite">
      {w.plates}:{' '}
      <span className="font-display text-lg font-bold text-text">
        {load.perSide.length
          ? load.perSide.map((p) => formatNumber(p, 2)).join(' + ')
          : w.platesNone}
      </span>
      {!load.exact && (
        <span className="block">{w.platesInexact(formatNumber(load.achievedKg, 2))}</span>
      )}
    </p>
  )
}

/** Bottom sheet with our keypad for one value of a set (weight, reps, seconds, metres). */
export function ValueSheet({ edit, onClose }: { edit: ValueEdit | null; onClose: () => void }) {
  return (
    <Sheet
      open={edit !== null}
      onOpenChange={(open) => !open && onClose()}
      title={edit?.title ?? ''}
    >
      {edit && <ValueSheetBody key={edit.title} edit={edit} onClose={onClose} />}
    </Sheet>
  )
}

function ValueSheetBody({ edit, onClose }: { edit: ValueEdit; onClose: () => void }) {
  const [value, setValue] = useState(edit.value)
  const [rir, setRir] = useState(edit.rir ?? null)
  return (
    <div className="flex flex-col gap-3">
      <NumberPad
        label={edit.label}
        value={edit.value}
        onChange={setValue}
        onDone={() => {
          edit.onDone(value, edit.rir !== undefined ? rir : undefined)
          onClose()
        }}
        unit={edit.unit}
        step={edit.step}
        maxDecimals={edit.maxDecimals}
        quickValues={edit.quickValues}
      />
      {edit.plates && value !== null && value > 0 && (
        <PlateLine kg={value} {...edit.plates} barKg={edit.plates.barKg} />
      )}
      {edit.rir !== undefined && (
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-muted">
            {w.rir} · <span className="font-normal">{w.rirHint}</span>
          </span>
          <div className="flex gap-1.5">
            {[0, 1, 2, 3, 4, 5].map((n) => (
              <Chip
                key={n}
                selected={rir === n}
                onClick={() => setRir(rir === n ? null : n)}
                className="flex-1 justify-center"
              >
                {n}
              </Chip>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
