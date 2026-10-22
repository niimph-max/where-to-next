// where to next? — เตือนบันทึกบนเว็บแอป (Web Push) · 22 ต.ค. 2569
// deploy:  supabase functions deploy push-reminders --no-verify-jwt
//          (หรือในแดชบอร์ด: ปิด "Enforce JWT verification" ของฟังก์ชันนี้ — cron เรียกด้วย x-cron-key แทน)
// secrets: VAPID_PUBLIC · VAPID_PRIVATE · VAPID_SUBJECT (mailto:…) · CRON_KEY
//
// สองทางเข้า
//   1) cron ทุก 15 นาที (header x-cron-key) → ไล่ทุกเครื่องในตาราง push_subs ยิงตามเวลาท้องถิ่นของเครื่องนั้น
//   2) ผู้ใช้กด "ทดสอบ" ในแอป (Authorization: Bearer <token> + {test:true}) → ยิงหาเครื่องของตัวเองทันที
//
// กติกาเดียวกับแอป iOS (SPEC-reminders.md): เงียบถ้าวันนี้บันทึกแล้ว · วันละครั้ง · ใช้เวลาท้องถิ่น
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
import webpush from "npm:web-push@3.6.7";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-cron-key",
};
const WINDOW_MIN = 90;   // cron ยิงทุก 15 นาที — เผื่อรอบที่พลาดได้ถึง 90 นาทีหลังเวลาที่ตั้ง (last_sent กันซ้ำอยู่แล้ว)
const TRIP_HOUR = 19;    // เฟส 2 ชวนเรียบเรียง ตั้งแต่ 19:00 ของวันที่กำหนด (แอป iOS ใช้เวลาเดียวกัน)

const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
webpush.setVapidDetails(
  Deno.env.get("VAPID_SUBJECT") || "mailto:admin@onevela.net",
  Deno.env.get("VAPID_PUBLIC")!,
  Deno.env.get("VAPID_PRIVATE")!,
);

function localNow(tz: string) {
  let parts: Record<string, string> = {};
  try {
    new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(new Date())
      .forEach((p) => { parts[p.type] = p.value; });
  } catch { return localNow("Asia/Bangkok"); }   // tz แปลกๆ จากเครื่อง → ถอยไปเวลาไทย ดีกว่าไม่เตือนเลย
  return { ymd: `${parts.year}-${parts.month}-${parts.day}`, min: (+parts.hour) * 60 + (+parts.minute) };
}
function hmToMin(s: string) {
  const m = /^(\d{1,2}):(\d{2})$/.exec(String(s || "").trim());
  return m ? Math.min(23, +m[1]) * 60 + Math.min(59, +m[2]) : 20 * 60 + 30;
}

async function send(row: any, msg: { title: string; body: string; go: string; trip?: string }) {
  try {
    await webpush.sendNotification(
      { endpoint: row.endpoint, keys: { p256dh: row.p256dh, auth: row.auth } },
      JSON.stringify(msg),
      { TTL: 6 * 3600, urgency: "normal" },
    );
    return "ok";
  } catch (e: any) {
    const code = e?.statusCode || 0;
    // 404/410 = เครื่องยกเลิกการรับแล้ว (ลบแอปออกจากหน้าจอโฮม / ถอนสิทธิ์) → ลบแถวทิ้ง ไม่งั้นยิงเปล่าไปตลอด
    if (code === 404 || code === 410) { await admin.from("push_subs").delete().eq("endpoint", row.endpoint); return "gone"; }
    console.warn("[push] send fail", code, e?.body || e?.message);
    return "err:" + code;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  const body = await req.json().catch(() => ({}));

  // ── ทางที่ 2: ผู้ใช้ขอทดสอบ ──
  if (body?.test) {
    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: req.headers.get("Authorization") || "" } } });
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return json({ error: "ต้องล็อกอินก่อน" }, 401);
    const { data: rows } = await admin.from("push_subs").select("*").eq("user_id", user.id);
    const out = [];
    for (const r of rows || []) out.push(await send(r, { title: "ทดสอบการเตือน", body: "ถ้าเห็นข้อความนี้ แปลว่าเว็บแอปเตือนได้แล้ว", go: "today" }));
    return json({ devices: (rows || []).length, result: out });
  }

  // ── ทางที่ 1: cron ──
  const key = Deno.env.get("CRON_KEY") || "";
  if (!key || req.headers.get("x-cron-key") !== key) return json({ error: "forbidden" }, 403);

  const { data: rows, error } = await admin.from("push_subs").select("*").eq("on_", true);
  if (error) return json({ error: error.message }, 500);
  let daily = 0, trips = 0;
  for (const r of rows || []) {
    const now = localNow(r.tz || "Asia/Bangkok");
    const patch: Record<string, unknown> = {};
    // รายวัน — เฉพาะวันที่ยังไม่บันทึก และยังไม่เคยยิงวันนี้
    const t = hmToMin(r.at_time);
    if (now.min >= t && now.min < t + WINDOW_MIN && r.last_sent !== now.ymd && r.logged !== now.ymd) {
      const res = await send(r, { title: "บันทึกวันนี้", body: r.body || "เลือกรูปของวันนี้สักสองสามใบ แล้วเขียนสองบรรทัด", go: "today" });
      if (res === "gone") continue;
      if (res === "ok") { patch.last_sent = now.ymd; daily++; }
    }
    // เฟส 2 — ทริปเพิ่งจบ ชวนเรียบเรียงเป็นเรื่องเล่า (แอปคำนวณวันให้แล้วใน trips_due)
    const sent: string[] = Array.isArray(r.sent_trips) ? r.sent_trips : [];
    for (const d of (Array.isArray(r.trips_due) ? r.trips_due : [])) {
      if (!d || !d.id || d.at !== now.ymd || now.min < TRIP_HOUR * 60 || sent.includes(d.id)) continue;
      const res = await send(r, { title: "ทริป" + (d.name || "") + "จบแล้ว",
        body: (d.items || 0) + " บันทึก · " + (d.photos || 0) + " รูป — เรียบเรียงเป็นเรื่องเล่าไหม", go: "stories", trip: d.id });
      if (res === "ok") { sent.push(d.id); patch.sent_trips = sent; trips++; }
    }
    if (Object.keys(patch).length) await admin.from("push_subs").update(patch).eq("endpoint", r.endpoint);
  }
  return json({ checked: (rows || []).length, daily, trips });
});

function json(o: unknown, status = 200) {
  return new Response(JSON.stringify(o), { status, headers: { ...cors, "Content-Type": "application/json" } });
}
