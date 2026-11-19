import { Plus } from 'lucide-react'
import { t } from '../../i18n'
import { Button } from '../../ui/Button'
import { EmptyState } from '../../ui/EmptyState'
import { useToast } from '../../ui/toast/toastContext'
import { Caption, Section } from './Section'

const d = t.design

export function FeedbackSection({ index }: { index: number }) {
  const toast = useToast()
  const show = () =>
    toast({
      message: d.toast.message,
      action: {
        label: t.common.undo,
        onAction: () => toast({ message: d.toast.undone, duration: 2000 }),
      },
    })

  return (
    <Section index={index} title={d.sections.feedback}>
      <Button variant="secondary" onClick={show} block>
        {d.toast.show}
      </Button>
      <div className="rounded-md border border-line">
        <EmptyState
          title={d.empty.title}
          body={d.empty.body}
          action={<Button icon={Plus}>{d.empty.action}</Button>}
        />
      </div>
      <div>
        <Caption>{d.knurling}</Caption>
        <div className="relative h-24 overflow-hidden rounded-md border border-line bg-surface">
          <div aria-hidden className="knurling absolute inset-0 !opacity-[0.08]" />
        </div>
      </div>
    </Section>
  )
}
