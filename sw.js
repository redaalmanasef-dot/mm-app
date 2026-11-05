// MayarMemories — تطبيق الجوال: يحفظ ملفات التطبيق عشان يفتح بسرعة (وبدون نت يفتح الشاشة ويقول «ما فيه اتصال»)
// البيانات نفسها (الطلبات والصور) دايماً من السيرفر — ما تنحفظ في الجوال
const V = '1.1.1';
const CACHE = 'mm-app-' + V;
const ASSETS = new URL('./', self.location.href).href.replace(/\/$/, '');
const SHELL = ['./', ASSETS + '/app.css?v=' + V, ASSETS + '/app.js?v=' + V, ASSETS + '/manifest.webmanifest', ASSETS + '/icons/logo.png', ASSETS + '/icons/icon-192.png', ASSETS + '/fonts/almarai-arabic-400-normal.woff2', ASSETS + '/fonts/almarai-arabic-700-normal.woff2', ASSETS + '/fonts/almarai-arabic-800-normal.woff2', ASSETS + '/fonts/almarai-latin-400-normal.woff2', ASSETS + '/fonts/almarai-latin-700-normal.woff2', ASSETS + '/fonts/almarai-latin-800-normal.woff2'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', (e) => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  const scope = self.registration.scope;
  const bare = e.request.url.split('?')[0];
  // ملفات التطبيق بس — طلبات السيرفر (نفس المسار app/…) والصور دايماً من النت
  const own = bare === scope || bare === scope + 'index.html' || /\/(app\.js|app\.css|manifest\.webmanifest)$/.test(bare) || (ASSETS && bare.startsWith(ASSETS + '/'));
  if (!own) return;
  const isPage = e.request.mode === 'navigate';
  if (isPage) { e.respondWith(fetch(e.request).then((r) => { const cp = r.clone(); caches.open(CACHE).then((c) => c.put('./', cp)); return r; }).catch(() => caches.match('./'))); return; }
  e.respondWith(caches.match(e.request).then((hit) => hit || fetch(e.request).then((r) => { if (r.ok) { const cp = r.clone(); caches.open(CACHE).then((c) => c.put(e.request, cp)); } return r; })));
});
