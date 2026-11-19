import { useState } from 'react'
import { t } from '../../i18n'
import { Chip, MuscleChip } from '../../ui/Chip'
import { Stepper } from '../../ui/Stepper'
import { TextField } from '../../ui/TextField'
import { Caption, Section } from './Section'

const f = t.design.fields

export function InputsSection({ index }: { index: number }) {
  const [portion, setPortion] = useState(150)
  const [chip, setChip] = useState(0)

  return (
    <Section index={index} title={t.design.sections.inputs}>
      <TextField label={f.name} placeholder={f.namePlaceholder} hint={f.nameHint} />
      <TextField label={f.weight} defaultValue="78,4" suffix={t.common.kg} inputMode="decimal" />
      <TextField label={f.email} defaultValue="stan@" error={f.emailError} type="email" />
      <div>
        <Caption>Stepper · portie in gram</Caption>
        <Stepper label={f.portion} value={portion} onChange={setPortion} steps={[1, 10]} unit="g" />
      </div>
      <div>
        <Caption>Filterchips</Caption>
        <div className="flex flex-wrap gap-2">
          {t.design.chips.map((label, i) => (
            <Chip key={label} selected={chip === i} onClick={() => setChip(i)}>
              {label}
            </Chip>
          ))}
        </div>
      </div>
      <div>
        <Caption>Spierchips · primair en secundair</Caption>
        <div className="flex flex-wrap gap-2">
          <MuscleChip muscle="chest" />
          <MuscleChip muscle="front_delts" secondary />
          <MuscleChip muscle="triceps" secondary />
          <MuscleChip muscle="lats" />
          <MuscleChip muscle="quads" />
          <MuscleChip muscle="abs" />
        </div>
      </div>
    </Section>
  )
}
