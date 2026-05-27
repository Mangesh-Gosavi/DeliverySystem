import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, RefreshCw, AlertTriangle, Truck, TrendingUp, Flame, Info } from 'lucide-react'
import { generateAISummary } from '../utils/aiSummary'

const INSIGHT_ICON = { alert: AlertTriangle, truck: Truck, trend: TrendingUp, flame: Flame }
const INSIGHT_TONE = {
  alert: 'bg-rose-50 text-rose-700 ring-rose-200',
  amber: 'bg-amber-50 text-amber-700 ring-amber-200',
  positive: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  brand: 'bg-brand-50 text-brand-700 ring-brand-200',
}

/**
 * AI Portfolio Summary — the feature that replaces the manual "here's where
 * everything stands" WhatsApp broadcast.
 *
 * It's deliberately staged like a real model call: a brief "analysing" beat,
 * then the briefing streams in sentence-by-sentence. That tiny bit of theatre
 * makes the insight feel produced *for you, now* rather than pre-written — which
 * is what builds trust in an AI feature. (Under the hood it's pure data → text;
 * see utils/aiSummary.js.)
 */
export default function AISummaryPanel({ orders, onInsightClick }) {
  const [phase, setPhase] = useState('idle') // idle | thinking | done
  const [summary, setSummary] = useState(null)
  const [visible, setVisible] = useState(0)
  const [stale, setStale] = useState(false) // orders changed since last summary

  const generate = useCallback(() => {
    setPhase('thinking')
    setStale(false)
    setVisible(0)
    setSummary(null)
    const t = setTimeout(() => {
      setSummary(generateAISummary(orders))
      setPhase('done')
    }, 1100)
    return () => clearTimeout(t)
  }, [orders])

  // If a team update changes the data after a summary exists, flag it stale so
  // the briefing never silently misrepresents the live order book.
  useEffect(() => {
    if (phase === 'done') setStale(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orders])

  // Reveal one sentence at a time for the "typing" effect.
  useEffect(() => {
    if (phase !== 'done' || !summary) return
    if (visible >= summary.sentences.length) return
    const t = setTimeout(() => setVisible((v) => v + 1), visible === 0 ? 200 : 520)
    return () => clearTimeout(t)
  }, [phase, visible, summary])

  const allRevealed = summary && visible >= summary.sentences.length

  return (
    // Subtle gradient border signals "this is the AI surface" without a gimmick.
    <div className="rounded-2xl bg-gradient-to-br from-violet-500/25 via-brand-500/20 to-violet-500/25 p-px shadow-card">
      <div className="rounded-[15px] bg-white">
        {/* Header */}
        <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-brand-600 shadow-sm">
              <Sparkles className="h-5 w-5 text-white" strokeWidth={2.2} />
            </div>
            <div>
              <h2 className="flex items-center gap-2 text-base font-bold text-slate-900">
                AI Portfolio Summary
                <span className="rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-violet-600 ring-1 ring-inset ring-violet-200">
                  Beta
                </span>
              </h2>
              <p className="text-xs">
                {stale && phase === 'done' ? (
                  <span className="font-medium text-amber-600">Order data changed — regenerate for the latest.</span>
                ) : (
                  <span className="text-slate-500">A plain-English read on your whole order book.</span>
                )}
              </p>
            </div>
          </div>

          <button
            onClick={generate}
            disabled={phase === 'thinking'}
            className="focus-ring group inline-flex items-center justify-center gap-2 self-start rounded-xl bg-gradient-to-br from-violet-600 to-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:shadow-lift disabled:opacity-70 sm:self-auto"
          >
            {phase === 'idle' && <Sparkles className="h-4 w-4" />}
            {phase === 'thinking' && <RefreshCw className="h-4 w-4 animate-spin" />}
            {phase === 'done' && <RefreshCw className="h-4 w-4 transition group-hover:rotate-90" />}
            {phase === 'idle' ? 'Generate summary' : phase === 'thinking' ? 'Analysing…' : 'Regenerate'}
          </button>
        </div>

        {/* Body */}
        <div className="p-5">
          <AnimatePresence mode="wait">
            {/* IDLE */}
            {phase === 'idle' && (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-6 text-center"
              >
                <p className="max-w-md text-sm text-slate-500">
                  Skip scrolling the table. Generate an instant briefing on what's on track, what's
                  shipping this week, and anything that needs attention.
                </p>
              </motion.div>
            )}

            {/* THINKING */}
            {phase === 'thinking' && (
              <motion.div key="thinking" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="mb-4 flex items-center gap-2 text-sm font-medium text-violet-600">
                  <Sparkles className="h-4 w-4 animate-pulse" />
                  Analysing {orders.length} orders across {new Set(orders.map((o) => o.customer)).size} customers…
                </div>
                <div className="space-y-2.5">
                  <div className="skeleton h-3.5 w-[90%]" />
                  <div className="skeleton h-3.5 w-[80%]" />
                  <div className="skeleton h-3.5 w-[60%]" />
                </div>
              </motion.div>
            )}

            {/* DONE */}
            {phase === 'done' && summary && (
              <motion.div key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <p className="text-[15px] font-semibold leading-relaxed text-slate-900">{summary.headline}</p>

                <div className="mt-3 space-y-2">
                  {summary.sentences.slice(0, visible).map((sentence, i) => (
                    <motion.p
                      key={i}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className={`text-sm leading-relaxed ${
                        sentence.startsWith('⚠') ? 'font-medium text-rose-700' : 'text-slate-600'
                      }`}
                    >
                      {sentence}
                    </motion.p>
                  ))}
                  {/* blinking cursor while still "typing" */}
                  {!allRevealed && (
                    <motion.span
                      className="inline-block h-4 w-1.5 rounded-sm bg-violet-500"
                      animate={{ opacity: [1, 0.2, 1] }}
                      transition={{ duration: 0.9, repeat: Infinity }}
                    />
                  )}
                </div>

                {/* Insight chips */}
                <AnimatePresence>
                  {allRevealed && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35 }}
                      className="mt-5 flex flex-wrap gap-2"
                    >
                      {summary.insights.map((ins, i) => {
                        const Icon = INSIGHT_ICON[ins.icon] ?? Info
                        const clickable = ins.icon === 'alert' || ins.icon === 'truck'
                        return (
                          <motion.button
                            key={i}
                            type="button"
                            onClick={() => clickable && onInsightClick?.(ins)}
                            initial={{ opacity: 0, scale: 0.96 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.06 }}
                            className={`focus-ring inline-flex items-center gap-2 rounded-xl px-3 py-2 text-left ring-1 ring-inset transition ${INSIGHT_TONE[ins.tone]} ${
                              clickable ? 'cursor-pointer hover:brightness-95' : 'cursor-default'
                            }`}
                          >
                            <Icon className="h-4 w-4 shrink-0" strokeWidth={2.3} />
                            <span className="leading-tight">
                              <span className="block text-xs font-bold">{ins.title}</span>
                              <span className="block text-[11px] opacity-80">{ins.text}</span>
                            </span>
                          </motion.button>
                        )
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Honest footer — set expectations, keep trust. */}
                {allRevealed && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="mt-4 flex items-center gap-1.5 border-t border-slate-100 pt-3 text-[11px] text-slate-400"
                  >
                    <Info className="h-3.5 w-3.5" />
                    Generated just now from live order data. Always tap an order for the full detail.
                  </motion.p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
