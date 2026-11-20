import { motion } from 'motion/react'
import { useState } from 'react'
import { Outlet, useLocation } from 'react-router'
import { useActiveWorkout } from '../data/workoutsRepo'
import { ActiveWorkoutBar } from './ActiveWorkoutBar'
import { EdgeSwipeBack } from './EdgeSwipeBack'
import { TabBar } from './TabBar'

const TABS = ['/vandaag', '/train', '/voeding', '/progressie', '/ik']

/** Frame of the five tabs: the page, the running-workout bar and the tab bar. */
export function AppLayout() {
  const active = useActiveWorkout()
  const { pathname } = useLocation()
  // Tabs slide in from the side you tapped towards; sub-pages rise softly.
  const tab = TABS.findIndex((p) => pathname.startsWith(p))
  const [nav, setNav] = useState({ pathname, tab, direction: 0 })
  if (nav.pathname !== pathname) {
    setNav({ pathname, tab, direction: tab === nav.tab ? 0 : tab > nav.tab ? 1 : -1 })
  }
  const direction = nav.pathname === pathname ? nav.direction : 0
  return (
    <>
      {/* Each screen slides in softly: the app feels alive without slowing you down. */}
      <motion.div
        key={pathname}
        initial={{ opacity: 0, x: direction * 28, y: direction === 0 ? 10 : 0 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
      >
        <Outlet />
      </motion.div>
      {active && <ActiveWorkoutBar workout={active} />}
      <TabBar />
      <EdgeSwipeBack />
    </>
  )
}
