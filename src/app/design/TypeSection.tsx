import { t } from '../../i18n'
import { Caption, Section } from './Section'

const s = t.design.typeSamples

export function TypeSection({ index }: { index: number }) {
  return (
    <Section index={index} title={t.design.sections.type}>
      <div>
        <Caption>Big Shoulders Display 900 · getallen</Caption>
        <p className="flex items-baseline gap-2 font-display text-8xl leading-none font-black">
          {s.bigNumber}
          <span className="font-sans text-2xl font-semibold text-muted">{t.common.kg}</span>
          <span className="font-display text-5xl text-muted">×</span>
          <span>8</span>
        </p>
      </div>
      <div>
        <Caption>Big Shoulders Display 700 · koppen</Caption>
        <p className="font-display text-4xl font-bold uppercase">{s.heading}</p>
      </div>
      <div>
        <Caption>Archivo · tekst en labels</Caption>
        <p className="text-sm font-semibold tracking-widest text-muted uppercase">{s.label}</p>
        <p className="mt-1 text-lg leading-snug">{s.body}</p>
      </div>
    </Section>
  )
}
