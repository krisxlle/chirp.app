import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  base: '/',
  root: path.resolve(__dirname, 'client'),
  build: {
    outDir: path.resolve(__dirname, 'dist'),
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'client/src'),
      '@/components': path.resolve(__dirname, 'client/src/components'),
      '@/pages': path.resolve(__dirname, 'client/src/pages'),
      '@/hooks': path.resolve(__dirname, 'client/src/hooks'),
      '@/lib': path.resolve(__dirname, 'client/src/lib'),
      '@/utils': path.resolve(__dirname, 'client/src/utils'),
      '@/constants': path.resolve(__dirname, 'client/src/constants'),
    },
    extensions: ['.js', '.ts', '.tsx', '.jsx', '.json'],
  },
  server: {
    port: 5000,
  },
});
