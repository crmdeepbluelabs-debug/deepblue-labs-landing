// @ts-check
import { defineConfig } from 'astro/config';
import path from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel/static'; // 👈 adapter estático para Vercel

// https://astro.build/config
export default defineConfig({
  output: 'static',       // 👈 importante para Vercel
  adapter: vercel(),      // 👈 activa el adapter
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve('./src'),
      },
    },
  },
});