// where to next? — Supabase data layer (ESM, โหลดจาก CDN ไม่ต้อง build)
// โหลดด้วย: <script type="module" src="wtn-backend.js"></script> ต่อจาก supabase-config.js
// เปิดใช้เมื่อ window.WTN_BACKEND_ENABLED === true และกรอก supabase-config.js จริงแล้ว
//
// โครงข้อมูล (ดู supabase/schema.sql):
//   profiles(id)                       โปรไฟล์ + สถานะพรีเมียม (อ่านสาธารณะ)
//   stories(id) / chapters(story_id,id) เล่ม + ตอน (อ่านสาธารณะเมื่อ published)
//   moments(id)                        โพสต์สั้น (อ่านสาธารณะเมื่อ published)
//   likes(user_id,key) / comments      ถูกใจ / ความคิดเห็น (UI ถอดออกแล้ว แต่คงตารางไว้)
//   backups / backup_versions / backup_meta   ซิงก์ทั้งแอปข้ามเครื่อง
//   Storage bucket "media": users/{uid}/img/{ts}.jpg

async function boot() {
  if (!window.WTN_BACKEND_ENABLED) { console.info("[wtn] backend disabled — โหมด local"); return; }
  const cfg = window.WTN_SUPABASE || {};
  if (!cfg.url || cfg.url === "PASTE_SUPABASE_URL") { console.warn("[wtn] ยังไม่ได้ตั้ง supabase-config.js"); return; }

  const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2.45.4");
  // lock แบบ no-op: navigator.locks ของ supabase-js ค้างถาวรเมื่อเปิดหลายแท็บ/ใน iframe
  // (อาการ: query ทุกตัวไม่ยอม resolve — ซิงก์เงียบหายทั้งระบบ)
  const noLock = async (_name, _timeout, fn) => await fn();
  const SB = createClient(cfg.url, cfg.anonKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: "pkce", lock: noLock }
  });

  // กันค้าง: ทุกคำสั่งที่รอผลต้องจบใน 20 วิ ไม่งั้นโยน error ให้ UI เห็น
  const T = (p, ms = 20000, what = "supabase") => Promise.race([
    p, new Promise((_, rej) => setTimeout(() => rej(new Error(what + " timeout")), ms))
  ]);

  // แปลง error ของ Supabase ให้เป็นโค้ดแบบเดิม (ข้อความในแอปยังใช้ชุดเดิมได้)
  const mapErr = e => {
    if (!e) return e;
    const m = (e.message || "").toLowerCase(), s = e.status || 0;
    let code = "";
    if (m.includes("already registered") || m.includes("already been registered")) code = "auth/email-already-in-use";
    else if (m.includes("invalid login credentials")) code = "auth/invalid-credential";
    else if (m.includes("invalid email") || m.includes("unable to validate email")) code = "auth/invalid-email";
    else if (m.includes("password should be") || m.includes("weak password")) code = "auth/weak-password";
    else if (m.includes("email not confirmed")) code = "auth/email-not-confirmed";
    else if (s === 429 || m.includes("rate limit") || m.includes("too many")) code = "auth/too-many-requests";
    else if (m.includes("failed to fetch") || m.includes("network")) code = "auth/network-request-failed";
    else if (m.includes("provider is not enabled")) code = "auth/operation-not-allowed";
    const err = new Error(e.message || "เกิดข้อผิดพลาด");
    if (code) err.code = code;
    return err;
  };
  const ok = ({ data, error }) => { if (error) throw mapErr(error); return data; };

  // ทำให้หน้าตา user เหมือนของเดิม (แอปอ่าน uid / displayName / email / providerData)
  const shapeUser = u => u && ({
    uid: u.id, email: u.email || "",
    displayName: (u.user_metadata && (u.user_metadata.name || u.user_metadata.full_name)) || "",
    photoURL: (u.user_metadata && (u.user_metadata.avatar_url || u.user_metadata.picture)) || "",
    providerData: [{ providerId: (u.app_metadata && u.app_metadata.provider) || "password" }],
    _raw: u
  });
  const secs = t => (t ? { seconds: Math.floor(new Date(t).getTime() / 1000) } : null);
  const dataUrlToBlob = async d => (await fetch(d)).blob();
  const countsOf = (obj) => {
    const dd = (obj && obj.data) || {};
    const n = (k) => { try { return (JSON.parse(dd[k] || "[]") || []).length; } catch (e) { return 0; } };
    return { trips: n("wtn-trips"), moments: n("wtn-moments") };
  };

  const api = {
    _uid: null,
    _sb: SB,

    // ---------- AUTH ----------
    onUser(cb) {
      const handle = async u => {
        this._uid = u ? u.uid : null;
        if (u) await this.ensureUserDoc(u);
        cb(u);
      };
      SB.auth.getSession().then(({ data }) => handle(shapeUser(data && data.session && data.session.user)));
      const { data: sub } = SB.auth.onAuthStateChange((_e, session) =>
        handle(shapeUser(session && session.user)));
      return () => { try { sub.subscription.unsubscribe(); } catch (e) {} };
    },
    async ensureUserDoc(u) {
      if (!u || !this._uid) return;
      try {
        const { data } = await T(SB.from("profiles").select("id").eq("id", this._uid).maybeSingle(), 15000, "ensureUserDoc");
        if (!data) {
          await SB.from("profiles").insert({
            id: this._uid,
            data: {
              name: u.displayName || (u.email ? u.email.split("@")[0] : ""),
              email: u.email || "",
              avatar: u.photoURL || "",
              provider: (u.providerData[0] || {}).providerId || "password"
            }
          });
        }
      } catch (e) { console.warn("[wtn] ensureUserDoc", e && e.message); }
    },
    async emailSignup(email, pass, name) {
      const d = ok(await SB.auth.signUp({ email, password: pass, options: { data: { name: name || email.split("@")[0] } } }));
      if (!d.session) { const e = new Error("ส่งอีเมลยืนยันแล้ว เปิดลิงก์ในอีเมลเพื่อเข้าใช้งาน"); e.code = "auth/confirm-email-sent"; throw e; }
      return shapeUser(d.user);
    },
    async emailLogin(email, pass) {
      return shapeUser(ok(await SB.auth.signInWithPassword({ email, password: pass })).user);
    },
    async google() {
      const redirectTo = location.origin + location.pathname;
      ok(await SB.auth.signInWithOAuth({ provider: "google", options: { redirectTo } }));
      return null; // เบราว์เซอร์จะ redirect ออกไป แล้วกลับมาพร้อม session
    },
    async resetPassword(email) {
      ok(await SB.auth.resetPasswordForEmail(email, { redirectTo: location.origin + location.pathname }));
      return true;
    },
    logout() { return SB.auth.signOut(); },

    // ---------- PROFILE ----------
    async saveProfile(p) {
      if (!this._uid) return;
      const { data } = await SB.from("profiles").select("data").eq("id", this._uid).maybeSingle();
      const merged = { ...((data && data.data) || {}), ...p };
      ok(await SB.from("profiles").upsert({ id: this._uid, data: merged, updated_at: new Date().toISOString() }));
    },
    async getPremium() {
      if (!this._uid) return null;
      const { data } = await T(SB.from("profiles").select("premium,premium_until,plan").eq("id", this._uid).maybeSingle(), 15000, "getPremium");
      if (!data) return { premium: false, until: null };
      return { premium: data.premium === true, until: data.premium_until ? new Date(data.premium_until).getTime() : null, plan: data.plan || null };
    },

    // ---------- BILLING (Stripe) ----------
    // Supabase ห่อ error ของ function เป็น "non-2xx status code" ซึ่งไม่บอกอะไรเลย
    // → แกะ body จริงออกมาให้ผู้ใช้/เราเห็นสาเหตุ
    async _invoke(name, body, fallback) {
      const { data, error } = await SB.functions.invoke(name, { body: body || {} });
      if (error) {
        let detail = "";
        try {
          const r = error.context;
          if (r && typeof r.text === "function") {
            const t = await r.text();
            try { detail = (JSON.parse(t) || {}).error || t; } catch (e) { detail = t; }
          }
        } catch (e) {}
        throw new Error(detail || error.message || fallback);
      }
      if (data && data.error) throw new Error(data.error);
      return (data && data.url) || null;
    },
    async startCheckout(plan) {
      if (!this._uid) throw new Error("ต้องล็อกอินก่อน");
      return await this._invoke("stripe-checkout", { plan: plan === "year" ? "year" : "trip" }, "เปิดหน้าชำระเงินไม่สำเร็จ");
    },
    async billingPortal() {
      if (!this._uid) throw new Error("ต้องล็อกอินก่อน");
      return await this._invoke("billing-portal", {}, "เปิดหน้าจัดการไม่สำเร็จ");
    },

    // ---------- ADMIN ----------
    async adminStats() {
      const n = async (q) => { const { count } = await q; return count || 0; };
      const P = () => SB.from("profiles").select("id", { count: "exact", head: true });
      const total = await n(P());
      const premium = await n(P().eq("premium", true));
      const activeSubs = await n(P().eq("premium", true).eq("plan", "year"));
      let revenue = 0;
      try {
        const { data } = await SB.from("payments").select("amount").eq("status", "paid");
        revenue = (data || []).reduce((s, r) => s + (Number(r.amount) || 0), 0);
      } catch (e) {}
      return { total, premium, free: Math.max(0, total - premium), activeSubs, revenue };
    },

    // ---------- STORAGE (รูป/ไฟล์) ----------
    async uploadImage(blobOrDataUrl, name) {
      if (!this._uid) throw new Error("ต้องล็อกอินก่อน");
      const path = `users/${this._uid}/img/${Date.now()}_${(name || "f").replace(/[^\w.\-]/g, "_")}`;
      const body = typeof blobOrDataUrl === "string" ? await dataUrlToBlob(blobOrDataUrl) : blobOrDataUrl;
      ok(await SB.storage.from("media").upload(path, body, { contentType: body.type || "image/jpeg", upsert: true }));
      return SB.storage.from("media").getPublicUrl(path).data.publicUrl;
    },
    // อัปโหลดรูปย่อไปไว้คู่กับตัวเต็ม — ชื่อไฟล์เดียวกันแค่เติม _t ก่อนนามสกุล (แอปเดาลิงก์เองได้)
    async uploadThumbFor(fullUrl, blob) {
      if (!this._uid || !fullUrl) return null;
      const m = /\/media\/(users\/[^?]+)$/.exec(fullUrl);
      if (!m) return null;
      const path = m[1].replace(/(\.[a-z0-9]+)$/i, "_t$1");
      try {
        ok(await SB.storage.from("media").upload(path, blob, { contentType: "image/jpeg", upsert: true }));
        return SB.storage.from("media").getPublicUrl(path).data.publicUrl;
      } catch (e) { return null; }
    },

    // ---------- SUPPORT ----------
    async sendSupport(t) {
      const row = {
        user_id: this._uid || null,
        email: (t.email || "").trim() || null,
        name: (t.name || "").trim() || null,
        kind: t.kind || "other",
        message: String(t.message || "").slice(0, 4000),
        diag: t.diag || null
      };
      ok(await T(SB.from("support_tickets").insert(row), 20000, "sendSupport"));
      return true;
    },
    async listSupport(limit) {
      const data = ok(await T(
        SB.from("support_tickets").select("*").order("created_at", { ascending: false }).limit(limit || 50),
        20000, "listSupport"));
      return data || [];
    },
    async setSupportStatus(id, status) {
      ok(await T(SB.from("support_tickets").update({ status }).eq("id", id), 15000, "setSupportStatus"));
      return true;
    },

    // ---------- STORIES / CHAPTERS ----------
    async saveStory(story) {
      const { id, ...rest } = story;
      const { data } = await SB.from("stories").select("data").eq("id", id).maybeSingle();
      ok(await SB.from("stories").upsert({
        id, owner: this._uid, data: { ...((data && data.data) || {}), ...rest },
        updated_at: new Date().toISOString()
      }));
      return id;
    },
    async saveChapter(storyId, ch) {
      const { id, ...rest } = ch;
      const { data } = await SB.from("chapters").select("data").eq("story_id", storyId).eq("id", id).maybeSingle();
      const merged = { ...((data && data.data) || {}), ...rest };
      ok(await SB.from("chapters").upsert({
        story_id: storyId, id, owner: this._uid, data: merged,
        published: merged.published === true, ord: Number(merged.order) || 0,
        likes: Number(merged.likes) || 0, updated_at: new Date().toISOString()
      }, { onConflict: "story_id,id" }));
    },
    async publishChapter(storyId, cid, on) {
      ok(await SB.from("chapters").update({ published: !!on, updated_at: new Date().toISOString() })
        .eq("story_id", storyId).eq("id", cid));
    },
    async recordView(storyId, cid) {
      try { await SB.rpc("record_chapter_view", { p_story: storyId, p_chapter: cid }); } catch (e) { console.warn("[wtn] recordView", e); }
    },
    async myStories() {
      const rows = ok(await SB.from("stories").select("*").eq("owner", this._uid));
      return (rows || []).map(r => ({ id: r.id, ...r.data, updatedAt: secs(r.updated_at) }));
    },
    async chapters(storyId) {
      const rows = ok(await SB.from("chapters").select("*").eq("story_id", storyId).order("ord", { ascending: true }));
      return (rows || []).map(r => ({ id: r.id, ...r.data, published: r.published, likes: r.likes, updatedAt: secs(r.updated_at) }));
    },
    async getChapter(storyId, cid) {
      try {
        const [{ data: s }, { data: c }] = await Promise.all([
          SB.from("stories").select("*").eq("id", storyId).maybeSingle(),
          SB.from("chapters").select("*").eq("story_id", storyId).eq("id", cid).maybeSingle()
        ]);
        if (!c) return null;
        return {
          story: s ? { id: s.id, ...s.data } : { id: storyId },
          chapter: { id: c.id, ...c.data, published: c.published, likes: c.likes, views: c.views || 0, updatedAt: secs(c.updated_at) }
        };
      } catch (e) { console.warn("[wtn] getChapter", e); return null; }
    },
    async feed(max = 40) {
      const rows = ok(await SB.rpc("feed_chapters", { p_max: max }));
      return (rows || []).map(r => ({
        id: r.id, storyId: r.story_id, owner: r.owner,
        title: r.title, cover: r.cover, excerpt: r.excerpt, hasCover: r.has_cover,
        published: true, likes: r.likes, views: r.views || 0,
        isFromVela: r.is_from_vela, country: r.country, continent: r.continent,
        storyTitle: r.story_title, authorName: r.author_name, updatedAt: secs(r.updated_at)
      }));
    },

    // ---------- MOMENTS ----------
    async publishMoment(id, d) {
      if (!this._uid) return;
      const { data } = await SB.from("moments").select("data").eq("id", id).maybeSingle();
      const merged = { ...((data && data.data) || {}), ...d };
      ok(await SB.from("moments").upsert({
        id, owner: this._uid, data: merged, published: true,
        at: Number(merged.at) || Date.now(), likes: Number(merged.likes) || 0,
        updated_at: new Date().toISOString()
      }));
    },
    async unpublishMoment(id) {
      if (!this._uid) return;
      try { await SB.from("moments").update({ published: false }).eq("id", id); } catch (e) {}
    },
    async deleteMoment(id) {
      if (!this._uid) return;
      try { await SB.from("moments").delete().eq("id", id); } catch (e) {}
    },
    async moments(max = 60) {
      const rows = ok(await SB.from("moments").select("*").eq("published", true)
        .order("at", { ascending: false }).limit(max));
      return (rows || []).map(r => ({ id: r.id, ...r.data, at: r.at, likes: r.likes }));
    },
    async toggleMomentLike(momentId) {
      if (!this._uid) return null;
      return ok(await SB.rpc("toggle_moment_like", { p_moment: momentId }));
    },

    // ---------- LIKES / COMMENTS (UI ถอดออกแล้ว — คงไว้ให้เข้ากันได้) ----------
    async toggleLike(storyId, cid) {
      if (!this._uid) return null;
      return ok(await SB.rpc("toggle_chapter_like", { p_story: storyId, p_chapter: cid }));
    },
    async addComment(storyId, cid, name, text) {
      ok(await SB.from("comments").insert({ story_id: storyId, chapter_id: cid, uid: this._uid, name, text }));
    },
    async comments(storyId, cid) {
      const rows = ok(await SB.from("comments").select("*").eq("story_id", storyId).eq("chapter_id", cid)
        .order("at", { ascending: true }));
      return (rows || []).map(r => ({ id: r.id, uid: r.uid, name: r.name, text: r.text, at: secs(r.at) }));
    },

    // ---------- ทริป/เช็คอิน/งบ/เอกสาร (ส่วนตัว) ----------
    async saveTrip(tripId, d) {
      const { data } = await SB.from("trips").select("data").eq("id", tripId).maybeSingle();
      ok(await SB.from("trips").upsert({ id: tripId, owner: this._uid, data: { ...((data && data.data) || {}), ...d } }));
    },
    async saveSub(tripId, coll, id, d) {
      const { data } = await SB.from("trip_items").select("data").eq("trip_id", tripId).eq("coll", coll).eq("id", id).maybeSingle();
      ok(await SB.from("trip_items").upsert({
        trip_id: tripId, coll, id, owner: this._uid, data: { ...((data && data.data) || {}), ...d }
      }, { onConflict: "trip_id,coll,id" }));
    },
    async getSub(tripId, coll) {
      const rows = ok(await SB.from("trip_items").select("*").eq("trip_id", tripId).eq("coll", coll));
      return (rows || []).map(r => ({ id: r.id, ...r.data }));
    },

    // ---------- FULL BACKUP (ซิงก์ทั้งแอปข้ามเครื่อง) ----------
    async wipeBackup() {
      if (!this._uid) return;
      try { await SB.from("backup_versions").delete().eq("user_id", this._uid); } catch (e) {}
      try { await SB.from("backups").delete().eq("user_id", this._uid); } catch (e) {}
      try { await SB.from("backup_meta").delete().eq("user_id", this._uid); } catch (e) {}
      this._seenAt = 0; this._lastVerAt = 0; this._verList = null;
    },
    async pushBackup(obj) {
      if (!this._uid) return;
      const blob = JSON.stringify(obj);
      if (blob.length > 4000000) { const e = new Error("backup ใหญ่เกิน 4MB"); e.code = "backup/too-large"; throw e; }
      const at = obj._at || Date.now();
      ok(await T(SB.from("backups").upsert({ user_id: this._uid, blob, at, updated_at: new Date().toISOString() }), 30000, "pushBackup"));
      this._seenAt = Math.max(this._seenAt || 0, at);
      // เก็บเวอร์ชันย้อนหลัง 7 ชุด ไม่ถี่กว่า 10 นาที
      let verList = null;
      if (!this._lastVerAt || at - this._lastVerAt >= 600000) {
        this._lastVerAt = at;
        try {
          await SB.from("backup_versions").upsert({ user_id: this._uid, at, blob, ...countsOf(obj) });
          let list = this._verList;
          if (!list) {
            const rows = ok(await SB.from("backup_versions").select("at").eq("user_id", this._uid).order("at", { ascending: false }));
            list = (rows || []).map(r => Number(r.at));
          }
          list = list.filter(x => x && x !== at); list.push(at); list.sort((a, b) => b - a);
          const drop = list.slice(7);
          if (drop.length) await SB.from("backup_versions").delete().eq("user_id", this._uid).in("at", drop);
          this._verList = verList = list.slice(0, 7);
        } catch (e) { console.warn("[wtn] version snap", e); }
      }
      // meta จิ๋ว — ให้เครื่องอื่นฟังผ่าน realtime แทน blob เต็ม
      try {
        await SB.from("backup_meta").upsert(verList
          ? { user_id: this._uid, at, ver_list: verList }
          : { user_id: this._uid, at });
      } catch (e) {}
    },
    async listBackupVersions() {
      if (!this._uid) return [];
      try {
        const rows = ok(await SB.from("backup_versions").select("at,trips,moments").eq("user_id", this._uid).order("at", { ascending: false }));
        return (rows || []).map(r => ({ id: String(r.at), at: Number(r.at), trips: Number(r.trips) || 0, moments: Number(r.moments) || 0 }));
      } catch (e) { console.warn("[wtn] list versions", e); return []; }
    },
    async getBackupVersion(id) {
      if (!this._uid) return null;
      const { data } = await SB.from("backup_versions").select("blob").eq("user_id", this._uid).eq("at", Number(id)).maybeSingle();
      if (!data) return null;
      try { return JSON.parse(data.blob); } catch (e) { return null; }
    },
    // อ่านแค่เวลาล่าสุดของก้อนสำรอง (ไม่กี่ไบต์) — ใช้เช็กก่อนโหลด blob เต็ม เพื่อประหยัด egress
    async backupAt() {
      if (!this._uid) return 0;
      try {
        const { data } = await T(SB.from("backup_meta").select("at").eq("user_id", this._uid).maybeSingle(), 15000, "backupAt");
        return Number((data || {}).at || 0);
      } catch (e) { return -1; }   // -1 = เช็คไม่ได้ → ให้ฝั่งแอปดึงเต็มตามเดิม
    },
    async pullBackup() {
      if (!this._uid) return null;
      const { data } = await T(SB.from("backups").select("blob,at").eq("user_id", this._uid).maybeSingle(), 20000, "pullBackup");
      if (!data) return null;
      this._seenAt = Math.max(this._seenAt || 0, Number(data.at) || 0);
      try { return JSON.parse(data.blob); } catch (e) { return null; }
    },
    subscribeBackup(cb) {
      if (!this._uid) return () => {};
      const ch = SB.channel("wtn-backup-" + this._uid)
        .on("postgres_changes",
          { event: "*", schema: "public", table: "backup_meta", filter: "user_id=eq." + this._uid },
          payload => {
            const at = Number((payload.new || {}).at || 0);
            if (!at || at <= (this._seenAt || 0)) return;   // echo ของเราเอง/ของเก่า
            this._seenAt = at;
            cb({ _at: at });   // แจ้งเฉยๆ ว่ามีของใหม่ — ฝั่งแอปตัดสินใจเองว่าจะดึงก้อนเต็มไหม (ประหยัด egress)
          })
        .subscribe();
      return () => { try { SB.removeChannel(ch); } catch (e) {} };
    },

    // ---------- AI กลาง (Edge Function ที่ถือคีย์ Gemini) ----------
    async aiComplete(prompt) {
      const { data, error } = await SB.functions.invoke("ai-complete", { body: { prompt } });
      if (data && data.code === "no-credits") { const e = new Error(data.error || "เครดิต AI หมดแล้ว"); e.code = "no-credits"; e.credits = data.credits; throw e; }
      if (error) {
        let detail = "";
        try {
          const r = error.context;
          if (r && typeof r.text === "function") {
            const t = await r.text();
            try { detail = (JSON.parse(t) || {}).error || t; } catch (e) { detail = t; }
          }
        } catch (e) {}
        throw new Error(detail || (error && error.message) || "เรียก AI ไม่สำเร็จ");
      }
      if (data && data.error) throw new Error(data.error);
      if (data && typeof data.credits === "number") this._credits = data.credits;
      return (data && data.text) || "";
    },
    // ยอดเครดิตคงเหลือ (รีเซ็ตรายเดือนคิดฝั่งเซิร์ฟเวอร์)
    async aiCredits() {
      if (!this._uid) return null;
      const { data, error } = await SB.functions.invoke("ai-complete", { body: { peek: true } });
      if (error || !data || data.error) return null;
      this._credits = data.credits;
      return data;
    }
  };

  window.WTNBackend = api;
  window.dispatchEvent(new Event("wtn-backend-ready"));
  console.info("[wtn] Supabase backend พร้อมใช้งาน");
}

boot().catch(e => console.error("[wtn] backend boot error", e));
