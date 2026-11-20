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
const science = () => import('../features/science')
const auth = () => import('../features/auth')
const wrapped = () => import('../features/wrapped')

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
  // Accounts (SPEC §4.1).
  { path: '/registreren', errorElement: <RouteError />, lazy: page(auth, (m) => m.RegisterPage) },
  { path: '/login', errorElement: <RouteError />, lazy: page(auth, (m) => m.LoginPage) },
  {
    path: '/wachtwoord-vergeten',
    errorElement: <RouteError />,
    lazy: page(auth, (m) => m.ForgotPasswordPage),
  },
  {
    path: '/nieuw-wachtwoord',
    errorElement: <RouteError />,
    lazy: page(auth, (m) => m.NewPasswordPage),
  },
  {
    path: '/account/koppelen',
    errorElement: <RouteError />,
    lazy: page(auth, (m) => m.ClaimDataPage),
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
      { path: '/train/samen', lazy: page(training, (m) => m.TogetherPage) },
      { path: '/train/geschiedenis/:id', lazy: page(training, (m) => m.WorkoutDetailPage) },

      { path: '/voeding', lazy: page(nutrition, (m) => m.NutritionPage) },
      { path: '/voeding/producten', lazy: page(nutrition, (m) => m.FoodsPage) },

      { path: '/progressie', element: <Navigate to="/progressie/overzicht" replace /> },
      { path: '/progressie/oefening/:id', lazy: page(progress, (m) => m.ExerciseProgressPage) },
      { path: '/progressie/spier/:muscle', lazy: page(progress, (m) => m.MuscleProgressPage) },
      { path: '/progressie/:tab', lazy: page(progress, (m) => m.ProgressPage) },

      { path: '/ik', lazy: page(me, (m) => m.MePage) },
      { path: '/ik/credits', lazy: page(me, (m) => m.CreditsPage) },
      { path: '/wetenschap', lazy: page(science, (m) => m.SciencePage) },
      { path: '/wetenschap/:id', lazy: page(science, (m) => m.ArticlePage) },
    ],
  },
  {
    // Full-screen flows without the tab bar.
    element: <RequireProfile />,
    errorElement: <RouteError />,
    children: [
      { path: '/training', lazy: page(training, (m) => m.ActiveWorkoutPage) },
      { path: '/training/klaar/:id', lazy: page(training, (m) => m.WorkoutSummaryPage) },
      { path: '/wrapped/:period', lazy: page(wrapped, (m) => m.WrappedPage) },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
])
