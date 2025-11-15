// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // these are the proxies for backend API calls
    // going to localhost:5173/spotify/login will be proxied to localhost:8888/spotify/login
    proxy: {
      '/auth':   { target: 'http://127.0.0.1:8888', changeOrigin: true },
      '/spotify/login':  { target: 'http://127.0.0.1:8888', changeOrigin: true },
      '/auth/spotify/callback':  { target: 'http://127.0.0.1:8888', changeOrigin: true },
      '/spotify':{ target: 'http://127.0.0.1:8888', changeOrigin: true },
      '/health': { target: 'http://127.0.0.1:8888', changeOrigin: true },
      '/yt/search':      { target: 'http://127.0.0.1:8888', changeOrigin: true, safeSearching: true },
      '/yt/login':       { target: 'http://127.0.0.1:8888', changeOrigin: true },
    }
  }
})
