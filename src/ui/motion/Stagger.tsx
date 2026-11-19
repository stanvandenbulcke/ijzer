import { motion } from 'motion/react'
import { Children, type ReactNode } from 'react'

/** Children rise in one after the other (dashboards, lists of cards). */
export function Stagger({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={className}>
      {Children.toArray(children).map((child, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, delay: 0.04 + i * 0.06, ease: [0.2, 0.8, 0.2, 1] }}
        >
          {child}
        </motion.div>
      ))}
    </div>
  )
}
