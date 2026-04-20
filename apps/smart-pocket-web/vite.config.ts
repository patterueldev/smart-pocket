import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // Base path for the app - served at /ui/ when behind nginx, root (/) for localhost
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
