import { Routes, Route } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import Login from './pages/Login.jsx'
import Home from './pages/Home.jsx'
import PartyList from './pages/PartyList.jsx'
import PartyDetail from './pages/PartyDetail.jsx'
import NewContract from './pages/NewContract.jsx'
import Agenda from './pages/Agenda.jsx'
import Dashboard from './pages/Dashboard.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />
      <Route
        path="/clientes"
        element={
          <ProtectedRoute>
            <PartyList kind="cliente" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/fornecedores"
        element={
          <ProtectedRoute>
            <PartyList kind="fornecedor" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/parte/:id"
        element={
          <ProtectedRoute>
            <PartyDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/parte/:id/contratos/novo"
        element={
          <ProtectedRoute requireAdvogado>
            <NewContract />
          </ProtectedRoute>
        }
      />
      <Route
        path="/agenda"
        element={
          <ProtectedRoute>
            <Agenda />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute requireAdvogado>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="*"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}
