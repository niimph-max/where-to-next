/**
 * vela-media — Cloudflare Worker + R2: เก็บ/เสิร์ฟรูปของแอปบนโดเมนเราเอง
 *
 *   GET  https://onevela.net/i/users/<uid>/img/<file>.jpg   → รูป (จาก R2)
 *   POST https://onevela.net/i/u?k=users/<uid>/img/x.jpg    → อัปโหลด (ต้องมี token)
 *
 * ทำไม: Supabase Free ให้ egress 5 GB/เดือน — รูปกินเกือบหมด
 *       R2 อ่านฟรีไม่จำกัด เก็บฟรี 10 GB → ค่าโหลดรูปเหลือ 0
 *
 * ✦ ย้ายรูปเก่าอัตโนมัติ: ถ้าใน R2 ยังไม่มีไฟล์นั้น Worker จะไปดึงจาก Supabase
 *   Storage ให้ แล้ว "ก๊อปเก็บลง R2" ไว้เลย ครั้งต่อไปไม่แตะ Supabase อีก
 *   → ไม่ต้องรันสคริปต์ย้ายข้อมูล ไม่ต้องแก้ลิงก์ที่เก็บไว้ในฐานข้อมูล
 *
 * ══ ติดตั้ง (ครั้งเดียว) ══
 * 1) Cloudflare → R2 → Create bucket  ชื่อ  vela-media   (Location: Automatic)
 *
 * 2) Workers & Pages → Create → Worker  ชื่อ  vela-media
 *    → Deploy → Edit code → ลบของเดิม วางไฟล์นี้ → Deploy
 *
 * 3) Worker นั้น → Settings → Bindings → Add → R2 bucket
 *      Variable name: MEDIA        Bucket: vela-media
 *
 * 4) Worker นั้น → Settings → Variables and Secrets → Add
 *      SUPABASE_URL  = https://glnpyzlbalxnqrqxdsuo.supabase.co
 *      SUPABASE_ANON = (anon key จาก supabase-config.js)
 *
 * 5) Worker นั้น → Domains & Routes → Add → Route
 *      Route: onevela.net/i/*      Zone: onevela.net
 *    ⚠ DNS ของ onevela.net ต้องเปิดพร็อกซี (เมฆส้ม)
 *
 * 6) ในโปรเจกต์: supabase-config.js → mediaBase: "https://onevela.net/i"
 *
 * หมายเหตุ: bucket ไม่ต้องเปิด public access — Worker เป็นคนเสิร์ฟให้
 */

const PREFIX = '/i/';
const SB_MEDIA = '/storage/v1/object/public/media/';

const cors = (r) => {
  const h = new Headers(r.headers);
  h.set('Access-Control-Allow-Origin', '*');
  h.set('Access-Control-Allow-Headers', 'authorization,content-type');
  h.set('Access-Control-Allow-Methods', 'GET,HEAD,POST,OPTIONS');
  return new Response(r.body, { status: r.status, headers: h });
};
const json = (o, s) => cors(new Response(JSON.stringify(o), {
  status: s || 200, headers: { 'content-type': 'application/json; charset=utf-8' }
}));

// ตรวจ token ของ Supabase → คืน uid (null = ไม่ผ่าน)
async function uidOf(req, env) {
  const auth = req.headers.get('authorization') || '';
  if (!/^bearer\s+/i.test(auth)) return null;
  try {
    const r = await fetch(env.SUPABASE_URL + '/auth/v1/user', {
      headers: { authorization: auth, apikey: env.SUPABASE_ANON }
    });
    if (!r.ok) return null;
    const u = await r.json();
    return (u && u.id) || null;
  } catch (e) { return null; }
}

function guessType(key) {
  const e = (key.split('.').pop() || '').toLowerCase();
  return e === 'png' ? 'image/png'
    : e === 'webp' ? 'image/webp'
    : e === 'gif' ? 'image/gif'
    : e === 'avif' ? 'image/avif'
    : 'image/jpeg';
}

async function serve(req, env, key, ctx) {
  const cache = caches.default;
  const hit = await cache.match(req);
  if (hit) return hit;

  let obj = await env.MEDIA.get(key);

  // ยังไม่มีใน R2 → ไปเอาจาก Supabase แล้วเก็บลง R2 (ย้ายทีละรูปตอนถูกเรียกใช้)
  if (!obj) {
    const up = await fetch(env.SUPABASE_URL + SB_MEDIA + key);
    if (!up.ok) return cors(new Response('not found', { status: 404 }));
    const buf = await up.arrayBuffer();
    const ct = up.headers.get('content-type') || guessType(key);
    ctx.waitUntil(env.MEDIA.put(key, buf, { httpMetadata: { contentType: ct } }));
    const res = cors(new Response(buf, {
      headers: { 'content-type': ct, 'cache-control': 'public, max-age=31536000, immutable', 'x-vela-src': 'supabase' }
    }));
    ctx.waitUntil(cache.put(req, res.clone()));
    return res;
  }

  const h = new Headers();
  obj.writeHttpMetadata(h);
  if (!h.get('content-type')) h.set('content-type', guessType(key));
  h.set('etag', obj.httpEtag);
  h.set('cache-control', 'public, max-age=31536000, immutable');
  h.set('access-control-allow-origin', '*');
  h.set('x-vela-src', 'r2');
  const res = new Response(req.method === 'HEAD' ? null : obj.body, { headers: h });
  ctx.waitUntil(cache.put(req, res.clone()));
  return res;
}

// ══ แอดมิน: ย้ายรูปเก่าทั้งถังจาก Supabase Storage → R2 รอบเดียว ══
// ต้องเพิ่ม Secret ใน Worker 2 ตัว (Settings → Variables and Secrets):
//   ADMIN_TOKEN      = รหัสเดายาก (ใส่ในหน้าเครื่องมือ Vela Media Migration)
//   SUPABASE_SERVICE = service_role key (ใช้อ่าน "รายชื่อไฟล์" เท่านั้น)
async function sbList(env, prefix, limit, offset) {
  const r = await fetch(env.SUPABASE_URL + '/storage/v1/object/list/media', {
    method: 'POST',
    headers: {
      apikey: env.SUPABASE_SERVICE,
      authorization: 'Bearer ' + env.SUPABASE_SERVICE,
      'content-type': 'application/json'
    },
    body: JSON.stringify({ prefix: prefix, limit: limit, offset: offset, sortBy: { column: 'name', order: 'asc' } })
  });
  if (!r.ok) throw new Error('list ' + r.status);
  return r.json();
}

async function admin(req, env, cmd) {
  const url = new URL(req.url);
  if (!env.ADMIN_TOKEN || url.searchParams.get('t') !== env.ADMIN_TOKEN)
    return json({ error: 'forbidden' }, 403);

  // รายชื่อไฟล์/โฟลเดอร์ในชั้นเดียว (หน้าเครื่องมือเดินลงชั้นเอง)
  if (cmd === 'keys') {
    if (!env.SUPABASE_SERVICE) return json({ error: 'no SUPABASE_SERVICE' }, 500);
    const prefix = (url.searchParams.get('prefix') || '').replace(/^\/+|\/+$/g, '');
    const offset = +(url.searchParams.get('offset') || 0);
    const rows = await sbList(env, prefix, 1000, offset);
    const files = [], folders = [];
    for (const it of rows) {
      const key = prefix ? prefix + '/' + it.name : it.name;
      if (it.id) files.push({ k: key, n: (it.metadata && it.metadata.size) || 0 });
      else folders.push(key);
    }
    return json({ files: files, folders: folders, more: rows.length >= 1000 });
  }

  // ก๊อปทีละไฟล์ (ข้ามถ้ามีใน R2 แล้ว) — เรียกซ้ำได้ ไม่เสียหาย
  if (cmd === 'copy') {
    const key = url.searchParams.get('k') || '';
    if (!key || key.indexOf('..') !== -1) return json({ error: 'bad key' }, 400);
    if (await env.MEDIA.head(key)) return json({ s: 'exists' });
    const up = await fetch(env.SUPABASE_URL + SB_MEDIA + key.split('/').map(encodeURIComponent).join('/'));
    if (!up.ok) return json({ s: 'missing', code: up.status });
    const buf = await up.arrayBuffer();
    await env.MEDIA.put(key, buf, {
      httpMetadata: { contentType: up.headers.get('content-type') || guessType(key) }
    });
    return json({ s: 'copied', n: buf.byteLength });
  }

  // เช็กว่าคีย์นี้อยู่ใน R2 แล้วหรือยัง (ใช้ตรวจหลังย้าย)
  if (cmd === 'has') {
    const key = url.searchParams.get('k') || '';
    const o = key ? await env.MEDIA.head(key) : null;
    return json({ r2: !!o, n: o ? o.size : 0 });
  }

  return json({ error: 'unknown command' }, 404);
}

async function upload(req, env) {
  const uid = await uidOf(req, env);
  if (!uid) return json({ error: 'unauthorized' }, 401);

  const key = new URL(req.url).searchParams.get('k') || '';
  if (!/^users\/[\w-]+\/[\w./-]+$/.test(key) || key.indexOf('..') !== -1)
    return json({ error: 'bad key' }, 400);
  if (key.indexOf('users/' + uid + '/') !== 0) return json({ error: 'forbidden' }, 403);

  const buf = await req.arrayBuffer();
  if (!buf.byteLength) return json({ error: 'empty' }, 400);
  if (buf.byteLength > 12 * 1024 * 1024) return json({ error: 'too large' }, 413);

  const ct = req.headers.get('content-type') || guessType(key);
  await env.MEDIA.put(key, buf, { httpMetadata: { contentType: ct } });
  return json({ url: new URL(req.url).origin + PREFIX + key });
}

export default {
  async fetch(req, env, ctx) {
    const url = new URL(req.url);
    if (req.method === 'OPTIONS') return cors(new Response(null, { status: 204 }));
    if (!url.pathname.startsWith(PREFIX)) return new Response('not found', { status: 404 });

    const rest = url.pathname.slice(PREFIX.length);
    if (rest === 'u') {
      if (req.method !== 'POST') return json({ error: 'method' }, 405);
      return upload(req, env);
    }
    if (rest.charAt(0) === '_') {
      try { return await admin(req, env, rest.slice(1)); }
      catch (e) { return json({ error: String((e && e.message) || e) }, 500); }
    }
    if (req.method !== 'GET' && req.method !== 'HEAD') return json({ error: 'method' }, 405);

    const key = decodeURIComponent(rest);
    if (!key || key.indexOf('..') !== -1) return cors(new Response('bad key', { status: 400 }));
    return serve(req, env, key, ctx);
  }
};
