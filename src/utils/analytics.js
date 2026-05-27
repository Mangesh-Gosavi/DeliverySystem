import { isThisWeek, daysFromToday } from './format'
import { STATUS } from '../config/statusConfig'

/**
 * Portfolio-level metrics for the stat widgets and the status distribution bar.
 * Kept pure + separate from the UI so the same numbers can feed cards, charts,
 * or the AI summary without drifting out of sync.
 */
export function getPortfolioStats(orders) {
  const total = orders.length
  const delivered = orders.filter((o) => o.status === 'delivered')
  const delayed = orders.filter((o) => o.status === 'delayed')
  const ready = orders.filter((o) => o.status === 'ready_to_ship')
  const active = orders.filter((o) => o.status !== 'delivered')

  const dueThisWeek = active.filter((o) => isThisWeek(o.estimatedDelivery))

  // "Promise kept" rate — the trust metric. An order counts as on-track unless
  // it's currently delayed or has slipped past its committed date.
  const offTrack = orders.filter(
    (o) => o.status === 'delayed' || (o.status !== 'delivered' && daysFromToday(o.estimatedDelivery) < 0),
  )
  const onTimeRate = total ? Math.round(((total - offTrack.length) / total) * 100) : 100

  // Ordered status distribution for the segmented progress bar.
  const distribution = Object.values(STATUS)
    .sort((a, b) => a.order - b.order)
    .map((s) => ({
      key: s.key,
      label: s.label,
      count: orders.filter((o) => o.status === s.key).length,
      bar: s.bar,
      dot: s.dot,
    }))
    .filter((s) => s.count > 0)

  return {
    total,
    active: active.length,
    delivered: delivered.length,
    delayed: delayed.length,
    ready: ready.length,
    dueThisWeek: dueThisWeek.length,
    onTimeRate,
    distribution,
  }
}
