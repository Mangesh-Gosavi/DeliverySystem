import { Search, X, ArrowUpDown } from 'lucide-react'
import { STATUS } from '../config/statusConfig'

const STATUS_OPTIONS = [
  { key: 'all', label: 'All', dot: 'bg-slate-400' },
  ...Object.values(STATUS)
    .sort((a, b) => a.order - b.order)
    .map((s) => ({ key: s.key, label: s.label, dot: s.dot })),
]

export const SORT_OPTIONS = [
  { key: 'priority', label: 'Priority' },
  { key: 'delivery', label: 'Delivery date' },
  { key: 'updated', label: 'Recently updated' },
]

/**
 * Search + status filter + sort. Filtering by status is the #1 thing an ops
 * user does ("show me what's delayed"), so the status chips are front-and-centre
 * with live counts rather than buried in a dropdown.
 */
export default function FilterBar({
  query,
  onQuery,
  statusFilter,
  onStatusFilter,
  sort,
  onSort,
  counts,
  resultCount,
  placeholder = 'Search order, part or customer…',
}) {
  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder={placeholder}
            className="focus-ring w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-9 text-sm text-slate-700 placeholder:text-slate-400 transition focus:border-brand-400"
          />
          {query && (
            <button
              onClick={() => onQuery('')}
              className="focus-ring absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2">
          <ArrowUpDown className="h-4 w-4 text-slate-400" />
          <label className="text-xs font-medium text-slate-500" htmlFor="sort">
            Sort by
          </label>
          <select
            id="sort"
            value={sort}
            onChange={(e) => onSort(e.target.value)}
            className="focus-ring rounded-lg border border-slate-200 bg-white py-1.5 pl-2 pr-7 text-sm font-medium text-slate-700"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.key} value={o.key}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Status filter chips */}
      <div className="flex flex-wrap items-center gap-2">
        {STATUS_OPTIONS.map((opt) => {
          const active = statusFilter === opt.key
          const count = opt.key === 'all' ? counts.all : counts[opt.key] ?? 0
          return (
            <button
              key={opt.key}
              onClick={() => onStatusFilter(opt.key)}
              className={`focus-ring inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                active
                  ? 'border-slate-900 bg-slate-900 text-white'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${opt.dot} ${active && opt.key === 'all' ? 'bg-white' : ''}`} />
              {opt.label}
              <span className={active ? 'text-white/70' : 'text-slate-400'}>{count}</span>
            </button>
          )
        })}
        <span className="ml-auto hidden text-xs text-slate-400 sm:block">
          {resultCount} {resultCount === 1 ? 'order' : 'orders'} shown
        </span>
      </div>
    </div>
  )
}
