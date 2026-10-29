(async () => {
  const w = window.__wtn, be = window.WTNBackend;
  if (!w || !be || !be._uid) { alert('ยังไม่ได้เข้าสู่ระบบ หรือไม่ได้เปิดหน้า onevela.net/app'); return; }
  const DAY = '2026-10-28';
  const ymd = ts => { const d = new Date(ts); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
  const trip = w.userTrips.find(t => /เซี่ยะเหมิน/.test(t.name || ''));
  if (!trip) { alert('ไม่เจอทริปเซี่ยะเหมิน'); return; }
  const tid = trip.id, cur = w.checkins;
  const curOf = Object.keys(cur).filter(k => k.indexOf(tid + ':') === 0).flatMap(k => cur[k] || []);
  const have = new Set(curOf.map(c => c && c.mid).filter(Boolean));
  const sig = c => (c.name || '') + '|' + (c.at || '');
  const haveSig = new Set(curOf.map(sig));

  // กรณีลบจากหน้าโมเมนต์: บันทึกยังอยู่ แค่ถูกปลดออกจากฟีด
  const hidden = curOf.filter(c => c && c.at && ymd(c.at) === DAY && c.published === false);
  if (hidden.length) console.log('[กู้] บันทึกวันที่ 28 ที่ยังอยู่แต่ไม่ได้อยู่บนโมเมนต์:', hidden.map(c => c.t + ' ' + c.name));

  const vers = await be.listBackupVersions();
  console.log('[กู้] มีเวอร์ชันสำรอง', vers.length, 'ชุด:', vers.map(v => new Date(v.at).toLocaleString('th-TH')));
  let found = [], fromAt = 0;
  for (const v of vers) {
    const bk = await be.getBackupVersion(v.id);
    let ci = {}; try { ci = JSON.parse((bk && bk.data && bk.data['wtn-checkins']) || '{}') || {}; } catch (e) {}
    const lost = Object.keys(ci).filter(k => k.indexOf(tid + ':') === 0).flatMap(k => (ci[k] || []).map(c => ({ c, k })))
      .filter(({ c }) => c && c.at && ymd(c.at) === DAY && !(c.mid && have.has(c.mid)) && !haveSig.has(sig(c)));
    if (lost.length) { found = lost; fromAt = v.at; break; }
  }
  if (!found.length) {
    alert(hidden.length ? 'ไม่เจอในเวอร์ชันสำรอง แต่มีบันทึกที่ยังอยู่ ' + hidden.length + ' รายการ (ดูในคอนโซล) — เปิดสวิตช์ "อยู่บนโมเมนต์" กลับได้เลย'
                        : 'ไม่เจอโมเมนต์วันที่ 28 ที่หายไป ในเวอร์ชันสำรองทั้ง ' + vers.length + ' ชุด');
    return;
  }
  const list = found.map(({ c }) => '• ' + (c.t || '') + ' ' + (c.name || '') + ' — ' + String(c.note || '').slice(0, 60).replace(/\n/g, ' ')).join('\n');
  if (!confirm('เจอในสำรองเมื่อ ' + new Date(fromAt).toLocaleString('th-TH') + '\n\n' + list + '\n\nเอากลับมาไหม?')) return;
  const all = w.checkins;
  found.forEach(({ c, k }, i) => {
    // ⚠ ใช้ mid ใหม่: mid เดิมมีใบสั่งลบ (wtn-tombs) อยู่ทุกเครื่องแล้ว ใช้ตัวเดิมซิงก์รอบหน้าจะโดนลบซ้ำ
    const back = { ...c, mid: 'm' + Date.now() + i + Math.floor(Math.random() * 1000), published: true, _m: Date.now() };
    (all[k] = all[k] || []).push(back);
    all[k].sort((a, b) => (a.at || 0) - (b.at || 0));
  });
  w.saveCheckins(all);
  w.scheduleCloudPush && w.scheduleCloudPush();
  w.forceUpdate();
  alert('✓ เอากลับมาแล้ว ' + found.length + ' รายการ');
})();
