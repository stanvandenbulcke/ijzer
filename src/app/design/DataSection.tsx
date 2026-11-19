import { t } from '../../i18n'
import { Badge } from '../../ui/Badge'
import { ProgressRing } from '../../ui/ProgressRing'
import { Caption, Section } from './Section'
import { SetRowDemo } from './SetRowDemo'

const d = t.design

const zones = [
  ['none', 'bg-zone-none'],
  ['low', 'bg-zone-low'],
  ['moderate', 'bg-zone-moderate'],
  ['target', 'bg-zone-target'],
  ['high', 'bg-zone-high'],
  ['veryHigh', 'bg-zone-very-high'],
] as const

export function DataSection({ index }: { index: number }) {
  return (
    <Section index={index} title={d.sections.data}>
      <div>
        <Caption>{d.setRow.title}</Caption>
        <SetRowDemo />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <ProgressRing value={1640} max={2400} label={d.rings.kcalLabel} size={150}>
          <span className="flex flex-col">
            <span className="font-display text-5xl leading-none font-black">760</span>
            <span className="text-sm text-muted">{d.rings.kcal}</span>
          </span>
        </ProgressRing>
        <ProgressRing value={84} max={150} label={d.rings.restLabel} size={150} tone="blue">
          <span className="flex flex-col">
            <span className="font-display text-5xl leading-none font-black">1:24</span>
            <span className="text-sm text-muted">{d.rings.rest}</span>
          </span>
        </ProgressRing>
      </div>
      <div>
        <Caption>Labels</Caption>
        <div className="flex flex-wrap gap-2">
          <Badge tone="pr">{d.badges.pr}</Badge>
          <Badge tone="success">{d.badges.done}</Badge>
          <Badge tone="info">{d.badges.info}</Badge>
          <Badge tone="muted">{d.badges.skipped}</Badge>
          <Badge tone="estimate">{d.badges.estimate}</Badge>
        </div>
      </div>
      <div>
        <Caption>{d.zonesTitle}</Caption>
        <ul className="flex flex-col gap-1.5">
          {zones.map(([zone, swatch]) => (
            <li key={zone} className="flex items-center gap-3">
              <span aria-hidden className={`h-4 w-10 rounded-sm border border-line ${swatch}`} />
              <span className="flex-1">{t.volumeZones[zone]}</span>
              <span className="font-display text-lg font-bold text-muted">
                {d.zonesRanges[zone]}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  )
}
