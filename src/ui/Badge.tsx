import type { ReactNode } from 'react'
import { cx } from './cx'

type Tone = 'pr' | 'success' | 'info' | 'muted' | 'estimate'

const tones: Record<Tone, string> = {
  pr: 'bg-plate-red text-on-plate',
  success: 'bg-plate-green text-on-accent',
  info: 'bg-plate-blue text-on-plate',
  muted: 'bg-surface-2 text-muted',
  // Estimates are always marked as such (SPEC §1 principle 3): dashed = "not measured".
  estimate: 'border border-dashed border-line-strong text-muted',
}

/** Small status label: PR, skipped, estimate… */
export function Badge({ tone, children }: { tone: Tone; children: ReactNode }) {
  return (
    <span
      className={cx(
        'inline-flex h-6 items-center rounded-sm px-2 font-display text-[15px] leading-none font-bold tracking-wide uppercase',
        tones[tone],
      )}
    >
      {children}
    </span>
  )
}
