import { defineConfig } from 'vite'

export default defineConfig({
  base: '/Neon-Runner/',   // <- el nombre exacto de tu repositorio
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    assetsInlineLimit: 0
  }
})