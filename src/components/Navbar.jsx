import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Cog, Mail, Phone, ChevronDown, LifeBuoy, User, Wrench, LogOut } from 'lucide-react'
import { COMPANY } from '../data/orders'
import { initials } from '../utils/format'
import { useAuth } from '../auth/AuthContext'

/** The brand mark — a machined cog. Reused from the favicon for consistency. */
function LogoMark() {
  return (
    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 shadow-sm">
      <Cog className="h-5 w-5 text-white" strokeWidth={2.2} />
    </div>
  )
}

/**
 * Role pill — at-a-glance proof of which access level the session has. Team
 * gets the amber "ops" treatment; customers get the calm brand blue.
 */
function RoleBadge({ role }) {
  const isTeam = role === 'team'
  const Icon = isTeam ? Wrench : User
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
        isTeam
          ? 'bg-amber-50 text-amber-700 ring-amber-200'
          : 'bg-brand-50 text-brand-700 ring-brand-200'
      }`}
    >
      <Icon className="h-3.5 w-3.5" strokeWidth={2.2} />
      {isTeam ? 'Team' : 'Customer'}
    </span>
  )
}

/**
 * Signed-in user chip with a dropdown holding identity details, the support
 * line to the account manager, and logout.
 */
function UserMenu() {
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const am = COMPANY.accountManager

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="focus-ring flex items-center gap-2 rounded-full border border-slate-200 bg-white py-1 pl-1 pr-2.5 transition hover:border-slate-300 hover:shadow-sm"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-violet-500 text-[11px] font-bold text-white">
          {initials(user.name)}
        </span>
        <span className="hidden text-xs font-semibold text-slate-700 sm:block">{user.name}</span>
        <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* click-away catcher */}
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.98 }}
              transition={{ duration: 0.16 }}
              className="surface absolute right-0 z-50 mt-2 w-72 p-4"
            >
              {/* Identity */}
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-violet-500 text-sm font-bold text-white">
                  {initials(user.name)}
                </span>
                <div className="min-w-0 leading-tight">
                  <p className="truncate text-sm font-semibold text-slate-900">{user.name}</p>
                  <p className="truncate text-xs text-slate-500">{user.title}</p>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                <span className="font-mono text-xs text-slate-500">{user.userId}</span>
                <RoleBadge role={user.role} />
              </div>

              {/* Support line */}
              <div className="mt-4 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                <LifeBuoy className="h-3.5 w-3.5" /> Need an update?
              </div>
              <div className="mt-2 space-y-1">
                <a
                  href={`mailto:${am.email}`}
                  className="focus-ring flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-slate-600 transition hover:bg-slate-50"
                >
                  <Mail className="h-4 w-4 text-slate-400" /> {am.email}
                </a>
                <a
                  href={`tel:${am.phone.replace(/\s/g, '')}`}
                  className="focus-ring flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-slate-600 transition hover:bg-slate-50"
                >
                  <Phone className="h-4 w-4 text-slate-400" /> {am.phone}
                </a>
              </div>

              {/* Logout */}
              <button
                onClick={logout}
                className="focus-ring mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
              >
                <LogOut className="h-4 w-4" /> Sign out
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

/**
 * Top navigation. Trust signals live here on purpose: clear brand + "Parts
 * Tracking" so users know where they are, a live-sync indicator (the antidote
 * to "is this up to date?" anxiety), the role they're signed in as, and a
 * one-tap line to a named account manager via the user menu.
 */
export default function Navbar() {
  const { user } = useAuth()

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <LogoMark />
          <div className="leading-tight">
            <p className="text-sm font-bold tracking-tight text-slate-900">{COMPANY.name}</p>
            <p className="text-[11px] font-medium text-slate-500">Parts Tracking Portal</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden sm:block">
            <RoleBadge role={user.role} />
          </div>

          {/* Live sync indicator */}
          <div className="hidden items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200 lg:flex">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-emerald-400" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            Live · synced just now
          </div>

          <UserMenu />
        </div>
      </div>
    </header>
  )
}
