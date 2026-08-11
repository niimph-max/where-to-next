# Vela — โปรเจกต์ Capacitor (แอป iOS / Android)

ห่อโค้ดเว็บชุดเดิมเป็นแอปจริง ไม่ต้องเขียนใหม่ ข้อมูลในเครื่องไม่โดน iOS ลบทิ้งตามกฎ 7 วันอีกต่อไป

---

## สิ่งที่ต้องมีก่อน

| อย่าง | ใช้ทำอะไร | หมายเหตุ |
|---|---|---|
| Node.js 18+ | รันคำสั่ง build | nodejs.org |
| Xcode 15+ | build iOS | ต้องใช้เครื่อง Mac |
| Android Studio | build Android | ใช้ได้ทั้ง Mac/Windows |
| บัญชี Apple Developer | ส่งขึ้น App Store | $99/ปี |
| บัญชี Google Play | ส่งขึ้น Play Store | $25 ครั้งเดียว |

---

## ขั้นตอนติดตั้ง (ทำครั้งเดียว)

```bash
cd capacitor
npm install
npx cap add ios          # ข้ามได้ถ้าไม่ทำ iOS
npx cap add android      # ข้ามได้ถ้าไม่ทำ Android
npx cap sync
```

---

## เวลาที่แก้แอปแล้วอยากอัปเดตลงมือถือ

1. เอาไฟล์ deploy ชุดล่าสุดไปวางไว้ที่โฟลเดอร์ `_dist/` (ระดับเดียวกับ `capacitor/`)
2. รัน:

```bash
cd capacitor
node sync-web.mjs        # คัดลอกไฟล์เว็บเข้า www/ + ปรับให้เข้ากับ native
npx cap sync             # ส่งเข้า iOS/Android
npx cap open ios         # หรือ npx cap open android
```

แล้วกดปุ่ม Run ใน Xcode / Android Studio

> `sync-web.mjs` ทำ 2 อย่างให้อัตโนมัติ: ปิด service worker (แอป native เสิร์ฟไฟล์เองอยู่แล้ว) และแทรก `native.js` เข้าไปใน `index.html`

---

## ตั้งค่าฝั่ง native (ทำครั้งเดียวหลัง `cap add`)

### iOS — `ios/App/App/Info.plist`

เพิ่มข้อความขออนุญาต (ถ้าไม่มี แอปจะถูก Apple ตีกลับ):

```xml
<key>NSPhotoLibraryUsageDescription</key>
<string>Vela ใช้รูปจากคลังภาพของคุณเพื่อแนบลงในบันทึกการเดินทาง</string>
<key>NSPhotoLibraryAddUsageDescription</key>
<string>Vela บันทึกรูปที่คุณสร้างกลับลงคลังภาพ</string>
<key>NSCameraUsageDescription</key>
<string>Vela ใช้กล้องเพื่อถ่ายรูปแนบลงบันทึกการเดินทาง</string>
<key>NSLocationWhenInUseUsageDescription</key>
<string>Vela ใช้ตำแหน่งเพื่อปักหมุดสถานที่ให้บันทึกของคุณอัตโนมัติ</string>
```

### Android — `android/app/src/main/AndroidManifest.xml`

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />
```

### ไอคอน & splash

```bash
npm i -D @capacitor/assets
npx capacitor-assets generate --iconBackgroundColor '#2b241f' --splashBackgroundColor '#2b241f'
```

วางไฟล์ต้นทางไว้ที่ `assets/icon.png` (1024×1024) และ `assets/splash.png` (2732×2732) ก่อนรัน

---

## Supabase — ต้องเพิ่ม redirect URL

เข้า Supabase Dashboard → Authentication → URL Configuration → **Redirect URLs** เพิ่ม:

```
capacitor://localhost
https://localhost
net.onevela.app://
```

ถ้าไม่เพิ่ม การล็อกอินด้วย Google/Facebook ในแอปจะเด้งกลับไม่ได้ (ล็อกอินด้วยอีเมลใช้ได้ปกติ)

---

## สิ่งที่ดีขึ้นทันทีเมื่อเป็น native

- **ข้อมูลอยู่ถาวร** — ไม่มีกฎลบข้อมูลเว็บ 7 วันของ iOS อีกต่อไป เซสชันไม่หลุดเอง
- **ตัวเลือกรูปของระบบ** — เลือกหลายรูป + อ่าน EXIF/พิกัดได้เต็มที่
- อยู่บนสโตร์ · ทำงานออฟไลน์เต็มรูปแบบ · ต่อยอด push notification ได้

---

## ค่าที่ตั้งไว้แล้ว

| ค่า | ที่ใช้ |
|---|---|
| App ID | `net.onevela.app` |
| ชื่อแอป | Vela |
| โฟลเดอร์เว็บ | `www/` |
| สีพื้นหลัง | `#f6efe2` (ครีม) · splash `#2b241f` |

แก้ได้ที่ `capacitor.config.json`

---

## ก่อนส่งขึ้นสโตร์ (เช็คลิสต์)

- [ ] ทดสอบบนเครื่องจริงทั้ง iOS และ Android
- [ ] เพิ่มข้อความขออนุญาตครบทุกตัว (iOS ตรวจเข้ม)
- [ ] ไอคอน + splash ครบทุกขนาด
- [ ] เพิ่ม redirect URL ใน Supabase
- [ ] เตรียมนโยบายความเป็นส่วนตัว (บังคับทั้งสองสโตร์ — มีลิงก์บนเว็บได้)
- [ ] ภาพหน้าจอสำหรับสโตร์ (iPhone 6.7" และ 6.5")
- [ ] ตั้งเลขเวอร์ชัน: iOS ที่ Xcode → General, Android ที่ `android/app/build.gradle`
