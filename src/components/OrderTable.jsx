import OrderRow, { ROW_GRID } from './OrderRow'
import EmptyState from './EmptyState'

/**
 * The main order book. A real <header> row aligns to each data row via the
 * shared ROW_GRID, giving a clean spreadsheet feel on desktop while the rows
 * gracefully collapse to cards on mobile.
 */
export default function OrderTable({ orders, expandedId, onToggle, onResetFilters, teamMode, onPostUpdate }) {
  return (
    <section className="surface overflow-hidden">
      <div
        className={`hidden border-b border-slate-200/80 bg-slate-50/70 px-6 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 ${ROW_GRID}`}
      >
        <span>Order / Part</span>
        <span>Customer</span>
        <span>Qty</span>
        <span>Status</span>
        <span>Est. Delivery</span>
        <span>Priority</span>
        <span aria-hidden />
      </div>

      <div className="divide-y divide-slate-100">
        {orders.length === 0 ? (
          <EmptyState onReset={onResetFilters} />
        ) : (
          orders.map((order) => (
            <OrderRow
              key={order.id}
              order={order}
              isOpen={expandedId === order.id}
              onToggle={() => onToggle(order.id)}
              teamMode={teamMode}
              onPostUpdate={onPostUpdate}
            />
          ))
        )}
      </div>
    </section>
  )
}
