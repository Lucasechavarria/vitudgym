/// <reference lib="webworker" />

export default null;
declare var self: ServiceWorkerGlobalScope;

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
