import type { ReactNode } from 'react'

export function Section({
  title,
  children,
  note,
}: {
  title: string
  children: ReactNode
  note?: string
}) {
  return (
    <section className="mt-7">
      <h2 className="mb-3 border-b border-line pb-1.5 font-display text-2xl font-bold uppercase">
        {title}
      </h2>
      {children}
      {note && <p className="mt-2 text-xs text-muted">{note}</p>}
    </section>
  )
}

/** Horizontal bar with a value, for simple per-week or per-muscle numbers. */
export function BarRow({
  label,
  value,
  max,
  text,
  color = 'bg-plate-blue',
  onClick,
}: {
  label: string
  value: number
  max: number
  text: string
  color?: string
  onClick?: () => void
}) {
  const content = (
    <>
      <span className="w-32 shrink-0 truncate text-left text-sm">{label}</span>
      <span className="h-2 flex-1 overflow-hidden rounded-full bg-line" aria-hidden>
        <span
          className={`block h-full ${color}`}
          style={{ width: `${max > 0 ? Math.min(100, (value / max) * 100) : 0}%` }}
        />
      </span>
      <span className="w-12 shrink-0 text-right font-display text-lg font-bold">{text}</span>
    </>
  )
  return onClick ? (
    <button
      type="button"
      onClick={onClick}
      className="press flex min-h-11 w-full items-center gap-3"
    >
      {content}
    </button>
  ) : (
    <div className="flex min-h-9 items-center gap-3">{content}</div>
  )
}
