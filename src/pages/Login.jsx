import { useNavigate } from 'react-router-dom'
import { useAuth, DEMO_ACCOUNTS } from '../contexts/AuthContext.jsx'
import Logo from '../components/Logo.jsx'
import { Card } from '../components/ui/index.jsx'

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
                  <span className="block text-xs capitalize text-muted">
                    {acc.role === 'advogado' ? 'Advogado BRD · acesso total' : 'Cliente · acesso ao próprio cadastro'}
                  </span>
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
