import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    allowedHosts: ['artistry-app.com', 'www.artistry-app.com'],
    proxy: {
      '/api': {
        target: 'http://api:8080',
        changeOrigin: true,
      },
      '/auth': {
        target: 'http://api:8080',
        changeOrigin: true,
      },
    }
  }
})
