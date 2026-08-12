// where to next? — ตัวปลดระวาง service worker เดิมที่ root
// แอปย้ายไป /app/ แล้ว ตัวนี้มีหน้าที่เดียว: ล้างแคชเก่าแล้วถอนตัวเอง
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k.indexOf('wtn-') === 0 && k !== 'wtn-media-v1').map((k) => caches.delete(k)));
    await self.clients.claim();
    await self.registration.unregister();
    const cs = await self.clients.matchAll({ type: 'window' });
    cs.forEach((c) => { try { c.navigate(c.url); } catch (e) {} });
  })());
});
