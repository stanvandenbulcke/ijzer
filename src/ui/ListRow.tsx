import { ChevronRight } from 'lucide-react'
import type { ReactNode } from 'react'
import { cx } from './cx'

export interface ListRowProps {
  title: string
  subtitle?: ReactNode
  leading?: ReactNode
  trailing?: ReactNode
  onClick?: () => void
}

/** A row in a list, separated by a hairline. Tappable when `onClick` is given. */
export function ListRow({ title, subtitle, leading, trailing, onClick }: ListRowProps) {
  const content = (
    <>
      {leading && <span className="shrink-0">{leading}</span>}
      <span className="flex min-w-0 flex-1 flex-col text-left">
        <span className="truncate text-base font-semibold">{title}</span>
        {subtitle && <span className="truncate text-sm text-muted">{subtitle}</span>}
      </span>
      {trailing && <span className="shrink-0 text-right">{trailing}</span>}
      {onClick && <ChevronRight aria-hidden size={20} className="shrink-0 text-muted" />}
    </>
  )
  const base = 'flex min-h-14 w-full items-center gap-3 border-b border-line py-2.5'
  return onClick ? (
    <button type="button" onClick={onClick} className={cx(base, 'press active:bg-surface')}>
      {content}
    </button>
  ) : (
    <div className={base}>{content}</div>
  )
}
