// ===== Đăng nhập / Đăng ký =====
Pages.login = v => {
  if (Auth.user) { location.hash = '#/account'; return; }
  let mode = 'login';
  const draw = () => {
    const reg = mode === 'register';
    v.innerHTML = `
      <div class="card" style="max-width:400px;margin:20px auto">
        <h1>${reg ? 'Đăng ký' : 'Đăng nhập'}</h1>
        <p class="sub">${reg ? 'Tiến độ hiện tại trên máy này sẽ được lưu vào tài khoản.' : 'Đồng bộ tiến độ trên mọi thiết bị.'}</p>
        <form id="f">
          ${reg ? '<div class="field"><label>Tên hiển thị</label><input type="text" id="name" maxlength="40" autocomplete="nickname"></div>' : ''}
          <div class="field"><label>Email</label><input type="text" id="email" inputmode="email" autocomplete="email" required></div>
          <div class="field"><label>Mật khẩu${reg ? ' (tối thiểu 8 ký tự)' : ''}</label><input type="password" id="pw" autocomplete="${reg ? 'new-password' : 'current-password'}" required></div>
          <div class="err" id="err"></div>
          <button class="btn primary" style="width:100%;margin-top:6px" id="go">${reg ? 'Tạo tài khoản' : 'Đăng nhập'}</button>
        </form>
        <p class="tip center"><a href="#" id="sw">${reg ? 'Đã có tài khoản? Đăng nhập' : 'Chưa có tài khoản? Đăng ký'}</a></p>
        ${Auth.online ? '' : '<p class="err center">Không kết nối được máy chủ — bạn vẫn học được ở chế độ cục bộ.</p>'}
      </div>`;
    $('#sw', v).onclick = e => { e.preventDefault(); mode = reg ? 'login' : 'register'; draw(); };
    $('#f', v).onsubmit = async e => {
      e.preventDefault();
      const btn = $('#go', v), err = $('#err', v); btn.disabled = true; err.textContent = '';
      try {
        const em = $('#email', v).value.trim(), pw = $('#pw', v).value;
        if (reg) await Auth.register(em, pw, $('#name', v).value); else await Auth.login(em, pw);
        toast('Xin chào ' + Auth.user.name + '!'); location.hash = '#/home'; render_nav();
      } catch (ex) { err.textContent = ex.message; btn.disabled = false; }
    };
  };
  draw();
};

// ===== Tài khoản =====
Pages.account = v => {
  const u = Auth.user;
  if (!u) { location.hash = '#/login'; return; }
  v.innerHTML = `
    <h1>👤 Tài khoản</h1><p class="sub">${esc(u.email)} · ${u.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}</p>
    <div class="card">
      <h2 style="margin-top:0">Tên hiển thị</h2>
      <div class="row"><input type="text" id="name" maxlength="40" value="${esc(u.name)}"><button class="btn" id="saveName">Lưu</button></div>
    </div>
    <div class="card" style="margin-top:14px">
      <h2 style="margin-top:0">Đổi mật khẩu</h2>
      <div class="field"><label>Mật khẩu hiện tại</label><input type="password" id="cur" autocomplete="current-password"></div>
      <div class="field"><label>Mật khẩu mới (≥ 8 ký tự)</label><input type="password" id="nw" autocomplete="new-password"></div>
      <div class="err" id="pwErr"></div>
      <button class="btn" id="savePw">Đổi mật khẩu</button>
      <p class="tip">Đổi mật khẩu sẽ đăng xuất các thiết bị khác.</p>
    </div>
    <div class="actions" style="justify-content:flex-start;margin-top:16px">
      <button class="btn" id="out">Đăng xuất</button>
      <button class="btn" id="sync">⟳ Đồng bộ ngay</button>
      <button class="btn bad" id="del">Xóa tài khoản</button>
    </div>`;
  $('#saveName', v).onclick = async () => {
    try { Auth.user = (await api('PATCH', '/api/me', { name: $('#name', v).value })).user; toast('Đã lưu'); render_nav(); } catch (e) { toast(e.message); }
  };
  $('#savePw', v).onclick = async () => {
    const err = $('#pwErr', v); err.textContent = '';
    try { await api('POST', '/api/me/password', { current: $('#cur', v).value, password: $('#nw', v).value }); $('#cur', v).value = $('#nw', v).value = ''; toast('Đã đổi mật khẩu'); }
    catch (e) { err.textContent = e.message; }
  };
  $('#out', v).onclick = async () => { await Auth.logout(); render_nav(); location.hash = '#/home'; route(); };
  $('#sync', v).onclick = async () => { await Auth.pull(); toast('Đã đồng bộ'); };
  $('#del', v).onclick = async () => {
    const pw = prompt('Nhập mật khẩu để xác nhận xóa tài khoản (không thể hoàn tác):');
    if (!pw) return;
    try { await api('DELETE', '/api/me', { password: pw }); Auth.user = null; localStorage.removeItem(Store.key); Store.load(); toast('Đã xóa tài khoản'); render_nav(); location.hash = '#/home'; route(); }
    catch (e) { toast(e.message); }
  };
};

// ===== Quản trị =====
Pages.admin = v => {
  if (!Auth.user || Auth.user.role !== 'admin') { location.hash = '#/home'; return; }
  v.innerHTML = `
    <h1>🛠️ Quản trị</h1><p class="sub">Quản lý người dùng.</p>
    <div class="stats" id="st"></div>
    <div class="opts" style="margin-top:18px"><input type="search" id="q" placeholder="Tìm email hoặc tên…" style="flex:1;min-width:200px"><span id="cnt"></span></div>
    <div class="card" style="padding:6px 12px;overflow-x:auto"><table><thead><tr><th>ID</th><th>Email</th><th>Tên</th><th>Vai trò</th><th>Đăng nhập cuối</th><th></th></tr></thead><tbody id="tb"></tbody></table></div>`;
  const fmt = t => t ? new Date(t).toLocaleString('vi-VN') : '—';
  let users = [];
  const stats = async () => {
    try {
      const s = await api('GET', '/api/admin/stats');
      $('#st', v).innerHTML = [[s.users, 'Người dùng'], [s.active24h, 'Hoạt động 24h'], [s.new7d, 'Mới 7 ngày'], [s.admins, 'Admin'], [s.disabled, 'Bị khóa'], [s.withData, 'Có dữ liệu']].map(([n, l]) => `<div class="stat"><b>${n}</b><span>${l}</span></div>`).join('');
    } catch (e) { toast(e.message); }
  };
  const load = async () => {
    try { users = (await api('GET', '/api/admin/users?q=' + encodeURIComponent($('#q', v).value))).users; } catch (e) { return toast(e.message); }
    $('#cnt', v).textContent = users.length + ' người dùng';
    $('#tb', v).innerHTML = users.map(u => `<tr>
      <td>${u.id}</td><td>${esc(u.email)}</td><td>${esc(u.name)}</td>
      <td>${u.role === 'admin' ? '⭐ admin' : 'user'}${u.disabled ? ' · <span style="color:var(--bad)">khóa</span>' : ''}</td>
      <td style="font-size:.8rem">${fmt(u.last_login)}</td>
      <td style="white-space:nowrap">
        <button class="btn sm" data-a="role" data-id="${u.id}">${u.role === 'admin' ? 'Hạ quyền' : 'Lên admin'}</button>
        <button class="btn sm" data-a="lock" data-id="${u.id}">${u.disabled ? 'Mở khóa' : 'Khóa'}</button>
        <button class="btn sm" data-a="pw" data-id="${u.id}">Đặt MK</button>
        <button class="btn sm bad" data-a="del" data-id="${u.id}">Xóa</button>
      </td></tr>`).join('') || '<tr><td colspan="6">Không có kết quả.</td></tr>';
  };
  $('#tb', v).onclick = async e => {
    const b = e.target.closest('[data-a]'); if (!b) return;
    const id = +b.dataset.id, u = users.find(x => x.id === id), a = b.dataset.a;
    try {
      if (a === 'role') await api('PATCH', '/api/admin/users/' + id, { role: u.role === 'admin' ? 'user' : 'admin' });
      else if (a === 'lock') await api('PATCH', '/api/admin/users/' + id, { disabled: !u.disabled });
      else if (a === 'pw') { const p = prompt('Mật khẩu mới cho ' + u.email + ' (≥ 8 ký tự):'); if (!p) return; await api('PATCH', '/api/admin/users/' + id, { password: p }); toast('Đã đặt lại mật khẩu'); }
      else if (a === 'del') { if (!confirm('Xóa vĩnh viễn ' + u.email + ' và toàn bộ dữ liệu?')) return; await api('DELETE', '/api/admin/users/' + id); }
      load(); stats();
    } catch (ex) { toast(ex.message); }
  };
  let t; $('#q', v).oninput = () => { clearTimeout(t); t = setTimeout(load, 250); };
  stats(); load();
};
