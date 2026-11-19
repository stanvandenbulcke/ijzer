import {
  ChartLine,
  CircleUser,
  Dumbbell,
  Sun,
  UtensilsCrossed,
  type LucideIcon,
} from 'lucide-react'
import { NavLink } from 'react-router'
import { t } from '../i18n'
import { cx } from '../ui/cx'

interface Tab {
  path: string
  label: string
  icon: LucideIcon
}

/** The five tabs of SPEC §3.1, in order. */
const TABS: Tab[] = [
  { path: '/vandaag', label: t.tabs.today, icon: Sun },
  { path: '/train', label: t.tabs.train, icon: Dumbbell },
  { path: '/voeding', label: t.tabs.nutrition, icon: UtensilsCrossed },
  { path: '/progressie', label: t.tabs.progress, icon: ChartLine },
  { path: '/ik', label: t.tabs.me, icon: CircleUser },
]

function TabContent({ tab, active }: { tab: Tab; active: boolean }) {
  const Icon = tab.icon
  return (
    <>
      {active && <span aria-hidden className="absolute inset-x-3 top-0 h-[3px] bg-focus" />}
      <Icon aria-hidden size={24} strokeWidth={active ? 2.25 : 1.75} />
      <span className="text-[11px] font-semibold tracking-wide">{tab.label}</span>
    </>
  )
}

const itemClass = (active: boolean) =>
  cx(
    'relative flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 pt-1',
    active ? 'text-text' : 'text-muted',
  )

export interface TabBarProps {
  /**
   * Preview mode for the /design page: renders a static bar with this tab active,
   * without links. Leave undefined in the real app.
   */
  previewActivePath?: string
}

/** Bottom tab bar, in thumb reach, respecting the home indicator. */
export function TabBar({ previewActivePath }: TabBarProps) {
  const preview = previewActivePath !== undefined
  return (
    <nav
      aria-label={t.tabs.label}
      className={cx(
        'border-t border-line bg-bg pb-[env(safe-area-inset-bottom)]',
        preview ? 'relative' : 'fixed inset-x-0 bottom-0 z-30',
      )}
    >
      <div className="mx-auto flex max-w-md">
        {TABS.map((tab) =>
          preview ? (
            <div key={tab.path} className={itemClass(tab.path === previewActivePath)}>
              <TabContent tab={tab} active={tab.path === previewActivePath} />
            </div>
          ) : (
            <NavLink key={tab.path} to={tab.path} className={({ isActive }) => itemClass(isActive)}>
              {({ isActive }) => <TabContent tab={tab} active={isActive} />}
            </NavLink>
          ),
        )}
      </div>
    </nav>
  )
}
