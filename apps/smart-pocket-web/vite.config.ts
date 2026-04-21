import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  // Base path: /ui/ for remote, / for localhost
  // For localhost dev: base should be / (no subpath)
  // For remote dev: base should be /ui/ (served at subpath)
  base: process.env.VITE_BASE_URL || '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    allowedHosts: [
      'localhost',
      'localhost:5173',
      '127.0.0.1',
      'smartpocket-dev.nicenature.space',
    ],
    hmr: process.env.VITE_BASE_URL
      ? {
          // Remote development with domain
          // App is served at /ui/, so WebSocket is at /ui/@vite/ws
          host: 'smartpocket-dev.nicenature.space',
          protocol: 'wss',
          port: 443,
          path: '/ui/@vite/ws',
        }
      : {
          // Local development on localhost
          host: 'localhost',
          protocol: 'ws',
          port: 5173,
          path: '/@vite/ws',
        },
    watch: {
      // Use polling for file watching in Docker volumes
      // Poll every 50ms to catch file changes quickly
      usePolling: true,
      interval: 50,
    },
  },
})

