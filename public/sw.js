// Enhanced service worker for UrutiIQ with proper Next.js support
const CACHE_NAME = 'urutiq-cache-v3';
const STATIC_CACHE_NAME = 'urutiq-static-v3';

// URLs to cache during install
const urlsToCache = [
  '/',
  '/accounting',
  '/dashboard',
  '/clients',
  '/banking',
  '/offline'
];

// Files that should never be cached
const NEVER_CACHE = [
  '/_next/static/chunks/fallback/',
  '/_next/static/chunks/pages/_error',
  '/_error',
  '/pages/_error',
  '/_next/webpack-hmr',
  '/__nextjs_original-stack-frame',
  '/api/',
  '/_next/static/development/',
  '/_next/static/chunks/webpack',
  '/_next/static/chunks/main',
  '/_next/static/chunks/polyfills',
  '/_next/static/chunks/framework',
  '/_next/static/runtime/',
];

// Function to check if URL should never be cached
function shouldNeverCache(url) {
  return NEVER_CACHE.some(pattern => url.includes(pattern)) ||
         url.includes('/_next/static/chunks/fallback/') ||
         url.includes('/pages/_error') ||
         url.includes('/_error.js') ||
         url.match(/\/_next\/static\/chunks\/pages\/_error/);
}

self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('Cache addAll failed:', error);
      })
  );
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Handle messages from the main thread
self.addEventListener('message', (event) => {
  console.log('Service Worker received message:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip caching for files that should never be cached
  if (shouldNeverCache(request.url)) {
    console.log('Skipping cache for never-cache pattern:', request.url);
    return;
  }

  // Don't cache API calls or external requests
  if (request.url.includes('/api/') || 
      request.url.includes('localhost:4000') ||
      !request.url.startsWith(self.location.origin)) {
    return;
  }

  // Special handling for Next.js internal files that might fail
  if (request.url.includes('/_next/') && 
      (request.url.includes('/fallback/') || 
       request.url.includes('/_error') ||
       request.url.includes('/pages/_error'))) {
    console.log('Ignoring Next.js internal file:', request.url);
    return;
  }

  // Handle navigation requests (page requests)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Only cache successful responses
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            }).catch(error => {
              console.warn('Failed to cache navigation response:', error);
            });
          }
          return response;
        })
        .catch((error) => {
          console.log('Network request failed for navigation:', request.url, error.message);
          
          // Return cached version if available
          return caches.match(request)
            .then((cachedResponse) => {
              if (cachedResponse) {
                console.log('Serving cached navigation:', request.url);
                return cachedResponse;
              }
              
              // Try to serve a generic cached page for the route
              const pathname = new URL(request.url).pathname;
              return caches.match('/')
                .then((homeResponse) => {
                  if (homeResponse) {
                    console.log('Serving home page for failed navigation:', request.url);
                    return homeResponse;
                  }
                  
                  // Last resort: serve offline page
                  return caches.match('/offline')
                    .then((offlineResponse) => {
                      if (offlineResponse) {
                        console.log('Serving offline page for failed navigation:', request.url);
                        return offlineResponse;
                      }
                      
                      // If all else fails, create a basic response
                      return new Response(
                        `
                        <!DOCTYPE html>
                        <html>
                          <head>
                            <title>Offline - UrutiIQ</title>
                            <meta name="viewport" content="width=device-width, initial-scale=1">
                          </head>
                          <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                            <h1>You're Offline</h1>
                            <p>Please check your internet connection and try again.</p>
                            <button onclick="window.location.reload()">Retry</button>
                          </body>
                        </html>
                        `,
                        {
                          status: 200,
                          statusText: 'OK',
                          headers: { 'Content-Type': 'text/html' }
                        }
                      );
                    });
                });
            });
        })
    );
    return;
  }

  // Handle static assets (CSS, JS, images, etc.)
  if (request.destination === 'style' || 
      request.destination === 'script' || 
      request.destination === 'image' ||
      request.url.includes('/_next/static/')) {
    
    // Double-check for never-cache patterns in static assets
    if (shouldNeverCache(request.url)) {
      console.log('Skipping static asset due to never-cache pattern:', request.url);
      return;
    }
    
    event.respondWith(
      caches.match(request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            console.log('Serving cached static asset:', request.url);
            return cachedResponse;
          }
          
          return fetch(request)
            .then((response) => {
              // Only cache successful responses for legitimate files
              if (response.ok && response.status === 200 && !shouldNeverCache(request.url)) {
                const responseClone = response.clone();
                caches.open(STATIC_CACHE_NAME).then((cache) => {
                  cache.put(request, responseClone);
                }).catch(error => {
                  console.warn('Failed to cache static asset:', error);
                });
              }
              return response;
            })
            .catch((error) => {
              console.warn('Failed to fetch static asset:', request.url, error.message);
              
              // Don't try to provide fallbacks for Next.js internal files
              if (shouldNeverCache(request.url)) {
                console.log('Not providing fallback for never-cache file:', request.url);
                throw error;
              }
              
              // For critical JS/CSS files, try to return a minimal fallback
              if (request.destination === 'script') {
                return new Response('console.log("Service worker: Script failed to load");', {
                  status: 200,
                  statusText: 'OK',
                  headers: { 'Content-Type': 'application/javascript' }
                });
              }
              
              if (request.destination === 'style') {
                return new Response('/* Service worker: Stylesheet failed to load */', {
                  status: 200,
                  statusText: 'OK',
                  headers: { 'Content-Type': 'text/css' }
                });
              }
              
              // For other assets, let the error propagate
              throw error;
            });
        })
    );
    return;
  }

  // For other requests, try network first, then cache
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Cache successful responses
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Return cached version if available
        return caches.match(request);
      })
  );
});

// Handle background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Handle any offline actions that need to be synced
      Promise.resolve()
    );
  }
});

// Handle push notifications (if needed in the future)
self.addEventListener('push', (event) => {
  console.log('Push message received:', event);
  
  const options = {
    body: event.data ? event.data.text() : 'New notification from UrutiIQ',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    data: {
      url: '/'
    }
  };

  event.waitUntil(
    self.registration.showNotification('UrutiIQ', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow(event.notification.data?.url || '/')
  );
});
