import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/ohmyposh-configurator/',
  define: {
    global: 'globalThis',
  },
  build: {
    // Enable CSS code splitting for better caching
    cssCodeSplit: true,
    // Minify CSS for production
    cssMinify: true,
    // Optimize chunk splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate vendor chunks for better caching
          'react-vendor': ['react', 'react-dom'],
          'dnd-vendor': ['@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities'],
          'config-vendor': ['zustand', '@iarna/toml', 'js-yaml'],
        },
        // Use content-based hashing for long-term caching
        assetFileNames: (assetInfo) => {
          // Keep fonts in /fonts/ directory with hash
          if (assetInfo.name?.endsWith('.woff2') || assetInfo.name?.endsWith('.ttf')) {
            return 'fonts/[name]-[hash][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        },
      },
    },
    // Increase chunk size warning limit for vendor chunks
    chunkSizeWarningLimit: 600,
  },
})

