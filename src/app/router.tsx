import { createBrowserRouter } from 'react-router'
import { LandingPage } from '../features/landing/LandingPage'
import { NotFoundPage } from './NotFoundPage'
import { RouteError } from './RouteError'

/**
 * All routes of the app. Routes mirror the tabs (SPEC §3.1); the tab routes
 * (/vandaag, /train, /voeding, /progressie, /ik) are added in phase 1.
 */
export const router = createBrowserRouter([
  { path: '/', element: <LandingPage />, errorElement: <RouteError /> },
  { path: '*', element: <NotFoundPage /> },
])
