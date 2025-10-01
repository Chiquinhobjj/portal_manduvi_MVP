import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    host: true,
    hmr: {
      port: 5173,
    }
  },
  define: {
    __WS_TOKEN__: JSON.stringify(''),
  },
  // Reduzir logs em desenvolvimento
  logLevel: 'warn',
  clearScreen: false
});
