import { useState, useEffect, useMemo, useRef } from 'react'
import { Wrench, RotateCcw, ShieldCheck } from 'lucide-react'
import Navbar from './Navbar'
import Reveal from './Reveal'
import StatsOverview from './StatsOverview'
import AISummaryPanel from './AISummaryPanel'
import FilterBar from './FilterBar'
import OrderTable from './OrderTable'
import LoadingState from './LoadingState'
import { ORDERS } from '../data/orders'
import { getPortfolioStats } from '../utils/analytics'
import { getPriority } from '../config/statusConfig'
import { formatDateTime, daysFromToday } from '../utils/format'
import { useAuth } from '../auth/AuthContext'
import {
  loadOverrides,
  saveOverrides,
  clearOverrides,
  applyOverrides,
  buildOverride,
  hasOverrides,
} from '../utils/persistence'

export default function Dashboard() {
  const { user } = useAuth()
  const isTeam = user.role === 'team'

  // Simulate a backend fetch so the loading state is real, not decorative.
  const [loading, setLoading] = useState(true)

  // Seed is computed once (evergreen dates). Team edits are persisted as
  // "overrides" and re-applied over the seed, so they survive refresh without
  // freezing the demo's relative-to-today dates. See utils/persistence.js.
  const seed = useRef(ORDERS)
  const [overrides, setOverrides] = useState(loadOverrides)
  const allOrders = useMemo(() => applyOverrides(seed.current, overrides), [overrides])
  useEffect(() => saveOverrides(overrides), [overrides])

  // Role-based access: a customer can only ever see orders that belong to their
  // own userId; the team sees the entire order book.
  const orders = useMemo(
    () => (isTeam ? allOrders : allOrders.filter((o) => o.userId === user.userId)),
    [allOrders, isTeam, user.userId]
  )

  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sort, setSort] = useState('priority')
  const [expandedId, setExpandedId] = useState(null)

  const tableRef = useRef(null)
  const lastUpdated = useRef(new Date())

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 850)
    return () => clearTimeout(t)
  }, [])

  // KPIs always reflect the full *scoped* order book, regardless of filters.
  const stats = useMemo(() => getPortfolioStats(orders), [orders])

  // Live counts for the filter chips.
  const counts = useMemo(() => {
    const c = { all: orders.length }
    for (const o of orders) c[o.status] = (c[o.status] ?? 0) + 1
    return c
  }, [orders])

  const visibleOrders = useMemo(() => {
    const q = query.trim().toLowerCase()
    let list = orders.filter((o) => {
      const matchesStatus = statusFilter === 'all' || o.status === statusFilter
      const matchesQuery =
        !q ||
        o.id.toLowerCase().includes(q) ||
        o.partName.toLowerCase().includes(q) ||
        o.customer.toLowerCase().includes(q) ||
        (o.userId && o.userId.toLowerCase().includes(q))
      return matchesStatus && matchesQuery
    })

    const lastEventAt = (o) => new Date(o.timeline[o.timeline.length - 1].at).getTime()

    list = [...list].sort((a, b) => {
      if (sort === 'priority') {
        const diff = getPriority(b.priority).rank - getPriority(a.priority).rank
        return diff !== 0 ? diff : daysFromToday(a.estimatedDelivery) - daysFromToday(b.estimatedDelivery)
      }
      if (sort === 'delivery') return daysFromToday(a.estimatedDelivery) - daysFromToday(b.estimatedDelivery)
      return lastEventAt(b) - lastEventAt(a) // recently updated
    })

    return list
  }, [orders, query, statusFilter, sort])

  const toggleRow = (id) => setExpandedId((cur) => (cur === id ? null : id))

  // Internal-team update: persist an override for this order. Guarded so it can
  // never run for a customer session, even if a stale handler is invoked.
  const postUpdate = (id, payload) => {
    if (!isTeam) return
    setOverrides((prev) => {
      const seedOrder = seed.current.find((o) => o.id === id)
      return { ...prev, [id]: buildOverride(seedOrder, prev[id] || {}, payload) }
    })
  }

  // Restore the original seed (clears persisted team edits).
  const resetDemo = () => {
    clearOverrides()
    setOverrides({})
    setExpandedId(null)
  }

  const resetFilters = () => {
    setQuery('')
    setStatusFilter('all')
  }

  // Clicking an AI insight chip filters the table to the relevant orders and
  // scrolls there — the summary becomes a navigation tool, not a dead-end.
  const handleInsightClick = (insight) => {
    if (insight.icon === 'alert') setStatusFilter('delayed')
    else if (insight.icon === 'truck') setStatusFilter('ready_to_ship')
    setQuery('')
    setExpandedId(null)
    requestAnimationFrame(() => tableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  }

  return (
    <div className="min-h-screen pb-16">
      <Navbar />

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        {/* Page header */}
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-[28px]">
              {isTeam ? 'Order Tracking' : 'Your Orders'}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {isTeam
                ? 'Every custom part, across all customers — updated in real time.'
                : 'Your custom parts, from the shop floor to your door — updated in real time.'}
            </p>
          </div>
          <div className="text-left">
            <p className="text-[11px] uppercase tracking-wide text-slate-400">Last updated</p>
            <p className="font-mono text-xs font-medium text-slate-600">{formatDateTime(lastUpdated.current)}</p>
          </div>
        </div>

        {/* Role context banner */}
        {isTeam ? (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-800">
            <Wrench className="h-4 w-4 shrink-0" />
            <span className="min-w-0 flex-1">
              <span className="font-semibold">Internal team view.</span> Open any order to change its
              status or post an update — it lands on the customer's timeline instantly and is saved on
              this device.
            </span>
            {hasOverrides(overrides) && (
              <button
                onClick={resetDemo}
                className="focus-ring inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-amber-300 bg-white/70 px-2.5 py-1 text-xs font-semibold text-amber-700 transition hover:bg-white"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Reset demo data
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border border-brand-200 bg-brand-50 px-4 py-2.5 text-sm text-brand-800">
            <ShieldCheck className="h-4 w-4 shrink-0" />
            <span className="min-w-0 flex-1 font-semibold">
              Company Name - <span >{user.company}</span> 
            </span>
          </div>
        )}

        {loading ? (
          <LoadingState />
        ) : (
          // Entrance polish lives on each section (see Reveal) rather than one
          // big opacity gate — so content is never hidden as a block if an
          // animation is interrupted, and each region eases in on its own.
          <div className="space-y-6">
            <Reveal>
              <StatsOverview stats={stats} />
            </Reveal>

            <Reveal delay={0.06}>
              <AISummaryPanel orders={orders} onInsightClick={handleInsightClick} />
            </Reveal>

            {/* Order book */}
            <Reveal delay={0.12} as="section" sectionRef={tableRef} className="scroll-mt-20 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold tracking-tight text-slate-900">
                  {isTeam ? 'Order book' : 'Your order book'}
                </h2>
              </div>
              <FilterBar
                query={query}
                onQuery={setQuery}
                statusFilter={statusFilter}
                onStatusFilter={setStatusFilter}
                sort={sort}
                onSort={setSort}
                counts={counts}
                resultCount={visibleOrders.length}
                placeholder={
                  isTeam ? 'Search by user ID, order ID, customer or part…' : 'Search your orders…'
                }
              />
              <OrderTable
                orders={visibleOrders}
                expandedId={expandedId}
                onToggle={toggleRow}
                onResetFilters={resetFilters}
                teamMode={isTeam}
                onPostUpdate={postUpdate}
              />
            </Reveal>
          </div>
        )}

        {/* Footer — reinforces this is a real product, not a one-off page. */}
        <footer className="pt-6 text-center text-xs text-slate-400">
          <p>
            Axle Manufacturing · Parts Tracking Portal — replacing manual WhatsApp updates with one
            live source of truth.
          </p>
          <p className="mt-1">Demo build · mock data · no live backend.</p>
        </footer>
      </main>
    </div>
  )
}
