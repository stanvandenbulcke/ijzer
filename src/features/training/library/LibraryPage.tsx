import { Plus } from 'lucide-react'
import { useNavigate } from 'react-router'
import { useExerciseLibrary } from '../../../data/catalog'
import { t } from '../../../i18n'
import { Button, IconButton } from '../../../ui/Button'
import { EmptyState } from '../../../ui/EmptyState'
import { LoadingState } from '../../../ui/LoadingState'
import { Page, PageHeader } from '../../../ui/PageHeader'
import { ExerciseFilters } from './ExerciseFilters'
import { ExerciseList } from './ExerciseList'
import { useExerciseSearch } from './useExerciseSearch'

const l = t.training.lib

/** /train/oefeningen — the whole library: search, filter, open an exercise. */
export function LibraryPage() {
  const navigate = useNavigate()
  const library = useExerciseLibrary()
  const search = useExerciseSearch(library?.exercises)

  return (
    <Page>
      <PageHeader
        title={l.title}
        back="/train"
        actions={
          <IconButton
            icon={Plus}
            label={l.newCustom}
            filled
            onClick={() => navigate('/train/oefeningen/nieuw')}
          />
        }
      />
      {library === undefined && <LoadingState />}
      {library === null && (
        <EmptyState
          title={l.loadError.title}
          body={l.loadError.body}
          action={<Button onClick={() => window.location.reload()}>{t.common.retry}</Button>}
        />
      )}
      {library && (
        <>
          <div className="mb-4 rounded-md border border-line bg-surface p-3">
            <p className="text-sm text-muted">{l.createCustomHint}</p>
            <Button
              icon={Plus}
              block
              className="mt-2"
              onClick={() => navigate('/train/oefeningen/nieuw')}
            >
              {l.createCustom}
            </Button>
          </div>
          <ExerciseFilters
            query={search.query}
            onQuery={search.setQuery}
            filter={search.filter}
            onFilter={search.setFilter}
          />
          <p className="mt-4 mb-1 text-sm text-muted">{l.count(search.results.length)}</p>
          {search.results.length === 0 ? (
            <EmptyState
              title={l.noResults.title}
              body={l.noResults.body}
              action={
                <Button
                  variant="secondary"
                  icon={Plus}
                  onClick={() =>
                    navigate(
                      `/train/oefeningen/nieuw?naam=${encodeURIComponent(search.query.trim())}`,
                    )
                  }
                >
                  {search.query.trim() ? l.createNamed(search.query.trim()) : l.createCustom}
                </Button>
              }
            />
          ) : (
            <ExerciseList
              key={`${search.query}|${search.filter.muscle}|${search.filter.equipment}`}
              exercises={search.results}
              onSelect={(e) => navigate(`/train/oefeningen/${encodeURIComponent(e.id)}`)}
            />
          )}
        </>
      )}
    </Page>
  )
}
