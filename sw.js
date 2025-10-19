
self.addEventListener('install', e => {
  e.waitUntil(caches.open('semillas-v1').then(cache => cache.addAll([
    '/', '/index.html', '/assets/style.css', '/assets/main.js', '/particles.js', '/favicon.ico',
    '/comparativa/index.html', '/simulador/index.html'
  ])));
});
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});
