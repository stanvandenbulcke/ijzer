import { motion } from 'motion/react'
import type { GhostResult } from '../../../domain/training/ghost'
import { t } from '../../../i18n'
import { formatNumber } from '../../../i18n/format'
import { cx } from '../../../ui/cx'

const g = t.training.workout.ghost

/**
 * "Race tegen jezelf": are you ahead of or behind the ghost of last time? The bar grows right
 * (green) when ahead, left (red) when behind, up to ±25 % of last time.
 */
export function GhostBar({
  ghost,
  unit,
  compact = false,
}: {
  ghost: GhostResult
  unit: string
  compact?: boolean
}) {
  const share = ghost.then > 0 ? Math.max(-1, Math.min(1, ghost.delta / ghost.then / 0.25)) : 1
  const value = `${formatNumber(Math.abs(ghost.delta), 0)} ${unit}`
  const text = ghost.delta > 0 ? g.ahead(value) : ghost.delta < 0 ? g.behind(value) : g.even
  const tone =
    ghost.delta > 0 ? 'text-green-text' : ghost.delta < 0 ? 'text-red-text' : 'text-muted'
  return (
    <div
      className={cx('flex items-center gap-3', compact ? 'text-xs' : 'text-sm')}
      role="status"
      aria-label={g.label(text, ghost.sets)}
    >
      {!compact && <span className="shrink-0 font-semibold text-muted">{g.session}</span>}
      <div
        className={cx(
          'relative flex-1 overflow-hidden rounded-full bg-line',
          compact ? 'h-1.5' : 'h-2',
        )}
        aria-hidden
      >
        <span className="absolute inset-y-0 left-1/2 w-px bg-line-strong" />
        <motion.span
          className={cx(
            'absolute inset-y-0',
            ghost.delta >= 0 ? 'left-1/2 bg-plate-green' : 'right-1/2 bg-plate-red',
          )}
          initial={{ width: 0 }}
          animate={{ width: `${Math.abs(share) * 50}%` }}
          transition={{ type: 'spring', stiffness: 260, damping: 30 }}
        />
      </div>
      <span
        className={cx('shrink-0 font-display font-bold', compact ? 'text-base' : 'text-lg', tone)}
      >
        {text}
      </span>
    </div>
  )
}
