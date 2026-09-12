# Project: "where to next?" / ทริปหน้าไปไหน

แอปวางแผนทริป + เรื่องเล่า (เจ้าของ = Nim / nimjourney, ผู้ใช้คนแรก)

## สำคัญ
- **นี่คือ MOBILE APP เป็นหลัก** — ทุกดีไซน์คงเป็นหน้าจอมือถือเสมอ (เฟรม ~402px, แถบเมนูล่าง 4 อัน: เรื่องเล่า/สำรวจ/แผนของฉัน/ฉัน, ปุ่มขนาดนิ้วแตะ ≥44px). อย่าทำเป็น desktop/web layout.
- **ไฟล์หลักของแอป = `app/index.html`** (แก้ที่นี่) — ไฟล์เดียวจบ ~1.3 MB เสิร์ฟที่ `onevela.net/app`
- `index.html` ที่ root = **หน้าเว็บขาย/landing** (`onevela.net`) คนละไฟล์กับแอป อย่าสับสน
- ⚠ `Where to Next.dc.html` = Design canvas เก่า **ค้างอยู่ที่เวอร์ชัน 2026.07.20z — เลิกใช้แล้ว** เก็บไว้เป็นประวัติเท่านั้น **ห้ามแก้ที่นั่นแล้วก็อปทับ `app/index.html`** จะย้อนแอปกลับไปหลายเดือน
- **ห้ามสร้างโฟลเดอร์ `deploy/` ซ้ำอีก** — เคยมี 2 ชุดแล้วสับสนมาก ลบทิ้งไปแล้ว GitHub Pages เสิร์ฟจาก root
- เวลาแก้เสร็จ: อัปเดต `appVersion` (renderVals) ใน `app/index.html` + `CACHE` ใน `app/sw.js` ให้เป็นเวอร์ชันวันนั้น (รูปแบบ `YYYY.MM.DDx`) **ทั้งสองที่ต้องตรงกัน** ไม่งั้น auto-update ไม่เด้งบิลด์ใหม่
- เปิดหน้าแรกที่ onboarding → เข้า "แผนของฉัน" (planning-first)

## แผนผังไฟล์

| ที่อยู่ | คืออะไร |
|---|---|
| `app/` | **ตัวแอป** — `index.html`, `sw.js`, `wtn-backend.js`, `photo-pick.js`, `supabase-config.js`, ไอคอน/manifest |
| `index.html` (root) | หน้าเว็บขาย + `help-*.html`, `privacy.html`, `support.js` |
| `cloudflare/` | โค้ด Cloudflare Worker + wrangler config + เอกสาร |
| `supabase/` | SQL ที่ต้องรันใน Supabase (`share-chapter.sql`, `books.sql`) |
| `capacitor/` | แอป native — `www/` คือสำเนาของแอปสำหรับบิลด์ |
| `codemagic.yaml` | ตั้งค่า CI บิลด์ iOS/Android |
| `firebase/`, `firebase-config.js` | ของเก่าก่อนย้ายมา Supabase — ไม่ได้ใช้แล้ว |

## หลังบ้าน
- **ข้อมูล**: Supabase (โปรเจกต์ onevela) — anon key เปิดเผยได้ ปลอดภัยเพราะมี RLS คุม
- **รูป**: Cloudflare R2 bucket `vela-media` เสิร์ฟผ่าน Worker ที่ `onevela.net/i/*` — key ใช้ path เดียวกับ Supabase Storage (`users/<uid>/img/<file>.jpg`) Worker ย้ายรูปเข้า R2 เองตอนถูกเรียกครั้งแรก
- **ลิงก์แชร์**: Worker ที่ `onevela.net/s/*` (ตอน) และ `/b/*` (เล่ม) — ต้องมี RPC `share_chapter` / `share_book` ใน Supabase
- **PDF worker** `/pdf/*` ยังไม่ได้ทำ (`pdfBase` ว่าง)
- สวิตช์เปิด/ปิด worker อยู่ที่ `app/supabase-config.js` (`mediaBase` / `shareBase` / `pdfBase`) — ค่าว่าง = fallback กลับทางเดิม ไม่พัง

## แอป native (iOS / Android)
บิลด์ด้วย Codemagic ไม่ต้องมี Mac · Bundle ID `net.onevela.app`

1. วางไฟล์ deploy ชุดล่าสุดไว้ที่ `_dist`
2. `node capacitor/sync-web.mjs` — ก็อปเข้า `capacitor/www/` แล้วปรับให้เหมาะ native (เติม `native.js`, ปิด https-redirect เมื่อรันใน Capacitor, ไม่เอา `sw.js` เข้าไป)
3. ถ้าขึ้นเวอร์ชันการตลาดใหม่ แก้ `VELA_VERSION` ใน `codemagic.yaml` — build number นับต่อจาก TestFlight ให้เอง
4. push → `ios-release` ส่งขึ้น TestFlight อัตโนมัติ · `android-test` ได้ APK debug (ยังไม่ใช่ตัวขึ้น Play Store)

⚠ ทั้งสอง workflow เช็ค `capacitor/www/index.html` ก่อนเริ่ม ลืมขั้น 2 = fail ทันที

**นโยบาย: ไม่ต้อง sync native ทุกครั้งที่แก้เว็บ** — ทำเฉพาะตอนที่การแก้นั้นมีผลกับแอป native จริงๆ หรือตอนจะส่ง TestFlight รอบใหม่ การที่ `capacitor/www/` ตามหลัง `app/` อยู่เป็นเรื่องปกติและตั้งใจ ไม่ใช่บั๊ก

## ทิศทาง/แบรนด์
- ชื่อแอป: "where to next?" / ทริปหน้าไปไหน
- โทน: อบอุ่น เป็นกันเอง — ครีม + ดินเผา (#c05f39), ฟอนต์ Chonburi (หัวเรื่อง) + Anuphan (เนื้อหา)
- ภาษา: ไทยเป็นหลัก
- แกนแอป = วางแผนรายวัน + งบ → เที่ยว → บันทึกเป็นเรื่องเล่า/รีแคป

## รายได้
- แอฟฟิลิเอต (ลิงก์จองในหน้าเพิ่มกิจกรรม: ที่พัก/เดินทาง/กิน/ที่เที่ยว) + AI พรีเมียม + ขายอีบุ๊ก/ร้านครีเอเตอร์
- AI: ใช้ AI ของแอป (ฟรีจำกัด/พรีเมียม) หรือผู้ใช้เชื่อม API key ตัวเอง (BYOK)

## งานถัดไป (ลำดับอยู่ใน ROADMAP.md — อ่านก่อนเริ่มงานใหม่ทุกครั้ง)
1. **แผนของฉัน** ให้ใช้บันทึกจริงได้ (ทริปคาซัคสถานเริ่ม 24 ก.ค.) ⭐ งานแรก
2. เรื่องเล่าจากทริป (หลังกลับ) — การจัดหมวดหมู่ยังไม่สรุป
3. ฟีเจอร์วางแผนทริป
4. สำรวจ (ข้อมูลภายนอก + backend) — หลังสุด

## สถานะปัจจุบัน
_(ส่วนนี้เขียนไว้ช่วง ก.ค. 2026 — ถามเจ้าของก่อนใช้อ้างอิง)_
มีทริปจริงทริปเดียว: คาซัคสถาน 11 วัน (24 ก.ค.–3 ส.ค. จากตั๋ว AirAsia + โปรแกรมทัวร์). seed ตัวอย่างอื่นลบหมดแล้ว. ที่เหลือผู้ใช้เติมเอง.
