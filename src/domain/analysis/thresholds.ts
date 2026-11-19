/**
 * All thresholds of the analysis rules in one place (SPEC §5.3), so they can be shown
 * and later changed in the settings. Values are rules of thumb unless a source is given.
 */
export const THRESHOLDS = {
  /** Weekly fractional sets per muscle (R1; Pelland et al. 2026 for the dose–response). */
  volume: { low: 6, target: 10, high: 21, veryHigh: 26 },
  /** Fractional sets per muscle per session above which more adds little (R2; Remmert 2025). */
  perSession: 11,
  /** Average logged RIR above which sets are probably too far from failure (R3). */
  averageRir: 4,
  /** Sets with a logged RIR above this count 0 towards volume. */
  rirCutoff: 5,
  /** Median rest for compounds below this many seconds (R4; Singer et al. 2024). */
  minRestSec: 60,
  /** Ratio above which push/pull etc. is out of balance over 4 weeks (R6). */
  balanceRatio: 2,
  /** Sessions without a new best e1RM, spanning at least this many days (R7). */
  stagnation: { sessions: 4, minDays: 21 },
} as const
