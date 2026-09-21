import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const AuthContext = createContext(null)
const AUTH_KEY = 'brd-pactum:auth'

// Contas de demonstração, uma por perfil de acesso (Issue #8). A equipe interna
// do BRD enxerga todos os cadastros; cada conta de cliente é vinculada a um party
// (cadastro) e só enxerga o próprio conteúdo. O sócio patrimonial (patrimonial:
// true) é o único que também alcança os dados sensíveis do escritório.
export const DEMO_ACCOUNTS = [
  { id: 'u_socio_patrimonial', name: 'Dra. Beatriz Duarte', role: 'socio', patrimonial: true },
  { id: 'u_socio', name: 'Dr. Rafael Dantas', role: 'socio' },
  { id: 'u_adv', name: 'Dr. Luis Bernardo', role: 'advogado' },
  { id: 'u_estagiario', name: 'Camila Rocha', role: 'estagiario' },
  { id: 'u_carmello', name: 'João Síndico (Carmello 350)', role: 'cliente', partyId: 'party_carmello' },
  { id: 'u_marina', name: 'Marina Alves', role: 'cliente', partyId: 'party_marina' }
]

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem(AUTH_KEY)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })

  useEffect(() => {
    try {
      if (user) localStorage.setItem(AUTH_KEY, JSON.stringify(user))
      else localStorage.removeItem(AUTH_KEY)
    } catch {
      /* ignora */
    }
  }, [user])

  const value = useMemo(
    () => ({
      user,
      login: (account) => setUser(account),
      logout: () => setUser(null)
    }),
    [user]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider')
  return ctx
}
