// where to next? — ตั้งค่า Supabase
// เอาค่าจาก Supabase Dashboard → Project Settings → API
// (anon key เปิดเผยได้ ปลอดภัยเพราะมี RLS คุมอยู่)
window.WTN_SUPABASE = {
  url: "https://glnpyzlbalxnqrqxdsuo.supabase.co",          // เช่น https://abcdefgh.supabase.co
  anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdsbnB5emxiYWx4bnFycXhkc3VvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYzMzYxMzAsImV4cCI6MjEwMTkxMjEzMH0.HjWl1LIm8KHWzC-srFe1RNzNeDvktLf4klAt09XCuOE",
  // ลิงก์แชร์สวย ๆ ผ่าน Cloudflare Worker (ดู cloudflare/vela-share-worker.js)
  // ค่าว่าง = ใช้ลิงก์ supabase ตรง ๆ (การ์ดถูกอยู่แล้ว แค่ลิงก์ยาว)
  // ใส่ "https://onevela.net/s" เมื่อทำ Worker + route เสร็จแล้วเท่านั้น
  // (ใส่ก่อน = ลิงก์แชร์ 404 เพราะ GitHub Pages ไม่มี path นี้)
  shareBase: "https://onevela.net/s"
};
// true = ใช้คลาวด์, false = โหมด local อย่างเดียว
window.WTN_BACKEND_ENABLED = true;
