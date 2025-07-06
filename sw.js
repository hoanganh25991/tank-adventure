// Tank Adventure Service Worker
const CACHE_NAME = 'tank-adventure-v7.0.0.2';
const STATIC_CACHE_NAME = 'tank-adventure-static-v7.0.0.2';
const DYNAMIC_CACHE_NAME = 'tank-adventure-dynamic-v7.0.0.2';

// Files to cache for offline functionality
const STATIC_ASSETS = [
    '/tank-adventure/',
    '/tank-adventure/index.html',
    '/tank-adventure/manifest.json',
    '/tank-adventure/css/game.css',
    '/tank-adventure/js/game-engine.js',
    '/tank-adventure/js/player.js',
    '/tank-adventure/js/enemy.js',
    '/tank-adventure/js/skills.js',
    '/tank-adventure/js/skill-effects.js',
    '/tank-adventure/js/upgrades.js',
    '/tank-adventure/js/ui.js',
    '/tank-adventure/js/utils.js',
    '/tank-adventure/js/sound-manager.js',
    '/tank-adventure/js/orientation.js',
    '/tank-adventure/js/android-twa.js',
    '/tank-adventure/assets/favicon/favicon.ico',
    '/tank-adventure/assets/favicon/android-chrome-192x192.png',
    '/tank-adventure/assets/favicon/android-chrome-512x512.png',
    '/tank-adventure/assets/favicon/apple-touch-icon.png',
    '/tank-adventure/assets/favicon/favicon-16x16.png',
    '/tank-adventure/assets/favicon/favicon-32x32.png'
];

// Network-first strategy for dynamic content
const NETWORK_FIRST_URLS = [
    '/api/',
    '/server.js'
];

// Cache-first strategy for static assets
const CACHE_FIRST_URLS = [
    '/tank-adventure/assets/',
    '/tank-adventure/css/',
    '/tank-adventure/js/',
    'https://fonts.googleapis.com/',
    'https://fonts.gstatic.com/'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
    console.log('Service Worker: Installing...');
    
    event.waitUntil(
        caches.open(STATIC_CACHE_NAME)
            .then((cache) => {
                console.log('Service Worker: Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => {
                console.log('Service Worker: Static assets cached successfully');
                return self.skipWaiting(); // Activate immediately
            })
            .catch((error) => {
                console.error('Service Worker: Failed to cache static assets:', error);
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
                        // Delete old caches that don't match current version
                        if (cacheName !== STATIC_CACHE_NAME && 
                            cacheName !== DYNAMIC_CACHE_NAME &&
                            cacheName.startsWith('tank-adventure-')) {
                            console.log('Service Worker: Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('Service Worker: Activated successfully');
                return self.clients.claim(); // Take control of all pages
            })
            .then(() => {
                // Send Android fullscreen message to all clients
                return self.clients.matchAll().then((clients) => {
                    clients.forEach((client) => {
                        client.postMessage({
                            type: 'ENABLE_FULLSCREEN'
                        });
                    });
                });
            })
    );
});

// Fetch event - handle network requests with different strategies
self.addEventListener('fetch', (event) => {
    const requestUrl = new URL(event.request.url);
    
    // Skip non-GET requests
    if (event.request.method !== 'GET') {
        return;
    }
    
    // Skip chrome-extension and other non-http requests
    if (!requestUrl.protocol.startsWith('http')) {
        return;
    }
    
    event.respondWith(
        handleFetchRequest(event.request)
    );
});

// Helper function to check if a response is cacheable
function isCacheable(response) {
    // Don't cache partial content (206), redirects, or error responses
    return response.ok && 
           response.status !== 206 && 
           response.status < 300 &&
           response.type !== 'opaque' &&
           response.headers.get('cache-control') !== 'no-cache';
}

// Handle different fetch strategies based on URL patterns
async function handleFetchRequest(request) {
    const url = request.url;
    
    try {
        // Network-first strategy for dynamic content
        if (NETWORK_FIRST_URLS.some(pattern => url.includes(pattern))) {
            return await networkFirstStrategy(request);
        }
        
        // Cache-first strategy for static assets
        if (CACHE_FIRST_URLS.some(pattern => url.includes(pattern))) {
            return await cacheFirstStrategy(request);
        }
        
        // Default: Cache-first with network fallback for game files
        return await cacheFirstStrategy(request);
        
    } catch (error) {
        console.error('Service Worker: Fetch error:', error);
        
        // Return offline fallback if available
        if (request.destination === 'document') {
            const cache = await caches.open(STATIC_CACHE_NAME);
            return cache.match('/tank-adventure/index.html') || new Response('Offline - Tank Adventure unavailable');
        }
        
        // For other requests, return a basic error response
        return new Response('Network error', { status: 408 });
    }
}

// Network-first strategy: Try network first, fallback to cache
async function networkFirstStrategy(request) {
    try {
        const networkResponse = await fetch(request);
        
        // Only cache suitable responses
        if (isCacheable(networkResponse)) {
            try {
                // Cache successful responses
                const cache = await caches.open(DYNAMIC_CACHE_NAME);
                await cache.put(request, networkResponse.clone());
            } catch (cacheError) {
                // Log cache errors but don't fail the request
                console.warn('Service Worker: Failed to cache response:', cacheError);
            }
        }
        
        return networkResponse;
    } catch (error) {
        // Network failed, try cache
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        throw error;
    }
}

// Cache-first strategy: Try cache first, fallback to network
async function cacheFirstStrategy(request) {
    // Try cache first
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
        return cachedResponse;
    }
    
    // Cache miss, try network
    try {
        const networkResponse = await fetch(request);
        
        // Only cache suitable responses
        if (isCacheable(networkResponse)) {
            try {
                // Cache the response for future use
                const cache = await caches.open(DYNAMIC_CACHE_NAME);
                await cache.put(request, networkResponse.clone());
            } catch (cacheError) {
                // Log cache errors but don't fail the request
                console.warn('Service Worker: Failed to cache response:', cacheError);
            }
        }
        
        return networkResponse;
    } catch (error) {
        throw error;
    }
}

// Handle background sync for game data
self.addEventListener('sync', (event) => {
    console.log('Service Worker: Background sync triggered:', event.tag);
    
    if (event.tag === 'save-game-data') {
        event.waitUntil(syncGameData());
    }
});

// Sync game data when connection is restored
async function syncGameData() {
    try {
        // Get pending game data from IndexedDB or localStorage
        const gameData = await getStoredGameData();
        
        if (gameData && gameData.pendingSync) {
            // Send data to server if needed
            console.log('Service Worker: Syncing game data...');
            // Implementation would depend on your backend
            
            // Mark as synced
            gameData.pendingSync = false;
            await storeGameData(gameData);
        }
    } catch (error) {
        console.error('Service Worker: Failed to sync game data:', error);
    }
}

// Helper functions for game data storage
async function getStoredGameData() {
    // This would integrate with your existing localStorage or IndexedDB implementation
    try {
        const data = localStorage.getItem('tankAdventureGameData');
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Service Worker: Failed to get stored game data:', error);
        return null;
    }
}

async function storeGameData(data) {
    try {
        localStorage.setItem('tankAdventureGameData', JSON.stringify(data));
    } catch (error) {
        console.error('Service Worker: Failed to store game data:', error);
    }
}

// Handle push notifications (for future features)
self.addEventListener('push', (event) => {
    console.log('Service Worker: Push notification received');
    
    const options = {
        body: event.data ? event.data.text() : 'Tank Adventure notification',
        icon: '/assets/favicon/android-chrome-192x192.png',
        badge: '/assets/favicon/favicon-32x32.png',
        vibrate: [200, 100, 200],
        data: {
            url: '/tank-adventure/'
        },
        actions: [
            {
                action: 'open',
                title: 'Play Now',
                icon: '/assets/favicon/favicon-32x32.png'
            },
            {
                action: 'close',
                title: 'Close'
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification('Tank Adventure', options)
    );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
    console.log('Service Worker: Notification clicked');
    
    event.notification.close();
    
    if (event.action === 'open' || !event.action) {
        event.waitUntil(
            clients.openWindow('/tank-adventure/')
        );
    }
});

// Handle messages from the main thread
self.addEventListener('message', (event) => {
    console.log('Service Worker: Message received:', event.data);
    
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'GET_VERSION') {
        event.ports[0].postMessage({ version: CACHE_NAME });
    }
    
    if (event.data && event.data.type === 'CACHE_GAME_DATA') {
        // Cache important game data
        event.waitUntil(cacheGameData(event.data.gameData));
    }
});

// Cache game data for offline access
async function cacheGameData(gameData) {
    try {
        const cache = await caches.open(DYNAMIC_CACHE_NAME);
        const response = new Response(JSON.stringify(gameData), {
            headers: { 'Content-Type': 'application/json' }
        });
        await cache.put('/tank-adventure/game-data', response);
        console.log('Service Worker: Game data cached successfully');
    } catch (error) {
        console.error('Service Worker: Failed to cache game data:', error);
    }
}

// Periodic background sync for game updates (if supported)
self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'game-update-check') {
        event.waitUntil(checkForGameUpdates());
    }
});

async function checkForGameUpdates() {
    try {
        // Check for game updates
        console.log('Service Worker: Checking for game updates...');
        // Implementation would depend on your update mechanism
    } catch (error) {
        console.error('Service Worker: Failed to check for updates:', error);
    }
}

console.log('Service Worker: Script loaded successfully');