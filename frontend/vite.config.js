import { defineConfig } from 'vite'

export default defineConfig({
  base: './', // Use relative base path for proxy compatibility
  server: {
    host: '0.0.0.0', // Allow network access (for remote dev, Raspberry Pi, etc.)
    port: 3000,
    strictPort: false, // Try next port if 3000 is taken
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      }
    }
  },
  build: {
    outDir: 'dist',
  }
})
