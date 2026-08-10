// where to next? — service worker
// เป้าหมาย: ใช้งานได้เต็มรูปแบบตอนไม่มีเน็ต + ไม่ค้างตอนสัญญาณอ่อน (มีเน็ตแต่ช้ามาก)
const CACHE = 'wtn-2026.08.10n';
const NET_TIMEOUT = 2500; // สัญญาณอ่อน: รอเน็ตเท่านี้ ไม่มาก็ใช้ของในแคชทันที

const SHELL = [
  './', './index.html', './support.js', './wtn-backend.js', './photo-pick.js',
  './supabase-config.js', './manifest.webmanifest',
  './logo.png', './logo-small.png', './apple-touch-icon.png', './og-image.png',
  './icon-192.png', './icon-maskable.png',
  'https://fonts.googleapis.com/css2?family=Anuphan:wght@300;400;500;600;700&family=Sarabun:wght@400;500;600;700&family=IBM+Plex+Sans+Thai+Looped:wght@400;500;600;700&family=Chonburi&display=swap',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
];

// แคชได้: ของตัวเอง + ฟอนต์ + leaflet (ห้ามแคช: firebase/firestore/api)
const CACHEABLE_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com', 'unpkg.com'];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => Promise.all(SHELL.map((u) => c.add(new Request(u, { cache: 'reload' })).catch(() => {}))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', (e) => { if (e.data === 'skipWaiting') self.skipWaiting(); });

function put(req, res) {
  if (!res || !res.ok && res.type !== 'opaque') return;
  const copy = res.clone();
  caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
}

function fromNet(req, ms) {
  return new Promise((resolve, reject) => {
    let settled = false;
    const to = setTimeout(() => { if (!settled) { settled = true; reject(new Error('timeout')); } }, ms);
    fetch(req).then((res) => {
      clearTimeout(to);
      put(req, res);
      if (!settled) { settled = true; resolve(res); }
    }).catch((err) => { clearTimeout(to); if (!settled) { settled = true; reject(err); } });
  });
}

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  let url;
  try { url = new URL(req.url); } catch (err) { return; }
  const sameOrigin = url.origin === self.location.origin;
  const cacheable = sameOrigin || CACHEABLE_HOSTS.indexOf(url.hostname) !== -1;
  if (!cacheable) return; // firebase / api → ปล่อยตรง แอปจัดการ error เอง

  // หน้าเว็บ (navigate): ลองเน็ตสั้นๆ เพื่อได้บิลด์ใหม่ ไม่ทันก็เปิดจากแคชเลย
  if (req.mode === 'navigate') {
    e.respondWith(
      fromNet(req, NET_TIMEOUT)
        .catch(() => caches.match(req).then((r) => r || caches.match('./index.html') || caches.match('./')))
        .then((r) => r || new Response('offline', { status: 503, headers: { 'Content-Type': 'text/plain' } }))
    );
    return;
  }

  // ไฟล์อื่น: ตอบจากแคชทันที (เร็ว/ออฟไลน์ได้) แล้วอัปเดตเบื้องหลัง
  e.respondWith(
    caches.match(req).then((hit) => {
      if (hit) {
        e.waitUntil(fetch(req).then((res) => put(req, res)).catch(() => {}));
        return hit;
      }
      return fromNet(req, 8000).catch(() => caches.match(req).then((r) => r || Response.error()));
    })
  );
});
