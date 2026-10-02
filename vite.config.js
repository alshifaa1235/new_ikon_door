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
    minify: 'esbuild',
    target: 'es2020',
    cssMinify: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) return 'vendor';
            if (id.includes('lucide-react')) return 'icons';
            if (id.includes('@supabase')) return 'supabase';
          }
        }
      }
    }
  }
});
