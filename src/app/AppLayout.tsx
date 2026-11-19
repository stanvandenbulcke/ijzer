import { motion } from 'motion/react'
import { Outlet, useLocation } from 'react-router'
import { useActiveWorkout } from '../data/workoutsRepo'
import { ActiveWorkoutBar } from './ActiveWorkoutBar'
import { TabBar } from './TabBar'

/** Frame of the five tabs: the page, the running-workout bar and the tab bar. */
export function AppLayout() {
  const active = useActiveWorkout()
  const { pathname } = useLocation()
  return (
    <>
      {/* Each screen slides in softly: the app feels alive without slowing you down. */}
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
      >
        <Outlet />
      </motion.div>
      {active && <ActiveWorkoutBar workout={active} />}
      <TabBar />
    </>
  )
}
