import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import electron from 'vite-plugin-electron'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    electron([
      {
        // Main process entry
        entry: 'electron/main.ts',
        onstart(options) {
          options.startup()
        },
        vite: {
          resolve: {
            alias: {
              'mock-aws-s3': 'electron/mock-aws.js',
              'aws-sdk': 'electron/mock-aws.js',
              'nock': 'electron/mock-aws.js',
            },
          },
        },
      },
      {
        // Preload scripts entry
        entry: 'electron/preload.ts',
        onstart(options) {
          // Notify the renderer process to reload the page
          // when the preload scripts are rebuilt
          options.reload()
        },
      },
    ]),
  ],
})
