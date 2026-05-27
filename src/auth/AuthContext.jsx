import { createContext, useContext, useCallback, useState } from 'react'

/**
 * Auth state for the whole app. The signed-in user (never the password) is
 * mirrored into localStorage, so a refresh keeps you logged in — the gate in
 * App.jsx reads `user` to decide between the login screen and the dashboard.
 */
const SESSION_KEY = 'axle-auth-session-v1'

const AuthContext = createContext(null)

function loadSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null // private mode / disabled storage → just start logged out
  }
}

export function AuthProvider({ children }) {
  // Initialise straight from storage so the session survives a page refresh.
  const [user, setUser] = useState(loadSession)

  /** Commit a verified account as the active session. */
  const signIn = useCallback((account) => {
    const session = {
      userId: account.userId,
      role: account.role,
      name: account.name,
      title: account.title ?? '',
      company: account.company ?? null,
    }
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session))
    } catch {
      /* fail silently — session still lives in memory for this tab */
    }
    setUser(session)
    return session
  }, [])

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(SESSION_KEY)
    } catch {
      /* no-op */
    }
    setUser(null)
  }, [])

  return <AuthContext.Provider value={{ user, signIn, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an <AuthProvider>')
  return ctx
}
