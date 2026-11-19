import { Pause, Play } from 'lucide-react'
import { useEffect, useState } from 'react'
import { exerciseImage } from '../domain/exercises/media'
import { t } from '../i18n'
import { IconButton } from './Button'

const FRAME_MS = 800

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * "Mini-video" without video (SPEC §4.2): the start and end photo cross-fade every 0.8 s.
 * Pausable, and paused from the start when the user prefers reduced motion.
 */
export function Flipbook({ exerciseId, name }: { exerciseId: string; name: string }) {
  const [frame, setFrame] = useState<0 | 1>(0)
  const [playing, setPlaying] = useState(() => !prefersReducedMotion())

  useEffect(() => {
    if (!playing) return
    const timer = window.setInterval(() => setFrame((f) => (f === 0 ? 1 : 0)), FRAME_MS)
    return () => window.clearInterval(timer)
  }, [playing])

  return (
    <div className="relative overflow-hidden rounded-md border border-line bg-plate-white">
      <div className="relative aspect-[3/2]">
        {([0, 1] as const).map((i) => (
          <img
            key={i}
            src={exerciseImage(exerciseId, i)}
            alt={i === 0 ? t.flipbook.start(name) : t.flipbook.end(name)}
            className="absolute inset-0 size-full object-contain transition-opacity duration-300"
            style={{ opacity: frame === i ? 1 : 0 }}
          />
        ))}
      </div>
      <IconButton
        icon={playing ? Pause : Play}
        label={playing ? t.flipbook.pause : t.flipbook.play}
        filled
        className="absolute right-2 bottom-2"
        onClick={() => setPlaying((p) => !p)}
      />
    </div>
  )
}
