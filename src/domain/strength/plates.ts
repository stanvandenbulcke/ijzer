export interface PlateInventory {
  /** Plate weight in kg. */
  kg: number
  /** How many of this plate fit on ONE side (pairs available). */
  perSide: number
}

export interface PlateLoad {
  /** Plates for one side, heaviest first. */
  perSide: number[]
  /** Total weight that this load gives (bar included). */
  achievedKg: number
  /** False when the target cannot be made exactly with the available plates. */
  exact: boolean
}

const round = (n: number) => Math.round(n * 1000) / 1000

/**
 * Plate calculator (SPEC §5.1): greedy from the heaviest plate down. Greedy is exact for
 * normal plate sets (25/20/15/10/5/2.5/1.25…). Reports when the exact weight is impossible.
 *
 * @example platesPerSide(100, 20, standardPlates) → per side [25, 15]
 */
export function platesPerSide(
  targetKg: number,
  barKg: number,
  inventory: PlateInventory[],
): PlateLoad {
  let remaining = round((targetKg - barKg) / 2)
  if (remaining <= 0)
    return { perSide: [], achievedKg: barKg, exact: round(targetKg) === round(barKg) }

  const perSide: number[] = []
  for (const plate of [...inventory].sort((a, b) => b.kg - a.kg)) {
    let used = 0
    while (used < plate.perSide && round(remaining - plate.kg) >= 0) {
      perSide.push(plate.kg)
      remaining = round(remaining - plate.kg)
      used++
    }
  }
  const achievedKg = round(barKg + 2 * perSide.reduce((a, b) => a + b, 0))
  return { perSide, achievedKg, exact: remaining === 0 }
}

/** A typical gym: 25, 20, 15, 10, 5, 2.5 and 1.25 kg plates, plenty of each. */
export const STANDARD_PLATES: PlateInventory[] = [25, 20, 15, 10, 5, 2.5, 1.25].map((kg) => ({
  kg,
  perSide: 4,
}))
