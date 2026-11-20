import { Pause, Play, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { PhotoRow } from '../../../data/db'
import { t } from '../../../i18n'
import { formatDayLong } from '../../../i18n/format'
import { Chip } from '../../../ui/Chip'
import { IconButton } from '../../../ui/Button'

const p = t.progress.photos
const SPEEDS = [800, 400, 200] as const

/** Your progress photos one after the other, full screen, with the date (Stan's idea #4). */
export function Timelapse({
  photos,
  urls,
  onClose,
}: {
  photos: PhotoRow[]
  urls: Map<string, string>
  onClose: () => void
}) {
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(true)
  const [speed, setSpeed] = useState<(typeof SPEEDS)[number]>(400)
  useEffect(() => {
    if (!playing) return undefined
    const id = window.setInterval(() => setIndex((i) => (i + 1) % photos.length), speed)
    return () => window.clearInterval(id)
  }, [playing, speed, photos.length])
  const photo = photos[index]
  if (!photo) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={p.timelapse}
      className="fixed inset-0 z-50 flex flex-col bg-bg px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))]"
    >
      <div className="flex items-center gap-2">
        <p className="flex-1 font-display text-2xl font-bold uppercase">{p.timelapse}</p>
        <IconButton icon={X} label={t.wrapped.close} onClick={onClose} />
      </div>
      <div className="relative my-3 flex flex-1 items-center justify-center overflow-hidden">
        <img
          src={urls.get(photo.id)}
          alt={p.photoOf(formatDayLong(photo.day))}
          className="max-h-full max-w-full rounded-md object-contain"
        />
        <p className="absolute bottom-3 left-3 rounded-sm bg-scrim px-2 py-1 font-display text-xl font-bold text-text">
          {formatDayLong(photo.day)}
        </p>
      </div>
      <input
        type="range"
        min={0}
        max={photos.length - 1}
        value={index}
        aria-label={p.position}
        onChange={(e) => {
          setPlaying(false)
          setIndex(Number(e.target.value))
        }}
        className="w-full accent-[var(--plate-yellow)]"
      />
      <div className="mt-3 flex items-center gap-2">
        <IconButton
          icon={playing ? Pause : Play}
          label={playing ? p.pause : p.play}
          filled
          onClick={() => setPlaying((v) => !v)}
        />
        <span className="flex-1" />
        {SPEEDS.map((ms) => (
          <Chip key={ms} selected={speed === ms} onClick={() => setSpeed(ms)}>
            {p.speeds[ms]}
          </Chip>
        ))}
      </div>
    </div>
  )
}
