// where to next? — AI กลาง (Gemini) + นับเครดิตฝั่งเซิร์ฟเวอร์
// deploy: supabase functions deploy ai-complete
// secrets: GEMINI_API_KEY
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const MODEL = "gemini-3.6-flash";
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// โควตาต่อเดือน — Trip Pass ไม่รีเซ็ตรายเดือน (ได้ก้อนเดียวตอนซื้อ ใช้ได้จนหมด/หมดอายุ)
// ฟรี = 0 เด็ดขาด (นโยบาย 16 ส.ค.: "ไม่มี ก็คือไม่มี") — กันที่นี่ด้วย ไม่ใช่แค่ในแอป
const MONTHLY = { year: 100, free: 0 };

const admin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const auth = req.headers.get("Authorization") || "";
    const sb = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: auth } } },
    );
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return json({ error: "ต้องล็อกอินก่อน" }, 401);

    const body = await req.json().catch(() => ({}));
    const peek = body?.peek === true;              // แค่ขอดูยอดคงเหลือ ไม่เรียก AI
    const prompt = body?.prompt;

    const st = await ensureCredits(user.id);
    if (peek) return json(st);

    // AI เป็นของพรีเมียมเท่านั้น — กันฝั่งเซิร์ฟเวอร์ ไม่ให้เรียกตรงข้ามหน้าแอปได้
    if (st.plan === "free") {
      return json({ error: "ผู้ช่วย AI เป็นฟีเจอร์ของพรีเมียม", code: "premium-only", ...st }, 402);
    }

    if (!prompt || typeof prompt !== "string") return json({ error: "ไม่มี prompt" }, 400);

    const cost = 1;   // 1 คำขอ = 1 ครั้ง เท่ากันหมด (อธิบายง่าย)
    if (st.credits < cost) {
      return json({ error: "ใช้ AI ครบโควตาแล้ว", code: "no-credits", ...st }, 402);
    }

    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${Deno.env.get("GEMINI_API_KEY")}`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt.slice(0, 30000) }] }],
          generationConfig: { temperature: 0.8, maxOutputTokens: 8192 },
        }),
      },
    );
    const g = await r.json();
    if (!r.ok) return json({ error: g?.error?.message || "Gemini error" }, 502);
    // ⚠⚠ โมเดลรุ่นนี้ "คิด" ก่อนตอบ และส่งก้อนความคิดกลับมาใน parts ด้วย (p.thought === true)
    //   ของเดิมต่อทุกก้อนเข้าด้วยกัน คำตอบเลยมีความคิดปนมา และถ้าโทเคนหมดตั้งแต่ยังคิดไม่จบ
    //   จะได้ "ความคิดล้วนๆ" กลับไปแทนคำตอบ (เจอจริง 24 ก.ย. 69: ขอ JSON ทริป 3 วัน ได้บทคิดของโมเดล 240 ตัวอักษร)
    const cand = g?.candidates?.[0];
    const text = (cand?.content?.parts || [])
      .filter((p: any) => !p.thought)
      .map((p: any) => p.text || "").join("").trim();
    // ไม่มีคำตอบกลับมาเลย = ต้องบอกให้รู้ ห้ามคืนข้อความว่างเงียบๆ แล้วให้ฝั่งแอปไปงงเอง
    //   และต้อง return ก่อนหักเครดิต — เรียกไม่สำเร็จต้องไม่คิดเงิน
    if (!text) {
      return json({
        error: cand?.finishReason === "MAX_TOKENS"
          ? "คำตอบยาวเกินโควตา ลองแบ่งโปรแกรมให้สั้นลง"
          : ("AI ไม่ได้ตอบอะไรกลับมา" + (cand?.finishReason ? " (" + cand.finishReason + ")" : "")),
        code: "empty-answer",
      }, 502);
    }

    // หักเครดิตเมื่อได้คำตอบจริงเท่านั้น (พังแล้วไม่หัก)
    const left = st.plan === "admin" ? Infinity : Math.max(0, st.credits - cost);
    if (st.plan !== "admin") await admin.from("profiles").update({ ai_credits: left }).eq("id", user.id);

    return json({ text, truncated: cand?.finishReason === "MAX_TOKENS", credits: Number.isFinite(left) ? left : null, plan: st.plan, cost });
  } catch (e) {
    return json({ error: String((e as Error).message || e) }, 500);
  }
});

// อ่านสถานะ + รีเซ็ตโควตารายเดือนถ้าข้ามเดือนแล้ว
async function ensureCredits(uid: string) {
  const { data } = await admin.from("profiles")
    .select("ai_credits,credits_month,premium,premium_until,plan,is_admin").eq("id", uid).maybeSingle();
  if (data?.is_admin) return { credits: Infinity, plan: "admin", month: "" };   // เจ้าของแอป ไม่จำกัด
  const active = data?.premium === true &&
    (!data.premium_until || new Date(data.premium_until).getTime() > Date.now());
  const plan = active ? (data?.plan || "trip") : "free";
  const mon = new Date().toISOString().slice(0, 7);   // YYYY-MM

  let credits = Number(data?.ai_credits ?? 0);
  if (data?.credits_month !== mon) {
    // Trip Pass = ก้อนเดียว ไม่เติมรายเดือน · รายปี/ฟรี = รีเซ็ตทุกเดือน (ไม่ทบ)
    if (plan === "year") credits = MONTHLY.year;
    else if (plan === "free") credits = MONTHLY.free;
    await admin.from("profiles")
      .upsert({ id: uid, ai_credits: credits, credits_month: mon });
  }
  return { credits, plan, month: mon };
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "content-type": "application/json" },
  });
}
