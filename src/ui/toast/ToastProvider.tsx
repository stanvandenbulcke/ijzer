import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { t } from '../../i18n'
import { ToastContext, type ToastOptions } from './toastContext'

interface ActiveToast extends ToastOptions {
  id: number
}

let nextId = 0

/** Holds the single visible toast. A new toast replaces the current one. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ActiveToast | null>(null)

  const show = useCallback((options: ToastOptions) => setToast({ ...options, id: ++nextId }), [])

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(null), toast.duration ?? 5000)
    return () => window.clearTimeout(timer)
  }, [toast])

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div
        role="status"
        aria-live="polite"
        aria-label={t.common.notifications}
        className="pointer-events-none fixed inset-x-0 z-50 mx-auto max-w-md px-4"
        style={{ bottom: 'calc(env(safe-area-inset-bottom) + 5.5rem)' }}
      >
        {toast && (
          <div
            key={toast.id}
            className="anim-toast pointer-events-auto flex min-h-14 items-center gap-3 rounded-md border border-line-strong bg-surface-2 py-2 pr-2 pl-4"
          >
            <span className="flex-1">{toast.message}</span>
            {toast.action && (
              <button
                type="button"
                onClick={() => {
                  // Close first: the action may show a follow-up toast.
                  setToast(null)
                  toast.action?.onAction()
                }}
                className="press min-h-11 shrink-0 rounded-md px-3 font-semibold text-accent-text"
              >
                {toast.action.label}
              </button>
            )}
          </div>
        )}
      </div>
    </ToastContext.Provider>
  )
}
