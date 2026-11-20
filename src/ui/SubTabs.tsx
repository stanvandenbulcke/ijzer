import { useEffect, useRef } from 'react'
import { cx } from './cx'

export interface SubTab<T extends string> {
  id: T
  label: string
}

export interface SubTabsProps<T extends string> {
  label: string
  tabs: SubTab<T>[]
  value: T
  onChange: (id: T) => void
}

/**
 * Horizontal sub-navigation (e.g. Progressie: Overzicht · Oefeningen · …).
 * Scrolls sideways when it does not fit; the active tab gets a thick bar like a plate edge.
 */
export function SubTabs<T extends string>({ label, tabs, value, onChange }: SubTabsProps<T>) {
  const activeRef = useRef<HTMLButtonElement>(null)
  // Deep links (e.g. /progressie/analyse) must not hide the active tab off-screen.
  useEffect(() => {
    activeRef.current?.scrollIntoView?.({ inline: 'nearest', block: 'nearest' })
  }, [value])
  return (
    <div
      role="tablist"
      aria-label={label}
      className="flex overflow-x-auto border-b border-line [scrollbar-width:none]"
    >
      {tabs.map((tab) => {
        const active = tab.id === value
        return (
          <button
            key={tab.id}
            ref={active ? activeRef : undefined}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.id)}
            className={cx(
              'relative min-h-11 shrink-0 px-3 text-[15px] font-semibold whitespace-nowrap',
              active ? 'text-text' : 'text-muted',
            )}
          >
            {tab.label}
            {active && (
              <span aria-hidden className="absolute inset-x-2 bottom-0 h-[3px] bg-focus" />
            )}
          </button>
        )
      })}
    </div>
  )
}
