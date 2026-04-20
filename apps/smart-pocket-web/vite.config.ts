import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // Base path: /ui/ for remote, / for localhost
  // For localhost dev: base should be / (no subpath)
  // For remote dev: base should be /ui/ (served at subpath)
  base: process.env.VITE_BASE_URL || '/',
  plugins: [react()],
  server: {
    allowedHosts: [
      'localhost',
      'localhost:5173',
      '127.0.0.1',
      'smartpocket-dev.nicenature.space',
    ],
    hmr: {
      host: 'smartpocket-dev.nicenature.space',
      protocol: 'wss',
      port: 443,
      path: '/@vite/ws',
    },
  },
})
