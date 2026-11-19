import type { GymEquipment, Profile } from '../../../domain/profile/types'
import { t } from '../../../i18n'
import { formatNumber } from '../../../i18n/format'
import { Chip } from '../../../ui/Chip'
import { ChoiceRow, Field } from '../Field'

const o = t.onboarding.gym
const PLATE_SIZES = [25, 20, 15, 10, 5, 2.5, 1.25, 0.5]

function Options({
  values,
  current,
  onPick,
}: {
  values: number[]
  current: number
  onPick: (v: number) => void
}) {
  return (
    <ChoiceRow>
      {values.map((v) => (
        <Chip key={v} selected={current === v} onClick={() => onPick(v)}>
          {formatNumber(v, 2)} {t.common.kg}
        </Chip>
      ))}
    </ChoiceRow>
  )
}

export function GymStep({
  draft,
  update,
}: {
  draft: Profile
  update: (p: Partial<Profile>) => void
}) {
  const gym = draft.equipment
  const set = (changes: Partial<GymEquipment>) => update({ equipment: { ...gym, ...changes } })
  const has = (kg: number) => gym.plates.some((p) => p.kg === kg && p.perSide > 0)
  const togglePlate = (kg: number) =>
    set({
      plates: has(kg)
        ? gym.plates.filter((p) => p.kg !== kg)
        : [...gym.plates, { kg, perSide: 4 }].sort((a, b) => b.kg - a.kg),
    })

  return (
    <div className="flex flex-col gap-6">
      <Field label={o.bar}>
        <Options values={[20, 15, 10]} current={gym.barKg} onPick={(barKg) => set({ barKg })} />
      </Field>
      <Field label={o.plates}>
        <ChoiceRow>
          {PLATE_SIZES.map((kg) => (
            <Chip key={kg} selected={has(kg)} onClick={() => togglePlate(kg)}>
              {formatNumber(kg, 2)}
            </Chip>
          ))}
        </ChoiceRow>
      </Field>
      <Field label={o.dumbbellStep}>
        <Options
          values={[1, 2, 2.5]}
          current={gym.dumbbellStepKg}
          onPick={(v) => set({ dumbbellStepKg: v })}
        />
      </Field>
      <Field label={o.machineStep}>
        <Options
          values={[2.5, 5, 7]}
          current={gym.machineStepKg}
          onPick={(v) => set({ machineStepKg: v })}
        />
      </Field>
      <Field label={o.cableStep}>
        <Options
          values={[1.25, 2.5, 5]}
          current={gym.cableStepKg}
          onPick={(v) => set({ cableStepKg: v })}
        />
      </Field>
    </div>
  )
}
