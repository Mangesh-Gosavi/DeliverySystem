import { motion } from 'framer-motion'
import { Layers, Truck, AlertTriangle, Gauge } from 'lucide-react'
import StatCard from './StatCard'
import { getStatus } from '../config/statusConfig'

/**
 * The "answer in 5 seconds" strip. Four KPIs chosen to map to the questions a
 * customer actually has — How much is in flight? What's shipping now? Anything
 * wrong? Can I trust your dates? — followed by a status distribution bar that
 * shows the whole book at a glance.
 */
export default function StatsOverview({ stats }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Layers}
          tone="brand"
          label="Active orders"
          value={stats.active}
          sub={`${stats.dueThisWeek} due this week`}
        />
        <StatCard
          icon={Truck}
          tone="amber"
          label="Ready to ship"
          value={stats.ready}
          sub="Packed & awaiting dispatch"
        />
        <StatCard
          icon={AlertTriangle}
          tone="rose"
          label="Delayed"
          value={stats.delayed}
          sub={stats.delayed ? 'Recovery in progress' : 'Nothing delayed'}
          highlight={stats.delayed > 0}
        />
        <StatCard
          icon={Gauge}
          tone="emerald"
          label="On-time rate"
          value={`${stats.onTimeRate}%`}
          sub="Delivery commitments kept"
        />
      </div>

      {/* Status distribution — the whole order book as one proportional bar. */}
      <div className="surface p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-700">Portfolio status</h3>
          <span className="text-xs font-medium text-slate-400">{stats.total} orders</span>
        </div>
        <div className="mt-3 flex h-3 w-full gap-0.5 overflow-hidden rounded-full bg-slate-100">
          {stats.distribution.map((seg, i) => (
            <motion.div
              key={seg.key}
              className={`${seg.bar} first:rounded-l-full last:rounded-r-full`}
              initial={{ width: 0 }}
              animate={{ width: `${(seg.count / stats.total) * 100}%` }}
              transition={{ duration: 0.8, delay: 0.1 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              title={`${seg.label}: ${seg.count}`}
            />
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
          {stats.distribution.map((seg) => (
            <div key={seg.key} className="flex items-center gap-1.5 text-xs">
              <span className={`h-2 w-2 rounded-full ${seg.dot}`} />
              <span className="font-medium text-slate-600">{getStatus(seg.key).label}</span>
              <span className="font-semibold text-slate-400">{seg.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
