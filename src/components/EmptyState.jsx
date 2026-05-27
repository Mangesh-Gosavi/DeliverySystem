import { PackageSearch } from 'lucide-react'

/** Shown when filters match no orders — never leave the user staring at blank space. */
export default function EmptyState({ onReset }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
        <PackageSearch className="h-7 w-7 text-slate-400" />
      </div>
      <p className="mt-4 text-sm font-semibold text-slate-700">No orders match your filters</p>
      <p className="mt-1 max-w-xs text-sm text-slate-500">
        Try a different search term or clear the filters to see your full order book.
      </p>
      {onReset && (
        <button
          onClick={onReset}
          className="focus-ring mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
        >
          Clear filters
        </button>
      )}
    </div>
  )
}
