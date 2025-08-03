import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { imageScanner } from './vite-plugin-image-scanner.js'

export default defineConfig({
  plugins: [
    react(),
    imageScanner({
      imagesDir: 'public/images',
      outputFile: 'src/data/imageManifest.js',
      watch: true // Enable hot reload when images are added/removed
    })
  ],
  resolve: {
    alias: {
      '@': '/src',
      '@components': '/src/components',
      '@store': '/src/store',
      '@hooks': '/src/hooks',
      '@utils': '/src/utils',
      '@data': '/src/data'
    }
  },
  server: {
    port: 3000,
    open: true
  }
})