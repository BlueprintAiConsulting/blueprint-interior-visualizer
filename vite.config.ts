import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(({ command }) => {
  const isProd = command === 'build';
  return {
    base: isProd ? '/blueprint-interior-visualizer/' : '/',
    plugins: [react(), tailwindcss()],
    resolve: { alias: { '@': path.resolve(__dirname, '.') } },
    server: {
      port: 5174, strictPort: false, host: '0.0.0.0',
      proxy: { '/api': { target: 'http://localhost:4011', changeOrigin: true } },
    },
  };
});
