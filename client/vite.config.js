import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Override: VITE_PROXY_TARGET=http://192.168.1.10:5000 npm run dev
// berguna saat server backend jalan di PC / mesin lain.
const API_TARGET = process.env.VITE_PROXY_TARGET || 'http://localhost:5000'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    host: true,
    proxy: {
      '/api': {
        target: API_TARGET,
        changeOrigin: true,
      },
    },
    allowedHosts: ['.trycloudflare.com'],
  },
  preview: {
    host: true,
    proxy: {
      '/api': {
        target: API_TARGET,
        changeOrigin: true,
      },
    },
    allowedHosts: ['.trycloudflare.com'],
  },
  build: {
    modulePreload: { polyfill: false },
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined
          const p = id.split('\\').join('/')
          if (p.includes('/three/') || p.includes('three-stdlib')) return 'three'
          if (p.includes('@react-three')) return 'r3f'
          if (p.includes('react-router')) return 'router'
          if (p.includes('framer-motion')) return 'motion'
          if (p.includes('lucide')) return 'icons'
          if (p.includes('tiptap') || p.includes('@tiptap')) return 'editor'
          if (p.includes('/react/') || p.includes('/react-dom/') || p.includes('/scheduler/')) return 'react'
          if (p.includes('zustand')) return 'state'
          return 'vendor'
        },
      },
    },
  },
})