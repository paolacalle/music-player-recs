// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // these are the proxies for backend API calls
    proxy: {
      '/auth':   { target: 'http://localhost:8888', changeOrigin: true },
      '/spotify':{ target: 'http://localhost:8888', changeOrigin: true },
      '/health': { target: 'http://localhost:8888', changeOrigin: true },
      '/yt/search':      { target: 'http://localhost:8888', changeOrigin: true, safeSearching: true },
    }
  }
})
