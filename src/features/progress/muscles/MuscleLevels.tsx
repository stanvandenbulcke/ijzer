import { HelpCircle } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import type { TrainingData } from '../../../data/useTrainingData'
import { levelTier, muscleLevels, type LevelTier } from '../../../domain/levels/muscleLevels'
import { t } from '../../../i18n'
import { formatNumber } from '../../../i18n/format'
import { Sheet } from '../../../ui/Sheet'
import { MuscleMap3D } from '../../../ui/muscle-map/MuscleMap3D'
import type { MuscleFill } from '../../../ui/muscle-map/MuscleMap'
import { Section } from '../Section'

const l = t.progress.levels

/** Tiers in the colours of real bumper plates: 5 white, 10 green, 15 yellow, 20 blue, 25 red. */
const TIER_COLOR: Record<LevelTier, string> = {
  plate5: 'var(--plate-white)',
  plate10: 'var(--plate-green)',
  plate15: 'var(--plate-yellow)',
  plate20: 'var(--plate-blue)',
  plate25: 'var(--plate-red)',
}
const TIERS = Object.keys(TIER_COLOR) as LevelTier[]

/**
 * Muscle levels (Stan's idea #3): every set and every new record makes a muscle level up.
 * The 3D body is coloured like bumper plates; a "Hoe werkt dit?" sheet explains the rules.
 */
export function MuscleLevels({ data }: { data: TrainingData }) {
  const navigate = useNavigate()
  const [explain, setExplain] = useState(false)
  const levels = muscleLevels(data.perfs, data.library.byId)
    .filter((x) => x.points > 0)
    .sort((a, b) => b.points - a.points)
  const fills: MuscleFill = {}
  for (const x of levels) fills[x.muscle] = { color: TIER_COLOR[levelTier(x.level)] }

  return (
    <Section title={l.title} note={l.note}>
      {levels.length === 0 ? (
        <p className="text-muted">{l.empty}</p>
      ) : (
        <>
          <MuscleMap3D
            fills={fills}
            label={levels.map((x) => `${t.muscles[x.muscle]} ${l.level(x.level)}`).join(', ')}
          />
          <ul className="mt-3 flex flex-wrap justify-center gap-x-3 gap-y-1 text-xs" aria-hidden>
            {TIERS.map((tier) => (
              <li key={tier} className="flex items-center gap-1.5">
                <span
                  className="size-3 rounded-full border border-line"
                  style={{ background: TIER_COLOR[tier] }}
                />
                {l.tiers[tier]}
              </li>
            ))}
          </ul>
          <ul className="mt-4 flex flex-col">
            {levels.map((x) => (
              <li key={x.muscle}>
                <button
                  type="button"
                  onClick={() => navigate(`/progressie/spier/${x.muscle}`)}
                  className="press flex min-h-12 w-full items-center gap-3 border-t border-line py-2 text-left"
                >
                  <span
                    aria-hidden
                    className="flex size-10 shrink-0 items-center justify-center rounded-full border-2 border-line font-display text-xl font-black text-on-accent"
                    style={{ background: TIER_COLOR[levelTier(x.level)] }}
                  >
                    {x.level}
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className="flex justify-between gap-2">
                      <span className="truncate font-semibold">{t.muscles[x.muscle]}</span>
                      <span className="text-sm text-muted">{l.level(x.level)}</span>
                    </span>
                    <span
                      className="h-1.5 overflow-hidden rounded-full bg-line"
                      role="progressbar"
                      aria-label={l.toNext(t.muscles[x.muscle])}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={Math.round(x.progress * 100)}
                    >
                      <span
                        className="block h-full bg-plate-yellow"
                        style={{ width: `${x.progress * 100}%` }}
                      />
                    </span>
                    <span className="text-xs text-muted">
                      {l.detail(formatNumber(x.sets, 0), x.prSessions)}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
      <button
        type="button"
        onClick={() => setExplain(true)}
        className="press mt-2 flex min-h-11 items-center gap-1.5 text-sm font-semibold text-accent-text"
      >
        <HelpCircle aria-hidden size={16} />
        {l.how}
      </button>
      <Sheet open={explain} onOpenChange={setExplain} title={l.how}>
        <div className="selectable flex flex-col gap-3">
          {l.explanation.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
      </Sheet>
    </Section>
  )
}
