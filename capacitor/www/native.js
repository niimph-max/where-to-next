// Vela — สะพานเชื่อมกับแอป native (โหลดเฉพาะตอนรันใน Capacitor)
(function () {
  var Cap = window.Capacitor;
  if (!Cap || !Cap.isNativePlatform || !Cap.isNativePlatform()) return;
  var P = Cap.Plugins || {};

  // ⚠️ www ของโปรเจกต์นี้ไม่ได้ผ่าน bundler → ตัวเชื่อม JS ของปลั๊กอิน (@capacitor/keyboard ฯลฯ)
  // ไม่เคยถูกโหลด แม้ฝั่ง native จะติดตั้งปลั๊กอินไว้ครบ ทำให้ Cap.Plugins.X เป็น undefined
  // แล้วคำสั่งถูกข้ามไปเงียบ ๆ (นี่คือเหตุที่แถบ ^ v ✓ ไม่เคยหายจริง)
  // → NP() ยิงผ่านสะพาน native โดยตรง ใช้ตัวเชื่อม JS เฉพาะเมื่อมีจริง
  function NP(name, method, args) {
    args = args || {};
    try {
      var pl = P[name];
      if (pl && typeof pl[method] === 'function') return Promise.resolve(pl[method](args));
    } catch (e) {}
    try {
      if (typeof Cap.nativePromise === 'function') return Cap.nativePromise(name, method, args);
    } catch (e) {}
    try {
      if (typeof Cap.toNative === 'function') return Promise.resolve(Cap.toNative(name, method, { options: args }));
    } catch (e) {}
    return Promise.reject(new Error(name + '.' + method + ' ไม่พร้อม'));
  }
  function np(name, method, args) { return NP(name, method, args).catch(function () {}); }
  window.__velaNP = NP;   // ให้แอปเรียกปลั๊กอิน (Filesystem/Share) ได้ผ่านสะพานเดียวกัน
  // ฟังอีเวนต์ของปลั๊กอิน — ทางหลักคือสะพาน native เช่นเดียวกัน
  function NL(name, event, cb) {
    try {
      var pl = P[name];
      if (pl && typeof pl.addListener === 'function') { pl.addListener(event, cb); return; }
    } catch (e) {}
    try { if (typeof Cap.addListener === 'function') Cap.addListener(name, event, cb); } catch (e) {}
  }
  document.documentElement.classList.add('is-native');
  document.documentElement.setAttribute('data-platform', Cap.getPlatform ? Cap.getPlatform() : 'native');

  // แถบสถานะ: พื้นครีม ตัวอักษรเข้ม ให้เข้ากับหัวแอป
  np('StatusBar', 'setStyle', { style: 'LIGHT' });        // LIGHT = ตัวอักษรเข้มบนพื้นสว่าง
  if (Cap.getPlatform() === 'android') np('StatusBar', 'setBackgroundColor', { color: '#f6efe2' });

  // ซ่อนหน้า splash เมื่อ UI พร้อมจริง (ไม่ให้เห็นจอขาวแวบ)
  var hid = false;
  function hideSplash() {
    if (hid) return; hid = true;
    np('SplashScreen', 'hide', { fadeOutDuration: 250 });
  }
  var t = setInterval(function () {
    if (document.querySelector('x-dc') && document.body.innerText.trim().length > 20) { clearInterval(t); hideSplash(); }
  }, 120);
  setTimeout(function () { clearInterval(t); hideSplash(); }, 6000);

  // ตำแหน่ง: ถ้ามีปลั๊กอิน Geolocation ให้ถามผ่าน native (ขึ้นชื่อ "Vela" + เหตุผล)
  // ไม่ใช้ navigator.geolocation ตรง ๆ เพราะ WebView จะขึ้นกล่อง "localhost" would like to use your location
  try {
    if (navigator.geolocation) {
      var G = {
        checkPermissions: function () { return NP('Geolocation', 'checkPermissions'); },
        requestPermissions: function () { return NP('Geolocation', 'requestPermissions'); },
        getCurrentPosition: function (o) { return NP('Geolocation', 'getCurrentPosition', o); }
      };
      navigator.geolocation.getCurrentPosition = function (okCb, errCb, opts) {
        opts = opts || {};
        G.checkPermissions()
          .then(function (s) { return (s && s.location === 'granted') ? s : G.requestPermissions(); })
          .then(function (s) {
            if (s && s.location === 'denied') throw { code: 1, message: 'denied' };
            return G.getCurrentPosition({
              enableHighAccuracy: opts.enableHighAccuracy !== false,
              timeout: opts.timeout || 10000
            });
          })
          .then(function (p) { okCb && okCb({ coords: p.coords, timestamp: p.timestamp }); })
          .catch(function (e) { errCb && errCb({ code: (e && e.code) || 2, message: (e && e.message) || 'position unavailable' }); });
      };
    }
  } catch (e) {}

  // แถบ ^ v ✓ เหนือคีย์บอร์ดของ iOS (input accessory bar) — ปิดทิ้ง
  // เราไม่ได้ใช้ (ฟอร์มเป็นช่องเดี่ยว ไม่ต้องกดขึ้น/ลง) และมันกินที่พิมพ์ไปฟรี ๆ ~45 pt
  // iOS เท่านั้น · Android ไม่มีแถบนี้
  if (Cap.getPlatform() === 'ios') {
    var hideBar = function () { np('Keyboard', 'setAccessoryBarVisible', { isVisible: false }); };
    hideBar();
    // ย้ำหลังสะพาน native พร้อมเต็มที่ (บางรอบบูตปลั๊กอินยังไม่ลงทะเบียน)
    [300, 1200, 3000].forEach(function (ms) { setTimeout(hideBar, ms); });
    window.addEventListener('focusin', hideBar, true);
  }

  // ปุ่มย้อนกลับของ Android → ถอยหน้าในแอป, อยู่หน้าแรกแล้วค่อยย่อแอป (ไม่ปิดทิ้ง)
  if (Cap.getPlatform() === 'android') {
    NL('App', 'backButton', function () {
      if (window.__velaBack && window.__velaBack()) return;
      np('App', 'minimizeApp');
    });
  }

  // ลิงก์ภายนอก → เปิดในเบราว์เซอร์ของระบบ ไม่ให้หลุดออกจากแอป
  document.addEventListener('click', function (ev) {
    var a = ev.target && ev.target.closest && ev.target.closest('a[href^="http"]');
    if (!a) return;
    var here = location.origin;
    if (a.href.indexOf(here) === 0) return;
    ev.preventDefault();
    NP('Browser', 'open', { url: a.href }).catch(function () { window.open(a.href, '_blank'); });
  }, true);

  // กลับเข้าแอป → ให้ดึงข้อมูลล่าสุดจากคลาวด์
  NL('App', 'appStateChange', function (st) {
    if (st && st.isActive) window.dispatchEvent(new Event('online'));
  });
})();
