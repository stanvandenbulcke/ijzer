import type { ReactNode } from 'react'
import { BookOpen, ChevronRight, Download, Info, Trash2, UserRound } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { APP_VERSION } from '../../app/config'
import { exportAll, wipeAll } from '../../data/exportData'
import { saveProfile, useProfile } from '../../data/profileRepo'
import type { Settings } from '../../domain/profile/types'
import { t } from '../../i18n'
import { formatDuration } from '../../i18n/format'
import { Button } from '../../ui/Button'
import { Chip } from '../../ui/Chip'
import { ListRow } from '../../ui/ListRow'
import { LoadingState } from '../../ui/LoadingState'
import { Page, PageHeader } from '../../ui/PageHeader'
import { Sheet } from '../../ui/Sheet'
import { TextField } from '../../ui/TextField'
import { downloadBlob } from '../../ui/download'
import { applyTheme, getStoredTheme, type Theme } from '../../ui/theme'
import { useToast } from '../../ui/toast/toastContext'
import { AccountSection } from './AccountSection'

const m = t.me

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="mb-3 border-b border-line pb-1.5 font-display text-2xl font-bold uppercase">
        {title}
      </h2>
      <div className="flex flex-col gap-5">{children}</div>
    </section>
  )
}

function Choice<T extends string | number | boolean>({
  label,
  value,
  options,
  onPick,
  format,
}: {
  label: string
  value: T
  options: T[]
  onPick: (v: T) => void
  format: (v: T) => string
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-semibold text-muted">{label}</span>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <Chip key={String(o)} selected={o === value} onClick={() => onPick(o)}>
            {format(o)}
          </Chip>
        ))}
      </div>
    </div>
  )
}

/** /ik — profile, settings, your data and credits (SPEC §4.11). */
export function MePage() {
  const navigate = useNavigate()
  const toast = useToast()
  const profile = useProfile()
  const [theme, setTheme] = useState<Theme>(getStoredTheme)
  const [wiping, setWiping] = useState(false)
  const [confirm, setConfirm] = useState('')
  if (!profile) return <LoadingState />

  const setSetting = (changes: Partial<Settings>) =>
    void saveProfile({ settings: { ...profile.settings, ...changes } })
  const onOff = (v: boolean) => (v ? m.on : m.off)

  const download = async () => {
    downloadBlob(await exportAll(), `iron-export-${new Date().toISOString().slice(0, 10)}.json`)
    toast({ message: m.exportDone })
  }

  return (
    <Page>
      <PageHeader title={m.title} />
      <div className="border-t border-line">
        <ListRow
          title={profile.name || m.editProfile}
          subtitle={`${m.goals[profile.goal]} · ${m.editProfileHint}`}
          leading={<UserRound aria-hidden />}
          onClick={() => navigate('/welkom?terug=/ik')}
        />
      </div>

      <Group title={m.settings}>
        <Choice
          label={m.theme}
          value={theme}
          options={['dark', 'light'] as Theme[]}
          format={(v) => (v === 'dark' ? m.themeDark : m.themeLight)}
          onPick={(v) => {
            setTheme(v)
            applyTheme(v)
          }}
        />
        <Choice
          label={m.restCompound}
          value={profile.settings.restCompoundSec}
          options={[90, 120, 150, 180, 240]}
          format={formatDuration}
          onPick={(v) => setSetting({ restCompoundSec: v })}
        />
        <Choice
          label={m.restIsolation}
          value={profile.settings.restIsolationSec}
          options={[60, 75, 90, 120]}
          format={formatDuration}
          onPick={(v) => setSetting({ restIsolationSec: v })}
        />
        <Choice
          label={m.wakeLock}
          value={profile.settings.wakeLock}
          options={[true, false]}
          format={onOff}
          onPick={(v) => setSetting({ wakeLock: v })}
        />
        <Choice
          label={m.restSound}
          value={profile.settings.restSound}
          options={[true, false]}
          format={onOff}
          onPick={(v) => setSetting({ restSound: v })}
        />
      </Group>

      <Group title={m.account}>
        <AccountSection />
      </Group>

      <Group title={m.data}>
        <Button variant="secondary" icon={Download} block onClick={() => void download()}>
          {m.export}
        </Button>
        <Button variant="danger" icon={Trash2} block onClick={() => setWiping(true)}>
          {m.wipe}
        </Button>
      </Group>

      <Group title={m.about}>
        <div className="border-t border-line">
          <ListRow
            title={m.science}
            subtitle={m.scienceHint}
            leading={<BookOpen aria-hidden />}
            onClick={() => navigate('/wetenschap')}
          />
          <ListRow
            title={m.credits}
            leading={<Info aria-hidden />}
            onClick={() => navigate('/ik/credits')}
          />
          <ListRow
            title={m.design}
            leading={<ChevronRight aria-hidden />}
            onClick={() => navigate('/design')}
          />
        </div>
        <p className="text-sm text-muted">{m.version(APP_VERSION)}</p>
      </Group>

      <Sheet open={wiping} onOpenChange={setWiping} title={m.wipe}>
        <div className="flex flex-col gap-3">
          <TextField
            label={m.wipeConfirm}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoCapitalize="characters"
          />
          <Button
            variant="danger"
            block
            disabled={confirm.trim().toUpperCase() !== m.wipeWord}
            onClick={async () => {
              await wipeAll()
              window.location.assign('/')
            }}
          >
            {m.wipe}
          </Button>
        </div>
      </Sheet>
    </Page>
  )
}
