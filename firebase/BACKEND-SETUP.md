# คู่มือตั้ง Backend — where to next? (Firebase)

เลือก **Firebase** เพราะรองรับครบในตัว: เบอร์โทร OTP + Google + Facebook + อีเมล/รหัสผ่าน,
ฐานข้อมูล (Firestore), ที่เก็บรูป (Storage), มี free tier (Spark) และต่อ client SDK ผ่าน CDN
ได้เลยโดยไม่ต้อง build — เข้ากับตัวแอปที่เป็นไฟล์ HTML เดียว

> คีย์ฝั่ง client (apiKey ฯลฯ) เปิดเผยได้ — ความปลอดภัยจริงอยู่ที่ **Security Rules** (ไฟล์ในโฟลเดอร์นี้)

## 1. สร้างโปรเจกต์
1. เข้า https://console.firebase.google.com → **Add project** (ปิด Analytics ก็ได้)

> คอนโซลรุ่นใหม่ไม่มีเมนู "Build" แล้ว — เมนูอยู่ในกลุ่มด้านซ้าย (หาไม่เจอให้พิมพ์ที่ **Search for products** ด้านบนซ้าย)

2. **Authentication** (อยู่กลุ่ม **Security** หรือค้นหา "Authentication") → **Get started** แล้วเปิด provider:
   - **Phone** (OTP) — ใส่เบอร์ทดสอบได้ในหน้า Phone
   - **Google** — เปิดได้เลย
   - **Facebook** — ต้องมี App ID/Secret จาก https://developers.facebook.com (ใส่ OAuth redirect ที่ Firebase บอก)
   - **Email/Password**
3. **Firestore Database** (กลุ่ม **Databases & Storage**) → **Create database** (โหมด production)
4. **Storage** (กลุ่ม **Databases & Storage**) → **Get started**

## 2. วาง Security Rules (สำคัญ)
- Firestore: เอาเนื้อหา `firebase/firestore.rules` ไปวางที่แท็บ **Rules** ของ Firestore → Publish
- Storage: เอา `firebase/storage.rules` ไปวางที่ **Rules** ของ Storage → Publish

กติกาที่ตั้งไว้: เจ้าของแก้ของตัวเองได้ · ทริป/เช็คอิน/งบ/เอกสาร = ส่วนตัว ·
**ตอนอ่านสาธารณะได้เฉพาะที่ `published == true`** (ตรงกับที่ต้องการ: ทุกตอนเริ่มเป็นส่วนตัวจนกดเผยแพร่)

## 3. ต่อค่าเข้าแอป
1. Project settings (เฟือง) → **Your apps → Web `</>`** → ลงทะเบียนแอป → คัดลอก `firebaseConfig`
2. เปิดไฟล์ `firebase-config.js` วางค่าทับ `PASTE_*` ให้ครบ
3. ตั้ง `window.WTN_BACKEND_ENABLED = true;`
4. **Authentication → Settings → Authorized domains** เพิ่มโดเมนที่ deploy เช่น `<user>.github.io`
   (และ `localhost` ถ้าทดสอบเครื่อง)

## 4. ให้ index.html โหลด backend
ใน `<helmet>` ของแอป เพิ่มก่อน `</helmet>`:
```html
<script src="firebase-config.js"></script>
<script type="module" src="wtn-backend.js"></script>
```
เมื่อพร้อม จะมี `window.WTNBackend` (async API) และยิง event `wtn-backend-ready`
ถ้า `WTN_BACKEND_ENABLED=false` แอปจะทำงานแบบ local เหมือนเดิม (ไม่พัง)

## 5. รูปภาพ
รูปในตอน/ปก/เอกสาร จะอัปโหลดขึ้น **Firebase Storage** แล้วเก็บเป็น URL (ไม่ใช่ base64)
→ เบา, sync ข้ามเครื่องได้, โหลดเร็ว (`WTNBackend.uploadImage(...)`)

## สถานะตอนนี้
- ✅ วาง data layer + rules + คู่มือ (โฟลเดอร์นี้) — ยังไม่แตะโค้ดแอปที่ใช้งานอยู่
- ⏭ ขั้นต่อไป: เดินสายในแอป (auth จริง + อ่าน/เขียนผ่าน `WTNBackend` + sync ทริป/เรื่องเล่า/คอมเมนต์/ถูกใจ)
  ทำเป็น offline-first: เขียน local ก่อนแล้ว sync ขึ้นคลาวด์ เพื่อให้ใช้ระหว่างทริป (เน็ตไม่ดี) ได้

## โครงข้อมูล (อ้างอิง)
```
users/{uid}                         โปรไฟล์ (อ่านสาธารณะ)
  likes/{chapterId}                 ถูกใจของฉัน
trips/{tripId}  (ownerUid)          ส่วนตัว
  checkins/{id}  expenses/{id}  docs/{id}  budget/{id}
stories/{storyId} (ownerUid)        เมทาเดต้าเล่ม (อ่านสาธารณะ)
  chapters/{cid}                    ตอน — อ่านได้เมื่อ published
    comments/{id}
Storage: users/{uid}/img/...
```
