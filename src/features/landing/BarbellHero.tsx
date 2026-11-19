/**
 * Signature animation of the landing page (SPEC §4.1): plates slide onto a barbell sleeve,
 * heaviest first, like loading a bar. Static when reduced motion is preferred.
 */
const plates = [
  { color: 'var(--plate-red)', h: 96, w: 18 },
  { color: 'var(--plate-blue)', h: 96, w: 16 },
  { color: 'var(--plate-yellow)', h: 96, w: 14 },
  { color: 'var(--plate-green)', h: 96, w: 12 },
]

/** x position of each plate on the sleeve, computed once. */
const positions = plates.reduce<number[]>(
  (xs, _plate, i) => [...xs, i === 0 ? 128 : xs[i - 1]! + plates[i - 1]!.w + 2],
  [],
)
const collarX = positions.at(-1)! + plates.at(-1)!.w + 4

export function BarbellHero() {
  return (
    <svg viewBox="0 0 360 120" aria-hidden className="w-full overflow-visible">
      {/* Bar and sleeve */}
      <rect x="0" y="56" width="128" height="8" fill="var(--line-strong)" />
      <rect x="112" y="46" width="14" height="28" rx="2" fill="var(--text-muted)" />
      <rect x="126" y="54" width="234" height="12" rx="2" fill="var(--line-strong)" />
      {plates.map((p, i) => {
        const px = positions[i]!
        return (
          <g key={i} className="plate-slide" style={{ animationDelay: `${150 + i * 170}ms` }}>
            <rect x={px} y={60 - p.h / 2} width={p.w} height={p.h} rx="3" fill={p.color} />
            <rect
              x={px + 3}
              y={60 - p.h / 2 + 6}
              width={2}
              height={p.h - 12}
              fill="var(--bg)"
              opacity="0.18"
            />
          </g>
        )
      })}
      {/* Collar */}
      <rect
        className="plate-slide"
        style={{ animationDelay: '900ms' }}
        x={collarX}
        y="48"
        width="10"
        height="24"
        rx="2"
        fill="var(--text)"
      />
    </svg>
  )
}
