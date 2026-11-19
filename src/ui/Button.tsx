import type { LucideIcon } from 'lucide-react'
import type { ButtonHTMLAttributes } from 'react'
import { cx } from './cx'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'md' | 'lg'

const variants: Record<Variant, string> = {
  primary: 'bg-plate-yellow text-on-accent border border-accent-edge',
  secondary: 'bg-surface-2 text-text border border-line',
  ghost: 'text-accent-text',
  danger: 'text-red-text border border-red-text',
}

const sizes: Record<Size, string> = {
  md: 'min-h-12 px-5 text-xl',
  lg: 'min-h-14 px-6 text-2xl',
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  icon?: LucideIcon
  /** Full width. */
  block?: boolean
}

/** The one button of the app. Labels are short, set in the display font like gym signage. */
export function Button({
  variant = 'primary',
  size = 'md',
  icon: Icon,
  block,
  className,
  type = 'button',
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cx(
        'press inline-flex items-center justify-center gap-2 rounded-md font-display font-bold tracking-wide uppercase',
        variants[variant],
        // Disabled: flat and quiet instead of a washed-out colour.
        'disabled:pointer-events-none disabled:border-line disabled:bg-surface disabled:text-muted',
        sizes[size],
        block && 'w-full',
        className,
      )}
      {...rest}
    >
      {Icon && <Icon aria-hidden size={size === 'lg' ? 24 : 20} strokeWidth={2} />}
      {children}
    </button>
  )
}

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon
  /** Required: icon-only buttons need a name for screen readers. */
  label: string
  filled?: boolean
}

/** Square 44 px icon button. */
export function IconButton({
  icon: Icon,
  label,
  filled,
  className,
  type = 'button',
  ...rest
}: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      className={cx(
        'press inline-flex size-11 shrink-0 items-center justify-center rounded-md',
        filled ? 'border border-line bg-surface-2 text-text' : 'text-text',
        'disabled:pointer-events-none disabled:opacity-40',
        className,
      )}
      {...rest}
    >
      <Icon aria-hidden size={22} strokeWidth={1.75} />
    </button>
  )
}
