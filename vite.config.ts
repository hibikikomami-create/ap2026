import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/ap2026/',
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('react-dom') || id.includes('react-router')) return 'vendor-react'
          if (id.includes('node_modules/react/') || id.includes('node_modules/scheduler')) return 'vendor-react'
          if (id.includes('zustand') || id.includes('nanoid')) return 'vendor-state'
        },
      },
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: false,
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
  },
})
