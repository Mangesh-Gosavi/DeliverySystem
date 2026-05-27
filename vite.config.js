import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite gives us a fast dev server + optimized production build with zero backend.
// This stays a pure SPA — all data is mocked client-side.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
  },
})
