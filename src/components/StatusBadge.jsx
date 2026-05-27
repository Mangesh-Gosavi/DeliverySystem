import { getStatus } from '../config/statusConfig'

/**
 * One badge component, used everywhere a status appears, so the colour + icon
 * pairing stays 100% consistent across the app (cards, rows, timeline).
 */
export default function StatusBadge({ status, withIcon = true, size = 'md', className = '' }) {
  const s = getStatus(status)
  const Icon = s.icon
  const sizes = {
    sm: 'px-2 py-0.5 text-[11px] gap-1',
    md: 'px-2.5 py-1 text-xs gap-1.5',
  }
  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold ${sizes[size]} ${s.badge} ${className}`}
    >
      {withIcon && (
        <Icon
          className={`${size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'} ${status === 'delayed' ? 'animate-pulse' : ''}`}
          strokeWidth={2.4}
        />
      )}
      {s.label}
    </span>
  )
}
