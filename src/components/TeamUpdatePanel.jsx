import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Check, Wrench } from 'lucide-react'
import { STATUS } from '../config/statusConfig'

/**
 * Internal team control — the other half of "replace WhatsApp". Staff pick the
 * new status and/or type a note, hit Post, and it appends a timestamped entry to
 * the SAME timeline the customer sees (and updates the KPIs + AI summary live).
 *
 * No backend: the mutation is lifted to App state via onPostUpdate. This is the
 * product point — one action updates everyone, instead of a manual message.
 */
const STATUS_KEYS = ['in_production', 'qc', 'ready_to_ship', 'delivered', 'delayed']

const toInputDate = (d) => {
  const x = new Date(d)
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`
}

export default function TeamUpdatePanel({ order, onPostUpdate }) {
  const [status, setStatus] = useState(order.status)
  const [note, setNote] = useState('')
  const [revisedDate, setRevisedDate] = useState(toInputDate(order.estimatedDelivery))
  const [justPosted, setJustPosted] = useState(false)

  const statusChanged = status !== order.status
  const canPost = statusChanged || note.trim().length > 0

  const submit = () => {
    if (!canPost) return
    onPostUpdate(order.id, {
      status,
      note,
      revisedDate: status === 'delayed' ? revisedDate : null,
    })
    setNote('')
    setJustPosted(true)
    setTimeout(() => setJustPosted(false), 2400)
  }

  return (
    <div className="mb-5 rounded-xl border border-dashed border-slate-300 bg-white/70 p-4">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
        <Wrench className="h-3.5 w-3.5" /> Internal — post an update
      </div>
      <p className="mt-1 text-xs text-slate-400">
        This is what the customer sees — instead of a manual WhatsApp message.
      </p>

      {/* New status */}
      <div className="mt-3 flex flex-wrap gap-2">
        {STATUS_KEYS.map((k) => {
          const s = STATUS[k]
          const active = status === k
          const Icon = s.icon
          return (
            <button
              key={k}
              type="button"
              onClick={() => setStatus(k)}
              className={`focus-ring inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ring-inset transition ${
                active ? `${s.badge} ring-2` : 'bg-white text-slate-500 ring-1 ring-slate-200 hover:ring-slate-300'
              }`}
            >
              <Icon className="h-3.5 w-3.5" strokeWidth={2.2} />
              {s.label}
            </button>
          )
        })}
      </div>

      {/* Revised delivery date — only relevant when marking an order delayed */}
      <AnimatePresence initial={false}>
        {status === 'delayed' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-3">
              <label className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                Revised delivery date
              </label>
              <input
                type="date"
                value={revisedDate}
                onChange={(e) => setRevisedDate(e.target.value)}
                className="focus-ring mt-1 block rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Note to customer */}
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={2}
        placeholder={
          status === 'delayed'
            ? 'Explain the delay for the customer…'
            : 'Add a note for the customer (optional)…'
        }
        className="focus-ring mt-3 w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400"
      />

      <div className="mt-3 flex items-center gap-3">
        <AnimatePresence>
          {justPosted && (
            <motion.span
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600"
            >
              <Check className="h-4 w-4" /> Posted to customer
            </motion.span>
          )}
        </AnimatePresence>
        <button
          type="button"
          onClick={submit}
          disabled={!canPost}
          className="focus-ring ml-auto inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Send className="h-4 w-4" /> Post update
        </button>
      </div>
    </div>
  )
}
