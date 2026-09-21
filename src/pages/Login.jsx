import { useNavigate } from 'react-router-dom'
import { useAuth, DEMO_ACCOUNTS } from '../contexts/AuthContext.jsx'
import { ROLES, isSocioPatrimonial } from '../lib/permissions.js'
import Logo from '../components/Logo.jsx'
import { Card } from '../components/ui/index.jsx'

// Resumo do que cada perfil enxerga, para orientar a conta de demonstração.
function accountHint(account) {
  if (isSocioPatrimonial(account)) return 'Sócio patrimonial · acesso total, inclusive dados sensíveis'
  switch (account.role) {
    case ROLES.SOCIO:
      return 'Sócio · consulta e edição de clientes'
    case ROLES.ADVOGADO:
      return 'Advogado associado · consulta e edição de clientes'
    case ROLES.ESTAGIARIO:
      return 'Estagiário · consulta os cadastros, sem editar'
    default:
      return 'Cliente · acesso ao próprio cadastro'
  }
}

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()

  function enter(account) {
    login(account)
    navigate('/')
  }

  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <Logo markSize={44} className="scale-125" />
          <p className="mt-4 text-sm text-muted">Serviços + gerenciamento de contratos</p>
        </div>

        <Card>
          <h1 className="mb-4 text-xl font-bold text-white">Entrar como</h1>
          <div className="space-y-2">
            {DEMO_ACCOUNTS.map((acc) => (
              <button
                key={acc.id}
                onClick={() => enter(acc)}
                className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-left transition hover:border-brd/50 hover:bg-brd/5"
              >
                <span>
                  <span className="block text-sm font-semibold text-white">{acc.name}</span>
                  <span className="block text-xs text-muted">{accountHint(acc)}</span>
                </span>
                <span className="text-brd">→</span>
              </button>
            ))}
          </div>
          <p className="mt-4 text-center text-xs text-muted">
            Contas de demonstração. A autenticação real (Supabase) entra na próxima fase.
          </p>
        </Card>
      </div>
    </main>
  )
}
