const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('node:path');
const { db, hashPassword, verifyPassword, createSession, getSessionUser, destroySession, destroyUserSessions, purgeExpired, SESSION_MS } = require('./db');

const PORT = +process.env.PORT || 3000;
const COOKIE = 'hsk_sid';
const app = express();
if (process.env.TRUST_PROXY === '1') app.set('trust proxy', 1);
app.disable('x-powered-by');
app.use(helmet({ contentSecurityPolicy: { directives: { ...helmet.contentSecurityPolicy.getDefaultDirectives(), 'upgrade-insecure-requests': null } } }));
app.use(express.json({ limit: '1mb' }));

// ---------- tiện ích ----------
const parseCookies = h => Object.fromEntries((h || '').split(';').map(s => s.trim().split('=')).filter(a => a[0]).map(([k, ...v]) => [k, v.join('=')]));
const getToken = req => parseCookies(req.headers.cookie)[COOKIE];
const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,}$/;
const cleanName = n => String(n || '').replace(/[\u0000-\u001f<>]/g, '').trim().slice(0, 40);
const fail = (res, code, msg) => res.status(code).json({ error: msg });
const wrap = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

function setCookie(req, res, token) {
  res.cookie(COOKIE, token, { httpOnly: true, sameSite: 'lax', secure: req.secure, maxAge: SESSION_MS, path: '/' });
}

// CSRF: mọi yêu cầu ghi phải là JSON và (nếu có) Origin trùng host
app.use('/api', (req, res, next) => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  const origin = req.headers.origin;
  if (origin) { try { if (new URL(origin).host !== req.headers.host) return fail(res, 403, 'Origin không hợp lệ'); } catch { return fail(res, 403, 'Origin không hợp lệ'); } }
  if (!req.is('application/json')) return fail(res, 415, 'Cần Content-Type: application/json');
  next();
});

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: true, legacyHeaders: false, message: { error: 'Quá nhiều lần thử, hãy đợi 15 phút.' } });
const apiLimiter = rateLimit({ windowMs: 60 * 1000, limit: 120, standardHeaders: true, legacyHeaders: false, message: { error: 'Quá nhiều yêu cầu.' } });
app.use('/api', apiLimiter);

function auth(req, res, next) {
  const user = getSessionUser(getToken(req));
  if (!user) return fail(res, 401, 'Chưa đăng nhập');
  req.user = user; req.token = getToken(req); next();
}
const adminOnly = (req, res, next) => req.user.role === 'admin' ? next() : fail(res, 403, 'Cần quyền admin');

// ---------- tài khoản ----------
app.post('/api/register', authLimiter, wrap(async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase(), pw = String(req.body.password || '');
  if (!EMAIL_RE.test(email)) return fail(res, 400, 'Email không hợp lệ');
  if (pw.length < 8 || pw.length > 200) return fail(res, 400, 'Mật khẩu từ 8 đến 200 ký tự');
  if (db.prepare('SELECT 1 FROM users WHERE email=?').get(email)) return fail(res, 409, 'Email đã được đăng ký');
  const hash = await hashPassword(pw);
  let id;
  try { id = db.prepare('INSERT INTO users (email,name,pass_hash,created_at,last_login) VALUES (?,?,?,?,?)').run(email, cleanName(req.body.name) || email.split('@')[0].slice(0, 40), hash, Date.now(), Date.now()).lastInsertRowid; }
  catch { return fail(res, 409, 'Email đã được đăng ký'); }
  setCookie(req, res, createSession(+id));
  res.json({ user: db.prepare('SELECT id,email,name,role FROM users WHERE id=?').get(id) });
}));

const DUMMY = 'scrypt$00000000000000000000000000000000$' + '0'.repeat(128);
app.post('/api/login', authLimiter, wrap(async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase(), pw = String(req.body.password || '');
  const u = db.prepare('SELECT * FROM users WHERE email=?').get(email);
  const ok = await verifyPassword(pw.slice(0, 200), u ? u.pass_hash : DUMMY); // luôn băm để tránh lộ email tồn tại
  if (!u || !ok) return fail(res, 401, 'Sai email hoặc mật khẩu');
  if (u.disabled) return fail(res, 403, 'Tài khoản đã bị khóa');
  db.prepare('UPDATE users SET last_login=? WHERE id=?').run(Date.now(), u.id);
  setCookie(req, res, createSession(u.id));
  res.json({ user: { id: u.id, email: u.email, name: u.name, role: u.role } });
}));

app.post('/api/logout', (req, res) => {
  const t = getToken(req); if (t) destroySession(t);
  res.clearCookie(COOKIE, { path: '/' }); res.json({ ok: true });
});

app.get('/api/me', (req, res) => res.json({ user: getSessionUser(getToken(req)) }));

app.patch('/api/me', auth, (req, res) => {
  const name = cleanName(req.body.name);
  if (!name) return fail(res, 400, 'Tên không được để trống');
  db.prepare('UPDATE users SET name=? WHERE id=?').run(name, req.user.id);
  res.json({ user: { ...req.user, name } });
});

app.post('/api/me/password', authLimiter, auth, wrap(async (req, res) => {
  const cur = String(req.body.current || ''), nw = String(req.body.password || '');
  if (nw.length < 8 || nw.length > 200) return fail(res, 400, 'Mật khẩu mới từ 8 đến 200 ký tự');
  const u = db.prepare('SELECT pass_hash FROM users WHERE id=?').get(req.user.id);
  if (!(await verifyPassword(cur, u.pass_hash))) return fail(res, 403, 'Mật khẩu hiện tại không đúng');
  db.prepare('UPDATE users SET pass_hash=? WHERE id=?').run(await hashPassword(nw), req.user.id);
  destroyUserSessions(req.user.id, req.token); // đăng xuất các thiết bị khác
  res.json({ ok: true });
}));

const adminCount = () => db.prepare("SELECT COUNT(*) c FROM users WHERE role='admin' AND disabled=0").get().c;

app.delete('/api/me', authLimiter, auth, wrap(async (req, res) => {
  const u = db.prepare('SELECT pass_hash FROM users WHERE id=?').get(req.user.id);
  if (!(await verifyPassword(String(req.body.password || ''), u.pass_hash))) return fail(res, 403, 'Mật khẩu không đúng');
  if (req.user.role === 'admin' && adminCount() <= 1) return fail(res, 400, 'Không thể xóa admin cuối cùng');
  db.prepare('DELETE FROM users WHERE id=?').run(req.user.id);
  res.clearCookie(COOKIE, { path: '/' }); res.json({ ok: true });
}));

// ---------- đồng bộ dữ liệu học ----------
app.get('/api/data', auth, (req, res) => {
  const r = db.prepare('SELECT json,updated_at FROM user_data WHERE user_id=?').get(req.user.id);
  res.json(r ? { data: JSON.parse(r.json), updated_at: r.updated_at } : { data: null, updated_at: 0 });
});
app.put('/api/data', auth, (req, res) => {
  const d = req.body.data;
  if (!d || typeof d !== 'object' || Array.isArray(d)) return fail(res, 400, 'Dữ liệu không hợp lệ');
  const json = JSON.stringify({ settings: d.settings, prog: d.prog, fav: d.fav, days: d.days, sessions: d.sessions, achievements: d.achievements });
  if (json.length > 900000) return fail(res, 413, 'Dữ liệu quá lớn');
  const now = Date.now();
  db.prepare('INSERT INTO user_data (user_id,json,updated_at) VALUES (?,?,?) ON CONFLICT(user_id) DO UPDATE SET json=excluded.json, updated_at=excluded.updated_at').run(req.user.id, json, now);
  res.json({ ok: true, updated_at: now });
});

// ---------- quản trị ----------
const admin = express.Router();
admin.use(auth, adminOnly);

admin.get('/stats', (req, res) => {
  const c = sql => db.prepare(sql).get().c;
  const since = Date.now() - 864e5;
  res.json({
    users: c('SELECT COUNT(*) c FROM users'),
    admins: c("SELECT COUNT(*) c FROM users WHERE role='admin'"),
    disabled: c('SELECT COUNT(*) c FROM users WHERE disabled=1'),
    active24h: c(`SELECT COUNT(*) c FROM users WHERE last_login>${since}`),
    new7d: c(`SELECT COUNT(*) c FROM users WHERE created_at>${Date.now() - 7 * 864e5}`),
    withData: c('SELECT COUNT(*) c FROM user_data')
  });
});

admin.get('/users', (req, res) => {
  const q = '%' + String(req.query.q || '').trim().toLowerCase().replace(/[%_\\]/g, m => '\\' + m) + '%';
  const rows = db.prepare(`SELECT id,email,name,role,disabled,created_at,last_login FROM users WHERE lower(email) LIKE ? ESCAPE '\\' OR lower(name) LIKE ? ESCAPE '\\' ORDER BY id DESC LIMIT 200`).all(q, q);
  res.json({ users: rows });
});

admin.patch('/users/:id', wrap(async (req, res) => {
  const id = +req.params.id;
  const t = db.prepare('SELECT * FROM users WHERE id=?').get(id);
  if (!t) return fail(res, 404, 'Không tìm thấy người dùng');
  const b = req.body, self = id === req.user.id;
  if (b.role !== undefined) {
    if (!['user', 'admin'].includes(b.role)) return fail(res, 400, 'Vai trò không hợp lệ');
    if (t.role === 'admin' && b.role === 'user' && adminCount() <= 1) return fail(res, 400, 'Không thể hạ admin cuối cùng');
    db.prepare('UPDATE users SET role=? WHERE id=?').run(b.role, id);
  }
  if (b.disabled !== undefined) {
    if (self) return fail(res, 400, 'Không thể tự khóa tài khoản của mình');
    if (t.role === 'admin' && b.disabled && adminCount() <= 1) return fail(res, 400, 'Không thể khóa admin cuối cùng');
    db.prepare('UPDATE users SET disabled=? WHERE id=?').run(b.disabled ? 1 : 0, id);
    if (b.disabled) destroyUserSessions(id);
  }
  if (b.password !== undefined) {
    const pw = String(b.password);
    if (pw.length < 8 || pw.length > 200) return fail(res, 400, 'Mật khẩu từ 8 đến 200 ký tự');
    db.prepare('UPDATE users SET pass_hash=? WHERE id=?').run(await hashPassword(pw), id);
    destroyUserSessions(id, self ? req.token : null);
  }
  res.json({ ok: true });
}));

admin.delete('/users/:id', (req, res) => {
  const id = +req.params.id;
  const t = db.prepare('SELECT role FROM users WHERE id=?').get(id);
  if (!t) return fail(res, 404, 'Không tìm thấy người dùng');
  if (id === req.user.id) return fail(res, 400, 'Hãy dùng “Xóa tài khoản” trong trang Tài khoản');
  db.prepare('DELETE FROM users WHERE id=?').run(id);
  res.json({ ok: true });
});
app.use('/api/admin', admin);

app.use('/api', (req, res) => fail(res, 404, 'Không tìm thấy'));

// ---------- web tĩnh ----------
app.use(express.static(path.join(__dirname, '..', 'public'), { maxAge: '5m' }));

app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') return fail(res, 400, 'JSON không hợp lệ');
  if (err.type === 'entity.too.large') return fail(res, 413, 'Dữ liệu quá lớn');
  console.error(err); fail(res, 500, 'Lỗi máy chủ');
});

setInterval(purgeExpired, 3600 * 1000).unref();
purgeExpired();
if (require.main === module) app.listen(PORT, () => console.log('HSK server chạy tại http://localhost:' + PORT));
module.exports = app;
