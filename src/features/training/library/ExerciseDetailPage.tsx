import type { ReactNode } from 'react'
import { ExternalLink, Pencil } from 'lucide-react'
import { useNavigate, useParams } from 'react-router'
import { useTrainingData } from '../../../data/useTrainingData'
import { alternatives } from '../../../domain/exercises/search'
import { t } from '../../../i18n'
import { Badge } from '../../../ui/Badge'
import { IconButton } from '../../../ui/Button'
import { MuscleChip } from '../../../ui/Chip'
import { EmptyState } from '../../../ui/EmptyState'
import { ExerciseThumb } from '../../../ui/ExerciseThumb'
import { Flipbook } from '../../../ui/Flipbook'
import { ListRow } from '../../../ui/ListRow'
import { LoadingState } from '../../../ui/LoadingState'
import { involvementFills } from '../../../ui/muscle-map/fills'
import { MuscleMap } from '../../../ui/muscle-map/MuscleMap'
import { Page, PageHeader } from '../../../ui/PageHeader'
import { primaryMuscles } from './exerciseText'
import { ExerciseHistory } from './ExerciseHistory'

const l = t.training.lib

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="mb-3 border-b border-line pb-1.5 font-display text-2xl font-bold uppercase">
        {title}
      </h2>
      {children}
    </section>
  )
}

/** /train/oefeningen/:id — everything about one exercise (SPEC §4.2). */
export function ExerciseDetailPage() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const data = useTrainingData()

  if (data === undefined) return <LoadingState />
  const exercise = data?.library.byId(id)
  if (!data || !exercise) {
    return (
      <Page>
        <PageHeader title={l.title} back />
        <EmptyState title={t.notFound.title} body={t.notFound.body} />
      </Page>
    )
  }

  const youtube = `https://www.youtube.com/results?search_query=${encodeURIComponent(`${exercise.name} form`)}`
  const alts = alternatives(data.library.exercises, exercise, undefined, 6)
  const direct = exercise.muscles.filter((m) => m.weight === 1)
  const indirect = exercise.muscles.filter((m) => m.weight !== 1)

  return (
    <Page>
      <PageHeader
        title={exercise.name}
        back
        actions={
          exercise.custom ? (
            <IconButton
              icon={Pencil}
              label={t.common.edit}
              filled
              onClick={() =>
                navigate(`/train/oefeningen/nieuw?bewerk=${encodeURIComponent(exercise.id)}`)
              }
            />
          ) : undefined
        }
      />
      {exercise.hasImages && <Flipbook exerciseId={exercise.id} name={exercise.name} />}

      <div className="mt-4 flex flex-wrap gap-2">
        <Badge tone="muted">{t.training.equipment[exercise.equipment]}</Badge>
        <Badge tone="muted">{t.training.types[exercise.type]}</Badge>
        {exercise.custom && <Badge tone="info">{l.custom}</Badge>}
        {exercise.lengthened && <Badge tone="success">{l.lengthened}</Badge>}
      </div>

      <Block title={l.muscles}>
        <div className="flex items-start gap-4">
          <MuscleMap
            size="md"
            fills={involvementFills(exercise.muscles)}
            label={`${l.primary}: ${primaryMuscles(exercise)}`}
          />
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold tracking-widest text-muted uppercase">
                {l.primary}
              </span>
              {direct.map((m) => (
                <MuscleChip key={m.muscle} muscle={m.muscle} />
              ))}
            </div>
            {indirect.length > 0 && (
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold tracking-widest text-muted uppercase">
                  {l.secondary}
                </span>
                {indirect.map((m) => (
                  <MuscleChip key={m.muscle} muscle={m.muscle} secondary />
                ))}
              </div>
            )}
          </div>
        </div>
        {exercise.quality === 'auto' && <p className="mt-3 text-sm text-muted">{l.autoMapping}</p>}
      </Block>

      {exercise.lengthened && (
        <Block title={l.scienceNote}>
          <p className="selectable">{l.lengthenedNote}</p>
        </Block>
      )}

      {exercise.instructions.length > 0 && (
        <Block title={l.instructions}>
          <ol className="selectable flex flex-col gap-3">
            {exercise.instructions.map((step, i) => (
              <li key={i} className="flex gap-3">
                <span className="w-5 shrink-0 font-display text-xl leading-6 font-bold text-accent-text">
                  {i + 1}
                </span>
                <span lang="en">{step}</span>
              </li>
            ))}
          </ol>
          {!exercise.custom && <p className="mt-3 text-sm text-muted">{l.instructionsNote}</p>}
        </Block>
      )}

      <a
        href={youtube}
        target="_blank"
        rel="noopener noreferrer"
        className="press mt-6 flex min-h-12 items-center justify-center gap-2 rounded-md border border-line bg-surface-2 font-display text-xl font-bold tracking-wide uppercase"
      >
        <ExternalLink aria-hidden size={20} />
        {l.youtube}
      </a>

      <Block title={l.yourHistory}>
        <ExerciseHistory exercise={exercise} perfs={data.perfsOf(exercise.id)} />
      </Block>

      {alts.length > 0 && (
        <Block title={l.alternatives}>
          <div className="border-t border-line">
            {alts.map((alt) => (
              <ListRow
                key={alt.id}
                title={alt.name}
                subtitle={primaryMuscles(alt)}
                leading={<ExerciseThumb exercise={alt} />}
                onClick={() => navigate(`/train/oefeningen/${encodeURIComponent(alt.id)}`)}
              />
            ))}
          </div>
        </Block>
      )}
    </Page>
  )
}
