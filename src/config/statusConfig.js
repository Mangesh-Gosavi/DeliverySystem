import {
  Factory,
  ShieldCheck,
  PackageCheck,
  Truck,
  CheckCircle2,
  AlertTriangle,
  ClipboardList,
  Boxes,
} from 'lucide-react'

/**
 * Single source of truth for every status the customer can see.
 *
 * Product decision: customers don't speak in internal codes, so each status
 * carries (a) a plain-language label, (b) a one-line "what this means for you"
 * description, and (c) a consistent colour so the same meaning always looks the
 * same across cards, table rows, badges and the timeline.
 *
 * Tailwind classes are written out in full (never string-concatenated) so the
 * JIT compiler can see and keep them.
 */
export const STATUS = {
  in_production: {
    key: 'in_production',
    label: 'In Production',
    description: 'Your parts are actively being machined on the shop floor.',
    icon: Factory,
    progress: 45,
    order: 1,
    accent: '#2563eb',
    badge: 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200',
    dot: 'bg-blue-500',
    soft: 'bg-blue-50',
    text: 'text-blue-700',
    bar: 'bg-blue-500',
  },
  qc: {
    key: 'qc',
    label: 'Quality Check',
    description: 'Parts are being inspected against your spec and tolerances.',
    icon: ShieldCheck,
    progress: 68,
    order: 2,
    accent: '#7c3aed',
    badge: 'bg-violet-50 text-violet-700 ring-1 ring-inset ring-violet-200',
    dot: 'bg-violet-500',
    soft: 'bg-violet-50',
    text: 'text-violet-700',
    bar: 'bg-violet-500',
  },
  ready_to_ship: {
    key: 'ready_to_ship',
    label: 'Ready to Ship',
    description: 'QC passed — packed and scheduled for dispatch.',
    icon: PackageCheck,
    progress: 85,
    order: 3,
    accent: '#d97706',
    badge: 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200',
    dot: 'bg-amber-500',
    soft: 'bg-amber-50',
    text: 'text-amber-700',
    bar: 'bg-amber-500',
  },
  delivered: {
    key: 'delivered',
    label: 'Delivered',
    description: 'Handed over and confirmed received. Order complete.',
    icon: CheckCircle2,
    progress: 100,
    order: 4,
    accent: '#059669',
    badge: 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200',
    dot: 'bg-emerald-500',
    soft: 'bg-emerald-50',
    text: 'text-emerald-700',
    bar: 'bg-emerald-500',
  },
  delayed: {
    key: 'delayed',
    label: 'Delayed',
    description: 'Production is held up — see the reason and revised date below.',
    icon: AlertTriangle,
    progress: 55,
    order: 5,
    accent: '#dc2626',
    badge: 'bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200',
    dot: 'bg-rose-500',
    soft: 'bg-rose-50',
    text: 'text-rose-700',
    bar: 'bg-rose-500',
  },
}

export const getStatus = (key) => STATUS[key] ?? STATUS.in_production

/** Priority drives sorting and urgency cues. High = customer is waiting on us. */
export const PRIORITY = {
  high: {
    key: 'high',
    label: 'High',
    rank: 3,
    badge: 'bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200',
    dot: 'bg-rose-500',
  },
  medium: {
    key: 'medium',
    label: 'Medium',
    rank: 2,
    badge: 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200',
    dot: 'bg-amber-500',
  },
  low: {
    key: 'low',
    label: 'Standard',
    rank: 1,
    badge: 'bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200',
    dot: 'bg-slate-400',
  },
}

export const getPriority = (key) => PRIORITY[key] ?? PRIORITY.low

/**
 * The canonical manufacturing pipeline, rendered as a stepper at the top of the
 * detail view. Keeping it separate from the timeline event log lets us show
 * BOTH "where are we in the journey" (stepper) and "what happened when" (log).
 */
export const PIPELINE = [
  { key: 'order_placed', label: 'Order Placed', icon: ClipboardList },
  { key: 'materials', label: 'Materials', icon: Boxes },
  { key: 'in_production', label: 'Production', icon: Factory },
  { key: 'qc', label: 'Quality Check', icon: ShieldCheck },
  { key: 'ready_to_ship', label: 'Ready to Ship', icon: PackageCheck },
  { key: 'shipped', label: 'Shipped', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle2 },
]

/** Which pipeline step a given order status currently sits on. */
export const STATUS_TO_STEP = {
  in_production: 2,
  qc: 3,
  ready_to_ship: 4,
  delivered: 6,
  delayed: 2, // delayed orders visually stall on the production step
}
