/**
 * Formatting + date helpers shared across the app.
 *
 * Product decision: dates are computed *relative to "now"* rather than frozen
 * calendar dates. That keeps the demo evergreen — an order is always "due in
 * 3 days" no matter what day the client opens it — which is exactly how a live
 * tracking product behaves.
 */

/** A date `days` from now, optionally pinned to a specific hour/minute. */
export function dayOffset(days, hour = 10, minute = 0) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  d.setHours(hour, minute, 0, 0)
  return d
}

const DATE_FMT = { day: 'numeric', month: 'short', year: 'numeric' }
const TIME_FMT = { hour: 'numeric', minute: '2-digit', hour12: true }

export function formatDate(value) {
  return new Date(value).toLocaleDateString('en-GB', DATE_FMT)
}

export function formatDateTime(value) {
  const d = new Date(value)
  return `${d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} · ${d
    .toLocaleTimeString('en-US', TIME_FMT)
    .toLowerCase()}`
}

export function formatNumber(value) {
  return new Intl.NumberFormat('en-US').format(value)
}

/** Whole-day difference between a date and today (positive = future). */
export function daysFromToday(value) {
  const target = new Date(value)
  const now = new Date()
  target.setHours(0, 0, 0, 0)
  now.setHours(0, 0, 0, 0)
  return Math.round((target - now) / 86400000)
}

/** Human, friendly relative label used on cards: "Tomorrow", "in 4 days". */
export function relativeDay(value) {
  const diff = daysFromToday(value)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Tomorrow'
  if (diff === -1) return 'Yesterday'
  if (diff > 1) return `in ${diff} days`
  return `${Math.abs(diff)} days ago`
}

/** True when a delivery date lands within the current Mon–Sun working week. */
export function isThisWeek(value) {
  const diff = daysFromToday(value)
  return diff >= 0 && diff <= 7
}

/** Initials for an avatar chip, e.g. "Mahindra Aerospace" -> "MA". */
export function initials(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('')
}
