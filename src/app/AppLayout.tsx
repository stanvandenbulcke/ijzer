import { Outlet } from 'react-router'
import { useActiveWorkout } from '../data/workoutsRepo'
import { ActiveWorkoutBar } from './ActiveWorkoutBar'
import { TabBar } from './TabBar'

/** Frame of the five tabs: the page, the running-workout bar and the tab bar. */
export function AppLayout() {
  const active = useActiveWorkout()
  return (
    <>
      <Outlet />
      {active && <ActiveWorkoutBar workout={active} />}
      <TabBar />
    </>
  )
}
