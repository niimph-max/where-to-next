// Vela — สะพานเชื่อมกับแอป native (โหลดเฉพาะตอนรันใน Capacitor)
(function () {
  var Cap = window.Capacitor;
  if (!Cap || !Cap.isNativePlatform || !Cap.isNativePlatform()) return;
  var P = Cap.Plugins || {};
  document.documentElement.classList.add('is-native');
  document.documentElement.setAttribute('data-platform', Cap.getPlatform ? Cap.getPlatform() : 'native');

  // แถบสถานะ: พื้นครีม ตัวอักษรเข้ม ให้เข้ากับหัวแอป
  try {
    if (P.StatusBar) {
      P.StatusBar.setStyle({ style: 'LIGHT' });          // LIGHT = ตัวอักษรเข้มบนพื้นสว่าง
      if (Cap.getPlatform() === 'android') P.StatusBar.setBackgroundColor({ color: '#f6efe2' });
    }
  } catch (e) {}

  // ซ่อนหน้า splash เมื่อ UI พร้อมจริง (ไม่ให้เห็นจอขาวแวบ)
  var hid = false;
  function hideSplash() {
    if (hid) return; hid = true;
    try { P.SplashScreen && P.SplashScreen.hide({ fadeOutDuration: 250 }); } catch (e) {}
  }
  var t = setInterval(function () {
    if (document.querySelector('x-dc') && document.body.innerText.trim().length > 20) { clearInterval(t); hideSplash(); }
  }, 120);
  setTimeout(function () { clearInterval(t); hideSplash(); }, 6000);

  // ปุ่มย้อนกลับของ Android → ถอยหน้าในแอป, อยู่หน้าแรกแล้วค่อยย่อแอป (ไม่ปิดทิ้ง)
  try {
    P.App && P.App.addListener('backButton', function () {
      if (window.__velaBack && window.__velaBack()) return;
      P.App.minimizeApp && P.App.minimizeApp();
    });
  } catch (e) {}

  // ลิงก์ภายนอก → เปิดในเบราว์เซอร์ของระบบ ไม่ให้หลุดออกจากแอป
  document.addEventListener('click', function (ev) {
    var a = ev.target && ev.target.closest && ev.target.closest('a[href^="http"]');
    if (!a) return;
    var here = location.origin;
    if (a.href.indexOf(here) === 0) return;
    ev.preventDefault();
    try { P.Browser ? P.Browser.open({ url: a.href }) : window.open(a.href, '_system'); } catch (e) { window.open(a.href, '_blank'); }
  }, true);

  // กลับเข้าแอป → ให้ดึงข้อมูลล่าสุดจากคลาวด์
  try {
    P.App && P.App.addListener('appStateChange', function (s) {
      if (s && s.isActive) window.dispatchEvent(new Event('online'));
    });
  } catch (e) {}
})();
