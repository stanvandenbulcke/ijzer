import { useNavigate, useSearchParams } from 'react-router'
import { useExerciseLibrary } from '../../../data/catalog'
import { deleteCustomExercise } from '../../../data/customExercisesRepo'
import { t } from '../../../i18n'
import { LoadingState } from '../../../ui/LoadingState'
import { Page, PageHeader } from '../../../ui/PageHeader'
import { useToast } from '../../../ui/toast/toastContext'
import { CustomExerciseForm } from './CustomExerciseForm'

const f = t.training.customForm

/** /train/oefeningen/nieuw — your own ("niche") exercise; ?bewerk=<id> edits one, ?naam= prefills. */
export function CustomExercisePage() {
  const navigate = useNavigate()
  const toast = useToast()
  const [params] = useSearchParams()
  const editId = params.get('bewerk')
  const library = useExerciseLibrary()
  if (editId && library === undefined) return <LoadingState />
  const existing = editId ? library?.byId(editId) : undefined
  const initial = existing?.custom ? existing : null

  return (
    <Page>
      <PageHeader title={f.title} back />
      <CustomExerciseForm
        key={initial?.id ?? 'new'}
        initial={initial}
        initialName={params.get('naam') ?? ''}
        onSaved={(exercise) => {
          toast({ message: f.saved })
          navigate(`/train/oefeningen/${encodeURIComponent(exercise.id)}`, { replace: true })
        }}
        onDelete={
          initial
            ? async () => {
                await deleteCustomExercise(initial.id)
                toast({ message: f.deleted })
                navigate('/train/oefeningen', { replace: true })
              }
            : undefined
        }
      />
    </Page>
  )
}
