import { ChevronLeft } from 'lucide-react'
import { motion, useMotionValue, useTransform } from 'motion/react'
import { useEffect } from 'react'
import { useNavigate } from 'react-router'
import { isStandalone } from '../ui/standalone'

const EDGE = 24
const TRIGGER = 90

/**
 * Swipe from the left edge to go back, like a native iOS app. Only in the home-screen app:
 * in Safari, iOS already does this itself. Only when there is somewhere to go back to.
 */
export function EdgeSwipeBack() {
  const navigate = useNavigate()
  const dx = useMotionValue(0)
  const opacity = useTransform(dx, [0, TRIGGER], [0, 1])
  const x = useTransform(dx, (v) => Math.min(v, TRIGGER) - 44)

  useEffect(() => {
    if (!isStandalone()) return
    let start: { x: number; y: number } | null = null
    const onStart = (e: TouchEvent) => {
      const touch = e.touches[0]
      const canGoBack = ((window.history.state as { idx?: number } | null)?.idx ?? 0) > 0
      start =
        touch && touch.clientX < EDGE && canGoBack ? { x: touch.clientX, y: touch.clientY } : null
    }
    const onMove = (e: TouchEvent) => {
      const touch = e.touches[0]
      if (!start || !touch) return
      if (Math.abs(touch.clientY - start.y) > 60) {
        start = null
        dx.set(0)
        return
      }
      dx.set(Math.max(0, touch.clientX - start.x))
    }
    const onEnd = () => {
      if (start && dx.get() >= TRIGGER) navigate(-1)
      start = null
      dx.set(0)
    }
    document.addEventListener('touchstart', onStart, { passive: true })
    document.addEventListener('touchmove', onMove, { passive: true })
    document.addEventListener('touchend', onEnd)
    document.addEventListener('touchcancel', onEnd)
    return () => {
      document.removeEventListener('touchstart', onStart)
      document.removeEventListener('touchmove', onMove)
      document.removeEventListener('touchend', onEnd)
      document.removeEventListener('touchcancel', onEnd)
    }
  }, [dx, navigate])

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed top-1/2 left-0 z-50 flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-line-strong bg-surface-2"
      style={{ x, opacity }}
    >
      <ChevronLeft size={24} />
    </motion.div>
  )
}
