import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import {nextui} from "@nextui-org/react"
import { resolve } from 'path'

const port = process.env.VITE_PORT || 3000

export default defineConfig({
  plugins: [react(), nextui()],
  base: '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    copyPublicDir: true,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.name.endsWith('.png') ||
              assetInfo.name.endsWith('.jpg') ||
              assetInfo.name.endsWith('.svg')) {
            return '[name][extname]'
          }
          return 'assets/[name]-[hash][extname]'
        }
      }
    }
  },
  optimizeDeps: {
    include: [
      '@uppy/core',
      '@uppy/dashboard',
      '@uppy/react',
      "openai"
    ]
  },

  publicDir: 'public',
  server: {
    port: port,
    host: true,
    strictPort: true,
  }
})
