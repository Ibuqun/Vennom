import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    sveltekit(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: false,
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,json,woff2}']
      }
    })
  ],
  worker: {
    format: 'es'
  },
  build: {
    chunkSizeWarningLimit: 250,
    sourcemap: true
  }
});
