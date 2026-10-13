import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// base relativo: así el build funciona sin importar bajo qué carpeta
// de GitHub Pages termine sirviéndose (repo root, /web, etc.)
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    outDir: 'dist',
  },
})
