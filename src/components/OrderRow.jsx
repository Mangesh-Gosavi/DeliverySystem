import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import StatusBadge from './StatusBadge'
import PriorityBadge from './PriorityBadge'
import OrderTimeline from './OrderTimeline'
import { getStatus } from '../config/statusConfig'
import { formatNumber, formatDate, relativeDay, daysFromToday, isThisWeek, initials } from '../utils/format'

// Shared grid template so the table header and every row line up perfectly.
export const ROW_GRID =
  'md:grid md:grid-cols-[minmax(0,2.4fr)_1.5fr_0.7fr_1.35fr_1.3fr_1fr_2rem] md:items-center md:gap-4'

/** Colour-codes the delivery date by urgency so the eye lands on what's tight. */
function DeliveryText({ order }) {
  const rel = relativeDay(order.estimatedDelivery)
  let tone = 'text-slate-500'
  if (order.status === 'delivered') tone = 'text-emerald-600'
  else if (order.status === 'delayed') tone = 'text-rose-600 font-semibold'
  else if (isThisWeek(order.estimatedDelivery) && daysFromToday(order.estimatedDelivery) <= 3)
    tone = 'text-amber-600 font-semibold'
  return (
    <div className="leading-tight">
      <p className="text-sm font-medium text-slate-700">{formatDate(order.estimatedDelivery)}</p>
      <p className={`text-xs ${tone}`}>{order.status === 'delivered' ? 'Delivered' : rel}</p>
    </div>
  )
}

function CustomerChip({ name }) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-600">
        {initials(name)}
      </span>
      <span className="truncate text-sm text-slate-600">{name}</span>
    </div>
  )
}

export default function OrderRow({ order, isOpen, onToggle, teamMode, onPostUpdate }) {
  const s = getStatus(order.status)

  return (
    <motion.div layout className={isOpen ? 'bg-brand-50/40' : 'bg-white'}>
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        className="focus-ring block w-full px-4 py-4 text-left transition-colors hover:bg-slate-50/80 sm:px-6"
      >
        {/* ---------- DESKTOP: aligned table row (hidden on mobile) ---------- */}
        <div className={`hidden ${ROW_GRID}`}>
          {/* Order + part */}
          <div className="flex items-center gap-3">
            <span className={`h-9 w-1 shrink-0 rounded-full ${s.bar}`} aria-hidden />
            <div className="min-w-0">
              <p className="font-mono text-xs font-medium text-slate-400">{order.id}</p>
              <p className="truncate text-sm font-semibold text-slate-900">{order.partName}</p>
            </div>
          </div>
          <CustomerChip name={order.customer} />
          <p className="text-sm font-medium text-slate-700">{formatNumber(order.quantity)}</p>
          <StatusBadge status={order.status} />
          <DeliveryText order={order} />
          <PriorityBadge priority={order.priority} />
          <ChevronDown
            className={`h-4 w-4 justify-self-end text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
          />
        </div>

        {/* ---------- MOBILE: stacked card ---------- */}
        <div className="md:hidden">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-mono text-xs font-medium text-slate-400">{order.id}</p>
              <p className="truncate text-base font-semibold text-slate-900">{order.partName}</p>
            </div>
            <ChevronDown
              className={`mt-1 h-4 w-4 shrink-0 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
            />
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <StatusBadge status={order.status} size="sm" />
            <PriorityBadge priority={order.priority} />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <div>
              <p className="text-[11px] uppercase tracking-wide text-slate-400">Customer</p>
              <p className="truncate font-medium text-slate-700">{order.customer}</p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wide text-slate-400">Quantity</p>
              <p className="font-medium text-slate-700">
                {formatNumber(order.quantity)} {order.unit}
              </p>
            </div>
            <div className="col-span-2">
              <p className="text-[11px] uppercase tracking-wide text-slate-400">Estimated delivery</p>
              <DeliveryText order={order} />
            </div>
          </div>
        </div>
      </button>

      {/* ---------- Expandable detail ---------- */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <OrderTimeline order={order} teamMode={teamMode} onPostUpdate={onPostUpdate} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
