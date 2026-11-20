import { Share2, X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useMemo, useState, type ComponentType } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useTrainingData } from '../../data/useTrainingData'
import { computeWrapped } from '../../domain/training/wrapped'
import { t } from '../../i18n'
import { formatDayShort, formatNumber, formatPeriod } from '../../i18n/format'
import { Button, IconButton } from '../../ui/Button'
import { LoadingState } from '../../ui/LoadingState'
import { renderShareCard, shareImage } from '../../ui/share/shareCard'
import {
  BestWeekSlide,
  FavoritesSlide,
  IntroSlide,
  RecordsSlide,
  TonnageSlide,
  WorkoutsSlide,
  type SlideContext,
} from './slides'

const w = t.wrapped
const VALID = /^\d{4}(-(0[1-9]|1[0-2]))?$/

/** /wrapped/:period — your month or year as a story: tap right for next, left for back. */
export function WrappedPage() {
  const navigate = useNavigate()
  const { period = '' } = useParams()
  const data = useTrainingData()
  const [index, setIndex] = useState(0)
  const valid = VALID.test(period)

  const context = useMemo<SlideContext | null>(() => {
    if (!data || !valid) return null
    const label = formatPeriod(period)
    return {
      data: computeWrapped(data.workouts, data.library.byId, period),
      title: /^\d{4}$/.test(period) ? w.yearTitle(label) : w.monthTitle(label),
      name: (id) => data.library.byId(id)?.name ?? id,
      byId: data.library.byId,
    }
  }, [data, period, valid])

  const close = () => (window.history.length > 1 ? navigate(-1) : navigate('/progressie'))
  if (data === undefined) return <LoadingState />
  if (!context) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-4 px-4">
        <p className="text-xl">{w.empty}</p>
        <Button onClick={close}>{w.close}</Button>
      </main>
    )
  }

  const slides: Array<ComponentType<SlideContext>> =
    context.data.workouts === 0
      ? [IntroSlide]
      : [
          IntroSlide,
          WorkoutsSlide,
          TonnageSlide,
          RecordsSlide,
          FavoritesSlide,
          ...(context.data.bestWeek ? [BestWeekSlide] : []),
        ]
  const total = slides.length + 1 // + outro
  const go = (delta: number) => setIndex((i) => Math.min(total - 1, Math.max(0, i + delta)))
  const Slide = slides[index]

  const share = async () => {
    const blob = await renderShareCard({
      appName: 'IRON',
      title: context.title,
      date: `${formatDayShort(context.data.from)} – ${formatDayShort(context.data.to)}`,
      stats: [
        { label: w.shareStats.workouts, value: String(context.data.workouts) },
        { label: w.shareStats.tonnage, value: formatNumber(context.data.tonnageKg / 1000, 1) },
        { label: w.shareStats.days, value: String(context.data.activeDays) },
      ],
      prLine: context.data.topPrs[0]
        ? `${context.name(context.data.topPrs[0].exerciseId)} ${formatNumber(context.data.topPrs[0].weightKg, 2)} × ${context.data.topPrs[0].reps}`
        : null,
    })
    if (blob) await shareImage(blob, `iron-${period}.png`, w.shareTitle(context.title))
  }

  return (
    <main className="relative mx-auto flex min-h-dvh max-w-md flex-col overflow-hidden bg-bg px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))]">
      <div className="knurling pointer-events-none absolute inset-0" aria-hidden />
      <div className="relative z-10 flex items-center gap-3">
        <div className="flex flex-1 gap-1" aria-label={w.slideOf(index + 1, total)} role="status">
          {Array.from({ length: total }, (_, i) => (
            <span key={i} className="h-1 flex-1 overflow-hidden rounded-full bg-line">
              <span
                className="block h-full bg-plate-yellow transition-[width] duration-300"
                style={{ width: i <= index ? '100%' : '0%' }}
              />
            </span>
          ))}
        </div>
        <IconButton icon={X} label={w.close} onClick={close} />
      </div>

      {/* Tap zones: left third goes back, the rest goes forward (like stories). */}
      <button
        type="button"
        aria-label={w.previous}
        className="absolute inset-y-0 left-0 z-0 w-1/3"
        onClick={() => go(-1)}
      />
      <button
        type="button"
        aria-label={w.next}
        className="absolute inset-y-0 right-0 z-0 w-2/3"
        onClick={() => go(1)}
      />

      <div className="pointer-events-none relative z-[1] flex flex-1 flex-col justify-center py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.25 }}
          >
            {Slide ? (
              <Slide {...context} />
            ) : (
              <div className="flex flex-col gap-3">
                <p className="font-display text-6xl leading-none font-black uppercase">
                  {w.outroTitle}
                </p>
                <p className="text-xl text-muted">{w.outroBody}</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
      {!Slide && (
        <div className="relative z-10">
          <Button size="lg" block icon={Share2} onClick={() => void share()}>
            {w.share}
          </Button>
        </div>
      )}
    </main>
  )
}
