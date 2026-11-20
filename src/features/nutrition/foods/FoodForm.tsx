import { Star } from 'lucide-react'
import { useState } from 'react'
import { newId } from '../../../data/rows'
import { kcalDeviation, KCAL_WARNING } from '../../../domain/nutrition/macros'
import type { Food } from '../../../domain/nutrition/types'
import { t } from '../../../i18n'
import { formatNumber, parseDecimal } from '../../../i18n/format'
import { Button } from '../../../ui/Button'
import { Chip } from '../../../ui/Chip'
import { TextField } from '../../../ui/TextField'

const f = t.nutrition.food
type NumberKey = 'kcal' | 'protein' | 'carbs' | 'fat' | 'fiber' | 'gramsPerPiece' | 'servingGrams'

const text = (v: number | null | undefined) =>
  v === null || v === undefined ? '' : formatNumber(v, 2)

/**
 * Create or edit an own product (SPEC §4.5 "Mijn producten"): values per 100 g/ml from the
 * label, optional piece/serving size, with the kcal sanity check.
 */
export function FoodForm({
  initial,
  initialName = '',
  initialBarcode = '',
  submitLabel,
  onSaved,
}: {
  initial: Food | null
  initialName?: string
  initialBarcode?: string
  submitLabel: string
  onSaved: (food: Food) => void
}) {
  const [name, setName] = useState(initial?.name ?? initialName)
  const [brand, setBrand] = useState(initial?.brand ?? '')
  const [barcode, setBarcode] = useState(initial?.barcode ?? initialBarcode)
  const [liquid, setLiquid] = useState(initial?.liquid ?? false)
  const [favorite, setFavorite] = useState(initial?.favorite ?? false)
  const [values, setValues] = useState<Record<NumberKey, string>>({
    kcal: text(initial?.per100.kcal),
    protein: text(initial?.per100.protein),
    carbs: text(initial?.per100.carbs),
    fat: text(initial?.per100.fat),
    fiber: text(initial?.per100.fiber),
    gramsPerPiece: text(initial?.gramsPerPiece),
    servingGrams: text(initial?.servingGrams),
  })
  const [error, setError] = useState<string | null>(null)
  const num = (k: NumberKey) => parseDecimal(values[k])
  const per100 = {
    kcal: num('kcal') ?? 0,
    protein: num('protein') ?? 0,
    carbs: num('carbs') ?? 0,
    fat: num('fat') ?? 0,
    fiber: num('fiber'),
  }
  const expected = 4 * per100.protein + 4 * per100.carbs + 9 * per100.fat + 2 * (per100.fiber ?? 0)
  const suspicious = values.kcal !== '' && kcalDeviation(per100) > KCAL_WARNING

  const field = (k: NumberKey, label: string) => (
    <TextField
      label={label}
      inputMode="decimal"
      value={values[k]}
      onChange={(e) => setValues((v) => ({ ...v, [k]: e.target.value }))}
    />
  )

  const submit = () => {
    if (!name.trim() || num('kcal') === null) return setError(f.required)
    onSaved({
      id: initial?.id ?? newId(),
      name: name.trim(),
      brand: brand.trim() || null,
      barcode: barcode.trim() || null,
      per100,
      liquid,
      gramsPerPiece: num('gramsPerPiece'),
      servingGrams: num('servingGrams'),
      favorite,
      lastAmount: initial?.lastAmount ?? null,
    })
  }

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault()
        submit()
      }}
    >
      <TextField label={f.name} value={name} onChange={(e) => setName(e.target.value)} />
      <TextField label={f.brand} value={brand} onChange={(e) => setBrand(e.target.value)} />
      <div className="flex flex-wrap gap-2">
        <Chip selected={favorite} onClick={() => setFavorite((v) => !v)}>
          <Star aria-hidden size={16} />
          {f.favorite}
        </Chip>
      </div>
      <fieldset className="flex flex-col gap-3">
        <legend className="mb-1 font-semibold">{f.per100(liquid)}</legend>
        {/* Most labels list per 100 g; drinks (and some yoghurts, sauces) per 100 ml. */}
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label={f.basis}>
          <span className="text-sm font-semibold text-muted">{f.basis}</span>
          <Chip selected={!liquid} onClick={() => setLiquid(false)}>
            {f.per100g}
          </Chip>
          <Chip selected={liquid} onClick={() => setLiquid(true)}>
            {f.per100ml}
          </Chip>
        </div>
        <p className="text-sm text-muted">{f.fromLabel(liquid)}</p>
        <div className="grid grid-cols-2 gap-3">
          {field('kcal', f.kcal)}
          {field('protein', f.protein)}
          {field('carbs', f.carbs)}
          {field('fat', f.fat)}
          {field('fiber', f.fiber)}
        </div>
        {suspicious && (
          <p role="status" className="rounded-sm border border-accent-edge p-2 text-sm">
            {f.kcalCheck(formatNumber(expected, 0))}
          </p>
        )}
      </fieldset>
      <div className="grid grid-cols-2 gap-3">
        {field('gramsPerPiece', f.gramsPerPiece(liquid))}
        {field('servingGrams', f.servingGrams(liquid))}
      </div>
      <TextField
        label={f.barcode}
        inputMode="numeric"
        value={barcode}
        onChange={(e) => setBarcode(e.target.value)}
      />
      {error && (
        <p role="alert" className="text-red-text">
          {error}
        </p>
      )}
      <Button type="submit" size="lg" block>
        {submitLabel}
      </Button>
    </form>
  )
}
