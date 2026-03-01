/// <reference lib="webworker" />

import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate, CacheFirst, NetworkFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';

// eslint-disable-next-line no-undef
declare const self: ServiceWorkerGlobalScope;

// Precachear manifiesto y archivos estáticos generados por build
precacheAndRoute(self.__WB_MANIFEST || []);

// 1. Estrategia para Fuentes (Google Fonts)
registerRoute(
    ({ url }) => url.origin === 'https://fonts.googleapis.com' || url.origin === 'https://fonts.gstatic.com',
    new StaleWhileRevalidate({
        cacheName: 'google-fonts',
    })
);

// 2. Estrategia para Imágenes de Marca (Logos, favicons de Supabase/Storage)
registerRoute(
    ({ request }) => request.destination === 'image',
    new CacheFirst({
        cacheName: 'gym-images',
        plugins: [
            new ExpirationPlugin({
                maxEntries: 60,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 días
            }),
            new CacheableResponsePlugin({
                statuses: [0, 200],
            }),
        ],
    })
);

// 3. Estrategia de Navegación (Dashboard, Rutinas) - Prioridad Red pero fallback a Caché
registerRoute(
    ({ request }) => request.mode === 'navigate',
    new NetworkFirst({
        cacheName: 'pages-cache',
        plugins: [
            new CacheableResponsePlugin({
                statuses: [0, 200],
            }),
        ],
    })
);

// --- Manejo de Notificaciones Push ---

self.addEventListener('push', (event) => {
    if (!event.data) return;

    try {
        const data = event.data.json();
        const options = {
            body: data.body || 'Nuevo mensaje de Virtud Gym',
            icon: '/icons/icon-192x192.png',
            badge: '/icons/badge-72x72.png',
            data: {
                url: data.url || '/dashboard'
            },
            vibrate: [100, 50, 100],
            actions: [
                { action: 'open', title: 'Ver ahora' },
                { action: 'close', title: 'Cerrar' }
            ]
        };

        event.waitUntil(
            self.registration.showNotification(data.title || 'Virtud Gym', options)
        );
    } catch (err) {
        console.error('Error al procesar notificación push:', err);
    }
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    if (event.action === 'close') return;

    const urlToOpen = event.notification.data.url;

    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            for (let i = 0; i < windowClients.length; i++) {
                const client = windowClients[i];
                if (client.url === urlToOpen && 'focus' in client) {
                    return client.focus();
                }
            }
            if (self.clients.openWindow) {
                return self.clients.openWindow(urlToOpen);
            }
        })
    );
});

export default null;
