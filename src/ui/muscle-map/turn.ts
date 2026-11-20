/** Normalises a rotation in degrees to 0–360. */
export function normaliseAngle(deg: number): number {
  return ((deg % 360) + 360) % 360
}

/** True when the back of the 3D body faces the viewer (between 90° and 270°). */
export function showsBack(deg: number): boolean {
  const a = normaliseAngle(deg)
  return a > 90 && a < 270
}

/**
 * Which side to show first: the one with more trained muscles that are only visible there
 * (glutes and hamstrings are on the back, so a leg day opens on the back). Ties: front.
 */
export function preferredSide(
  trained: Iterable<string>,
  frontOnly: ReadonlySet<string>,
  backOnly: ReadonlySet<string>,
): 'front' | 'back' {
  let front = 0
  let back = 0
  for (const muscle of trained) {
    if (frontOnly.has(muscle)) front++
    if (backOnly.has(muscle)) back++
  }
  return back > front ? 'back' : 'front'
}
