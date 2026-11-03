import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    tailwindcss(),
    sveltekit({
      // Consult https://svelte.dev/docs/kit/integrations
      // for more information about preprocessors
      preprocess: vitePreprocess(),
      adapter: adapter({ out: 'build' })
    }),

    // Run the PWA plugins only for the client environment: in the ssr build they emit a
    // second, empty-precache sw.js into the same directory.
    ...VitePWA({
      registerType: 'prompt',
      // SvelteKit 3 builds the client through Vite's environment API and no longer tells
      // this plugin where its output goes; without these two paths the service worker is
      // written to dist/ with an empty precache and never ships.
      outDir: '.svelte-kit/output/client',
      includeAssets: ['favicon.svg', 'robots.txt', 'audio/**/*', 'icons/**/*', 'icon-source.svg', 'icon-maskable.svg'],
      manifest: {
        name: 'Piano Triads - Master Piano Chords & Scales',
        short_name: 'Piano Triads',
        description: 'Master piano chords, scales, and pitch training with interactive lessons and practice modes',
        theme_color: '#3480f1',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait-primary',
        scope: '/',
        start_url: '/',
        lang: 'en',
        categories: ['music', 'education', 'entertainment'],
        icons: [
          {
            src: 'icons/icon-72x72.png',
            sizes: '72x72',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'icons/icon-96x96.png',
            sizes: '96x96',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'icons/icon-128x128.png',
            sizes: '128x128',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'icons/icon-144x144.png',
            sizes: '144x144',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'icons/icon-152x152.png',
            sizes: '152x152',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'icons/icon-192x192-maskable.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: 'icons/icon-384x384.png',
            sizes: '384x384',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'icons/icon-512x512-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ],
        shortcuts: [
          {
            name: 'Chord Practice',
            short_name: 'Practice',
            description: 'Practice identifying piano chords',
            url: '/chord-practice',
            icons: [{ src: 'icons/icon-96x96.png', sizes: '96x96' }]
          },
          {
            name: 'Pitch Practice',
            short_name: 'Pitch',
            description: 'Train your ear with pitch recognition',
            url: '/pitch-training',
            icons: [{ src: 'icons/icon-96x96.png', sizes: '96x96' }]
          },
          {
            name: 'Chord Dictionary',
            short_name: 'Dictionary',
            description: 'Browse chord reference',
            url: '/chord-dictionary',
            icons: [{ src: 'icons/icon-96x96.png', sizes: '96x96' }]
          }
        ]
      },
      workbox: {
        globDirectory: '.svelte-kit/output/client',
        globPatterns: ['**/*.{js,css,html,ico,png,svg,mp3}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              }
            }
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              }
            }
          },
          {
            urlPattern: /\.(?:mp3|wav|ogg)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'audio-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              }
            }
          }
        ]
      },
      devOptions: {
        enabled: false // Disable in dev to avoid hydration conflicts
      }
    }).map((plugin) => Object.assign(plugin, {
      applyToEnvironment: (environment: { name: string }) => environment.name === 'client'
    }))
  ]
});
