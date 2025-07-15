import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      'be36-2405-4802-813e-4800-e9e2-520e-8f2b-c426.ngrok-free.app'
    ]
  }
})
