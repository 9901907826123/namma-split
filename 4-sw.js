const CACHE = 'namma-split-v10';
const SHELL = ['./', './index.html', './manifest.webmanifest', './config.js', './icon-192.png', './icon-512.png', './icon-180.png', './qrcode.min.js'];
const CDN_HOSTS = ['cdn.jsdelivr.net', 'fonts.googleapis.com', 'fonts.gstatic.com'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const u = new URL(e.request.url);
  if (u.hostname.endsWith('.supabase.co')) return; // API: always live network
  if (u.origin !== location.origin && !CDN_HOSTS.includes(u.hostname)) return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: u.origin === location.origin }).then(hit => hit || fetch(e.request).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy));
      return res;
    }).catch(() => caches.match('./index.html')))
  );
});
