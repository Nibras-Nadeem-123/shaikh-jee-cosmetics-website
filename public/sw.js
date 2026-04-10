/* eslint-disable no-restricted-globals */
self.addEventListener('install', (event) => {
  // Cache core assets on install
  event.waitUntil(
    caches.open('shaikh-jee-v1').then((cache) => {
      return cache.addAll([
        '/',
        '/offline',
        '/manifest.json',
      ]);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Clean up old caches
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name.startsWith('shaikh-jee-') && name !== 'shaikh-jee-v1')
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        // Cache successful GET requests
        if (networkResponse && networkResponse.status === 200 && event.request.url.startsWith('http')) {
          const responseClone = networkResponse.clone();
          caches.open('shaikh-jee-v1').then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Return cached response or offline page if network fails
        return cachedResponse || caches.match('/offline');
      });

      return cachedResponse || fetchPromise;
    })
  );
});

// Handle push notifications
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'Shaikh Jee', {
      body: data.body || 'New update from Shaikh Jee Cosmetics',
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      data: data.url || '/',
    })
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow(event.notification.data || '/')
  );
});
