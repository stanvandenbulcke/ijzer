import { RotateCw } from 'lucide-react'
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from 'motion/react'
import { t } from '../../i18n'
import { IconButton } from '../Button'
import { BACK, FRONT } from './shapes'
import { showsBack } from './turn'
import { Figure, type MuscleFill } from './MuscleMap'

/**
 * Big body in 3D: drag sideways (or tap the button) to turn between front and back. The faces
 * are real 3D planes with perspective, so it feels like turning a statue.
 */
export function MuscleMap3D({ fills, label }: { fills: MuscleFill; label: string }) {
  const rotate = useMotionValue(0)
  const reduced = useReducedMotion()
  const frontOpacity = useTransform(rotate, (r) => (showsBack(r) ? 0 : 1))
  const backOpacity = useTransform(rotate, (r) => (showsBack(r) ? 1 : 0))
  const shadowScale = useTransform(
    rotate,
    (r) => 0.75 + 0.25 * Math.abs(Math.cos((r * Math.PI) / 180)),
  )

  const snap = (to?: number) => {
    const target = to ?? Math.round(rotate.get() / 180) * 180
    if (reduced) rotate.set(target)
    else animate(rotate, target, { type: 'spring', stiffness: 160, damping: 20 })
  }

  return (
    <div role="img" aria-label={label} className="relative flex flex-col items-center">
      <div className="w-40 [perspective:900px]">
        <motion.div
          className="relative aspect-[60/190] w-full touch-pan-y [transform-style:preserve-3d]"
          style={{ rotateY: rotate }}
          onPan={(_, info) => rotate.set(rotate.get() + info.delta.x * 0.9)}
          onPanEnd={() => snap()}
        >
          <motion.div
            className="absolute inset-0 [backface-visibility:hidden]"
            style={{ opacity: frontOpacity }}
          >
            <Figure shapes={FRONT} fills={fills} title={t.muscleMap.front} caption={false} />
          </motion.div>
          <motion.div
            className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)]"
            style={{ opacity: backOpacity }}
          >
            <Figure shapes={BACK} fills={fills} title={t.muscleMap.back} caption={false} />
          </motion.div>
        </motion.div>
      </div>
      <motion.div
        aria-hidden
        className="-mt-3 h-3 w-28 rounded-[50%] bg-line"
        style={{ scaleX: shadowScale }}
      />
      <IconButton
        icon={RotateCw}
        label={t.muscleMap.turn}
        filled
        className="absolute top-0 right-0"
        onClick={() => snap(Math.round(rotate.get() / 180) * 180 + 180)}
      />
    </div>
  )
}
