import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useEffect } from 'react'
import { t } from '../../i18n'

export interface PrMoment {
  /** Id of the set that broke the record. */
  id: string
  exercise: string
  kind: string
  value: string
}

const PLATES = [
  'var(--plate-red)',
  'var(--plate-blue)',
  'var(--plate-yellow)',
  'var(--plate-green)',
]

/** Chalk dust: small specks that burst out when the plates hit the collar. */
const DUST = Array.from({ length: 22 }, (_, i) => {
  const angle = (i / 22) * Math.PI * 2
  const distance = 70 + (i % 5) * 22
  return {
    x: Math.cos(angle) * distance,
    y: Math.sin(angle) * distance * 0.6,
    size: 3 + (i % 3) * 2,
  }
})

/**
 * Full-screen PR moment (SPEC §4.4, §6.2 signature motion): plates slide onto a bar, chalk
 * dust bursts, the record stamps in. Tap anywhere or wait 2.6 s. Static with reduced motion.
 */
export function PrCelebration({ moment, onDone }: { moment: PrMoment | null; onDone: () => void }) {
  const reduced = useReducedMotion()
  useEffect(() => {
    if (!moment) return
    const timer = window.setTimeout(onDone, 2600)
    return () => window.clearTimeout(timer)
  }, [moment, onDone])

  return (
    <AnimatePresence>
      {moment && (
        <motion.div
          key={moment.id}
          role="alert"
          aria-live="assertive"
          onClick={onDone}
          className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-bg/95 px-6 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <div className="relative h-36 w-72">
            <svg viewBox="0 0 288 144" className="absolute inset-0 overflow-visible" aria-hidden>
              <rect x="0" y="68" width="288" height="8" fill="var(--line-strong)" />
              <rect x="70" y="58" width="10" height="28" rx="2" fill="var(--text-muted)" />
              {PLATES.map((color, i) => (
                <motion.rect
                  key={color}
                  x={84 + i * 20}
                  y={72 - (58 - i * 6)}
                  width={16}
                  height={(58 - i * 6) * 2}
                  rx={3}
                  fill={color}
                  initial={reduced ? false : { x: 220, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{
                    type: 'spring',
                    stiffness: 520,
                    damping: 26,
                    delay: 0.08 + i * 0.09,
                  }}
                />
              ))}
            </svg>
            {!reduced &&
              DUST.map((d, i) => (
                <motion.span
                  key={i}
                  aria-hidden
                  className="absolute top-1/2 left-[40%] rounded-full bg-text"
                  style={{ width: d.size, height: d.size }}
                  initial={{ x: 0, y: 0, opacity: 0 }}
                  animate={{ x: d.x, y: d.y, opacity: [0, 0.9, 0] }}
                  transition={{ duration: 0.9, delay: 0.45, ease: 'easeOut' }}
                />
              ))}
          </div>
          <motion.p
            className="font-display text-7xl leading-none font-black text-plate-red uppercase"
            initial={reduced ? false : { scale: 1.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 380, damping: 18, delay: 0.42 }}
          >
            {t.training.workout.newRecord}
          </motion.p>
          <motion.div
            initial={reduced ? false : { y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.62, duration: 0.25 }}
            className="mt-3 flex flex-col items-center"
          >
            <span className="font-display text-5xl font-black text-text">{moment.value}</span>
            <span className="mt-1 text-lg text-text">{moment.exercise}</span>
            <span className="text-sm text-muted">{moment.kind}</span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
