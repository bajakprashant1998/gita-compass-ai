// Push notification handler for the service worker
// This file is loaded alongside the Workbox-generated SW

self.addEventListener('push', (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const { title, body, url, icon } = data;

    event.waitUntil(
      self.registration.showNotification(title || '🙏 Bhagavad Gita Gyan', {
        body: body || 'Your daily wisdom awaits',
        icon: icon || '/logo.png',
        badge: '/logo.png',
        tag: 'daily-wisdom',
        renotify: true,
        data: { url: url || '/' },
        actions: [
          { action: 'open', title: 'Read Now' },
          { action: 'dismiss', title: 'Later' },
        ],
      })
    );
  } catch (e) {
    console.error('Push event error:', e);
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') return;

  const url = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Focus existing tab if available
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      // Open new window
      return clients.openWindow(url);
    })
  );
});
