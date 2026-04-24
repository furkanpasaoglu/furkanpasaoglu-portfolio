import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [react()],
  build: {
    sourcemap: false,
  },
  server: {
    // Dev proxy: /api/* forwarded to .NET server running in docker on :8080
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/media': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/scalar': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/openapi': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
});
