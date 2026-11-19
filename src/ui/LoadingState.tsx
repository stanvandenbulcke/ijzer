import { t } from '../i18n'

/** Quiet loading indicator: a bar that slides like a plate on a sleeve. */
export function LoadingState({ label = t.common.loading }: { label?: string }) {
  return (
    <div role="status" className="flex flex-col items-center gap-3 py-16 text-muted">
      <div className="relative h-1 w-24 overflow-hidden rounded-full bg-line">
        <div className="loading-bar absolute inset-y-0 w-8 rounded-full bg-focus" />
      </div>
      <span className="text-sm">{label}</span>
    </div>
  )
}
