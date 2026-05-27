import { motion } from 'framer-motion'

/**
 * Animated progress fill. The bar grows from 0 on mount so progress feels
 * "earned" rather than static — a small thing that makes the UI feel alive.
 */
export default function ProgressBar({
  value,
  barClass = 'bg-brand-600',
  trackClass = 'bg-slate-100',
  className = '',
  height = 'h-1.5',
}) {
  return (
    <div className={`${height} w-full overflow-hidden rounded-full ${trackClass} ${className}`}>
      <motion.div
        className={`h-full rounded-full ${barClass}`}
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      />
    </div>
  )
}
