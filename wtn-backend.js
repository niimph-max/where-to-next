// where to next? — Firebase data layer (ESM, โหลดจาก CDN ไม่ต้อง build)
// โหลดด้วย: <script type="module" src="wtn-backend.js"></script> ต่อจาก firebase-config.js
// เปิดใช้เมื่อ window.WTN_BACKEND_ENABLED === true และกรอก config จริงแล้ว
//
// โครงข้อมูล Firestore:
//   users/{uid}                         โปรไฟล์ (อ่านสาธารณะ) + users/{uid}/likes/{chapterId}
//   trips/{tripId}                      ส่วนตัว (ownerUid) + subcollections checkins/expenses/docs/budget
//   stories/{storyId}                   เมทาเดต้าเล่ม (อ่านสาธารณะ)
//   stories/{storyId}/chapters/{cid}    ตอน (อ่านได้เมื่อ published==true หรือเป็นเจ้าของ)
//   stories/{sid}/chapters/{cid}/comments/{id}
//   Storage: users/{uid}/img/{ts}.jpg

const V = "10.12.2";
const B = `https://www.gstatic.com/firebasejs/${V}`;

async function boot() {
  if (!window.WTN_BACKEND_ENABLED) { console.info("[wtn] backend disabled — โหมด local"); return; }
  const cfg = window.WTN_FIREBASE_CONFIG || {};
  if (!cfg.apiKey || cfg.apiKey === "PASTE_API_KEY") { console.warn("[wtn] ยังไม่ได้ตั้ง firebase-config.js"); return; }

  const [{ initializeApp }, auth, fs, storage, fns] = await Promise.all([
    import(`${B}/firebase-app.js`),
    import(`${B}/firebase-auth.js`),
    import(`${B}/firebase-firestore.js`),
    import(`${B}/firebase-storage.js`),
    import(`${B}/firebase-functions.js`),
  ]);

  const app = initializeApp(cfg);
  const A = auth.getAuth(app);
  const DB = fs.getFirestore(app);
  const ST = storage.getStorage(app);
  const FN = fns.getFunctions(app, "asia-southeast1");

  const api = {
    _uid: null,
    // ---------- AUTH ----------
    onUser(cb) { return auth.onAuthStateChanged(A, u => { this._uid = u ? u.uid : null; cb(u); }); },
    async emailSignup(email, pass, name) {
      const c = await auth.createUserWithEmailAndPassword(A, email, pass);
      if (name) await auth.updateProfile(c.user, { displayName: name });
      await this.saveProfile({ name: name || email.split("@")[0] });
      return c.user;
    },
    emailLogin(email, pass) { return auth.signInWithEmailAndPassword(A, email, pass); },
    async google() {
      try {
        return await auth.signInWithPopup(A, new auth.GoogleAuthProvider());
      } catch (e) {
        const c = e && e.code;
        if (c === "auth/popup-blocked" || c === "auth/popup-closed-by-user" ||
            c === "auth/cancelled-popup-request" || c === "auth/operation-not-supported-in-this-environment") {
          await auth.signInWithRedirect(A, new auth.GoogleAuthProvider());
          return null;
        }
        throw e;
      }
    },
    facebook() { return auth.signInWithPopup(A, new auth.FacebookAuthProvider()); },
    // เบอร์โทร OTP — สร้างกล่อง reCAPTCHA ของตัวเองแปะกับ body (นอก React tree กัน re-render ลบทิ้ง)
    async phoneStart(phoneE164, _ignoredId) {
      try { if (this._recaptchaVerifier) { this._recaptchaVerifier.clear(); this._recaptchaVerifier = null; } } catch (e) {}
      try { if (this._recaptchaHost && this._recaptchaHost.parentNode) this._recaptchaHost.parentNode.removeChild(this._recaptchaHost); } catch (e) {}
      const host = document.createElement("div");     // กล่องใหม่ทุกครั้ง แปะกับ body เอง
      host.style.position = "fixed";
      host.style.bottom = "0";
      host.style.left = "0";
      host.style.opacity = "0";
      host.style.pointerEvents = "none";
      host.style.zIndex = "-1";
      document.body.appendChild(host);
      this._recaptchaHost = host;
      const verifier = new auth.RecaptchaVerifier(A, host, { size: "invisible" });
      this._recaptchaVerifier = verifier;
      try {
        await verifier.render();                        // ให้ widget เกิดจริงก่อนใช้
        this._confirm = await auth.signInWithPhoneNumber(A, phoneE164, verifier);
      } catch (e) {
        try { verifier.clear(); } catch (_) {}
        try { if (host.parentNode) host.parentNode.removeChild(host); } catch (_) {}
        this._recaptchaVerifier = null;
        this._recaptchaHost = null;
        throw e;
      }
      return true;
    },
    async phoneVerify(code) { const c = await this._confirm.confirm(code); return c.user; },
    logout() { return auth.signOut(A); },

    // ---------- PROFILE ----------
    async saveProfile(p) {
      if (!this._uid) return;
      await fs.setDoc(fs.doc(DB, "users", this._uid), { ...p, updatedAt: fs.serverTimestamp() }, { merge: true });
    },

    // ---------- STORAGE (รูป/ไฟล์) ----------
    async uploadImage(blobOrDataUrl, name) {
      if (!this._uid) throw new Error("ต้องล็อกอินก่อน");
      const path = `users/${this._uid}/img/${Date.now()}_${name || "f"}`;
      const r = storage.ref(ST, path);
      if (typeof blobOrDataUrl === "string") await storage.uploadString(r, blobOrDataUrl, "data_url");
      else await storage.uploadBytes(r, blobOrDataUrl);
      return storage.getDownloadURL(r);
    },

    // ---------- STORIES / CHAPTERS ----------
    async saveStory(story) { // story.id ต้องมี
      const { id, ...data } = story;
      await fs.setDoc(fs.doc(DB, "stories", id),
        { ...data, ownerUid: this._uid, updatedAt: fs.serverTimestamp() }, { merge: true });
      return id;
    },
    async saveChapter(storyId, ch) { // ch.id ต้องมี
      const { id, ...data } = ch;
      await fs.setDoc(fs.doc(DB, "stories", storyId, "chapters", id),
        { ...data, updatedAt: fs.serverTimestamp() }, { merge: true });
    },
    publishChapter(storyId, cid, on) {
      return fs.updateDoc(fs.doc(DB, "stories", storyId, "chapters", cid), { published: !!on });
    },
    async myStories() {
      const q = fs.query(fs.collection(DB, "stories"), fs.where("ownerUid", "==", this._uid));
      return (await fs.getDocs(q)).docs.map(d => ({ id: d.id, ...d.data() }));
    },
    async chapters(storyId) {
      const q = fs.query(fs.collection(DB, "stories", storyId, "chapters"), fs.orderBy("order", "asc"));
      return (await fs.getDocs(q)).docs.map(d => ({ id: d.id, ...d.data() }));
    },
    // ดึงตอนเดียว (สำหรับลิงก์แชร์ ?st=&ch=) — อ่านได้แม้ยังไม่ล็อกอิน ถ้า published==true
    async getChapter(storyId, cid) {
      try {
        const [s, c] = await Promise.all([
          fs.getDoc(fs.doc(DB, "stories", storyId)),
          fs.getDoc(fs.doc(DB, "stories", storyId, "chapters", cid))
        ]);
        if (!c.exists()) return null;
        return { story: s.exists() ? { id: s.id, ...s.data() } : { id: storyId }, chapter: { id: c.id, ...c.data() } };
      } catch (e) { console.warn("[wtn] getChapter", e); return null; }
    },
    // ฟีดสาธารณะ: ตอนที่ published (collectionGroup) — ไม่ orderBy เพื่อเลี่ยง composite index, เรียงฝั่ง client
    async feed(max = 40) {
      const q = fs.query(fs.collectionGroup(DB, "chapters"),
        fs.where("published", "==", true), fs.limit(max));
      const rows = (await fs.getDocs(q)).docs.map(d => ({ id: d.id, storyId: d.ref.parent.parent.id, ...d.data() }));
      rows.sort((a, b) => ((b.updatedAt && b.updatedAt.seconds) || 0) - ((a.updatedAt && a.updatedAt.seconds) || 0));
      return rows;
    },

    // ---------- MOMENTS (โพสต์สั้น / เช็คอินเผยแพร่) — ฟีดสาธารณะข้ามบัญชี ----------
    async publishMoment(id, data) {
      if (!this._uid) return;
      await fs.setDoc(fs.doc(DB, "moments", id),
        { ...data, ownerUid: this._uid, published: true, updatedAt: fs.serverTimestamp() }, { merge: true });
    },
    async unpublishMoment(id) {
      if (!this._uid) return;
      try { await fs.updateDoc(fs.doc(DB, "moments", id), { published: false }); } catch (e) {}
    },
    async deleteMoment(id) {
      if (!this._uid) return;
      try { await fs.deleteDoc(fs.doc(DB, "moments", id)); } catch (e) {}
    },
    async moments(max = 60) {
      const q = fs.query(fs.collection(DB, "moments"), fs.where("published", "==", true), fs.limit(max));
      const rows = (await fs.getDocs(q)).docs.map(d => ({ id: d.id, ...d.data() }));
      rows.sort((a, b) => (b.at || 0) - (a.at || 0));
      return rows;
    },
    async toggleMomentLike(momentId) {
      if (!this._uid) return null;
      const meRef = fs.doc(DB, "users", this._uid, "likes", "m_" + momentId);
      const mRef = fs.doc(DB, "moments", momentId);
      let nowLiked = false;
      await fs.runTransaction(DB, async t => {
        const me = await t.get(meRef);
        const m = await t.get(mRef);
        const cur = (m.exists() && m.data().likes) || 0;
        if (me.exists()) { t.delete(meRef); t.update(mRef, { likes: Math.max(0, cur - 1) }); nowLiked = false; }
        else { t.set(meRef, { at: fs.serverTimestamp() }); t.update(mRef, { likes: cur + 1 }); nowLiked = true; }
      });
      return nowLiked;
    },

    // ---------- LIKES ----------
    async toggleLike(storyId, cid) {
      const meRef = fs.doc(DB, "users", this._uid, "likes", cid);
      const chRef = fs.doc(DB, "stories", storyId, "chapters", cid);
      await fs.runTransaction(DB, async t => {
        const me = await t.get(meRef);
        const liked = me.exists();
        t.update(chRef, { likes: fs.increment(liked ? -1 : 1) });
        if (liked) t.delete(meRef); else t.set(meRef, { at: fs.serverTimestamp() });
      });
    },

    // ---------- COMMENTS ----------
    addComment(storyId, cid, name, text) {
      return fs.addDoc(fs.collection(DB, "stories", storyId, "chapters", cid, "comments"),
        { uid: this._uid, name, text, at: fs.serverTimestamp() });
    },
    async comments(storyId, cid) {
      const q = fs.query(fs.collection(DB, "stories", storyId, "chapters", cid, "comments"), fs.orderBy("at", "asc"));
      return (await fs.getDocs(q)).docs.map(d => ({ id: d.id, ...d.data() }));
    },

    // ---------- ทริป/เช็คอิน/งบ/เอกสาร (ส่วนตัว) ----------
    async saveTrip(tripId, data) {
      await fs.setDoc(fs.doc(DB, "trips", tripId), { ...data, ownerUid: this._uid }, { merge: true });
    },
    async saveSub(tripId, coll, id, data) {
      await fs.setDoc(fs.doc(DB, "trips", tripId, coll, id), data, { merge: true });
    },
    async getSub(tripId, coll) {
      return (await fs.getDocs(fs.collection(DB, "trips", tripId, coll))).docs.map(d => ({ id: d.id, ...d.data() }));
    },

    // ---------- FULL BACKUP (ซิงก์ทั้งแอปข้ามเครื่อง) — เก็บใน Firestore (เลี่ยงปัญหา CORS ของ Storage) ----------
    async pushBackup(obj) {
      if (!this._uid) return;
      const blob = JSON.stringify(obj);
      if (blob.length > 1000000) { const e = new Error("backup ใหญ่เกิน 1MB"); e.code = "backup/too-large"; throw e; }
      const at = obj._at || Date.now();
      await fs.setDoc(fs.doc(DB, "backups", this._uid),
        { blob, at, updatedAt: fs.serverTimestamp() });
      this._seenAt = Math.max(this._seenAt || 0, at); // กัน listener เครื่องนี้โหลด echo ของตัวเอง
      const metaRef = fs.doc(DB, "backups", this._uid, "versions", "meta");
      // เก็บเวอร์ชันย้อนหลัง (กันเขียนทับพลาด) — 7 ชุดล่าสุด, ไม่ถี่กว่า 10 นาที
      let verList = null;
      if (!this._lastVerAt || at - this._lastVerAt >= 600000) {
        this._lastVerAt = at;
        try {
          await fs.setDoc(fs.doc(DB, "backups", this._uid, "versions", String(at)), { blob, at });
          // ตัดเวอร์ชันเก่าด้วยรายชื่อ id ใน meta — ไม่ดาวน์โหลด blob ทั้ง 7 ชุดอีกแล้ว
          let list = this._verList;
          if (!list) { try { const m = await fs.getDoc(metaRef); list = (m.exists() && m.data().verList) || null; } catch (e) {} }
          if (!list) { // ครั้งแรกหลังอัปเดต: อ่านรายชื่อเดิมหนึ่งครั้ง
            const q = await fs.getDocs(fs.query(fs.collection(DB, "backups", this._uid, "versions"), fs.orderBy("at", "desc")));
            list = q.docs.filter(d => d.id !== "meta").map(d => d.data().at || Number(d.id));
          }
          list = list.filter(x => x && x !== at); list.push(at); list.sort((a, b) => b - a);
          for (const old of list.slice(7)) { try { await fs.deleteDoc(fs.doc(DB, "backups", this._uid, "versions", String(old))); } catch (e) {} }
          this._verList = verList = list.slice(0, 7);
        } catch (e) { console.warn("[wtn] version snap", e); }
      }
      // meta จิ๋ว (~ไม่กี่ร้อยไบต์) ให้เครื่องอื่นฟังแทน blob เต็ม — ประหยัด bandwidth มหาศาล
      try { await fs.setDoc(metaRef, verList ? { at, verList } : { at }, { merge: true }); } catch (e) {}
    },
    async listBackupVersions() {
      if (!this._uid) return [];
      try {
        const q = await fs.getDocs(fs.query(fs.collection(DB, "backups", this._uid, "versions"), fs.orderBy("at", "desc")));
        return q.docs.filter(d => d.id !== "meta").map(d => {
          let trips = 0, moments = 0;
          try { const o = JSON.parse(d.data().blob); const dd = o.data || {}; trips = (JSON.parse(dd["wtn-trips"] || "[]") || []).length; moments = (JSON.parse(dd["wtn-moments"] || "[]") || []).length; } catch (e) {}
          return { id: d.id, at: d.data().at || Number(d.id), trips, moments };
        });
      } catch (e) { console.warn("[wtn] list versions", e); return []; }
    },
    async getBackupVersion(id) {
      if (!this._uid) return null;
      const snap = await fs.getDoc(fs.doc(DB, "backups", this._uid, "versions", String(id)));
      if (!snap.exists()) return null;
      try { return JSON.parse(snap.data().blob); } catch (e) { return null; }
    },
    async pullBackup() {
      if (!this._uid) return null;
      const snap = await fs.getDoc(fs.doc(DB, "backups", this._uid));
      if (!snap.exists()) return null;
      this._seenAt = Math.max(this._seenAt || 0, snap.data().at || 0);
      try { return JSON.parse(snap.data().blob); } catch (e) { return null; }
    },
    // ฟังการเปลี่ยนแปลงแบบเรียลไทม์ — ฟังเฉพาะ meta จิ๋ว แล้วค่อยโหลด blob เต็มเมื่อมีของใหม่จริงเท่านั้น
    subscribeBackup(cb) {
      if (!this._uid) return () => {};
      const metaRef = fs.doc(DB, "backups", this._uid, "versions", "meta");
      return fs.onSnapshot(metaRef,
        async snap => {
          if (!snap.exists()) return;
          const at = snap.data().at || 0;
          if (!at || at <= (this._seenAt || 0)) return; // echo ของเราเอง/ของเก่า — ไม่โหลด
          this._seenAt = at;
          try { const bk = await this.pullBackup(); if (bk) cb(bk); } catch (e) { console.warn("[wtn] backup sub pull", e); }
        },
        err => console.warn("[wtn] backup sub", err));
    },
    // ---------- AI กลาง (ผ่าน Cloud Function ที่ถือคีย์ Gemini) ----------
    async aiComplete(prompt) {
      const call = fns.httpsCallable(FN, "aiComplete");
      const r = await call({ prompt });
      return (r && r.data && r.data.text) || "";
    },
    // ---------- จ่ายเงิน (Stripe) ----------
    async startCheckout(plan) {
      const call = fns.httpsCallable(FN, "createCheckout");
      const r = await call({ plan });
      return (r && r.data && r.data.url) || "";
    },
    async adminStats() {
      const call = fns.httpsCallable(FN, "adminStats");
      const r = await call({});
      return (r && r.data) || null;
    },
    async getPremium() {
      if (!this._uid) return null;
      const snap = await fs.getDoc(fs.doc(DB, "users", this._uid));
      if (!snap.exists()) return { premium: false, until: null };
      const d = snap.data();
      return { premium: d.premium === true, until: d.premiumUntil && d.premiumUntil.toMillis ? d.premiumUntil.toMillis() : null };
    },
  };

  window.WTNBackend = api;
  window.dispatchEvent(new Event("wtn-backend-ready"));
  console.info("[wtn] Firebase backend พร้อมใช้งาน");
}

boot().catch(e => console.error("[wtn] backend boot error", e));
