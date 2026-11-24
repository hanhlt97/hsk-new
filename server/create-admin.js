// Dùng: npm run create-admin -- email@example.com "Mật khẩu" ["Tên"]
// hoặc để trống mật khẩu để nhập an toàn: ADMIN_PASSWORD=... npm run create-admin -- email
const { db, hashPassword } = require('./db');

(async () => {
  const [email, argPw, name] = process.argv.slice(2);
  const pw = process.env.ADMIN_PASSWORD || argPw;
  if (!email || !pw) { console.error('Cách dùng: npm run create-admin -- <email> <mật khẩu> [tên]'); process.exit(1); }
  if (pw.length < 8) { console.error('Mật khẩu tối thiểu 8 ký tự.'); process.exit(1); }
  const e = email.trim().toLowerCase();
  const hash = await hashPassword(pw);
  const ex = db.prepare('SELECT id FROM users WHERE email=?').get(e);
  if (ex) {
    db.prepare("UPDATE users SET role='admin', disabled=0, pass_hash=? WHERE id=?").run(hash, ex.id);
    console.log('Đã nâng thành admin và đặt lại mật khẩu cho', e);
  } else {
    db.prepare("INSERT INTO users (email,name,pass_hash,role,created_at) VALUES (?,?,?,'admin',?)").run(e, name || 'Admin', hash, Date.now());
    console.log('Đã tạo admin', e);
  }
})();
