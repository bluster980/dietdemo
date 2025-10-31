import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import svgr from 'vite-plugin-svgr';

export default defineConfig({
  plugins: [
    react(),
    svgr({ exportAsDefault: true, include: '**/*.svg' }),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Diet Delta',
        short_name: 'DietDelta',
        description: 'A fitness app built for trainer and clients',
        theme_color: '#FFFFFF',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/icons/download48.png',
            sizes: '48x48',
            type: 'image/png',
          },
          {
            src: '/icons/download96.png',
            sizes: '96x96',
            type: 'image/png',
          },
          {
            src: '/icons/download192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icons/download256.png',
            sizes: '256x256',
            type: 'image/png',
          },
          {
            src: '/icons/download512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 5_000_000,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json,webp,gif}'],
      },
      devOptions: {
        enabled: true,
        type: 'module'
      }
    }),
    // Add second instance for Firebase messaging service worker
    // VitePWA({
    //   strategies: 'injectManifest',
    //   srcDir: 'public',
    //   filename: 'firebase-messaging-sw.js',
    //   injectManifest: {
    //     globPatterns: []
    //   }
    // })
  ],
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
});