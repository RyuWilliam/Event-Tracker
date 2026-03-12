import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
    port: 5173,
    proxy: {
      '/tracker/api': {
        target: 'http://localhost:7022',
        changeOrigin: true,
      },
      '/images': {
        target: 'http://localhost:7022/tracker/api',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/images/, '/images'),
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
