/** Normalises a rotation in degrees to 0–360. */
export function normaliseAngle(deg: number): number {
  return ((deg % 360) + 360) % 360
}

/** True when the back of the 3D body faces the viewer (between 90° and 270°). */
export function showsBack(deg: number): boolean {
  const a = normaliseAngle(deg)
  return a > 90 && a < 270
}
