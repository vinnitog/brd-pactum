import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'
import AppShell from './AppShell.jsx'

// `require` é um predicado (user) => boolean vindo de lib/permissions.js.
// Quem não atende cai de volta no início em vez de ver a rota restrita.
export default function ProtectedRoute({ children, require }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (require && !require(user)) return <Navigate to="/" replace />
  return <AppShell>{children}</AppShell>
}
