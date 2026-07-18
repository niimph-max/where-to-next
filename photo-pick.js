/* <photo-pick id="unique-key" placeholder="แตะเพื่อเพิ่มรูป">
 * Self-contained image picker: choose from device, drag to position,
 * pinch/wheel/slider zoom, change/remove later. Persists dataURL +
 * transform in localStorage under "photopick:<id>". Fills its host
 * element; border-radius inherited. No dependencies.
 */
(function () {
  if (customElements.get('photo-pick')) return;
  var KEY = function (id) { return 'photopick:' + id; };

  function el(tag, css, txt) {
    var n = document.createElement(tag);
    if (css) n.style.cssText = css;
    if (txt != null) n.textContent = txt;
    return n;
  }
  var CAM = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="7" width="18" height="13" rx="2"/><circle cx="12" cy="13" r="3.2"/><path d="M8 7l1.5-2h5L16 7"/></svg>';

  class PhotoPick extends HTMLElement {
    connectedCallback() {
      if (this._built) { this._render(); return; }
      this._built = true;
      var sh = this.attachShadow({ mode: 'open' });
      var st = document.createElement('style');
      st.textContent =
        ':host{display:block;position:relative;overflow:hidden;border-radius:inherit;' +
        'font-family:Anuphan,sans-serif;-webkit-user-select:none;user-select:none;background:#e7dcc9}' +
        '.vp{position:absolute;inset:0;border-radius:inherit;overflow:hidden;cursor:pointer}' +
        '.vp.adj{cursor:grab;touch-action:none}.vp.adj:active{cursor:grabbing}' +
        'img{position:absolute;left:50%;top:50%;max-width:none;pointer-events:none;will-change:transform}' +
        '.empty{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;' +
        'gap:5px;color:#8a7d6f;text-align:center;padding:6px}' +
        '.empty span{font:600 10.5px Anuphan,sans-serif;line-height:1.35}' +
        '.hint{position:absolute;left:50%;top:10px;transform:translateX(-50%);background:rgba(43,36,32,.72);' +
        'color:#f6efe2;font:600 10.5px Anuphan,sans-serif;padding:4px 11px;border-radius:14px;white-space:nowrap;pointer-events:none}';
      sh.appendChild(st);
      this._vp = el('div'); this._vp.className = 'vp';
      sh.appendChild(this._vp);
      this._file = document.createElement('input');
      this._file.type = 'file'; this._file.accept = 'image/*';
      this._file.style.display = 'none';
      sh.appendChild(this._file);
      this._file.addEventListener('change', this._onFile.bind(this));

      this._state = null;       // {img,x,y,s}
      this._imgEl = null;
      this._nat = null;         // natural w/h
      this._adjust = false;
      this._load();

      var self = this;
      this._vp.addEventListener('click', function () {
        if (self._adjust || self._moved) return;
        if (!self._state) self._file.click();
        else self._openSheet();
      });
      this._vp.addEventListener('pointerdown', this._pDown.bind(this));
      this._vp.addEventListener('pointermove', this._pMove.bind(this));
      this._vp.addEventListener('pointerup', this._pUp.bind(this));
      this._vp.addEventListener('pointercancel', this._pUp.bind(this));
      this._vp.addEventListener('wheel', function (e) {
        if (!self._adjust) return;
        e.preventDefault();
        self._setScale(self._state.s * (e.deltaY < 0 ? 1.06 : 0.94));
      }, { passive: false });
      if (window.ResizeObserver) new ResizeObserver(function () { self._render(); }).observe(this);
    }

    _load() {
      try {
        var raw = localStorage.getItem(KEY(this.id || 'photo'));
        this._state = raw ? JSON.parse(raw) : null;
      } catch (e) { this._state = null; }
      this._render();
    }
    _save() {
      try {
        var k = KEY(this.id || 'photo');
        if (this._state) localStorage.setItem(k, JSON.stringify(this._state));
        else localStorage.removeItem(k);
        window.dispatchEvent(new CustomEvent('photopick-change', { detail: { id: this.id } }));
      } catch (e) { alert('บันทึกรูปไม่สำเร็จ (พื้นที่จัดเก็บเต็ม) ลองใช้รูปเล็กลง'); }
    }

    _onFile(ev) {
      var f = ev.target.files && ev.target.files[0];
      ev.target.value = '';
      if (!f) return;
      var self = this, rd = new FileReader();
      rd.onload = function () {
        var im = new Image();
        im.onload = function () {
          var MAX = 1600, w = im.width, h = im.height, r = Math.min(1, MAX / Math.max(w, h));
          var c = document.createElement('canvas');
          c.width = Math.round(w * r); c.height = Math.round(h * r);
          c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
          self._state = { img: c.toDataURL('image/jpeg', 0.85), x: 0, y: 0, s: 1 };
          self._nat = null;
          self._save();
          self._render(function () { self._enterAdjust(); });
        };
        im.src = rd.result;
      };
      rd.readAsDataURL(f);
    }

    _render(cb) {
      var vp = this._vp;
      if (!this._state) {
        this._nat = null; this._imgEl = null;
        vp.innerHTML = '<div class="empty"><div style="color:#a5977f">' + CAM + '</div><span>' +
          (this.getAttribute('placeholder') || 'แตะเพื่อเพิ่มรูป') + '</span></div>';
        return;
      }
      if (!this._imgEl || !vp.contains(this._imgEl)) {
        vp.innerHTML = '';
        this._imgEl = document.createElement('img');
        vp.appendChild(this._imgEl);
      }
      var self = this, img = this._imgEl;
      if (img.src !== this._state.img) {
        img.onload = function () {
          self._nat = { w: img.naturalWidth, h: img.naturalHeight };
          self._place(); if (cb) cb();
        };
        img.src = this._state.img;
        if (img.complete) { img.onload(); img.onload = null; cb = null; }
      } else { this._place(); if (cb) cb(); }
    }

    _dims() {
      var r = this.getBoundingClientRect(), n = this._nat;
      if (!n || !r.width || !r.height) return null;
      var base = Math.max(r.width / n.w, r.height / n.h) * this._state.s;
      return { W: r.width, H: r.height, dw: n.w * base, dh: n.h * base };
    }
    _clamp() {
      var d = this._dims(); if (!d) return;
      var mx = Math.max(0, (d.dw - d.W) / 2), my = Math.max(0, (d.dh - d.H) / 2);
      this._state.x = Math.min(mx, Math.max(-mx, this._state.x));
      this._state.y = Math.min(my, Math.max(-my, this._state.y));
    }
    _place() {
      var d = this._dims(); if (!d || !this._imgEl) return;
      this._clamp();
      this._imgEl.style.width = d.dw + 'px';
      this._imgEl.style.height = d.dh + 'px';
      this._imgEl.style.transform = 'translate(calc(-50% + ' + this._state.x + 'px), calc(-50% + ' + this._state.y + 'px))';
    }
    _setScale(s) {
      s = Math.min(4, Math.max(1, s));
      var d0 = this._dims();
      if (d0) { var f = s / this._state.s; this._state.x *= f; this._state.y *= f; }
      this._state.s = s;
      if (this._slider) this._slider.value = s;
      this._place();
    }

    /* --- drag / pinch (adjust mode only) --- */
    _pDown(e) {
      this._moved = false;
      if (!this._adjust || !this._state) return;
      this._vp.setPointerCapture(e.pointerId);
      this._pts = this._pts || {};
      this._pts[e.pointerId] = { x: e.clientX, y: e.clientY };
      var ids = Object.keys(this._pts);
      if (ids.length === 2) {
        var a = this._pts[ids[0]], b = this._pts[ids[1]];
        this._pinch0 = { d: Math.hypot(a.x - b.x, a.y - b.y), s: this._state.s };
      }
    }
    _pMove(e) {
      if (!this._adjust || !this._pts || !this._pts[e.pointerId]) return;
      var p = this._pts[e.pointerId];
      var dx = e.clientX - p.x, dy = e.clientY - p.y;
      p.x = e.clientX; p.y = e.clientY;
      if (Math.abs(dx) + Math.abs(dy) > 1) this._moved = true;
      var ids = Object.keys(this._pts);
      if (ids.length >= 2 && this._pinch0) {
        var a = this._pts[ids[0]], b = this._pts[ids[1]];
        var d = Math.hypot(a.x - b.x, a.y - b.y);
        this._setScale(this._pinch0.s * d / this._pinch0.d);
      } else {
        this._state.x += dx; this._state.y += dy;
        this._place();
      }
    }
    _pUp(e) {
      if (this._pts) { delete this._pts[e.pointerId]; this._pinch0 = null; }
      var self = this;
      setTimeout(function () { self._moved = false; }, 0);
    }

    /* --- adjust mode --- */
    _enterAdjust() {
      if (this._adjust) return;
      this._adjust = true;
      this._before = JSON.stringify(this._state);
      this._vp.classList.add('adj');
      this._hint = el('div'); this._hint.className = 'hint';
      this._hint.textContent = 'ลากเพื่อจัดตำแหน่ง · ถ่างนิ้วเพื่อซูม';
      this.shadowRoot.appendChild(this._hint);
      this.style.outline = '3px solid #c05f39';
      this.style.outlineOffset = '2px';
      this.style.zIndex = '60';
      this._sheet(this._adjustSheet());
    }
    _exitAdjust(saved) {
      this._adjust = false;
      this._vp.classList.remove('adj');
      if (this._hint) { this._hint.remove(); this._hint = null; }
      this.style.outline = ''; this.style.outlineOffset = ''; this.style.zIndex = '';
      this._slider = null;
      if (saved) this._save();
      else if (this._before) { this._state = JSON.parse(this._before); this._render(); }
      this._closeSheet();
    }

    /* --- bottom sheet (body-level, works for tiny hosts) --- */
    _sheet(content) {
      this._closeSheet();
      var self = this;
      var bg = el('div', 'position:fixed;inset:0;z-index:9998;background:rgba(43,36,32,' +
        (this._adjust ? '0' : '.35') + ')');
      var sh = el('div', 'position:fixed;left:50%;bottom:18px;transform:translateX(-50%);z-index:9999;' +
        'width:min(360px,calc(100vw - 32px));background:#fffdf8;border-radius:20px;' +
        'box-shadow:0 12px 40px rgba(43,36,32,.35);padding:14px;font-family:Anuphan,sans-serif');
      sh.appendChild(content);
      if (!this._adjust) bg.addEventListener('click', function () { self._closeSheet(); });
      else bg.style.pointerEvents = 'none';
      document.body.appendChild(bg); document.body.appendChild(sh);
      this._bg = bg; this._sh = sh;
    }
    _closeSheet() {
      if (this._bg) { this._bg.remove(); this._bg = null; }
      if (this._sh) { this._sh.remove(); this._sh = null; }
    }
    _btn(label, primary, fn) {
      var b = el('button',
        'display:block;width:100%;min-height:44px;border-radius:13px;cursor:pointer;font:600 14px Anuphan,sans-serif;' +
        (primary ? 'background:#c05f39;color:#fff;border:none'
                 : 'background:#f2ead9;color:#2b241f;border:none'), label);
      b.addEventListener('click', fn);
      return b;
    }
    _openSheet() {
      var self = this;
      var box = el('div', 'display:flex;flex-direction:column;gap:8px');
      box.appendChild(el('div', 'font:600 12.5px Anuphan,sans-serif;color:#8a7d6f;text-align:center;padding-bottom:2px', 'จัดการรูป'));
      box.appendChild(this._btn('เปลี่ยนรูป', false, function () { self._closeSheet(); self._file.click(); }));
      box.appendChild(this._btn('จัดตำแหน่ง / ซูม', false, function () { self._closeSheet(); self._enterAdjust(); }));
      var del = this._btn('ลบรูป', false, function () {
        self._closeSheet(); self._state = null; self._save(); self._render();
      });
      del.style.color = '#b3402a';
      box.appendChild(del);
      box.appendChild(this._btn('ยกเลิก', false, function () { self._closeSheet(); }));
      this._sheet(box);
    }
    _adjustSheet() {
      var self = this;
      var box = el('div', 'display:flex;flex-direction:column;gap:10px');
      var row = el('div', 'display:flex;align-items:center;gap:10px');
      row.appendChild(el('span', 'font:600 12px Anuphan,sans-serif;color:#8a7d6f', 'ซูม'));
      var sl = document.createElement('input');
      sl.type = 'range'; sl.min = '1'; sl.max = '4'; sl.step = '0.01'; sl.value = this._state.s;
      sl.style.cssText = 'flex:1;accent-color:#c05f39;min-height:44px';
      sl.addEventListener('input', function () { self._setScale(parseFloat(sl.value)); });
      this._slider = sl;
      row.appendChild(sl);
      box.appendChild(row);
      var btns = el('div', 'display:flex;gap:8px');
      var c = this._btn('ยกเลิก', false, function () { self._exitAdjust(false); });
      var ok = this._btn('บันทึก', true, function () { self._exitAdjust(true); });
      c.style.flex = '1'; ok.style.flex = '1.4';
      btns.appendChild(c); btns.appendChild(ok);
      box.appendChild(btns);
      return box;
    }
  }
  customElements.define('photo-pick', PhotoPick);
})();
