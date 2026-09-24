import { BrowserRouter, HashRouter } from 'react-router-dom'

export default function AppRouter({ children }) {
  // Pages não reescreve URLs de SPA; o fragmento mantém links diretos recarregáveis.
  const Router = import.meta.env.MODE === 'github-pages' ? HashRouter : BrowserRouter
  return <Router>{children}</Router>
}
