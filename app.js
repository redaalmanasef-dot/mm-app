/* MayarMemories — تطبيق الجوال (5 نوفمبر 2026)
   الجوال ↔ السيرفر فقط. البرنامج على الكمبيوتر يرسل ملخص الطلبات والمهام كل دقيقة ويأخذ «أوامر الجوال» وينفذها ويرد ✓.
   الصور تظهر في قسم القص بس (طلبات الموقع) ولا تنحفظ في الجوال. */
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
  };
  const P = { wa: ['#e6f6ec', '#2f9e63'], site: ['#e7f1fd', '#3b82f6'], crop: ['#fff0e7', '#ea7f3a'], clar: ['#efe8fc', '#8b5cf6'], print: ['#e4f5f7', '#0f9aa7'], audit: ['#ece8fb', '#7c5cd6'], fin: ['#e6f6ee', '#1a9a62'], dept: ['#fff2e0', '#e39012'], rev: ['#f1e8fb', '#8e5bd6'], acc: ['#fde9e2', '#d2552e'], team: ['#fde8ee', '#e0708f'], sec: ['#f1f3f6', '#5b6b73'], aqua: ['#e4f5f7', '#3aa4ae'], rose: ['#fde8ee', '#d9668a'], pay: ['#e6f6ee', '#1a9a62'], red: ['#fdeaea', '#c62828'] };
  const sq = (k, ic) => `<span class="sq" style="background:${P[k][0]};color:${P[k][1]}">${ic}</span>`;
  // ألوان الحسابات: فاتحة وناعمة وبنوتية — نفس درجة لون الحساب في البرنامج بس باستيل (الفقاعة · الحرف · النص)
  const PASTEL = [[345, '#ffe4ec', '#f7b6c9', '#b5476d'], [20, '#ffe9df', '#f8c5b0', '#b3593a'], [45, '#fff4d9', '#f6dc9c', '#8f6a14'], [150, '#e1f7ec', '#ace5c9', '#237a52'], [185, '#dff5f7', '#a6dfe5', '#1f7f8b'], [210, '#e3f0fd', '#afcff5', '#2d64a6'], [235, '#e8e9fd', '#c2c6f5', '#4d52ae'], [265, '#efe5fb', '#cfbaf2', '#6a48ad'], [290, '#f7e4fb', '#e2b9f0', '#8a41a6'], [320, '#fce4f3', '#eeb7da', '#9f3b7d']];
  const hashN = (s) => { let h = 0; for (const ch of String(s || '')) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return h; };
  function hueOf(hex) { const n = parseInt(hex.slice(1), 16); const r = ((n >> 16) & 255) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255; const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn; if (d < .09) return null; let h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h = Math.round(h * 60); return (h + 360) % 360; }
  function pastelOf(u) { const c = u && u.color && /^#[0-9a-f]{6}$/i.test(u.color) ? u.color : null; const h = c ? hueOf(c) : null; if (h == null) return PASTEL[hashN(u?.id || u?.name) % PASTEL.length]; let best = PASTEL[0], bd = 999; for (const p of PASTEL) { const dd = Math.min(Math.abs(p[0] - h), 360 - Math.abs(p[0] - h)); if (dd < bd) { bd = dd; best = p; } } return best; }
  const orbStyle = (u) => { const p = pastelOf(u); return `--c:${p[1]};--d:${p[2]};--t:${p[3]}`; };
  const avStyle = (name) => { const p = PASTEL[hashN(name) % PASTEL.length]; return `background:${p[1]};color:${p[3]}`; };

  /* ---------- الحالة ---------- */
  const st = { token: store.get('token') || '', user: null, route: '', users: [], sync: null, settings: { phoneCrop: false }, home: null, orders: { wa: null, site: null }, tab: { wa: 'all', site: 'all' }, q: '', threadsTab: 'inbox', cropSel: new Set(), polls: [], online: navigator.onLine, lastErr: '' };
  const me = () => st.user || {};
  const isAdmin = () => me().role === 'admin';
  const can = (s) => isAdmin() || (Array.isArray(me().sections) && me().sections.includes(s));

  /* ---------- السيرفر ---------- */
  async function api(path, opt = {}) {
    const h = { 'content-type': 'application/json' };
    if (st.token) h['x-app-token'] = st.token;
    let r;
    try { r = await fetch(`${API}/${path}`, { method: opt.method || (opt.body ? 'POST' : 'GET'), headers: h, body: opt.body ? JSON.stringify(opt.body) : undefined, cache: 'no-store' }); }
    catch (e) { st.online = false; paintSync(); throw Object.assign(new Error('ما فيه اتصال بالإنترنت'), { code: 'OFFLINE' }); }
    st.online = true;
    let j = {}; try { j = await r.json(); } catch {}
    if (r.status === 401 && st.token && !opt.noAuth) { logoutLocal(); throw Object.assign(new Error('انتهت جلستك — سجلي الدخول من جديد'), { code: 'NO_SESSION' }); }
    if (!r.ok) throw Object.assign(new Error((j.error && j.error.message) || 'صار خطأ، جربي مرة ثانية'), { code: (j.error && j.error.code) || 'HTTP' + r.status, status: r.status });
    return j;
  }
  const errText = (e) => (e && e.message) || String(e);

  /* ---------- أدوات الواجهة ---------- */
  let toastT = null;
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

  /* ---------- شاشة البداية ---------- */
  const sp = { fill: $('#spFill'), ld: $('#spLd') };
  const spTo = (p, t) => { if (sp.fill) sp.fill.style.width = p + '%'; if (t && sp.ld) sp.ld.textContent = t; };
  function spDone() { spTo(100); setTimeout(() => { const s = $('#splash'); if (s) s.classList.add('gone'); }, 350); }

  /* ---------- التوجيه ---------- */
  // داخل متجر سلة (مؤقتاً لحد أوراكل) الرابط يبقى دايماً #mmstaff/… عشان «إضافة إلى الشاشة الرئيسية» تفتح التطبيق مو المتجر
  // داخل المتجر = الصفحة انرسمت من boot.js/سنيبت سلة (MM_STORE) أو الدومين دومين المتجر؛ على رابط التطبيق الخاص (GitHub Pages / أوراكل /app/) لا
  const IN_STORE = !!window.MM_STORE || (/(^|\.)mayarmemories\.com$/i.test(location.hostname) && !/\/app\/?$/.test(location.pathname));
  const PFX = IN_STORE ? 'mmstaff/' : '';
  const go = (path, replace) => { if (replace) history.replaceState(null, '', '#' + PFX + path); else location.hash = '#' + PFX + path; if (replace) render(); };
  const back = () => { if (history.length > 1) history.back(); else go('home'); };
  window.addEventListener('hashchange', render);
  function route() { return (location.hash || '#home').slice(1).replace(/^mmstaff\/?/, '').replace(/^\/+/, '') || 'home'; }
  if (PFX) document.addEventListener('click', (e) => { const a = e.target.closest('a[href^="#"]'); if (!a) return; const h = a.getAttribute('href').slice(1); if (/^mmstaff/.test(h)) return; e.preventDefault(); go(h); });

  const DOCK = [['home', I.home, 'الرئيسية'], ['orders', I.box, 'الطلبات'], ['team', I.chat, 'تواصل الفريق'], ['sections', I.grid, 'الأقسام']];
  function dock(on) {
    const n = { orders: (st.home && st.home.counts && st.home.counts.total) || 0, team: (st.home && st.home.unread) || 0 };
    return `<nav class="dock">${DOCK.map(([k, ic, t]) => `<a href="#${k}" class="${k === on ? 'on' : ''}">${ic}${t}${n[k] ? `<span class="n">${fmt(n[k])}</span>` : ''}</a>`).join('')}</nav>`;
  }
  const top = (o) => `<div class="top">${o.back ? `<button class="bk" data-back>${I.back}</button>` : (o.sq || '')}<div class="ttl"><b>${o.title}</b>${o.sub ? `<small>${o.sub}</small>` : ''}</div>${o.right || ''}</div>`;
  const page = (inner, on, cls = '') => `<div class="page ${cls}">${inner}</div>${on ? dock(on) : ''}`;
  const empty = (ic, t) => `<div class="empty"><div class="ic">${ic}</div>${t}</div>`;
  function paintSync() {
    const old = $('.syncbar'); if (old) old.remove();
    if (!st.user) return;
    let txt = '', cls = '';
    if (!st.online) { txt = 'ما فيه اتصال بالإنترنت'; cls = 'red'; }
    else if (st.sync && st.sync.at) { const age = Date.now() - Date.parse(st.sync.at); if (age > 10 * 60000) { txt = `البرنامج مقفل على الكمبيوتر — آخر تحديث ${when(st.sync.at)}`; cls = 'warn'; } }
    else if (st.sync === null) { txt = 'بانتظار البرنامج — ما وصل منه شي بعد'; cls = 'warn'; }
    if (!txt) return;
    const b = document.createElement('div'); b.className = `syncbar ${cls}`; b.textContent = txt; document.body.appendChild(b);
  }
  function stopPolls() { st.polls.forEach(clearInterval); st.polls = []; }
  const poll = (fn, ms) => { st.polls.push(setInterval(() => { if (document.visibilityState === 'visible') fn(); }, ms)); };

  /* ---------- الدخول ---------- */
  function logoutLocal() { st.token = ''; st.user = null; store.set('token', null); stopPolls(); go('login', true); }
  async function vLogin() {
    let html = `<div class="gate"><div class="glogo"><img src="${ASSETS}/icons/logo.png" alt=""/></div><h1>أهلاً بك 🌸</h1><div class="gp">اضغطي فقاعتك</div><div id="bubs"><div class="spin"></div></div></div>`;
    mount(html);
    try {
      const r = await api('app/users', { noAuth: true }); st.users = r.users || [];
      $('#bubs').innerHTML = st.users.length ? `<div class="bubbles">${st.users.map((u, i) => `<button class="bub" data-u="${esc(u.id)}" style="animation-delay:${i * 90}ms"><span class="orb" style="${orbStyle(u)}">${esc(u.name)}</span><small>${esc(u.title || (u.role === 'admin' ? 'المديرة' : 'موظفة'))}</small></button>`).join('')}</div>` : empty('👩‍💻', 'ما فيه حسابات بعد<br/>افتحي البرنامج على الكمبيوتر وشغلي «تطبيق الجوال» من الإعدادات');
      $('#bubs').onclick = (e) => { const b = e.target.closest('[data-u]'); if (b) vPin(st.users.find((u) => u.id === b.dataset.u)); };
    } catch (e) { $('#bubs').innerHTML = empty('📡', esc(errText(e))) + `<div style="padding:0 40px"><button class="btn" data-retry>جربي مرة ثانية</button></div>`; $('[data-retry]').onclick = () => vLogin(); }
  }
  function vPin(u) {
    if (!u) return;
    let pin = '';
    const html = `<div class="gate"><div class="glogo"><img src="${ASSETS}/icons/logo.png" alt=""/></div><div class="pass"><span class="orb" style="${orbStyle(u)}">${esc(u.name)}</span><h2>حياك الله ${esc(u.name)}</h2><div class="gp">${u.has_pin ? 'اكتبي رقمك السري' : 'ما لك رقم سري بعد — تحطه المديرة من البرنامج'}</div><div class="dots" id="dots">${'<i></i>'.repeat(6)}</div><div class="gerr" id="gerr"></div><div class="pad" id="pad">${['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => `<button data-d="${d}">${d}</button>`).join('')}<button class="x" data-back>رجوع<br/>للحسابات</button><button data-d="0">0</button><button class="x" data-del>${I.undo}</button></div></div><div class="gfoot"><button class="btn p" id="goIn">دخول</button></div></div>`;
    mount(html);
    const paint = () => { $$('#dots i').forEach((d, i) => d.classList.toggle('on', i < pin.length)); };
    const submit = async () => {
      if (pin.length < 4) { $('#gerr').textContent = 'الرقم السري 4 أرقام على الأقل'; return; }
      $('#goIn').disabled = true; $('#gerr').textContent = '';
      try {
        const r = await api('app/login', { body: { user_id: u.id, pin }, noAuth: true });
        st.token = r.token; store.set('token', r.token); st.user = r.user;
        await boot(true);
      } catch (e) { $('#gerr').textContent = errText(e); pin = ''; paint(); $('#goIn').disabled = false; }
    };
    $('#pad').onclick = (e) => {
      const b = e.target.closest('button'); if (!b) return;
      if (b.dataset.back !== undefined) return vLogin();
      if (b.dataset.del !== undefined) { pin = pin.slice(0, -1); paint(); return; }
      if (b.dataset.d != null && pin.length < 8) { pin += b.dataset.d; paint(); if (pin.length === 6) submit(); }
    };
    $('#goIn').onclick = submit;
  }

  /* ---------- الرئيسية ---------- */
  const wide = (k, ic, t, sub, bdg, href) => `<a class="tile wide" href="#${href}"><span class="ic" style="background:${P[k][0]};color:${P[k][1]}">${ic}</span><span><b>${t}</b><br/><small>${sub}</small></span>${bdg ? `<span class="bdg">${bdg}</span>` : ''}</a>`;
  const tile = (k, ic, t, sub, bdg, href) => `<a class="tile" href="#${href}"><span class="ic" style="background:${P[k][0]};color:${P[k][1]}">${ic}</span><b>${t}</b>${sub ? `<small>${sub}</small>` : ''}${bdg ? `<span class="bdg">${bdg}</span>` : ''}</a>`;
  async function loadHome() { try { const h = await api('app/home'); st.home = h; st.sync = h.sync; st.settings = h.settings || st.settings; if (h.user) st.user = h.user; } catch (e) { if (e.code !== 'OFFLINE') throw e; } }
  async function vHome() {
    const u = me();
    const h = st.home;
    const c = (h && h.counts) || {};
    const syncTxt = st.sync && st.sync.at ? `آخر تحديث من البرنامج ${when(st.sync.at)}` : 'بانتظار البرنامج';
    const html = page(`
      <div class="brandbar"><img src="${ASSETS}/icons/logo.png" alt=""/></div>
      <div class="greet"><span class="orb md" style="${orbStyle(u)}">${esc((u.name || '').slice(0, 2))}</span><div class="g"><h1>حياك الله ${esc(u.name || '')} 🌸</h1><div class="sub">${syncTxt}</div></div><a class="bell" href="#team">${I.bell}${h && h.unread ? '<i></i>' : ''}</a></div>
      ${can('orders') ? `<div class="nums"><a class="num" href="#orders/wa/1"><b>${fmt(c.awaiting)}</b><span>بانتظار الرفع</span></a><a class="num o" href="#crop"><b>${fmt(c.crop)}</b><span>في القص</span></a><a class="num v" href="#clarify"><b>${fmt(c.clarify)}</b><span>في التوضيح</span></a><a class="num a" href="#depts"><b>${fmt(c.late)}</b><span>متأخرة</span></a></div>` : ''}
      ${can('team') ? `<div class="tiles">${wide('team', I.chat, 'تواصل الفريق', h && h.unread ? `${fmt(h.unread)} ${h.unread === 1 ? 'محادثة جديدة' : 'محادثات جديدة'}` : 'ما فيه جديد', h && h.unread ? fmt(h.unread) : '', 'team')}</div>` : ''}
      ${can('depts') || can('review') ? `<div class="sec">المتابعة</div><div class="tiles">${can('depts') ? tile('dept', I.truck, 'تتبع الطلبات', c.late ? `⏰ ${fmt(c.late)} متأخرة` : 'كل الطلبات وين وصلت', '', 'depts') : ''}${can('review') ? tile('rev', I.review, 'مراجعة إنجاز الموظفات', 'اليوم · هالأسبوع · هالشهر', '', 'review') : ''}</div>` : ''}
      ${isAdmin() ? `<div class="sec">الإدارة</div><div class="tiles">${tile('acc', I.users, 'إدارة الحسابات', 'الموظفات وصلاحياتهن', '', 'accounts')}${tile('site', I.gear, 'الإعدادات', st.settings.phoneCrop ? 'القص من الجوال: مشغّل' : 'القص من الجوال: مطفي', '', 'settings')}</div>` : ''}
      ${installHint()}`, 'home');
    mount(html);
  }
  function installHint() {
    const ios = /iphone|ipad/i.test(navigator.userAgent); const standalone = window.navigator.standalone || matchMedia('(display-mode: standalone)').matches;
    if (standalone || store.get('installHid')) return '';
    return `<div class="install"><b>📲 حطيه على الشاشة الرئيسية</b>${ios ? 'من سفاري: زر المشاركة ⬆︎ ثم «إضافة إلى الشاشة الرئيسية» — يفتح مثل التطبيق باسم MayarMemories.' : 'من قائمة المتصفح ⋮ اختاري «إضافة إلى الشاشة الرئيسية» (أو «تثبيت التطبيق»).'}<button class="btn ghost sm" data-hide-install style="margin:4px 0 0">تمام، فهمت</button></div>`;
  }

  /* ---------- الطلبات ---------- */
  const ST = { 1: ['بانتظار صور العميلة', 'pk'], 8: ['قسم الدفع', 'pk'], 9: ['الطلبات الناقصة', 'pk'], 2: ['الفرز', 'pk'], 3: ['القص', 'aq'], 4: ['التوضيح', 'aq'], 10: ['تدقيق التوضيح', 'aq'], 5: ['الطباعة', 'aq'], 6: ['التدقيق والمطابقة', 'aq'], 7: ['جاري التوصيل', 'aq'] };
  const STAGE_CHIP = { 1: '', 8: '', 9: 'x', 2: 'b', 3: 'm', 4: 'v', 10: 'v', 5: 'u', 6: 'u', 7: 'g' };
  const WA_TABS = [1, 8, 9, 2, 3, 4, 10, 5, 6, 7];
  const SITE_PRE = [['await', 'بانتظار العميلة رفع الصور'], ['uploading', 'قيد الرفع'], ['pulled', 'تم السحب']];
  const SITE_TABS = [3, 4, 10, 5, 6, 7];
  const siteTabOf = (o) => o.pre === 'await' ? 'await' : o.pre === 'uploading' || o.pre === 'ready' ? 'uploading' : o.stage != null && [1, 8, 9, 2].includes(Number(o.stage)) ? 'pulled' : o.stage != null ? String(o.stage) : 'pulled';
  const stageLabel = (o) => o.pre === 'await' ? 'بانتظار العميلة' : o.pre === 'uploading' ? 'قيد الرفع' : o.pre === 'ready' ? (o.phoneCrop && o.phoneCrop.state === 'wait' ? 'القص من الجوال' : o.phoneCrop && o.phoneCrop.state === 'done' ? 'انقص — ينتظر السحب' : 'اكتمل الرفع') : (ST[o.stage] ? ST[o.stage][0] : o.statusLabel || '');
  const stageCls = (o) => o.pre === 'await' ? 'gr' : o.pre === 'uploading' ? 'b' : o.pre === 'ready' ? (o.phoneCrop && o.phoneCrop.state === 'wait' ? 'm' : 'g') : (STAGE_CHIP[o.stage] || '');
  const prodTxt = (o) => (o.products || o.lines || []).map((p) => `${p.label}${p.n && !/صور|\(\s*\d/.test(String(p.label)) ? ` · ${phN(p.n)}` : ''}`).join(' + ') || '';
  function flagsHtml(o) {
    const f = [];
    if (o.urgent) f.push('<span class="urg">⚡ مستعجل</span>');
    if (o.hold) f.push('<span class="hold">⛔ موقوف</span>');
    if (o.late && (o.late.level === 'alert' || o.late.level === 'urgent')) f.push(`<span class="late">⏰ ${o.late.level === 'alert' ? 'متأخر جداً' : 'متأخر'}</span>`);
    if (o.dup && o.dup.n) f.push(`<span class="dup">صور مكررة ${fmt(o.dup.n)}</span>`);
    if (o.old) f.push('<span class="old">عميلة سابقة</span>');
    if (o.flags && o.flags.site && o.src !== 'site') f.push('<span class="site">🌐 الموقع</span>');
    if (o.notes && o.notes.length) f.push(`<span>📝 ${o.notes.length === 1 ? 'ملاحظة' : `${fmt(o.notes.length)} ملاحظات`}</span>`);
    if (o.pending && o.pending.length) f.push(`<span class="pend">⏳ ${o.pending.length === 1 ? 'أمر ينتظر البرنامج' : `${fmt(o.pending.length)} أوامر تنتظر البرنامج`}</span>`);
    return f.length ? `<div class="flags">${f.join('')}</div>` : '';
  }
  function orderRow(o, extra = '') {
    const name = o.name || 'عميلة';
    const sub = o.pre ? (o.pre === 'await' ? `${prodTxt(o)} · ${phN(o.need)} مطلوبة` : `${prodTxt(o)} · رفعت <i>${fmt(o.got)} من ${fmt(o.need)}</i>`) : prodTxt(o);
    const bar = o.pre === 'uploading' && o.need ? `<div class="bar"><i style="width:${Math.min(100, Math.round(100 * (o.got || 0) / o.need))}%"></i></div>` : '';
    const pc = o.phoneCrop && o.phoneCrop.state === 'wait' && o.phoneCrop.cropped ? `<small>انقص <i>${fmt(o.phoneCrop.cropped)} من ${fmt(o.phoneCrop.total)}</i></small>` : '';
    return `<a class="row" href="#order/${encodeURIComponent(o.no)}">${extra}<span class="av" style="${avStyle(name)}">${esc(name.trim().slice(0, 1))}</span><span class="t"><b>${esc(name)}<em>#${esc(o.no)}</em></b><small>${sub}</small>${pc}${bar}${flagsHtml(o)}</span><span class="k ${stageCls(o)}">${esc(stageLabel(o))}</span></a>`;
  }
  async function loadOrders(src) { const r = await api(`app/orders?src=${src}`); st.orders[src] = r.orders || []; st.sync = r.sync; st.settings = r.settings || st.settings; return st.orders[src]; }
  async function vOrders(src, tab) {
    src = src === 'site' ? 'site' : 'wa';
    if (tab) st.tab[src] = tab;
    if (!can('orders')) return mount(page(top({ title: 'الطلبات', sq: sq('rose', I.box) }) + empty('🔒', 'ما عندك صلاحية الطلبات'), 'orders'));
    const render2 = () => {
      const list = st.orders[src] || [];
      const q = st.q.trim().toLowerCase();
      const cur = st.tab[src] || 'all';
      const counts = {};
      for (const o of list) { const k = src === 'wa' ? String(o.stage) : siteTabOf(o); counts[k] = (counts[k] || 0) + 1; }
      const tabs = src === 'wa' ? [['all', 'الكل', '', list.length], ...WA_TABS.map((n) => [String(n), ST[n][0], ST[n][1], counts[String(n)] || 0])] : [['all', 'الكل', '', list.length], ...SITE_PRE.map(([k, l]) => [k, l, 'pk', counts[k] || 0]), ...SITE_TABS.map((n) => [String(n), ST[n][0], 'aq', counts[String(n)] || 0])];
      let rows = list.filter((o) => cur === 'all' || (src === 'wa' ? String(o.stage) === cur : siteTabOf(o) === cur));
      if (q) rows = rows.filter((o) => String(o.no).includes(q) || String(o.name || '').toLowerCase().includes(q));
      const strip = `<div class="strip">${tabs.map(([k, l, c, n]) => `<button data-tab="${k}" class="${c} ${cur === k ? 'on' : ''}">${l}<b>${fmt(n)}</b></button>`).join('')}</div>`;
      const html = page(top({ title: 'الطلبات', sub: `${fmt((st.orders.wa || []).length)} واتساب · ${fmt((st.orders.site || []).length)} الموقع`, sq: sq('rose', I.box), right: `<button class="act" data-reload>${I.refresh}</button>` }) + `
        <div class="seg"><button data-src="wa" class="${src === 'wa' ? 'on' : ''}">${I.wa} الواتساب</button><button data-src="site" class="${src === 'site' ? 'on aq' : ''}">${I.cloud} الموقع</button></div>
        <div class="search">${I.search}<input id="q" placeholder="ابحثي برقم الطلب أو اسم العميلة" value="${esc(st.q)}"/></div>
        ${strip}
        ${src === 'site' && st.settings.phoneCrop && cur !== 'all' && cur === 'uploading' ? '<div class="note aq">الطلبات اللي اكتمل رفعها تنتظر القص من الجوال — تلقينها في «قسم القص»</div>' : ''}
        ${rows.length ? rows.map((o) => orderRow(o)).join('') : empty('🌸', q ? 'ما لقينا طلب بهالبحث' : 'ما فيه طلبات هنا')}`, 'orders');
      mount(html, true);
      const sc = $('.strip'); const on = sc && sc.querySelector('.on'); if (on) sc.scrollLeft = on.offsetLeft - sc.clientWidth / 2 + on.clientWidth / 2;
      $('#q').oninput = (e) => { st.q = e.target.value; const v = e.target.value; clearTimeout(st.qT); st.qT = setTimeout(() => { const pos = $('#q').selectionStart; render2(); const f = $('#q'); if (f) { f.focus(); f.setSelectionRange(pos, pos); } }, 250); };
      $$('.strip [data-tab]').forEach((b) => { b.onclick = () => { st.tab[src] = b.dataset.tab; history.replaceState(null, '', `#${PFX}orders/${src}/${b.dataset.tab}`); render2(); }; });
      $$('[data-src]').forEach((b) => { b.onclick = () => go(`orders/${b.dataset.src}`); });
      const rl = $('[data-reload]'); if (rl) rl.onclick = async () => { rl.style.opacity = '.5'; try { await loadOrders('wa'); await loadOrders('site'); render2(); toast('✓ تحدثت', 'ok'); } catch (e) { toast(errText(e), 'err'); } };
    };
    const have = st.orders[src];
    if (!have) mount(page(top({ title: 'الطلبات', sq: sq('rose', I.box) }) + '<div class="spin"></div>', 'orders'));
    try { if (!st.orders.wa) await loadOrders('wa'); if (!st.orders.site) await loadOrders('site'); await loadOrders(src); render2(); } catch (e) { if (!have) mount(page(top({ title: 'الطلبات', sq: sq('rose', I.box) }) + empty('📡', esc(errText(e))), 'orders')); else { render2(); toast(errText(e), 'err'); } }
    poll(async () => { try { await loadOrders(src); if (route().startsWith('orders')) render2(); } catch {} }, 30000);
  }

  /* ---------- صفحة الطلب ---------- */
  const factsHtml = (o) => {
    const f = Array.isArray(o.facts) && o.facts.length ? o.facts : [['المنتج', prodTxt(o)], ['عدد الصور', o.need ? `${phN(o.need)}${o.sent != null && o.sent !== o.need ? ` (وصلت ${fmt(o.sent)})` : ''}` : '']].filter((x) => x[1]).map(([k, v]) => ({ k, v }));
    return f.length ? `<div class="facts">${f.map((x) => `<div>${esc(x.k)}<b>${esc(x.v)}</b></div>`).join('')}</div>` : '';
  };
  const CMD_TXT = { note: 'إضافة ملاحظة', urgent: 'تصنيف مستعجل', move: 'نقل الطلب', hold: 'توقيف الطلب', release: 'استئناف الطلب', assign: 'تحويل لموظفة', resend_link: 'إعادة رابط الرفع', pc_crop: 'القص على الكمبيوتر' };
  async function vOrder(no) {
    mount(page(top({ title: `الطلب #${esc(no)}`, back: true }) + '<div class="spin"></div>', 'orders'));
    let r;
    try { r = await api(`app/orders/${encodeURIComponent(no)}`); } catch (e) { return mount(page(top({ title: `الطلب #${esc(no)}`, back: true }) + empty('📡', esc(errText(e))), 'orders')); }
    const o = r.order; const site = r.site; const cmds = r.cmds || [];
    const name = o.name || 'عميلة';
    const chips = [];
    if (o.old) chips.push('<span class="pink">عميلة سابقة</span>');
    if (o.shield) chips.push(`<span class="${o.shield.ok ? 'ok' : 'warn'}">🛡 ${esc(o.shield.text || (o.shield.ok ? 'الملفات سليمة' : 'فيه ملاحظة على الملفات'))}</span>`);
    if (o.src === 'site' || (o.flags && o.flags.site)) chips.push('<span class="site">🌐 الموقع</span>');
    if (o.urgent) chips.push(`<span class="warn">⚡ مستعجل${o.urgent.by ? ` · ${esc(o.urgent.by)}` : ''}</span>`);
    if (o.hold) chips.push(`<span class="red">⛔ موقوف${o.hold.reason ? `: ${esc(o.hold.reason)}` : ''}</span>`);
    if (o.late && o.late.level) chips.push(`<span class="red">⏰ ${o.late.level === 'alert' ? 'متأخر جداً' : 'متأخر'}${o.late.days ? ` · ${fmt(o.late.days)} يوم` : ''}</span>`);
    const pend = (o.pending || []).map((p) => `<li><time>${esc(when(p.at))}</time><span>⏳ <b>${esc(p.by)}</b> ${esc(CMD_TXT[p.type] || p.type)} — ينتظر البرنامج</span></li>`).join('');
    const done = cmds.filter((c) => c.state === 'done' || c.state === 'failed').slice(0, 6).map((c) => `<li><time>${esc(when(c.done_at || c.at))}</time><span>${c.state === 'done' ? '✓' : '✗'} <b>${esc(c.by_name)}</b> ${esc(CMD_TXT[c.type] || c.type)}${c.result ? ` — ${esc(c.result)}` : ''}</span></li>`).join('');
    const notes = (o.notes || []).map((n) => `<div class="card" style="background:#fff7e9;border-color:#f7e3bd"><h3 style="color:#7a5a00">📝 ملاحظة${n.by ? ` — ${esc(n.by)}` : ''}${n.at ? ` · ${esc(when(n.at))}` : ''}</h3><div style="font-size:13px;line-height:1.6">${esc(n.text)}</div></div>`).join('');
    const log = (o.log || []).map((l) => `<li><time>${esc(when(l.at))}</time><span>${esc(l.text || '')}</span></li>`).join('');
    const inSuite = o.stage != null;
    const siteBox = site ? `<div class="card"><h3>🌐 الموقع</h3><div class="facts"><div>الرفع<b>${esc(site.photo_state === 'awaiting' ? 'بانتظار العميلة' : site.photo_state === 'uploading' ? `قيد الرفع — ${fmt(site.got)} صورة` : site.photo_state === 'approved' ? 'اكتمل' : 'انسحب للبرنامج')}</b></div>${site.link ? `<div>رابط الرفع<b>${esc(site.link.state === 'open' ? 'مفتوح' : site.link.state === 'locked' ? 'مقفل' : 'منتهي')}${site.link.opens ? ` · فتحته ${fmt(site.link.opens)}` : ''}</b></div>` : ''}${site.phoneCrop ? `<div>القص من الجوال<b>${esc(site.phoneCrop.state === 'wait' ? `بانتظار القص (${fmt(site.phoneCrop.cropped)}/${fmt(site.phoneCrop.total)})` : site.phoneCrop.state === 'done' ? `انقص — ${esc(site.phoneCrop.by)}` : site.phoneCrop.state === 'self' ? 'العميلة قصت بنفسها' : site.phoneCrop.state === 'pc' ? 'على الكمبيوتر' : 'مطفي')}</b></div>` : ''}${site.created_at ? `<div>الطلب<b>${esc(since(site.created_at))}</b></div>` : ''}</div>${site.phoneCrop && site.phoneCrop.state === 'wait' ? `<div class="two" style="margin-top:10px"><a class="btn aq sm" href="#crop/${esc(site.id)}" style="flex:1">✂ اقصيه الحين</a>${isAdmin() ? '<button class="btn sm" data-cmd="pc_crop" style="flex:1">على الكمبيوتر</button>' : ''}</div>` : ''}</div>` : '';
    const acts = inSuite ? `<div class="acts">
        <button data-cmd="note"><span class="ic" style="background:${P.sec[0]};color:${P.sec[1]}">${I.note}</span>إضافة ملاحظة</button>
        <button data-cmd="urgent"><span class="ic" style="background:${P.dept[0]};color:${P.dept[1]}">${I.flash}</span>${o.urgent ? 'إلغاء المستعجل' : 'مستعجل'}</button>
        <button data-cmd="move"><span class="ic" style="background:${P.aqua[0]};color:${P.aqua[1]}">${I.move}</span>نقل الطلب</button>
        <button data-cmd="${o.hold ? 'release' : 'hold'}"><span class="ic" style="background:${P.red[0]};color:${P.red[1]}">${o.hold ? I.play : I.stop}</span>${o.hold ? 'استئناف' : 'توقيف'}</button>
        <button data-cmd="assign"><span class="ic" style="background:${P.team[0]};color:${P.team[1]}">${I.users}</span>تحويل لموظفة</button>
        ${site || o.src === 'site' ? `<button data-cmd="resend_link"><span class="ic" style="background:${P.site[0]};color:${P.site[1]}">${I.link}</span>إعادة الرابط</button>` : `<button data-cmd="assign" data-task="1"><span class="ic" style="background:${P.rev[0]};color:${P.rev[1]}">${I.review}</span>مهمة للفريق</button>`}
      </div>` : '<div class="note">الطلب لسه ما وصل البرنامج — الإجراءات تصير بعد ما البرنامج يسحبه</div>';
    const html = page(top({ title: `الطلب #${esc(no)}`, sub: `${o.src === 'site' || (o.flags && o.flags.site) ? 'طلب موقع' : 'طلب واتساب'}${o.stage_at ? ` · ${esc(since(o.stage_at))}` : ''}`, back: true, right: `<span class="k ${stageCls(o)}" style="font-size:11.5px">${esc(stageLabel(o))}</span>` }) + `
      <div class="card hero"><div style="display:flex;align-items:center;gap:12px"><span class="orb sm" style="${orbStyle({ name })}">${esc(name.trim().slice(0, 1))}</span><div style="flex:1;min-width:0"><b style="font-size:17px;font-weight:800">${esc(name)}</b>${chips.length ? `<div class="mchips">${chips.join('')}</div>` : ''}</div></div></div>
      <div class="card"><h3>تفاصيل الطلب</h3>${factsHtml(o)}</div>
      ${notes}
      ${siteBox}
      ${acts}
      ${pend || done ? `<div class="card" style="margin-top:10px"><h3>أوامر الجوال</h3><ul class="log">${pend}${done}</ul></div>` : ''}
      ${log ? `<div class="card" style="margin-top:10px"><h3>السجل</h3><ul class="log">${log}</ul></div>` : ''}`, 'orders');
    mount(html);
    $$('[data-cmd]').forEach((b) => { b.onclick = () => orderAction(o, b.dataset.cmd, b.dataset.task === '1'); });
    poll(async () => { if (route() === `order/${encodeURIComponent(no)}` && !$('.sheet')) { try { await vOrder(no); } catch {} } }, 20000);
  }
  async function sendCmd(no, body, okMsg) {
    try { const r = await api(`app/orders/${encodeURIComponent(no)}/cmd`, { body }); toast(r.done ? '✓ تم' : (okMsg || '✓ وصل الأمر — البرنامج ينفذه خلال دقيقة'), 'ok'); st.orders = { wa: null, site: null }; vOrder(no); }
    catch (e) { toast(errText(e), 'err'); }
  }
  async function orderAction(o, type, task) {
    const no = o.no;
    if (type === 'note') {
      const v = await sheet(`<h3>إضافة ملاحظة</h3><p>تطلع على صفحة الطلب في البرنامج وللموظفات</p><div class="field"><textarea class="in" id="nt" placeholder="اكتبي الملاحظة…" autofocus></textarea></div><button class="btn p" data-r="ok">حفظ الملاحظة</button><button class="btn ghost" data-r="x">إلغاء</button>`, { collect: (sh, r) => r === 'ok' ? { text: $('#nt', sh).value.trim() } : null });
      if (v && v.text) return sendCmd(no, { type: 'note', text: v.text });
      if (v && !v.text) toast('اكتبي الملاحظة', 'err');
      return;
    }
    if (type === 'urgent') {
      if (o.urgent) { if (await confirmBox('إلغاء التصنيف المستعجل؟', 'يرجع الطلب عادي في كل الأقسام')) return sendCmd(no, { type: 'urgent', on: false }); return; }
      const v = await sheet(`<h3>⚡ تصنيف مستعجل</h3><p>يطلع عليه «مستعجل» في كل الأقسام ويتقدم في القوائم</p><div class="field"><input class="in" id="un" placeholder="سبب الاستعجال (اختياري)"/></div><button class="btn p" data-r="ok">إي، مستعجل</button><button class="btn ghost" data-r="x">إلغاء</button>`, { collect: (sh, r) => r === 'ok' ? { note: $('#un', sh).value.trim() } : null });
      if (v) return sendCmd(no, { type: 'urgent', on: true, note: v.note });
      return;
    }
    if (type === 'move') {
      const ms = o.moveStep || {};
      const v = await sheet(`<h3>نقل الطلب</h3><p>الطلب الحين في <b>${esc(stageLabel(o))}</b>. وين تبين تنقلينه؟</p><div class="two"><button class="btn" data-r="back" style="flex:1" ${ms.back === null ? 'disabled' : ''}>◀ السابق${ms.back && ms.back.label ? `: ${esc(ms.back.label)}` : ''}</button><button class="btn p" data-r="next" style="flex:1" ${ms.next === null ? 'disabled' : ''}>التالي${ms.next && ms.next.label ? `: ${esc(ms.next.label)}` : ''} ▶</button></div><div class="field" style="margin-top:12px"><label>سبب النقل (اختياري)</label><input class="in" id="mr" placeholder="مثال: الصور انقصت على الكمبيوتر"/></div><button class="btn ghost" data-r="x">إلغاء</button>`, { collect: (sh, r) => r === 'back' || r === 'next' ? { dir: r, reason: $('#mr', sh).value.trim() } : null });
      if (v) return sendCmd(no, { type: 'move', dir: v.dir, reason: v.reason });
      return;
    }
    if (type === 'hold') {
      const v = await sheet(`<h3>⛔ توقيف الطلب</h3><p>يوقف في قسمه ولا ينتقل ولا يُشحن لين تستأنفينه</p><div class="field"><input class="in" id="hr" placeholder="سبب التوقيف (لازم)" autofocus/></div><button class="btn red" data-r="ok">توقيف</button><button class="btn ghost" data-r="x">إلغاء</button>`, { collect: (sh, r) => r === 'ok' ? { reason: $('#hr', sh).value.trim() } : null });
      if (v && v.reason) return sendCmd(no, { type: 'hold', reason: v.reason });
      if (v) toast('اكتبي سبب التوقيف', 'err');
      return;
    }
    if (type === 'release') { if (await confirmBox('استئناف الطلب؟', 'يرجع يكمل من مكانه', 'إي، استأنفيه')) return sendCmd(no, { type: 'release' }); return; }
    if (type === 'assign') {
      const users = await usersList();
      const v = await sheet(`<h3>${task ? '📝 مهمة للفريق' : '👩 تحويل لموظفة'}</h3><p>تطلع لها في «تواصل الفريق» مربوطة بهالطلب</p><div class="field"><label>لمين؟</label><div class="pick" id="pk">${users.filter((u) => u.id !== me().id).map((u) => `<button data-u="${esc(u.id)}" data-n="${esc(u.name)}">${esc(u.name)}</button>`).join('')}</div></div><div class="field"><textarea class="in" id="an" placeholder="وش المطلوب؟"></textarea></div><div class="perm"><span>⚡ مستعجل</span><button class="tg" id="au"></button></div><button class="btn p" data-r="ok">إرسال</button><button class="btn ghost" data-r="x">إلغاء</button>`, { init: (sh) => { $('#pk', sh).onclick = (e) => { const b = e.target.closest('[data-u]'); if (b) { $$('#pk button', sh).forEach((x) => x.classList.toggle('on', x === b)); } }; $('#au', sh).onclick = (e) => e.currentTarget.classList.toggle('on'); }, collect: (sh, r) => { if (r !== 'ok') return null; const b = $('#pk .on', sh); return { to_id: b ? b.dataset.u : '', to_name: b ? b.dataset.n : '', note: $('#an', sh).value.trim(), urgent: $('#au', sh).classList.contains('on') }; } });
      if (v && !v.to_id) return toast('اختاري الموظفة', 'err');
      if (v) return sendCmd(no, { type: 'assign', ...v });
      return;
    }
    if (type === 'resend_link') { if (await confirmBox('إعادة رابط الرفع؟', 'البرنامج يجهز رابط جديد للعميلة (الإرسال من الواتساب يدوي مثل الحين)', 'إي، جهزيه')) return sendCmd(no, { type: 'resend_link' }); return; }
    if (type === 'pc_crop') { if (await confirmBox('القص على الكمبيوتر؟', 'ينسحب الطلب للبرنامج ويقص من قسم القص على الكمبيوتر بدل الجوال', 'إي')) return sendCmd(no, { type: 'pc_crop' }); return; }
  }
  let usersCache = null;
  async function usersList() { if (usersCache) return usersCache; try { const r = await api('app/users', { noAuth: true }); usersCache = r.users || []; } catch { usersCache = st.users || []; } return usersCache; }

  /* ---------- الأقسام (قوائم بدون صور): التوضيح · الطباعة · التدقيق والمطابقة ---------- */
  const SECTION_DEF = {
    clarify: { title: 'قسم التوضيح', k: 'clar', ic: I.spark, tabs: [['4', 'التوضيح', [4]], ['10', 'تدقيق التوضيح', [10]], ['5', 'تم التوضيح', [5, 6, 7]]], note: 'التوضيح نفسه يصير على الكمبيوتر. من الجوال تتابعين وتضيفين ملاحظة أو تنقلين الطلب.' },
    print: { title: 'قسم الطباعة', k: 'print', ic: I.print, tabs: [['5', 'جاهزة للطباعة', [5]], ['6', 'تمت الطباعة', [6, 7]]], note: 'الطباعة تصير من الكمبيوتر. هنا تشوفين وش جاهز ووش انطبع.' },
    audit: { title: 'التدقيق والمطابقة', k: 'audit', ic: I.puzzle, tabs: [['6', 'بانتظار التدقيق', [6]], ['hold', 'موقوفة', 'hold'], ['7', 'جاري التوصيل', [7]]], note: '' },
    crop3: { title: 'قسم القص', k: 'crop', ic: I.cut, tabs: [['3', 'في القص', [3]]], note: '' },
  };
  async function vSection(key, tab) {
    const d = SECTION_DEF[key]; if (!d) return go('sections', true);
    if (!can(key === 'crop3' ? 'crop' : key)) return mount(page(top({ title: d.title, back: true }) + empty('🔒', 'ما عندك صلاحية هالقسم'), 'sections'));
    st.secTab = st.secTab || {}; if (tab) st.secTab[key] = tab;
    const cur = st.secTab[key] || d.tabs[0][0];
    mount(page(top({ title: d.title, back: true, sq: sq(d.k, d.ic) }) + '<div class="spin"></div>', 'sections'));
    try { if (!st.orders.wa) await loadOrders('wa'); if (!st.orders.site) await loadOrders('site'); } catch (e) { return mount(page(top({ title: d.title, back: true }) + empty('📡', esc(errText(e))), 'sections')); }
    const all = [...(st.orders.wa || []), ...(st.orders.site || []).filter((o) => o.stage != null)];
    const cnt = (t) => all.filter((o) => t[2] === 'hold' ? !!o.hold : t[2].includes(Number(o.stage))).length;
    const t = d.tabs.find((x) => x[0] === cur) || d.tabs[0];
    const rows = all.filter((o) => t[2] === 'hold' ? !!o.hold : t[2].includes(Number(o.stage))).sort((a, b) => (b.urgent ? 1 : 0) - (a.urgent ? 1 : 0));
    const html = page(top({ title: d.title, sub: `${fmt(cnt(d.tabs[0]))} ${d.tabs[0][1]}`, back: true, sq: sq(d.k, d.ic) }) + `
      <div class="seg">${d.tabs.map((x) => `<button data-tab="${x[0]}" class="${x[0] === cur ? 'on' : ''}">${x[1]} ${fmt(cnt(x))}</button>`).join('')}</div>
      ${rows.length ? rows.map((o) => orderRow(o)).join('') : empty('🌸', 'ما فيه طلبات هنا')}
      ${d.note ? `<div class="note">${d.note}</div>` : ''}`, 'sections');
    mount(html);
    $$('[data-tab]').forEach((b) => { b.onclick = () => vSection(key, b.dataset.tab); });
    poll(async () => { try { st.orders = { wa: null, site: null }; if (route().startsWith(key)) await vSection(key); } catch {} }, 45000);
  }

  /* ---------- القص من الجوال ---------- */
  async function vCrop() {
    if (!can('crop')) return mount(page(top({ title: 'قسم القص', back: true }) + empty('🔒', 'ما عندك صلاحية القص'), 'sections'));
    mount(page(top({ title: 'قسم القص', back: true, sq: sq('crop', I.cut) }) + '<div class="spin"></div>', 'sections'));
    let r;
    try { r = await api('app/crop/orders'); } catch (e) { return mount(page(top({ title: 'قسم القص', back: true }) + empty('📡', esc(errText(e))), 'sections')); }
    st.settings = r.settings || st.settings;
    const list = r.orders || []; const done = r.done || [];
    const sel = st.cropSel; for (const id of [...sel]) if (!list.some((o) => o.site_id === id)) sel.delete(id);
    const tab = st.cropTab || 'todo';
    const nSel = [...sel].length; const nPh = list.filter((o) => sel.has(o.site_id)).reduce((n, o) => n + (o.got || 0), 0);
    const html = page(top({ title: 'قسم القص', sub: list.length ? `${fmt(list.length)} ${list.length === 1 ? 'طلب ينتظرك' : 'طلبات تنتظرك'}` : 'ما فيه طلبات تنتظر', back: true, sq: sq('crop', I.cut), right: can('orders') ? `<a class="act aq" href="#crop3">على الكمبيوتر ${I.back}</a>` : '' }) + `
      <div class="seg"><button data-tab="todo" class="${tab === 'todo' ? 'on' : ''}">الطلبات ${fmt(list.length)}</button><button data-tab="done" class="${tab === 'done' ? 'on' : ''}">تم القص ${fmt(done.length)}</button></div>
      ${!st.settings.phoneCrop ? '<div class="note">«القص من الجوال» مطفي من الإعدادات — البرنامج يسحب الطلبات ويقصها على الكمبيوتر. تقدرين تقصين من هنا بس اللي لسه ما انسحب.</div>' : ''}
      ${tab === 'todo' ? (list.length ? `<div class="hint">حددي طلب أو أكثر وبعدين «ابدئي القص». صور كل طلب تنقص لحالها وتنحفظ على رقمه — ما فيه خلط.</div>` + list.map((o) => `<button class="row" data-sel="${esc(o.site_id)}"><span class="chk ${sel.has(o.site_id) ? 'on' : ''}">${sel.has(o.site_id) ? '✓' : ''}</span><span class="t"><b>${esc(o.name || 'عميلة')}<em>#${esc(o.no)}</em></b><small>${esc(prodTxt(o))} · ${phN(o.got)}</small>${o.phoneCrop && o.phoneCrop.cropped ? `<small>انقص <i>${fmt(o.phoneCrop.cropped)} من ${fmt(o.phoneCrop.total)}</i></small><div class="bar"><i style="width:${Math.round(100 * o.phoneCrop.cropped / Math.max(1, o.phoneCrop.total))}%"></i></div>` : ''}</span><span class="k ${o.lines && o.lines.some((l) => /مغناط/.test(l.label)) ? 'm' : ''}">${o.lines && o.lines.some((l) => /مغناط/.test(l.label)) ? 'مغناطيس' : 'ورقي'}</span></button>`).join('') : empty('✂️', 'ما فيه طلبات تنتظر القص من الجوال')) : (done.length ? done.map((o) => `<div class="row"><span class="av" style="${avStyle(o.name)}">${esc((o.name || 'ع').slice(0, 1))}</span><span class="t"><b>${esc(o.name || 'عميلة')}<em>#${esc(o.no)}</em></b><small>${esc(o.by)} · ${esc(when(o.at))}</small></span><span class="k ${o.pulled ? 'g' : 'b'}">${o.pulled ? 'انتقل للبرنامج ✓' : 'البرنامج يسحب…'}</span></div>`).join('') : empty('🌸', 'ما فيه شي بعد'))}
      ${tab === 'todo' && nSel ? `<button class="cta" id="start">✂ ابدئي قص ${nSel === 1 ? 'طلب' : `${fmt(nSel)} طلبات`} (${phN(nPh)})</button>` : ''}`, 'sections');
    mount(html);
    $$('[data-tab]').forEach((b) => { b.onclick = () => { st.cropTab = b.dataset.tab; vCrop(); }; });
    $$('[data-sel]').forEach((b) => { b.onclick = () => { const id = b.dataset.sel; sel.has(id) ? sel.delete(id) : sel.add(id); vCrop(); }; });
    const s = $('#start'); if (s) s.onclick = () => openStudio([...sel]);
  }
  const SZ_LABEL = (s) => s.label || s.id;
  const MODES = { crop: 'قص', white: 'حواف بيضاء', blur: 'بلور', red: 'حدود حمراء' };
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
  const loadImg = (src) => new Promise((res, rej) => { const im = new Image(); im.crossOrigin = 'anonymous'; im.onload = () => res(im); im.onerror = rej; im.src = src; });
  function centerCrop(iw, ih, ar) { const ia = iw / ih; if (ia > ar) { const w = ar / ia; return { x: (1 - w) / 2, y: 0, w, h: 1 }; } const h = ia / ar; return { x: 0, y: Math.max(0, Math.min(1 - h, (1 - h) * 0.3)), w: 1, h }; }
  async function suggest(im, ar) {
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
    return { ...c, faces: faces.length };
  }
  // ---- استوديو القص: الإطار ثابت بمقاس المنتج، والصورة تتحرك تحته (سحب بإصبع، تكبير بإصبعين)
  async function openStudio(ids) {
    if (!ids.length) return;
    stopPolls();
    const root = document.createElement('div'); root.className = 'studio'; document.body.appendChild(root);
    root.innerHTML = '<div class="stop"><div><b>جاري تجهيز الصور…</b></div></div><div class="stage"><div class="ld"><div class="spin"></div>نحمل الطلبات</div></div>';
    const orders = [];
    for (const id of ids) { try { const r = await api(`app/crop/orders/${id}`); if (r.photos && r.photos.length) orders.push({ ...r.order, sizes: r.sizes, photos: r.photos, id }); } catch (e) { toast(`#${id.slice(0, 6)}: ${errText(e)}`, 'err'); } }
    if (!orders.length) { root.remove(); toast('ما فيه صور تنقص', 'err'); return vCrop(); }
    let oi = 0, pi = 0; const saved = new Set(); let busy = false;
    const cur = () => ({ o: orders[oi], p: orders[oi].photos[pi], size: orders[oi].sizes[orders[oi].photos[pi].line_key] });
    const total = orders.reduce((n, o) => n + o.photos.length, 0);
    const doneN = () => orders.reduce((n, o) => n + o.photos.filter((p) => p.crop).length, 0);
    const view = { im: null, s: 1, tx: 0, ty: 0, orient: 'p', mode: 'crop', faces: null, frame: null, sug: null };
    const stageEl = () => $('.stage', root);
    function frameRect() {
      const el = stageEl(); const W = el.clientWidth, H = el.clientHeight; const { size } = cur();
      const sq1 = size.short === size.long; const ar = sq1 ? 1 : (view.orient === 'l' ? size.long / size.short : size.short / size.long);
      const pad = 34; let fw = W - pad * 2, fh = fw / ar; if (fh > H - pad * 2) { fh = H - pad * 2; fw = fh * ar; }
      return { x: (W - fw) / 2, y: (H - fh) / 2, w: fw, h: fh, ar };
    }
    function applyCrop(c) {
      // c: نسب من الصورة → تحويل الصورة تحت الإطار
      const f = frameRect(); const im = view.im; if (!im) return;
      const iw = im.naturalWidth, ih = im.naturalHeight;
      view.s = f.w / (c.w * iw);
      view.tx = f.x - c.x * iw * view.s; view.ty = f.y - c.y * ih * view.s;
      clamp(); draw();
    }
    function cropOf() {
      const f = frameRect(); const im = view.im; const iw = im.naturalWidth, ih = im.naturalHeight;
      return { x: (f.x - view.tx) / (iw * view.s), y: (f.y - view.ty) / (ih * view.s), w: f.w / (iw * view.s), h: f.h / (ih * view.s) };
    }
    function clamp() {
      const f = frameRect(); const im = view.im; const iw = im.naturalWidth, ih = im.naturalHeight;
      const fill = view.mode === 'white' || view.mode === 'blur';
      const minS = fill ? Math.min(f.w / iw, f.h / ih) * 0.5 : Math.max(f.w / iw, f.h / ih);
      view.s = Math.max(minS, Math.min(view.s, minS * 6));
      const w = iw * view.s, h = ih * view.s;
      if (!fill) { view.tx = Math.min(f.x, Math.max(f.x + f.w - w, view.tx)); view.ty = Math.min(f.y, Math.max(f.y + f.h - h, view.ty)); }
      else { const cx = view.tx + w / 2, cy = view.ty + h / 2; view.tx += Math.max(f.x, Math.min(f.x + f.w, cx)) - cx; view.ty += Math.max(f.y, Math.min(f.y + f.h, cy)) - cy; }
    }
    function draw() {
      const el = stageEl(); const cv = $('canvas', el); if (!cv || !view.im) return;
      const W = el.clientWidth, H = el.clientHeight; const dpr = Math.min(2, window.devicePixelRatio || 1);
      if (cv.width !== Math.round(W * dpr)) { cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); }
      const g = cv.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, W, H);
      g.fillStyle = '#2a252c'; g.fillRect(0, 0, W, H);
      const im = view.im; const w = im.naturalWidth * view.s, h = im.naturalHeight * view.s;
      const f = frameRect(); const fill = view.mode === 'white' || view.mode === 'blur';
      if (fill) { g.fillStyle = view.mode === 'white' ? '#fff' : '#6a6168'; g.fillRect(f.x, f.y, f.w, f.h); }
      if (view.mode === 'blur') { g.save(); g.beginPath(); g.rect(f.x, f.y, f.w, f.h); g.clip(); g.filter = 'blur(14px)'; const k = Math.max(f.w / im.naturalWidth, f.h / im.naturalHeight) * 1.1; g.drawImage(im, f.x + f.w / 2 - im.naturalWidth * k / 2, f.y + f.h / 2 - im.naturalHeight * k / 2, im.naturalWidth * k, im.naturalHeight * k); g.restore(); }
      g.drawImage(im, view.tx, view.ty, w, h);
      // تعتيم برا الإطار
      g.fillStyle = 'rgba(0,0,0,.52)'; g.fillRect(0, 0, W, f.y); g.fillRect(0, f.y + f.h, W, H - f.y - f.h); g.fillRect(0, f.y, f.x, f.h); g.fillRect(f.x + f.w, f.y, W - f.x - f.w, f.h);
      g.strokeStyle = view.mode === 'red' ? '#ff5a5a' : '#fff'; g.lineWidth = 2; g.strokeRect(f.x, f.y, f.w, f.h);
      g.strokeStyle = 'rgba(255,255,255,.3)'; g.lineWidth = 1;
      for (let i = 1; i < 3; i++) { g.beginPath(); g.moveTo(f.x + f.w * i / 3, f.y); g.lineTo(f.x + f.w * i / 3, f.y + f.h); g.stroke(); g.beginPath(); g.moveTo(f.x, f.y + f.h * i / 3); g.lineTo(f.x + f.w, f.y + f.h * i / 3); g.stroke(); }
      if (view.mode === 'red' && cur().size.safe) { const k = cur().size.safe / cur().size.short; g.setLineDash([5, 5]); g.strokeStyle = 'rgba(255,90,90,.7)'; g.strokeRect(f.x + f.w * k, f.y + f.h * k, f.w * (1 - 2 * k), f.h * (1 - 2 * k)); g.setLineDash([]); }
      g.strokeStyle = '#f4a7b9'; g.lineWidth = 4; const L = 18;
      for (const [cx, cy, dx, dy] of [[f.x, f.y, 1, 1], [f.x + f.w, f.y, -1, 1], [f.x, f.y + f.h, 1, -1], [f.x + f.w, f.y + f.h, -1, -1]]) { g.beginPath(); g.moveTo(cx, cy + dy * L); g.lineTo(cx, cy); g.lineTo(cx + dx * L, cy); g.stroke(); }
    }
    function paintShell() {
      const { o, p, size } = cur(); const idx = orders[oi].photos.indexOf(p);
      root.innerHTML = `<div class="stop"><div><b>${esc(o.name || 'عميلة')} · #${esc(o.no)}</b><small>${orders.length > 1 ? `الطلب ${fmt(oi + 1)} من ${fmt(orders.length)} · ` : ''}الصورة ${fmt(idx + 1)} من ${fmt(o.photos.length)} · ${esc(size.line || SZ_LABEL(size))}</small></div><button class="k" id="exit">خروج</button></div>
        <div class="stage"><canvas></canvas><div class="ld" id="ld"><div class="spin"></div>نحمل الصورة…</div><span class="ratio">${esc(SZ_LABEL(size))}</span><span class="faces hidden" id="faces"></span></div>
        <div class="modes">${(size.modes || ['crop']).length > 1 ? (size.modes || ['crop']).map((m) => `<button data-mode="${m}" class="${view.mode === m ? 'on' : ''}">${MODES[m] || m}</button>`).join('') : ''}</div>
        <div class="stools"><button id="bFace" class="on">${I.face}<span>تركيز الوجه</span></button>${size.short !== size.long ? `<button id="bFlip">${I.flip}<span>قلب الإطار</span></button>` : ''}<button id="bReset">${I.camera}<span>الأصل</span></button></div>
        <div class="thumbs">${o.photos.map((ph, i) => `<button data-i="${i}" class="${i === idx ? 'on' : ''}${ph.crop ? ' done' : ''}" style="background-image:url('${esc(ph.thumb || ph.url || '')}')"></button>`).join('')}</div>
        <div class="snav"><button class="btn" id="prev" style="flex:1">◀ السابقة</button><button class="btn p" id="next" style="flex:2">${idx === o.photos.length - 1 ? (oi === orders.length - 1 ? '💗 حفظ وإنهاء' : 'حفظ والطلب التالي ▶') : 'التالية ▶'}</button></div>`;
      const th = $('.thumbs', root); const on = th.querySelector('.on'); if (on) th.scrollLeft = on.offsetLeft - th.clientWidth / 2;
      $('#exit', root).onclick = async () => { if (await confirmBox('خروج من القص؟', `اللي قصيتيه انحفظ (${fmt(doneN())} من ${fmt(total)}). الباقي يبقى بانتظارك.`, 'إي، خروج')) { root.remove(); st.orders = { wa: null, site: null }; vCrop(); } };
      $$('[data-mode]', root).forEach((b) => { b.onclick = () => { view.mode = b.dataset.mode; $$('[data-mode]', root).forEach((x) => x.classList.toggle('on', x === b)); clamp(); draw(); }; });
      $('#bFace', root).onclick = async () => { if (view.sug) applyCrop(view.sug); else toast('ما لقينا اقتراح لهالصورة'); };
      const fl = $('#bFlip', root); if (fl) fl.onclick = () => { view.orient = view.orient === 'l' ? 'p' : 'l'; clamp(); draw(); };
      $('#bReset', root).onclick = () => { const im = view.im; if (!im) return; const f = frameRect(); applyCrop(centerCrop(im.naturalWidth, im.naturalHeight, f.ar)); };
      $$('[data-i]', root).forEach((b) => { b.onclick = () => goTo(oi, Number(b.dataset.i)); });
      $('#prev', root).onclick = () => step(-1);
      $('#next', root).onclick = () => step(1);
      gestures($('.stage', root));
    }
    async function loadCur() {
      const { p, size } = cur();
      view.im = null; view.sug = null; view.faces = null;
      const sq1 = size.short === size.long;
      view.mode = (size.modes || ['crop']).includes(p.crop && p.crop.mode) ? p.crop.mode : (size.modes || ['crop'])[0];
      paintShell();
      const ld = $('#ld', root);
      let im = null;
      try { im = await loadImg(p.thumb || p.url); } catch { try { im = await loadImg(p.url); } catch {} }
      if (!im) { if (ld) ld.innerHTML = 'ما قدرنا نحمل الصورة'; return; }
      // الاتجاه: الإطار يلف مع الصورة
      view.orient = sq1 ? 'p' : (p.crop && p.crop.orient) || (im.naturalWidth > im.naturalHeight ? 'l' : 'p');
      view.im = im; if (ld) ld.remove();
      if (p.crop) { applyCrop(p.crop); }
      else { const f = frameRect(); applyCrop(centerCrop(im.naturalWidth, im.naturalHeight, f.ar)); }
      const sug = await suggest(im, frameRect().ar).catch(() => null);
      if (sug && view.im === im) { view.sug = sug; const fc = $('#faces', root); if (fc) { fc.textContent = sug.faces ? `☺ ${sug.faces === 1 ? 'وجه' : `${fmt(sug.faces)} وجوه`}` : 'ما فيه وجوه'; fc.classList.remove('hidden'); } if (!p.crop) applyCrop(sug); }
    }
    async function saveCur() {
      const { o, p } = cur(); if (!view.im) return true;
      const c = cropOf();
      try { const r = await api(`app/crop/orders/${o.id}/crops`, { body: { crops: [{ id: p.id, crop: { ...c, mode: view.mode, orient: view.orient } }] } }); p.crop = { ...c, mode: view.mode, orient: view.orient, kind: 'print' }; saved.add(p.id); return true; }
      catch (e) { toast(errText(e), 'err'); return e.code === 'GONE' || e.code === 'NOT_PHONE' ? 'gone' : false; }
    }
    async function finishOrder(o) {
      const left = o.photos.filter((p) => !p.crop).length;
      try { await api(`app/crop/orders/${o.id}/done`, { body: { force: left > 0 } }); return true; }
      catch (e) { toast(errText(e), 'err'); return false; }
    }
    function goTo(o2, p2) { saveCur().then(() => { oi = o2; pi = p2; loadCur(); }); }
    async function step(dir) {
      if (busy) return; busy = true;
      const r = await saveCur();
      if (r === 'gone') { busy = false; orders.splice(oi, 1); if (!orders.length) { root.remove(); return vCrop(); } oi = Math.min(oi, orders.length - 1); pi = 0; return loadCur(); }
      if (!r) { busy = false; return; }
      const o = orders[oi];
      if (dir < 0) { if (pi > 0) pi--; else if (oi > 0) { oi--; pi = orders[oi].photos.length - 1; } busy = false; return loadCur(); }
      if (pi < o.photos.length - 1) { pi++; busy = false; return loadCur(); }
      // آخر صورة في الطلب
      const left = o.photos.filter((p) => !p.crop).length;
      if (left) { const ok = await confirmBox('باقي صور ما انقصت', `باقي ${phN(left)} في طلب ${esc(o.name || '')} — تبين تعدينها وتكملين؟ (تنقص بعدين على الكمبيوتر)`, 'إي، عدّيها'); if (!ok) { busy = false; return; } }
      const fin = await finishOrder(o);
      busy = false;
      if (!fin) return;
      if (oi < orders.length - 1) { toast(`✓ خلص طلب ${o.name || ''} — ينتقل للبرنامج`, 'ok'); oi++; pi = 0; return loadCur(); }
      root.remove(); st.orders = { wa: null, site: null }; st.cropSel = new Set();
      await sheet(`<div class="okbox"><div style="font-size:30px">💗</div><b style="font-size:15px;font-weight:800;display:block;margin-top:4px">انحفظ القص لـ ${orders.length === 1 ? 'طلب' : `${fmt(orders.length)} طلبات`}</b><small style="font-size:12px;color:var(--muted);display:block;margin-top:4px;line-height:1.6">البرنامج يسحبها الحين، ويطبّق القص، ويحذف الصور من السيرفر، وينقلها للقسم التالي</small></div>${orders.map((x) => `<div class="row"><span class="t"><b>${esc(x.name || 'عميلة')}<em>#${esc(x.no)}</em></b><small>${phN(x.photos.filter((p) => p.crop).length)} انقصت من ${fmt(x.photos.length)}</small></span><span class="k g">✓</span></div>`).join('')}<button class="btn p" data-r="ok">تمام</button>`);
      vCrop();
    }
    function gestures(el) {
      const pts = new Map(); let last = null;
      el.onpointerdown = (e) => { el.setPointerCapture(e.pointerId); pts.set(e.pointerId, { x: e.clientX, y: e.clientY }); last = snapshot(); };
      const snapshot = () => { const a = [...pts.values()]; if (a.length >= 2) return { d: Math.hypot(a[0].x - a[1].x, a[0].y - a[1].y), cx: (a[0].x + a[1].x) / 2, cy: (a[0].y + a[1].y) / 2, s: view.s, tx: view.tx, ty: view.ty }; if (a.length === 1) return { cx: a[0].x, cy: a[0].y, tx: view.tx, ty: view.ty, s: view.s }; return null; };
      el.onpointermove = (e) => {
        if (!pts.has(e.pointerId) || !view.im) return;
        pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
        const a = [...pts.values()]; if (!last) return;
        const r = el.getBoundingClientRect();
        if (a.length >= 2 && last.d) {
          const d = Math.hypot(a[0].x - a[1].x, a[0].y - a[1].y); const k = d / last.d;
          const cx = (a[0].x + a[1].x) / 2 - r.left, cy = (a[0].y + a[1].y) / 2 - r.top; const lcx = last.cx - r.left, lcy = last.cy - r.top;
          view.s = last.s * k; view.tx = cx - (lcx - last.tx) * k; view.ty = cy - (lcy - last.ty) * k;
        } else if (a.length === 1) { view.tx = last.tx + (a[0].x - last.cx); view.ty = last.ty + (a[0].y - last.cy); }
        clamp(); draw();
      };
      const up = (e) => { pts.delete(e.pointerId); last = snapshot(); };
      el.onpointerup = up; el.onpointercancel = up; el.onpointerleave = up;
      el.onwheel = (e) => { e.preventDefault(); const r = el.getBoundingClientRect(); const cx = e.clientX - r.left, cy = e.clientY - r.top; const k = e.deltaY < 0 ? 1.08 : 0.92; view.tx = cx - (cx - view.tx) * k; view.ty = cy - (cy - view.ty) * k; view.s *= k; clamp(); draw(); };
    }
    window.addEventListener('resize', () => { if (document.body.contains(root)) { clamp(); draw(); } });
    loadCur();
  }

  /* ---------- تواصل الفريق ---------- */
  const PRIO = { 'very-urgent': '⚡⚡ مستعجل جداً', urgent: '⚡ مستعجل' };
  const STATUS_TXT = { new: 'جديدة', seen: 'شافتها', 'in-progress': 'جاري التنفيذ', done: 'تم ✓', closed: 'مغلقة 🔒' };
  async function vTeam(tab) {
    if (!can('team')) return mount(page(top({ title: 'تواصل الفريق', sq: sq('team', I.chat) }) + empty('🔒', 'ما عندك صلاحية'), 'team'));
    if (tab) st.threadsTab = tab;
    const cur = st.threadsTab;
    if (!st.threads) mount(page(top({ title: 'تواصل الفريق', sq: sq('team', I.chat) }) + '<div class="spin"></div>', 'team'));
    let r;
    try { r = await api(`app/threads?tab=${cur}`); } catch (e) { return mount(page(top({ title: 'تواصل الفريق', sq: sq('team', I.chat) }) + empty('📡', esc(errText(e))), 'team')); }
    st.threads = r; usersCache = r.users || usersCache;
    const c = r.counts || {};
    const tabs = [['inbox', 'مرسولة لي', c.inbox], ['sent', 'أرسلتها', c.sent], ...(isAdmin() ? [['all', 'كل المفتوحة', c.all]] : []), ['archive', 'المؤرشفة', c.archive]];
    const list = r.threads || [];
    const item = (t) => { const m = (t.messages || [])[0]; const who = t.from && t.from.id === me().id ? `إلى ${esc(t.to && t.to.name || '')}` : `من ${esc(t.from && t.from.name || '')}`; return `<a class="row" href="#thread/${encodeURIComponent(t.id)}"><span class="av" style="${avStyle(t.from && t.from.name)}">${esc(((t.from && t.from.name) || 'م').slice(0, 1))}</span><span class="t"><b>${t.unread ? '🔴 ' : ''}${esc(t.order && t.order.name ? t.order.name : t.reason || 'مهمة')}${t.order && t.order.no ? `<em>#${esc(t.order.no)}</em>` : ''}</b><small>${who} · ${esc(m ? m.text : t.note || '')}</small><div class="flags">${t.priority && PRIO[t.priority] ? `<span class="urg">${PRIO[t.priority]}</span>` : ''}<span>${esc(t.kind === 'task' ? '📝 مهمة' : '↗ تحويل')}</span><span class="${t.status === 'done' || t.status === 'closed' ? '' : 'site'}">${esc(STATUS_TXT[t.status] || t.status || '')}</span>${t.pending ? '<span class="pend">⏳ تنتظر البرنامج</span>' : ''}</div></span><span class="k gr">${esc(when(t.lastAt || t.createdAt))}</span></a>`; };
    const html = page(top({ title: 'تواصل الفريق', sub: `${fmt(c.inbox || 0)} مرسولة لي`, sq: sq('team', I.chat), right: `<button class="act" id="newT">${I.plus} مهمة</button>` }) + `
      <div class="strip">${tabs.map(([k, l, n]) => `<button data-tab="${k}" class="${cur === k ? 'on' : ''}">${l}<b>${fmt(n || 0)}</b></button>`).join('')}</div>
      ${list.length ? list.map(item).join('') : empty('💬', cur === 'inbox' ? 'ما فيه مهام مرسولة لك' : 'ما فيه شي هنا')}`, 'team');
    mount(html, true);
    $$('[data-tab]').forEach((b) => { b.onclick = () => vTeam(b.dataset.tab); });
    $('#newT').onclick = () => newTask();
    poll(() => { if (route().startsWith('team')) vTeam(); }, 20000);
  }
  async function newTask(order) {
    const users = await usersList();
    const v = await sheet(`<h3>📝 مهمة جديدة</h3><p>تطلع لها في «تواصل الفريق» على الجوال والكمبيوتر</p><div class="field"><label>لمين؟ (تقدرين تختارين أكثر من وحدة)</label><div class="pick" id="pk">${users.filter((u) => u.id !== me().id).map((u) => `<button data-u="${esc(u.id)}" data-n="${esc(u.name)}">${esc(u.name)}</button>`).join('')}</div></div><div class="field"><input class="in" id="tt" placeholder="عنوان المهمة" value="${order ? esc(`طلب #${order.no} — ${order.name || ''}`) : ''}"/></div><div class="field"><textarea class="in" id="tn" placeholder="التفاصيل (اختياري)"></textarea></div><div class="perm"><span>⚡ مستعجل</span><button class="tg" id="tu"></button></div><div class="perm"><span>❗ رسالة مهمة<small>تطلع لها في نافذة كبيرة ما تنقفل إلا لما تفتح تواصل الفريق</small></span><button class="tg" id="ti"></button></div><button class="btn p" data-r="ok">إرسال</button><button class="btn ghost" data-r="x">إلغاء</button>`, { init: (sh) => { $('#pk', sh).onclick = (e) => { const b = e.target.closest('[data-u]'); if (b) b.classList.toggle('on'); }; $$('.tg', sh).forEach((t) => { t.onclick = () => t.classList.toggle('on'); }); }, collect: (sh, r) => r !== 'ok' ? null : { to: $$('#pk .on', sh).map((b) => ({ id: b.dataset.u, name: b.dataset.n })), title: $('#tt', sh).value.trim(), note: $('#tn', sh).value.trim(), urgent: $('#tu', sh).classList.contains('on'), important: $('#ti', sh).classList.contains('on') } });
    if (!v) return;
    if (!v.to.length) return toast('اختاري لمين', 'err');
    if (!v.title && !v.note) return toast('اكتبي المهمة', 'err');
    try { await api('app/threads', { body: { kind: 'task', ...v, order: order ? { no: order.no, name: order.name } : null } }); toast('✓ انرسلت — البرنامج يسجلها خلال دقيقة', 'ok'); vTeam('sent'); } catch (e) { toast(errText(e), 'err'); }
  }
  async function vThread(id) {
    mount(page(top({ title: 'المحادثة', back: true }) + '<div class="spin"></div>', 'team', 'nodock'));
    let r;
    try { r = await api(`app/threads/${encodeURIComponent(id)}`); } catch (e) { return mount(page(top({ title: 'المحادثة', back: true }) + empty('📡', esc(errText(e))), 'team')); }
    const t = r.thread; const mine = (m) => m.byId === me().id;
    const msgs = (t.messages || []).map((m) => m.kind === 'system' || m.kind === 'reminder' ? `<div class="msg sys">${esc(m.text)} · ${esc(when(m.at))}</div>` : `<div class="msg ${mine(m) ? 'me' : ''} ${m.important ? 'imp' : ''} ${m.pending ? 'pend' : ''}"><b>${m.important ? '❗ ' : ''}${esc(m.byName || '')}</b>${esc(m.text || '')}${m.photos && m.photos.length ? `<div class="flags"><span>📎 ${m.photos.length === 1 ? 'صورة على الكمبيوتر' : `${fmt(m.photos.length)} صور على الكمبيوتر`}</span></div>` : ''}<time>${esc(when(m.at))}${m.pending ? ' · ⏳' : ''}</time></div>`).join('');
    const recipient = (t.to && t.to.id === me().id) || (Array.isArray(t.cc) && t.cc.some((c) => c.id === me().id));
    const open = !['done', 'closed'].includes(t.status);
    const btns = [];
    if (open && recipient) btns.push(`<button class="btn aq sm" data-st="done" style="flex:1">✓ خلصت</button>`);
    if (open && !recipient && (isAdmin() || (t.from && t.from.id === me().id))) btns.push(`<button class="btn sm" data-st="closed" style="flex:1">🔒 إغلاق</button>`);
    if (!open && (isAdmin() || (t.from && t.from.id === me().id))) btns.push(`<button class="btn sm" data-st="in-progress" style="flex:1">↩ رجّعيها مفتوحة</button>`);
    if (t.order && t.order.no && can('orders')) btns.push(`<a class="btn sm" href="#order/${encodeURIComponent(t.order.no)}" style="flex:1">فتح الطلب</a>`);
    const html = page(top({ title: esc(t.order && t.order.name ? t.order.name : t.reason || 'مهمة'), sub: `${t.kind === 'task' ? '📝 مهمة' : '↗ تحويل'} · من ${esc(t.from && t.from.name || '')} إلى ${esc(t.to && t.to.name || t.to && t.to.deptName || '')}${t.cc && t.cc.length ? ` +${fmt(t.cc.length)}` : ''} · ${esc(STATUS_TXT[t.status] || '')}${t.statusPending ? ' ⏳' : ''}`, back: true, right: t.priority && PRIO[t.priority] ? `<span class="k u">${PRIO[t.priority]}</span>` : '' }) + `
      ${btns.length ? `<div class="two" style="margin-bottom:10px">${btns.join('')}</div>` : ''}
      <div class="msgs">${msgs || empty('💬', 'ما فيه رسائل')}</div><div style="height:90px"></div>
      <div class="compose"><button class="imp" id="cImp" title="رسالة مهمة">❗</button><input id="cIn" placeholder="اكتبي رسالة…" autocomplete="off"/><button class="send" id="cSend">${I.send}</button></div>`, '', 'nodock');
    mount(html);
    window.scrollTo(0, document.body.scrollHeight);
    $('#cImp').onclick = (e) => e.currentTarget.classList.toggle('on');
    const send = async () => { const txt = $('#cIn').value.trim(); if (!txt) return; $('#cSend').disabled = true; try { await api(`app/threads/${encodeURIComponent(id)}/reply`, { body: { text: txt, important: $('#cImp').classList.contains('on') } }); vThread(id); } catch (e) { toast(errText(e), 'err'); $('#cSend').disabled = false; } };
    $('#cSend').onclick = send; $('#cIn').onkeydown = (e) => { if (e.key === 'Enter') send(); };
    $$('[data-st]').forEach((b) => { b.onclick = async () => { try { await api(`app/threads/${encodeURIComponent(id)}/status`, { body: { status: b.dataset.st } }); toast('✓', 'ok'); vThread(id); } catch (e) { toast(errText(e), 'err'); } }; });
    poll(() => { if (route() === `thread/${encodeURIComponent(id)}` && document.activeElement !== $('#cIn')) vThread(id); }, 15000);
  }

  /* ---------- المالية ---------- */
  const MONTHS = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
  const mLabel = (m) => { const p = String(m || '').split('-'); return p[1] ? MONTHS[Number(p[1]) - 1] || m : m; };
  async function vFinance() {
    if (!can('finance')) return mount(page(top({ title: 'القسم المالي', back: true }) + empty('🔒', 'للمديرة بس'), 'sections'));
    mount(page(top({ title: 'القسم المالي', back: true, sq: sq('fin', I.wallet) }) + '<div class="spin"></div>', 'sections'));
    let r; try { r = await api('app/finance'); } catch (e) { return mount(page(top({ title: 'القسم المالي', back: true }) + empty('📡', esc(errText(e))), 'sections')); }
    const f = r.finance; const pend = r.pending || [];
    const months = (f && f.months) || []; const mx = Math.max(1, ...months.map((m) => Number(m.sales) || 0));
    const html = page(top({ title: 'القسم المالي', sub: f ? `${mLabel(f.month)} · آخر تحديث ${when(f.updated_at)}` : 'بانتظار البرنامج', back: true, sq: sq('fin', I.wallet) }) + (f ? `
      <div class="fcards"><div class="fcard wide"><small>صافي الربح هالشهر</small><b class="g">${money(f.profit)}</b></div><div class="fcard"><small>المبيعات</small><b class="a">${money(f.sales)}</b></div><div class="fcard"><small>المصاريف</small><b class="r">${money(f.expenses)}</b></div>${f.orders ? `<div class="fcard"><small>الطلبات</small><b>${fmt(f.orders)}</b></div>` : ''}${f.salaries != null ? `<div class="fcard"><small>الرواتب هالشهر</small><b>${money(f.salaries)}</b></div>` : ''}</div>
      ${months.length ? `<div class="chartbox"><h3>المبيعات آخر ${fmt(months.length)} أشهر</h3><div class="bars">${months.map((m, i) => `<i class="${i === months.length - 1 ? 'pk' : ''}" style="height:${Math.max(3, Math.round(100 * (Number(m.sales) || 0) / mx))}%" title="${money(m.sales)}"></i>`).join('')}</div><div class="bars-l">${months.map((m) => `<span>${esc(mLabel(m.m))}</span>`).join('')}</div></div>` : ''}
      ${pend.length ? `<div class="sec">تنتظر البرنامج</div>${pend.map((p) => `<div class="row"><span class="av" style="background:#fff8e6;color:#7a5a00">⏳</span><span class="t"><b>${esc(p.payload.desc || p.payload.cat || '')}</b><small>${esc(p.by_name)} · ${esc(when(p.at))}${p.state === 'failed' ? ` · ✗ ${esc(p.result || '')}` : ''}</small></span><span class="k x">− ${money(p.payload.amount)}</span></div>`).join('')}` : ''}
      <div class="sec">آخر العمليات</div>
      ${(f.recent || []).length ? f.recent.map((x) => `<div class="row"><span class="av" style="${x.kind === 'sales' ? 'background:#e6f6ee;color:#15804f' : 'background:#fdeaea;color:#c62828'}">${x.kind === 'sales' ? '+' : '−'}</span><span class="t"><b>${esc(x.desc || x.cat || '')}</b><small>${esc(x.cat || '')}${x.by ? ` · ${esc(x.by)}` : ''} · ${esc(x.date || '')}</small></span><span class="k ${x.kind === 'sales' ? 'g' : 'x'}">${x.kind === 'sales' ? '+' : '−'} ${money(x.amount)}</span></div>`).join('') : empty('💰', 'ما فيه عمليات بعد')}
      <button class="fab" id="addF">${I.plus}</button>` : '<div class="note">بيانات المالية تجي من البرنامج على الكمبيوتر — افتحي البرنامج بحساب المديرة وتوصل خلال دقيقة</div>'), 'sections');
    mount(html);
    const b = $('#addF'); if (b) b.onclick = () => addFinance(f);
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

  /* ---------- تتبع الطلبات ---------- */
  async function vDepts(pick) {
    if (!can('depts') && !can('orders')) return mount(page(top({ title: 'تتبع الطلبات', back: true }) + empty('🔒', 'ما عندك صلاحية'), 'sections'));
    mount(page(top({ title: 'تتبع الطلبات', back: true, sq: sq('dept', I.truck) }) + '<div class="spin"></div>', 'sections'));
    let r; try { r = await api('app/depts'); } catch (e) { return mount(page(top({ title: 'تتبع الطلبات', back: true }) + empty('📡', esc(errText(e))), 'sections')); }
    const rows = r.rows || []; const pre = r.pre || [];
    const late = rows.filter((x) => x.late && x.late.level === 'alert').length;
    const defs = [['pre', 'بانتظار صور العميلة (الموقع)', 'site', I.cloud, (x) => false, pre.filter((p) => p.pre !== 'ready').length], ...[1, 8, 9, 2, 3, 4, 10, 5, 6, 7].map((n) => [String(n), ST[n][0], { 1: 'wa', 8: 'pay', 9: 'red', 2: 'rose', 3: 'crop', 4: 'clar', 10: 'clar', 5: 'print', 6: 'audit', 7: 'dept' }[n], { 1: I.wa, 8: I.pay, 9: I.flash, 2: I.sort, 3: I.cut, 4: I.spark, 10: I.spark, 5: I.print, 6: I.puzzle, 7: I.truck }[n], (x) => Number(x.stage) === n, null])];
    if (pick) {
      const d = defs.find((x) => x[0] === pick); const list = pick === 'pre' ? pre.map((p) => ({ ...p, src: 'site', flags: { site: true } })) : rows.filter(d[4]);
      return mount(page(top({ title: d[1], sub: `${fmt(list.length)} طلب`, back: true, sq: sq(d[2], d[3]) }) + (list.length ? list.sort((a, b) => String(a.stage_at || '').localeCompare(String(b.stage_at || ''))).map((o) => orderRow({ ...o, products: o.products || [] }, '')).join('') : empty('🌸', 'ما فيه طلبات')), 'sections'));
    }
    const html = page(top({ title: 'تتبع الطلبات', sub: `${fmt(rows.length)} طلب شغال${late ? ` · ${fmt(late)} متأخرة جداً` : ''}`, back: true, sq: sq('dept', I.truck) }) + defs.map(([k, l, c, ic, f, n0]) => { const list = k === 'pre' ? [] : rows.filter(f); const n = n0 != null ? n0 : list.length; const lt = list.filter((x) => x.late && x.late.level === 'alert').length; const who = [...new Set(list.map((x) => x.staff && x.staff.name).filter(Boolean))].slice(0, 2).join('، '); return `<a class="dept" href="#depts/${k}"><span class="ic" style="background:${P[c][0]};color:${P[c][1]}">${ic}</span><span class="t"><b>${l}</b><small>${esc(who || (n ? `أقدم طلب ${since(list.map((x) => x.stage_at).filter(Boolean).sort()[0] || '')}` : 'فاضي'))}</small></span><span class="n">${fmt(n)}${lt ? `<small>⏰ ${fmt(lt)} متأخر</small>` : ''}</span></a>`; }).join(''), 'sections');
    mount(html);
  }

  /* ---------- مراجعة إنجاز الموظفات ---------- */
  async function vReview(range) {
    if (!can('review')) return mount(page(top({ title: 'إنجاز الموظفات', back: true }) + empty('🔒', 'للمديرة بس'), 'sections'));
    st.revRange = range || st.revRange || 'week';
    mount(page(top({ title: 'إنجاز الموظفات', back: true, sq: sq('rev', I.review) }) + '<div class="spin"></div>', 'sections'));
    let r; try { r = await api('app/review'); } catch (e) { return mount(page(top({ title: 'إنجاز الموظفات', back: true }) + empty('📡', esc(errText(e))), 'sections')); }
    const rv = r.review; const att = r.attendance || {};
    const list = rv && rv[st.revRange] ? rv[st.revRange] : [];
    const html = page(top({ title: 'إنجاز الموظفات', sub: rv ? `آخر تحديث ${when(rv.updated_at)}` : 'بانتظار البرنامج', back: true, sq: sq('rev', I.review) }) + `
      <div class="seg">${[['today', 'اليوم'], ['week', 'هالأسبوع'], ['month', 'هالشهر']].map(([k, l]) => `<button data-r="${k}" class="${st.revRange === k ? 'on' : ''}">${l}</button>`).join('')}</div>
      ${rv ? (list.length ? list.map((s) => { const a = att.staff && att.staff[s.id]; return `<div class="srow"><div class="h"><span class="orb sm" style="${orbStyle(s)}">${esc((s.name || '').slice(0, 1))}</span><span class="t"><b>${esc(s.name)}</b><small>${esc(s.title || s.spec || '')}</small></span>${a ? `<span class="k ${a.in ? 'g' : 'gr'}">${a.in ? '✓ حاضرة' : 'ما سجلت حضور'}</span>` : ''}</div><div class="stat3"><div><b>${fmt(s.orders)}</b>طلب</div><div><b>${fmt(s.images)}</b>صورة</div><div><b>${fmt(Math.round((s.hours || 0) * 10) / 10)}</b>ساعات</div>${s.referrals != null ? `<div><b>${fmt(s.referrals)}</b>تحويل</div>` : ''}</div>${s.by ? `<div class="flags" style="margin-top:6px">${Object.entries(s.by).filter(([, v]) => v).map(([k, v]) => `<span>${esc(k)}: ${fmt(v)}</span>`).join('')}</div>` : ''}</div>`; }).join('') : empty('🌸', 'ما فيه إنجاز مسجل في هالفترة')) : '<div class="note">بيانات الإنجاز تجي من البرنامج على الكمبيوتر — افتحي البرنامج بحساب المديرة وتوصل خلال دقايق</div>'}`, 'sections');
    mount(html);
    $$('[data-r]').forEach((b) => { b.onclick = () => vReview(b.dataset.r); });
  }

  /* ---------- إدارة الحسابات ---------- */
  const SEC_TXT = { orders: ['الطلبات (واتساب + الموقع)', 'عرض وملاحظات ونقل — بدون صور'], crop: ['قسم القص', 'تشوف طلبات القص وتقص من الجوال'], clarify: ['قسم التوضيح', ''], print: ['قسم الطباعة', ''], audit: ['التدقيق والمطابقة', ''], finance: ['القسم المالي', 'عرض وتسجيل'], depts: ['تتبع الطلبات', ''], review: ['مراجعة إنجاز الموظفات', ''], accounts: ['إدارة الحسابات', ''], team: ['تواصل الفريق', ''], salla: ['ربط سلة', ''] };
  // الاختصاصات (نفس البرنامج) وأقسام الجوال اللي تجي معها تلقائياً
  const SPEC_TXT = [['save', 'الحفظ'], ['cut', 'القص'], ['clarify', 'التوضيح'], ['print', 'الطباعة'], ['match', 'التدقيق والمطابقة'], ['scan', 'المسح الضوئي'], ['service', 'خدمة العملاء']];
  const SPEC_SEC = { cut: ['crop'], clarify: ['clarify'], print: ['print'], match: ['audit'], scan: ['audit'], save: ['orders'], service: ['orders'] };
  async function vAccounts() {
    if (!isAdmin()) return mount(page(top({ title: 'إدارة الحسابات', back: true }) + empty('🔒', 'للمديرة بس'), 'sections'));
    mount(page(top({ title: 'إدارة الحسابات', back: true, sq: sq('acc', I.users) }) + '<div class="spin"></div>', 'sections'));
    let r; try { r = await api('app/admin/users'); } catch (e) { return mount(page(top({ title: 'إدارة الحسابات', back: true }) + empty('📡', esc(errText(e))), 'sections')); }
    const users = r.users || [];
    const html = page(top({ title: 'إدارة الحسابات', sub: `${fmt(users.filter((u) => u.role !== 'admin' && u.active).length)} موظفات + المديرة`, back: true, sq: sq('acc', I.users) }) + users.map((u) => `<button class="row" data-u="${esc(u.id)}"><span class="orb sm" style="${orbStyle(u)}">${esc((u.name || '').slice(0, 1))}</span><span class="t"><b>${esc(u.name)}</b><small>${esc(u.title || (u.role === 'admin' ? 'المديرة' : 'موظفة'))}${u.last_seen ? ` · آخر دخول ${esc(when(u.last_seen))}` : ' · ما دخلت بعد'}${u.pin_set_at ? '' : ' · <i>بدون رقم سري</i>'}</small></span><span class="k ${!u.active ? 'x' : u.role === 'admin' ? '' : 'gr'}">${!u.active ? 'معطّل' : u.role === 'admin' ? 'المديرة' : 'موظفة'}</span></button>`).join('') + `<div class="hint">اضغطي الحساب تغيرين أقسامه أو رقمه السري أو تحذفينه. الحسابات نفسها حسابات البرنامج: اللي تضيفينه أو تحذفينه هنا يتغير في البرنامج خلال دقيقة.</div><button class="fab" id="newU">${I.plus}</button>`, 'sections');
    mount(html);
    $$('[data-u]').forEach((b) => { b.onclick = () => editUser(users.find((u) => u.id === b.dataset.u), r.sections); });
    $('#newU').onclick = () => newUser(r.sections);
  }
  function permsHtml(sections, on) { return sections.filter((s) => SEC_TXT[s]).map((s) => `<div class="perm"><span>${SEC_TXT[s][0]}${SEC_TXT[s][1] ? `<small>${SEC_TXT[s][1]}</small>` : ''}</span><button class="tg ${on.includes(s) ? 'on' : ''}" data-s="${s}"></button></div>`).join(''); }
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
        // الاختصاص يشغّل أقسامه تلقائياً (لين تغيرينها بنفسك)
        $$('#specs button', sh).forEach((c) => { c.onclick = () => { c.classList.toggle('on'); const on = new Set(['orders', 'team']); $$('#specs .on', sh).forEach((x) => (SPEC_SEC[x.dataset.sp] || []).forEach((s) => on.add(s))); $$('#perms .tg', sh).forEach((t) => { if (!t.dataset.touched) t.classList.toggle('on', on.has(t.dataset.s)); }); }; });
      }, collect: (sh, r) => r !== 'ok' ? null : { name: $('#nn', sh).value.trim(), title: $('#nt', sh).value.trim(), specialties: $$('#specs .on', sh).map((c) => c.dataset.sp), pin: $('#np', sh).value.trim(), sections: $$('#perms .tg.on', sh).map((t) => t.dataset.s) } });
    if (!v) return;
    if (!v.name) return toast('اكتبي الاسم', 'err');
    if (!/^\d{4,8}$/.test(v.pin)) return toast('الرقم السري من 4 إلى 8 أرقام', 'err');
    try { await api('app/admin/users', { body: v }); toast('✓ انضاف الحساب — ويطلع في البرنامج خلال دقيقة', 'ok'); usersCache = null; vAccounts(); } catch (e) { toast(errText(e), 'err'); }
  }

  /* ---------- الأقسام · الإعدادات ---------- */
  const tile3 = (k, ic, t, href, bdg) => `<a class="tile" href="#${href}"><span class="ic" style="background:${P[k][0]};color:${P[k][1]}">${ic}</span><b>${t}</b>${bdg ? `<span class="bdg">${bdg}</span>` : ''}</a>`;
  function vSections() {
    const c = (st.home && st.home.counts) || {};
    const work = [];
    if (can('orders')) { work.push(tile3('wa', I.wa, 'طلبات الواتساب', 'orders/wa')); work.push(tile3('site', I.cloud, 'طلبات الموقع', 'orders/site')); }
    if (can('crop')) work.push(tile3('crop', I.cut, 'قسم القص', 'crop', c.crop ? fmt(c.crop) : ''));
    if (can('clarify')) work.push(tile3('clar', I.spark, 'قسم التوضيح', 'clarify', c.clarify ? fmt(c.clarify) : ''));
    if (can('print')) work.push(tile3('print', I.print, 'قسم الطباعة', 'print', c.print ? fmt(c.print) : ''));
    if (can('audit')) work.push(tile3('audit', I.puzzle, 'التدقيق والمطابقة', 'audit', c.audit ? fmt(c.audit) : ''));
    if (can('finance')) work.push(tile3('fin', I.wallet, 'القسم المالي', 'finance'));
    if (can('team')) work.push(tile3('team', I.chat, 'تواصل الفريق', 'team', st.home && st.home.unread ? fmt(st.home.unread) : ''));
    const adm = [];
    if (can('depts')) adm.push(tile3('dept', I.truck, 'تتبع الطلبات', 'depts'));
    if (can('review')) adm.push(tile3('rev', I.review, 'إنجاز الموظفات', 'review'));
    if (isAdmin()) { adm.push(tile3('acc', I.users, 'إدارة الحسابات', 'accounts')); adm.push(tile3('sec', I.gear, 'الإعدادات', 'settings')); }
    const u = me();
    mount(page(top({ title: 'الأقسام', sub: 'كل أقسام البرنامج', sq: sq('sec', I.grid) }) + `${work.length ? `<div class="sec">أقسام العمل</div><div class="tiles c3">${work.join('')}</div>` : ''}${adm.length ? `<div class="sec">المتابعة والإدارة</div><div class="tiles c3">${adm.join('')}</div>` : ''}<div class="me"><span class="orb sm" style="${orbStyle(u)}">${esc((u.name || '').slice(0, 1))}</span><span class="t"><b>${esc(u.name || '')} · ${esc(u.role === 'admin' ? 'المديرة' : u.title || 'موظفة')}</b><small>${st.sync && st.sync.at ? `البرنامج: آخر تحديث ${esc(when(st.sync.at))}` : 'بانتظار البرنامج'} · الإصدار ${esc(V)}</small></span><button class="out" id="lo">${I.logout} خروج</button></div>`, 'sections'));
    $('#lo').onclick = async () => { if (await confirmBox('تسجيل الخروج؟', 'ترجعين لشاشة الحسابات', 'إي، خروج')) { try { await api('app/logout', { body: {} }); } catch {} logoutLocal(); } };
  }
  async function vSettings() {
    if (!isAdmin()) return go('sections', true);
    mount(page(top({ title: 'الإعدادات', back: true, sq: sq('sec', I.gear) }) + `
      <div class="card"><div class="perm"><span>✂ القص من الجوال<small>مشغّل = طلبات الموقع تنتظر موظفة القص في الجوال قبل ما يسحبها البرنامج (وتقدرين ترجعين أي طلب للكمبيوتر من صفحته)</small></span><button class="tg ${st.settings.phoneCrop ? 'on' : ''}" id="pc"></button></div></div>
      <div class="card"><h3>الاتصال</h3><div class="facts"><div>السيرفر<b>${esc(API.replace(/^https?:\/\//, '').split('/')[0])}</b></div><div>البرنامج<b>${st.sync && st.sync.at ? `${esc(st.sync.pc || '')} · ${esc(when(st.sync.at))}` : 'ما وصل شي بعد'}</b></div><div>إصدار التطبيق<b>${esc(V)}</b></div><div>إصدار البرنامج<b>${esc((st.sync && st.sync.version) || '—')}</b></div></div></div>
      <div class="note">الأرقام السرية للجوال تحطينها من «إدارة الحسابات» هنا، أو من البرنامج على الكمبيوتر (الإعدادات ← تطبيق الجوال).</div>`, 'sections'));
    $('#pc').onclick = async (e) => { const on = !e.currentTarget.classList.contains('on'); try { const r = await api('app/settings', { body: { phoneCrop: on } }); st.settings = r.settings; e.currentTarget.classList.toggle('on', st.settings.phoneCrop); toast(st.settings.phoneCrop ? '✓ القص من الجوال مشغّل' : 'القص من الجوال مطفي', 'ok'); } catch (err) { toast(errText(err), 'err'); } };
  }

  /* ---------- التركيب ---------- */
  function mount(html, keepScroll) {
    const y = keepScroll ? window.scrollY : 0;
    const app = $('#app'); app.innerHTML = html;
    $$('[data-back]', app).forEach((b) => { b.onclick = back; });
    const hi = $('[data-hide-install]', app); if (hi) hi.onclick = () => { store.set('installHid', '1'); vHome(); };
    if (keepScroll) window.scrollTo(0, y); else window.scrollTo(0, 0);
    paintSync();
  }
  // داخل متجر سلة: #mmstaffoff (حتى لو انكتب في نفس الصفحة) يرجّع الصفحة للمتجر — قبل أي توجيه
  function staffOff() { if (!/^#mmstaffoff/.test(location.hash)) return false; store.set('token', null); try { localStorage.removeItem('mm-staff'); localStorage.removeItem('mm-staff-html'); } catch {} location.reload(); return true; }
  async function render() {
    if (staffOff()) return;
    stopPolls();
    const r = route();
    if (!st.user) { if (r !== 'login') go('login', true); return vLogin(); }
    const [a, b, c] = r.split('/').map((x) => { try { return decodeURIComponent(x); } catch { return x; } });
    // الرئيسية تتحدث مع كل تنقل (أرقام الشريط)
    if (a !== 'home') loadHome().then(() => { const d = $('.dock'); if (d) d.outerHTML = dock($('.dock a.on') ? $('.dock a.on').getAttribute('href').slice(1) : ''); paintSync(); }).catch(() => {});
    if (a === 'home') { try { await loadHome(); } catch (e) {} vHome(); poll(async () => { try { await loadHome(); if (route() === 'home') vHome(); } catch {} }, 30000); return; }
    if (a === 'orders') return vOrders(b || 'wa', c);
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
    if (a === 'login') return go('home', true);
    return go('home', true);
  }
  async function boot(afterLogin) {
    spTo(35, 'نتأكد من حسابك…');
    if (st.token) {
      try { const r = await api('app/me'); st.user = r.user; st.sync = r.sync; st.settings = r.settings || st.settings; }
      catch (e) { if (e.code === 'NO_SESSION' || (e.status === 401)) { st.token = ''; st.user = null; store.set('token', null); } else if (e.code === 'OFFLINE') { toast('ما فيه اتصال — نحاول مرة ثانية', 'err'); } }
    }
    spTo(80, 'نجهز الصفحة…');
    if (st.user && (route() === 'login' || afterLogin)) go('home', true);
    spDone();
    render();
  }
  // داخل متجر سلة (لحد أوراكل): #mmstaffoff يرجّع الصفحة للمتجر
  window.addEventListener('hashchange', staffOff);
  window.addEventListener('online', () => { st.online = true; paintSync(); render(); });
  window.addEventListener('offline', () => { st.online = false; paintSync(); });
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && st.user) render(); });
  // على رابط التطبيق الخاص (GitHub Pages مؤقتاً / أوراكل /app/) — داخل متجر سلة ما فيه service worker
  if ('serviceWorker' in navigator && location.protocol === 'https:' && !IN_STORE) { navigator.serviceWorker.register(`sw.js?v=${V}`).catch(() => {}); }
  setTimeout(boot, 300);
})();
