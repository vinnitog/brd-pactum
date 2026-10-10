import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => ({
  base: mode === 'github-pages' ? '/brd-pactum/' : '/',
  plugins: [react()],
  // Mantém o alvo anterior do Vite 5 ao atualizar o tooling.
  build: { target: ['es2020', 'edge88', 'firefox78', 'chrome87', 'safari14'] },
  test: { include: ['unit/**/*.dom.test.jsx'] },
  server: { port: 5174, open: false }
}))
