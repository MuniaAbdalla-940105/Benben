import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

// Only VITE_* variables reach the browser bundle (ADR-002 §15). Never add another envPrefix:
// tools/ci/check-bundle-secrets.sh fails the build if a service-role key ends up in dist/.
export default defineConfig({
  plugins: [react()],
  envPrefix: 'VITE_',
  server: { port: 5174, strictPort: true },
  preview: { port: 5174, strictPort: true },
  build: { sourcemap: false },
  test: {
    name: 'admin',
    environment: 'jsdom',
  },
});
