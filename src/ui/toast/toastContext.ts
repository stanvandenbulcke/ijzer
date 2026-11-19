import { createContext, useContext } from 'react'

export interface ToastOptions {
  message: string
  /** Optional action, typically "Ongedaan maken". */
  action?: { label: string; onAction: () => void }
  /** Milliseconds before it disappears. Default 5 s: long enough to tap undo. */
  duration?: number
}

export const ToastContext = createContext<((options: ToastOptions) => void) | null>(null)

/** Shows a short message at the bottom of the screen. */
export function useToast(): (options: ToastOptions) => void {
  const show = useContext(ToastContext)
  if (!show) throw new Error('useToast must be used inside <ToastProvider>')
  return show
}
