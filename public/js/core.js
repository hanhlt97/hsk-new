// Tiện ích, kho dữ liệu (localStorage) và bộ định tuyến
const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
const dayKey = (t = Date.now()) => { const d = new Date(t); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
const DAY = 864e5;

// Danh sách từ phẳng
const WORDS = [];
Object.keys(DATA).forEach(l => DATA[l].forEach(([h, p, m]) => WORDS.push({ id: l + h, h, p, m, level: +l })));
const WBY = Object.fromEntries(WORDS.map(w => [w.id, w]));
const wordsOf = l => WORDS.filter(w => w.level === +l);

function normPinyin(s) {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ü/g, 'u').toLowerCase().replace(/v/g, 'u').replace(/[^a-z]/g, '');
}

const DEFAULTS = { name: '', settings: { theme: 'light', pinyin: true, mean: true, speak: true, level: 1, dictLevel: 0, goal: 20 }, prog: {}, fav: {}, days: {}, sessions: [], achievements: {} };
const Store = {
  key: 'hsk_app_v1', d: null,
  load() {
    let raw = null;
    try { raw = JSON.parse(localStorage.getItem(this.key)); } catch (e) {}
    this.d = Object.assign({}, JSON.parse(JSON.stringify(DEFAULTS)), raw || {});
    this.d.settings = Object.assign({}, DEFAULTS.settings, this.d.settings);
    document.documentElement.dataset.theme = this.d.settings.theme;
  },
  save() { localStorage.setItem(this.key, JSON.stringify(this.d)); if (typeof Auth !== 'undefined' && Auth.user) Auth.queuePush(); },
  get s() { return this.d.settings; },
  set(k, v) { this.d.settings[k] = v; this.save(); },
  // Ghi kết quả luyện tập một từ (Leitner: hộp 1–5)
  record(id, ok) {
    const INT = [0, 0, 1, 3, 7, 14];
    const p = this.d.prog[id] || (this.d.prog[id] = { box: 0, due: 0, ok: 0, bad: 0 });
    if (ok) { p.ok++; p.box = Math.min(5, p.box + 1); } else { p.bad++; p.box = 1; }
    p.updatedAt = Date.now();
    p.due = Date.now() + INT[p.box] * DAY;
    const k = dayKey(); this.d.days[k] = (this.d.days[k] || 0) + 1;
    this.unlockAchievements();
    this.save();
  },
  unlockAchievements() {
    const total = Object.values(this.d.prog).reduce((n, p) => n + p.ok + p.bad, 0);
    const mastered = Object.values(this.d.prog).filter(p => p.box >= 4).length;
    const streak = this.streak();
    const candidates = {
      first: total >= 1,
      hundred: total >= 100,
      streak3: streak >= 3,
      streak7: streak >= 7,
      mastered10: mastered >= 10
    };
    for (const [id, unlocked] of Object.entries(candidates)) if (unlocked && !this.d.achievements[id]) {
      this.d.achievements[id] = Date.now();
      if (typeof toast === 'function') toast('🏆 Mở khóa thành tích mới');
    }
  },
  weak(level, limit = 5) {
    return wordsOf(level).filter(w => this.d.prog[w.id]).sort((a, b) => {
      const x = this.d.prog[a.id], y = this.d.prog[b.id];
      return (y.bad - y.ok) - (x.bad - x.ok) || x.box - y.box;
    }).slice(0, limit);
  },
  session(type, correct, total, seconds) {
    this.d.sessions = Array.isArray(this.d.sessions) ? this.d.sessions : [];
    this.d.sessions.unshift({ type, correct, total, seconds, level: this.s.level, at: Date.now() });
    this.d.sessions = this.d.sessions.slice(0, 30);
    this.save();
  },
  today() { return this.d.days[dayKey()] || 0; },
  streak() {
    let n = 0, t = Date.now();
    if (!this.d.days[dayKey(t)]) t -= DAY;
    while (this.d.days[dayKey(t)]) { n++; t -= DAY; }
    return n;
  },
  dueCount(level) { const now = Date.now(); return wordsOf(level).filter(w => { const p = this.d.prog[w.id]; return !p || p.due <= now; }).length; },
  mastered(level) { return wordsOf(level).filter(w => (this.d.prog[w.id] || {}).box >= 4).length; },
  isFav: id => !!Store.d.fav[id],
  toggleFav(id) { if (this.d.fav[id]) delete this.d.fav[id]; else this.d.fav[id] = 1; this.save(); },
  reset() { localStorage.removeItem(this.key); this.load(); if (typeof Auth !== 'undefined' && Auth.user) Auth.queuePush(); }
};

function speak(text) {
  if (!Store.s.speak || !('speechSynthesis' in window)) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text); u.lang = 'zh-CN'; u.rate = 0.85;
  speechSynthesis.speak(u);
}
function toast(msg) {
  const t = document.createElement('div'); t.className = 'toast'; t.textContent = msg;
  document.body.appendChild(t); setTimeout(() => t.remove(), 2200);
}
// Thanh chọn cấp HSK dùng chung
function levelBar(el, onPick, withAll, key = 'level') {
  el.className = 'levels'; el.innerHTML = '';
  const mk = (l, label) => { const b = document.createElement('button'); b.textContent = label; b.className = Store.s[key] === l ? 'active' : ''; b.onclick = () => { Store.set(key, l); levelBar(el, onPick, withAll, key); onPick(l); }; el.appendChild(b); };
  if (withAll) mk(0, 'Tất cả');
  for (let l = 1; l <= 9; l++) mk(l, 'HSK ' + l);
}

// Bộ định tuyến theo hash
const Pages = {};
let cleanup = null;
const NAV = [['home', 'Trang chủ'], ['typing', 'Gõ chữ'], ['flash', 'Flashcard'], ['quiz', 'Trắc nghiệm'], ['dict', 'Từ điển'], ['stats', 'Thống kê'], ['settings', 'Cài đặt']];
let curPage = 'home';
function render_nav() {
  const u = typeof Auth !== 'undefined' && Auth.user;
  const items = NAV.slice();
  if (u && u.role === 'admin') items.push(['admin', 'Quản trị']);
  items.push(u ? ['account', '👤 ' + (u.name || u.email).slice(0, 14)] : ['login', 'Đăng nhập']);
  $('#nav').innerHTML = '<a class="brand" href="#/home">汉 HSK</a>' + items.map(([k, t]) => `<a class="link ${k === curPage ? 'on' : ''}" href="#/${k}">${esc(t)}</a>`).join('');
}
function route() {
  const name = (location.hash.slice(2) || 'home');
  const page = Pages[name] || Pages.home;
  if (cleanup) { cleanup(); cleanup = null; }
  curPage = Pages[name] ? name : 'home'; render_nav();
  const view = $('#view'); view.innerHTML = '';
  window.scrollTo(0, 0);
  cleanup = page(view) || null;
}
window.addEventListener('hashchange', route);
window.addEventListener('DOMContentLoaded', async () => {
  Store.load(); await Auth.init(); route();
  if ('serviceWorker' in navigator && window.isSecureContext) navigator.serviceWorker.register('/sw.js').catch(() => {});
});
