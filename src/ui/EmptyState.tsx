import type { ReactNode } from 'react'
import { EmptyBarbell } from './illustrations/EmptyBarbell'

export interface EmptyStateProps {
  title: string
  body: string
  action?: ReactNode
  illustration?: ReactNode
}

/** Designed empty state: illustration, explanation and one action. Never a bare "Geen data". */
export function EmptyState({ title, body, action, illustration }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center px-6 py-10 text-center">
      <div className="mb-5 w-48">{illustration ?? <EmptyBarbell />}</div>
      <h3 className="font-display text-2xl font-bold uppercase">{title}</h3>
      <p className="mt-2 max-w-xs text-muted">{body}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}
