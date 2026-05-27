import { isThisWeek, relativeDay, formatDate, daysFromToday } from './format'

/**
 * Simulated "AI" portfolio summary.
 *
 * There's no LLM here — instead we read the real order data and compose a
 * briefing the way an operations manager would: lead with the headline, call
 * out anything at risk, surface what's shipping, and end with a forward look.
 * The output changes as the data changes, so it reads as genuinely generated
 * rather than canned.
 *
 * Product decision: this is the single screen that replaces a flurry of manual
 * WhatsApp updates. It must answer "should I be worried, and what's next?" in
 * a few seconds of reading.
 */

const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`

/** Join a list as natural English: ["a","b","c"] -> "a, b and c". */
function naturalList(items) {
  if (items.length === 0) return ''
  if (items.length === 1) return items[0]
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`
}

const nameOf = (o) => `${o.partName} for ${o.customer}`

export function generateAISummary(orders) {
  const by = (s) => orders.filter((o) => o.status === s)

  const delivered = by('delivered')
  const delayed = by('delayed')
  const ready = by('ready_to_ship')
  const inProd = by('in_production')
  const qc = by('qc')

  const active = orders.filter((o) => o.status !== 'delivered')
  // "On track" = actively progressing (production or QC) and not past due.
  const onTrack = [...inProd, ...qc].filter((o) => daysFromToday(o.estimatedDelivery) >= 0)
  const readyThisWeek = ready.filter((o) => isThisWeek(o.estimatedDelivery))
  const highPriorityActive = active
    .filter((o) => o.priority === 'high')
    .sort((a, b) => daysFromToday(a.estimatedDelivery) - daysFromToday(b.estimatedDelivery))

  // The very next thing that will be delivered — anchors the "what's next" line.
  const nextDelivery = [...active]
    .filter((o) => daysFromToday(o.estimatedDelivery) >= 0)
    .sort((a, b) => daysFromToday(a.estimatedDelivery) - daysFromToday(b.estimatedDelivery))[0]

  // ---- Headline -----------------------------------------------------------
  let headline
  if (delayed.length === 0) {
    headline = `All ${active.length} active orders are tracking to schedule — nothing needs your attention right now.`
  } else if (delayed.length === 1) {
    headline = `Your portfolio is largely on track, with one order delayed and already under active recovery.`
  } else {
    headline = `Mostly steady — ${delayed.length} orders are delayed, each with a revised date already shared with the customer.`
  }

  // ---- Body sentences (revealed one-by-one for the "typing" effect) -------
  const sentences = []

  // 1) Portfolio shape
  const shapeParts = []
  if (onTrack.length) shapeParts.push(`${plural(onTrack.length, 'order is', 'orders are')} progressing on schedule`)
  if (ready.length) shapeParts.push(`${plural(ready.length, 'is', 'are')} packed and ready to ship`)
  if (delayed.length) shapeParts.push(`${plural(delayed.length, 'is', 'are')} delayed`)
  sentences.push(
    `You have ${plural(active.length, 'active order', 'active orders')} in the pipeline` +
      (shapeParts.length ? ` — ${naturalList(shapeParts)}.` : '.') +
      (delivered.length ? ` ${plural(delivered.length, 'order has', 'orders have')} been delivered recently.` : ''),
  )

  // 2) Delays — the part customers care about most
  if (delayed.length) {
    const reasons = delayed.map((o) => {
      const cause = /porosity|qc|quality|inspection/i.test(o.delayReason || '')
        ? 'a QC issue'
        : /material|supplier|copper|shortage|stock/i.test(o.delayReason || '')
          ? 'a material supply slip'
          : 'an upstream issue'
      return `${o.partName} (${cause}, now ${relativeDay(o.estimatedDelivery)})`
    })
    sentences.push(
      `⚠ Heads-up: ${naturalList(reasons)}. Revised delivery dates have already gone out, and recovery is in progress.`,
    )
  }

  // 3) Shipping this week — the urgent, actionable bit
  if (readyThisWeek.length) {
    const urgent = readyThisWeek.find((o) => o.priority === 'high')
    sentences.push(
      `${plural(readyThisWeek.length, 'order is', 'orders are')} ready for shipment this week` +
        (urgent ? `, including the high-priority ${nameOf(urgent)} (due ${relativeDay(urgent.estimatedDelivery)}).` : '.'),
    )
  } else if (ready.length) {
    sentences.push(`${plural(ready.length, 'order is', 'orders are')} packed and awaiting a dispatch slot.`)
  }

  // 4) Priority watch
  if (highPriorityActive.length) {
    const names = highPriorityActive.slice(0, 2).map(nameOf)
    sentences.push(
      `Top of the priority list: ${naturalList(names)}${highPriorityActive.length > 2 ? `, plus ${highPriorityActive.length - 2} more` : ''}.`,
    )
  }

  // 5) Forward look
  if (nextDelivery) {
    sentences.push(
      `Next up, ${nameOf(nextDelivery)} is due ${relativeDay(nextDelivery.estimatedDelivery)} (${formatDate(nextDelivery.estimatedDelivery)}).`,
    )
  }

  // ---- Structured insight chips ------------------------------------------
  const insights = []
  if (delayed.length) {
    insights.push({
      tone: 'alert',
      icon: 'alert',
      title: plural(delayed.length, 'delayed order', 'delayed orders'),
      text: 'Revised dates shared · recovery in progress',
      refs: delayed.map((o) => o.id),
    })
  }
  if (readyThisWeek.length) {
    insights.push({
      tone: 'amber',
      icon: 'truck',
      title: 'Shipping this week',
      text: `${plural(readyThisWeek.length, 'order', 'orders')} ready to dispatch`,
      refs: readyThisWeek.map((o) => o.id),
    })
  }
  if (onTrack.length) {
    insights.push({
      tone: 'positive',
      icon: 'trend',
      title: plural(onTrack.length, 'order on track', 'orders on track'),
      text: 'Progressing to schedule',
      refs: onTrack.map((o) => o.id),
    })
  }
  if (highPriorityActive.length) {
    insights.push({
      tone: 'brand',
      icon: 'flame',
      title: 'Priority watch',
      text: `${plural(highPriorityActive.length, 'high-priority order', 'high-priority orders')} active`,
      refs: highPriorityActive.map((o) => o.id),
    })
  }

  return {
    headline,
    sentences,
    insights,
    generatedAt: new Date(),
  }
}
