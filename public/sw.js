// Service Worker for Ozran Secure Shield
// Provides offline functionality and performance improvements

const CACHE_NAME = 'ozran-secure-shield-v1.0.0';
const STATIC_CACHE_NAME = 'ozran-static-v1.0.0';
const DYNAMIC_CACHE_NAME = 'ozran-dynamic-v1.0.0';

// Files to cache on install
const STATIC_FILES = [
    '/',
    '/auth',
    '/dashboard',
    '/terms',
    '/privacy',
    '/about',
    '/contact',
    '/index.css',
    '/auth.css',
    '/dashboard.css',
    '/script.js',
    '/auth.js',
    '/dashboard.js',
    '/manifest.json',
    '/favicon.ico',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Manrope:wght@400;500;600;700;800&display=swap'
];

// Install event - cache static files
self.addEventListener('install', (event) => {
    console.log('Service Worker: Installing...');
    
    event.waitUntil(
        caches.open(STATIC_CACHE_NAME)
            .then(cache => {
                console.log('Service Worker: Caching static files');
                return cache.addAll(STATIC_FILES);
            })
            .then(() => {
                console.log('Service Worker: Static files cached successfully');
                return self.skipWaiting();
            })
            .catch(error => {
                console.error('Service Worker: Error caching static files', error);
            })
    );
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
    console.log('Service Worker: Activating...');
    
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheName !== STATIC_CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME) {
                            console.log('Service Worker: Deleting old cache', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('Service Worker: Activated successfully');
                return self.clients.claim();
            })
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }
    
    // Skip cross-origin requests (except for fonts and CDN resources)
    if (url.origin !== location.origin && 
        !url.hostname.includes('fonts.googleapis.com') && 
        !url.hostname.includes('cdnjs.cloudflare.com') &&
        !url.hostname.includes('fonts.gstatic.com')) {
        return;
    }
    
    event.respondWith(handleFetch(request));
});

async function handleFetch(request) {
    const url = new URL(request.url);
    
    try {
        // For API calls, always go to network first
        if (url.pathname.startsWith('/api/')) {
            return await networkFirst(request);
        }
        
        // For static assets, cache first
        if (isStaticAsset(url.pathname)) {
            return await cacheFirst(request);
        }
        
        // For HTML pages, network first with cache fallback
        if (request.headers.get('accept')?.includes('text/html')) {
            return await networkFirst(request);
        }
        
        // Default: cache first
        return await cacheFirst(request);
        
    } catch (error) {
        console.error('Service Worker: Fetch error', error);
        
        // Return offline fallback for HTML requests
        if (request.headers.get('accept')?.includes('text/  html')) {
            return await getOfflineFallback();
        }
        
        // For other requests, let the error propagate
        throw error;
    }
}

// Cache first strategy
async function cacheFirst(request) {
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
        // Update cache in background
        updateCache(request);
        return cachedResponse;
    }
    
    // Not in cache, fetch from network
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.status === 200) {
        const cache = await caches.open(DYNAMIC_CACHE_NAME);
        cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
}

// Network first strategy
async function networkFirst(request) {
    try {
        const networkResponse = await fetch(request);
        
        // FIX 1: Use response.ok to cache ALL successful responses (status 200-299)
        if (networkResponse.ok) { 
            const cache = await caches.open(DYNAMIC_CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }
        
        // Always return the network response, regardless of caching success (e.g., even if it's a 404/500, we still want to show the user the immediate server response).
        return networkResponse;
    } catch (error) {
        // Network failed (i.e., browser couldn't connect, DNS failure, etc.), try cache
        console.warn('Network request failed. Falling back to cache...');
        const cachedResponse = await caches.match(request);
        
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // FIX 2: Instead of throwing, return a generic error or fallback response 
        // to prevent the Service Worker from crashing the request.
        // This is highly recommended for production Service Workers.
        return new Response('Network connection failed and no cache available.', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({ 'Content-Type': 'text/plain' })
        });
    }
}

// Update cache in background
async function updateCache(request) {
    try {
        const networkResponse = await fetch(request);
        
        // FIX 1: Use response.ok to include all success codes (200-299).
        // FIX 2: Call .clone() before caching to prevent the response stream from being consumed.
        if (networkResponse.ok) { 
            const cache = await caches.open(DYNAMIC_CACHE_NAME);
            cache.put(request, networkResponse.clone()); // CRITICAL FIX: use .clone()
        }
        
        // Note: We don't return networkResponse here, as this function is just for updating the cache.
        
    } catch (error) {
        // Silently fail background updates (This is fine for this strategy)
        console.log('Service Worker: Background cache update failed', error);
    }
}

// Check if request is for static asset
function isStaticAsset(pathname) {
    const staticExtensions = ['.css', '.js', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2', '.ttf'];
    return staticExtensions.some(ext => pathname.endsWith(ext));
}

// Get offline fallback page
async function getOfflineFallback() {
    const cache = await caches.open(STATIC_CACHE_NAME);
    return await cache.match('/offline.html') || new Response(
        `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Offline - Ozran Secure Shield</title>
            <style>
                body {
                    font-family: -apple-system, BlinkMacSystemFont, sans-serif;
                    background: #0e1117;
                    color: #ffffff;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-height: 100vh;
                    margin: 0;
                    text-align: center;
                }
                .offline-content {
                    max-width: 400px;
                    padding: 2rem;
                }
                .offline-icon {
                    font-size: 4rem;
                    margin-bottom: 1rem;
                    color: #6d5efa;
                }
                .offline-title {
                    font-size: 1.5rem;
                    margin-bottom: 1rem;
                }
                .offline-message {
                    color: #c4c9d4;
                    margin-bottom: 2rem;
                }
                .retry-btn {
                    background: linear-gradient(135deg, #6d5efa, #824efa);
                    color: white;
                    border: none;
                    padding: 0.75rem 1.5rem;
                    border-radius: 0.5rem;
                    cursor: pointer;
                    font-size: 1rem;
                }
            </style>
        </head>
        <body>
            <div class="offline-content">
                <div class="offline-icon">🛡️</div>
                <h1 class="offline-title">You're Offline</h1>
                <p class="offline-message">It looks like you've lost your internet connection. Check your connection and try again.</p>
                <button class="retry-btn" onclick="window.location.reload()">Try Again</button>
            </div>
        </body>
        </html>`,
        { headers: { 'Content-Type': 'text/html' } }
    );
}

// Background sync for form submissions
self.addEventListener('sync', (event) => {
    if (event.tag === 'background-sync') {
        event.waitUntil(doBackgroundSync());
    }
});

async function doBackgroundSync() {
    // Handle any queued form submissions or data sync
    console.log('Service Worker: Performing background sync');
}

// Push notification handling
self.addEventListener('push', (event) => {
    if (!event.data) return;
    
    const data = event.data.json();
    
    const options = {
        body: data.body,
        icon: '/favicon-192x192.png',
        badge: '/favicon-72x72.png',
        data: data.data,
        actions: data.actions,
        tag: data.tag,
        renotify: true
    };
    
    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    if (event.action === 'view') {
        event.waitUntil(
            clients.openWindow(event.notification.data.url)
        );
    }
});

// Message handling from main thread
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'CACHE_URLS') {
        event.waitUntil(
            caches.open(DYNAMIC_CACHE_NAME)
                .then(cache => cache.addAll(event.data.payload))
        );
    }
});

// Periodic background sync (if supported)
self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'security-updates') {
        event.waitUntil(updateSecurityData());
    }
});

async function updateSecurityData() {
    // Update threat intelligence or security data in background
    console.log('Service Worker: Updating security data');
}

console.log('Service Worker: Script loaded successfully');