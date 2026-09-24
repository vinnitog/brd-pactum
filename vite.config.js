import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => ({
  base: mode === 'github-pages' ? '/brd-pactum/' : '/',
  plugins: [react()],
  server: { port: 5174, open: false }
}))
