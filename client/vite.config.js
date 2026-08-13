import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
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