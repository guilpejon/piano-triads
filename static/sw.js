const CACHE_NAME = 'piano-triads-v1';
const STATIC_CACHE_URLS = [
  '/',
  '/chord-practice',
  '/pitch-training',
  '/chord-dictionary',
  '/learn-scales',
  '/manifest.json',
  '/favicon.svg',
  // Audio files
  '/audio/piano/c3.mp3',
  '/audio/piano/cs3.mp3',
  '/audio/piano/d3.mp3',
  '/audio/piano/ds3.mp3',
  '/audio/piano/e3.mp3',
  '/audio/piano/f3.mp3',
  '/audio/piano/fs3.mp3',
  '/audio/piano/g3.mp3',
  '/audio/piano/gs3.mp3',
  '/audio/piano/a3.mp3',
  '/audio/piano/as3.mp3',
  '/audio/piano/b3.mp3',
  '/audio/piano/c4.mp3',
  '/audio/piano/cs4.mp3',
  '/audio/piano/d4.mp3',
  '/audio/piano/ds4.mp3',
  '/audio/piano/e4.mp3',
  '/audio/piano/f4.mp3',
  '/audio/piano/fs4.mp3',
  '/audio/piano/g4.mp3',
  '/audio/piano/gs4.mp3',
  '/audio/piano/a4.mp3',
  '/audio/piano/as4.mp3',
  '/audio/piano/b4.mp3',
  // Icons
  '/icons/icon-72x72.png',
  '/icons/icon-96x96.png',
  '/icons/icon-128x128.png',
  '/icons/icon-144x144.png',
  '/icons/icon-152x152.png',
  '/icons/icon-192x192.png',
  '/icons/icon-384x384.png',
  '/icons/icon-512x512.png'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_CACHE_URLS);
      })
      .then(() => {
        console.log('Service Worker: Installation complete');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Installation failed', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activation complete');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http(s) requests
  if (!event.request.url.startsWith('http')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Return cached version if available
        if (cachedResponse) {
          console.log('Service Worker: Serving from cache', event.request.url);
          return cachedResponse;
        }

        // Otherwise fetch from network
        console.log('Service Worker: Fetching from network', event.request.url);
        return fetch(event.request)
          .then((response) => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response for caching
            const responseToCache = response.clone();

            // Cache dynamic content (like JS/CSS bundles)
            if (event.request.url.includes('/_app/') || 
                event.request.url.includes('.js') || 
                event.request.url.includes('.css')) {
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, responseToCache);
                });
            }

            return response;
          })
          .catch((error) => {
            console.error('Service Worker: Network fetch failed', error);
            
            // Return offline page for navigation requests
            if (event.request.mode === 'navigate') {
              return caches.match('/');
            }
            
            throw error;
          });
      })
  );
});

// Background sync for when the app comes back online
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Perform any background sync tasks here
      console.log('Service Worker: Performing background sync')
    );
  }
});

// Push notification support (for future features)
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push message received', event);
  
  const options = {
    body: event.data ? event.data.text() : 'New update available!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-96x96.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Open App',
        icon: '/icons/icon-96x96.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/icon-96x96.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Piano Triads', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification click received', event);
  
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});
