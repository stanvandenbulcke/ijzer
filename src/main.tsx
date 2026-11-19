import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router'
import { setupServiceWorker } from './app/pwa'
import { SyncAgent } from './app/SyncAgent'
import { router } from './app/router'
import { applyTheme, getStoredTheme } from './ui/theme'
import { ToastProvider } from './ui/toast/ToastProvider'
import './ui/tokens.css'

applyTheme(getStoredTheme())
setupServiceWorker()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ToastProvider>
      <SyncAgent />
      <RouterProvider router={router} />
    </ToastProvider>
  </StrictMode>,
)
