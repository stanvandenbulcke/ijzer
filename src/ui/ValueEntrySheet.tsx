import { useState } from 'react'
import { NumberPad } from './number-pad/NumberPad'
import { Sheet } from './Sheet'

/** One number in a bottom sheet with our keypad (e.g. today's body weight). */
export function ValueEntrySheet({
  open,
  onOpenChange,
  title,
  label,
  initial,
  unit,
  step,
  maxDecimals = 1,
  onSave,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  title: string
  label: string
  initial: number | null
  unit: string
  step: number
  maxDecimals?: number
  onSave: (value: number) => void
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange} title={title}>
      {open && (
        <Entry
          label={label}
          initial={initial}
          unit={unit}
          step={step}
          maxDecimals={maxDecimals}
          onSave={onSave}
          onClose={() => onOpenChange(false)}
        />
      )}
    </Sheet>
  )
}

/** Mounted fresh on every open, so it always starts from the current value. */
function Entry(props: {
  label: string
  initial: number | null
  unit: string
  step: number
  maxDecimals: number
  onSave: (value: number) => void
  onClose: () => void
}) {
  const [value, setValue] = useState(props.initial)
  return (
    <NumberPad
      label={props.label}
      value={props.initial}
      onChange={setValue}
      unit={props.unit}
      step={props.step}
      maxDecimals={props.maxDecimals}
      onDone={() => {
        if (value !== null && value > 0) props.onSave(value)
        props.onClose()
      }}
    />
  )
}
