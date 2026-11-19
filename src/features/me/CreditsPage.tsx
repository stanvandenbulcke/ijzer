import { t } from '../../i18n'
import { Page, PageHeader } from '../../ui/PageHeader'

/** /ik/credits — licences of everything we use (SPEC §4.2, §4.11). */
export function CreditsPage() {
  return (
    <Page>
      <PageHeader title={t.me.creditsTitle} back="/ik" />
      <dl className="selectable flex flex-col gap-4">
        {t.me.creditsItems.map(([title, body]) => (
          <div key={title} className="border-t border-line pt-3">
            <dt className="font-semibold">{title}</dt>
            <dd className="text-muted">{body}</dd>
          </div>
        ))}
      </dl>
    </Page>
  )
}
