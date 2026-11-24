const { DatabaseSync } = require('node:sqlite');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'data', 'data.db');
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

const db = new DatabaseSync(DB_PATH);
db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL DEFAULT '',
    pass_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user','admin')),
    disabled INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL,
    last_login INTEGER
  );
  CREATE TABLE IF NOT EXISTS sessions (
    token_hash TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
  CREATE TABLE IF NOT EXISTS user_data (
    user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    json TEXT NOT NULL,
    updated_at INTEGER NOT NULL
  );
`);

// ---- Mật khẩu: scrypt + salt ngẫu nhiên ----
function hashPassword(pw) {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16);
    crypto.scrypt(pw, salt, 64, { N: 16384, r: 8, p: 1 }, (e, key) =>
      e ? reject(e) : resolve('scrypt$' + salt.toString('hex') + '$' + key.toString('hex')));
  });
}
function verifyPassword(pw, stored) {
  return new Promise(resolve => {
    const [, saltHex, keyHex] = String(stored).split('$');
    if (!saltHex || !keyHex) return resolve(false);
    crypto.scrypt(pw, Buffer.from(saltHex, 'hex'), 64, { N: 16384, r: 8, p: 1 }, (e, key) => {
      if (e) return resolve(false);
      const want = Buffer.from(keyHex, 'hex');
      resolve(want.length === key.length && crypto.timingSafeEqual(want, key));
    });
  });
}

// ---- Phiên đăng nhập ----
const SESSION_MS = 30 * 24 * 3600 * 1000;
const sha = t => crypto.createHash('sha256').update(t).digest('hex');
function createSession(userId) {
  const token = crypto.randomBytes(32).toString('base64url');
  db.prepare('INSERT INTO sessions (token_hash,user_id,expires) VALUES (?,?,?)').run(sha(token), userId, Date.now() + SESSION_MS);
  return token;
}
function getSessionUser(token) {
  if (!token) return null;
  const row = db.prepare(`SELECT u.id,u.email,u.name,u.role,u.disabled,s.expires FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=?`).get(sha(token));
  if (!row) return null;
  if (row.expires < Date.now() || row.disabled) { destroySession(token); return null; }
  return { id: row.id, email: row.email, name: row.name, role: row.role };
}
const destroySession = token => db.prepare('DELETE FROM sessions WHERE token_hash=?').run(sha(token));
const destroyUserSessions = (id, exceptToken) =>
  db.prepare('DELETE FROM sessions WHERE user_id=? AND token_hash<>?').run(id, exceptToken ? sha(exceptToken) : '');
const purgeExpired = () => db.prepare('DELETE FROM sessions WHERE expires<?').run(Date.now());

module.exports = { db, hashPassword, verifyPassword, createSession, getSessionUser, destroySession, destroyUserSessions, purgeExpired, SESSION_MS };
