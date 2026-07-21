// Vela — Cloud Functions (AI กลาง)
// ถือคีย์ Gemini ไว้ฝั่งเซิร์ฟเวอร์ (ไม่หลุดถึง client), เช็คว่าเป็นสมาชิกพรีเมียม, จำกัดโควตาต่อเดือน
//
// Deploy:
//   1) firebase functions:secrets:set GEMINI_KEY      (วางคีย์ Gemini ตอนถาม)
//   2) firebase deploy --only functions
// อ่านขั้นตอนเต็มใน firebase/AI-BACKEND-SETUP.md

const { onCall, onRequest, HttpsError } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const admin = require("firebase-admin");

admin.initializeApp();

const GEMINI_KEY = defineSecret("GEMINI_KEY");
const MODEL = "gemini-flash-latest";
const MONTHLY_QUOTA = 300; // โควตาการเรียก AI ต่อสมาชิกพรีเมียมต่อเดือน (กันใช้เกินจนค่าใช้จ่ายบาน)

// ---------- Stripe (ระบบจ่ายเงิน) ----------
const STRIPE_KEY = defineSecret("STRIPE_KEY");            // Secret key ของ Stripe (sk_live_… หรือ sk_test_…)
const STRIPE_WEBHOOK_SECRET = defineSecret("STRIPE_WEBHOOK_SECRET"); // Signing secret ของ webhook (whsec_…)
const APP_URL = "https://app.nimjourney.com";           // เว็บแอป (กลับมาหลังจ่ายเสร็จ)
// Price ID จาก Stripe (สร้าง Product 2 ราคา แล้วเอา id มาวาง) — ดู firebase/STRIPE-SETUP.md
const PRICE = {
  month: "price_1TvWtSCZ5iUh2i0Vnfoi9p3s",  // ฿59/เดือน
  year: "price_1TvWuDCZ5iUh2i0VXlcndaoQ",   // ฿599/ปี
};

exports.aiComplete = onCall(
  { secrets: [GEMINI_KEY], region: "asia-southeast1", cors: true },
  async (req) => {
    const uid = req.auth && req.auth.uid;
    if (!uid) throw new HttpsError("unauthenticated", "ต้องเข้าสู่ระบบก่อน");

    const db = admin.firestore();

    // ---- เช็คพรีเมียมจาก Firestore (server-only, client ปลอมไม่ได้) ----
    const userSnap = await db.doc(`users/${uid}`).get();
    const premium = userSnap.exists && userSnap.get("premium") === true;
    const until = userSnap.exists && userSnap.get("premiumUntil");
    const expired = until && until.toMillis && until.toMillis() < Date.now();
    if (!premium || expired) {
      throw new HttpsError("permission-denied", "ต้องเป็นสมาชิกพรีเมียมเพื่อใช้ AI");
    }

    // ---- โควตารายเดือน ----
    const ym = new Date().toISOString().slice(0, 7).replace("-", ""); // เช่น "202608"
    const qref = db.doc(`users/${uid}/usage/${ym}`);
    const used = (await qref.get()).get("count") || 0;
    if (used >= MONTHLY_QUOTA) {
      throw new HttpsError("resource-exhausted", "ใช้ AI ครบโควตาเดือนนี้แล้ว (" + MONTHLY_QUOTA + " ครั้ง)");
    }

    const prompt = String((req.data && req.data.prompt) || "").slice(0, 12000);
    if (!prompt.trim()) throw new HttpsError("invalid-argument", "ไม่มีข้อความ prompt");

    // ---- เรียก Gemini ----
    const url =
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=` +
      encodeURIComponent(GEMINI_KEY.value());
    let text = "";
    try {
      const r = await fetch(url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      });
      const j = await r.json();
      if (!r.ok) {
        throw new Error((j.error && j.error.message) || ("HTTP " + r.status));
      }
      const parts = (((j.candidates || [])[0] || {}).content || {}).parts || [];
      text = parts.map((p) => p.text || "").join("");
    } catch (e) {
      throw new HttpsError("internal", "เรียก AI ไม่สำเร็จ: " + (e.message || String(e)));
    }

    // ---- บันทึกโควตาที่ใช้ ----
    await qref.set(
      {
        count: admin.firestore.FieldValue.increment(1),
        at: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    return { text, quota: { used: used + 1, limit: MONTHLY_QUOTA } };
  }
);

// สร้างหน้าจ่ายเงิน Stripe Checkout (subscription) แล้วคืน url ให้แอป redirect ไป
exports.createCheckout = onCall(
  { secrets: [STRIPE_KEY], region: "asia-southeast1", cors: true },
  async (req) => {
    const uid = req.auth && req.auth.uid;
    if (!uid) throw new HttpsError("unauthenticated", "ต้องเข้าสู่ระบบก่อน");
    const plan = (req.data && req.data.plan) === "month" ? "month" : "year";
    const price = PRICE[plan];
    if (!price || price.indexOf("REPLACE_") === 0) {
      throw new HttpsError("failed-precondition", "ยังไม่ได้ตั้ง Price ID ของ Stripe (ดู STRIPE-SETUP.md)");
    }
    const email = (req.auth.token && req.auth.token.email) || undefined;
    const stripe = require("stripe")(STRIPE_KEY.value());
    const db = admin.firestore();
    const uref = db.doc(`users/${uid}`);

    // ใช้ลูกค้าเดิมถ้ามี (กันสร้างซ้ำ)
    let customer = (await uref.get()).get("stripeCustomer");
    if (!customer) {
      const c = await stripe.customers.create({ email, metadata: { uid } });
      customer = c.id;
      await uref.set({ stripeCustomer: customer }, { merge: true });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer,
      line_items: [{ price, quantity: 1 }],
      allow_promotion_codes: true,
      success_url: APP_URL + "/?paid=1",
      cancel_url: APP_URL + "/?canceled=1",
      metadata: { uid },
      subscription_data: { metadata: { uid } },
    });
    return { url: session.url };
  }
);

// รับสัญญาณจาก Stripe (จ่ายสำเร็จ / ต่ออายุ / ยกเลิก) แล้วตั้ง premium ให้อัตโนมัติ
exports.stripeWebhook = onRequest(
  { secrets: [STRIPE_KEY, STRIPE_WEBHOOK_SECRET], region: "asia-southeast1" },
  async (req, res) => {
    const stripe = require("stripe")(STRIPE_KEY.value());
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        req.rawBody,
        req.headers["stripe-signature"],
        STRIPE_WEBHOOK_SECRET.value()
      );
    } catch (e) {
      res.status(400).send("bad signature: " + (e.message || e));
      return;
    }
    const db = admin.firestore();
    const setPremium = async (uid, on, untilMs) => {
      if (!uid) return;
      const data = { premium: on };
      if (untilMs) data.premiumUntil = admin.firestore.Timestamp.fromMillis(untilMs);
      await db.doc(`users/${uid}`).set(data, { merge: true });
    };
    try {
      const t = event.type;
      if (t === "checkout.session.completed") {
        const s = event.data.object;
        await setPremium(s.metadata && s.metadata.uid, true, null);
      } else if (t === "invoice.paid") {
        const inv = event.data.object;
        if (inv.subscription) {
          const sub = await stripe.subscriptions.retrieve(inv.subscription);
          await setPremium(
            sub.metadata && sub.metadata.uid,
            true,
            sub.current_period_end ? sub.current_period_end * 1000 : null
          );
        }
      } else if (t === "customer.subscription.deleted" || t === "customer.subscription.paused") {
        const sub = event.data.object;
        await setPremium(sub.metadata && sub.metadata.uid, false, null);
      }
    } catch (e) {
      console.error("[wtn] webhook", e);
    }
    res.json({ received: true });
  }
);

// ---------- แดชบอร์ดแอดมิน (เฉพาะเจ้าของ) ----------
const ADMIN_UIDS = [
  "ABu9cHcecbPpFBJgwrbR6rf8sa83", // nim_nl@hotmail.com
  "E9wuPSIdQQOuPwvnSoW6Y427PrA3", // niimph@gmail.com
];
exports.adminStats = onCall(
  { secrets: [STRIPE_KEY], region: "asia-southeast1", cors: true },
  async (req) => {
    const uid = req.auth && req.auth.uid;
    if (!uid || ADMIN_UIDS.indexOf(uid) < 0) {
      throw new HttpsError("permission-denied", "เฉพาะแอดมิน");
    }
    const db = admin.firestore();
    const totalSnap = await db.collection("users").count().get();
    const premSnap = await db.collection("users").where("premium", "==", true).count().get();
    const total = totalSnap.data().count;
    const premium = premSnap.data().count;

    let revenue = 0, currency = "thb", activeSubs = 0;
    try {
      const stripe = require("stripe")(STRIPE_KEY.value());
      const now = new Date();
      const startMonth = Math.floor(new Date(now.getFullYear(), now.getMonth(), 1).getTime() / 1000);
      let starting_after;
      for (let i = 0; i < 10; i++) {
        const opts = { status: "paid", created: { gte: startMonth }, limit: 100 };
        if (starting_after) opts.starting_after = starting_after;
        const page = await stripe.invoices.list(opts);
        page.data.forEach((inv) => { revenue += inv.amount_paid || 0; currency = inv.currency || currency; });
        if (!page.has_more) break;
        starting_after = page.data[page.data.length - 1].id;
      }
      const subs = await stripe.subscriptions.list({ status: "active", limit: 100 });
      activeSubs = subs.data.length;
    } catch (e) { console.warn("[wtn] adminStats stripe", e && e.message); }

    return { total, premium, free: total - premium, revenue: revenue / 100, currency, activeSubs };
  }
);
