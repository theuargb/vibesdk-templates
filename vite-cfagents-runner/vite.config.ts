import { defineConfig } from 'vite'
import path from "path"
import react from '@vitejs/plugin-react'

import { cloudflare } from "@cloudflare/vite-plugin";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), cloudflare()],
  build: {
    minify: false,
    sourcemap: true,    
  },
  server: {
    allowedHosts: true,
    warmup: {
      clientFiles: ['./src/components/ui/*.tsx', './src/*.tsx'],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    // This is still crucial for reducing the time from when `bun run dev`
    // is executed to when the server is actually ready.
    include: ['react', 'react-dom', 'react-router-dom'],
    exclude: ['agents'], // Exclude agents package from pre-bundling due to Node.js dependencies
  },
  define: {
    // Define Node.js globals for the agents package
    global: 'globalThis',
  },
})