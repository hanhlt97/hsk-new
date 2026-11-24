// Gọi API, đăng nhập, đồng bộ tiến độ lên server
async function api(method, url, body) {
  let r;
  try {
    r = await fetch(url, { method, headers: body ? { 'Content-Type': 'application/json' } : {}, body: body ? JSON.stringify(body) : undefined, credentials: 'same-origin' });
  } catch (e) { throw new Error('Không kết nối được máy chủ'); }
  let j = {}; try { j = await r.json(); } catch (e) {}
  if (!r.ok) { const err = new Error(j.error || 'Lỗi ' + r.status); err.status = r.status; throw err; }
  return j;
}

const Auth = {
  user: null, online: true, timer: null, pushing: false,

  async init() {
    try { this.user = (await api('GET', '/api/me')).user; this.online = true; }
    catch (e) { this.user = null; this.online = false; }
    if (this.user) { this.selectStore(); await this.pull(); }
  },

  selectStore() {
    clearTimeout(this.timer);
    Store.key = 'hsk_app_v1_user_' + this.user.id;
    Store.load();
  },

  // Gộp dữ liệu máy này và server theo từng từ
  merge(a, b) {
    const out = JSON.parse(JSON.stringify(a));
    for (const [id, p] of Object.entries(b.prog || {})) {
      const q = out.prog[id];
      if (!q || (p.ok + p.bad) > (q.ok + q.bad)) out.prog[id] = p;
    }
    for (const id of Object.keys(b.fav || {})) out.fav[id] = 1;
    for (const [k, n] of Object.entries(b.days || {})) out.days[k] = Math.max(out.days[k] || 0, n);
    for (const [id, at] of Object.entries(b.achievements || {})) out.achievements[id] = Math.min(out.achievements[id] || Infinity, at);
    const sessions = [...(out.sessions || []), ...(b.sessions || [])];
    out.sessions = sessions.sort((x, y) => y.at - x.at).filter((s, i, a) => a.findIndex(t => t.at === s.at && t.type === s.type) === i).slice(0, 30);
    return out;
  },

  async pull() {
    try {
      const { data } = await api('GET', '/api/data');
      const local = Store.d;
      if (data) {
        const merged = this.merge({ ...local, prog: local.prog, fav: local.fav, days: local.days }, data);
        merged.settings = Object.assign({}, local.settings, data.settings || {});
        merged.name = local.name;
        Store.d = merged;
        document.documentElement.dataset.theme = Store.s.theme;
      }
      localStorage.setItem(Store.key, JSON.stringify(Store.d));
      await this.push();
    } catch (e) { /* offline: giữ dữ liệu cục bộ */ }
  },

  queuePush() { clearTimeout(this.timer); this.timer = setTimeout(() => this.push(), 1500); },
  async push() {
    if (!this.user) return;
    clearTimeout(this.timer);
    try { await api('PUT', '/api/data', { data: Store.d }); }
    catch (e) { if (e.status === 401) { this.user = null; render_nav(); } }
  },

  async login(email, password) {
    this.user = (await api('POST', '/api/login', { email, password })).user;
    this.selectStore();
    await this.pull();
  },
  async register(email, password, name) {
    const guest = Store.d;
    this.user = (await api('POST', '/api/register', { email, password, name })).user;
    this.selectStore();
    Store.d = this.merge(Store.d, guest);
    await this.pull();
  },
  async logout() {
    await this.push();
    await api('POST', '/api/logout', {});
    this.user = null;
    clearTimeout(this.timer);
    Store.key = 'hsk_app_v1'; Store.load();
  }
};
window.addEventListener('beforeunload', () => { if (Auth.user && Auth.timer) navigator.sendBeacon && Auth.push(); });
