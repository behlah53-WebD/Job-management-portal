import { defaultCache } from '@serwist/next/worker';
import {
  Serwist,
  NetworkFirst,
  CacheFirst,
  StaleWhileRevalidate,
  ExpirationPlugin,
  CacheableResponsePlugin,
} from 'serwist';

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: false, // controlled update flow (toast prompt)
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    // 1. Next.js static assets and fonts (CacheFirst, 1 year)
    {
      matcher: ({ url }) =>
        url.pathname.startsWith('/_next/static/') ||
        url.pathname.match(/\.(?:woff2?|eot|ttf|otf)$/),
      handler: new CacheFirst({
        cacheName: 'static-resources',
        plugins: [
          new ExpirationPlugin({
            maxEntries: 64,
            maxAgeSeconds: 365 * 24 * 60 * 60,
          }),
        ],
      }),
    },
    // 2. Images: local icons, splash, screenshots, and remote image hosts (SWR, 30 days)
    {
      matcher: ({ request, url }) =>
        request.destination === 'image' ||
        url.pathname.startsWith('/icons/') ||
        url.pathname.startsWith('/splash/') ||
        url.pathname.startsWith('/screenshots/') ||
        url.hostname.includes('images.unsplash.com') ||
        url.hostname.includes('res.cloudinary.com'),
      handler: new StaleWhileRevalidate({
        cacheName: 'image-cache',
        plugins: [
          new ExpirationPlugin({
            maxEntries: 100,
            maxAgeSeconds: 30 * 24 * 60 * 60,
          }),
        ],
      }),
    },
    // 3. Public read-only job listings & categories (SWR, 24h)
    {
      matcher: ({ request, url }) =>
        request.method === 'GET' &&
        (url.pathname.startsWith('/api/jobs') || url.pathname === '/api/categories'),
      handler: new StaleWhileRevalidate({
        cacheName: 'public-api-cache',
        plugins: [
          new ExpirationPlugin({
            maxEntries: 60,
            maxAgeSeconds: 24 * 60 * 60,
          }),
          new CacheableResponsePlugin({
            statuses: [0, 200],
          }),
        ],
      }),
    },
    // 4. Public HTML navigations: NetworkFirst with 3s timeout (strictly exclude dashboards/admin/api)
    {
      matcher: ({ request, url }) =>
        request.mode === 'navigate' &&
        !url.pathname.startsWith('/dashboard') &&
        !url.pathname.startsWith('/admin') &&
        !url.pathname.startsWith('/api'),
      handler: new NetworkFirst({
        cacheName: 'pages-cache',
        networkTimeoutSeconds: 3,
        plugins: [
          new ExpirationPlugin({
            maxEntries: 32,
            maxAgeSeconds: 24 * 60 * 60,
          }),
        ],
      }),
    },
    ...defaultCache,
  ],
  fallbacks: {
    entries: [
      {
        url: '/offline',
        matcher({ request }) {
          return request.destination === 'document';
        },
      },
    ],
  },
});

serwist.addEventListeners();

// Controlled update flow - SKIP_WAITING message listener
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Web Push event listener
self.addEventListener('push', (event) => {
  let data = {
    title: 'Verdant Notification',
    body: 'You have a new update on Verdant.',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-96x96.png',
    data: { url: '/dashboard/seeker' },
  };

  try {
    if (event.data) {
      data = { ...data, ...event.data.json() };
    }
  } catch (err) {
    if (event.data) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/icons/icon-192x192.png',
    badge: data.badge || '/icons/icon-96x96.png',
    data: data.data || { url: '/dashboard/seeker' },
    tag: data.tag || 'verdant-general',
    vibrate: [100, 50, 100],
    actions: data.actions || [
      { action: 'open', title: 'Open' },
      { action: 'dismiss', title: 'Dismiss' },
    ],
  };

  event.waitUntil(
    Promise.all([
      self.registration.showNotification(data.title, options),
      'setAppBadge' in navigator ? navigator.setAppBadge().catch(() => {}) : Promise.resolve(),
    ])
  );
});

// Web Push notification click listener
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'dismiss') return;

  const targetUrl = event.notification.data?.url || '/dashboard/seeker';

  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        for (const client of windowClients) {
          if (client.url.includes(targetUrl) && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      })
      .then(() => {
        if ('clearAppBadge' in navigator) {
          return navigator.clearAppBadge().catch(() => {});
        }
      })
  );
});

// Activate cleanup for old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.keys().then((keys) => {
        const CURRENT_CACHES = ['pages-cache', 'static-resources', 'image-cache', 'public-api-cache'];
        return Promise.all(
          keys.map((key) => {
            if (key.startsWith('verdant-old-') && !CURRENT_CACHES.includes(key)) {
              return caches.delete(key);
            }
          })
        );
      }),
    ])
  );
});
