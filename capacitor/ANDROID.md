# สร้างแอป Android บน Windows

ทำได้ทั้งหมดบนเครื่อง Windows ไม่ต้องมี Mac

---

## 1. ติดตั้งของที่ต้องใช้ (ครั้งเดียว)

| อย่าง | ลิงก์ | หมายเหตุ |
|---|---|---|
| Node.js LTS | nodejs.org | กด Next รัวๆ ได้เลย |
| Android Studio | developer.android.com/studio | ตอนติดตั้งเลือก "Standard" |
| Git | git-scm.com | ถ้ายังไม่มี |

เปิด Android Studio ครั้งแรก มันจะโหลด SDK ให้เอง — รอจนเสร็จ (ประมาณ 10-20 นาที)

---

## 2. เตรียมโปรเจกต์

เปิด **PowerShell** ที่โฟลเดอร์ `capacitor`:

```powershell
npm install
npx cap add android
npx cap sync
```

---

## 3. ตั้งค่าสิทธิ์ (ครั้งเดียว)

เปิดไฟล์ `android/app/src/main/AndroidManifest.xml`
วางบรรทัดนี้ไว้เหนือ `<application ...>`:

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />
```

---

## 4. ทดสอบบนมือถือ Android

1. ที่มือถือ: Settings → About phone → กด **Build number** 7 ครั้ง → เปิด Developer options → เปิด **USB debugging**
2. เสียบสาย USB กับคอม (กด Allow ที่มือถือ)
3. ที่คอม:

```powershell
npx cap open android
```

4. Android Studio เปิดขึ้นมา → เลือกมือถือที่มุมบน → กดปุ่ม **▶ Run**

แอปจะติดตั้งลงมือถือทันที ทดสอบได้เลย

---

## 5. เวลาแก้โค้ดแล้วอยากอัปเดตแอป

```powershell
node sync-web.mjs      # ถ้ามีไฟล์ deploy ชุดใหม่ใน ../_dist
npx cap sync
npx cap open android   # แล้วกด ▶ Run
```

---

## 6. ทำไฟล์ติดตั้งสำหรับ Play Store

### สร้างกุญแจเซ็นแอป (ครั้งเดียว — **เก็บไฟล์นี้ให้ดี ถ้าหายจะอัปเดตแอปเดิมไม่ได้อีกเลย**)

```powershell
keytool -genkey -v -keystore vela-release.keystore -alias vela -keyalg RSA -keysize 2048 -validity 10000
```

### บอก Gradle ว่ากุญแจอยู่ไหน

สร้างไฟล์ `android/key.properties`:

```
storePassword=รหัสที่ตั้งไว้
keyPassword=รหัสที่ตั้งไว้
keyAlias=vela
storeFile=../../vela-release.keystore
```

### Build

ใน Android Studio: **Build → Generate Signed Bundle / APK → Android App Bundle**

ได้ไฟล์ `.aab` → อัปโหลดที่ Google Play Console (ค่าสมัคร $25 ครั้งเดียว)

---

## หมายเหตุ

- **ตอนทดสอบเองไม่ต้องเสียเงิน** — ขั้นที่ 4 ติดตั้งลงมือถือตัวเองได้ฟรี
- ค่า $25 จ่ายเมื่อจะให้คนอื่นโหลดจาก Play Store เท่านั้น
- เลขเวอร์ชันแก้ที่ `android/app/build.gradle` (`versionCode` ต้องเพิ่มขึ้นทุกครั้งที่ส่งขึ้นสโตร์)
