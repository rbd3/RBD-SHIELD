import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Raise the warning threshold slightly — real fix is manual chunking below.
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Web3 / wallet stack — rarely changes, cache-friendly chunk
          if (
            id.includes('wagmi') ||
            id.includes('viem') ||
            id.includes('@wagmi') ||
            id.includes('abitype') ||
            id.includes('@tanstack')
          ) {
            return 'web3';
          }
          // React runtime — almost never changes
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'vendor';
          }
        },
      },
    },
  },
})

