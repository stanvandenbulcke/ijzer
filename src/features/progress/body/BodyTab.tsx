import { Scale, Trash2 } from 'lucide-react'
import { useState } from 'react'
import {
  deleteBodyWeight,
  logBodyWeight,
  restoreBodyWeight,
  useBodyWeights,
} from '../../../data/bodyRepo'
import { weeklyRate, weightTrend } from '../../../domain/energy/trend'
import { localDay } from '../../../domain/time'
import { t } from '../../../i18n'
import { formatDayShort, formatNumber } from '../../../i18n/format'
import { Button, IconButton } from '../../../ui/Button'
import { LineChart } from '../../../ui/charts/LineChart'
import { LoadingState } from '../../../ui/LoadingState'
import { useToast } from '../../../ui/toast/toastContext'
import { ValueEntrySheet } from '../../../ui/ValueEntrySheet'
import { Section } from '../Section'
import { ProgressPhotos } from './ProgressPhotos'

const b = t.progress.body

/** Lichaam: weigh-ins as light dots, the trend as a thick line (SPEC §4.6, §5.5). */
export function BodyTab({ fallbackKg }: { fallbackKg: number | null }) {
  const toast = useToast()
  const rows = useBodyWeights()
  const [open, setOpen] = useState(false)
  if (!rows) return <LoadingState />
  const today = localDay(new Date())
  const points = weightTrend(rows.map((r) => ({ day: r.day, kg: r.kg })))
  const rate = weeklyRate(points)
  const sign = (n: number) => `${n > 0 ? '+' : n < 0 ? '−' : ''}${formatNumber(Math.abs(n), 2)}`

  return (
    <>
      <Section title={b.weight} note={points.length >= 2 ? b.trendNote : undefined}>
        {points.length > 0 && (
          <p className="font-display text-5xl font-black">
            {formatNumber(points.at(-1)!.trend, 1)}{' '}
            <span className="font-sans text-lg font-semibold text-muted">{t.common.kg}</span>
          </p>
        )}
        <p className="mb-3 text-sm text-muted">
          {rate
            ? t.today.trend(sign(rate.kgPerWeek), sign(rate.pctPerWeek))
            : t.today.trendTooShort}
        </p>
        {points.length >= 2 ? (
          <LineChart
            label={b.chartLabel}
            unit={t.common.kg}
            decimals={1}
            series={[
              {
                points: points.map((x) => ({ day: x.day, value: x.trend })),
                color: 'var(--plate-yellow)',
                width: 3.5,
              },
              {
                points: points.map((x) => ({ day: x.day, value: x.kg })),
                color: 'var(--text)',
                scatter: true,
              },
            ]}
          />
        ) : (
          <p className="text-muted">{b.empty}</p>
        )}
        <Button icon={Scale} block className="mt-4" onClick={() => setOpen(true)}>
          {b.log}
        </Button>
      </Section>

      {rows.length > 0 && (
        <Section title={b.entries}>
          <ul>
            {[...rows]
              .reverse()
              .slice(0, 30)
              .map((r) => (
                <li key={r.id} className="flex items-center gap-3 border-t border-line py-1">
                  <span className="w-20 text-sm text-muted">{formatDayShort(r.day)}</span>
                  <span className="flex-1 font-display text-xl font-bold">
                    {formatNumber(r.kg, 1)} kg
                  </span>
                  <IconButton
                    icon={Trash2}
                    label={`${t.common.delete} ${formatDayShort(r.day)}`}
                    onClick={async () => {
                      await deleteBodyWeight(r.id)
                      toast({
                        message: b.deleted,
                        action: {
                          label: t.common.undo,
                          onAction: () => void restoreBodyWeight(r.id),
                        },
                      })
                    }}
                  />
                </li>
              ))}
          </ul>
        </Section>
      )}
      <ProgressPhotos />
      <p className="mt-6 text-sm text-muted">{b.measurementsSoon}</p>

      <ValueEntrySheet
        open={open}
        onOpenChange={setOpen}
        title={b.sheetTitle}
        label={b.weight}
        initial={points.at(-1)?.kg ?? fallbackKg}
        unit={t.common.kg}
        step={0.1}
        onSave={(kg) => void logBodyWeight(today, kg)}
      />
    </>
  )
}
