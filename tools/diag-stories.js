// ตรวจว่าทำไมเรื่องเล่าไม่ซิงก์ — วางใน Console ของ onevela.net/app (อ่านอย่างเดียว ไม่แก้อะไร)
(async () => {
  const w = window.__wtn, be = window.WTNBackend;
  if (!w || !be || !be._uid) { console.log('ยังไม่ได้เข้าสู่ระบบ'); return; }
  const MATCH = /เซี่ยะเหมิน|Xiamen/i;
  const words = h => String(h || '').replace(/<[^>]+>/g, ' ').trim().split(/\s+/).filter(Boolean).length;
  const d = ts => ts ? new Date(ts).toLocaleString('th-TH') : '-';
  const rows = st => (st.chapters || []).map(c => ({ id: String(c.id), ชื่อ: c.title, gen: c.gen || '', สร้าง: d(c.createdAt), แก้: d(Math.max(c.updatedAt || 0, c._m || 0)), คำ: words(c.html), hRef: c.hRef ? 'มี' : '' }));
  const find = list => (list || []).filter(s => s && (MATCH.test(s.title || '') || MATCH.test(s.tripName || '')));

  console.log('— เครื่องนี้ —');
  find(w.stories).forEach(s => { console.log('เรื่อง', s.id, s.title, '_m', d(s._m)); console.table(rows(s)); });

  const full = w.storiesFullJson();
  console.log('ประกอบเนื้อเรื่องครบไหม:', full ? 'ครบ' : 'ไม่ครบ ← เรื่องเล่าทั้งหมดจะไม่ถูกส่งขึ้นคลาวด์', '· ตอนที่หาเนื้อไม่เจอ', w._hMiss || 0);
  if (!full) {
    let raw = []; try { raw = JSON.parse(localStorage.getItem('wtn-stories')) || []; } catch (e) {}
    const lost = [];
    raw.forEach(s => (s.chapters || []).forEach(c => { if (c && c.hRef && !c.html && !(w._hMem || {})[c.hRef]) lost.push(s.title + ' / ' + c.title); }));
    console.log('ตอนที่เนื้อหาย:', lost.slice(0, 30));
  }
  const g = w.gatherLocal();
  const sz = JSON.stringify(g).length, st = (g['wtn-stories'] || '').length;
  console.log('ขนาดก้อนที่จะส่ง', (sz / 1e6).toFixed(2), 'MB · เรื่องเล่า', (st / 1e6).toFixed(2), 'MB', sz > 3500000 ? '← เกิน 3.5 MB: เรื่องเล่าจะถูกคงฉบับคลาวด์ไว้ ไม่ส่งของเครื่องนี้' : '');

  console.log('— บนคลาวด์ —');
  const bk = await be.pullBackup();
  console.log('คลาวด์อัปเดตล่าสุด', d(bk && bk._at), '· เครื่องนี้รู้จักถึง', d(+localStorage.getItem('wtn-cloud-at')));
  let cs = []; try { cs = JSON.parse((bk && bk.data && bk.data['wtn-stories']) || '[]'); } catch (e) {}
  find(cs).forEach(s => { console.log('เรื่อง', s.id, s.title, '_m', d(s._m)); console.table(rows(s)); });
  console.log('จบการตรวจ');
})();
