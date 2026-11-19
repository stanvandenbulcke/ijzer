import { ChevronLeft } from 'lucide-react'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router'
import { t } from '../i18n'
import { IconButton } from './Button'

export interface PageHeaderProps {
  title: string
  /** Small line above the title, e.g. the date. */
  eyebrow?: string
  /** Show a back button; `true` goes back in history, a string navigates there. */
  back?: boolean | string
  actions?: ReactNode
}

/** Top of every screen: big display title, optional back button and actions. */
export function PageHeader({ title, eyebrow, back, actions }: PageHeaderProps) {
  const navigate = useNavigate()
  return (
    <header className="flex items-end gap-2 pt-[max(1rem,env(safe-area-inset-top))] pb-3">
      {back && (
        <IconButton
          icon={ChevronLeft}
          label={t.common.back}
          className="-ml-3 self-center"
          onClick={() => (typeof back === 'string' ? navigate(back) : navigate(-1))}
        />
      )}
      <div className="min-w-0 flex-1">
        {eyebrow && (
          <p className="text-xs font-semibold tracking-widest text-muted uppercase">{eyebrow}</p>
        )}
        <h1 className="truncate font-display text-4xl leading-tight font-black uppercase">
          {title}
        </h1>
      </div>
      {actions && <div className="flex shrink-0 items-center gap-1 self-center">{actions}</div>}
    </header>
  )
}

/** Page container: phone width, side gutters, room for the tab bar. */
export function Page({ children, tabBar = true }: { children: ReactNode; tabBar?: boolean }) {
  return (
    <main
      className="mx-auto w-full max-w-md px-4"
      style={{
        paddingBottom: tabBar
          ? 'calc(env(safe-area-inset-bottom) + 6rem)'
          : 'calc(env(safe-area-inset-bottom) + 2rem)',
      }}
    >
      {children}
    </main>
  )
}
