import type { ComponentType } from 'react'
import { createBrowserRouter, Navigate } from 'react-router'
import { LandingPage } from '../features/landing'
import { AppLayout } from './AppLayout'
import { NotFoundPage } from './NotFoundPage'
import { RequireProfile, RootGate } from './RequireProfile'
import { RouteError } from './RouteError'

/** Lazy route: each tab is its own chunk, loaded when first opened. */
function page<M>(load: () => Promise<M>, pick: (m: M) => ComponentType) {
  return async () => ({ Component: pick(await load()) })
}

const today = () => import('../features/today')
const training = () => import('../features/training')
const nutrition = () => import('../features/nutrition')
const progress = () => import('../features/progress')
const me = () => import('../features/me')

/**
 * All routes. The tab routes mirror the tab bar (SPEC §3.1) and each lives in its own
 * feature folder: today/, training/, nutrition/, progress/, me/.
 */
export const router = createBrowserRouter([
  {
    path: '/',
    errorElement: <RouteError />,
    element: (
      <RootGate>
        <LandingPage />
      </RootGate>
    ),
  },
  {
    path: '/welkom',
    errorElement: <RouteError />,
    lazy: page(
      () => import('../features/onboarding'),
      (m) => m.OnboardingPage,
    ),
  },
  {
    path: '/design',
    errorElement: <RouteError />,
    lazy: page(
      () => import('./design/DesignPage'),
      (m) => m.DesignPage,
    ),
  },
  {
    // The five tabs, with the tab bar.
    element: (
      <RequireProfile>
        <AppLayout />
      </RequireProfile>
    ),
    errorElement: <RouteError />,
    children: [
      { path: '/vandaag', lazy: page(today, (m) => m.TodayPage) },

      { path: '/train', lazy: page(training, (m) => m.TrainPage) },
      { path: '/train/routine/:id', lazy: page(training, (m) => m.RoutineEditorPage) },
      { path: '/train/oefeningen', lazy: page(training, (m) => m.LibraryPage) },
      { path: '/train/oefeningen/nieuw', lazy: page(training, (m) => m.CustomExercisePage) },
      { path: '/train/oefeningen/:id', lazy: page(training, (m) => m.ExerciseDetailPage) },
      { path: '/train/geschiedenis', lazy: page(training, (m) => m.HistoryPage) },
      { path: '/train/geschiedenis/:id', lazy: page(training, (m) => m.WorkoutDetailPage) },

      { path: '/voeding', lazy: page(nutrition, (m) => m.NutritionPage) },

      { path: '/progressie', element: <Navigate to="/progressie/overzicht" replace /> },
      { path: '/progressie/oefening/:id', lazy: page(progress, (m) => m.ExerciseProgressPage) },
      { path: '/progressie/spier/:muscle', lazy: page(progress, (m) => m.MuscleProgressPage) },
      { path: '/progressie/:tab', lazy: page(progress, (m) => m.ProgressPage) },

      { path: '/ik', lazy: page(me, (m) => m.MePage) },
      { path: '/ik/credits', lazy: page(me, (m) => m.CreditsPage) },
    ],
  },
  {
    // Full-screen flows without the tab bar.
    element: <RequireProfile />,
    errorElement: <RouteError />,
    children: [
      { path: '/training', lazy: page(training, (m) => m.ActiveWorkoutPage) },
      { path: '/training/klaar/:id', lazy: page(training, (m) => m.WorkoutSummaryPage) },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
])
