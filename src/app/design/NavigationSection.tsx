import { useState } from 'react'
import { t } from '../../i18n'
import { Badge } from '../../ui/Badge'
import { ListRow } from '../../ui/ListRow'
import { SubTabs } from '../../ui/SubTabs'
import { TabBar } from '../TabBar'
import { Caption, Section } from './Section'

const l = t.design.list

/** Stand-in for an exercise thumbnail until the photos arrive in phase 2. */
function Initials({ text, region }: { text: string; region: string }) {
  return (
    <span className="relative flex size-11 items-center justify-center overflow-hidden rounded-sm bg-surface-2 font-display text-lg font-bold">
      <span aria-hidden className={`absolute inset-y-0 left-0 w-1 ${region}`} />
      {text}
    </span>
  )
}

export function NavigationSection({ index }: { index: number }) {
  const tabs = t.design.subTabs.map((label, i) => ({ id: String(i), label }))
  const [tab, setTab] = useState('0')

  return (
    <Section index={index} title={t.design.sections.navigation}>
      <div>
        <Caption>Sub-tabs</Caption>
        <SubTabs label={t.design.subTabsLabel} tabs={tabs} value={tab} onChange={setTab} />
      </div>
      <div>
        <Caption>Lijst</Caption>
        <div className="border-t border-line">
          <ListRow
            title={l.bench}
            subtitle={l.benchSub}
            leading={<Initials text="BP" region="bg-region-push" />}
            trailing={
              <span className="flex items-center gap-2">
                <span className="font-display text-xl font-bold">{l.lastBest}</span>
                <Badge tone="pr">{t.design.badges.pr}</Badge>
              </span>
            }
            onClick={() => undefined}
          />
          <ListRow
            title={l.curl}
            subtitle={l.curlSub}
            leading={<Initials text="IC" region="bg-region-pull" />}
            onClick={() => undefined}
          />
        </div>
      </div>
      <div>
        <Caption>Tabbalk</Caption>
        <div className="overflow-hidden rounded-md border border-line">
          <TabBar previewActivePath="/train" />
        </div>
      </div>
    </Section>
  )
}
