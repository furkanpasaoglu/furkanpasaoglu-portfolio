import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [react()],
  build: {
    sourcemap: false,
    rollupOptions: {
      output: {
        // Split large third-party libraries into their own cached chunks so the
        // main bundle stays small and browsers can cache vendors across deploys.
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'query-vendor': ['@tanstack/react-query'],
          'mantine': ['@mantine/core', '@mantine/form', '@mantine/hooks', '@mantine/notifications'],
          'icons': ['@tabler/icons-react', 'react-icons'],
        },
      },
    },
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
