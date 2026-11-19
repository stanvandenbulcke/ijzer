import { useId, type ReactNode } from 'react'

/** Numbered section of the design page: "01 Kleuren". */
export function Section({
  index,
  title,
  children,
}: {
  index: number
  title: string
  children: ReactNode
}) {
  const id = useId()
  return (
    <section aria-labelledby={id} className="mt-14">
      <h2
        id={id}
        className="flex items-baseline gap-3 border-b border-line pb-2 font-display text-3xl font-bold uppercase"
      >
        <span className="text-xl text-accent-text">{String(index).padStart(2, '0')}</span>
        {title}
      </h2>
      <div className="mt-5 flex flex-col gap-7">{children}</div>
    </section>
  )
}

/** Small caption above an example. */
export function Caption({ children }: { children: ReactNode }) {
  return (
    <p className="mb-2 text-xs font-semibold tracking-widest text-muted uppercase">{children}</p>
  )
}
