import { resolve } from 'path'
import { defineConfig } from 'electron-vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  main: {
    build: {
      sourcemap: false,
      minify: true,
      bytecode: {
        transformArrowFunctions: true,
        removeBundleJS: true
      },
      rollupOptions: {
        external: ['vosk-koffi']
      }
    }
  },
  preload: {
    build: {
      sourcemap: false,
      minify: true,
      bytecode: {
        transformArrowFunctions: true,
        removeBundleJS: true
      }
    }
  },
  renderer: {
    publicDir: resolve('src/renderer/src/public'),
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src')
      }
    },
    plugins: [react(), tailwindcss()],
    build: {
      sourcemap: false,
      minify: 'esbuild',
      cssMinify: true,
      rollupOptions: {
        output: {
          chunkFileNames: 'assets/[hash].js',
          entryFileNames: 'assets/[hash].js',
          assetFileNames: 'assets/[hash][extname]'
        }
      }
    }
  }
})