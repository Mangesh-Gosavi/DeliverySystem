import { ACCOUNTS } from '../data/users'

/**
 * Mock authentication — there is no backend. `authenticate` returns a Promise so
 * the UI gets a *real* async lifecycle (loading → success / error) to render
 * against, exactly as it would against a live API.
 *
 * It only VERIFIES credentials; committing the session is the AuthContext's job
 * (see auth/AuthContext.jsx). Keeping verify and commit separate lets the login
 * screen show a brief "welcome" state before it hands control to the dashboard.
 */
export const AUTH_DELAY_MS = 800

export function authenticate(userId, password) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const id = (userId || '').trim()
      const account = ACCOUNTS.find((a) => a.userId.toLowerCase() === id.toLowerCase())

      if (!account || account.password !== password) {
        reject(new Error('Invalid user ID or password. Please check your credentials and try again.'))
        return
      }

      // Strip the password before it ever leaves this layer.
      const { password: _pw, ...safeAccount } = account
      resolve(safeAccount)
    }, AUTH_DELAY_MS)
  })
}
