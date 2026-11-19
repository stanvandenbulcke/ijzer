import { TriangleExclamationPoint } from 'lucide-react'
import { useId, type InputHTMLAttributes } from 'react'
import { cx } from './cx'

export interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  hint?: string
  error?: string
  /** Unit shown inside the field on the right, e.g. "kg". */
  suffix?: string
}

/** Labelled text input. Label above, hint or error below, linked for screen readers. */
export function TextField({ label, hint, error, suffix, className, id, ...rest }: TextFieldProps) {
  const autoId = useId()
  const inputId = id ?? autoId
  const noteId = `${inputId}-note`
  const note = error ?? hint

  return (
    <div className={cx('flex flex-col gap-1.5', className)}>
      <label htmlFor={inputId} className="text-sm font-semibold text-muted">
        {label}
      </label>
      <div className="relative">
        <input
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={note ? noteId : undefined}
          className={cx(
            'min-h-12 w-full rounded-md border bg-surface px-3 text-text outline-none placeholder:text-muted',
            'focus:border-focus',
            error ? 'border-red-text' : 'border-line-strong',
            suffix && 'pr-12',
          )}
          {...rest}
        />
        {suffix && (
          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-muted">
            {suffix}
          </span>
        )}
      </div>
      {note && (
        <p
          id={noteId}
          className={cx('flex items-start gap-1.5 text-sm', error ? 'text-red-text' : 'text-muted')}
        >
          {error && <TriangleExclamationPoint aria-hidden size={16} className="mt-0.5 shrink-0" />}
          {note}
        </p>
      )}
    </div>
  )
}
