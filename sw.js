const CACHE_NAME = 'bonifacio-v1.1';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/app.js',
    '/manifest.json',
    'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&display=swap',
    'https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js',
    'https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.0/dist/confetti.browser.min.js'
];

// Install event
self.addEventListener('install', event => {
    console.log('[SW] Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('[SW] Caching assets...');
            return cache.addAll(ASSETS_TO_CACHE).catch(err => {
                console.warn('[SW] Cache error (some assets may be missing):', err);
                // Continue even if some assets fail to cache
                return Promise.resolve();
            });
        }).then(() => self.skipWaiting())
    );
});

// Activate event
self.addEventListener('activate', event => {
    console.log('[SW] Activating...');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[SW] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch event - Network first, fallback to cache
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);

    // Don't cache cross-origin requests
    if (url.origin !== location.origin) {
        event.respondWith(
            fetch(request).catch(() => {
                // Return offline response for external CDN if needed
                return new Response('Offline - External resource unavailable', {
                    status: 503,
                    statusText: 'Service Unavailable'
                });
            })
        );
        return;
    }

    // Cache first for images, fonts, manifests
    if (request.destination === 'image' || 
        request.destination === 'font' ||
        url.pathname === '/manifest.json') {
        event.respondWith(
            caches.match(request).then(cached => {
                return cached || fetch(request).then(response => {
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(request, response.clone());
                    });
                    return response;
                }).catch(() => {
                    if (request.destination === 'image') {
                        return new Response(
                            '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="#f0f0f0" width="100" height="100"/></svg>',
                            { headers: { 'Content-Type': 'image/svg+xml' } }
                        );
                    }
                    return new Response('Not available offline', { status: 503 });
                });
            })
        );
        return;
    }

    // Network first for everything else
    event.respondWith(
        fetch(request).then(response => {
            // Cache successful responses
            if (response.ok) {
                caches.open(CACHE_NAME).then(cache => {
                    cache.put(request, response.clone());
                });
            }
            return response;
        }).catch(() => {
            // Fallback to cache
            return caches.match(request).then(cached => {
                if (cached) {
                    return cached;
                }
                // Return offline page for navigation requests
                if (request.mode === 'navigate') {
                    return caches.match('/index.html');
                }
                return new Response('Offline', { status: 503 });
            });
        })
    );
});

// Background sync (future enhancement)
self.addEventListener('sync', event => {
    console.log('[SW] Background sync event:', event.tag);
});

// Message handling
self.addEventListener('message', event => {
    console.log('[SW] Message received:', event.data);
    
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
