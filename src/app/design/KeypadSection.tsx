import { useState } from 'react'
import { t } from '../../i18n'
import { Button } from '../../ui/Button'
import { NumberPad } from '../../ui/number-pad/NumberPad'
import { Sheet } from '../../ui/Sheet'
import { Section } from './Section'

const k = t.design.keypad

export function KeypadSection({ index }: { index: number }) {
  const [inline, setInline] = useState<number | null>(82.5)
  const [sheetValue, setSheetValue] = useState<number | null>(80)
  const [open, setOpen] = useState(false)

  return (
    <Section index={index} title={t.design.sections.keypad}>
      <NumberPad
        label={k.weight}
        value={inline}
        onChange={setInline}
        onDone={() => undefined}
        unit={t.common.kg}
        step={2.5}
      />
      <Button variant="secondary" onClick={() => setOpen(true)} block>
        {k.open}
      </Button>
      <Sheet open={open} onOpenChange={setOpen} title={k.sheetTitle}>
        <NumberPad
          label={k.weight}
          value={sheetValue}
          onChange={setSheetValue}
          onDone={() => setOpen(false)}
          unit={t.common.kg}
          step={2.5}
          quickValues={[
            { label: k.sameAsLastSet, value: 80 },
            { label: k.lastTime, value: 82.5 },
          ]}
        />
      </Sheet>
    </Section>
  )
}
