/**
 * Skeleton shown during the initial (simulated) data fetch. Mirrors the real
 * layout so the page doesn't jump when content arrives — a small detail that
 * makes the app feel fast and intentional rather than blank-then-pop.
 */
export default function LoadingState() {
  return (
    <div className="space-y-4">
      {/* KPI skeletons */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="surface p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-3">
                <div className="skeleton h-3 w-20" />
                <div className="skeleton h-7 w-12" />
              </div>
              <div className="skeleton h-10 w-10 rounded-xl" />
            </div>
            <div className="skeleton mt-4 h-3 w-24" />
          </div>
        ))}
      </div>

      {/* Distribution skeleton */}
      <div className="surface p-5">
        <div className="skeleton h-3 w-28" />
        <div className="skeleton mt-3 h-3 w-full rounded-full" />
      </div>

      {/* Table skeleton */}
      <div className="surface divide-y divide-slate-100 overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-6 py-5">
            <div className="skeleton h-9 w-1 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="skeleton h-3 w-16" />
              <div className="skeleton h-4 w-40" />
            </div>
            <div className="skeleton hidden h-4 w-28 sm:block" />
            <div className="skeleton h-6 w-24 rounded-full" />
            <div className="skeleton hidden h-4 w-20 sm:block" />
          </div>
        ))}
      </div>
    </div>
  )
}
