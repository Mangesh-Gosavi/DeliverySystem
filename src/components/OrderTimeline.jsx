import { motion } from 'framer-motion'
import {
  Check,
  Boxes,
  FileText,
  MapPin,
  UserCog,
  Truck,
  CalendarClock,
  CalendarCheck,
  AlertTriangle,
} from 'lucide-react'
import { PIPELINE, STATUS_TO_STEP, getStatus } from '../config/statusConfig'
import { formatDateTime, formatDate, relativeDay, formatNumber } from '../utils/format'
import TeamUpdatePanel from './TeamUpdatePanel'

/**
 * Horizontal pipeline stepper. Answers the customer's first question at a
 * glance — "how far along is my order?" — before they read any text. Completed
 * stages fill in; the current stage pulses; a delayed order turns its current
 * stage red so the problem is unmissable.
 */
function Stepper({ statusKey }) {
  const currentStep = STATUS_TO_STEP[statusKey]
  const delayed = statusKey === 'delayed'
  const s = getStatus(statusKey)

  return (
    <ol className="flex items-start overflow-x-auto pb-1">
      {PIPELINE.map((step, i) => {
        const done = i < currentStep
        const active = i === currentStep
        const StepIcon = step.icon
        const filledLine = i <= currentStep

        let circle
        if (done) {
          circle = 'bg-emerald-500 text-white'
        } else if (active) {
          circle = `${s.bar} text-white shadow-sm`
        } else {
          circle = 'bg-white text-slate-300 border border-slate-200'
        }

        return (
          <li key={step.key} className="flex min-w-[58px] flex-1 flex-col items-center">
            <div className="flex w-full items-center">
              <span className={`h-0.5 flex-1 ${i === 0 ? 'opacity-0' : filledLine ? 'bg-emerald-400' : 'bg-slate-200'}`} />
              <span className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
                {active && (
                  <span className={`absolute inline-flex h-8 w-8 animate-pulse-ring rounded-full ${s.dot}`} />
                )}
                <span className={`relative flex h-8 w-8 items-center justify-center rounded-full ${circle}`}>
                  {done ? (
                    <Check className="h-4 w-4" strokeWidth={3} />
                  ) : (
                    <StepIcon className="h-4 w-4" strokeWidth={2.4} />
                  )}
                </span>
              </span>
              <span className={`h-0.5 flex-1 ${i === PIPELINE.length - 1 ? 'opacity-0' : done ? 'bg-emerald-400' : 'bg-slate-200'}`} />
            </div>
            <span
              className={`mt-2 text-center text-[10px] font-medium leading-tight sm:text-[11px] ${
                active ? (delayed ? 'text-rose-600' : s.text) : done ? 'text-slate-600' : 'text-slate-400'
              }`}
            >
              {step.label}
            </span>
          </li>
        )
      })}
    </ol>
  )
}

/** Spec-sheet row in the order detail panel. */
function DetailRow({ icon: Icon, label, value }) {
  if (!value) return null
  return (
    <div className="flex items-start gap-3 py-2">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" strokeWidth={2} />
      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">{label}</p>
        {/* Wrap (don't truncate) so the full spec value is always readable, even
            on very narrow screens — hiding a PO# or dispatch note erodes trust. */}
        <p className="break-words text-sm font-medium text-slate-700">{value}</p>
      </div>
    </div>
  )
}

const TONE_DOT = {
  done: 'bg-emerald-500',
  active: 'bg-brand-500',
  alert: 'bg-rose-500',
}

export default function OrderTimeline({ order, teamMode = false, onPostUpdate }) {
  const delayed = order.status === 'delayed'

  return (
    <div className="border-t border-slate-200/80 bg-slate-50/70 px-4 py-6 sm:px-6">
      <Stepper statusKey={order.status} />

      {/* Internal team update control (only in Team view) */}
      {teamMode && (
        <div className="mt-5">
          <TeamUpdatePanel order={order} onPostUpdate={onPostUpdate} />
        </div>
      )}

      {/* Delay banner — the most important message gets the loudest treatment. */}
      {delayed && (
        <div className="mt-5 flex gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-rose-500" />
          <div>
            <p className="text-sm font-semibold text-rose-800">Why this order is delayed</p>
            <p className="mt-1 text-sm text-rose-700">{order.delayReason}</p>
            {order.originalDelivery && (
              <p className="mt-2 text-xs font-medium text-rose-600">
                Originally due {formatDate(order.originalDelivery)} · revised to{' '}
                <span className="font-bold">{formatDate(order.estimatedDelivery)}</span> ({relativeDay(order.estimatedDelivery)})
              </p>
            )}
          </div>
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Order spec sheet */}
        <div className="lg:col-span-2">
          <h4 className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-400">Order details</h4>
          <div className="surface divide-y divide-slate-100 px-4 py-1">
            <DetailRow icon={Boxes} label="Quantity" value={`${formatNumber(order.quantity)} ${order.unit}`} />
            <DetailRow icon={FileText} label="Material" value={order.material} />
            <DetailRow icon={FileText} label="Specification" value={order.spec} />
            <DetailRow icon={FileText} label="PO Number" value={order.poNumber} />
            <DetailRow icon={MapPin} label="Plant / Line" value={order.plant} />
            <DetailRow icon={UserCog} label="Production Lead" value={order.lead} />
            {order.carrier && <DetailRow icon={Truck} label="Dispatch" value={order.carrier} />}
            <DetailRow icon={CalendarClock} label="Ordered On" value={formatDate(order.orderedOn)} />
            <DetailRow
              icon={CalendarCheck}
              label="Estimated Delivery"
              value={`${formatDate(order.estimatedDelivery)} · ${relativeDay(order.estimatedDelivery)}`}
            />
          </div>
        </div>

        {/* Timestamped activity log — the WhatsApp thread, but structured. */}
        <div className="lg:col-span-3">
          <h4 className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-400">Activity timeline</h4>
          <div className="surface p-5">
            <ol className="relative">
              {order.timeline
                .slice()
                .reverse()
                .map((event, i, arr) => {
                  const isLast = i === arr.length - 1
                  const dot = TONE_DOT[event.tone] ?? 'bg-slate-400'
                  return (
                    <motion.li
                      key={`${event.stage}-${i}`}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05, duration: 0.3 }}
                      className="relative flex gap-4 pb-5 last:pb-0"
                    >
                      {/* vertical connector */}
                      {!isLast && <span className="absolute left-[7px] top-5 h-full w-px bg-slate-200" />}
                      <span className="relative z-10 mt-1 flex h-3.5 w-3.5 shrink-0 items-center justify-center">
                        {event.tone === 'active' && (
                          <span className={`absolute h-3.5 w-3.5 animate-ping rounded-full ${dot} opacity-60`} />
                        )}
                        <span className={`h-3 w-3 rounded-full ring-4 ring-white ${dot}`} />
                      </span>
                      <div className="-mt-0.5 min-w-0">
                        <div className="flex flex-wrap items-baseline gap-x-2">
                          <p className={`text-sm font-semibold ${event.tone === 'alert' ? 'text-rose-700' : 'text-slate-800'}`}>
                            {event.title}
                          </p>
                          <span className="font-mono text-[11px] text-slate-400">{formatDateTime(event.at)}</span>
                        </div>
                        {event.note && <p className="mt-0.5 text-sm text-slate-500">{event.note}</p>}
                      </div>
                    </motion.li>
                  )
                })}
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}
