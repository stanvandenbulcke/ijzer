import { MotionConfig } from 'motion/react'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router'
import { setupServiceWorker } from './app/pwa'
import { requestPersistentStorage } from './data/db'
import { LiveAgent } from './app/LiveAgent'
import { SyncAgent } from './app/SyncAgent'
import { router } from './app/router'
import { applyTheme, getStoredTheme } from './ui/theme'
import { ToastProvider } from './ui/toast/ToastProvider'
import './ui/tokens.css'

applyTheme(getStoredTheme())
setupServiceWorker()
// Ask on every start: iOS may only grant it once the app is on the home screen.
void requestPersistentStorage()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* Animations follow the iPhone setting "Beperk beweging". */}
    <MotionConfig reducedMotion="user">
      <ToastProvider>
        <SyncAgent />
        <LiveAgent />
        <RouterProvider router={router} />
      </ToastProvider>
    </MotionConfig>
  </StrictMode>,
)
