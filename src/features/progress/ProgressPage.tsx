import { Navigate, useNavigate, useParams } from 'react-router'
import { useProfile } from '../../data/profileRepo'
import { useTrainingData } from '../../data/useTrainingData'
import { localDay } from '../../domain/time'
import { t } from '../../i18n'
import { EmptyState } from '../../ui/EmptyState'
import { LoadingState } from '../../ui/LoadingState'
import { Page, PageHeader } from '../../ui/PageHeader'
import { SubTabs } from '../../ui/SubTabs'
import { AnalysisTab } from './analysis/AnalysisTab'
import { BodyTab } from './body/BodyTab'
import { ExercisesTab } from './exercises/ExercisesTab'
import { MusclesTab } from './muscles/MusclesTab'
import { OverviewTab } from './overview/OverviewTab'
import { StepsTab } from './steps/StepsTab'

const TABS = ['overzicht', 'oefeningen', 'spiergroepen', 'lichaam', 'stappen', 'analyse'] as const
type Tab = (typeof TABS)[number]

/** /progressie/:tab — six sub-tabs, each in its own folder (SPEC §4.8). */
export function ProgressPage() {
  const { tab = 'overzicht' } = useParams()
  const navigate = useNavigate()
  const data = useTrainingData()
  const profile = useProfile()
  if (!(TABS as readonly string[]).includes(tab))
    return <Navigate to="/progressie/overzicht" replace />
  const current = tab as Tab
  const today = localDay(new Date())
  const needsTraining = current !== 'lichaam' && current !== 'stappen'

  return (
    <Page>
      <PageHeader title={t.progress.title} />
      <SubTabs
        label={t.progress.tabsLabel}
        tabs={TABS.map((id) => ({ id, label: t.progress.tabs[id] }))}
        value={current}
        onChange={(id) => navigate(`/progressie/${id}`, { replace: true })}
      />
      {needsTraining && (data === undefined || !profile) && <LoadingState />}
      {needsTraining && data && profile && data.perfs.length === 0 && (
        <EmptyState title={t.progress.empty.title} body={t.progress.empty.body} />
      )}
      {data && profile && data.perfs.length > 0 && (
        <>
          {current === 'overzicht' && (
            <OverviewTab data={data} today={today} goalPerWeek={profile.trainingDaysPerWeek} />
          )}
          {current === 'oefeningen' && <ExercisesTab data={data} />}
          {current === 'spiergroepen' && <MusclesTab data={data} today={today} />}
          {current === 'analyse' && (
            <AnalysisTab data={data} today={today} cutting={profile.goal === 'cut'} />
          )}
        </>
      )}
      {current === 'lichaam' && <BodyTab fallbackKg={profile?.weightKg ?? null} />}
      {current === 'stappen' && <StepsTab />}
    </Page>
  )
}
