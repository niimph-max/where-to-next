/**
 * vela-share — Cloudflare Worker: การ์ดลิงก์แชร์เรื่องเล่า บนโดเมนเราเอง
 *
 * ลิงก์ที่ได้:  https://onevela.net/s/<storyId>/<chapterId>
 * โพสต์บน Facebook / LINE จะขึ้น onevela.net + ปกกับชื่อตอนจริง
 *
 * ตัวนี้ทำงานจบในตัว — อ่านข้อมูลตอนจาก Supabase REST เอง
 * ไม่ต้อง deploy Edge Function ที่ Supabase
 *
 * ⚠ สำคัญ (บทเรียน 28 ส.ค. 2026): ห้าม select ก้อน data ทั้งก้อน
 * เนื้อตอนโตได้หลาย MB (เคยเจอ 2.8 MB) → Worker ฟรีประมวลผลไม่ทัน (CPU 10ms)
 * → ตกไปใช้การ์ดกลางทุกครั้ง  ดึงเฉพาะฟิลด์ที่ใช้เท่านั้น
 *
 * ══ ติดตั้ง (ครั้งเดียว) ══
 * 1) Cloudflare → Workers & Pages → Create → Worker
 *    ตั้งชื่อ vela-share → Deploy → Edit code → ลบของเดิม วางไฟล์นี้ → Deploy
 *
 * 2) Worker นั้น → Settings → Variables and Secrets → Add
 *      SUPABASE_URL  = https://glnpyzlbalxnqrqxdsuo.supabase.co
 *      SUPABASE_ANON = (anon key จาก supabase-config.js — เปิดเผยได้ ไม่ใช่ความลับ)
 *      APP_URL       = https://onevela.net/app
 *
 * 3) Worker นั้น → Domains → Add → Route
 *      Route: onevela.net/s/*        Zone: onevela.net
 *      Route: onevela.net/b/*        Zone: onevela.net   ← ลิงก์แชร์เล่ม (เพิ่ม 8 ก.ย. 2026)
 *    ⚠ DNS ของ onevela.net ต้องเปิดพร็อกซี (เมฆส้ม) ไม่งั้น route ไม่ทำงาน
 *
 * 4) ในโปรเจกต์: supabase-config.js → shareBase: "https://onevela.net/s"
 *
 * (ไม่บังคับ) อยากให้การ์ดมีคำโปรยจากเนื้อเรื่องจริง — รัน
 * supabase/share-chapter.sql ใน Supabase SQL Editor ครั้งเดียว
 *
 * ลิงก์แชร์เล่ม (/b/<id>) ต้องรัน supabase/books.sql ครั้งเดียวก่อน (สร้างตาราง books + share_book)
 */

const E = (s) => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const clip = (s, n) => {
  const t = String(s ?? '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  return t.length > n ? t.slice(0, n - 1).trimEnd() + '…' : t;
};

const MEDIA_BASE = 'https://onevela.net/i';
const SB_MEDIA = '/storage/v1/object/public/media/';

// ลิงก์รูปเก่าชี้ไป Supabase Storage ตรง ๆ — ครอว์เลอร์ของ Facebook/LINE กับคนที่เปิด
// ลิงก์แชร์จะดูดรูปขนาดเต็มจาก Supabase ทุกครั้ง (กิน egress หนักสุดในระบบ)
// → เปลี่ยนเป็นโดเมนเราเอง (R2 อ่านฟรี + Worker ย้ายรูปให้เองรอบเดียว)
const cdn = (v) => {
  const i = v.indexOf(SB_MEDIA);
  return i === -1 ? v : MEDIA_BASE + '/' + v.slice(i + SB_MEDIA.length);
};
const https = (v) => (typeof v === 'string' && v.startsWith('https://')) ? cdn(v) : '';

function page(o) {
  // ประกาศขนาดเฉพาะรูปที่รู้ขนาดจริง — บอกผิดแล้ว Facebook จะครอปหรือหล่นเป็นการ์ดเล็ก
  const dims = o.sized
    ? '<meta property="og:image:width" content="1200">\n<meta property="og:image:height" content="630">'
    : '';
  return `<!DOCTYPE html>
<html lang="th">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${E(o.title)}</title>
<link rel="canonical" href="${E(o.url)}">
<meta name="description" content="${E(o.desc)}">
<meta property="og:type" content="article">
<meta property="og:site_name" content="Vela">
<meta property="og:locale" content="th_TH">
<meta property="og:url" content="${E(o.url)}">
<meta property="og:title" content="${E(o.title)}">
<meta property="og:description" content="${E(o.desc)}">
<meta property="og:image" content="${E(o.image)}">
<meta property="og:image:secure_url" content="${E(o.image)}">
${dims}
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${E(o.title)}">
<meta name="twitter:description" content="${E(o.desc)}">
<meta name="twitter:image" content="${E(o.image)}">
<link rel="icon" href="${E(o.app)}/logo.png">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Anuphan:wght@400;500;600;700&family=Chonburi&display=swap" rel="stylesheet">
<script>
  /* คนกดลิงก์ → เข้าแอปเลย  (crawler ไม่รัน script จึงอ่าน og ข้างบนได้ครบ) */
  location.replace(${JSON.stringify(o.target)});
</script>
</head>
<body style="margin:0;min-height:100vh;background:#f6efe2;font-family:'Anuphan',system-ui,sans-serif;display:flex;align-items:center;justify-content:center;padding:28px">
  <div style="max-width:420px;text-align:center">
    <img src="${E(o.image)}" alt="" style="width:100%;aspect-ratio:16/9;object-fit:cover;border-radius:18px;background:#e6dbc7">
    <h1 style="font-family:'Chonburi',serif;font-weight:400;font-size:24px;line-height:1.35;color:#2b241f;margin:20px 0 8px">${E(o.title)}</h1>
    <p style="font:500 15px/1.7 'Anuphan';color:#6c5f4f;margin:0 0 22px;text-wrap:pretty">${E(o.desc)}</p>
    <a href="${E(o.target)}" style="display:inline-block;background:#c05f39;color:#fff;font:600 16px 'Anuphan';text-decoration:none;padding:13px 26px;border-radius:14px">อ่านต่อใน Vela</a>
    <div style="font:500 13px 'Anuphan';color:#a1927c;margin-top:18px">${E(o.author)} · onevela.net</div>
  </div>
</body>
</html>`;
}

// ดึงข้อมูลตอน — เบาที่สุดเท่าที่ทำได้ (ห้ามลากก้อน data ทั้งก้อน)
async function loadChapter(env, st, ch) {
  const base = env.SUPABASE_URL.replace(/\/+$/, '');
  const H = { apikey: env.SUPABASE_ANON, Authorization: `Bearer ${env.SUPABASE_ANON}` };

  // ทางที่ 1: ฟังก์ชัน share_chapter (ได้คำโปรยจากเนื้อเรื่องจริง — ถ้ารัน SQL ไว้)
  try {
    const r = await fetch(`${base}/rest/v1/rpc/share_chapter`, {
      method: 'POST',
      headers: { ...H, 'content-type': 'application/json' },
      body: JSON.stringify({ p_story: st, p_chapter: ch }),
    });
    if (r.ok) {
      const rows = await r.json();
      const d = Array.isArray(rows) ? rows[0] : rows;
      if (d && (d.title || d.cover || d.excerpt)) {
        return { title: d.title, cover: d.cover || d.photo, excerpt: d.excerpt, author: d.author_name };
      }
    }
  } catch (_e) { /* ไม่มีฟังก์ชัน → ใช้ทางที่ 2 */ }

  // ทางที่ 2: select เฉพาะฟิลด์ในก้อน JSON (ไม่มีคำโปรย แต่ได้ชื่อตอน + ปก)
  try {
    const q = `${base}/rest/v1/chapters` +
      `?story_id=eq.${encodeURIComponent(st)}&id=eq.${encodeURIComponent(ch)}` +
      `&published=eq.true&limit=1` +
      `&select=title:data->>title,cover:data->>cover,author_name:data->>authorName,photo:data->photos->>0`;
    const r = await fetch(q, { headers: H });
    if (!r.ok) return null;
    const rows = await r.json();
    const d = rows?.[0];
    if (!d) return null;
    return { title: d.title, cover: d.cover || d.photo, excerpt: '', author: d.author_name };
  } catch (_e) { return null; }
}

// ดึงข้อมูลเล่มที่แชร์ (โฟโต้บุ๊ก/หนังสือ) — เฉพาะปก+ชื่อ+จำนวน ห้ามลากก้อน plan
async function loadBook(env, id) {
  const base = env.SUPABASE_URL.replace(/\/+$/, '');
  const H = { apikey: env.SUPABASE_ANON, Authorization: `Bearer ${env.SUPABASE_ANON}` };
  try {
    const r = await fetch(`${base}/rest/v1/rpc/share_book`, {
      method: 'POST',
      headers: { ...H, 'content-type': 'application/json' },
      body: JSON.stringify({ p_id: id }),
    });
    if (!r.ok) return null;
    const rows = await r.json();
    const d = Array.isArray(rows) ? rows[0] : rows;
    if (!d || (!d.title && !d.cover)) return null;
    return d;
  } catch (_e) { return null; }
}

export default {
  async fetch(request, env) {
    const u = new URL(request.url);
    const app = (env.APP_URL || 'https://onevela.net/app').replace(/\/+$/, '');
    const fallbackImg = app + '/og-image.png';

    // /b/<bookId> — เล่มที่แชร์เป็นลิงก์ (การ์ดโชว์แค่ปกกับชื่อ)
    if (/^\/b\//.test(u.pathname)) {
      const bid = decodeURIComponent(u.pathname.replace(/^\/b\/?/, '').split('/')[0] || '');
      // in-app browser ของ LINE/FB แคชเอกสารเดิมไว้แน่นและรีเฟรชแรงไม่ได้ → แนบตัวกันแคชรายชั่วโมง
      // (แอปลบพารามิเตอร์ทิ้งทันทีที่อ่านค่าได้ จึงไม่ค้างบน URL)
      const cb = Math.floor(Date.now() / 36e5).toString(36);
      const bTarget = bid ? `${app}/?b=${encodeURIComponent(bid)}&v=${cb}` : app + '/';
      const bSelf = `${u.origin}/b/${encodeURIComponent(bid)}`;
      let b = null;
      if (bid && env.SUPABASE_URL && env.SUPABASE_ANON) b = await loadBook(env, bid);
      const bImg = b ? https(b.cover) : '';
      const body = page(b ? {
        title: clip(b.title, 90) || 'เล่มจากทริป',
        desc: [b.photos ? b.photos + ' รูป' : '', b.pages ? b.pages + ' หน้า' : ''].filter(Boolean).join(' · ') || 'เปิดดูใน Vela',
        image: bImg || fallbackImg, sized: !bImg,
        url: bSelf, target: bTarget, app, author: b.author || 'Vela',
      } : {
        title: 'Vela — วางแผนทริป & เล่าเรื่องเดินทาง',
        desc: 'วางแผนรายวัน จดงบ เที่ยว แล้วเปลี่ยนเป็นเรื่องเล่า',
        image: fallbackImg, sized: true,
        url: bid ? bSelf : 'https://onevela.net',
        target: bTarget, app, author: 'Vela',
      });
      return new Response(new TextEncoder().encode(body), {
        status: 200,
        headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'public, max-age=300, s-maxage=600' },
      });
    }

    // /s/<storyId>/<chapterId>   (รับ ?st=&ch= ด้วย เผื่อลิงก์เก่า)
    const seg = u.pathname.replace(/^\/s\/?/, '').split('/').filter(Boolean).map(decodeURIComponent);
    const st = seg[0] || u.searchParams.get('st') || '';
    const ch = seg[1] || u.searchParams.get('ch') || '';

    const cbs = Math.floor(Date.now() / 36e5).toString(36);
    const target = st && ch
      ? `${app}/?st=${encodeURIComponent(st)}&ch=${encodeURIComponent(ch)}&v=${cbs}`
      : app + '/';
    const selfUrl = `${u.origin}/s/${encodeURIComponent(st)}/${encodeURIComponent(ch)}`;

    let d = null;
    if (st && ch && env.SUPABASE_URL && env.SUPABASE_ANON) d = await loadChapter(env, st, ch);

    let body;
    if (d) {
      const img = https(d.cover);
      body = page({
        title: clip(d.title, 90) || 'เรื่องเล่าจากทริป',
        desc: clip(d.excerpt, 180) || 'บันทึกไว้ระหว่างทาง — อ่านต่อใน Vela',
        image: img || fallbackImg, sized: !img,
        url: selfUrl, target, app,
        author: d.author || 'Vela',
      });
    } else {
      body = page({
        title: 'Vela — วางแผนทริป & เล่าเรื่องเดินทาง',
        desc: 'วางแผนรายวัน จดงบ เที่ยว แล้วเปลี่ยนเป็นเรื่องเล่า',
        image: fallbackImg, sized: true,
        url: st && ch ? selfUrl : 'https://onevela.net',
        target, app, author: 'Vela',
      });
    }

    return new Response(new TextEncoder().encode(body), {
      status: 200,
      headers: {
        'content-type': 'text/html; charset=utf-8',
        'cache-control': 'public, max-age=300, s-maxage=600',
      },
    });
  },
};
