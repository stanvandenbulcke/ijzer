import { t } from '../../../i18n'
import { isStandalone } from '../../../ui/standalone'

export function InstallStep() {
  if (isStandalone()) return <p className="text-green-text">{t.onboarding.install.done}</p>
  return (
    <ol className="space-y-3">
      {t.landing.installSteps.map((step, i) => (
        <li key={step} className="flex items-baseline gap-4">
          <span className="w-6 font-display text-3xl leading-none font-black text-accent-text">
            {i + 1}
          </span>
          <span>{step}</span>
        </li>
      ))}
    </ol>
  )
}
