// อัปเดตไฟล์เว็บใน www/ จากไฟล์ deploy ชุดล่าสุด
// ใช้: วางไฟล์ deploy ไว้ที่ ../_dist แล้วรัน  node sync-web.mjs
import { readFileSync, writeFileSync, copyFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const here = dirname(fileURLToPath(import.meta.url));
const SRC = process.argv[2] || join(here, '..', '_dist');
const WWW = join(here, 'www');
if (!existsSync(WWW)) mkdirSync(WWW, { recursive: true });

// sw.js ไม่ต้องเอาเข้า — แอป native เสิร์ฟไฟล์เองอยู่แล้ว
const FILES = ['index.html','wtn-backend.js','photo-pick.js','support.js','supabase-config.js',
  'manifest.webmanifest','logo.png','apple-touch-icon.png','og-image.png','image-slot.js',
  'icon-192.png','icon-maskable.png'];

for (const f of FILES) {
  const from = join(SRC, f);
  if (!existsSync(from)) { console.warn('ข้าม (ไม่พบ):', f); continue; }
  copyFileSync(from, join(WWW, f));
}

// ปรับ index.html ให้เหมาะกับ native
let html = readFileSync(join(WWW, 'index.html'), 'utf8');
html = html.replace("location.protocol === 'https:'", "location.protocol === 'https:' && !window.Capacitor");
if (!html.includes('native.js')) {
  html = html.replace('</head>', '  <script src="native.js"><\/script>\n</head>');
}
writeFileSync(join(WWW, 'index.html'), html);
console.log('sync เสร็จแล้ว → www/  (ต่อไปรัน: npx cap sync)');
