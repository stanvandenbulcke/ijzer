import { t } from '../../i18n'
import { Caption, Section } from './Section'

const d = t.design

const plates = [
  { key: 'yellow', fill: 'var(--plate-yellow)', ink: 'var(--on-accent)' },
  { key: 'blue', fill: 'var(--plate-blue)', ink: 'var(--on-plate)' },
  { key: 'red', fill: 'var(--plate-red)', ink: 'var(--on-plate)' },
  { key: 'green', fill: 'var(--plate-green)', ink: 'var(--on-accent)' },
  { key: 'white', fill: 'var(--plate-white)', ink: 'var(--on-accent)' },
] as const

const surfaces = [
  ['bg', 'Achtergrond'],
  ['surface', 'Vlak'],
  ['surface-2', 'Vlak 2 · knoppen'],
  ['line', 'Hairline'],
  ['line-strong', 'Rand van invoer'],
  ['text', 'Tekst'],
  ['text-muted', 'Tekst gedempt'],
] as const

/** A bumper plate seen from the front: the accent colours are literally the plate colours. */
function Plate({ fill, ink, kg }: { fill: string; ink: string; kg: string }) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden className="w-full">
      <circle cx="32" cy="32" r="31" fill={fill} stroke="var(--line)" />
      <circle cx="32" cy="32" r="23" fill="none" stroke={ink} strokeOpacity="0.18" />
      <circle cx="32" cy="32" r="7" fill="var(--surface-2)" stroke={ink} strokeOpacity="0.3" />
      <text
        x="32"
        y="19"
        textAnchor="middle"
        fontFamily="Big Shoulders Display"
        fontWeight="900"
        fontSize="11"
        fill={ink}
      >
        {kg}
      </text>
    </svg>
  )
}

export function ColorsSection({ index }: { index: number }) {
  return (
    <Section index={index} title={d.sections.colors}>
      <div className="grid grid-cols-5 gap-2">
        {plates.map((p) => (
          <figure key={p.key} className="flex flex-col items-center gap-1.5">
            <Plate fill={p.fill} ink={p.ink} kg={d.plates[p.key].kg} />
            <figcaption className="text-center text-xs leading-tight text-muted">
              {d.plates[p.key].role}
            </figcaption>
          </figure>
        ))}
      </div>
      <div>
        <Caption>{d.surfaces}</Caption>
        <ul className="grid grid-cols-2 gap-x-4 gap-y-2">
          {surfaces.map(([token, name]) => (
            <li key={token} className="flex items-center gap-2.5">
              <span
                aria-hidden
                className="size-8 shrink-0 rounded-sm border border-line"
                style={{ background: `var(--${token})` }}
              />
              <span className="flex flex-col">
                <span className="text-sm">{name}</span>
                <span className="text-xs text-muted">--{token}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  )
}
