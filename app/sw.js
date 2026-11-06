/* Il motore dell'app: riceve le notifiche anche ad app chiusa. Nessun dato salvato qui. */
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));
self.addEventListener('push', (e) => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (x) { /* messaggio vuoto */ }
  e.waitUntil(self.registration.showNotification(d.titolo || 'La Cordata', { body: d.testo || '', icon: 'icona-192.png', badge: 'icona-192.png', tag: d.chiave || undefined, data: { url: d.url || './' } }));
});
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const url = new URL((e.notification.data && e.notification.data.url) || './', self.registration.scope).href;
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((l) => {
    const c = l.find((x) => 'focus' in x);
    return c ? c.focus() : self.clients.openWindow(url);
  }));
});
