import type { FormEvent, ReactNode } from 'react'
import { Page, PageHeader } from '../../ui/PageHeader'

/** Shared frame for the account screens: title, short text, a form. */
export function AuthLayout({
  title,
  body,
  onSubmit,
  children,
  footer,
}: {
  title: string
  body?: string
  onSubmit: () => void
  children: ReactNode
  footer?: ReactNode
}) {
  const submit = (e: FormEvent) => {
    e.preventDefault()
    onSubmit()
  }
  return (
    <Page tabBar={false}>
      <PageHeader title={title} back="/" />
      {body && <p className="mb-5 text-muted">{body}</p>}
      <form onSubmit={submit} className="flex flex-col gap-5" noValidate>
        {children}
      </form>
      {footer && <div className="mt-6 flex flex-col items-center gap-2">{footer}</div>}
    </Page>
  )
}
