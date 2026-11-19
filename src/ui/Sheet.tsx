import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import type { ReactNode } from 'react'
import { t } from '../i18n'
import { IconButton } from './Button'

export interface SheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children: ReactNode
}

/**
 * Bottom sheet: slides up from the thumb zone. Built on Radix Dialog for focus
 * trapping, Escape and screen-reader semantics; styling is entirely our own.
 */
export function Sheet({ open, onOpenChange, title, description, children }: SheetProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="anim-backdrop fixed inset-0 z-40 bg-[rgb(0_0_0/0.6)]" />
        <Dialog.Content className="anim-sheet fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[92dvh] max-w-md flex-col rounded-t-lg border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] outline-none">
          <div aria-hidden className="mx-auto mt-2 h-1 w-9 rounded-full bg-line-strong" />
          <div className="flex items-center gap-2 px-4 pt-1">
            <Dialog.Title className="flex-1 font-display text-2xl font-bold uppercase">
              {title}
            </Dialog.Title>
            <Dialog.Close asChild>
              <IconButton icon={X} label={t.common.close} />
            </Dialog.Close>
          </div>
          {description ? (
            <Dialog.Description className="px-4 text-muted">{description}</Dialog.Description>
          ) : (
            <Dialog.Description className="sr-only">{title}</Dialog.Description>
          )}
          <div className="overflow-y-auto px-4 pt-3 pb-4">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
