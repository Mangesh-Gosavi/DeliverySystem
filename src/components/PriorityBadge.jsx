import { getPriority } from '../config/statusConfig'

/** Compact priority pill with a colour dot — quick to scan in a dense table. */
export default function PriorityBadge({ priority, className = '' }) {
  const p = getPriority(priority)
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ${p.badge} ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${p.dot}`} />
      {p.label}
    </span>
  )
}
