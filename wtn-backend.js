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

  const [{ initializeApp }, auth, fs, storage] = await Promise.all([
    import(`${B}/firebase-app.js`),
    import(`${B}/firebase-auth.js`),
    import(`${B}/firebase-firestore.js`),
    import(`${B}/firebase-storage.js`),
  ]);

  const app = initializeApp(cfg);
  const A = auth.getAuth(app);
  const DB = fs.getFirestore(app);
  const ST = storage.getStorage(app);

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
    // เบอร์โทร OTP — ต้องมี element id="recaptcha" ในหน้า (invisible ก็ได้)
    async phoneStart(phoneE164, recaptchaContainerId) {
      try { if (this._recaptchaVerifier) { this._recaptchaVerifier.clear(); this._recaptchaVerifier = null; } } catch (e) {}
      const el = document.getElementById(recaptchaContainerId);
      if (el) el.innerHTML = "";
      const verifier = new auth.RecaptchaVerifier(A, recaptchaContainerId, { size: "invisible" });
      this._recaptchaVerifier = verifier;
      this._confirm = await auth.signInWithPhoneNumber(A, phoneE164, verifier);
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
    // ฟีดสาธารณะ: ตอนที่ published (collectionGroup) — ไม่ orderBy เพื่อเลี่ยง composite index, เรียงฝั่ง client
    async feed(max = 40) {
      const q = fs.query(fs.collectionGroup(DB, "chapters"),
        fs.where("published", "==", true), fs.limit(max));
      const rows = (await fs.getDocs(q)).docs.map(d => ({ id: d.id, storyId: d.ref.parent.parent.id, ...d.data() }));
      rows.sort((a, b) => ((b.updatedAt && b.updatedAt.seconds) || 0) - ((a.updatedAt && a.updatedAt.seconds) || 0));
      return rows;
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
      await fs.setDoc(fs.doc(DB, "backups", this._uid),
        { blob, at: obj._at || Date.now(), updatedAt: fs.serverTimestamp() });
    },
    async pullBackup() {
      if (!this._uid) return null;
      const snap = await fs.getDoc(fs.doc(DB, "backups", this._uid));
      if (!snap.exists()) return null;
      try { return JSON.parse(snap.data().blob); } catch (e) { return null; }
    },
  };

  window.WTNBackend = api;
  window.dispatchEvent(new Event("wtn-backend-ready"));
  console.info("[wtn] Firebase backend พร้อมใช้งาน");
}

boot().catch(e => console.error("[wtn] backend boot error", e));
