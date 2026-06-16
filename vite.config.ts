/// <reference types="vitest/config" />
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The build and dev server. Application configuration (such as the API base URL) is never
// hardcoded here; it is read from VITE_ prefixed environment variables at runtime. See
// src/services/config.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 3000,
  },
  preview: {
    port: 3000,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: true,
    // Deterministic configuration for tests. These are not secrets and never reach a real
    // environment; they only satisfy the config loader so components render under jsdom.
    env: {
      VITE_API_BASE_URL: 'http://localhost:5099',
      VITE_APP_NAME: 'FarmersQuest',
      VITE_APP_ENVIRONMENT: 'Test',
    },
  },
});
