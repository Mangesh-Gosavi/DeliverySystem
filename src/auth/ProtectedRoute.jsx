import { useAuth } from './AuthContext'

/**
 * Route guard. Renders `children` only when there is an authenticated session;
 * otherwise it renders `fallback` (the login screen). With no router in this
 * SPA, this is the single gate that protects the dashboard — and because the
 * session is read from storage on load, a refresh stays on the protected view.
 */
export default function ProtectedRoute({ fallback, children }) {
  const { user } = useAuth()
  if (!user) return fallback
  return children
}
