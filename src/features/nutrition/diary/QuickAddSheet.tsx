import { useState } from 'react'
import type { Nutrients } from '../../../domain/nutrition/types'
import { t } from '../../../i18n'
import { parseDecimal } from '../../../i18n/format'
import { Button } from '../../../ui/Button'
import { Sheet } from '../../../ui/Sheet'
import { TextField } from '../../../ui/TextField'

const q = t.nutrition.quick

/** Only kcal and macros, for a restaurant meal or an estimate (SPEC §4.5 "Snel toevoegen"). */
export function QuickAddSheet({
  open,
  onOpenChange,
  onSave,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  onSave: (name: string, nutrients: Nutrients) => void
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange} title={q.title}>
      {open && <QuickForm onSave={onSave} />}
    </Sheet>
  )
}

function QuickForm({ onSave }: { onSave: (name: string, nutrients: Nutrients) => void }) {
  const [name, setName] = useState('')
  const [v, setV] = useState({ kcal: '', protein: '', carbs: '', fat: '' })
  const kcal = parseDecimal(v.kcal)
  const field = (k: keyof typeof v, label: string) => (
    <TextField
      label={label}
      inputMode="decimal"
      value={v[k]}
      onChange={(e) => setV((x) => ({ ...x, [k]: e.target.value }))}
    />
  )
  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={(e) => {
        e.preventDefault()
        if (kcal === null) return
        onSave(name.trim() || q.defaultName, {
          kcal: Math.round(kcal),
          protein: parseDecimal(v.protein) ?? 0,
          carbs: parseDecimal(v.carbs) ?? 0,
          fat: parseDecimal(v.fat) ?? 0,
          fiber: null,
        })
      }}
    >
      <TextField
        label={q.name}
        placeholder={q.namePlaceholder}
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      {field('kcal', q.kcal)}
      <div className="grid grid-cols-3 gap-2">
        {field('protein', q.protein)}
        {field('carbs', q.carbs)}
        {field('fat', q.fat)}
      </div>
      <p className="text-sm text-muted">{q.estimate}</p>
      <Button type="submit" size="lg" block disabled={kcal === null}>
        {q.save}
      </Button>
    </form>
  )
}
