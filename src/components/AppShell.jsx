import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'
import { isAdvogado } from '../lib/permissions.js'
import Logo from './Logo.jsx'

function NavItem({ to, children, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `rounded-lg px-3 py-1.5 text-sm font-medium transition ${
          isActive ? 'bg-brd/15 text-brd-200' : 'text-white/60 hover:text-white'
        }`
      }
    >
      {children}
    </NavLink>
  )
}

export default function AppShell({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const initials = (user?.name || '?')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()

  return (
    <div className="min-h-full">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-black/70 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
          <Link to="/" className="shrink-0">
            <Logo />
          </Link>
          <nav className="ml-2 hidden items-center gap-1 md:flex">
            <NavItem to="/" end>
              Início
            </NavItem>
            <NavItem to="/clientes">Clientes</NavItem>
            <NavItem to="/fornecedores">Fornecedores</NavItem>
            <NavItem to="/agenda">Agenda</NavItem>
            {isAdvogado(user) && <NavItem to="/dashboard">Dashboard</NavItem>}
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium leading-tight text-white">{user?.name}</p>
              <p className="text-xs capitalize leading-tight text-white/40">{user?.role}</p>
            </div>
            <div className="grid h-9 w-9 place-items-center rounded-full bg-brd/20 text-sm font-bold text-brd-200">
              {initials}
            </div>
            <button
              onClick={() => {
                logout()
                navigate('/login')
              }}
              className="rounded-lg border border-white/10 px-2.5 py-1.5 text-xs text-white/60 transition hover:text-white"
            >
              Sair
            </button>
          </div>
        </div>
        {/* Nav mobile */}
        <nav className="flex items-center gap-1 overflow-x-auto border-t border-white/5 px-4 py-2 md:hidden">
          <NavItem to="/" end>
            Início
          </NavItem>
          <NavItem to="/clientes">Clientes</NavItem>
          <NavItem to="/fornecedores">Fornecedores</NavItem>
          <NavItem to="/agenda">Agenda</NavItem>
          {isAdvogado(user) && <NavItem to="/dashboard">Dashboard</NavItem>}
        </nav>
      </header>
      <main className="mx-auto w-full max-w-6xl px-4 py-8">{children}</main>
    </div>
  )
}
