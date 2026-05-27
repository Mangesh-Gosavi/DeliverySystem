import { motion } from 'framer-motion'

const TONES = {
  brand: 'bg-brand-50 text-brand-600',
  amber: 'bg-amber-50 text-amber-600',
  rose: 'bg-rose-50 text-rose-600',
  emerald: 'bg-emerald-50 text-emerald-600',
  violet: 'bg-violet-50 text-violet-600',
  slate: 'bg-slate-100 text-slate-600',
}

/**
 * Headline KPI card. Big number first (information hierarchy: the answer before
 * the label), supporting context underneath, icon as a quiet visual anchor.
 */
export default function StatCard({ icon: Icon, label, value, sub, tone = 'slate', highlight = false }) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      className={`surface p-5 ${highlight ? 'ring-1 ring-rose-200' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{value}</p>
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${TONES[tone]}`}>
          <Icon className="h-5 w-5" strokeWidth={2.2} />
        </div>
      </div>
      {sub && <p className="mt-3 text-xs text-slate-500">{sub}</p>}
    </motion.div>
  )
}
