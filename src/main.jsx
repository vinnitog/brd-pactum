import React from 'react'
import ReactDOM from 'react-dom/client'
import AppRouter from './components/AppRouter.jsx'
import App from './App.jsx'
import { AuthProvider } from './contexts/AuthContext.jsx'
import './styles/index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </AppRouter>
  </React.StrictMode>
)
