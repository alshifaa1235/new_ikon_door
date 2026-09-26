import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'new-ikon-api',
      configureServer(server) {
        // Dynamically import API handler (ESM)
        let handler;
        server.middlewares.use(async (req, res, next) => {
          if (req.url?.startsWith('/api/')) {
            if (!handler) {
              const { createApiHandler } = await import('./server/api.js');
              handler = createApiHandler();
            }
            return handler(req, res);
          }
          next();
        });
      }
    }
  ],
  server: {
    port: parseInt(process.env.VITE_PORT || process.env.PORT || '5173', 10),
    host: true,
    strictPort: false
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          icons: ['lucide-react']
        }
      }
    }
  }
});
