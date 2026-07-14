import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'
import AppShell from './AppShell.jsx'

export default function ProtectedRoute({ children, requireAdvogado = false }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (requireAdvogado && user.role !== 'advogado') return <Navigate to="/" replace />
  return <AppShell>{children}</AppShell>
}
