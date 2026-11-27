import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  // Use relative base so assets load correctly on GitHub Pages under any subpath or custom domain
  base: './',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    hmr: process.env.DISABLE_HMR !== 'true',
    watch: process.env.DISABLE_HMR === 'true' ? null : {},
  },
  build: {
    chunkSizeWarningLimit: 1400,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules/three') || id.includes('@react-three')) {
            return 'vendor-three';
          }
          if (id.includes('@xyflow')) {
            return 'vendor-xyflow';
          }
          if (id.includes('recharts')) {
            return 'vendor-charts';
          }
          if (id.includes('node_modules/react') || id.includes('react-router-dom') || id.includes('@tanstack')) {
            return 'vendor-react';
          }
        },
      },
    },
  },
});
