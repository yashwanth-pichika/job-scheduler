import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/job-scheduler/',
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://job-scheduler-2-x5wh.onrender.com',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
