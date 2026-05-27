import { getStatus } from '../config/statusConfig'

/**
 * Client-side persistence for internal team edits (no backend).
 *
 * Design choice: we persist only the *overrides* (what staff changed per order),
 * NOT the whole order book. On load we re-apply them over the fresh seed. That
 * way the seeded demo data keeps its evergreen, relative-to-today dates, while a
 * real team edit survives refresh with its true timestamp. An override shape:
 *
 *   { [orderId]: { status, estimatedDelivery, originalDelivery, delayReason,
 *                  events: [{ stage, title, at(ISO), note, tone }] } }
 */
const STORAGE_KEY = 'axle-order-overrides-v1'

export function loadOverrides() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {} // private mode / disabled storage → stay in-memory
  }
}

export function saveOverrides(overrides) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides))
  } catch {
    /* fail silently — the app still works in-memory for the session */
  }
}

export function clearOverrides() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* no-op */
  }
}

export const hasOverrides = (overrides) => Object.keys(overrides || {}).length > 0

/** Merge persisted team edits over the (evergreen) seed orders. */
export function applyOverrides(seed, overrides) {
  return seed.map((o) => {
    const ov = overrides[o.id]
    if (!ov) return o
    const appended = (ov.events || []).map((e) => ({ ...e, at: new Date(e.at) }))
    let timeline = o.timeline
    if (appended.length) {
      // A newer update exists → the seed's "current" step is no longer active.
      timeline = o.timeline.map((e) => (e.tone === 'active' ? { ...e, tone: 'done' } : e))
      timeline = [...timeline, ...appended]
    }
    return {
      ...o,
      status: ov.status ?? o.status,
      estimatedDelivery: ov.estimatedDelivery ? new Date(ov.estimatedDelivery) : o.estimatedDelivery,
      originalDelivery: ov.originalDelivery ? new Date(ov.originalDelivery) : o.originalDelivery,
      delayReason: ov.delayReason ?? o.delayReason,
      timeline,
    }
  })
}

/** Produce the next override entry for one order from a posted team update. */
export function buildOverride(seedOrder, current, { status, note, revisedDate }) {
  const baseStatus = current.status ?? seedOrder.status
  const newStatus = status || baseStatus
  const statusChanged = newStatus !== baseStatus
  const cleanNote = (note || '').trim()
  const tone = newStatus === 'delayed' ? 'alert' : newStatus === 'delivered' ? 'done' : 'active'

  const event = {
    stage: newStatus,
    title: statusChanged ? `Marked ${getStatus(newStatus).label}` : 'Update posted',
    at: new Date().toISOString(),
    note:
      cleanNote ||
      (statusChanged
        ? `Order moved to ${getStatus(newStatus).label}.`
        : 'Status update posted to the customer.'),
    tone,
  }

  // Demote any previously-appended "active" event before adding the new one.
  const events = [
    ...(current.events || []).map((e) => (e.tone === 'active' ? { ...e, tone: 'done' } : e)),
    event,
  ]
  const next = { ...current, status: newStatus, events }

  if (newStatus === 'delayed' && revisedDate) {
    const prevOriginal =
      current.originalDelivery ??
      current.estimatedDelivery ??
      new Date(seedOrder.estimatedDelivery).toISOString()
    next.originalDelivery =
      typeof prevOriginal === 'string' ? prevOriginal : new Date(prevOriginal).toISOString()
    next.estimatedDelivery = new Date(revisedDate).toISOString()
    next.delayReason =
      cleanNote || current.delayReason || seedOrder.delayReason || 'Delivery date revised by the production team.'
  }
  return next
}
