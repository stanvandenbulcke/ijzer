import { useState } from 'react'
import { saveProfile, useProfile } from '../../../data/profileRepo'
import { useTargets } from '../../../data/useTargets'
import { macroKcal } from '../../../domain/nutrition/targets'
import type { CustomTargets } from '../../../domain/profile/types'
import { t } from '../../../i18n'
import { formatNumber, parseDecimal } from '../../../i18n/format'
import { Button } from '../../../ui/Button'
import { Chip } from '../../../ui/Chip'
import { Sheet } from '../../../ui/Sheet'
import { TextField } from '../../../ui/TextField'

const g = t.nutrition.goals
type Key = keyof CustomTargets
const KEYS: Key[] = ['kcal', 'protein', 'carbs', 'fat']

/**
 * Choose between calculated targets and your own kcal and macros. Empty fields stay
 * calculated; empty carbs fill the rest of your kcal. Below your estimated BMR the app warns,
 * but you decide.
 */
export function TargetsSheet({
  open,
  onOpenChange,
  today,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  today: string
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange} title={g.title}>
      {open && <TargetsForm today={today} onDone={() => onOpenChange(false)} />}
    </Sheet>
  )
}

function TargetsForm({ today, onDone }: { today: string; onDone: () => void }) {
  const profile = useProfile()
  const auto = useTargets(today, { calculatedOnly: true })
  const stored = profile?.customTargets ?? null
  const [own, setOwn] = useState(stored !== null)
  const [values, setValues] = useState<Record<Key, string>>(() => ({
    kcal: stored?.kcal != null ? String(stored.kcal) : '',
    protein: stored?.protein != null ? String(stored.protein) : '',
    carbs: stored?.carbs != null ? String(stored.carbs) : '',
    fat: stored?.fat != null ? String(stored.fat) : '',
  }))
  if (!profile || auto === undefined) return null

  const num = (k: Key) => {
    const v = parseDecimal(values[k])
    return v === null ? null : Math.round(v)
  }
  const kcal = num('kcal') ?? auto?.kcal ?? null
  const protein = num('protein') ?? auto?.protein ?? 0
  const fat = num('fat') ?? auto?.fat ?? 0
  const carbs =
    num('carbs') ??
    (kcal === null ? 0 : Math.max(0, Math.round((kcal - protein * 4 - fat * 9) / 4)))
  const sum = macroKcal(protein, carbs, fat)
  const mismatch = kcal !== null && Math.abs(sum - kcal) > kcal * 0.1
  const belowBmr = kcal !== null && auto !== null && kcal < auto.bmr
  const canSave = !own || kcal !== null

  const save = async () => {
    await saveProfile({
      customTargets: own
        ? { kcal: num('kcal'), protein: num('protein'), carbs: num('carbs'), fat: num('fat') }
        : null,
    })
    onDone()
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2" role="group" aria-label={g.title}>
        <Chip selected={!own} onClick={() => setOwn(false)}>
          {g.auto}
        </Chip>
        <Chip selected={own} onClick={() => setOwn(true)}>
          {g.own}
        </Chip>
      </div>
      {!own ? (
        <p className="text-sm text-muted">
          {auto
            ? g.autoNote(
                formatNumber(auto.kcal, 0),
                formatNumber(auto.protein, 0),
                formatNumber(auto.carbs, 0),
                formatNumber(auto.fat, 0),
              )
            : t.nutrition.targetsMissing}
        </p>
      ) : (
        <>
          <p className="text-sm text-muted">{g.ownNote}</p>
          <div className="grid grid-cols-2 gap-3">
            {KEYS.map((k) => (
              <TextField
                key={k}
                label={g.fields[k]}
                inputMode="numeric"
                value={values[k]}
                placeholder={
                  k === 'carbs'
                    ? g.rest
                    : auto
                      ? formatNumber(auto[k], 0)
                      : k === 'kcal'
                        ? g.required
                        : '0'
                }
                onChange={(e) => setValues((v) => ({ ...v, [k]: e.target.value }))}
              />
            ))}
          </div>
          <p className="text-sm" aria-live="polite">
            {g.sum(
              formatNumber(sum, 0),
              formatNumber(protein, 0),
              formatNumber(carbs, 0),
              formatNumber(fat, 0),
            )}
          </p>
          {mismatch && kcal !== null && (
            <p role="status" className="rounded-md border border-accent-edge p-3 text-sm">
              {g.mismatch(formatNumber(sum, 0), formatNumber(kcal, 0))}
            </p>
          )}
          {belowBmr && auto && (
            <p role="status" className="rounded-md border border-plate-red p-3 text-sm">
              {g.belowBmr(formatNumber(auto.bmr, 0))}
            </p>
          )}
        </>
      )}
      <Button size="lg" block disabled={!canSave} onClick={() => void save()}>
        {g.save}
      </Button>
    </div>
  )
}
