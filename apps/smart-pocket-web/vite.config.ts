import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  // Base path: serve from root
  base: '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: [
      'localhost',
      'localhost:5173',
      '127.0.0.1',
      'smartpocket-dev.nicenature.space',
    ],
    hmr: getHmrConfig(),
    watch: {
      // Use polling for file watching in Docker volumes
      // Poll every 50ms to catch file changes quickly
      usePolling: true,
      interval: 50,
    },
    middlewareMode: false,
    // Disable all caching in development
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
  },
  // Optimize dependencies caching - disable for dev
  optimizeDeps: {
    noDiscovery: false,
  },
})

/**
 * Get HMR (Hot Module Replacement) config based on environment
 * Supports both local development and Docker environments
 */
function getHmrConfig() {
  const isDocker = process.env.NODE_ENV === 'docker'
  
  if (isDocker) {
    // In Docker, HMR connects to the hostname provided by the environment
    // This allows hot reload from remote clients (not just localhost)
    return {
      host: process.env.VITE_HMR_HOST || 'smartpocket-dev.nicenature.space',
      protocol: process.env.VITE_HMR_PROTOCOL || 'ws',
      port: parseInt(process.env.VITE_HMR_PORT || '443'),
      path: '/@vite/ws',
    }
  }

  // Local development: use localhost
  return {
    host: 'localhost',
    protocol: 'ws',
    port: 5173,
    path: '/@vite/ws',
  }
}

