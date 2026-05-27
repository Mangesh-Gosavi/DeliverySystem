import { AuthProvider } from './auth/AuthContext'
import ProtectedRoute from './auth/ProtectedRoute'
import Login from './components/Login'
import Dashboard from './components/Dashboard'

/**
 * App shell. AuthProvider holds the session (and restores it from storage on
 * load, so a refresh stays signed in); ProtectedRoute then gates the dashboard
 * behind a valid session, falling back to the login screen otherwise.
 */
export default function App() {
  return (
    <AuthProvider>
      <ProtectedRoute fallback={<Login />}>
        <Dashboard />
      </ProtectedRoute>
    </AuthProvider>
  )
}
