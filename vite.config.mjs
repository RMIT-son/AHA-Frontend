import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://5aa7e42e3cbd.ngrok-free.app',
        changeOrigin: true,
        headers: {
          // 'Host': 'data.com',
          'ngrok-skip-browser-warning': 'true'
        }
      }
    }
  }
})
