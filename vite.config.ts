import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    // Only load Vite-exposed env vars (VITE_*) to avoid accidentally embedding secrets into the client bundle.
    const env = loadEnv(mode, '.', 'VITE_');
    return {
      base: env.VITE_BASE_URL || '/',
      server: {
        port: 3000,
        // Safer default: don't expose the dev server to the whole LAN by default.
        host: '127.0.0.1',
      },
      plugins: [react()],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
