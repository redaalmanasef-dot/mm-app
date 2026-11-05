/* MayarMemories — تطبيق الجوال (5 نوفمبر 2026 — v1.1)
   الجوال ↔ السيرفر فقط. البرنامج على الكمبيوتر يرسل ملخص الطلبات والمهام ويأخذ «أوامر الجوال» وينفذها ويرد ✓.
   الصور تظهر في قسم القص بس (طلبات الموقع) ولا تنحفظ في الجوال.
   (14:49) السرعة: كل البيانات تنحفظ في الجوال (localStorage) وتنرسم فوراً، والتحديث يصير في الخلفية بدون أي شاشة تحميل. */
(function () {
  'use strict';
  const API = String(window.MM_API || '').replace(/\/+$/, '');
  const V = window.MM_V || 'dev';
  const ASSETS = String(window.MM_ASSETS || '.').replace(/\/+$/, '');
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const AR = (n) => String(n ?? '').replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[d]);
  const fmt = (n) => AR(Number(n || 0).toLocaleString('en-US'));
  const money = (n) => `${fmt(Math.round(Number(n || 0)))} ر.س`;
  const phN = (n) => { n = Number(n) || 0; return n === 1 ? 'صورة وحدة' : n === 2 ? 'صورتين' : n <= 10 ? `${AR(n)} صور` : `${AR(n)} صورة`; };
  const store = { get: (k) => { try { return localStorage.getItem('mm.' + k); } catch { return null; } }, set: (k, v) => { try { v == null ? localStorage.removeItem('mm.' + k) : localStorage.setItem('mm.' + k, String(v)); } catch {} } };
  const DAY = 86400000;
  function when(iso) {
    const t = Date.parse(iso || ''); if (!Number.isFinite(t)) return '';
    const d = new Date(t), n = new Date(); const diff = n - t;
    const hm = d.toLocaleTimeString('ar-SA-u-nu-arab', { hour: '2-digit', minute: '2-digit' });
    if (diff < 60000 && diff > -60000) return 'الحين';
    if (diff < 3600000 && diff > 0) return `قبل ${AR(Math.floor(diff / 60000))} دقيقة`;
    if (d.toDateString() === n.toDateString()) return hm;
    const y = new Date(n - DAY); if (d.toDateString() === y.toDateString()) return `أمس ${hm}`;
    return d.toLocaleDateString('ar-SA-u-nu-arab', { day: 'numeric', month: 'short' }) + ' ' + hm;
  }
  const ago = (iso) => { const t = Date.parse(iso || ''); if (!Number.isFinite(t)) return ''; const m = Math.floor((Date.now() - t) / 60000); if (m < 1) return 'الحين'; if (m < 60) return `منذ ${AR(m)} دقيقة`; const h = Math.floor(m / 60); if (h < 24) return h === 1 ? 'منذ ساعة' : h === 2 ? 'منذ ساعتين' : `منذ ${AR(h)} ساعات`; const d = Math.floor(h / 24); return d === 1 ? 'منذ يوم' : d === 2 ? 'منذ يومين' : d <= 10 ? `منذ ${AR(d)} أيام` : `منذ ${AR(d)} يوم`; };
  const since = (iso) => { const t = Date.parse(iso || ''); if (!Number.isFinite(t)) return ''; const dd = Math.floor((Date.now() - t) / DAY); return dd <= 0 ? 'اليوم' : dd === 1 ? 'أمس' : dd === 2 ? 'قبل يومين' : dd <= 10 ? `قبل ${AR(dd)} أيام` : `قبل ${AR(dd)} يوم`; };

  /* ---------- الأيقونات (رفيعة مثل الآيفون) ---------- */
  const S = (d) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
  const I = {
    home: S('<path d="M4 11.2 12 4.5l8 6.7V19a1.5 1.5 0 0 1-1.5 1.5H14v-5.3h-4v5.3H5.5A1.5 1.5 0 0 1 4 19z"/>'),
    box: S('<path d="M20.5 8.2 12 4 3.5 8.2v7.6L12 20l8.5-4.2z"/><path d="M3.5 8.2 12 12.4l8.5-4.2M12 12.4V20"/>'),
    cut: S('<circle cx="6.5" cy="6.5" r="2.6"/><circle cx="6.5" cy="17.5" r="2.6"/><path d="M19.5 4.5 8.7 15.3M15 15l4.5 4.5M8.7 8.7 12 12"/>'),
    spark: S('<path d="M12 3.5 13.7 8.3 18.5 10l-4.8 1.7L12 16.5l-1.7-4.8L5.5 10l4.8-1.7z"/><path d="M19 15.5l.8 1.9 1.9.8-1.9.8-.8 1.9-.8-1.9-1.9-.8 1.9-.8z"/>'),
    grid: S('<rect x="3.5" y="3.5" width="7" height="7" rx="2.2"/><rect x="13.5" y="3.5" width="7" height="7" rx="2.2"/><rect x="3.5" y="13.5" width="7" height="7" rx="2.2"/><rect x="13.5" y="13.5" width="7" height="7" rx="2.2"/>'),
    print: S('<path d="M7 8.5V4.5h10v4"/><rect x="4" y="8.5" width="16" height="8" rx="2.5"/><path d="M7 13.5h10v6H7z"/>'),
    puzzle: S('<path d="M10 3.5h4v2.3a1.9 1.9 0 1 0 3.8 0h2.7v4h-2.3a1.9 1.9 0 1 0 0 3.8h2.3v4h-4v-2.3a1.9 1.9 0 1 0-3.8 0v2.3H6.5v-2.3a1.9 1.9 0 1 1 0-3.8V7.5H10z"/>'),
    wallet: S('<rect x="3.5" y="6" width="17" height="12.5" rx="3"/><path d="M15.5 12.2h5M3.5 10h17"/><circle cx="16.3" cy="14.4" r=".9" fill="currentColor"/>'),
    truck: S('<path d="M3.5 7.5h10.5v8.5H3.5zM14 10.5h3.6l2.9 2.9V16H14z"/><circle cx="7" cy="17.5" r="1.6"/><circle cx="17" cy="17.5" r="1.6"/>'),
    review: S('<rect x="4.5" y="4" width="15" height="16" rx="3"/><path d="M8.5 9.5h7M8.5 13h7M8.5 16.5h4"/>'),
    users: S('<circle cx="9" cy="8.5" r="3"/><path d="M3.5 19c0-3.2 2.5-5.3 5.5-5.3s5.5 2.1 5.5 5.3"/><circle cx="16.8" cy="9.5" r="2.3"/><path d="M15.8 13.7c2.7.1 4.9 2 4.9 5.3"/>'),
    chat: S('<path d="M20.5 11.8c0 3.9-3.8 7-8.5 7-1 0-2-.1-2.9-.4L4 20l1.3-3.4A6.6 6.6 0 0 1 3.5 11.8c0-3.9 3.8-7 8.5-7s8.5 3.1 8.5 7Z"/>'),
    cloud: S('<path d="M7 18.5a4.3 4.3 0 0 1-.5-8.6 6 6 0 0 1 11.6 1.6A3.5 3.5 0 0 1 17.5 18.5z"/>'),
    wa: S('<path d="M20.5 11.8c0 3.9-3.8 7-8.5 7-1 0-2-.1-2.9-.4L4 20l1.3-3.4A6.6 6.6 0 0 1 3.5 11.8c0-3.9 3.8-7 8.5-7s8.5 3.1 8.5 7Z"/><path d="M9.3 9.5c.2 2.2 2.6 4.6 4.9 4.9l1-1.4-1.7-.9-.8.8c-.9-.4-1.5-1-1.9-1.9l.8-.8-.9-1.7z"/>'),
    back: S('<path d="M9.5 5.5 16 12l-6.5 6.5"/>'),
    search: S('<circle cx="11" cy="11" r="6.5"/><path d="M19.5 19.5 16 16"/>'),
    plus: S('<path d="M12 5.5v13M5.5 12h13"/>'),
    note: S('<path d="M5 4.5h10l4 4v11H5z"/><path d="M8.5 12h7M8.5 15.5h5"/>'),
    flash: S('<path d="M13 3 4.5 14h7l-1 7 8.5-11h-7z"/>'),
    move: S('<path d="M7 7.5h10m-10 0 3-3m-3 3 3 3M17 16.5H7m10 0-3-3m3 3-3 3"/>'),
    stop: S('<circle cx="12" cy="12" r="8.5"/><path d="M6.5 6.5l11 11"/>'),
    play: S('<circle cx="12" cy="12" r="8.5"/><path d="M10 8.5v7l5.5-3.5z"/>'),
    link: S('<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>'),
    shield: S('<path d="M12 3.5 19.5 6.3v5.7c0 4.6-3.2 7.6-7.5 8.5-4.3-.9-7.5-3.9-7.5-8.5V6.3z"/><path d="m9 12 2 2 4-4"/>'),
    check: S('<path d="m5.5 12.5 4 4 9-9"/>'),
    bell: S('<path d="M6.5 16v-5a5.5 5.5 0 0 1 11 0v5l1.5 1.5h-14z"/><path d="M10 20h4"/>'),
    face: S('<circle cx="12" cy="12" r="8.5"/><path d="M9 10h.01M15 10h.01M9 14.5c1.5 1.5 4.5 1.5 6 0"/>'),
    rotate: S('<path d="M4.5 12a7.5 7.5 0 0 1 12.8-5.3L19.5 8.7M19.5 4.5v4.2h-4.2"/>'),
    undo: S('<path d="M9 14 4.5 9.5 9 5"/><path d="M4.5 9.5h10.5a5 5 0 0 1 0 10h-3"/>'),
    camera: S('<path d="M4.5 8.5h3l2-2h5l2 2h3v10h-15z"/><circle cx="12" cy="13.2" r="3.2"/>'),
    clip: S('<path d="M20 11.5 12 19.5a5 5 0 0 1-7-7l8.5-8.5a3.2 3.2 0 0 1 4.6 4.6L9.6 17.1a1.6 1.6 0 0 1-2.3-2.3l7.5-7.5"/>'),
    send: S('<path d="M3.5 12 20 4.5 14 20l-3-6.5z"/>'),
    logout: S('<path d="m10.5 16.5 4.5-4.5-4.5-4.5M15 12H3.5M13 3.5h6v17h-6"/>'),
    sort: S('<path d="M4.5 7h15M7.5 12h9M10.5 17h3"/>'),
    pay: S('<rect x="3.5" y="6" width="17" height="12" rx="2.5"/><path d="M3.5 10h17M7.5 14.5h4"/>'),
    key: S('<circle cx="8" cy="14.5" r="3.5"/><path d="m10.6 12 8.4-8.5M16 5.5l2 2M13.5 8l2 2"/>'),
    gear: S('<circle cx="12" cy="12" r="2.8"/><path d="M19 12a7 7 0 0 0-.1-1.1l2-1.5-2-3.4-2.3.9a7 7 0 0 0-1.9-1.1L14.3 3h-4l-.4 2.6a7 7 0 0 0-1.9 1.1L5.7 6l-2 3.4 2 1.5a7 7 0 0 0 0 2.2l-2 1.5 2 3.4 2.3-.9a7 7 0 0 0 1.9 1.1l.4 2.6h4l.4-2.6a7 7 0 0 0 1.9-1.1l2.3.9 2-3.4-2-1.5c.1-.4.1-.7.1-1.1z"/>'),
    refresh: S('<path d="M4.5 12a7.5 7.5 0 0 1 12.8-5.3L19.5 8.7M19.5 4.5v4.2h-4.2M19.5 12a7.5 7.5 0 0 1-12.8 5.3L4.5 15.3M4.5 19.5v-4.2h4.2"/>'),
    flip: S('<path d="M12 3v18M7 7.5 3.5 12 7 16.5M17 7.5l3.5 4.5-3.5 4.5"/>'),
    x: S('<path d="M6 6l12 12M18 6 6 18"/>'),
    crown: S('<path d="M4 18h16l-1.6-9-4.4 3.6L12 6l-2 6.6L5.6 9z"/>'),
    smile: S('<circle cx="12" cy="12" r="8.5"/><path d="M9 10h.01M15 10h.01M8.5 14c1 2 2.5 2.6 3.5 2.6s2.5-.6 3.5-2.6"/>'),
    down: S('<path d="m6 9.5 6 6 6-6"/>'),
    up: S('<path d="m6 14.5 6-6 6 6"/>'),
    copy: S('<rect x="8.5" y="8.5" width="11" height="11" rx="2.5"/><path d="M15.5 8.5v-2a2 2 0 0 0-2-2h-7a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h2"/>'),
    img: S('<rect x="4" y="5" width="16" height="14" rx="3"/><circle cx="9" cy="10" r="1.6"/><path d="m5 17 5-4.5 3 2.5 3-3 3 3"/>'),
    clock: S('<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>'),
    tag: S('<path d="M4 12.5V5h7.5l8.5 8.5-7.5 7.5z"/><circle cx="8.5" cy="9.5" r="1.3"/>'),
    person: S('<circle cx="12" cy="8.5" r="3.5"/><path d="M5 19.5c0-3.6 3.1-6 7-6s7 2.4 7 6"/>'),
    arrow: S('<path d="M5 12h14M13 6l6 6-6 6"/>'),
    dots: S('<circle cx="6" cy="12" r="1.4" fill="currentColor"/><circle cx="12" cy="12" r="1.4" fill="currentColor"/><circle cx="18" cy="12" r="1.4" fill="currentColor"/>'),
    phone: S('<path d="M6.5 3.5h3l1.5 4-2 1.5a11 11 0 0 0 6 6l1.5-2 4 1.5v3a2 2 0 0 1-2 2A15 15 0 0 1 4.5 5.5a2 2 0 0 1 2-2z"/>'),
  };
  const P = { wa: ['#e6f6ec', '#2f9e63'], site: ['#e7f1fd', '#3b82f6'], crop: ['#fff0e7', '#ea7f3a'], clar: ['#efe8fc', '#8b5cf6'], print: ['#e4f5f7', '#0f9aa7'], audit: ['#ece8fb', '#7c5cd6'], fin: ['#e6f6ee', '#1a9a62'], dept: ['#fff2e0', '#e39012'], rev: ['#f1e8fb', '#8e5bd6'], acc: ['#fde9e2', '#d2552e'], team: ['#fde8ee', '#e0708f'], sec: ['#f1f3f6', '#5b6b73'], aqua: ['#e4f5f7', '#3aa4ae'], rose: ['#fde8ee', '#d9668a'], pay: ['#e6f6ee', '#1a9a62'], red: ['#fdeaea', '#c62828'], gr: ['#f1f3f6', '#5b6b73'] };
  const sq = (k, ic) => `<span class="sq" style="background:${P[k][0]};color:${P[k][1]}">${ic}</span>`;
  // ألوان الحسابات: فاتحة وناعمة وبنوتية — نفس درجة لون الحساب في البرنامج بس باستيل (الفقاعة · الحرف · النص)
  const PASTEL = [[345, '#ffe4ec', '#f7b6c9', '#b5476d'], [20, '#ffe9df', '#f8c5b0', '#b3593a'], [45, '#fff4d9', '#f6dc9c', '#8f6a14'], [150, '#e1f7ec', '#ace5c9', '#237a52'], [185, '#dff5f7', '#a6dfe5', '#1f7f8b'], [210, '#e3f0fd', '#afcff5', '#2d64a6'], [235, '#e8e9fd', '#c2c6f5', '#4d52ae'], [265, '#efe5fb', '#cfbaf2', '#6a48ad'], [290, '#f7e4fb', '#e2b9f0', '#8a41a6'], [320, '#fce4f3', '#eeb7da', '#9f3b7d']];
  const hashN = (s) => { let h = 0; for (const ch of String(s || '')) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return h; };
  function hueOf(hex) { const n = parseInt(hex.slice(1), 16); const r = ((n >> 16) & 255) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255; const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn; if (d < .09) return null; let h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h = Math.round(h * 60); return (h + 360) % 360; }
  function pastelOf(u) { const c = u && u.color && /^#[0-9a-f]{6}$/i.test(u.color) ? u.color : null; const h = c ? hueOf(c) : null; if (h == null) return PASTEL[hashN(u?.id || u?.name) % PASTEL.length]; let best = PASTEL[0], bd = 999; for (const p of PASTEL) { const dd = Math.min(Math.abs(p[0] - h), 360 - Math.abs(p[0] - h)); if (dd < bd) { bd = dd; best = p; } } return best; }
  const orbStyle = (u) => { const p = pastelOf(u); return `--c:${p[1]};--d:${p[2]};--t:${p[3]}`; };
  const avStyle = (name) => { const p = PASTEL[hashN(name) % PASTEL.length]; return `background:${p[1]};color:${p[3]}`; };

  /* ---------- الحالة + المخزن المحلي (كل البيانات تنحفظ في الجوال وتنرسم فوراً) ---------- */
  const st = { token: store.get('token') || '', user: null, users: [], sync: null, settings: { phoneCrop: false }, tab: { wa: 'all', site: 'all' }, q: '', threadsTab: 'inbox', cropSel: new Set(), polls: [], online: navigator.onLine, deptPick: 'all', logOpen: {}, seenAt: store.get('seenAt') || '', emo: false };
  const me = () => st.user || {};
  const isAdmin = () => me().role === 'admin';
  const can = (s) => isAdmin() || (Array.isArray(me().sections) && me().sections.includes(s));
  const canOrders = () => can('orders') || can('crop') || can('clarify') || can('print') || can('audit');
  const K = {
    d: {}, uid: '', t: null,
    load(uid) { this.uid = uid; try { this.d = JSON.parse(localStorage.getItem('mm.cache.' + uid) || '{}') || {}; } catch { this.d = {}; } },
    get(k) { return this.d[k]; },
    set(k, v) { this.d[k] = v; clearTimeout(this.t); this.t = setTimeout(() => { try { localStorage.setItem('mm.cache.' + this.uid, JSON.stringify(this.d)); } catch {} }, 400); },
    clear() { this.d = {}; try { localStorage.removeItem('mm.cache.' + this.uid); } catch {} },
  };

  /* ---------- السيرفر ---------- */
  async function api(path, opt = {}) {
    const h = { 'content-type': 'application/json' };
    if (st.token) h['x-app-token'] = st.token;
    let r;
    try { r = await fetch(`${API}/${path}`, { method: opt.method || (opt.body ? 'POST' : 'GET'), headers: h, body: opt.body ? JSON.stringify(opt.body) : undefined, cache: 'no-store' }); }
    catch (e) { st.online = false; paintSync(); throw Object.assign(new Error('ما فيه اتصال بالإنترنت'), { code: 'OFFLINE' }); }
    if (!st.online) { st.online = true; paintSync(); }
    let j = {}; try { j = await r.json(); } catch {}
    if (r.status === 401 && st.token && !opt.noAuth) { logoutLocal(); throw Object.assign(new Error('انتهت جلستك — سجلي الدخول من جديد'), { code: 'NO_SESSION' }); }
    if (!r.ok) throw Object.assign(new Error((j.error && j.error.message) || 'صار خطأ، جربي مرة ثانية'), { code: (j.error && j.error.code) || 'HTTP' + r.status, status: r.status });
    return j;
  }
  const errText = (e) => (e && e.message) || String(e);

  /* ---------- أدوات الواجهة ---------- */
  let toastT = null;
  function hideToast() { $$('.toast').forEach((t) => t.remove()); clearTimeout(toastT); }
  function toast(msg, kind = '') { $$('.toast').forEach((t) => t.remove()); const t = document.createElement('div'); t.className = `toast ${kind}`; t.textContent = msg; document.body.appendChild(t); clearTimeout(toastT); toastT = setTimeout(() => t.remove(), 2600); }
  function sheet(html, opts = {}) {
    return new Promise((resolve) => {
      $$('.dim, .sheet').forEach((x) => x.remove());
      const dim = document.createElement('div'); dim.className = 'dim';
      const sh = document.createElement('div'); sh.className = 'sheet'; sh.innerHTML = `<div class="grab"></div>${html}`;
      const close = (v) => { dim.remove(); sh.remove(); resolve(v); };
      dim.onclick = () => close(null);
      sh.addEventListener('click', (e) => { const b = e.target.closest('[data-r]'); if (!b) return; const v = b.dataset.r; if (opts.collect) { const o = opts.collect(sh, v); if (o === false) return; close(o); } else close(v); });
      document.body.append(dim, sh);
      setTimeout(() => { const f = sh.querySelector('[autofocus]'); if (f) f.focus(); }, 60);
      if (opts.init) opts.init(sh, close);
    });
  }
  const confirmBox = (title, text, ok = 'إي', cls = 'p') => sheet(`<h3>${esc(title)}</h3><p>${text}</p><div class="two"><button class="btn ${cls}" data-r="ok" style="flex:1">${esc(ok)}</button><button class="btn" data-r="no" style="flex:1">لا</button></div>`).then((v) => v === 'ok');
  // تنبيه داخل التطبيق (رسالة جديدة في تواصل الفريق) — يطلع في أي صفحة
  function banner(title, text, href) {
    $$('.banner').forEach((b) => b.remove());
    const b = document.createElement('a'); b.className = 'banner'; b.href = '#' + PFX + href; b.innerHTML = `<span class="bi">${I.chat}</span><span class="bt"><b>${esc(title)}</b><small>${esc(text)}</small></span>`;
    b.onclick = () => b.remove();
    document.body.appendChild(b); setTimeout(() => b.classList.add('on'), 20); setTimeout(() => { b.classList.remove('on'); setTimeout(() => b.remove(), 400); }, 6000);
  }
  // صوت تنبيه قصير (ينفتح بعد أول لمسة — شرط المتصفح)
  let actx = null;
  document.addEventListener('pointerdown', () => { try { if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)(); if (actx.state === 'suspended') actx.resume(); } catch {} }, { passive: true });
  function ding() {
    try { if (!actx) return; const t0 = actx.currentTime; [[880, 0], [1175, .12]].forEach(([f, d]) => { const o = actx.createOscillator(), g = actx.createGain(); o.type = 'sine'; o.frequency.value = f; g.gain.setValueAtTime(0.0001, t0 + d); g.gain.exponentialRampToValueAtTime(.25, t0 + d + .02); g.gain.exponentialRampToValueAtTime(.0001, t0 + d + .35); o.connect(g).connect(actx.destination); o.start(t0 + d); o.stop(t0 + d + .4); }); } catch {}
    try { if (navigator.vibrate) navigator.vibrate([60, 40, 60]); } catch {}
  }

  /* ---------- شاشة البداية ---------- */
  const sp = { fill: $('#spFill'), ld: $('#spLd') };
  const spTo = (p, t) => { if (sp.fill) sp.fill.style.width = p + '%'; if (t && sp.ld) sp.ld.textContent = t; };
  function spDone() { spTo(100); setTimeout(() => { const s = $('#splash'); if (s) s.classList.add('gone'); }, 350); }

  /* ---------- التوجيه ---------- */
  // داخل المتجر = الصفحة انرسمت من boot.js/سنيبت سلة (MM_STORE) أو الدومين دومين المتجر؛ على رابط التطبيق الخاص (GitHub Pages / أوراكل /app/) لا
  const IN_STORE = !!window.MM_STORE || (/(^|\.)mayarmemories\.com$/i.test(location.hostname) && !/\/app\/?$/.test(location.pathname));
  const PFX = IN_STORE ? 'mmstaff/' : '';
  const go = (path, replace) => { if (replace) history.replaceState(null, '', '#' + PFX + path); else location.hash = '#' + PFX + path; if (replace) render(); };
  const back = () => { if (history.length > 1) history.back(); else go('home'); };
  function route() { return (location.hash || '#home').slice(1).replace(/^mmstaff\/?/, '').replace(/^\/+/, '') || 'home'; }
  const href = (p) => `#${PFX}${p}`;

  /* ---------- الرسم: تحديث في مكانه بدون مسح الصفحة (يحافظ على التمرير والكتابة) ---------- */
  function morph(a, b) {
    if (a.nodeType === 3) { if (a.nodeValue !== b.nodeValue) a.nodeValue = b.nodeValue; return; }
    if (a.nodeType !== 1) return;
    for (const at of [...a.attributes]) if (!b.hasAttribute(at.name)) a.removeAttribute(at.name);
    for (const at of [...b.attributes]) if (a.getAttribute(at.name) !== at.value) a.setAttribute(at.name, at.value);
    if (a.tagName === 'INPUT' || a.tagName === 'TEXTAREA') { if (document.activeElement !== a && a.value !== (b.value || '')) a.value = b.value || ''; return; }
    if (a.tagName === 'CANVAS' || a.tagName === 'IMG') return;
    const ac = [...a.childNodes], bc = [...b.childNodes];
    for (let i = 0; i < bc.length; i++) {
      const x = ac[i], y = bc[i];
      if (!x) { a.appendChild(y); continue; }
      if (x.nodeType !== y.nodeType || (x.nodeType === 1 && (x.tagName !== y.tagName || (x.dataset && y.dataset && x.dataset.key !== y.dataset.key)))) { a.replaceChild(y, x); continue; }
      morph(x, y);
    }
    for (let i = ac.length - 1; i >= bc.length; i--) if (ac[i] && ac[i].parentNode === a) ac[i].remove();
  }
  let cur = { key: '', html: '' };
  // key = هوية الصفحة؛ نفس المفتاح = تحديث في مكانه (يحافظ على التمرير)، مفتاح ثاني = صفحة جديدة (من فوق)
  function paint(html, key, keepScroll) {
    const app = $('#app');
    if (html === cur.html && key === cur.key) return false;
    const same = key === cur.key;
    const y = window.scrollY;
    if (same) { const tpl = document.createElement('div'); tpl.id = 'app'; tpl.innerHTML = html; morph(app, tpl); }
    else { app.innerHTML = html; }
    cur = { key, html };
    if (same || keepScroll) window.scrollTo(0, y); else window.scrollTo(0, 0);
    paintSync();
    return true;
  }
  // الأحداث بتفويض واحد (ما تضيع مع التحديث)
  let H = {};
  const on = (handlers) => { H = handlers || {}; };
  $('#app').addEventListener('click', (e) => {
    const bk = e.target.closest('[data-back]'); if (bk) { e.preventDefault(); return back(); }
    const hi = e.target.closest('[data-hide-install]'); if (hi) { store.set('installHid', '1'); return render(); }
    const el = e.target.closest('[data-act]'); if (!el || !H.click) return;
    const r = H.click(el.dataset.act, el, e); if (r === false) e.preventDefault();
  });
  $('#app').addEventListener('input', (e) => { if (H.input) H.input(e.target, e); });
  $('#app').addEventListener('keydown', (e) => { if (H.key) H.key(e.target, e); });
  if (PFX) document.addEventListener('click', (e) => { const a = e.target.closest('a[href^="#"]'); if (!a) return; const h = a.getAttribute('href').slice(1); if (/^mmstaff/.test(h)) return; e.preventDefault(); go(h); });

  const DOCK = [['home', I.home, 'الرئيسية'], ['orders', I.box, 'الطلبات'], ['team', I.chat, 'تواصل الفريق'], ['sections', I.grid, 'الأقسام']];
  function dock(cur2) {
    const h = K.get('home'); const n = { orders: (h && h.counts && h.counts.total) || 0, team: (h && h.unread) || 0 };
    return `<nav class="dock">${DOCK.map(([k, ic, t]) => `<a href="${href(k)}" class="${k === cur2 ? 'on' : ''}">${ic}${t}${n[k] ? `<span class="n">${fmt(n[k])}</span>` : ''}</a>`).join('')}</nav>`;
  }
  const top = (o) => `<div class="top">${o.back ? `<button class="bk" data-back>${I.back}</button>` : (o.sq || '')}<div class="ttl"><b>${o.title}</b>${o.sub ? `<small>${o.sub}</small>` : ''}</div>${o.right || ''}</div>`;
  const page = (inner, on2, cls = '') => `<div class="page ${cls}">${inner}</div>${on2 ? dock(on2) : ''}`;
  const empty = (ic, t) => `<div class="empty"><div class="ic">${ic}</div>${t}</div>`;
  const spinner = (title, on2) => page(top({ title, back: true }) + '<div class="spin"></div>', on2);
  function paintSync() {
    const old = $('.syncbar'); if (old) old.remove();
    if (!st.user) return;
    let txt = '', cls = '';
    if (!st.online) { txt = 'ما فيه اتصال بالإنترنت — تشوفين آخر نسخة محفوظة'; cls = 'red'; }
    else if (st.sync && st.sync.at) { const age = Date.now() - Date.parse(st.sync.at); if (age > 10 * 60000) { txt = `البرنامج مقفل على الكمبيوتر — آخر تحديث ${when(st.sync.at)}`; cls = 'warn'; } }
    else if (st.sync === null) { txt = 'بانتظار البرنامج — ما وصل منه شي بعد'; cls = 'warn'; }
    if (!txt) return;
    const b = document.createElement('div'); b.className = `syncbar ${cls}`; b.textContent = txt; document.body.appendChild(b);
  }
  function stopPolls() { st.polls.forEach(clearInterval); st.polls = []; }
  const poll = (fn, ms) => { st.polls.push(setInterval(() => { if (document.visibilityState === 'visible' && st.online !== false) fn(); }, ms)); };
  // صفحة من المخزن فوراً + تحديث بالخلفية (+ تكرار كل ms) — بدون أي شاشة تحميل لو عندنا نسخة
  async function view({ key, cacheKey, load, html, after, every, keep }) {
    const r0 = route();
    const draw = (data) => { paint(html(data), key, keep); if (after) after(data); };
    const cached = K.get(cacheKey);
    if (cached !== undefined) draw(cached); else paint(html(null), key);
    const refresh = async () => { try { const d = await load(); if (d === undefined) return; K.set(cacheKey, d); if (route() === r0) draw(d); } catch (e) { if (route() === r0 && cached === undefined) paint(html(null, e), key); } };
    await refresh();
    if (every) poll(() => { if (route() === r0 && !$('.sheet') && !$('.cf')) refresh(); }, every);
  }

  /* ---------- الدخول ---------- */
  function logoutLocal() { st.token = ''; st.user = null; store.set('token', null); K.clear(); stopPolls(); go('login', true); }
  const seeded = (s, salt) => { let h = 2166136261 ^ salt; for (const ch of String(s)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return ((h >>> 0) % 1000) / 1000; };
  function bubble(u, i) {
    const r = (k) => seeded(u.id, k);
    const size = u.role === 'admin' ? 100 : Math.round(104 + r(1) * 18);
    const dx = Math.round((r(2) - .5) * 18), dy = Math.round(-6 - r(3) * 10), dur = (5.2 + r(4) * 3).toFixed(2), delay = (-r(5) * 6).toFixed(2);
    const n = [...String(u.name || '').trim()].length; const fs = Math.round(size * (n <= 4 ? .21 : n <= 6 ? .18 : n <= 9 ? .15 : .12));
    return `<button class="bub ${u.role === 'admin' ? 'adm' : ''}" data-act="pick" data-u="${esc(u.id)}" style="${orbStyle(u)};--s:${size}px;--dx:${dx}px;--dy:${dy}px;--dur:${dur}s;--delay:${delay}s;--i:${i};--fs:${fs}px"><span class="pop"><span class="orb">${u.role === 'admin' ? `<span class="crown">${I.crown}<b>${esc(u.name)}</b></span>` : `<b>${esc(u.name)}</b>`}</span></span></button>`;
  }
  async function vLogin() {
    on({ click: (a, el) => { if (a === 'pick') vPin((K.get('users') || st.users || []).find((u) => u.id === el.dataset.u)); if (a === 'retry') vLogin(); } });
    const html = (users, err) => `<div class="gate"><div class="glogo"><img src="${ASSETS}/icons/logo.png" alt=""/></div>${users === null ? (err ? empty('📡', esc(errText(err))) + '<div style="padding:0 40px"><button class="btn" data-act="retry">جربي مرة ثانية</button></div>' : '<div class="spin"></div>') : users.length ? `<div class="bubbles">${[...users].sort((a, b) => (a.role === 'admin' ? 1 : 0) - (b.role === 'admin' ? 1 : 0)).map(bubble).join('')}</div>` : empty('👩‍💻', 'ما فيه حسابات بعد<br/>افتحي البرنامج على الكمبيوتر وشغلي «تطبيق الجوال» من الإعدادات')}</div>`;
    let users = K.get('users'); if (!users) { try { users = JSON.parse(store.get('users') || 'null'); } catch { users = null; } }
    paint(html(users || null), 'login');
    try { const r = await api('app/users', { noAuth: true }); st.users = r.users || []; store.set('users', JSON.stringify(st.users)); K.set('users', st.users); if (route() === 'login' || !st.user) paint(html(st.users), 'login'); }
    catch (e) { if (!users) paint(html(null, e), 'login'); }
  }
  function vPin(u) {
    if (!u) return;
    let pin = '';
    const html = `<div class="gate pin"><div class="glogo"><img src="${ASSETS}/icons/logo.png" alt=""/></div><div class="pass"><span class="orb sm2 ${u.role === 'admin' ? 'adm' : ''}" style="${orbStyle(u)}">${u.role === 'admin' ? I.crown : esc((u.name || '').slice(0, 2))}</span><h2>${esc(u.name)}</h2><div class="gp">${u.has_pin ? 'اكتبي رقمك السري' : 'ما لك رقم سري بعد — تحطه المديرة من البرنامج'}</div><div class="dots" id="dots">${'<i></i>'.repeat(6)}</div><div class="gerr" id="gerr"></div></div><div class="pad" id="pad">${['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => `<button data-act="d" data-d="${d}">${d}</button>`).join('')}<button class="x" data-act="back">رجوع</button><button data-act="d" data-d="0">0</button><button class="x" data-act="del">${I.undo}</button></div><div class="gfoot"><button class="go" id="goIn" data-act="go" style="visibility:hidden">دخول</button></div></div>`;
    paint(html, 'pin');
    const paintDots = () => { $$('#dots i').forEach((d, i) => d.classList.toggle('on', i < pin.length)); const g = $('#goIn'); if (g) g.style.visibility = pin.length >= 4 ? 'visible' : 'hidden'; };
    const submit = async () => {
      if (pin.length < 4) { $('#gerr').textContent = 'الرقم السري 4 أرقام على الأقل'; return; }
      $('#gerr').textContent = '';
      try {
        const r = await api('app/login', { body: { user_id: u.id, pin }, noAuth: true });
        st.token = r.token; store.set('token', r.token); st.user = r.user; K.load(r.user.id);
        await boot(true);
      } catch (e) { $('#gerr').textContent = errText(e); pin = ''; paintDots(); const p = $('.pass'); if (p) { p.classList.remove('shake'); void p.offsetWidth; p.classList.add('shake'); } }
    };
    on({ click: (a, el) => { if (a === 'back') return vLogin(); if (a === 'del') { pin = pin.slice(0, -1); paintDots(); return; } if (a === 'go') return submit(); if (a === 'd' && pin.length < 8) { pin += el.dataset.d; paintDots(); } } });
  }

  /* ---------- الرئيسية (الترحيب مثل البرنامج) ---------- */
  const tile = (k, ic, t, href2, bdg) => `<a class="tile" href="${href(href2)}"><span class="ic" style="background:${P[k][0]};color:${P[k][1]}">${ic}</span><b>${t}</b>${bdg ? `<span class="bdg">${bdg}</span>` : ''}</a>`;
  const wide = (k, ic, t, sub, bdg, href2) => `<a class="tile wide" href="${href(href2)}"><span class="ic" style="background:${P[k][0]};color:${P[k][1]}">${ic}</span><span><b>${t}</b>${sub ? `<br/><small>${sub}</small>` : ''}</span>${bdg ? `<span class="bdg">${bdg}</span>` : ''}</a>`;
  async function loadHome() { const h = await api('app/home'); st.sync = h.sync; st.settings = h.settings || st.settings; if (h.user) st.user = h.user; noticeCheck(h); return h; }
  function vHome() {
    const u = me(); const hr = new Date().getHours();
    on({});
    return view({ key: 'home', cacheKey: 'home', load: loadHome, every: 30000, html: (h) => {
      const unread = (h && h.unread) || 0;
      return page(`
        <div class="brandbar"><img src="${ASSETS}/icons/logo.png" alt=""/></div>
        <div class="greet"><span class="kick">${hr < 12 ? 'صباح الإنتاج <i>☀️</i>' : 'مساء الإنتاج <i>🌙</i>'}</span><h1>حياك الله، <span>${esc(u.name || '')}</span> <i>✨</i></h1><p>بارك الله لك في سعيك ورزقك <i>🤍</i></p><span class="art"><i></i><i></i><i></i></span></div>
        ${can('team') ? `<div class="tiles">${wide('team', I.chat, 'تواصل الفريق', unread ? `${fmt(unread)} ${unread === 1 ? 'محادثة جديدة' : 'محادثات جديدة'}` : '', unread ? fmt(unread) : '', 'team')}</div>` : ''}
        ${!isAdmin() && workTiles(false).length ? `<div class="sec">أقسامك</div><div class="tiles c3">${workTiles(false).join('')}</div>` : ''}
        ${can('depts') || can('review') ? `<div class="sec">المتابعة</div><div class="tiles">${can('depts') ? tile('dept', I.truck, 'تتبع الطلبات', 'depts') : ''}${can('review') ? tile('rev', I.review, 'مراجعة إنجاز الموظفات', 'review') : ''}</div>` : ''}
        ${isAdmin() ? `<div class="sec">الإدارة</div><div class="tiles">${tile('acc', I.users, 'إدارة الحسابات', 'accounts')}${tile('sec', I.gear, 'الإعدادات', 'settings')}</div>` : ''}
        ${installHint()}`, 'home');
    } });
  }
  function installHint() {
    const ios = /iphone|ipad/i.test(navigator.userAgent); const standalone = window.navigator.standalone || matchMedia('(display-mode: standalone)').matches;
    if (standalone || store.get('installHid')) return '';
    return `<div class="install"><b>📲 حطيه على الشاشة الرئيسية</b>${ios ? 'من سفاري: زر المشاركة ⬆︎ ثم «إضافة إلى الشاشة الرئيسية» — يفتح مثل التطبيق باسم MayarMemories.' : 'من قائمة المتصفح ⋮ اختاري «إضافة إلى الشاشة الرئيسية» (أو «تثبيت التطبيق»).'}<button class="btn ghost sm" data-hide-install style="margin:4px 0 0">تمام، فهمت</button></div>`;
  }

  /* ---------- الطلبات ---------- */
  const ST = { 1: ['بانتظار صور العميلة', 'pk'], 8: ['قسم الدفع', 'pk'], 9: ['الطلبات الناقصة', 'pk'], 2: ['الفرز', 'pk'], 3: ['القص', 'aq'], 4: ['التوضيح', 'aq'], 10: ['تدقيق التوضيح', 'aq'], 5: ['الطباعة', 'aq'], 6: ['التدقيق والمطابقة', 'aq'], 7: ['جاري التوصيل', 'aq'] };
  const STAGE_CHIP = { 1: 'pk', 8: 'u', 9: 'x', 2: 'b', 3: 'm', 4: 'v', 10: 'v', 5: 'u', 6: 'u', 7: 'g' };
  const STAGE_ICON = { 1: I.wa, 8: I.pay, 9: I.flash, 2: I.sort, 3: I.cut, 4: I.spark, 10: I.spark, 5: I.print, 6: I.puzzle, 7: I.truck };
  const WA_TABS = [1, 8, 9, 2, 3, 4, 10, 5, 6, 7];
  const SITE_PRE = [['await', 'بانتظار العميلة رفع الصور'], ['uploading', 'قيد الرفع'], ['pulled', 'تم السحب']];
  const SITE_TABS = [3, 4, 10, 5, 6, 7];
  const siteTabOf = (o) => o.pre === 'await' ? 'await' : o.pre === 'uploading' || o.pre === 'ready' ? 'uploading' : o.stage != null && [1, 8, 9, 2].includes(Number(o.stage)) ? 'pulled' : o.stage != null ? String(o.stage) : 'pulled';
  const stageLabel = (o) => o.pre === 'await' ? 'بانتظار العميلة' : o.pre === 'uploading' ? 'قيد الرفع' : o.pre === 'ready' ? (o.phoneCrop && o.phoneCrop.state === 'wait' ? 'جاهز للقص' : o.phoneCrop && o.phoneCrop.state === 'done' ? 'انقص — ينتظر السحب' : 'اكتمل الرفع') : (ST[o.stage] ? ST[o.stage][0] : o.statusLabel || '');
  const stageCls = (o) => o.pre === 'await' ? 'gr' : o.pre === 'uploading' ? 'b' : o.pre === 'ready' ? (o.phoneCrop && o.phoneCrop.state === 'wait' ? 'm' : 'g') : (STAGE_CHIP[o.stage] || '');
  const stageIcon = (o) => o.pre === 'await' ? I.clock : o.pre === 'uploading' ? I.cloud : o.pre === 'ready' ? I.cut : (STAGE_ICON[o.stage] || I.box);
  // أسماء المنتجات المختصرة (طلب المالكة ٧): كل منتج في شريحة لحاله
  const SHORT = [[/مغناط/, 'صور مغناطيسية', 'm'], [/ملصق/, 'ملصقات', 'v'], [/ميدالي/, 'ميني ألبوم', 'u'], [/إطار|اطار|لوحة|جداري/, 'إطارات', 'b'], [/مخمل|أرنب|ارنب|طباعة|ألبوم|البوم|ورق|صور/, 'طباعة ورقية', 'pk']];
  function shortName(label) { for (const [re, s, c] of SHORT) if (re.test(String(label || ''))) return [s, c]; return [String(label || ''), 'gr']; }
  function prodList(o) { const m = new Map(); for (const p of (o.products || o.lines || [])) { const [s, c] = shortName(p.label); const x = m.get(s) || { s, c, n: 0 }; x.n += Number(p.n) || 0; m.set(s, x); } return [...m.values()]; }
  const prodChips = (o, max = 4) => { const l = prodList(o); return l.length ? `<div class="prods">${l.slice(0, max).map((x) => `<span class="pc ${x.c}">${I.tag}${esc(x.s)}${x.n ? `<em>${fmt(x.n)}</em>` : ''}</span>`).join('')}${l.length > max ? `<span class="pc gr">+${fmt(l.length - max)}</span>` : ''}</div>` : ''; };
  const prodTxt = (o) => prodList(o).map((x) => `${x.s}${x.n ? ` · ${phN(x.n)}` : ''}`).join(' + ');
  function flagsHtml(o) {
    const f = [];
    if (o.urgent) f.push('<span class="urg">⚡ مستعجل</span>');
    if (o.hold) f.push('<span class="hold">⛔ موقوف</span>');
    if (o.late && (o.late.level === 'alert' || o.late.level === 'urgent')) f.push(`<span class="late">⏰ ${o.late.level === 'alert' ? 'متأخر جداً' : 'متأخر'}</span>`);
    if (o.dup && o.dup.n) f.push(`<span class="dup">صور مكررة ${fmt(o.dup.n)}</span>`);
    if (o.old) f.push('<span class="old">عميلة سابقة</span>');
    if (o.flags && o.flags.site && o.src !== 'site') f.push('<span class="site">🌐 الموقع</span>');
    if (o.notes && o.notes.length) f.push(`<span>📝 ${o.notes.length === 1 ? 'ملاحظة' : `${fmt(o.notes.length)} ملاحظات`}</span>`);
    if (o.pending && o.pending.length) f.push(`<span class="pend">⏳ ${o.pending.length === 1 ? 'أمر ينتظر البرنامج' : `${fmt(o.pending.length)} أوامر`}</span>`);
    if (o.cropClaim && o.cropClaim.by) f.push(`<span class="claim">✂ معها ${esc(o.cropClaim.by)}</span>`);
    return f.length ? `<div class="flags">${f.join('')}</div>` : '';
  }
  // صف الطلب — مثل طلبات سلة: الاسم ثم الرقم، الحالة بأيقونة، كل منتج شريحة لحاله، بدون دائرة الحرف
  function orderRow(o, extra = '') {
    const name = o.name || 'عميلة';
    const up = o.pre === 'uploading' && o.need ? `<div class="bar"><i style="width:${Math.min(100, Math.round(100 * (o.got || 0) / o.need))}%"></i></div><small class="upl">رفعت <i>${fmt(o.got)} من ${fmt(o.need)}</i></small>` : o.pre === 'await' && o.need ? `<small class="upl">${phN(o.need)} مطلوبة</small>` : '';
    const pc = o.phoneCrop && o.phoneCrop.state === 'wait' && o.phoneCrop.cropped ? `<small class="upl">انقص <i>${fmt(o.phoneCrop.cropped)} من ${fmt(o.phoneCrop.total)}</i></small>` : '';
    return `<a class="orow" data-key="${esc(o.no)}" href="${href(`order/${encodeURIComponent(o.no)}`)}">${extra}<div class="oh"><b>${esc(name)}</b><time>${esc(ago(o.stage_at || o.created_at))}</time></div><div class="on">#${esc(o.no)}${o.src === 'site' || (o.flags && o.flags.site) ? '<i>🌐</i>' : ''}</div><div class="ost"><span class="stc ${stageCls(o)}">${stageIcon(o)}${esc(stageLabel(o))}</span>${prodChips(o)}</div>${up}${pc}${flagsHtml(o)}</a>`;
  }
  async function loadOrders(src) { const r = await api(`app/orders?src=${src}`); st.sync = r.sync; st.settings = r.settings || st.settings; return r.orders || []; }
  const ordersOf = (src) => K.get('orders.' + src) || [];
  function vOrders(src, tab) {
    src = src === 'wa' ? 'wa' : 'site';
    if (tab) st.tab[src] = tab;
    if (!canOrders()) { on({}); return paint(page(top({ title: 'الطلبات', sq: sq('rose', I.box) }) + empty('🔒', 'ما عندك صلاحية الطلبات'), 'orders'), 'orders'); }
    on({
      click: (a, el) => { if (a === 'tab') { st.tab[src] = el.dataset.tab; history.replaceState(null, '', `#${PFX}orders/${src}/${el.dataset.tab}`); redraw(); } if (a === 'src') go(`orders/${el.dataset.src}`); if (a === 'reload') { el.style.opacity = '.5'; Promise.all([loadOrders('wa'), loadOrders('site')]).then(([w, s]) => { K.set('orders.wa', w); K.set('orders.site', s); redraw(); toast('✓ تحدثت', 'ok'); }).catch((e) => toast(errText(e), 'err')); } },
      input: (t) => { if (t.id === 'q') { st.q = t.value; clearTimeout(st.qT); st.qT = setTimeout(redraw, 180); } },
    });
    const html = (list) => {
      list = list || [];
      const q = st.q.trim().toLowerCase(); const cur2 = st.tab[src] || 'all';
      const counts = {}; for (const o of list) { const k = src === 'wa' ? String(o.stage) : siteTabOf(o); counts[k] = (counts[k] || 0) + 1; }
      const tabs = src === 'wa' ? [['all', 'الكل', '', list.length], ...WA_TABS.map((n) => [String(n), ST[n][0], ST[n][1], counts[String(n)] || 0])] : [['all', 'الكل', '', list.length], ...SITE_PRE.map(([k, l]) => [k, l, 'pk', counts[k] || 0]), ...SITE_TABS.map((n) => [String(n), ST[n][0], 'aq', counts[String(n)] || 0])];
      let rows = list.filter((o) => cur2 === 'all' || (src === 'wa' ? String(o.stage) === cur2 : siteTabOf(o) === cur2));
      if (q) rows = rows.filter((o) => String(o.no).includes(q) || String(o.name || '').toLowerCase().includes(q));
      const strip = `<div class="strip">${tabs.map(([k, l, c, n]) => `<button data-act="tab" data-tab="${k}" class="${c} ${cur2 === k ? 'on' : ''}">${l}<b>${fmt(n)}</b></button>`).join('')}</div>`;
      return page(top({ title: 'الطلبات', sub: `${fmt(ordersOf('site').length)} الموقع · ${fmt(ordersOf('wa').length)} واتساب`, sq: sq('rose', I.box), right: `<button class="act" data-act="reload">${I.refresh}</button>` }) + `
        <div class="seg"><button data-act="src" data-src="site" class="${src === 'site' ? 'on aq' : ''}">${I.cloud} طلبات الموقع</button><button data-act="src" data-src="wa" class="${src === 'wa' ? 'on' : ''}">${I.wa} طلبات الواتساب</button></div>
        <div class="search">${I.search}<input id="q" placeholder="ابحثي برقم الطلب أو اسم العميلة" value="${esc(st.q)}"/></div>
        ${strip}
        ${src === 'site' && st.settings.phoneCrop && cur2 === 'uploading' ? '<div class="note aq">الطلبات اللي اكتمل رفعها جاهزة للقص — تلقينها في «قسم القص» (الجوال والكمبيوتر)</div>' : ''}
        <div class="olist">${rows.length ? rows.map((o) => orderRow(o)).join('') : empty('🌸', q ? 'ما لقينا طلب بهالبحث' : (list.length ? 'ما فيه طلبات هنا' : 'ما وصلت طلبات بعد'))}</div>`, 'orders');
    };
    const redraw = () => { paint(html(ordersOf(src)), 'orders.' + src, true); const sc = $('.strip'); const on2 = sc && sc.querySelector('.on'); if (sc && on2 && !sc.dataset.scrolled) { sc.scrollLeft = on2.offsetLeft - sc.clientWidth / 2 + on2.clientWidth / 2; sc.dataset.scrolled = '1'; } };
    const other = src === 'wa' ? 'site' : 'wa';
    if (!K.get('orders.' + other)) loadOrders(other).then((l) => K.set('orders.' + other, l)).catch(() => {});
    return view({ key: 'orders.' + src, cacheKey: 'orders.' + src, load: () => loadOrders(src), every: 30000, keep: true, html, after: () => { const sc = $('.strip'); const on2 = sc && sc.querySelector('.on'); if (sc && on2 && !sc.dataset.scrolled) { sc.scrollLeft = on2.offsetLeft - sc.clientWidth / 2 + on2.clientWidth / 2; sc.dataset.scrolled = '1'; } } });
  }

  /* ---------- صفحة الطلب ---------- */
  const factsHtml = (o) => {
    const f = Array.isArray(o.facts) && o.facts.length ? o.facts.filter((x) => x.k !== 'المنتج') : [['عدد الصور', o.need ? `${phN(o.need)}${o.sent != null && o.sent !== o.need ? ` (وصلت ${fmt(o.sent)})` : ''}` : '']].filter((x) => x[1]).map(([k, v]) => ({ k, v }));
    return f.length ? `<div class="facts">${f.map((x) => `<div>${esc(x.k)}<b>${esc(x.v)}</b></div>`).join('')}</div>` : '';
  };
  const CMD_TXT = { note: 'إضافة ملاحظة', urgent: 'تصنيف مستعجل', move: 'نقل الطلب', hold: 'توقيف الطلب', release: 'استئناف الطلب', assign: 'تحويل لموظفة', resend_link: 'إعادة رابط الرفع', pc_crop: 'القص على الكمبيوتر', addon_create: 'إضافة صور على الطلب' };
  const findOrder = (no) => [...ordersOf('wa'), ...ordersOf('site')].find((o) => String(o.no) === String(no));
  function vOrder(no) {
    const key = 'order.' + no;
    on({ click: (a, el) => { if (a === 'cmd') { const d = K.get(key); const o = (d && d.order) || findOrder(no); if (o) orderAction(o, el.dataset.cmd, el.dataset.task === '1', d && d.site); } if (a === 'log') { st.logOpen[no] = !st.logOpen[no]; paint(html(K.get(key)), key, true); } if (a === 'copy') { copyText(el.dataset.v); } } });
    const html = (d, err) => {
      const o = (d && d.order) || findOrder(no);
      if (!o) return err ? page(top({ title: `الطلب #${esc(no)}`, back: true }) + empty('📡', esc(errText(err))), 'orders') : spinner(`الطلب #${esc(no)}`, 'orders');
      const site = d && d.site; const cmds = (d && d.cmds) || [];
      const name = o.name || 'عميلة';
      const chips = [];
      if (o.old) chips.push('<span class="pink">عميلة سابقة</span>');
      if (o.shield) chips.push(`<span class="${o.shield.ok ? 'ok' : 'warn'}">🛡 ${esc(o.shield.text || (o.shield.ok ? 'الملفات سليمة' : 'فيه ملاحظة على الملفات'))}</span>`);
      if (o.urgent) chips.push(`<span class="warn">⚡ مستعجل${o.urgent.by ? ` · ${esc(o.urgent.by)}` : ''}</span>`);
      if (o.hold) chips.push(`<span class="red">⛔ موقوف${o.hold.reason ? `: ${esc(o.hold.reason)}` : ''}</span>`);
      if (o.late && o.late.level) chips.push(`<span class="red">⏰ ${o.late.level === 'alert' ? 'متأخر جداً' : 'متأخر'}${o.late.days ? ` · ${fmt(o.late.days)} يوم` : ''}</span>`);
      if (o.cropClaim && o.cropClaim.by) chips.push(`<span class="warn">✂ معها ${esc(o.cropClaim.by)}</span>`);
      const pend = (o.pending || []).map((p) => `<li><time>${esc(when(p.at))}</time><span>⏳ <b>${esc(p.by)}</b> ${esc(CMD_TXT[p.type] || p.type)} — ينتظر البرنامج</span></li>`).join('');
      const done = cmds.filter((c) => c.state === 'done' || c.state === 'failed').slice(0, 6).map((c) => `<li><time>${esc(when(c.done_at || c.at))}</time><span>${c.state === 'done' ? '✓' : '✗'} <b>${esc(c.by_name)}</b> ${esc(CMD_TXT[c.type] || c.type)}${c.result ? ` — ${linkify(c.result)}` : ''}</span></li>`).join('');
      const notes = (o.notes || []).map((n) => `<div class="card nt"><h3>📝 ملاحظة${n.by ? ` — ${esc(n.by)}` : ''}${n.at ? ` · ${esc(when(n.at))}` : ''}</h3><div class="nb">${esc(n.text)}</div></div>`).join('');
      const log = (o.log || []);
      const inSuite = o.stage != null;
      const isSite = o.src === 'site' || (o.flags && o.flags.site);
      const siteBox = site ? `<div class="card"><h3>🌐 الموقع</h3><div class="facts"><div>الرفع<b>${esc(site.photo_state === 'awaiting' ? 'بانتظار العميلة' : site.photo_state === 'uploading' ? `قيد الرفع — ${fmt(site.got)} صورة` : site.photo_state === 'approved' ? 'اكتمل' : 'انسحب للبرنامج')}</b></div>${site.link ? `<div>رابط الرفع<b>${esc(site.link.state === 'open' ? 'مفتوح' : site.link.state === 'locked' ? 'مقفل' : 'منتهي')}${site.link.opens ? ` · فتحته ${fmt(site.link.opens)}` : ''}</b></div>` : ''}${site.phoneCrop ? `<div>القص<b>${esc(site.phoneCrop.state === 'wait' ? `جاهز للقص (${fmt(site.phoneCrop.cropped)}/${fmt(site.phoneCrop.total)})` : site.phoneCrop.state === 'done' ? `انقص — ${esc(site.phoneCrop.by)}` : site.phoneCrop.state === 'self' ? 'العميلة قصت بنفسها' : site.phoneCrop.state === 'pc' ? 'على الكمبيوتر' : 'مطفي')}</b></div>` : ''}${site.created_at ? `<div>الطلب<b>${esc(since(site.created_at))}</b></div>` : ''}</div>${site.phoneCrop && site.phoneCrop.state === 'wait' && can('crop') ? `<div class="two" style="margin-top:10px"><a class="btn aq sm" href="${href(`crop/${esc(site.id)}`)}" style="flex:1">✂ اقصيه الحين</a>${isAdmin() ? '<button class="btn sm" data-act="cmd" data-cmd="pc_crop" style="flex:1">على الكمبيوتر</button>' : ''}</div>` : ''}</div>` : '';
      const extras = (o.siteAddons || []).filter((a) => a.url).map((a) => `<div class="card ex"><h3>➕ صور إضافية${a.ref ? ` — #${esc(a.ref)}` : ''}</h3><p class="exs">${esc(a.text || '')}${a.hasNew && a.shelf ? ` · رف ${fmt(a.shelf)}` : ''}${a.by ? ` · ${esc(a.by)}` : ''}${a.at ? ` · ${esc(when(a.at))}` : ''}</p><div class="exl"><button class="btn sm" data-act="copy" data-v="${esc(a.url)}">${I.copy} نسخ الرابط</button>${o.mobile ? `<a class="btn sm wa" href="${waLink(o.mobile, addonMsg(o, a.url))}" target="_blank" rel="noopener">${I.wa} واتساب العميلة</a>` : ''}</div></div>`).join('');
      const acts = inSuite ? `<div class="acts">
          <button data-act="cmd" data-cmd="note"><span class="ic" style="background:${P.sec[0]};color:${P.sec[1]}">${I.note}</span>إضافة ملاحظة</button>
          <button data-act="cmd" data-cmd="urgent"><span class="ic" style="background:${P.dept[0]};color:${P.dept[1]}">${I.flash}</span>${o.urgent ? 'إلغاء المستعجل' : 'مستعجل'}</button>
          <button data-act="cmd" data-cmd="move"><span class="ic" style="background:${P.aqua[0]};color:${P.aqua[1]}">${I.move}</span>نقل الطلب</button>
          <button data-act="cmd" data-cmd="${o.hold ? 'release' : 'hold'}"><span class="ic" style="background:${P.red[0]};color:${P.red[1]}">${o.hold ? I.play : I.stop}</span>${o.hold ? 'استئناف' : 'توقيف'}</button>
          <button data-act="cmd" data-cmd="assign"><span class="ic" style="background:${P.team[0]};color:${P.team[1]}">${I.users}</span>تحويل لموظفة</button>
          ${isSite && !(o.flags && o.flags.manual) ? `<button data-act="cmd" data-cmd="extra"><span class="ic" style="background:${P.fin[0]};color:${P.fin[1]}">${I.plus}</span>إضافة صور</button>` : ''}
          ${isSite ? `<button data-act="cmd" data-cmd="resend_link"><span class="ic" style="background:${P.site[0]};color:${P.site[1]}">${I.link}</span>إعادة الرابط</button>` : ''}
          <button data-act="cmd" data-cmd="assign" data-task="1"><span class="ic" style="background:${P.rev[0]};color:${P.rev[1]}">${I.review}</span>مهمة للفريق</button>
          ${o.mobile ? `<a class="wa" href="${waLink(o.mobile, '')}" target="_blank" rel="noopener"><span class="ic" style="background:#e6f6ec;color:#2f9e63">${I.wa}</span>واتساب العميلة</a>` : ''}
        </div>` : `<div class="note">الطلب لسه ما وصل البرنامج — الإجراءات تصير بعد ما البرنامج يسحبه</div>${o.mobile ? `<a class="btn sm wa" href="${waLink(o.mobile, '')}" target="_blank" rel="noopener">${I.wa} واتساب العميلة</a>` : ''}`;
      return page(top({ title: `الطلب #${esc(no)}`, sub: `${isSite ? 'طلب موقع' : 'طلب واتساب'}${o.stage_at ? ` · ${esc(since(o.stage_at))}` : ''}`, back: true, right: `<span class="stc ${stageCls(o)}">${stageIcon(o)}${esc(stageLabel(o))}</span>` }) + `
        <div class="card hero"><b class="hn">${esc(name)}</b>${chips.length ? `<div class="mchips">${chips.join('')}</div>` : ''}${prodChips(o, 8)}</div>
        ${factsHtml(o) ? `<div class="card"><h3>تفاصيل الطلب</h3>${factsHtml(o)}</div>` : ''}
        ${notes}
        ${extras}
        ${siteBox}
        ${acts}
        ${pend || done ? `<div class="card" style="margin-top:10px"><h3>أوامر الجوال</h3><ul class="log">${pend}${done}</ul></div>` : ''}
        ${log.length ? `<div class="card logc"><button class="logt" data-act="log"><span>سجل الطلب</span><em>${fmt(log.length)}</em>${st.logOpen[no] ? I.up : I.down}</button>${st.logOpen[no] ? `<ul class="log">${log.map((l) => `<li><time>${esc(when(l.at))}</time><span>${esc(l.text || '')}</span></li>`).join('')}</ul>` : ''}</div>` : ''}`, 'orders');
    };
    return view({ key, cacheKey: key, load: () => api(`app/orders/${encodeURIComponent(no)}`), every: 20000, keep: true, html });
  }
  const linkify = (s) => esc(s).replace(/(https?:\/\/[^\s<]+)/g, (u) => `<a href="${u}" target="_blank" rel="noopener" style="color:var(--aqua3);text-decoration:underline">${u}</a>`);
  const waLink = (mobile, text) => { const d = String(mobile || '').replace(/\D/g, '').replace(/^0/, '966'); return `https://wa.me/${d.startsWith('966') ? d : '966' + d}${text ? `?text=${encodeURIComponent(text)}` : ''}`; };
  // نفس رسالة البرنامج («إضافة صور على الطلب») — الموظفة ترسلها بنفسها من الواتساب
  const addonMsg = (o, url) => `هلا والله ${o.name || ''} 🌷\nهذا رابط رفع الصور الإضافية لطلبك رقم ${o.no}:\n${url}\n\nافتحيه واكتبي رقم جوالك، وارفعي صورك، ويطلع لك العدد والمبلغ 💗\nالرابط شغال ٧ أيام. ولو صار فيه أي شي، كلمينا هنا 🫶🏻`;
  async function copyText(v) { try { await navigator.clipboard.writeText(v); toast('✓ انسخ الرابط', 'ok'); } catch { toast('ما قدرنا ننسخ — اضغطي مطولاً على الرابط', 'err'); } }
  async function sendCmd(no, body, okMsg) {
    try { const r = await api(`app/orders/${encodeURIComponent(no)}/cmd`, { body }); toast(r.done ? '✓ تم' : (okMsg || '✓ وصل الأمر — البرنامج ينفذه خلال دقيقة'), 'ok'); const key = 'order.' + no; const d = K.get(key); if (d && d.order && !r.done) { d.order.pending = [...(d.order.pending || []), { id: r.cmd && r.cmd.id, type: body.type, at: new Date().toISOString(), by: me().name, payload: body }]; K.set(key, d); } return r; }
    catch (e) { toast(errText(e), 'err'); return null; }
  }
  async function orderAction(o, type, task, site) {
    const no = o.no;
    const refresh = () => { if (route() === `order/${encodeURIComponent(no)}`) vOrder(no); };
    if (type === 'note') {
      const v = await sheet(`<h3>إضافة ملاحظة</h3><p>تطلع على صفحة الطلب في البرنامج وللموظفات</p><div class="field"><textarea class="in" id="nt" placeholder="اكتبي الملاحظة…" autofocus></textarea></div><button class="btn p" data-r="ok">حفظ الملاحظة</button><button class="btn ghost" data-r="x">إلغاء</button>`, { collect: (sh, r) => r === 'ok' ? { text: $('#nt', sh).value.trim() } : null });
      if (v && v.text) { await sendCmd(no, { type: 'note', text: v.text }); return refresh(); }
      if (v && !v.text) toast('اكتبي الملاحظة', 'err');
      return;
    }
    if (type === 'urgent') {
      if (o.urgent) { if (await confirmBox('إلغاء التصنيف المستعجل؟', 'يرجع الطلب عادي في كل الأقسام')) { await sendCmd(no, { type: 'urgent', on: false }); refresh(); } return; }
      const v = await sheet(`<h3>⚡ تصنيف مستعجل</h3><p>يطلع عليه «مستعجل» في كل الأقسام ويتقدم في القوائم</p><div class="field"><input class="in" id="un" placeholder="سبب الاستعجال (اختياري)"/></div><button class="btn p" data-r="ok">إي، مستعجل</button><button class="btn ghost" data-r="x">إلغاء</button>`, { collect: (sh, r) => r === 'ok' ? { note: $('#un', sh).value.trim() } : null });
      if (v) { await sendCmd(no, { type: 'urgent', on: true, note: v.note }); refresh(); }
      return;
    }
    if (type === 'move') {
      const ms = o.moveStep || {};
      const v = await sheet(`<h3>نقل الطلب</h3><p>الطلب الحين في <b>${esc(stageLabel(o))}</b>. وين تبين تنقلينه؟</p><div class="two"><button class="btn" data-r="back" style="flex:1" ${ms.back === null ? 'disabled' : ''}>◀ السابق${ms.back && ms.back.label ? `: ${esc(ms.back.label)}` : ''}</button><button class="btn p" data-r="next" style="flex:1" ${ms.next === null ? 'disabled' : ''}>التالي${ms.next && ms.next.label ? `: ${esc(ms.next.label)}` : ''} ▶</button></div><div class="field" style="margin-top:12px"><label>سبب النقل (اختياري)</label><input class="in" id="mr" placeholder="مثال: الصور انقصت على الكمبيوتر"/></div><button class="btn ghost" data-r="x">إلغاء</button>`, { collect: (sh, r) => r === 'back' || r === 'next' ? { dir: r, reason: $('#mr', sh).value.trim() } : null });
      if (v) { await sendCmd(no, { type: 'move', dir: v.dir, reason: v.reason }); refresh(); }
      return;
    }
    if (type === 'hold') {
      const v = await sheet(`<h3>⛔ توقيف الطلب</h3><p>يوقف في قسمه ولا ينتقل ولا يُشحن لين تستأنفينه</p><div class="field"><input class="in" id="hr" placeholder="سبب التوقيف (لازم)" autofocus/></div><button class="btn red" data-r="ok">توقيف</button><button class="btn ghost" data-r="x">إلغاء</button>`, { collect: (sh, r) => r === 'ok' ? { reason: $('#hr', sh).value.trim() } : null });
      if (v && v.reason) { await sendCmd(no, { type: 'hold', reason: v.reason }); return refresh(); }
      if (v) toast('اكتبي سبب التوقيف', 'err');
      return;
    }
    if (type === 'release') { if (await confirmBox('استئناف الطلب؟', 'يرجع يكمل من مكانه', 'إي، استأنفيه')) { await sendCmd(no, { type: 'release' }); refresh(); } return; }
    if (type === 'assign') {
      const users = await usersList();
      const v = await sheet(`<h3>${task ? '📝 مهمة للفريق' : '👩 تحويل لموظفة'}</h3><p>تطلع لها في «تواصل الفريق» مربوطة بهالطلب</p><div class="field"><label>لمين؟</label><div class="pick" id="pk">${users.filter((u) => u.id !== me().id).map((u) => `<button data-u="${esc(u.id)}" data-n="${esc(u.name)}">${esc(u.name)}</button>`).join('')}</div></div><div class="field"><textarea class="in" id="an" placeholder="وش المطلوب؟"></textarea></div><div class="perm"><span>⚡ مستعجل</span><button class="tg" id="au"></button></div><button class="btn p" data-r="ok">إرسال</button><button class="btn ghost" data-r="x">إلغاء</button>`, { init: (sh) => { $('#pk', sh).onclick = (e) => { const b = e.target.closest('[data-u]'); if (b) { $$('#pk button', sh).forEach((x) => x.classList.toggle('on', x === b)); } }; $('#au', sh).onclick = (e) => e.currentTarget.classList.toggle('on'); }, collect: (sh, r) => { if (r !== 'ok') return null; const b = $('#pk .on', sh); return { to_id: b ? b.dataset.u : '', to_name: b ? b.dataset.n : '', note: $('#an', sh).value.trim(), urgent: $('#au', sh).classList.contains('on') }; } });
      if (v && !v.to_id) return toast('اختاري الموظفة', 'err');
      if (v) { await sendCmd(no, { type: 'assign', ...v }); refresh(); }
      return;
    }
    if (type === 'resend_link') { if (await confirmBox('إعادة رابط الرفع؟', 'البرنامج يجهز رابط جديد للعميلة (الإرسال من الواتساب يدوي مثل الحين)', 'إي، جهزيه')) { await sendCmd(no, { type: 'resend_link' }); refresh(); } return; }
    if (type === 'pc_crop') { if (await confirmBox('القص على الكمبيوتر؟', 'ينسحب الطلب للبرنامج ويقص من قسم القص على الكمبيوتر بدل الجوال', 'إي')) { await sendCmd(no, { type: 'pc_crop' }); refresh(); } return; }
    if (type === 'extra') return extraPhotos(o);
  }
  // (٢٤) «➕ إضافة صور على الطلب» من الجوال — نفس البرنامج: نفس المنتج (عدد محدد/مفتوح) أو منتج جديد (باقة/عدد)،
  // البرنامج ينشئ الطلب الإضافي ورابطه ويرجّعه هنا خلال دقيقة — وبعدها نسخ + واتساب العميلة
  async function extraPhotos(o) {
    const slow = setTimeout(() => toast('نجيب منتجات الطلب…'), 500);
    let C; try { C = await api(`app/orders/${encodeURIComponent(o.no)}/addon/catalog`); } catch (e) { clearTimeout(slow); return toast(errText(e), 'err'); }
    clearTimeout(slow); hideToast();
    const same = C.same || []; const prods = (C.products || []).filter((p) => !p.inOrder); const busy = (C.shelves && C.shelves.busy) || {};
    const rowSame = (x, i) => `<div class="xl" data-k="s${i}"><label class="xh"><input type="checkbox" data-on="s${i}"/><b>${esc(x.title)}</b><small>(في الطلب ${phN(x.need)})</small></label><div class="xo" hidden><div class="segs" data-mode="s${i}"><button data-m="custom" class="on">عدد محدد</button><button data-m="open" ${x.open ? '' : 'disabled'}>مفتوح</button></div><div class="two"><div class="field" style="flex:1"><label>عدد الصور</label><input class="in" data-n="s${i}" type="number" inputmode="numeric" placeholder="مثال: 20"/></div><div class="field" style="flex:1"><label>السعر (ريال)</label><input class="in" data-p="s${i}" type="number" inputmode="decimal" placeholder="تلقائي"/></div></div><small class="hint">مفتوح = ترفع اللي تبيه والسعر ينحسب لحاله · اتركي السعر فاضي يتحسب تلقائياً</small></div></div>`;
    const rowNew = (p, i) => `<div class="xl" data-k="n${i}"><label class="xh"><input type="checkbox" data-on="n${i}"/><b>${esc(p.label)}</b></label><div class="xo" hidden><div class="segs" data-mode="n${i}"><button data-m="package" class="${(p.packages || []).length ? 'on' : ''}" ${(p.packages || []).length ? '' : 'disabled'}>باقة</button><button data-m="count" class="${(p.packages || []).length ? '' : 'on'}">عدد محدد</button></div><div class="two"><div class="field" style="flex:1"><label>الباقة / العدد</label>${(p.packages || []).length ? `<select class="in" data-pkg="n${i}">${p.packages.map((q) => `<option value="${q.n}">${esc(q.label)}</option>`).join('')}</select>` : ''}<input class="in" data-n="n${i}" type="number" inputmode="numeric" placeholder="عدد الصور" ${(p.packages || []).length ? 'hidden' : ''}/></div><div class="field" style="flex:1"><label>السعر (ريال)</label><input class="in" data-p="n${i}" type="number" inputmode="decimal" placeholder="تلقائي"/></div></div></div></div>`;
    const v = await sheet(`<h3>➕ إضافة صور على الطلب</h3><p>${esc(o.name || '')} · #${esc(o.no)} — اختاري وش تنضاف، والبرنامج ينشئ الطلب الإضافي ورابطه ويرجّعه هنا خلال دقيقة.</p>
      ${same.length ? `<div class="sec">نفس المنتج</div>${same.map(rowSame).join('')}` : ''}
      ${prods.length ? `<div class="sec">منتج جديد</div>${prods.map(rowNew).join('')}` : ''}
      <div class="field" id="xshelf" hidden><label>رف التجميع (١–١٠٠) — للمنتج الجديد</label><input class="in" id="xsh" type="number" inputmode="numeric" min="1" max="100" placeholder="رقم الرف"/><small class="hint">${Object.keys(busy).length ? `مشغول: ${Object.entries(busy).map(([k, r]) => `${k} (#${r})`).join('، ')}` : 'كل الرفوف فاضية'}</small></div>
      <div class="two" style="margin-top:8px"><button class="btn ghost" data-r="x" style="flex:1">إلغاء</button><button class="btn p" data-r="ok" style="flex:1">إنشاء الرابط</button></div>`, { init: (sh) => {
        const upd = () => { let anyNew = false; $$('.xl', sh).forEach((x) => { const on = $('[data-on]', x).checked; $('.xo', x).hidden = !on; if (on && x.dataset.k.startsWith('n')) anyNew = true; }); $('#xshelf', sh).hidden = !anyNew; };
        sh.addEventListener('change', (e) => { if (e.target.matches('[data-on]')) upd(); });
        sh.addEventListener('click', (e) => { const b = e.target.closest('[data-mode] button'); if (!b || b.disabled) return; const k = b.parentElement.dataset.mode; $$(`[data-mode="${k}"] button`, sh).forEach((x) => x.classList.toggle('on', x === b)); const x = $(`.xl[data-k="${k}"]`, sh); const nI = $('[data-n]', x), sel = $('[data-pkg]', x), pI = $('[data-p]', x); if (b.dataset.m === 'open') { nI.hidden = true; pI.hidden = true; } else if (b.dataset.m === 'package') { nI.hidden = true; if (sel) sel.hidden = false; pI.hidden = false; } else { nI.hidden = false; if (sel) sel.hidden = true; pI.hidden = false; } });
      }, collect: (sh, r) => { if (r !== 'ok') return null; const lines = []; $$('.xl', sh).forEach((x) => { if (!$('[data-on]', x).checked) return; const k = x.dataset.k; const mode = ($(`[data-mode="${k}"] .on`, sh) || {}).dataset?.m || 'custom'; const nI = $('[data-n]', x), sel = $('[data-pkg]', x), pI = $('[data-p]', x); const price = pI && pI.value !== '' ? Number(pI.value) : null; if (k.startsWith('s')) { const src = same[Number(k.slice(1))]; lines.push({ kind: 'same', src_key: src.line_key, mode, n: mode === 'open' ? null : Number(nI.value) || 0, price }); } else { const p = prods[Number(k.slice(1))]; lines.push({ kind: 'new', product: p.id, mode, n: mode === 'package' && sel ? Number(sel.value) : Number(nI.value) || 0, price }); } }); return { lines, shelf: $('#xsh', sh).value ? Number($('#xsh', sh).value) : null }; } });
    if (!v) return;
    if (!v.lines.length) return toast('اختاري المنتج اللي تنضاف له الصور', 'err');
    for (const l of v.lines) if (l.mode !== 'open' && !(l.n > 0)) return toast('اكتبي عدد الصور', 'err');
    if (v.lines.some((l) => l.kind === 'new') && !(v.shelf >= 1 && v.shelf <= 100)) return toast('اختاري رف التجميع (١–١٠٠)', 'err');
    const r = await sendCmd(o.no, { type: 'addon_create', lines: v.lines, shelf: v.shelf }, '✓ وصل الأمر — الرابط يطلع في صفحة الطلب خلال دقيقة');
    if (r && route() === `order/${encodeURIComponent(o.no)}`) vOrder(o.no);
  }
  let usersCache = null;
  async function usersList() { if (usersCache) return usersCache; try { const r = await api('app/users', { noAuth: true }); usersCache = r.users || []; K.set('users', usersCache); } catch { usersCache = K.get('users') || st.users || []; } return usersCache; }

  /* ---------- الأقسام (قوائم بدون صور): التوضيح · الطباعة · التدقيق والمطابقة ---------- */
  const SECTION_DEF = {
    clarify: { title: 'قسم التوضيح', k: 'clar', ic: I.spark, tabs: [['4', 'التوضيح', [4]], ['10', 'تدقيق التوضيح', [10]], ['5', 'تم التوضيح', [5, 6, 7]]], note: 'التوضيح نفسه يصير على الكمبيوتر. من الجوال تتابعين وتضيفين ملاحظة أو تنقلين الطلب.' },
    print: { title: 'قسم الطباعة', k: 'print', ic: I.print, tabs: [['5', 'جاهزة للطباعة', [5]], ['6', 'تمت الطباعة', [6, 7]]], note: 'الطباعة تصير من الكمبيوتر. هنا تشوفين وش جاهز ووش انطبع.' },
    audit: { title: 'التدقيق والمطابقة', k: 'audit', ic: I.puzzle, tabs: [['6', 'بانتظار التدقيق', [6]], ['hold', 'موقوفة', 'hold'], ['7', 'جاري التوصيل', [7]]], note: '' },
    crop3: { title: 'قسم القص', k: 'crop', ic: I.cut, tabs: [['3', 'في القص', [3]]], note: '' },
  };
  function vSection(key, tab) {
    const d = SECTION_DEF[key]; if (!d) return go('sections', true);
    if (!can(key === 'crop3' ? 'crop' : key)) { on({}); return paint(page(top({ title: d.title, back: true }) + empty('🔒', 'ما عندك صلاحية هالقسم'), 'sections'), 'sec.' + key); }
    st.secTab = st.secTab || {}; if (tab) st.secTab[key] = tab;
    on({ click: (a, el) => { if (a === 'tab') { st.secTab[key] = el.dataset.tab; paint(html(all()), 'sec.' + key, true); } } });
    const all = () => [...ordersOf('wa'), ...ordersOf('site').filter((o) => o.stage != null)];
    const html = (rows0) => {
      const list = rows0 || []; const cur2 = st.secTab[key] || d.tabs[0][0];
      const cnt = (t) => list.filter((o) => t[2] === 'hold' ? !!o.hold : t[2].includes(Number(o.stage))).length;
      const t = d.tabs.find((x) => x[0] === cur2) || d.tabs[0];
      const rows = list.filter((o) => t[2] === 'hold' ? !!o.hold : t[2].includes(Number(o.stage))).sort((a, b) => (b.urgent ? 1 : 0) - (a.urgent ? 1 : 0));
      return page(top({ title: d.title, sub: `${fmt(cnt(d.tabs[0]))} ${d.tabs[0][1]}`, back: true, sq: sq(d.k, d.ic) }) + `
        <div class="seg">${d.tabs.map((x) => `<button data-act="tab" data-tab="${x[0]}" class="${x[0] === cur2 ? 'on' : ''}">${x[1]} ${fmt(cnt(x))}</button>`).join('')}</div>
        <div class="olist">${rows.length ? rows.map((o) => orderRow(o)).join('') : empty('🌸', 'ما فيه طلبات هنا')}</div>
        ${d.note ? `<div class="note">${d.note}</div>` : ''}`, 'sections');
    };
    return view({ key: 'sec.' + key, cacheKey: 'sec.' + key, keep: true, load: async () => { const [w, s] = await Promise.all([loadOrders('wa'), loadOrders('site')]); K.set('orders.wa', w); K.set('orders.site', s); return all(); }, every: 45000, html: (r) => html(r || (K.get('orders.wa') || K.get('orders.site') ? all() : null)) });
  }

  /* ---------- تتبع الطلبات (٧): تصنيفات مثل لوحة سلة، واختيار تصنيف يعرض طلباته ---------- */
  function vDepts(pick) {
    if (!can('depts') && !canOrders()) { on({}); return paint(page(top({ title: 'تتبع الطلبات', back: true }) + empty('🔒', 'ما عندك صلاحية'), 'sections'), 'depts'); }
    if (pick) st.deptPick = pick;
    on({ click: (a, el) => { if (a === 'pick') { st.deptPick = el.dataset.k; history.replaceState(null, '', `#${PFX}depts/${el.dataset.k}`); paint(html(K.get('depts')), 'depts', true); } } });
    const html = (r, err) => {
      if (!r) return err ? page(top({ title: 'تتبع الطلبات', back: true }) + empty('📡', esc(errText(err))), 'sections') : spinner('تتبع الطلبات', 'sections');
      const rows = r.rows || []; const pre = (r.pre || []).map((p) => ({ ...p, src: 'site', flags: { site: true } }));
      const cats = [['all', 'الكل', 'rose', I.box, () => true, rows.length + pre.length], ['await', 'بانتظار العميلة', 'site', I.clock, (x) => x.pre === 'await', pre.filter((p) => p.pre === 'await').length], ['uploading', 'قيد الرفع', 'site', I.cloud, (x) => x.pre === 'uploading' || x.pre === 'ready', pre.filter((p) => p.pre === 'uploading' || p.pre === 'ready').length], ...[1, 8, 9, 2, 3, 4, 10, 5, 6, 7].map((n) => [String(n), ST[n][0], { 1: 'wa', 8: 'pay', 9: 'red', 2: 'rose', 3: 'crop', 4: 'clar', 10: 'clar', 5: 'print', 6: 'audit', 7: 'dept' }[n], STAGE_ICON[n], (x) => Number(x.stage) === n, rows.filter((x) => Number(x.stage) === n).length])];
      const cur2 = cats.find((c) => c[0] === st.deptPick) ? st.deptPick : 'all';
      const d = cats.find((c) => c[0] === cur2);
      const list = (cur2 === 'all' ? [...pre, ...rows] : [...pre, ...rows].filter(d[4])).sort((a, b) => (b.urgent ? 1 : 0) - (a.urgent ? 1 : 0) || String(a.stage_at || '').localeCompare(String(b.stage_at || '')));
      const late = rows.filter((x) => x.late && x.late.level === 'alert').length;
      return page(top({ title: 'تتبع الطلبات', sub: `${fmt(rows.length + pre.length)} طلب${late ? ` · ${fmt(late)} متأخرة جداً` : ''}`, back: true, sq: sq('dept', I.truck) }) + `
        <div class="cats">${cats.map(([k, l, c, ic, , n]) => `<button class="cat ${cur2 === k ? 'on' : ''}" data-act="pick" data-k="${k}"><span class="ic" style="background:${P[c][0]};color:${P[c][1]}">${ic}</span><b>${fmt(n)}</b><small>${l}</small></button>`).join('')}</div>
        <div class="sec">${esc(d[1])} <em>${fmt(list.length)}</em></div>
        <div class="olist">${list.length ? list.map((o) => orderRow(o)).join('') : empty('🌸', 'ما فيه طلبات')}</div>`, 'sections');
    };
    return view({ key: 'depts', cacheKey: 'depts', keep: true, load: () => api('app/depts'), every: 45000, html, after: () => { const sc = $('.cats'); const on2 = sc && sc.querySelector('.on'); if (sc && on2 && !sc.dataset.scrolled) { sc.scrollLeft = on2.offsetLeft - sc.clientWidth / 2 + on2.clientWidth / 2; sc.dataset.scrolled = '1'; } } });
  }

  /* ---------- القص من الجوال (١٩: نفس القائمة في الجوال والكمبيوتر — أول وحدة تفتح الطلب يصير معها) ---------- */
  function vCrop() {
    if (!can('crop')) { on({}); return paint(page(top({ title: 'قسم القص', back: true }) + empty('🔒', 'ما عندك صلاحية القص'), 'sections'), 'crop'); }
    on({ click: (a, el) => {
      if (a === 'tab') { st.cropTab = el.dataset.tab; paint(html(K.get('crop')), 'crop', true); }
      if (a === 'sel') { const id = el.dataset.sel; const o = ((K.get('crop') || {}).orders || []).find((x) => x.site_id === id); if (o && o.cropClaim && o.cropClaim.by && o.cropClaim.byId !== me().id && !isAdmin()) return toast(`هالطلب معها ${o.cropClaim.by} الحين`, 'err'); st.cropSel.has(id) ? st.cropSel.delete(id) : st.cropSel.add(id); paint(html(K.get('crop')), 'crop', true); }
      if (a === 'start') openStudio([...st.cropSel]);
    } });
    const html = (r, err) => {
      if (!r) return err ? page(top({ title: 'قسم القص', back: true }) + empty('📡', esc(errText(err))), 'sections') : spinner('قسم القص', 'sections');
      const list = r.orders || []; const done = r.done || [];
      const sel = st.cropSel; for (const id of [...sel]) if (!list.some((o) => o.site_id === id)) sel.delete(id);
      const tab = st.cropTab || 'todo';
      const nSel = [...sel].length; const nPh = list.filter((o) => sel.has(o.site_id)).reduce((n, o) => n + (o.got || 0), 0);
      const mine = (o) => o.cropClaim && o.cropClaim.byId === me().id;
      const taken = (o) => o.cropClaim && o.cropClaim.by && !mine(o);
      return page(top({ title: 'قسم القص', sub: list.length ? `${fmt(list.length)} ${list.length === 1 ? 'طلب ينتظر' : 'طلبات تنتظر'}` : 'ما فيه طلبات تنتظر', back: true, sq: sq('crop', I.cut), right: can('orders') ? `<a class="act aq" href="${href('crop3')}">على الكمبيوتر ${I.back}</a>` : '' }) + `
        <div class="seg"><button data-act="tab" data-tab="todo" class="${tab === 'todo' ? 'on' : ''}">الطلبات ${fmt(list.length)}</button><button data-act="tab" data-tab="done" class="${tab === 'done' ? 'on' : ''}">تم القص ${fmt(done.length)}</button></div>
        ${tab === 'todo' ? (list.length ? `<div class="hint">نفس القائمة في الجوال والكمبيوتر — اللي تفتح الطلب أول يصير معها. حددي طلب أو أكثر وبعدين «ابدئي القص».</div>` + list.map((o) => `<button class="row ${taken(o) ? 'dim2' : ''}" data-act="sel" data-sel="${esc(o.site_id)}"><span class="chk ${sel.has(o.site_id) ? 'on' : ''}">${sel.has(o.site_id) ? '✓' : ''}</span><span class="t"><b>${esc(o.name || 'عميلة')}<em>#${esc(o.no)}</em></b><small>${esc(prodTxt(o))} · ${phN(o.got)}</small>${o.phoneCrop && o.phoneCrop.cropped ? `<small>انقص <i>${fmt(o.phoneCrop.cropped)} من ${fmt(o.phoneCrop.total)}</i></small><div class="bar"><i style="width:${Math.round(100 * o.phoneCrop.cropped / Math.max(1, o.phoneCrop.total))}%"></i></div>` : ''}${taken(o) ? `<small class="claim">✂ معها ${esc(o.cropClaim.by)}${o.cropClaim.device === 'pc' ? ' (الكمبيوتر)' : ''} · ${esc(when(o.cropClaim.at))}</small>` : mine(o) ? '<small class="claim mine">✂ معك</small>' : ''}</span><span class="k ${o.lines && o.lines.some((l) => /مغناط/.test(l.label)) ? 'm' : ''}">${o.lines && o.lines.some((l) => /مغناط/.test(l.label)) ? 'مغناطيس' : 'ورقي'}</span></button>`).join('') : empty('✂️', 'ما فيه طلبات تنتظر القص')) : (done.length ? done.map((o) => `<div class="row"><span class="av" style="${avStyle(o.name)}">${esc((o.name || 'ع').slice(0, 1))}</span><span class="t"><b>${esc(o.name || 'عميلة')}<em>#${esc(o.no)}</em></b><small>${esc(o.by)} · ${esc(when(o.at))}</small></span><span class="k ${o.pulled ? 'g' : 'b'}">${o.pulled ? 'انتقل للبرنامج ✓' : 'البرنامج يسحب…'}</span></div>`).join('') : empty('🌸', 'ما فيه شي بعد'))}
        ${tab === 'todo' && nSel ? `<button class="cta" data-act="start">✂ ابدئي قص ${nSel === 1 ? 'طلب' : `${fmt(nSel)} طلبات`} (${phN(nPh)})</button>` : ''}`, 'sections');
    };
    return view({ key: 'crop', cacheKey: 'crop', keep: true, load: async () => { const r = await api('app/crop/orders'); st.settings = r.settings || st.settings; return r; }, every: 20000, html });
  }

  /* ---------- استوديو القص: نسخة «قص الصور بنفسي» من الموقع نفسها (المالكة 5 نوفمبر 15:58) ----------
     الصورة كاملة وثابتة والإطار فوقها (تحركينه وتكبرينه من زواياه وبإصبعين)، وتسحبين لفوق للصورة الجاية.
     الفرق عن الموقع: الموظفة تحدد طلب أو أكثر، وبين كل طلب وطلب صفحة «دخلتي على طلب جديد»، وكل صورة تعدّينها لفوق تنحفظ لحظتها
     (لو رجعتي تكملين من مكانك)، وكل الصور تتحمل بالخلفية وهي تقص. */
  const MODE_LABEL = { crop: 'قص', white: 'حواف بيضاء', blur: 'بلور', black: 'حواف سوداء', red: 'حدود حمراء' };
  // ---- مقترح القص: الوجوه (MediaPipe) + smartcrop — كله داخل الجوال، ما يروح شي لأي مكان
  let detP = null, scP = null;
  function detector() {
    if (detP) return detP;
    detP = (async () => {
      const V2 = '0.10.14'; const BASE = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${V2}`;
      const imp = new Function('u', 'return import(u)');
      const vision = await imp(`${BASE}/vision_bundle.mjs`);
      const files = await vision.FilesetResolver.forVisionTasks(`${BASE}/wasm`);
      return vision.FaceDetector.createFromOptions(files, { baseOptions: { modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite', delegate: 'CPU' }, runningMode: 'IMAGE', minDetectionConfidence: 0.45 });
    })().catch(() => null);
    return detP;
  }
  function smartcropLib() {
    if (scP) return scP;
    scP = new Promise((res) => { if (window.smartcrop) return res(window.smartcrop); const s = document.createElement('script'); s.src = 'https://cdn.jsdelivr.net/npm/smartcrop@2.0.5/smartcrop.js'; s.onload = () => res(window.smartcrop || null); s.onerror = () => res(null); document.head.appendChild(s); });
    return scP;
  }
  const loadImg = (src) => new Promise((res, rej) => { const im = new Image(); im.crossOrigin = 'anonymous'; im.decoding = 'async'; im.onload = () => res(im); im.onerror = rej; im.src = src; });
  function centerCrop(iw, ih, ar) { const ia = iw / ih; if (ia > ar) { const w = ar / ia; return { x: (1 - w) / 2, y: 0, w, h: 1 }; } const h = ia / ar; return { x: 0, y: Math.max(0, Math.min(1 - h, (1 - h) * 0.3)), w: 1, h }; }
  // ---- هندسة الإطار (نفس الموقع src/cropFlow.js)
  const arOf = (size, orient) => (size.short === size.long ? 1 : orient === 'l' ? size.long / size.short : size.short / size.long);
  function maxCrop(iw, ih, ar) { const ia = iw / ih; return ia > ar ? { w: ar / ia, h: 1 } : { w: 1, h: ia / ar }; }
  function clampCrop(c, iw, ih, ar) { const m = maxCrop(iw, ih, ar); const w = Math.min(m.w, Math.max(m.w / 4, c.w)); const h = (w * iw) / (ih * ar); return { ...c, w, h, x: Math.max(0, Math.min(1 - w, c.x)), y: Math.max(0, Math.min(1 - h, c.y)) }; }
  function reorient(c, iw, ih, ar) { const m = maxCrop(iw, ih, ar); const cx = c.x + c.w / 2, cy = c.y + c.h / 2; return clampCrop({ ...c, w: m.w, h: m.h, x: cx - m.w / 2, y: cy - m.h / 2 }, iw, ih, ar); }
  const modesOf = (size) => (size && Array.isArray(size.staffModes) && size.staffModes.length ? size.staffModes : size && Array.isArray(size.modes) && size.modes.length ? size.modes : ['crop']);
  const isFillM = (m) => m === 'white' || m === 'blur' || m === 'black';
  function fitFrame(iw, ih, ar) { const ia = iw / ih; return ia > ar ? { w: 1, h: ia / ar } : { w: ar / ia, h: 1 }; }
  function fillDefault(iw, ih, ar) { const F = fitFrame(iw, ih, ar); return { x: (1 - F.w) / 2, y: (1 - F.h) / 2, w: F.w, h: F.h }; }
  function fillBounds(iw, ih, ar) { const F = fitFrame(iw, ih, ar); return { x: (1 - F.w) / 2, y: (1 - F.h) / 2, w: F.w, h: F.h }; }
  function clampFill(c, iw, ih, ar) {
    const B = fillBounds(iw, ih, ar), m = maxCrop(iw, ih, ar);
    const w = Math.min(B.w, Math.max(m.w / 4, c.w));
    const h = Math.min(B.h, (w * iw) / (ih * ar));
    const w2 = (h * ih * ar) / iw;
    const cx = Math.max(0, Math.min(1, c.x + c.w / 2)), cy = Math.max(0, Math.min(1, c.y + c.h / 2));
    return { ...c, w: w2, h, x: Math.max(B.x, Math.min(B.x + B.w - w2, cx - w2 / 2)), y: Math.max(B.y, Math.min(B.y + B.h - h, cy - h / 2)) };
  }
  const clampFor = (c, iw, ih, ar, mode) => (isFillM(mode) ? clampFill(c, iw, ih, ar) : clampCrop(c, iw, ih, ar));
  const redFrac = (size, orient) => Math.min(0.3, (size.safe || 0.3) / (orient === 'l' ? size.long : size.short));
  const noAI = (size) => !!size && size.id === 'sq5';
  function centerExact(iw, ih, ar) { const m = maxCrop(iw, ih, ar); return { x: (1 - m.w) / 2, y: (1 - m.h) / 2, w: m.w, h: m.h }; }
  // ---- نسخة العرض (١٤٠٠ بكسل) تتجهز في «عامل» بالخلفية — الشاشة ما تعلق، والصورة واضحة
  const DISP_SRC = `self.onmessage = async (e) => { const { id, url, max } = e.data; try { const r = await fetch(url); if (!r.ok) throw new Error('http ' + r.status); const blob = await r.blob(); let bmp; try { bmp = await createImageBitmap(blob, { imageOrientation: 'from-image' }); } catch (x) { bmp = await createImageBitmap(blob); } const k = Math.min(1, max / Math.max(bmp.width, bmp.height)); if (k >= 1) { try { bmp.close(); } catch (x) {} self.postMessage({ id, blob }); return; } const w = Math.round(bmp.width * k), h = Math.round(bmp.height * k); const cv = new OffscreenCanvas(w, h); const cx = cv.getContext('2d'); cx.imageSmoothingQuality = 'high'; cx.drawImage(bmp, 0, 0, w, h); try { bmp.close(); } catch (x) {} const out = await cv.convertToBlob({ type: 'image/jpeg', quality: 0.9 }); self.postMessage({ id, blob: out }); } catch (err) { self.postMessage({ id, err: String((err && err.message) || err) }); } };`;
  let dWorker = null, dSeq = 0; const dWait = new Map(); const dispCache = new Map();
  function dispWorker() {
    if (dWorker !== null) return dWorker;
    try {
      if (typeof Worker === 'undefined' || typeof OffscreenCanvas === 'undefined' || typeof createImageBitmap === 'undefined') return (dWorker = false);
      const w = new Worker(URL.createObjectURL(new Blob([DISP_SRC], { type: 'text/javascript' })));
      w.onmessage = (e) => { const d = e.data || {}; const h = dWait.get(d.id); if (!h) return; dWait.delete(d.id); if (d.blob) h.res(d.blob); else h.rej(new Error(d.err || 'worker')); };
      w.onerror = () => { dWorker = false; for (const h of dWait.values()) h.rej(new Error('worker')); dWait.clear(); };
      dWorker = w;
    } catch { dWorker = false; }
    return dWorker;
  }
  function viaWorker(url, max) {
    const w = dispWorker();
    if (!w || !/^https?:/.test(url)) return Promise.reject(new Error('no worker'));
    return new Promise((res, rej) => { const id = ++dSeq; dWait.set(id, { res, rej }); setTimeout(() => { if (dWait.has(id)) { dWait.delete(id); rej(new Error('timeout')); } }, 25000); try { w.postMessage({ id, url, max }); } catch (e) { dWait.delete(id); rej(e); } });
  }
  async function displayOf(url) {
    if (!url) return null;
    if (dispCache.has(url)) return dispCache.get(url);
    const p = (async () => {
      try { const b = await viaWorker(url, 1400); if (b && b.size) return URL.createObjectURL(b); } catch {}
      const blob = await (await fetch(url)).blob();
      let src = null;
      try { src = await createImageBitmap(blob, { imageOrientation: 'from-image' }); } catch { src = null; }
      if (!src) { const u0 = URL.createObjectURL(blob); try { src = await loadImg(u0); } catch { return u0; } }
      const w = src.width || src.naturalWidth, h = src.height || src.naturalHeight; const k = Math.min(1, 1400 / Math.max(w, h));
      if (k >= 1) { try { src.close && src.close(); } catch {} return URL.createObjectURL(blob); }
      const cv = document.createElement('canvas'); cv.width = Math.round(w * k); cv.height = Math.round(h * k);
      cv.getContext('2d').drawImage(src, 0, 0, cv.width, cv.height); try { src.close && src.close(); } catch {}
      const out = await new Promise((res) => cv.toBlob(res, 'image/jpeg', 0.9)); cv.width = 0; cv.height = 0;
      return out ? URL.createObjectURL(out) : null;
    })().catch(() => null);
    dispCache.set(url, p);
    return p;
  }
  // معاينة البلور: نسخة صغيرة جداً (٢٤ بكسل) تتمدد — المتصفح ينعّمها لحاله (مثل الموقع)
  async function tinyOf(url) {
    if (!url) return null;
    try { const im = await loadImg(url); const w = im.naturalWidth, h = im.naturalHeight; if (!w || !h) return null; const k = 24 / Math.max(w, h); const cv = document.createElement('canvas'); cv.width = Math.max(2, Math.round(w * k)); cv.height = Math.max(2, Math.round(h * k)); cv.getContext('2d').drawImage(im, 0, 0, cv.width, cv.height); return cv.toDataURL('image/jpeg', 0.7); } catch { return null; }
  }
  // اقتراح القص لصورة (على المصغرة — سريع) — محفوظ عشان ما ينحسب مرتين
  const SUGG = new Map(); const touchNow = { at: 0 };
  async function suggestFor(it) {
    const src = it.thumb || it.url;
    let iw = 0, ih = 0, im = null;
    if (src) { try { im = await loadImg(src); iw = im.naturalWidth; ih = im.naturalHeight; } catch {} }
    if (!iw || !ih) { iw = it.w || 0; ih = it.h || 0; }
    const orient = iw && ih ? (iw >= ih ? 'l' : 'p') : 'p';
    const ar = arOf(it.size, orient);
    let r = null;
    if (im && !noAI(it.size)) { try { r = await suggestAI(im, ar); } catch {} }
    const c = r ? { x: r.x, y: r.y, w: r.w, h: r.h, orient, by: 'ai', faces: r.faces, boxes: r.boxes || [], iw, ih } : iw && ih ? { ...(noAI(it.size) ? centerExact(iw, ih, ar) : centerCrop(iw, ih, ar)), orient, by: 'ai', iw, ih } : null;
    if (c) c.tiny = await tinyOf(src);
    return c;
  }
  function suggestCached(it) { const k = `${it.id}|${(it.size && it.size.id) || ''}`; if (!SUGG.has(k)) SUGG.set(k, suggestFor(it).catch(() => null).then((c) => { if (!c) SUGG.delete(k); return c; })); return SUGG.get(k); }
  async function suggestAI(im, ar) {
    const iw = im.naturalWidth, ih = im.naturalHeight; if (!iw || !ih) return null;
    const k = Math.min(1, 320 / Math.max(iw, ih));
    const cv = document.createElement('canvas'); cv.width = Math.max(1, Math.round(iw * k)); cv.height = Math.max(1, Math.round(ih * k));
    try { cv.getContext('2d').drawImage(im, 0, 0, cv.width, cv.height); } catch { return null; }
    let faces = [];
    try { const det = await detector(); if (det) faces = ((det.detect(cv) || {}).detections || []).map((d) => d.boundingBox).filter(Boolean); } catch {}
    const boost = faces.map((b) => ({ x: b.originX, y: b.originY, width: b.width, height: b.height, weight: 1 }));
    const ia = cv.width / cv.height; const cw = ia > ar ? Math.round(cv.height * ar) : cv.width; const ch = ia > ar ? cv.height : Math.round(cv.width / ar);
    let r = null;
    try { const sc = await smartcropLib(); if (sc) { const out = await sc.crop(cv, { width: cw, height: ch, minScale: 1, boost, ruleOfThirds: true }); r = out && out.topCrop; } } catch {}
    const c = r ? { x: r.x / cv.width, y: r.y / cv.height, w: r.width / cv.width, h: r.height / cv.height } : centerCrop(iw, ih, ar);
    if (faces.length) {
      let fx0 = 1, fy0 = 1, fx1 = 0, fy1 = 0;
      for (const b of faces) { fx0 = Math.min(fx0, b.originX / cv.width); fy0 = Math.min(fy0, b.originY / cv.height); fx1 = Math.max(fx1, (b.originX + b.width) / cv.width); fy1 = Math.max(fy1, (b.originY + b.height) / cv.height); }
      fy0 = Math.max(0, fy0 - (fy1 - fy0) * 0.35);
      if (fx1 - fx0 <= c.w) { if (fx0 < c.x) c.x = fx0; else if (fx1 > c.x + c.w) c.x = fx1 - c.w; }
      if (fy1 - fy0 <= c.h) { if (fy0 < c.y) c.y = fy0; else if (fy1 > c.y + c.h) c.y = fy1 - c.h; }
      c.x = Math.max(0, Math.min(1 - c.w, c.x)); c.y = Math.max(0, Math.min(1 - c.h, c.y));
    }
    const boxes = faces.slice(0, 12).map((b) => ({ x: b.originX / cv.width, y: b.originY / cv.height, w: b.width / cv.width, h: b.height / cv.height }));
    return { ...c, faces: faces.length, boxes };
  }
  // ---- العناوين (مثل الموقع): المنتج بمقاسه · اسم المجموعة للفاصل
  function titleOf(it) {
    if (!it) return '';
    const t = `${it.title || ''} ${it.family || ''}`;
    if (it.size.id === 'p10x15' && it.family === 'album') return 'صور الألبوم مقاس ١٥×١٠ سم';
    if (it.size.id === 'p10x15') return 'صور ورقية مقاس ١٥×١٠ سم';
    if (it.size.id === 'a5') return 'صور ورقية مقاس A5';
    if (it.size.id === 'sq5') return /ملصق|sticker/i.test(t) ? 'ملصقات ٥×٥ سم' : 'صور مغناطيسية ٥×٥ سم';
    return `${it.title || 'الصور'} — ${AR(it.size.label)}`;
  }
  function groupOf(it) {
    if (!it || !it.size) return 'الصور';
    const t = `${it.title || ''} ${it.family || ''}`;
    if (it.size.id === 'sq5') return /ملصق|sticker/i.test(t) ? 'الملصقات' : 'الصور المغناطيسية';
    if (it.size.id === 'a5') return 'الصور الورقية A5';
    if (it.family === 'album') return 'صور الألبوم';
    if (it.family === 'family') return 'صور الباقة العائلية';
    if (it.size.id === 'p10x15') return 'الصور الورقية';
    return it.title || 'الصور';
  }
  const ORD = ['الأول', 'الثاني', 'الثالث', 'الرابع', 'الخامس', 'السادس', 'السابع', 'الثامن', 'التاسع', 'العاشر'];
  // ترتيب الصفحات: صور كل طلب منتج منتج، فاصل بين منتج ومنتج، فاصل «دخلتي على طلب جديد» بين طلب وطلب، وفي الآخر «خلصتي»
  function buildSeq(items, orders) {
    const s = [];
    orders.forEach((o, oi) => {
      const its = items.filter((x) => x.oi === oi);
      const keys = []; for (const x of its) if (!keys.includes(x.line_key)) keys.push(x.line_key);
      const nameOf = {}, byName = {};
      for (const k of keys) { const g = groupOf(its.find((x) => x.line_key === k)); nameOf[k] = g; (byName[g] = byName[g] || []).push(k); }
      const label = (k) => { const g = nameOf[k]; const ks = byName[g]; return ks.length > 1 ? `${g} (المنتج ${ORD[ks.indexOf(k)] || fmt(ks.indexOf(k) + 1)})` : g; };
      if (oi > 0) s.push({ t: 'ord', oi, prev: oi - 1, key: `ord-${oi}` });
      its.forEach((x, j) => {
        const p = its[j - 1];
        if (p && p.line_key !== x.line_key) s.push({ t: 'sep', a: label(p.line_key), b: label(x.line_key), key: `sep-${x.id}` });
        s.push({ t: 'ph', i: items.indexOf(x), key: x.id });
      });
    });
    s.push({ t: 'fin', key: 'fin' });
    return s;
  }
  const ck = (c) => (c ? `${[c.x, c.y, c.w, c.h].map((v) => Math.round((Number(v) || 0) * 10000)).join(',')}|${c.orient || ''}|${c.mode || ''}` : '');
  const raf = (fn) => (typeof requestAnimationFrame === 'function' ? requestAnimationFrame(fn) : setTimeout(fn, 16));
  const HIT = 30, TM = 16;
  // ---- صفحة صورة: الصورة ثابتة والإطار فوقها (نفس CropPage في الموقع)
  class CropPage {
    constructor(item, box, cb) {
      this.item = item; this.box = box; this.cb = cb;
      this.nat = null; this.live = null; this.crop = null; this.sugg = null; this.src = null; this.mode0 = null;
      this.st = { hit: null, c0: null, pinch: null, anchor: null, rect: null, pts: new Map() };
      this.frameReq = false; this.failed = false;
      const el = document.createElement('div'); el.className = 'cfp'; el.style.width = box.w + 'px'; el.style.height = box.h + 'px';
      el.innerHTML = '<div class="cfl"><div class="cfw"></div><div class="cfb"><img alt=""/></div><img class="cfi" alt=""/><div class="cfs"></div><div class="cfs"></div><div class="cfs"></div><div class="cfs"></div><div class="cft"></div><div class="cft"></div><div class="cft"></div><div class="cft"></div><div class="cff"></div><div class="cfo"></div><div class="cfF"></div><div class="cfr"></div><div class="cfsafe"></div><div class="cfc"><i></i><i></i></div><div class="cfc"><i></i><i></i></div><div class="cfc"><i></i><i></i></div><div class="cfc"><i></i><i></i></div><div class="cfld"><div class="spin"></div></div></div><div class="cfx"></div>';
      this.el = el;
      const q = (s) => el.querySelector(s);
      this.n = { white: q('.cfw'), blur: q('.cfb'), blurImg: q('.cfb img'), img: q('.cfi'), shades: [...el.querySelectorAll('.cfs')], thirds: [...el.querySelectorAll('.cft')], faces: q('.cff'), outer: q('.cfo'), frame: q('.cfF'), red: q('.cfr'), safe: q('.cfsafe'), corners: [...el.querySelectorAll('.cfc')], ld: q('.cfld'), touch: q('.cfx') };
      this.n.img.addEventListener('error', () => { if (this.src && this.src === this.item.url && !this.failed) { this.failed = true; this.pickSrc(); } this.cb.onImgError && this.cb.onImgError(this.item); });
      this.bindTouch();
    }
    setBox(box) { this.box = box; this.el.style.width = box.w + 'px'; this.el.style.height = box.h + 'px'; this.render(); }
    // الصورة المعروضة: نسخة العرض لو جهزت، وإلا المصغرة (والكبيرة لو نسخة العرض ما زبطت)
    update({ crop, sugg, show, noDisp, active }) {
      this.crop = crop || null; this.sugg = sugg || null; this.show = show || null; this.noDisp = !!noDisp; this.active = !!active;
      this.pickSrc(); this.render();
    }
    pickSrc() {
      const it = this.item; const big = it.url;
      const src = this.show || (this.noDisp && this.active && !this.failed && big) || it.thumb || big;
      if (!src || src === this.src) return;
      this.src = src;
      const im = this.n.img; im.src = src;
      const done = () => { if (im.src !== src && this.src !== src) return; const w = im.naturalWidth, h = im.naturalHeight; if (w && h) { this.nat = { w, h }; this.cb.onDims && this.cb.onDims(it.id, w, h); } this.render(); };
      if (im.complete && im.naturalWidth) done(); else im.addEventListener('load', done, { once: true });
    }
    geo() {
      const it = this.item; const size = it.size; const box = this.box;
      const iw = this.nat ? this.nat.w : this.sugg && this.sugg.iw ? this.sugg.iw : it.w || 0, ih = this.nat ? this.nat.h : this.sugg && this.sugg.ih ? this.sugg.ih : it.h || 0;
      const base0 = this.live || this.crop || this.sugg || null;
      const modes = modesOf(size);
      const mode = base0 && modes.includes(base0.mode) ? base0.mode : modes[0];
      const orient = (base0 && base0.orient) || (iw >= ih ? 'l' : 'p');
      const ar = arOf(size, orient);
      const cur = iw && ih ? clampFor(base0 || (isFillM(mode) ? { ...fillDefault(iw, ih, ar), orient } : { ...(noAI(size) ? centerExact(iw, ih, ar) : centerCrop(iw, ih, ar)), orient }), iw, ih, ar, mode) : null;
      const ext = !iw || !ih ? { w: 1, h: 1 } : isFillM(mode) ? (() => { const B = fillBounds(iw, ih, ar); return { w: Math.max(1, B.w), h: Math.max(1, B.h) }; })() : mode === 'red' ? { w: 1.14, h: 1.14 } : { w: 1, h: 1 };
      const sc = iw && ih ? Math.min(box.w / (iw * ext.w), box.h / (ih * ext.h)) : 1;
      const dw = iw * sc, dh = ih * sc; const ox = (box.w - dw) / 2, oy = (box.h - dh) / 2;
      const F = cur ? { x: ox + cur.x * dw, y: oy + cur.y * dh, w: cur.w * dw, h: cur.h * dh } : null;
      const rf = mode === 'red' ? redFrac(size, orient) : 0;
      const O = F && rf ? (() => { const m = (F.w / (1 - 2 * rf)) * rf; return { x: F.x - m, y: F.y - m, w: F.w + 2 * m, h: F.h + 2 * m }; })() : F;
      return { sc, dw, dh, ox, oy, F, P: O, cur, iw, ih, ar, orient, mode, size };
    }
    render() {
      const G = this.geo(); this.G = G; const n = this.n; const box = this.box;
      const px = (v) => `${v}px`;
      n.ld.style.display = G.cur && this.src ? 'none' : 'flex';
      const img = n.img; img.style.left = px(G.ox); img.style.top = px(G.oy); img.style.width = px(G.dw); img.style.height = px(G.dh); img.style.visibility = G.cur && this.src ? 'visible' : 'hidden';
      const F = G.F, P = G.P;
      const hide = (e) => { e.style.display = 'none'; };
      if (!F) { [n.white, n.blur, n.faces, n.outer, n.frame, n.red, n.safe, ...n.shades, ...n.thirds, ...n.corners].forEach(hide); n.touch.style.display = 'none'; return; }
      const beyond = P.x < G.ox - 0.5 || P.y < G.oy - 0.5 || P.x + P.w > G.ox + G.dw + 0.5 || P.y + P.h > G.oy + G.dh + 0.5;
      const rect = (e, r) => { e.style.display = 'block'; e.style.left = px(r.x); e.style.top = px(r.y); e.style.width = px(Math.max(0, r.w)); e.style.height = px(Math.max(0, r.h)); };
      // اللي برا الصورة داخل حد الطباعة: أبيض / أسود (حواف) أو بلور (بلور / حدود حمراء)
      if (beyond && (G.mode === 'white' || G.mode === 'black')) { rect(n.white, P); n.white.style.background = G.mode === 'black' ? '#000' : '#fff'; } else hide(n.white);
      if (beyond && (G.mode === 'blur' || G.mode === 'red')) {
        rect(n.blur, P);
        const pcx = G.ox + G.dw / 2, pcy = G.oy + G.dh / 2;
        const k = Math.max(1, (2 * (pcx - P.x)) / G.dw, (2 * (P.x + P.w - pcx)) / G.dw, (2 * (pcy - P.y)) / G.dh, (2 * (P.y + P.h - pcy)) / G.dh);
        const bw = G.dw * k + 20, bh = G.dh * k + 20;
        const bi = n.blurImg; const tiny = this.sugg && this.sugg.tiny;
        if (tiny) { if (bi.getAttribute('src') !== tiny) bi.src = tiny; bi.style.display = 'block'; bi.style.left = px(pcx - bw / 2 - P.x); bi.style.top = px(pcy - bh / 2 - P.y); bi.style.width = px(bw); bi.style.height = px(bh); } else bi.style.display = 'none';
      } else hide(n.blur);
      // اللي بينقص (برا حد الطباعة): معتّم
      rect(n.shades[0], { x: 0, y: 0, w: box.w, h: Math.max(0, P.y) });
      rect(n.shades[1], { x: 0, y: P.y + P.h, w: box.w, h: Math.max(0, box.h - P.y - P.h) });
      rect(n.shades[2], { x: 0, y: P.y, w: Math.max(0, P.x), h: P.h });
      rect(n.shades[3], { x: P.x + P.w, y: P.y, w: Math.max(0, box.w - P.x - P.w), h: P.h });
      // خطوط الأثلاث
      const ta = this.drag ? 0.55 : 0.28;
      [1, 2].forEach((k, i) => { const e = n.thirds[i]; rect(e, { x: F.x + (F.w * k) / 3, y: F.y, w: 1, h: F.h }); e.style.background = `rgba(255,255,255,${ta})`; });
      [1, 2].forEach((k, i) => { const e = n.thirds[2 + i]; rect(e, { x: F.x, y: F.y + (F.h * k) / 3, w: F.w, h: 1 }); e.style.background = `rgba(255,255,255,${ta})`; });
      // الوجوه (من الذكاء الاصطناعي): أصفر داخل الإطار · أحمر لو الإطار قاصّه
      const boxes = this.sugg && Array.isArray(this.sugg.boxes) ? this.sugg.boxes : [];
      n.faces.style.display = boxes.length ? 'block' : 'none';
      if (boxes.length) {
        const html = boxes.map((b) => { const r = { x: G.ox + b.x * G.dw, y: G.oy + b.y * G.dh, w: b.w * G.dw, h: b.h * G.dh }; const tol = 2; const inside = r.x >= F.x - tol && r.y >= F.y - tol && r.x + r.w <= F.x + F.w + tol && r.y + r.h <= F.y + F.h + tol; const touches = r.x < F.x + F.w && r.x + r.w > F.x && r.y < F.y + F.h && r.y + r.h > F.y; return `<i class="${inside ? 'in' : touches ? 'cut' : 'out'}" style="left:${r.x}px;top:${r.y}px;width:${r.w}px;height:${r.h}px"></i>`; }).join('');
        if (n.faces.innerHTML !== html) n.faces.innerHTML = html;
      }
      // حد الطباعة + الإطار (حدود حمراء: المربع الأحمر داخل حد الطباعة)
      rect(n.outer, { x: P.x - 1, y: P.y - 1, w: P.w + 2, h: P.h + 2 });
      rect(n.frame, P); n.frame.style.borderWidth = G.mode === 'red' ? '1px' : '2px'; n.frame.style.borderColor = G.mode === 'red' ? 'rgba(255,255,255,.85)' : '#fff';
      if (G.mode === 'red') rect(n.red, F); else hide(n.red);
      const safe = G.size.safe && G.mode === 'crop' ? (G.size.safe / G.size.short) * Math.min(F.w, F.h) : 0;
      if (safe) rect(n.safe, { x: F.x + safe, y: F.y + safe, w: F.w - 2 * safe, h: F.h - 2 * safe }); else hide(n.safe);
      const L = Math.max(12, Math.min(22, F.w / 4, F.h / 4));
      [[F.x, F.y, 1, 1], [F.x + F.w, F.y, -1, 1], [F.x, F.y + F.h, 1, -1], [F.x + F.w, F.y + F.h, -1, -1]].forEach(([cx, cy, sx, sy], i) => {
        const c = n.corners[i]; c.style.display = 'block'; c.style.left = px(cx - (sx > 0 ? 3 : L - 1)); c.style.top = px(cy - (sy > 0 ? 3 : L - 1)); c.style.width = px(L + 2); c.style.height = px(L + 2);
        const [h, v] = c.children; h.style.cssText = `${sx > 0 ? 'left' : 'right'}:0;${sy > 0 ? 'top' : 'bottom'}:0;width:${L + 2}px;height:5px`; v.style.cssText = `${sx > 0 ? 'left' : 'right'}:0;${sy > 0 ? 'top' : 'bottom'}:0;width:5px;height:${L + 2}px`;
      });
      // طبقة اللمس: الصورة (وحد الطباعة لو طالع برا الصورة) + ١٦ حولها للزوايا
      const tl = { l: Math.max(-TM, Math.min(G.ox, P.x) - TM), t: Math.max(-TM, Math.min(G.oy, P.y) - TM) };
      const tr = { r: Math.min(box.w + TM, Math.max(G.ox + G.dw, P.x + P.w) + TM), b: Math.min(box.h + TM, Math.max(G.oy + G.dh, P.y + P.h) + TM) };
      rect(n.touch, { x: tl.l, y: tl.t, w: tr.r - tl.l, h: tr.b - tl.t });
    }
    ptOf(e, cached) { const r = (cached && this.st.rect) || this.el.getBoundingClientRect(); if (!cached) this.st.rect = r; return { x: e.clientX - r.left, y: e.clientY - r.top }; }
    hitOf(p) {
      const G = this.G; const R0 = G && G.F; if (!p || !R0) return null;
      const cs = [[R0.x, R0.y], [R0.x + R0.w, R0.y], [R0.x, R0.y + R0.h], [R0.x + R0.w, R0.y + R0.h]];
      let best = -1, bd = HIT; cs.forEach(([cx, cy], i) => { const d = Math.hypot(cx - p.x, cy - p.y); if (d < bd) { bd = d; best = i; } });
      if (best >= 0) return { type: 'corner', i: best };
      if (p.x >= R0.x && p.x <= R0.x + R0.w && p.y >= R0.y && p.y <= R0.y + R0.h) return { type: 'move' };
      return { type: 'jump', p: { x: Math.max(G.ox, Math.min(G.ox + G.dw, p.x)), y: Math.max(G.oy, Math.min(G.oy + G.dh, p.y)) } };
    }
    move(c) {
      const G = this.G; if (!G || !G.cur) return;
      this.live = { ...clampFor(c, G.iw, G.ih, G.ar, G.mode), orient: G.orient, mode: G.mode, by: 'user' };
      touchNow.at = Date.now();
      if (this.frameReq) return;
      this.frameReq = true;
      raf(() => { this.frameReq = false; this.render(); });
    }
    commit() { const c = this.live; this.live = null; this.drag = null; if (c) { this.crop = c; this.cb.onChange(this.item.id, c); } this.render(); }
    bindTouch() {
      const el = this.n.touch; const S = this.st;
      el.addEventListener('pointerdown', (e) => {
        e.stopPropagation(); e.preventDefault();
        try { el.setPointerCapture(e.pointerId); } catch {}
        S.pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
        touchNow.at = Date.now();
        const G = this.G; if (!G || !G.cur) return;
        if (S.pts.size >= 2) { const a = [...S.pts.values()]; S.pinch = { d: Math.hypot(a[0].x - a[1].x, a[0].y - a[1].y), c: this.live || G.cur }; S.anchor = null; this.drag = 'pinch'; this.render(); return; }
        const p = this.ptOf(e); const h = this.hitOf(p) || { type: 'move' };
        S.hit = h; S.c0 = G.cur; S.pinch = null; S.anchor = null; S.p0 = p;
        if (h.type === 'jump') { const c = G.cur; const cj = clampFor({ ...c, x: (h.p.x - G.ox) / G.dw - c.w / 2, y: (h.p.y - G.oy) / G.dh - c.h / 2 }, G.iw, G.ih, G.ar, G.mode); S.c0 = cj; this.move(cj); }
        if (h.type === 'corner') { const c = G.cur; const x = c.x * G.iw, y = c.y * G.ih, w = c.w * G.iw, hh = c.h * G.ih; S.anchor = [[x, y], [x + w, y], [x, y + hh], [x + w, y + hh]][3 - h.i]; }
        this.drag = h.type === 'corner' ? 'corner' : 'move'; this.render();
      });
      el.addEventListener('pointermove', (e) => {
        if (!S.pts.has(e.pointerId)) return;
        e.preventDefault();
        S.pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
        const G = this.G; const c0 = S.c0; if (!G || !G.cur) return;
        if (S.pts.size >= 2) {
          const a = [...S.pts.values()]; const d = Math.hypot(a[0].x - a[1].x, a[0].y - a[1].y);
          if (!S.pinch) { S.pinch = { d, c: this.live || G.cur }; this.drag = 'pinch'; return; }
          const P = S.pinch; const k = d / P.d; const w = P.c.w / k; const hh = (w * G.iw) / (G.ih * G.ar); const cx = P.c.x + P.c.w / 2, cy = P.c.y + P.c.h / 2;
          this.move({ ...P.c, w, h: hh, x: cx - w / 2, y: cy - hh / 2 });
          return;
        }
        if (S.pinch || !c0) return;
        const p = this.ptOf(e, true); const A = S.anchor;
        if (!A) { this.move({ ...c0, x: c0.x + (p.x - S.p0.x) / G.dw, y: c0.y + (p.y - S.p0.y) / G.dh }); return; }
        const Pp = { x: (p.x - G.ox) / G.sc, y: (p.y - G.oy) / G.sc };
        if (isFillM(G.mode)) {
          const dX = Pp.x >= A[0] ? 1 : -1, dY = Pp.y >= A[1] ? 1 : -1;
          const w0 = Math.max(Math.abs(Pp.x - A[0]), Math.abs(Pp.y - A[1]) * G.ar), h0 = w0 / G.ar;
          this.move({ ...c0, x: (dX > 0 ? A[0] : A[0] - w0) / G.iw, y: (dY > 0 ? A[1] : A[1] - h0) / G.ih, w: w0 / G.iw, h: h0 / G.ih });
          return;
        }
        const dirX = Pp.x >= A[0] ? 1 : -1, dirY = Pp.y >= A[1] ? 1 : -1;
        const maxW = dirX > 0 ? G.iw - A[0] : A[0], maxH = dirY > 0 ? G.ih - A[1] : A[1];
        let w = Math.max(Math.abs(Pp.x - A[0]), Math.abs(Pp.y - A[1]) * G.ar);
        w = Math.min(w, maxW, maxH * G.ar);
        const minW = Math.min((maxCrop(G.iw, G.ih, G.ar).w * G.iw) / 4, maxW, maxH * G.ar);
        w = Math.max(w, minW);
        const hh = w / G.ar;
        this.move({ ...c0, x: (dirX > 0 ? A[0] : A[0] - w) / G.iw, y: (dirY > 0 ? A[1] : A[1] - hh) / G.ih, w: w / G.iw, h: hh / G.ih });
      });
      const up = (e) => { if (!S.pts.has(e.pointerId)) return; S.pts.delete(e.pointerId); if (S.pts.size) { S.pinch = null; S.anchor = null; const a = [...S.pts.values()]; S.c0 = this.live || (this.G && this.G.cur); S.p0 = this.ptOf({ clientX: a[0].x, clientY: a[0].y }, true); S.hit = { type: 'move' }; return; } S.hit = null; S.c0 = null; S.pinch = null; S.anchor = null; this.commit(); };
      el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
      // الكمبيوتر: عجلة الماوس تكبر/تصغر الإطار
      el.addEventListener('wheel', (ev) => { ev.preventDefault(); const G = this.G; const c = G && G.cur; if (!c) return; const k = ev.deltaY < 0 ? 1 / 1.08 : 1.08; const w = c.w * k, hh = (w * G.iw) / (G.ih * G.ar); this.live = { ...clampFor({ ...c, w, h: hh, x: c.x + c.w / 2 - w / 2, y: c.y + c.h / 2 - hh / 2 }, G.iw, G.ih, G.ar, G.mode), orient: G.orient, mode: G.mode, by: 'user' }; this.commit(); }, { passive: false });
    }
  }
  // ---- الاستوديو نفسه: طلب أو أكثر، صفحات طولية (سحب لفوق = الجاية)، حفظ أول بأول
  async function openStudio(ids) {
    if (!ids.length) return;
    stopPolls();
    const root = document.createElement('div'); root.className = 'cf'; document.body.appendChild(root);
    root.innerHTML = `<div class="cfpager"></div><div class="cftop"><button class="cfx2" data-x>${I.x || '✕'}</button><div class="cftt"><b id="cfTitle">قص الصور</b><small id="cfSub">نحمل الطلبات…</small></div></div><div class="cfbot"><div class="cfprog"><i id="cfBar"></i></div><div id="cfMsg" class="cfmsg"></div><div id="cfModes" class="cfmodes"></div><div id="cfTools" class="cftools"></div><div id="cfNav" class="cfnav"></div></div><div class="cfld big" id="cfLoad"><div class="spin"></div><span>نحمل الطلبات…</span></div>`;
    const orders = [];
    // (١٩) أول وحدة تفتح الطلب يصير معها: نحجزه قبل ما نجيب صوره
    for (const id of ids) { try { await api(`app/crop/orders/${id}/claim`, { body: {} }); const r = await api(`app/crop/orders/${id}`); if (r.photos && r.photos.length) orders.push({ ...r.order, sizes: r.sizes, photos: r.photos, id }); } catch (e) { toast(`${errText(e)}`, 'err'); } }
    if (!orders.length) { root.remove(); toast('ما فيه صور تنقص', 'err'); return vCrop(); }
    const famOf = (t) => (/مغناط/.test(t) ? 'magnet' : /ملصق/.test(t) ? 'sticker' : /ألبوم|البوم/.test(t) ? 'album' : /عائل/.test(t) ? 'family' : /A5|15×21|15x21/.test(t) ? 'A5' : '10x15');
    const items = [];
    orders.forEach((o, oi) => { for (const p of o.photos) { const size = o.sizes[p.line_key]; if (!size) continue; items.push({ id: p.id, oid: o.id, oi, line_key: p.line_key, seq: p.seq, size, url: p.url, thumb: p.thumb, w: p.w, h: p.h, crop: p.crop || null, title: size.line || '', family: famOf(size.line || '') }); } });
    if (!items.length) { root.remove(); toast('ما فيه صور تنقص', 'err'); return vCrop(); }
    const seq = buildSeq(items, orders);
    // (لو طلعتي وهي تقص ورجعتي) تكملين من أول صورة ما انحفظ قصها
    let pos = (() => { const k = seq.findIndex((e) => e.t === 'ph' && !items[e.i].crop); if (k >= 0) return k; const l = seq.map((e) => e.t).lastIndexOf('ph'); return l >= 0 ? l : 0; })();
    const drafts = {}; for (const it of items) if (it.crop) drafts[it.id] = { x: it.crop.x, y: it.crop.y, w: it.crop.w, h: it.crop.h, orient: it.crop.orient, by: it.crop.by, ...(it.crop.mode ? { mode: it.crop.mode } : {}) };
    const sugg = {}, disp = {}, dims = {}; const suggBusy = new Set();
    const saved = {}; for (const it of items) if (it.crop) saved[it.id] = ck(it.crop);
    const queue = {}; let flushing = null, flushT = null, retryN = 0, alive = true, closing = false; const jobs = new Set();
    const doneSt = {}; // رقم الطلب → 'wait' | 'ok' | رسالة خطأ
    const pages = new Map(); let ty = 0; const pager = $('.cfpager', root);
    const q = (s) => $(s, root);
    const layout = () => { const W = Math.min(window.innerWidth, 600), H = window.innerHeight; const anyModes = items.some((x) => modesOf(x.size).length > 1); const TOP = 66, BOT = anyModes ? 206 : 166; return { W, H, box: { w: (W - 92) * 0.9, h: Math.max(180, (H - TOP - BOT - 8) * 0.9) }, TOP, BOT }; };
    let L = layout();
    const entryAt = (p) => seq[Math.min(Math.max(0, p), seq.length - 1)];
    const itemOf = (e) => (e && e.t === 'ph' ? items[e.i] : null);
    const idxOf = (e) => (e.t === 'ph' ? e.i : e.t === 'sep' ? (seq.indexOf(e) + 1 < seq.length && seq[seq.indexOf(e) + 1].t === 'ph' ? seq[seq.indexOf(e) + 1].i : items.length) : e.t === 'ord' ? items.findIndex((x) => x.oi === e.oi) : items.length);
    const cropOfItem = (x) => drafts[x.id] || sugg[x.id] || null;
    const dimsOf = (x) => { const d = dims[x.id]; const sg = sugg[x.id]; return d || (x.w && x.h ? { w: x.w, h: x.h } : sg && sg.iw ? { w: sg.iw, h: sg.ih } : { w: 3, h: 2 }); };
    const modeOf = (x) => { const c = cropOfItem(x); const ms = modesOf(x.size); return c && ms.includes(c.mode) ? c.mode : ms[0]; };
    const set = (id, c) => { drafts[id] = c; };
    const pageFor = (it) => { let pg = pages.get(it.id); if (!pg) { pg = new CropPage(it, L.box, { onChange: set, onDims: (id, w, h) => { dims[id] = { w, h }; }, onImgError: refreshUrls }); pages.set(it.id, pg); } return pg; };
    // ---- الحفظ أول بأول: كل صورة تعدّينها لفوق تنحفظ (دفعة كل ثانية ونص)، ولو فشل نعيد بعد شوي
    const cropFor = async (x) => {
      let c = drafts[x.id] || null;
      if (!c) c = sugg[x.id] || null;
      if (!c) { try { c = await suggestCached(x); } catch { c = null; } }
      if (!c) { const { w: iw, h: ih } = dimsOf(x); const o = iw >= ih ? 'l' : 'p'; const ar = arOf(x.size, o); c = { ...(noAI(x.size) ? centerExact(iw, ih, ar) : centerCrop(iw, ih, ar)), orient: o, by: 'ai' }; }
      const ms = modesOf(x.size);
      return { x: c.x, y: c.y, w: c.w, h: c.h, orient: c.orient, by: c.by === 'user' ? 'user' : 'ai', mode: ms.includes(c.mode) ? c.mode : ms[0] };
    };
    const flush = async () => {
      while (flushing) { try { await flushing; } catch {} }
      const list = Object.values(queue); if (!list.length) return true;
      for (const k of Object.keys(queue)) delete queue[k];
      flushing = (async () => {
        let ok = true;
        const byO = {}; for (const e of list) (byO[e.oid] = byO[e.oid] || []).push(e);
        for (const [oid, es] of Object.entries(byO)) {
          try { for (let i = 0; i < es.length; i += 200) await api(`app/crop/orders/${oid}/crops`, { body: { crops: es.slice(i, i + 200).map((e) => ({ id: e.id, crop: e.crop })) } }); for (const e of es) { saved[e.id] = ck(e.crop); const it = items.find((x) => x.id === e.id); if (it) it.crop = { ...e.crop, kind: 'print' }; } }
          catch (err) { ok = false; if (err.code === 'GONE' || err.code === 'NOT_PHONE') { doneSt[oid] = errText(err); } else for (const e of es) if (!queue[e.id]) queue[e.id] = e; }
        }
        return ok;
      })();
      const ok = await flushing; flushing = null; return ok;
    };
    const kick = (ms = 1500) => { if (flushT || !alive) return; flushT = setTimeout(async () => { flushT = null; const ok = await flush(); if (ok) retryN = 0; else if (retryN < 6) { retryN += 1; kick(3000 * retryN); } }, ms); };
    const approve = (x) => { if (!x) return; const job = (async () => { const c = await cropFor(x); if (saved[x.id] === ck(c)) { delete queue[x.id]; return; } queue[x.id] = { id: x.id, oid: x.oid, crop: c }; kick(); })().catch(() => {}); jobs.add(job); job.then(() => jobs.delete(job)); };
    const settle = () => Promise.all([...jobs]);
    // الطلب خلص (عدّيتي آخر صورة فيه): نحفظ اللي باقي ونعلّم الطلب «انقص» — البرنامج يسحبه
    const finishOrder = async (oi) => {
      const o = orders[oi]; if (!o || doneSt[o.id] === 'ok' || doneSt[o.id] === 'wait') return;
      doneSt[o.id] = 'wait'; paintChrome();
      clearTimeout(flushT); flushT = null;
      await settle(); await flush(); while (flushing) { try { await flushing; } catch {} }
      try { await api(`app/crop/orders/${o.id}/done`, { body: {} }); doneSt[o.id] = 'ok'; }
      catch (e) { doneSt[o.id] = errText(e); }
      paintChrome(); paintPages();
    };
    // ---- التحضير بالخلفية: اقتراح القص (الحالية + ٣ قدام، والباقي وهي ما تلمس) · نسخ العرض لكل الصور (الحالية وجيرانها أول)
    const want = async (it) => { if (!it || sugg[it.id] || suggBusy.has(it.id)) return; suggBusy.add(it.id); let c = null; try { c = await suggestCached(it); } catch { c = null; } suggBusy.delete(it.id); if (c) { sugg[it.id] = c; if (alive) paintPages(); } else sugg[it.id] = null; };
    let bgGen = 0;
    const prep = () => {
      const gen = ++bgGen; const idx = idxOf(entryAt(pos));
      (async () => { for (const [i, it] of items.slice(idx, idx + 4).entries()) { if (gen !== bgGen || !alive) return; if (i >= 2) while (alive && gen === bgGen && Date.now() - touchNow.at < 400) await new Promise((r) => setTimeout(r, 150)); await want(it); } })();
      (async () => {
        const order = [items[idx], items[idx + 1], items[idx - 1], items[idx + 2], ...items.slice(idx + 3), ...items.slice(0, Math.max(0, idx - 1)).reverse()].filter(Boolean);
        for (const it of order) { if (gen !== bgGen || !alive) return; if (!it.url || (disp[it.id] && disp[it.id].url === it.url)) continue; if (!dispCache.has(it.url)) { while (alive && gen === bgGen && Date.now() - touchNow.at < 450) await new Promise((r) => setTimeout(r, 120)); if (gen !== bgGen || !alive) return; } const u = await displayOf(it.url); disp[it.id] = { url: it.url, u: u || null }; if (alive && gen === bgGen) paintPages(); }
      })();
    };
    let bgT = null;
    const bgSugg = () => { clearTimeout(bgT); const tick = async () => { if (!alive) return; if (Date.now() - touchNow.at < 1500 || suggBusy.size) { bgT = setTimeout(tick, 800); return; } const idx = idxOf(entryAt(pos)); const next = items.slice(idx).find((x) => sugg[x.id] === undefined) || items.find((x) => sugg[x.id] === undefined); if (!next) return; await want(next); bgT = setTimeout(tick, 350); }; bgT = setTimeout(tick, 3000); };
    // روابط الصور تنتهي بعد ١٥ دقيقة: نجددها (مرة كل دقيقة بالكثير)
    let refreshAt = 0;
    async function refreshUrls() {
      if (Date.now() - refreshAt < 60000) return; refreshAt = Date.now();
      for (const o of orders) { try { const r = await api(`app/crop/orders/${o.id}`); for (const p of r.photos || []) { const it = items.find((x) => x.id === p.id); if (it) { it.url = p.url || it.url; it.thumb = p.thumb || it.thumb; const pg = pages.get(it.id); if (pg) pg.failed = false; } } } catch {} }
      paintPages();
    }
    // ---- الرسم: ٣ صفحات (السابقة · الحالية · الجاية) فوق بعض، والتنقل بسحب الصفحة كلها
    const sepHtml = (e) => e.t === 'fin' ? `<div class="cfsep"><span class="big">✂️</span><b>خلصتي! ${phN(items.length)} جاهزة</b><small>${orders.map((o) => `${esc(o.name || 'عميلة')} #${esc(o.no)}: ${doneSt[o.id] === 'ok' ? 'انحفظ ✓ — البرنامج يسحبه' : doneSt[o.id] === 'wait' ? 'نحفظ…' : doneSt[o.id] ? `⚠ ${esc(doneSt[o.id])}` : 'بانتظار الحفظ'}`).join('<br/>')}</small></div>`
      : e.t === 'ord' ? `<div class="cfsep"><span class="big">🌸</span><small>خلصتي طلب ${esc(orders[e.prev].name || 'عميلة')} 💗${doneSt[orders[e.prev].id] === 'ok' ? ' — انحفظ وينتقل للبرنامج' : doneSt[orders[e.prev].id] === 'wait' ? ' — نحفظه…' : doneSt[orders[e.prev].id] ? ` — ⚠ ${esc(doneSt[orders[e.prev].id])}` : ''}</small><b>دخلتي على طلب جديد</b><em>${esc(orders[e.oi].name || 'عميلة')} · #${esc(orders[e.oi].no)}</em><small>${phN(items.filter((x) => x.oi === e.oi).length)}</small><span class="hint">${I.up}<i>اسحبي للأعلى</i></span></div>`
      : `<div class="cfsep"><span class="big">✂️</span><b>خلصتي قص ${esc(e.a)} 💗</b><small>الحين بنبدأ ب${esc(e.b)}</small><span class="hint">${I.up}<i>اسحبي للأعلى</i></span></div>`;
    const slot = (p, off) => {
      const e = entryAt(p); if (!e || p < 0 || p >= seq.length) return null;
      const d = document.createElement('div'); d.className = 'cfpage'; d.style.top = off + 'px'; d.style.height = L.H + 'px'; d.dataset.key = e.key;
      if (e.t !== 'ph') { d.innerHTML = sepHtml(e); return d; }
      const it = items[e.i]; const pg = pageFor(it);
      const wrap = document.createElement('div'); wrap.className = 'cfbox'; wrap.style.top = L.TOP + 'px'; wrap.style.bottom = L.BOT + 'px';
      const inner = document.createElement('div'); inner.className = 'cfin'; inner.style.width = L.W + 'px'; inner.style.height = L.box.h + 'px';
      pg.setBox(L.box); inner.appendChild(pg.el);
      inner.insertAdjacentHTML('beforeend', `<span class="cfhint l">${I.up}<i>اسحبي<br/>للأعلى</i></span><span class="cfhint r">${I.up}<i>اسحبي<br/>للأعلى</i></span>`);
      wrap.appendChild(inner); d.appendChild(wrap);
      return d;
    };
    let mounted = [];
    function paintPages() {
      if (!alive) return;
      const want2 = [pos - 1, pos, pos + 1].filter((p) => p >= 0 && p < seq.length);
      const keys = want2.map((p) => seq[p].key);
      if (mounted.join() !== keys.join()) {
        pager.innerHTML = '';
        for (const p of want2) { const d = slot(p, (p - pos) * L.H); if (d) pager.appendChild(d); }
        mounted = keys;
      } else {
        // نفس الصفحات: نحدث نص الفواصل بس
        for (const d of pager.children) { const e = seq.find((x) => x.key === d.dataset.key); if (e && e.t !== 'ph') { const h = sepHtml(e); if (d.innerHTML !== h) d.innerHTML = h; } }
      }
      for (const p of want2) { const it = itemOf(seq[p]); if (!it) continue; const pg = pageFor(it); const dd = disp[it.id]; pg.update({ crop: drafts[it.id], sugg: sugg[it.id], show: dd && dd.url === it.url ? dd.u : null, noDisp: !!(dd && dd.url === it.url && !dd.u), active: p === pos }); }
    }
    function paintChrome() {
      if (!alive) return;
      const e = entryAt(pos); const it = itemOf(e); const idx = idxOf(e);
      const o = it ? orders[it.oi] : e.t === 'ord' ? orders[e.oi] : null;
      const oItems = it ? items.filter((x) => x.oi === it.oi) : [];
      q('#cfTitle').textContent = it ? titleOf(it) : e.t === 'ord' ? `${orders[e.oi].name || 'عميلة'} · #${orders[e.oi].no}` : 'قص الصور';
      q('#cfSub').textContent = it ? `${o.name || 'عميلة'} · #${o.no} — صورة ${fmt(oItems.indexOf(it) + 1)} من ${fmt(oItems.length)}${orders.length > 1 ? ` · الطلب ${fmt(it.oi + 1)} من ${fmt(orders.length)}` : ''}` : e.t === 'sep' ? `قصيتي ${fmt(idx)} من ${fmt(items.length)}` : `${phN(items.length)}${orders.length > 1 ? ` · ${fmt(orders.length)} طلبات` : ''}`;
      q('#cfBar').style.width = `${Math.round((Math.min(idx, items.length) / Math.max(1, items.length)) * 100)}%`;
      const modes = it ? modesOf(it.size) : [];
      q('#cfModes').innerHTML = it && modes.length > 1 ? modes.map((m) => `<button data-mode="${m}" class="${modeOf(it) === m ? 'on' : ''}">${MODE_LABEL[m] || m}</button>`).join('') : '';
      q('#cfTools').innerHTML = it && it.size.short !== it.size.long ? `<button data-rot>${I.flip}<span>طولي / عرضي</span></button>` : '';
      const fin = e.t === 'fin';
      q('#cfNav').innerHTML = fin ? `<button class="cfbtn main wide" data-done>تمام ✓</button><button class="cflink" data-go="-1">رجوع للصور</button>` : `<button class="cfbtn" data-go="-1" ${pos > 0 ? '' : 'disabled'}>${I.up}<span>السابقة</span></button><button class="cfbtn main" data-go="1">${I.down}<span>${e.t === 'sep' || e.t === 'ord' ? 'يلا نكمل' : seq[pos + 1] && seq[pos + 1].t === 'fin' ? 'خلصت' : 'التالية'}</span></button>`;
    }
    // ---- التنقل
    let anim = false;
    const go = (d) => {
      if (anim || closing) return;
      const n = Math.max(0, Math.min(seq.length - 1, pos + d));
      if (n === pos) { spring(); return; }
      const e = entryAt(pos); const it = itemOf(e);
      // نزلتي للصورة اللي تحت: اللي فوقها تنعتمد وتنحفظ — ولو كانت آخر صورة في الطلب: الطلب يخلص
      if (d > 0 && it) { approve(it); const nx = entryAt(pos + 1); if (nx.t === 'ord' || nx.t === 'fin') finishOrder(it.oi); }
      anim = true; pager.style.transition = 'transform .22s ease'; pager.style.transform = `translateY(${-d * L.H}px)`;
      setTimeout(() => { pager.style.transition = 'none'; pager.style.transform = 'translateY(0)'; ty = 0; pos = n; anim = false; paintPages(); paintChrome(); prep(); }, 230);
    };
    const spring = () => { pager.style.transition = 'transform .25s ease'; pager.style.transform = 'translateY(0)'; ty = 0; setTimeout(() => { pager.style.transition = 'none'; }, 260); };
    // سحب الصفحة كلها (من المساحة اللي حول الصورة — طبقة اللمس فوق الصورة توقف الحدث)
    const sw = { id: null, y0: 0, x0: 0, t0: 0, on: false };
    root.addEventListener('pointerdown', (e) => { if (e.target.closest('.cftop, .cfbot')) return; sw.id = e.pointerId; sw.y0 = e.clientY; sw.x0 = e.clientX; sw.t0 = Date.now(); sw.on = false; });
    root.addEventListener('pointermove', (e) => { if (sw.id !== e.pointerId || anim) return; const dy = e.clientY - sw.y0, dx = e.clientX - sw.x0; if (!sw.on) { if (Math.abs(dy) > 8 && Math.abs(dy) > Math.abs(dx)) sw.on = true; else return; } touchNow.at = Date.now(); ty = dy; pager.style.transform = `translateY(${dy}px)`; });
    const swUp = (e) => { if (sw.id !== e.pointerId) return; sw.id = null; if (!sw.on) return; const dy = e.clientY - sw.y0; const vy = dy / Math.max(1, Date.now() - sw.t0); if (dy < -70 || vy < -0.6) go(1); else if (dy > 70 || vy > 0.6) go(-1); else spring(); };
    root.addEventListener('pointerup', swUp); root.addEventListener('pointercancel', swUp);
    const onKey = (e) => { if (e.key === 'ArrowDown' || e.key === 'PageDown') go(1); if (e.key === 'ArrowUp' || e.key === 'PageUp') go(-1); };
    window.addEventListener('keydown', onKey);
    root.addEventListener('click', async (e) => {
      const b = e.target.closest('button'); if (!b) return;
      const it = itemOf(entryAt(pos));
      if (b.dataset.go) return go(Number(b.dataset.go));
      if (b.hasAttribute('data-x')) return close();
      if (b.hasAttribute('data-done')) return close(true);
      if (b.hasAttribute('data-rot') && it) { const c = cropOfItem(it); if (!c) return; const { w: iw, h: ih } = dimsOf(it); const mode = modeOf(it); const o2 = c.orient === 'l' ? 'p' : 'l'; const ar2 = arOf(it.size, o2); if (isFillM(mode)) { const F = fitFrame(iw, ih, ar2); const cx = c.x + c.w / 2, cy = c.y + c.h / 2; set(it.id, { ...clampFill({ x: cx - F.w / 2, y: cy - F.h / 2, w: F.w, h: F.h }, iw, ih, ar2), orient: o2, mode, by: 'user' }); } else set(it.id, { ...reorient(c, iw, ih, ar2), orient: o2, mode, by: 'user' }); paintPages(); return; }
      if (b.dataset.mode && it) {
        const m = b.dataset.mode; const c = cropOfItem(it); const cm = modeOf(it); if (cm === m) return;
        const { w: iw, h: ih } = dimsOf(it);
        if (isFillM(m) && isFillM(cm) && c) set(it.id, { ...c, mode: m, by: 'user' });
        else { const o = iw >= ih ? 'l' : 'p'; if (isFillM(m)) set(it.id, { ...fillDefault(iw, ih, arOf(it.size, o)), orient: o, mode: m, by: 'user' }); else { const sg = sugg[it.id]; const base = sg ? { x: sg.x, y: sg.y, w: sg.w, h: sg.h, orient: sg.orient } : { ...centerCrop(iw, ih, arOf(it.size, o)), orient: o }; set(it.id, { ...base, mode: m, by: 'user' }); } }
        paintPages(); paintChrome();
      }
    });
    // طلعتي من التطبيق (قفلتي الشاشة / رحتي لتطبيق ثاني): نحفظ على طول
    const vis = () => { if (document.visibilityState === 'hidden') { clearTimeout(flushT); flushT = null; flush(); } };
    document.addEventListener('visibilitychange', vis); window.addEventListener('pagehide', vis);
    const onResize = () => { L = layout(); mounted = []; paintPages(); };
    window.addEventListener('resize', onResize);
    // «X»: نحفظ اللي عدّيتيه ونطلع — والصورة اللي أنتي عليها تبقى للمرة الجاية · «تمام»: كل الطلبات خلصت
    async function close(allDone) {
      if (closing) return; closing = true;
      clearTimeout(flushT); flushT = null; clearTimeout(bgT); bgGen++;
      q('#cfMsg').textContent = 'نحفظ قصك… لحظات';
      await Promise.race([(async () => { await settle(); await flush(); })(), new Promise((r) => setTimeout(r, 6000))]);
      if (allDone) for (const [oi, o] of orders.entries()) if (doneSt[o.id] !== 'ok') { await Promise.race([finishOrder(oi), new Promise((r) => setTimeout(r, 8000))]); }
      alive = false;
      window.removeEventListener('keydown', onKey); window.removeEventListener('resize', onResize); document.removeEventListener('visibilitychange', vis); window.removeEventListener('pagehide', vis);
      for (const o of orders) if (doneSt[o.id] !== 'ok') api(`app/crop/orders/${o.id}/claim`, { body: { release: true } }).catch(() => {});
      root.remove(); st.cropSel = new Set();
      const n = items.filter((x) => x.crop).length;
      if (allDone) { const okN = orders.filter((o) => doneSt[o.id] === 'ok').length; toast(okN === orders.length ? `💗 انحفظ القص — ${okN === 1 ? 'الطلب ينتقل للبرنامج' : `${fmt(okN)} طلبات تنتقل للبرنامج`}` : 'بعض الطلبات ما خلصت — تلقينها في القائمة', okN === orders.length ? 'ok' : 'err'); }
      else if (n) toast(`✓ انحفظ قص ${phN(n)} — تكملين من مكانك`, 'ok');
      vCrop();
    }
    q('#cfLoad').remove();
    paintPages(); paintChrome(); prep(); bgSugg();
  }

  /* ---------- تواصل الفريق ---------- */
  const PRIO = { 'very-urgent': '⚡⚡ مستعجل جداً', urgent: '⚡ مستعجل' };
  const STATUS_TXT = { new: 'جديدة', seen: 'شافتها', 'in-progress': 'جاري التنفيذ', done: 'تم ✓', closed: 'مغلقة 🔒' };
  const DEFAULT_REASONS = ['ناقص صور', 'صور مكررة', 'استفسار من العميلة', 'مراجعة قبل الطباعة', 'تعديل على الطلب', 'مستعجل'];
  async function loadThreads() { const r = await api('app/threads'); usersCache = r.users || usersCache; if (r.users) K.set('users', r.users); return r; }
  const threadsOf = () => K.get('threads');
  function vTeam(tab) {
    if (!can('team')) { on({}); return paint(page(top({ title: 'تواصل الفريق', sq: sq('team', I.chat) }) + empty('🔒', 'ما عندك صلاحية'), 'team'), 'team'); }
    if (tab) st.threadsTab = tab;
    on({ click: (a, el) => { if (a === 'tab') { st.threadsTab = el.dataset.tab; history.replaceState(null, '', `#${PFX}team/${el.dataset.tab}`); paint(html(threadsOf()), 'team', true); } if (a === 'newT') newTask(); if (a === 'newR') newRef(); } });
    const item = (t) => { const m = (t.messages || [])[0]; const who = t.from && t.from.id === me().id ? `إلى ${esc(t.to && (t.to.name || t.to.deptName) || '')}` : `من ${esc(t.from && t.from.name || '')}`; return `<a class="row th ${t.unread ? 'un' : ''}" data-key="${esc(t.id)}" href="${href(`thread/${encodeURIComponent(t.id)}`)}"><span class="av" style="${avStyle(t.from && t.from.name)}">${esc(((t.from && t.from.name) || 'م').slice(0, 1))}</span><span class="t"><b>${esc(t.order && t.order.name ? t.order.name : t.reason || 'مهمة')}${t.order && t.order.no ? `<em>#${esc(t.order.no)}</em>` : ''}</b><small>${who} · ${esc(m ? m.text : t.note || '')}</small><div class="flags">${t.priority && PRIO[t.priority] ? `<span class="urg">${PRIO[t.priority]}</span>` : ''}<span>${esc(t.kind === 'task' ? '📝 مهمة' : '↗ تحويل')}</span>${t.reason && t.kind !== 'task' ? `<span>${esc(t.reason)}</span>` : ''}<span class="${t.status === 'done' || t.status === 'closed' ? '' : 'site'}">${esc(STATUS_TXT[t.status] || t.status || '')}</span>${t.pending ? '<span class="pend">⏳</span>' : ''}</div></span><span class="k gr tm">${esc(when(t.lastAt || t.createdAt))}${t.unread ? '<i class="dot"></i>' : ''}</span></a>`; };
    const html = (r, err) => {
      if (!r) return err ? page(top({ title: 'تواصل الفريق', sq: sq('team', I.chat) }) + empty('📡', esc(errText(err))), 'team') : page(top({ title: 'تواصل الفريق', sq: sq('team', I.chat) }) + '<div class="spin"></div>', 'team');
      const c = r.counts || {}; const cur2 = st.threadsTab;
      const tabs = [['inbox', 'مرسولة لي', c.inbox], ['sent', 'أرسلتها', c.sent], ...(isAdmin() ? [['all', 'كل المفتوحة', c.all]] : []), ['archive', 'المؤرشفة', c.archive]];
      const list = (r.lists && r.lists[cur2]) || (cur2 === 'inbox' ? r.threads : []) || [];
      return page(top({ title: 'تواصل الفريق', sub: `${fmt(c.inbox || 0)} مرسولة لي`, sq: sq('team', I.chat), right: `<button class="act" data-act="newR">↗ تحويل</button><button class="act" data-act="newT">${I.plus} مهمة</button>` }) + `
        <div class="strip">${tabs.map(([k, l, n]) => `<button data-act="tab" data-tab="${k}" class="${cur2 === k ? 'on' : ''}">${l}<b>${fmt(n || 0)}</b></button>`).join('')}</div>
        <div class="olist">${list.length ? list.map(item).join('') : empty('💬', cur2 === 'inbox' ? 'ما فيه مهام مرسولة لك' : 'ما فيه شي هنا')}</div>`, 'team');
    };
    return view({ key: 'team', cacheKey: 'threads', keep: true, load: loadThreads, every: 15000, html });
  }
  const pickUsers = (users, multi) => `<div class="pick" id="pk">${users.filter((u) => u.id !== me().id).map((u) => `<button data-u="${esc(u.id)}" data-n="${esc(u.name)}">${esc(u.name)}</button>`).join('')}</div>`;
  const pickInit = (sh, multi) => { $('#pk', sh).onclick = (e) => { const b = e.target.closest('[data-u]'); if (!b) return; if (multi) b.classList.toggle('on'); else $$('#pk button', sh).forEach((x) => x.classList.toggle('on', x === b)); }; $$('.tg', sh).forEach((t) => { t.onclick = () => t.classList.toggle('on'); }); };
  async function newTask(order) {
    const users = await usersList();
    const v = await sheet(`<h3>📝 مهمة جديدة</h3><p>تطلع لها في «تواصل الفريق» على الجوال والكمبيوتر</p><div class="field"><label>لمين؟ (تقدرين تختارين أكثر من وحدة)</label>${pickUsers(users, true)}</div><div class="field"><input class="in" id="tt" placeholder="عنوان المهمة" value="${order ? esc(`طلب #${order.no} — ${order.name || ''}`) : ''}"/></div><div class="field"><textarea class="in" id="tn" placeholder="التفاصيل (اختياري)"></textarea></div><div class="perm"><span>⚡ مستعجل</span><button class="tg" id="tu"></button></div><div class="perm"><span>❗ رسالة مهمة<small>تطلع لها في نافذة كبيرة ما تنقفل إلا لما تفتح تواصل الفريق</small></span><button class="tg" id="ti"></button></div><button class="btn p" data-r="ok">إرسال</button><button class="btn ghost" data-r="x">إلغاء</button>`, { init: (sh) => pickInit(sh, true), collect: (sh, r) => r !== 'ok' ? null : { to: $$('#pk .on', sh).map((b) => ({ id: b.dataset.u, name: b.dataset.n })), title: $('#tt', sh).value.trim(), note: $('#tn', sh).value.trim(), urgent: $('#tu', sh).classList.contains('on'), important: $('#ti', sh).classList.contains('on') } });
    if (!v) return;
    if (!v.to.length) return toast('اختاري لمين', 'err');
    if (!v.title && !v.note) return toast('اكتبي المهمة', 'err');
    try { await api('app/threads', { body: { kind: 'task', ...v, order: order ? { no: order.no, name: order.name } : null } }); toast('✓ انرسلت — البرنامج يسجلها خلال دقيقة', 'ok'); go('team/sent'); } catch (e) { toast(errText(e), 'err'); }
  }
  // (٩ + ٢٠) تحويل جديد مثل البرنامج: ابحثي عن الطلب برقمه أو اسم العميلة ← لمين ← السبب ← التصنيف ← ملاحظة
  async function newRef(order) {
    const users = await usersList();
    const th = threadsOf(); const reasons = (th && th.reasons && th.reasons.length ? th.reasons : DEFAULT_REASONS);
    const all = [...ordersOf('wa'), ...ordersOf('site')];
    let chosen = order || null;
    const v = await sheet(`<h3>↗ تحويل جديد</h3>
      <div class="search rf">${I.search}<input id="rq" placeholder="ابحثي برقم الطلب أو اسم العميلة…" autocomplete="off" ${chosen ? '' : 'autofocus'}/></div><div id="rres" class="rres"></div>
      <div id="rsel" class="rsel"></div>
      <div class="field"><label>إلى</label>${pickUsers(users, true)}</div>
      <div class="field"><label>سبب التحويل</label><div class="pick" id="rs">${reasons.map((x) => `<button data-reason="${esc(x)}">${esc(x)}</button>`).join('')}<button data-other="1">＋ سبب ثاني</button></div><input class="in" id="rsx" placeholder="اكتبي السبب…" style="display:none;margin-top:6px"/></div>
      <div class="perm"><span>⚡ مستعجل</span><button class="tg" id="ru"></button></div><div class="perm"><span>❗ رسالة مهمة<small>تطلع لها في نافذة كبيرة ما تنقفل إلا لما تفتح تواصل الفريق</small></span><button class="tg" id="ri"></button></div>
      <div class="field"><textarea class="in" id="rn" placeholder="ملاحظتك…"></textarea></div>
      <button class="btn p" data-r="ok">إرسال التحويل</button><button class="btn ghost" data-r="x">إلغاء</button>`, { init: (sh) => {
        pickInit(sh, true);
        const drawSel = () => { $('#rsel', sh).innerHTML = chosen ? `<div class="rfo"><div><b>${esc(chosen.name || 'عميلة')}</b><small>#${esc(chosen.no)} · ${esc(stageLabel(chosen))}${prodTxt(chosen) ? ` · ${esc(prodTxt(chosen))}` : ''}</small></div><button type="button" id="rclr">✕</button></div>` : '<div class="hint">🔎 ابحثي عن الطلب أولاً</div>'; const c = $('#rclr', sh); if (c) c.onclick = () => { chosen = null; drawSel(); }; };
        const dOnly = (x) => String(x || '').replace(/\D/g, '');
        $('#rq', sh).oninput = () => { const q = $('#rq', sh).value.trim(); const host = $('#rres', sh); if (q.length < 2) { host.innerHTML = ''; return; } const qd = dOnly(q); const res = all.filter((o) => (qd.length >= 3 && dOnly(o.no).includes(qd)) || (!/^\d+$/.test(q) && String(o.name || '').toLowerCase().includes(q.toLowerCase()))).slice(0, 8); host.innerHTML = res.length ? res.map((o) => `<button type="button" data-pick="${esc(o.no)}"><b>${esc(o.name || 'عميلة')}</b><span>#${esc(o.no)} · ${esc(stageLabel(o))}</span></button>`).join('') : '<div class="hint">ما لقينا طلب</div>'; $$('[data-pick]', host).forEach((b) => { b.onclick = () => { chosen = all.find((o) => String(o.no) === b.dataset.pick); host.innerHTML = ''; $('#rq', sh).value = ''; drawSel(); }; }); };
        $('#rs', sh).onclick = (e) => { const b = e.target.closest('button'); if (!b) return; if (b.dataset.other) { b.classList.toggle('on'); $('#rsx', sh).style.display = b.classList.contains('on') ? 'block' : 'none'; if (b.classList.contains('on')) $('#rsx', sh).focus(); return; } $$('#rs [data-reason]', sh).forEach((x) => x.classList.toggle('on', x === b && !x.classList.contains('on'))); };
        drawSel();
      }, collect: (sh, r) => { if (r !== 'ok') return null; const rb = $('#rs [data-reason].on', sh); const other = $('#rsx', sh).value.trim(); return { order: chosen, to: $$('#pk .on', sh).map((b) => ({ id: b.dataset.u, name: b.dataset.n })), reason: other || (rb ? rb.dataset.reason : ''), note: $('#rn', sh).value.trim(), urgent: $('#ru', sh).classList.contains('on'), important: $('#ri', sh).classList.contains('on') }; } });
    if (!v) return;
    if (!v.order) return toast('اختاري الطلب أول', 'err');
    if (!v.to.length) return toast('اختاري لمين', 'err');
    if (!v.reason && !v.note) return toast('اكتبي السبب أو ملاحظة', 'err');
    try { await api('app/threads', { body: { kind: 'ref', to: v.to, title: `${v.order.name || ''}`, note: v.note || v.reason, reason: v.reason, urgent: v.urgent, important: v.important, order: { no: v.order.no, name: v.order.name } } }); toast('✓ انرسل التحويل — البرنامج يسجله خلال دقيقة', 'ok'); go('team/sent'); } catch (e) { toast(errText(e), 'err'); }
  }
  // المحادثة — مثل الواتساب: الرأس وصندوق الكتابة ثابتين، الرسائل بس تتحرك، إرسال فوري، إيموجي
  const EMOJIS = ['👍', '❤️', '🤍', '😊', '🙏', '👌', '✅', '🌸', '😂', '🥰', '✨', '⚡', '📸', '✂️', '🖨️', '📦', '🙋‍♀️', '👏'];
  function vThread(id) {
    const key = 'thread.' + id;
    on({
      click: (a, el) => {
        if (a === 'send') return sendMsg(id);
        if (a === 'emo') { st.emo = !st.emo; paint(html(K.get(key)), key, true); const i = $('#cIn'); if (i && !st.emo) i.focus(); }
        if (a === 'ins') { const i = $('#cIn'); if (!i) return; const s = i.selectionStart || i.value.length; i.value = i.value.slice(0, s) + el.dataset.e + i.value.slice(s); i.focus(); i.selectionStart = i.selectionEnd = s + el.dataset.e.length; grow(i); }
        if (a === 'imp') { el.classList.toggle('on'); }
        if (a === 'st') setStatus(id, el.dataset.st);
        if (a === 'retry') { const d = K.get(key); const m = d && (d.thread.messages || []).find((x) => x.id === el.dataset.m); if (m) { m.failed = false; K.set(key, d); paint(html(d), key, true); pushMsg(id, m); } }
      },
      key: (t, e) => { if (t.id === 'cIn' && e.key === 'Enter' && !e.shiftKey && !/Mobi|Android|iPhone/i.test(navigator.userAgent)) { e.preventDefault(); sendMsg(id); } },
      input: (t) => { if (t.id === 'cIn') grow(t); },
    });
    const grow = (t) => { t.style.height = 'auto'; t.style.height = Math.min(120, t.scrollHeight) + 'px'; };
    const html = (d, err) => {
      const t = d && d.thread;
      if (!t) return `<div class="chat">${top({ title: 'المحادثة', back: true })}<div class="cbody">${err ? empty('📡', esc(errText(err))) : '<div class="spin"></div>'}</div></div>`;
      const mine = (m) => m.byId === me().id;
      const msgs = (t.messages || []).map((m) => m.kind === 'system' || m.kind === 'reminder' ? `<div class="msg sys" data-key="${esc(m.id)}">${esc(m.text)} · ${esc(when(m.at))}</div>` : `<div class="msg ${mine(m) ? 'me' : ''} ${m.important ? 'imp' : ''} ${m.pending ? 'pend' : ''} ${m.failed ? 'fail' : ''}" data-key="${esc(m.id)}">${mine(m) ? '' : `<b>${m.important ? '❗ ' : ''}${esc(m.byName || '')}</b>`}${esc(m.text || '')}${m.photos && m.photos.length ? `<div class="flags"><span>📎 ${m.photos.length === 1 ? 'صورة على الكمبيوتر' : `${fmt(m.photos.length)} صور على الكمبيوتر`}</span></div>` : ''}<time>${esc(when(m.at))}${m.pending ? ' · ⏳' : ''}${m.failed ? ` · <button data-act="retry" data-m="${esc(m.id)}">ما انرسلت — أعيدي</button>` : ''}</time></div>`).join('');
      const recipient = (t.to && t.to.id === me().id) || (Array.isArray(t.cc) && t.cc.some((c) => c.id === me().id));
      const open2 = !['done', 'closed'].includes(t.status);
      const btns = [];
      if (open2 && recipient) btns.push(`<button class="btn aq sm" data-act="st" data-st="done">✓ خلصت</button>`);
      if (open2 && !recipient && (isAdmin() || (t.from && t.from.id === me().id))) btns.push(`<button class="btn sm" data-act="st" data-st="closed">🔒 إغلاق</button>`);
      if (!open2 && (isAdmin() || (t.from && t.from.id === me().id))) btns.push(`<button class="btn sm" data-act="st" data-st="in-progress">↩ رجّعيها مفتوحة</button>`);
      if (t.order && t.order.no && canOrders()) btns.push(`<a class="btn sm" href="${href(`order/${encodeURIComponent(t.order.no)}`)}">فتح الطلب</a>`);
      return `<div class="chat">${top({ title: esc(t.order && t.order.name ? t.order.name : t.reason || 'مهمة'), sub: `${t.kind === 'task' ? '📝 مهمة' : '↗ تحويل'}${t.reason && t.kind !== 'task' ? ` · ${esc(t.reason)}` : ''} · من ${esc(t.from && t.from.name || '')} إلى ${esc(t.to && (t.to.name || t.to.deptName) || '')}${t.cc && t.cc.length ? ` +${fmt(t.cc.length)}` : ''} · ${esc(STATUS_TXT[t.status] || '')}${t.statusPending ? ' ⏳' : ''}`, back: true, right: t.priority && PRIO[t.priority] ? `<span class="k u">${PRIO[t.priority]}</span>` : '' })}
        ${btns.length ? `<div class="cbtns">${btns.join('')}</div>` : ''}
        <div class="cbody" id="cbody"><div class="msgs">${msgs || empty('💬', 'ما فيه رسائل')}</div></div>
        ${st.emo ? `<div class="emos">${EMOJIS.map((e) => `<button data-act="ins" data-e="${e}">${e}</button>`).join('')}</div>` : ''}
        <div class="compose"><button class="imp ${st.impOn ? 'on' : ''}" data-act="imp" id="cImp" title="رسالة مهمة">❗</button><button class="emo ${st.emo ? 'on' : ''}" data-act="emo">${I.smile}</button><textarea id="cIn" rows="1" placeholder="اكتبي رسالة…" autocomplete="off"></textarea><button class="send" data-act="send">${I.send}</button></div>
      </div>`;
    };
    const scrollBottom = (force) => { const b = $('#cbody'); if (!b) return; const near = b.scrollHeight - b.scrollTop - b.clientHeight < 160; if (force || near) b.scrollTop = b.scrollHeight; };
    let first = true;
    st.redrawThread = () => { paint(html(K.get(key)), key, true); const b = $('#cbody'); if (b) b.scrollTop = b.scrollHeight; };
    // رسالتي اللي لسه ما وصلت السيرفر تبقى ظاهرة (ما تختفي وترجع) — تندمج مع نسخة السيرفر
    const load = async () => { const r = await api(`app/threads/${encodeURIComponent(id)}`); const d = K.get(key); if (r && r.thread && d && d.thread) { const have = new Set((r.thread.messages || []).map((m) => String(m.id))); const local = (d.thread.messages || []).filter((m) => m.pending && String(m.id).startsWith('l-') && !have.has(String(m.id))); if (local.length) r.thread.messages = [...(r.thread.messages || []), ...local]; } return r; };
    return view({ key, cacheKey: key, keep: true, load, every: 10000, html, after: () => { scrollBottom(first); first = false; fitChat(); } });
  }
  // الكيبورد على الآيفون: الصفحة ما ترتفع — المحادثة بس تصغر
  function fitChat() { const c = $('.chat'); if (!c) return; const vv = window.visualViewport; const h = vv ? vv.height : window.innerHeight; c.style.height = h + 'px'; c.style.top = (vv ? vv.offsetTop : 0) + 'px'; window.scrollTo(0, 0); }
  if (window.visualViewport) { window.visualViewport.addEventListener('resize', () => { fitChat(); const b = $('#cbody'); if (b) b.scrollTop = b.scrollHeight; }); window.visualViewport.addEventListener('scroll', fitChat); }
  async function sendMsg(id) {
    const i = $('#cIn'); const txt = i ? i.value.trim() : ''; if (!txt) return;
    const key = 'thread.' + id; const d = K.get(key); if (!d || !d.thread) return;
    const important = $('#cImp') && $('#cImp').classList.contains('on');
    const m = { id: 'l-' + Date.now(), at: new Date().toISOString(), byId: me().id, byName: me().name, text: txt, kind: 'reply', important, pending: true };
    d.thread.messages = [...(d.thread.messages || []), m]; d.thread.lastAt = m.at; K.set(key, d);
    i.value = ''; i.style.height = 'auto'; if ($('#cImp')) $('#cImp').classList.remove('on'); st.emo = false;
    if (st.redrawThread) st.redrawThread(); else render();
    if (i) i.focus();
    pushMsg(id, m);
  }
  async function pushMsg(id, m) {
    const key = 'thread.' + id;
    try { const r = await api(`app/threads/${encodeURIComponent(id)}/reply`, { body: { text: m.text, important: !!m.important } }); const d = K.get(key); if (d && d.thread) { const x = (d.thread.messages || []).find((y) => y.id === m.id); if (x) { x.id = 'p-' + (r.cmd && r.cmd.id ? r.cmd.id : m.id); } K.set(key, d); } }
    catch (e) { const d = K.get(key); if (d && d.thread) { const x = (d.thread.messages || []).find((y) => y.id === m.id); if (x) x.failed = true; K.set(key, d); if (route() === `thread/${encodeURIComponent(id)}`) { if (st.redrawThread) st.redrawThread(); else render(); } } toast(errText(e), 'err'); }
  }
  async function setStatus(id, status) {
    try { await api(`app/threads/${encodeURIComponent(id)}/status`, { body: { status } }); const key = 'thread.' + id; const d = K.get(key); if (d && d.thread) { d.thread.status = status; d.thread.statusPending = true; K.set(key, d); } toast('✓', 'ok'); render(); } catch (e) { toast(errText(e), 'err'); }
  }

  /* ---------- المالية ---------- */
  const MONTHS = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
  const mLabel = (m) => { const p = String(m || '').split('-'); return p[1] ? MONTHS[Number(p[1]) - 1] || m : m; };
  function vFinance() {
    if (!can('finance')) { on({}); return paint(page(top({ title: 'القسم المالي', back: true }) + empty('🔒', 'للمديرة بس'), 'sections'), 'fin'); }
    on({ click: (a) => { if (a === 'add') { const r = K.get('finance'); addFinance(r && r.finance); } } });
    const html = (r, err) => {
      if (!r) return err ? page(top({ title: 'القسم المالي', back: true }) + empty('📡', esc(errText(err))), 'sections') : spinner('القسم المالي', 'sections');
      const f = r.finance; const pend = r.pending || [];
      const months = (f && f.months) || []; const mx = Math.max(1, ...months.map((m) => Number(m.sales) || 0));
      return page(top({ title: 'القسم المالي', sub: f ? `${mLabel(f.month)} · آخر تحديث ${when(f.updated_at)}` : 'بانتظار البرنامج', back: true, sq: sq('fin', I.wallet) }) + (f ? `
        <div class="fcards"><div class="fcard wide"><small>صافي الربح هالشهر</small><b class="g">${money(f.profit)}</b></div><div class="fcard"><small>المبيعات</small><b class="a">${money(f.sales)}</b></div><div class="fcard"><small>المصاريف</small><b class="r">${money(f.expenses)}</b></div>${f.orders ? `<div class="fcard"><small>الطلبات</small><b>${fmt(f.orders)}</b></div>` : ''}${f.salaries != null ? `<div class="fcard"><small>الرواتب هالشهر</small><b>${money(f.salaries)}</b></div>` : ''}</div>
        ${months.length ? `<div class="chartbox"><h3>المبيعات آخر ${fmt(months.length)} أشهر</h3><div class="bars">${months.map((m, i) => `<i class="${i === months.length - 1 ? 'pk' : ''}" style="height:${Math.max(3, Math.round(100 * (Number(m.sales) || 0) / mx))}%" title="${money(m.sales)}"></i>`).join('')}</div><div class="bars-l">${months.map((m) => `<span>${esc(mLabel(m.m))}</span>`).join('')}</div></div>` : ''}
        ${pend.length ? `<div class="sec">تنتظر البرنامج</div>${pend.map((p) => `<div class="row"><span class="av" style="background:#fff8e6;color:#7a5a00">⏳</span><span class="t"><b>${esc(p.payload.desc || p.payload.cat || '')}</b><small>${esc(p.by_name)} · ${esc(when(p.at))}${p.state === 'failed' ? ` · ✗ ${esc(p.result || '')}` : ''}</small></span><span class="k x">− ${money(p.payload.amount)}</span></div>`).join('')}` : ''}
        <div class="sec">آخر العمليات</div>
        ${(f.recent || []).length ? f.recent.map((x) => `<div class="row"><span class="av" style="${x.kind === 'sales' ? 'background:#e6f6ee;color:#15804f' : 'background:#fdeaea;color:#c62828'}">${x.kind === 'sales' ? '+' : '−'}</span><span class="t"><b>${esc(x.desc || x.cat || '')}</b><small>${esc(x.cat || '')}${x.by ? ` · ${esc(x.by)}` : ''} · ${esc(x.date || '')}</small></span><span class="k ${x.kind === 'sales' ? 'g' : 'x'}">${x.kind === 'sales' ? '+' : '−'} ${money(x.amount)}</span></div>`).join('') : empty('💰', 'ما فيه عمليات بعد')}
        <button class="fab" data-act="add">${I.plus}</button>` : '<div class="note">بيانات المالية تجي من البرنامج على الكمبيوتر — افتحي البرنامج بحساب المديرة وتوصل خلال دقيقة</div>'), 'sections');
    };
    return view({ key: 'fin', cacheKey: 'finance', keep: true, load: () => api('app/finance'), every: 60000, html });
  }
  async function addFinance(f) {
    const cats = (f && f.cats) || ['مصاريف تشغيل', 'بضائع', 'رواتب', 'إعلانات', 'إيجارات', 'فواتير'];
    const today = new Date(); const iso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const v = await sheet(`<h3>تسجيل مصروف</h3><p>ينسجل في برنامج المالية على الكمبيوتر خلال دقيقة</p><div class="field"><label>التصنيف</label><div class="segs" id="cats">${cats.map((c, i) => `<button data-c="${esc(c)}" class="${i === 0 ? 'on' : ''}">${esc(c)}</button>`).join('')}</div></div><div class="field"><label>البند</label><input class="in" id="fd" placeholder="مثال: ورق طباعة لامع" autofocus/></div><div class="two"><div class="field" style="flex:1"><label>المبلغ (ر.س)</label><input class="in" id="fa" type="number" inputmode="decimal" placeholder="0"/></div><div class="field" style="flex:1"><label>التاريخ</label><input class="in" id="fdt" type="date" value="${iso}"/></div></div><div class="field"><label>ملاحظة</label><input class="in" id="fn" placeholder="اختياري"/></div><button class="btn p" data-r="ok">حفظ</button><button class="btn ghost" data-r="x">إلغاء</button>`, { init: (sh) => { $('#cats', sh).onclick = (e) => { const b = e.target.closest('[data-c]'); if (b) $$('#cats button', sh).forEach((x) => x.classList.toggle('on', x === b)); }; }, collect: (sh, r) => r !== 'ok' ? null : { kind: 'expense', cat: ($('#cats .on', sh) || {}).dataset?.c || '', desc: $('#fd', sh).value.trim(), amount: Number($('#fa', sh).value), date: $('#fdt', sh).value, note: $('#fn', sh).value.trim() } });
    if (!v) return;
    if (!(v.amount > 0)) return toast('اكتبي المبلغ', 'err');
    if (!v.desc) return toast('اكتبي البند', 'err');
    try { await api('app/finance/add', { body: v }); toast('✓ انرسل للبرنامج', 'ok'); vFinance(); } catch (e) { toast(errText(e), 'err'); }
  }

  /* ---------- مراجعة إنجاز الموظفات ---------- */
  function vReview(range) {
    if (!can('review')) { on({}); return paint(page(top({ title: 'إنجاز الموظفات', back: true }) + empty('🔒', 'للمديرة بس'), 'sections'), 'rev'); }
    st.revRange = range || st.revRange || 'week';
    on({ click: (a, el) => { if (a === 'r') { st.revRange = el.dataset.r; paint(html(K.get('review')), 'rev', true); } } });
    const html = (r, err) => {
      if (!r) return err ? page(top({ title: 'إنجاز الموظفات', back: true }) + empty('📡', esc(errText(err))), 'sections') : spinner('إنجاز الموظفات', 'sections');
      const rv = r.review; const att = r.attendance || {};
      const list = rv && rv[st.revRange] ? rv[st.revRange] : [];
      return page(top({ title: 'إنجاز الموظفات', sub: rv ? `آخر تحديث ${when(rv.updated_at)}` : 'بانتظار البرنامج', back: true, sq: sq('rev', I.review) }) + `
        <div class="seg">${[['today', 'اليوم'], ['week', 'هالأسبوع'], ['month', 'هالشهر']].map(([k, l]) => `<button data-act="r" data-r="${k}" class="${st.revRange === k ? 'on' : ''}">${l}</button>`).join('')}</div>
        ${rv ? (list.length ? list.map((s) => { const a = att.staff && att.staff[s.id]; return `<div class="srow" data-key="${esc(s.id)}"><div class="h"><span class="orb sm" style="${orbStyle(s)}">${esc((s.name || '').slice(0, 1))}</span><span class="t"><b>${esc(s.name)}</b><small>${esc(s.title || s.spec || '')}</small></span>${a ? `<span class="k ${a.in ? 'g' : 'gr'}">${a.in ? '✓ حاضرة' : 'ما سجلت حضور'}</span>` : ''}</div><div class="stat3"><div><b>${fmt(s.orders)}</b>طلب</div><div><b>${fmt(s.images)}</b>صورة</div><div><b>${fmt(Math.round((s.hours || 0) * 10) / 10)}</b>ساعات</div>${s.referrals != null ? `<div><b>${fmt(s.referrals)}</b>تحويل</div>` : ''}</div>${s.by ? `<div class="flags" style="margin-top:6px">${Object.entries(s.by).filter(([, v]) => v).map(([k, v]) => `<span>${esc(k)}: ${fmt(v)}</span>`).join('')}</div>` : ''}</div>`; }).join('') : empty('🌸', 'ما فيه إنجاز مسجل في هالفترة')) : '<div class="note">بيانات الإنجاز تجي من البرنامج على الكمبيوتر — افتحي البرنامج بحساب المديرة وتوصل خلال دقايق</div>'}`, 'sections');
    };
    return view({ key: 'rev', cacheKey: 'review', keep: true, load: () => api('app/review'), every: 60000, html });
  }

  /* ---------- إدارة الحسابات ---------- */
  const SEC_TXT = { orders: ['الطلبات (واتساب + الموقع)', 'عرض وملاحظات ونقل — بدون صور'], crop: ['قسم القص', 'تشوف طلبات القص وتقص من الجوال'], clarify: ['قسم التوضيح', ''], print: ['قسم الطباعة', ''], audit: ['التدقيق والمطابقة', ''], finance: ['القسم المالي', 'عرض وتسجيل'], depts: ['تتبع الطلبات', ''], review: ['مراجعة إنجاز الموظفات', ''], accounts: ['إدارة الحسابات', ''], team: ['تواصل الفريق', ''], salla: ['ربط سلة', ''] };
  const SPEC_TXT = [['save', 'الحفظ'], ['cut', 'القص'], ['clarify', 'التوضيح'], ['print', 'الطباعة'], ['match', 'التدقيق والمطابقة'], ['scan', 'المسح الضوئي'], ['service', 'خدمة العملاء']];
  const SPEC_SEC = { cut: ['crop'], clarify: ['clarify'], print: ['print'], match: ['audit'], scan: ['audit'], save: ['orders'], service: ['orders'] };
  function vAccounts() {
    if (!isAdmin()) { on({}); return paint(page(top({ title: 'إدارة الحسابات', back: true }) + empty('🔒', 'للمديرة بس'), 'sections'), 'acc'); }
    on({ click: (a, el) => { const r = K.get('accounts'); if (!r) return; if (a === 'u') editUser((r.users || []).find((u) => u.id === el.dataset.u), r.sections); if (a === 'new') newUser(r.sections); } });
    const html = (r, err) => {
      if (!r) return err ? page(top({ title: 'إدارة الحسابات', back: true }) + empty('📡', esc(errText(err))), 'sections') : spinner('إدارة الحسابات', 'sections');
      const users = r.users || [];
      return page(top({ title: 'إدارة الحسابات', sub: `${fmt(users.filter((u) => u.role !== 'admin' && u.active).length)} موظفات + المديرة`, back: true, sq: sq('acc', I.users) }) + users.map((u) => `<button class="row" data-key="${esc(u.id)}" data-act="u" data-u="${esc(u.id)}"><span class="orb sm ${u.role === 'admin' ? 'adm' : ''}" style="${orbStyle(u)}">${u.role === 'admin' ? I.crown : esc((u.name || '').slice(0, 1))}</span><span class="t"><b>${esc(u.name)}</b><small>${esc(u.title || (u.role === 'admin' ? 'المديرة' : 'موظفة'))}${u.last_seen ? ` · آخر دخول ${esc(when(u.last_seen))}` : ' · ما دخلت بعد'}${u.pin_set_at ? '' : ' · <i>بدون رقم سري</i>'}</small></span><span class="k ${!u.active ? 'x' : u.role === 'admin' ? '' : 'gr'}">${!u.active ? 'معطّل' : u.role === 'admin' ? 'المديرة' : 'موظفة'}</span></button>`).join('') + `<div class="hint">اضغطي الحساب تغيرين أقسامه أو رقمه السري أو تحذفينه. الحسابات نفسها حسابات البرنامج: اللي تضيفينه أو تحذفينه هنا يتغير في البرنامج خلال دقيقة.</div><button class="fab" data-act="new">${I.plus}</button>`, 'sections');
    };
    return view({ key: 'acc', cacheKey: 'accounts', keep: true, load: () => api('app/admin/users'), every: 60000, html });
  }
  function permsHtml(sections, on2) { return sections.filter((s) => SEC_TXT[s]).map((s) => `<div class="perm"><span>${SEC_TXT[s][0]}${SEC_TXT[s][1] ? `<small>${SEC_TXT[s][1]}</small>` : ''}</span><button class="tg ${on2.includes(s) ? 'on' : ''}" data-s="${s}"></button></div>`).join(''); }
  async function editUser(u, sections) {
    if (!u) return;
    const v = await sheet(`<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px"><span class="orb sm" style="${orbStyle(u)}">${esc((u.name || '').slice(0, 1))}</span><div><h3 style="margin:0">${esc(u.name)}</h3><p style="margin:0">${esc(u.title || (u.role === 'admin' ? 'المديرة — كل الأقسام' : 'موظفة'))}</p></div></div>
      ${u.role === 'admin' ? '' : `<div id="perms">${permsHtml(sections, u.sections_effective || [])}</div>`}
      <div class="field" style="margin-top:12px"><label>رقم سري جديد للجوال (4–8 أرقام) — اتركيه فاضي لو ما تبين تغيرينه</label><input class="in" id="pin" inputmode="numeric" placeholder="••••" maxlength="8"/></div>
      ${u.role === 'admin' || u.id === me().id ? '' : `<div class="perm"><span>الحساب شغال<small>لو أوقفتيه ما تقدر تدخل البرنامج ولا الجوال (مثل «إيقاف» في البرنامج)</small></span><button class="tg ${u.active ? 'on' : ''}" id="act"></button></div>`}
      <div class="two" style="margin-top:12px"><button class="btn ghost" data-r="x" style="flex:1">إلغاء</button><button class="btn p" data-r="ok" style="flex:1">حفظ</button></div>
      ${u.role === 'admin' || u.id === me().id ? '' : `<button class="btn ghost danger" data-r="del" style="width:100%;margin-top:8px">🗑 حذف الحساب</button>`}`, { init: (sh) => { $$('.tg', sh).forEach((t) => { t.onclick = () => t.classList.toggle('on'); }); }, collect: (sh, r) => { if (r === 'del') return { del: true }; if (r !== 'ok') return null; const o = {}; if (u.role !== 'admin') o.sections = $$('#perms .tg.on', sh).map((t) => t.dataset.s); const p = $('#pin', sh).value.trim(); if (p) o.pin = p; const a = $('#act', sh); if (a) o.active = a.classList.contains('on'); return o; } });
    if (!v) return;
    if (v.del) return delUser(u);
    if (v.pin && !/^\d{4,8}$/.test(v.pin)) return toast('الرقم السري من 4 إلى 8 أرقام', 'err');
    try { const r = await api(`app/admin/users/${encodeURIComponent(u.id)}`, { body: v }); toast(r.cmd ? '✓ انحفظ — والبرنامج يطبّقه خلال دقيقة' : '✓ انحفظ', 'ok'); usersCache = null; vAccounts(); } catch (e) { toast(errText(e), 'err'); }
  }
  async function delUser(u) {
    const ok = await confirmBox('حذف الحساب؟', `حساب <b>${esc(u.name)}</b> بينحذف من الجوال الحين ومن البرنامج خلال دقيقة. سجل حضورها وإنتاجها يبقى محفوظ في البرنامج.`, 'حذف', 'danger');
    if (!ok) return;
    try { await api(`app/admin/users/${encodeURIComponent(u.id)}/delete`, { body: {} }); toast('✓ انحذف الحساب', 'ok'); usersCache = null; vAccounts(); } catch (e) { toast(errText(e), 'err'); }
  }
  async function newUser(sections) {
    const v = await sheet(`<h3>حساب جديد</h3><p>ينضاف هنا وفي البرنامج (بدون رقم سري للكمبيوتر — تحطينه من البرنامج لو احتاجت).</p>
      <div class="field"><label>الاسم</label><input class="in" id="nn" autofocus/></div>
      <div class="field"><label>الصفة (اختياري)</label><input class="in" id="nt" placeholder="مثال: مختصة طباعة"/></div>
      <div class="field"><label>الاختصاص</label><div class="pick" id="specs">${SPEC_TXT.map(([k, t]) => `<button data-sp="${k}">${t}</button>`).join('')}</div></div>
      <div class="field"><label>الرقم السري للجوال (4–8 أرقام)</label><input class="in" id="np" inputmode="numeric" maxlength="8"/></div>
      <div class="field"><label>أقسام الجوال</label></div><div id="perms">${permsHtml(sections, ['orders', 'team'])}</div>
      <div class="two" style="margin-top:12px"><button class="btn ghost" data-r="x" style="flex:1">إلغاء</button><button class="btn p" data-r="ok" style="flex:1">إضافة</button></div>`, { init: (sh) => {
        $$('.tg', sh).forEach((t) => { t.onclick = () => { t.classList.toggle('on'); t.dataset.touched = '1'; }; });
        $$('#specs button', sh).forEach((c) => { c.onclick = () => { c.classList.toggle('on'); const on2 = new Set(['orders', 'team']); $$('#specs .on', sh).forEach((x) => (SPEC_SEC[x.dataset.sp] || []).forEach((s) => on2.add(s))); $$('#perms .tg', sh).forEach((t) => { if (!t.dataset.touched) t.classList.toggle('on', on2.has(t.dataset.s)); }); }; });
      }, collect: (sh, r) => r !== 'ok' ? null : { name: $('#nn', sh).value.trim(), title: $('#nt', sh).value.trim(), specialties: $$('#specs .on', sh).map((c) => c.dataset.sp), pin: $('#np', sh).value.trim(), sections: $$('#perms .tg.on', sh).map((t) => t.dataset.s) } });
    if (!v) return;
    if (!v.name) return toast('اكتبي الاسم', 'err');
    if (!/^\d{4,8}$/.test(v.pin)) return toast('الرقم السري من 4 إلى 8 أرقام', 'err');
    try { await api('app/admin/users', { body: v }); toast('✓ انضاف الحساب — ويطلع في البرنامج خلال دقيقة', 'ok'); usersCache = null; vAccounts(); } catch (e) { toast(errText(e), 'err'); }
  }

  /* ---------- الأقسام · الإعدادات ---------- */
  const tile3 = (k, ic, t, href2, bdg) => `<a class="tile" href="${href(href2)}"><span class="ic" style="background:${P[k][0]};color:${P[k][1]}">${ic}</span><b>${t}</b>${bdg ? `<span class="bdg">${bdg}</span>` : ''}</a>`;
  function workTiles(withTeam) {
    const h = K.get('home'); const c = (h && h.counts) || {};
    const work = [];
    if (can('orders')) { work.push(tile3('site', I.cloud, 'طلبات الموقع', 'orders/site')); work.push(tile3('wa', I.wa, 'طلبات الواتساب', 'orders/wa')); }
    if (can('crop')) work.push(tile3('crop', I.cut, 'قسم القص', 'crop', c.crop ? fmt(c.crop) : ''));
    if (can('clarify')) work.push(tile3('clar', I.spark, 'قسم التوضيح', 'clarify', c.clarify ? fmt(c.clarify) : ''));
    if (can('print')) work.push(tile3('print', I.print, 'قسم الطباعة', 'print', c.print ? fmt(c.print) : ''));
    if (can('audit')) work.push(tile3('audit', I.puzzle, 'التدقيق والمطابقة', 'audit', c.audit ? fmt(c.audit) : ''));
    if (can('finance')) work.push(tile3('fin', I.wallet, 'القسم المالي', 'finance'));
    if (withTeam && can('team')) work.push(tile3('team', I.chat, 'تواصل الفريق', 'team', h && h.unread ? fmt(h.unread) : ''));
    return work;
  }
  function vSections() {
    const h = K.get('home');
    const work = workTiles(true);
    const adm = [];
    if (can('depts')) adm.push(tile3('dept', I.truck, 'تتبع الطلبات', 'depts'));
    if (can('review')) adm.push(tile3('rev', I.review, 'إنجاز الموظفات', 'review'));
    if (isAdmin()) { adm.push(tile3('acc', I.users, 'إدارة الحسابات', 'accounts')); adm.push(tile3('sec', I.gear, 'الإعدادات', 'settings')); }
    const u = me();
    on({ click: async (a) => { if (a === 'lo') { if (await confirmBox('تسجيل الخروج؟', 'ترجعين لشاشة الحسابات', 'إي، خروج')) { try { await api('app/logout', { body: {} }); } catch {} logoutLocal(); } } } });
    paint(page(top({ title: 'الأقسام', sub: 'كل أقسام البرنامج', sq: sq('sec', I.grid) }) + `${work.length ? `<div class="sec">أقسام العمل</div><div class="tiles c3">${work.join('')}</div>` : ''}${adm.length ? `<div class="sec">المتابعة والإدارة</div><div class="tiles c3">${adm.join('')}</div>` : ''}<div class="me"><span class="orb sm ${u.role === 'admin' ? 'adm' : ''}" style="${orbStyle(u)}">${u.role === 'admin' ? I.crown : esc((u.name || '').slice(0, 1))}</span><span class="t"><b>${esc(u.name || '')} · ${esc(u.role === 'admin' ? 'المديرة' : u.title || 'موظفة')}</b><small>${st.sync && st.sync.at ? `البرنامج: آخر تحديث ${esc(when(st.sync.at))}` : 'بانتظار البرنامج'} · الإصدار ${esc(V)}</small></span><button class="out" data-act="lo">${I.logout} خروج</button></div>`, 'sections'), 'sections');
  }
  function vSettings() {
    if (!isAdmin()) return go('sections', true);
    on({ click: async (a, el) => { if (a === 'pc') { const on2 = !el.classList.contains('on'); try { const r = await api('app/settings', { body: { phoneCrop: on2 } }); st.settings = r.settings; el.classList.toggle('on', st.settings.phoneCrop); toast(st.settings.phoneCrop ? '✓ القص من الجوال مشغّل' : 'القص من الجوال مطفي', 'ok'); } catch (err) { toast(errText(err), 'err'); } } if (a === 'snd') { store.set('silent', store.get('silent') === '1' ? null : '1'); el.classList.toggle('on', store.get('silent') !== '1'); } } });
    paint(page(top({ title: 'الإعدادات', back: true, sq: sq('sec', I.gear) }) + `
      <div class="card"><div class="perm"><span>✂ القص من الجوال<small>مشغّل = طلبات الموقع تظهر في قسم القص (الجوال والكمبيوتر) وأول وحدة تفتح الطلب يصير معها</small></span><button class="tg ${st.settings.phoneCrop ? 'on' : ''}" data-act="pc"></button></div><div class="perm"><span>🔔 صوت التنبيه<small>لما توصل رسالة في تواصل الفريق</small></span><button class="tg ${store.get('silent') !== '1' ? 'on' : ''}" data-act="snd"></button></div></div>
      <div class="card"><h3>الاتصال</h3><div class="facts"><div>السيرفر<b>${esc(API.replace(/^https?:\/\//, '').split('/')[0])}</b></div><div>البرنامج<b>${st.sync && st.sync.at ? `${esc(st.sync.pc || '')} · ${esc(when(st.sync.at))}` : 'ما وصل شي بعد'}</b></div><div>إصدار التطبيق<b>${esc(V)}</b></div><div>إصدار البرنامج<b>${esc((st.sync && st.sync.version) || '—')}</b></div></div></div>
      <div class="note">الأرقام السرية للجوال تحطينها من «إدارة الحسابات» هنا، أو من البرنامج على الكمبيوتر (الإعدادات ← تطبيق الجوال).</div>`, 'sections'), 'settings');
  }

  /* ---------- التنبيهات (رسالة جديدة في تواصل الفريق تطلع في أي صفحة) ---------- */
  function noticeCheck(h) {
    const l = h && h.latest; if (!l || !l.at) return;
    const seen = st.seenAt || store.get('seenAt') || '';
    if (!seen) { st.seenAt = l.at; store.set('seenAt', l.at); return; }
    if (l.at <= seen) return;
    st.seenAt = l.at; store.set('seenAt', l.at);
    if (l.fromId === me().id) return;
    const onIt = route() === `thread/${encodeURIComponent(l.id)}`;
    if (onIt) { vThread(l.id); return; }
    banner(`${l.from || 'الفريق'}${l.title ? ` · ${l.title}` : ''}`, l.text || 'رسالة جديدة', `thread/${encodeURIComponent(l.id)}`);
    if (store.get('silent') !== '1') ding();
    if (route().startsWith('team')) vTeam();
    const d = $('.dock a[href$="team"] .n'); if (!d) { const a = $('.dock a[href$="team"]'); if (a) a.insertAdjacentHTML('beforeend', '<span class="n">!</span>'); }
  }
  let noticeT = null;
  function startNotices() { clearInterval(noticeT); noticeT = setInterval(async () => { if (!st.user || document.visibilityState !== 'visible' || st.online === false) return; if (route() === 'home') return; try { const h = await loadHome(); K.set('home', h); } catch {} }, 15000); }

  /* ---------- التوجيه والتشغيل ---------- */
  function staffOff() { if (!/^#mmstaffoff/.test(location.hash)) return false; store.set('token', null); try { localStorage.removeItem('mm-staff'); localStorage.removeItem('mm-staff-html'); } catch {} location.reload(); return true; }
  async function render() {
    if (staffOff()) return;
    stopPolls();
    const r = route();
    if (!st.user) { if (r !== 'login') go('login', true); return vLogin(); }
    const [a, b, c] = r.split('/').map((x) => { try { return decodeURIComponent(x); } catch { return x; } });
    if (a === 'home') return vHome();
    if (a === 'orders') return vOrders(b || 'site', c);
    if (a === 'order' && b) return vOrder(b);
    if (a === 'crop' && b) return openStudio([b]);
    if (a === 'crop') return vCrop();
    if (a === 'crop3') return vSection('crop3');
    if (a === 'clarify' || a === 'print' || a === 'audit') return vSection(a, b);
    if (a === 'team') return vTeam(b);
    if (a === 'thread' && b) return vThread(b);
    if (a === 'finance') return vFinance();
    if (a === 'depts') return vDepts(b);
    if (a === 'review') return vReview(b);
    if (a === 'accounts') return vAccounts();
    if (a === 'sections') return vSections();
    if (a === 'settings') return vSettings();
    return go('home', true);
  }
  // أول مرة بعد الدخول: نجيب كل شي مرة وحدة عشان التصفح يصير فوري
  async function preload() {
    const jobs = [['home', loadHome]];
    if (canOrders()) { jobs.push(['orders.site', () => loadOrders('site')], ['orders.wa', () => loadOrders('wa')]); }
    if (can('team')) jobs.push(['threads', loadThreads]);
    if (can('crop')) jobs.push(['crop', () => api('app/crop/orders')]);
    if (can('depts') || canOrders()) jobs.push(['depts', () => api('app/depts')]);
    await Promise.all(jobs.map(([k, f]) => f().then((d) => { K.set(k, d); if (k === 'home') noticeCheck(d); }).catch(() => {})));
  }
  async function boot(afterLogin) {
    spTo(35, 'نتأكد من حسابك…');
    if (st.token) {
      try { const r = await api('app/me'); st.user = r.user; st.sync = r.sync; st.settings = r.settings || st.settings; K.load(r.user.id); }
      catch (e) { if (e.code === 'NO_SESSION' || (e.status === 401)) { st.token = ''; st.user = null; store.set('token', null); } else if (e.code === 'OFFLINE') { const uid = store.get('uid'); if (uid) { K.load(uid); const h = K.get('home'); if (h && h.user) { st.user = h.user; st.sync = h.sync; toast('ما فيه اتصال — تشوفين آخر نسخة محفوظة', 'err'); } } } }
    }
    if (st.user) { store.set('uid', st.user.id); spTo(70, 'نجهز بياناتك…'); if (afterLogin || !K.get('home')) await preload(); else preload(); startNotices(); }
    if (st.user && (route() === 'login' || afterLogin)) go('home', true);
    spDone();
    render();
  }
  window.addEventListener('hashchange', staffOff);
  window.addEventListener('hashchange', () => { st.emo = false; render(); });
  window.addEventListener('online', () => { st.online = true; paintSync(); render(); });
  window.addEventListener('offline', () => { st.online = false; paintSync(); });
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && st.user) render(); });
  // على رابط التطبيق الخاص (GitHub Pages مؤقتاً / أوراكل /app/) — داخل متجر سلة ما فيه service worker
  if ('serviceWorker' in navigator && location.protocol === 'https:' && !IN_STORE) { navigator.serviceWorker.register(`sw.js?v=${V}`).catch(() => {}); }
  setTimeout(boot, 200);
})();
