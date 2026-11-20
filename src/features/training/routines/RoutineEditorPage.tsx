import { CopyPlus, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useExerciseLibrary, type ExerciseLibrary } from '../../../data/catalog'
import { useProfile } from '../../../data/profileRepo'
import { newId } from '../../../data/rows'
import {
  copyRoutine,
  deleteRoutine,
  restoreRoutine,
  saveRoutine,
  useRoutine,
} from '../../../data/routinesRepo'
import { defaultRestSec } from '../../../domain/profile/defaults'
import type { Profile } from '../../../domain/profile/types'
import {
  blankRoutine,
  duplicateExercise,
  moveExercise,
  newRoutineExercise,
  toggleSupersetWithNext,
} from '../../../domain/training/routineEdit'
import type { Routine, RoutineColor } from '../../../domain/training/types'
import { t } from '../../../i18n'
import { Button, IconButton } from '../../../ui/Button'
import { cx } from '../../../ui/cx'
import { LoadingState } from '../../../ui/LoadingState'
import { Page, PageHeader } from '../../../ui/PageHeader'
import { TextField } from '../../../ui/TextField'
import { useToast } from '../../../ui/toast/toastContext'
import { ExercisePickerSheet } from '../library/ExercisePickerSheet'
import { routineColor } from './routineColors'
import { RoutineExerciseEditor } from './RoutineExerciseEditor'
import { VolumePreview } from './VolumePreview'

const e = t.training.editor
const COLORS: RoutineColor[] = ['yellow', 'red', 'blue', 'green', 'white']

/** /train/routine/:id ("nieuw" for a new one) — the routine builder (SPEC §4.3). */
export function RoutineEditorPage() {
  const { id = 'nieuw' } = useParams()
  const isNew = id === 'nieuw'
  const stored = useRoutine(isNew ? undefined : id)
  const library = useExerciseLibrary()
  const profile = useProfile()
  if (!library || !profile || (!isNew && stored === undefined)) return <LoadingState />
  if (!isNew && stored === null) return <LoadingState label={t.notFound.title} />
  return (
    <RoutineEditor
      key={stored?.id ?? 'new'}
      initial={stored ?? blankRoutine(newId())}
      isNew={isNew}
      library={library}
      profile={profile}
    />
  )
}

function RoutineEditor({
  initial,
  isNew,
  library,
  profile,
}: {
  initial: Routine
  isNew: boolean
  library: ExerciseLibrary
  profile: Profile
}) {
  const navigate = useNavigate()
  const toast = useToast()
  const [draft, setDraft] = useState<Routine>(initial)
  const [picking, setPicking] = useState(false)
  const [nameError, setNameError] = useState<string>()

  const update = (next: Routine) => setDraft(next)

  const save = async () => {
    if (!draft.name.trim()) {
      setNameError(e.nameRequired)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    await saveRoutine({ ...draft, name: draft.name.trim() })
    toast({ message: e.saved })
    navigate('/train', { replace: true })
  }

  const remove = async () => {
    await deleteRoutine(draft.id)
    toast({
      message: e.deleted,
      action: { label: t.common.undo, onAction: () => void restoreRoutine(draft.id) },
    })
    navigate('/train', { replace: true })
  }

  const duplicate = async () => {
    const copy = copyRoutine(draft, e.copyName(draft.name))
    await saveRoutine(copy)
    navigate(`/train/routine/${copy.id}`, { replace: true })
  }

  return (
    <Page>
      <PageHeader
        title={isNew ? e.newTitle : e.editTitle}
        back="/train"
        actions={
          !isNew && (
            <IconButton
              icon={CopyPlus}
              label={e.duplicateRoutine}
              onClick={() => void duplicate()}
            />
          )
        }
      />
      <div className="flex flex-col gap-5">
        <TextField
          label={e.name}
          placeholder={e.namePlaceholder}
          value={draft.name}
          error={nameError}
          onChange={(ev) => {
            setNameError(undefined)
            update({ ...draft, name: ev.target.value })
          }}
        />
        <div className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-muted">{e.color}</span>
          <div role="radiogroup" aria-label={e.color} className="flex gap-2">
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                role="radio"
                aria-checked={draft.color === c}
                aria-label={c}
                onClick={() => update({ ...draft, color: c })}
                className={cx(
                  'press size-11 rounded-full border-4',
                  routineColor[c],
                  draft.color === c ? 'border-focus' : 'border-bg',
                )}
              />
            ))}
          </div>
        </div>
        <TextField
          label={e.folder}
          placeholder={e.folderPlaceholder}
          value={draft.folder ?? ''}
          onChange={(ev) => update({ ...draft, folder: ev.target.value || null })}
        />
      </div>

      <h2 className="mt-8 mb-3 border-b border-line pb-1.5 font-display text-2xl font-bold uppercase">
        {e.exercises}
      </h2>
      {draft.exercises.length === 0 && <p className="mb-3 text-muted">{e.noExercises}</p>}
      <div className="flex flex-col gap-3">
        {draft.exercises.map((item, i) => (
          <RoutineExerciseEditor
            key={item.id}
            item={item}
            exercise={library.byId(item.exerciseId)}
            index={i}
            count={draft.exercises.length}
            linkedToNext={
              item.supersetGroup !== null &&
              item.supersetGroup === draft.exercises[i + 1]?.supersetGroup
            }
            onChange={(next) =>
              update({
                ...draft,
                exercises: draft.exercises.map((x) => (x.id === next.id ? next : x)),
              })
            }
            onMove={(delta) => update(moveExercise(draft, i, delta))}
            onDuplicate={() => update(duplicateExercise(draft, i, newId))}
            onToggleSuperset={() => update(toggleSupersetWithNext(draft, i, newId))}
            onRemove={() =>
              update({ ...draft, exercises: draft.exercises.filter((x) => x.id !== item.id) })
            }
          />
        ))}
      </div>
      <Button
        variant="secondary"
        icon={Plus}
        block
        className="mt-3"
        onClick={() => setPicking(true)}
      >
        {e.addExercise}
      </Button>

      <h2 className="mt-8 mb-3 border-b border-line pb-1.5 font-display text-2xl font-bold uppercase">
        {e.volumePreview}
      </h2>
      <VolumePreview routine={draft} byId={library.byId} />

      <div className="mt-8 flex flex-col gap-3">
        <Button size="lg" block onClick={() => void save()}>
          {e.save}
        </Button>
        {!isNew && (
          <Button variant="danger" icon={Trash2} block onClick={() => void remove()}>
            {e.deleteRoutine}
          </Button>
        )}
      </div>

      <ExercisePickerSheet
        open={picking}
        onOpenChange={setPicking}
        title={e.addExercise}
        onPick={(exercise) =>
          update({
            ...draft,
            exercises: [
              ...draft.exercises,
              newRoutineExercise(newId(), exercise.id, {
                compound: exercise.mechanic === 'compound',
                restSec: defaultRestSec(exercise.mechanic, profile),
              }),
            ],
          })
        }
      />
    </Page>
  )
}
