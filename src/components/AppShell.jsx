import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'
import { isEquipeBRD, roleLabel } from '../lib/permissions.js'
import Logo from './Logo.jsx'

function NavItem({ to, children, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `inline-flex min-h-11 shrink-0 items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
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
      <a
        className="skip-link"
        href="#main-content"
        onClick={(event) => {
          // O fragmento também representa a rota na publicação do GitHub Pages.
          event.preventDefault()
          document.getElementById('main-content')?.focus()
        }}
      >
        Pular para o conteúdo
      </a>
      <header className="sticky top-0 z-30 border-b border-white/10 bg-black/70 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
          <Link to="/" className="shrink-0">
            <Logo />
          </Link>
          <nav aria-label="Principal" className="ml-2 hidden items-center gap-1 lg:flex">
            <NavItem to="/" end>
              Início
            </NavItem>
            <NavItem to="/cadastros">Cadastros</NavItem>
            <NavItem to="/agenda">Agenda</NavItem>
            {isEquipeBRD(user) && <NavItem to="/dashboard">Dashboard</NavItem>}
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium leading-tight text-white">{user?.name}</p>
              <p className="text-xs leading-tight text-muted">{roleLabel(user)}</p>
            </div>
            <div className="grid h-9 w-9 place-items-center rounded-full bg-brd/20 text-sm font-bold text-brd-200">
              {initials}
            </div>
            <button
              onClick={() => {
                logout()
                navigate('/login')
              }}
              className="min-h-11 rounded-lg border border-white/20 px-3 py-2 text-sm text-white/70 transition-colors hover:bg-white/5 hover:text-white"
            >
              Sair
            </button>
          </div>
        </div>
        {/* Nav mobile */}
        <nav aria-label="Principal compacta" className="flex items-center gap-1 overflow-x-auto border-t border-white/5 px-4 py-2 lg:hidden">
          <NavItem to="/" end>
            Início
          </NavItem>
          <NavItem to="/cadastros">Cadastros</NavItem>
          <NavItem to="/agenda">Agenda</NavItem>
          {isEquipeBRD(user) && <NavItem to="/dashboard">Dashboard</NavItem>}
        </nav>
      </header>
      <main id="main-content" tabIndex={-1} className="mx-auto w-full max-w-6xl scroll-mt-40 px-4 py-8 sm:py-10">{children}</main>
    </div>
  )
}
