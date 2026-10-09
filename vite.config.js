import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => ({
  base: mode === 'github-pages' ? '/brd-pactum/' : '/',
  plugins: [react()],
  test: { include: ['unit/**/*.dom.test.jsx'] },
  server: { port: 5174, open: false }
}))
