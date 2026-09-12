# Cloudflare Workers ของ Vela

บันทึกโค้ดและค่าตั้งของ Worker ทั้งหมดที่รันอยู่หน้าโดเมน `onevela.net`
เดิมโค้ดอยู่บน Cloudflare Dashboard อย่างเดียว ไม่มีใน repo — ถ้าเผลอลบคือหายถาวร
โฟลเดอร์นี้คือ backup + version control ของมัน

## สถานะ

| Worker | Route | ไฟล์ | สถานะ |
|---|---|---|---|
| `vela-media` | `onevela.net/i/*` | `vela-media-worker.js` | ✅ deploy แล้ว ใช้งานจริง |
| `vela-share` | `onevela.net/s/*` | _(ยังไม่ได้เก็บเข้า repo)_ | ✅ deploy แล้ว ใช้งานจริง |
| `vela-pdf` | `onevela.net/pdf/*` | _(ยังไม่มี)_ | ❌ ยังไม่ได้ทำ — `pdfBase: ""` |

สวิตช์ฝั่งแอปอยู่ที่ `app/supabase-config.js` (`mediaBase` / `shareBase` / `pdfBase`)
ค่าว่าง = ปิดการใช้ worker ตัวนั้น แล้ว fallback กลับไปทางเดิม

---

## vela-media

เสิร์ฟรูปของแอปจาก **Cloudflare R2** แทน Supabase Storage
เหตุผล: Supabase Free ให้ egress 5 GB/เดือน ซึ่งรูปกินเกือบหมด ส่วน R2 อ่านฟรีไม่จำกัด เก็บฟรี 10 GB

### ค่าตั้งบน Dashboard

- **R2 bucket:** `vela-media` (Location: Automatic) — **ไม่เปิด** public access เพราะ Worker เป็นคนเสิร์ฟให้
- **Binding:** `MEDIA` → bucket `vela-media`
- **Route:** `onevela.net/i/*` (zone `onevela.net`) — DNS ต้องเปิดพร็อกซี (เมฆส้ม)
- **Variables:** `SUPABASE_URL`
- **Secrets:** `SUPABASE_ANON`, `ADMIN_TOKEN`, `SUPABASE_SERVICE`

### Key layout

ใช้ path เดียวกับ Supabase Storage เป๊ะ จึงไม่ต้องแก้ลิงก์ที่เก็บไว้ในฐานข้อมูล:

```
users/<uid>/img/<file>.jpg
→ https://onevela.net/i/users/<uid>/img/<file>.jpg
```

ต้นทางเดิม: `…/storage/v1/object/public/media/<key>`

### Endpoints

| Method | Path | หน้าที่ |
|---|---|---|
| `GET` / `HEAD` | `/i/<key>` | เสิร์ฟรูป (auto-migrate ให้ในตัว) |
| `POST` | `/i/u?k=<key>` | อัปโหลด — ต้องมี Supabase bearer token และ key ต้องขึ้นต้นด้วย `users/<uid ของตัวเอง>/` จำกัด 12 MB |
| `GET` | `/i/_keys?t=<ADMIN_TOKEN>&prefix=&offset=` | รายชื่อไฟล์ใน Supabase ทีละชั้น |
| `GET` | `/i/_copy?t=<ADMIN_TOKEN>&k=<key>` | ก๊อปทีละไฟล์เข้า R2 (ข้ามถ้ามีแล้ว เรียกซ้ำได้) |
| `GET` | `/i/_has?t=<ADMIN_TOKEN>&k=<key>` | เช็กว่าคีย์อยู่ใน R2 แล้วหรือยัง |

### กลไก auto-migrate

`GET` คีย์ไหนที่ R2 ยังไม่มี → Worker ดึงจาก Supabase Storage มาเสิร์ฟ แล้ว `waitUntil` เขียนลง R2
ครั้งต่อไปไม่แตะ Supabase อีก

การ "ย้ายรูปเก่า" จึงทำได้โดย **ยิง GET ผ่านโดเมนให้ครบทุกคีย์** ไม่ต้องใช้ credential R2
และไม่ต้องแก้ลิงก์ในฐานข้อมูล

### ตรวจว่าเสิร์ฟจากไหน

response header `x-vela-src`:

- `r2` — มาจาก R2 แล้ว (เป้าหมาย)
- `supabase` — ยังไม่มีใน R2 รอบนี้ไปดึงจาก Supabase มาให้ พร้อมเขียนลง R2

⚠ Worker cache response ไว้ที่ edge (`cache-control: immutable` + `caches.default`)
ถ้าเช็กด้วย URL เดิมจะเจอ `cf-cache-status: HIT` แล้วเห็น `x-vela-src` ค้างค่าเก่า
**ต้องเติม query string กัน cache** เช่น `?cb=1` เพื่อบังคับให้ Worker ตอบจากของจริง

---

## บันทึกการย้ายข้อมูล

**12 ก.ย. 2026 — ย้ายรูปทั้งถังจาก Supabase Storage เข้า R2 เสร็จสมบูรณ์**

- ทั้งหมด **1,078 ไฟล์** (549 ตัวเต็ม + 528 thumbnail + 1 อื่นๆ) ใน 3 uid
- วิธี: ยิง `GET /i/<key>` ทุกคีย์ผ่านโดเมน ให้ auto-migrate ทำงาน (ไม่ได้ใช้ `_copy` เลยไม่ต้องแตะ `ADMIN_TOKEN` / `SUPABASE_SERVICE`)
- ผล: 1,078/1,078 ได้ HTTP 200 ไม่มี 404 ไม่มี error
- ตรวจซ้ำแบบกัน edge cache: `x-vela-src: r2` ครบ 1,078/1,078 ไม่มีตัวไหน fallback กลับ Supabase

ตรวจฝั่ง Cloudflare:

```bash
npx wrangler r2 object list vela-media --remote | wc -l   # ควรได้ 1078
```
