import { motion } from 'motion/react'
import { useNavigate } from 'react-router'
import type { TrainingData } from '../../../data/useTrainingData'
import { MUSCLE_REGION } from '../../../domain/muscles/taxonomy'
import { recordWall } from '../../../domain/training/totals'
import { formatNumber } from '../../../i18n/format'

const PLATE = {
  push: 'var(--plate-red)',
  pull: 'var(--plate-blue)',
  legs: 'var(--plate-green)',
  core: 'var(--plate-yellow)',
  neck: 'var(--plate-white)',
} as const
const INK = {
  push: 'var(--on-plate)',
  pull: 'var(--on-plate)',
  legs: 'var(--on-accent)',
  core: 'var(--on-accent)',
  neck: 'var(--on-accent)',
} as const

/** Trophy cabinet: your strongest lifts as bumper plates, in the colour of the muscle region. */
export function RecordWall({ data }: { data: TrainingData }) {
  const navigate = useNavigate()
  const records = recordWall(data.perfs)
  if (records.length === 0) return null
  return (
    <div className="grid grid-cols-3 gap-3">
      {records.map((r, i) => {
        const exercise = data.library.byId(r.exerciseId)
        const main = exercise?.muscles.find((m) => m.weight === 1)?.muscle
        const region = main ? MUSCLE_REGION[main] : 'neck'
        return (
          <motion.button
            key={r.exerciseId}
            type="button"
            onClick={() => navigate(`/progressie/oefening/${encodeURIComponent(r.exerciseId)}`)}
            className="flex flex-col items-center gap-1.5 text-center"
            initial={{ rotate: -90, opacity: 0, x: -30 }}
            animate={{ rotate: 0, opacity: 1, x: 0 }}
            transition={{ type: 'spring', stiffness: 220, damping: 20, delay: 0.1 + i * 0.08 }}
          >
            <svg viewBox="0 0 64 64" className="w-full max-w-24" aria-hidden>
              <circle cx="32" cy="32" r="31" fill={PLATE[region]} stroke="var(--line)" />
              <circle cx="32" cy="32" r="24" fill="none" stroke={INK[region]} strokeOpacity="0.2" />
              <circle cx="32" cy="32" r="5" fill="var(--bg)" />
              <text
                x="32"
                y="22"
                textAnchor="middle"
                fontFamily="Big Shoulders Display"
                fontWeight="900"
                fontSize="13"
                fill={INK[region]}
              >
                {formatNumber(r.e1rm, 0)}
              </text>
            </svg>
            <span className="line-clamp-2 text-xs leading-tight">
              {exercise?.name ?? r.exerciseId}
            </span>
          </motion.button>
        )
      })}
    </div>
  )
}
