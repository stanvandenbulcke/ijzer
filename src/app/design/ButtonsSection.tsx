import { Dumbbell, ScanBarcode, Search, Timer } from 'lucide-react'
import { t } from '../../i18n'
import { Button, IconButton } from '../../ui/Button'
import { Caption, Section } from './Section'

const b = t.design.buttons

export function ButtonsSection({ index }: { index: number }) {
  return (
    <Section index={index} title={t.design.sections.buttons}>
      <Button size="lg" icon={Dumbbell} block>
        {b.start}
      </Button>
      <div className="grid grid-cols-2 gap-3">
        <Button variant="secondary">{b.later}</Button>
        <Button variant="danger">{b.skip}</Button>
        <Button variant="ghost">{b.save}</Button>
        <Button disabled>{b.disabled}</Button>
      </div>
      <div>
        <Caption>Icoonknoppen · Lucide, één set</Caption>
        <div className="flex gap-2">
          <IconButton icon={Timer} label={b.timer} filled />
          <IconButton icon={Search} label={b.search} filled />
          <IconButton icon={ScanBarcode} label={b.scan} filled />
          <IconButton icon={Timer} label={b.timer} />
          <IconButton icon={Search} label={b.search} />
        </div>
      </div>
    </Section>
  )
}
