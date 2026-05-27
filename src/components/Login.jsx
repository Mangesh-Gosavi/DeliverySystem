import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Cog,
  User,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Wrench,
} from 'lucide-react'
import { useAuth } from '../auth/AuthContext'
import { authenticate } from '../auth/authService'
import { COMPANY } from '../data/orders'
import { DEMO_LOGINS } from '../data/users'

/** One labelled, icon-prefixed text field with inline validation messaging. */
function Field({ id, label, type, value, onChange, placeholder, icon: Icon, error, trailing, autoComplete, disabled }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-slate-700">
        {label}
      </label>
      <div className="relative mt-1.5">
        <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`focus-ring w-full rounded-xl border bg-white py-2.5 pl-9 pr-10 text-sm text-slate-800 placeholder:text-slate-400 transition disabled:cursor-not-allowed disabled:bg-slate-50 ${
            error ? 'border-rose-300 focus:border-rose-400' : 'border-slate-200 focus:border-brand-400'
          }`}
        />
        {trailing}
      </div>
      {error && (
        <p id={`${id}-error`} className="mt-1.5 flex items-center gap-1 text-xs font-medium text-rose-600">
          <AlertCircle className="h-3.5 w-3.5" /> {error}
        </p>
      )}
    </div>
  )
}

export default function Login() {
  const { signIn } = useAuth()

  const [userId, setUserId] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})

  // 'idle' | 'submitting' | 'success' | 'error' — drives loading / messaging
  // and (with the button's disabled state) guarantees one request at a time.
  const [status, setStatus] = useState('idle')
  const [formError, setFormError] = useState('')
  const [welcome, setWelcome] = useState('')

  const isBusy = status === 'submitting' || status === 'success'

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (isBusy) return // single-flight guard: ignore extra clicks / Enter presses

    // Field-level validation before we even attempt to authenticate.
    const nextErrors = {}
    if (!userId.trim()) nextErrors.userId = 'User ID is required'
    if (!password) nextErrors.password = 'Password is required'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    setStatus('submitting')
    setFormError('')

    try {
      const account = await authenticate(userId, password)
      setStatus('success')
      setWelcome(account.name)
      // Let the success state breathe, then commit the session → the gate in
      // App.jsx swaps this screen for the dashboard.
      setTimeout(() => signIn(account), 700)
    } catch (err) {
      setStatus('error')
      setFormError(err.message)
    }
  }

  const fillDemo = (demo) => {
    if (isBusy) return
    setUserId(demo.userId)
    setPassword(demo.password)
    setErrors({})
    setStatus('idle')
    setFormError('')
  }

  // Reset transient error states the moment the user edits a field.
  const onField = (setter) => (e) => {
    setter(e.target.value)
    if (status === 'error') {
      setStatus('idle')
      setFormError('')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="grid w-full max-w-4xl overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-card lg:grid-cols-2"
      >
        {/* ---------- Brand / marketing panel (desktop) ---------- */}
        <div className="relative hidden flex-col justify-between bg-gradient-to-br from-brand-600 via-brand-700 to-violet-700 p-10 text-white lg:flex">
          <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_1px_1px,#fff_1px,transparent_0)] [background-size:22px_22px]" />
          <div className="relative">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
                <Cog className="h-6 w-6" strokeWidth={2.2} />
              </div>
              <div className="leading-tight">
                <p className="text-sm font-bold">{COMPANY.name}</p>
                <p className="text-xs text-white/70">Parts Tracking Portal</p>
              </div>
            </div>
            <h2 className="mt-12 text-3xl font-bold leading-tight tracking-tight">
              One live source of truth for every custom part.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-white/80">
              Track production, QC, shipping and delivery in real time — no more chasing WhatsApp threads
              for a status.
            </p>
          </div>
          <div className="relative mt-10 space-y-3 text-sm">
            <p className="flex items-center gap-2.5 text-white/90">
              <ShieldCheck className="h-4 w-4 shrink-0" /> Customers see only their own orders, securely.
            </p>
            <p className="flex items-center gap-2.5 text-white/90">
              <Wrench className="h-4 w-4 shrink-0" /> The team manages every order from one dashboard.
            </p>
          </div>
        </div>

        {/* ---------- Login form ---------- */}
        <div className="p-7 sm:p-10">
          {/* Compact brand mark for mobile, where the panel above is hidden. */}
          <div className="mb-6 flex items-center gap-3 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600">
              <Cog className="h-5 w-5 text-white" strokeWidth={2.2} />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-bold text-slate-900">{COMPANY.name}</p>
              <p className="text-[11px] font-medium text-slate-500">Parts Tracking Portal</p>
            </div>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Sign in</h1>
          <p className="mt-1 text-sm text-slate-500">Welcome back. Enter your credentials to continue.</p>

          {/* Status banner: error (invalid creds) or success (welcome). */}
          <AnimatePresence mode="wait">
            {status === 'error' && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="mt-5 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-sm text-rose-700"
                role="alert"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{formError}</span>
              </motion.div>
            )}
            {status === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="mt-5 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-3 text-sm text-emerald-700"
                role="status"
              >
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                <span>Welcome back, {welcome}! Taking you to your dashboard…</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4" noValidate>
            <Field
              id="userId"
              label="User ID"
              type="text"
              value={userId}
              onChange={onField(setUserId)}
              placeholder="e.g. CUST-1001"
              icon={User}
              error={errors.userId}
              autoComplete="username"
              disabled={isBusy}
            />

            <Field
              id="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={onField(setPassword)}
              placeholder="Enter your password"
              icon={Lock}
              error={errors.password}
              autoComplete="current-password"
              disabled={isBusy}
              trailing={
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="focus-ring absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
            />

            <button
              type="submit"
              disabled={isBusy}
              className="focus-ring flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {status === 'submitting' ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Signing in…
                </>
              ) : status === 'success' ? (
                <>
                  <CheckCircle2 className="h-4 w-4" /> Signed in
                </>
              ) : (
                <>
                  Sign in <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Demo credentials — one-tap fill so reviewers don't have to type. */}
          <div className="mt-7 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Demo accounts — tap to fill
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {DEMO_LOGINS.map((demo) => (
                <button
                  key={demo.userId}
                  type="button"
                  onClick={() => fillDemo(demo)}
                  disabled={isBusy}
                  className="focus-ring rounded-lg border border-slate-200 bg-white px-3 py-2 text-left transition hover:border-brand-300 hover:shadow-sm disabled:opacity-60"
                >
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                    {demo.role === 'team' ? (
                      <Wrench className="h-3 w-3 text-amber-500" />
                    ) : (
                      <User className="h-3 w-3 text-brand-500" />
                    )}
                    {demo.label}
                  </span>
                  <span className="mt-0.5 block font-mono text-[11px] text-slate-400">{demo.userId}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
