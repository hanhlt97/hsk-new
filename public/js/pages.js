// ===== Trang chủ =====
Pages.home = v => {
  const lv = Store.s.level, goal = Store.s.goal, today = Store.today();
  const name = Auth.user ? ', ' + esc(Auth.user.name) : Store.d.name ? ', ' + esc(Store.d.name) : '';
  v.innerHTML = `
    <h1>你好${name}! 👋</h1>
    <p class="sub">Học tiếng Trung theo chuẩn HSK 3.0 (9 cấp) — gõ chữ, flashcard, trắc nghiệm.</p>
    <div class="stats">
      <div class="stat"><b>🔥 ${Store.streak()}</b><span>Ngày liên tiếp</span></div>
      <div class="stat"><b>${today}/${goal}</b><span>Mục tiêu hôm nay</span></div>
      <div class="stat"><b>${Store.dueCount(lv)}</b><span>Từ cần ôn (HSK ${lv})</span></div>
      <div class="stat"><b>${Store.mastered(lv)}/${wordsOf(lv).length}</b><span>Đã thuộc (HSK ${lv})</span></div>
    </div>
    <div class="bar"><div style="width:${Math.min(100, today / goal * 100)}%"></div></div>
    <h2>Cấp đang học</h2><div id="lv"></div>
    <h2>Điểm yếu cần ôn</h2><div class="card" id="weak"></div>
    <h2>Bắt đầu luyện</h2>
    <div class="hero"><div><span class="eyebrow">MỖI NGÀY MỘT CHÚT</span><h2>Luyện tập có chủ đích</h2><p>Phiên ngắn 10 từ, ưu tiên những từ bạn chưa vững.</p><a class="btn primary" href="#/practice">Bắt đầu luyện nhanh</a></div><div class="hero-mark zh" aria-hidden="true">学</div></div>
    <p class="tip">Bộ từ vựng minh họa, chưa phải danh sách chính thức đầy đủ. Nhóm nâng cao 7–9 được chia để luyện tập, không khẳng định phân cấp chính thức từng từ.</p>
    <div class="grid">
      <a class="tile" href="#/typing"><div class="ic">⌨️</div><b>Gõ chữ</b><span>Gõ pinyin hoặc chữ Hán cho từng từ</span></a>
      <a class="tile" href="#/flash"><div class="ic">🗂️</div><b>Flashcard</b><span>Ôn lặp lại ngắt quãng (SRS)</span></a>
      <a class="tile" href="#/quiz"><div class="ic">✅</div><b>Trắc nghiệm</b><span>Chọn nghĩa / chữ Hán / pinyin đúng</span></a>
      <a class="tile" href="#/dict"><div class="ic">📖</div><b>Từ điển</b><span>Tra cứu, đánh dấu từ yêu thích</span></a>
    </div>`;
  const weak = Store.weak(lv);
  $('#weak', v).innerHTML = weak.length ? weak.map(w => `<span class="weak-chip"><b class="zh">${esc(w.h)}</b> ${esc(w.p)} · ${Store.d.prog[w.id].bad} lần sai</span>`).join('') + '<p class="tip"><a href="#/practice">Luyện lại ngay</a></p>' : '<p class="sub">Chưa có dữ liệu. Hoàn thành một phiên luyện để xem phân tích.</p>';
  levelBar($('#lv', v), () => Pages.home(v));
};

// ===== Gõ chữ =====
Pages.typing = v => {
  v.innerHTML = `
    <h1>⌨️ Gõ chữ</h1><p class="sub">Chọn cấp HSK và chế độ để luyện gõ.</p>
    <div id="lv"></div>
    <div class="opts">
      <label>Chế độ: <select id="mode"><option value="pinyin">Gõ pinyin (không cần bộ gõ)</option><option value="hanzi">Gõ chữ Hán (dùng IME)</option></select></label>
      <label><input type="checkbox" id="shuf" checked> Xáo trộn</label>
      <label><input type="checkbox" id="onlyFav"> Chỉ từ yêu thích</label>
    </div>
    <div class="card center">
      <div class="hanzi zh" id="hz">…</div>
      <div class="pinyin" id="py"></div><div class="meaning" id="mn"></div>
      <input id="inp" type="text" autocomplete="off" autocapitalize="off" spellcheck="false">
      <div class="actions"><button class="btn" id="spk">🔊 Nghe</button><button class="btn" id="skip">Bỏ qua (Tab)</button><button class="btn" id="re">Làm lại</button></div>
      <div class="bar"><div id="prog"></div></div>
    </div>
    <div class="stats">
      <div class="stat"><b id="sD">0</b><span>Đã gõ</span></div><div class="stat"><b id="sA">100%</b><span>Chính xác</span></div>
      <div class="stat"><b id="sS">0</b><span>Chuỗi đúng</span></div><div class="stat"><b id="sW">0</b><span>Từ/phút</span></div>
    </div>
    <p class="tip">Chế độ pinyin: dấu thanh, số thanh và khoảng trắng được bỏ qua; gõ <b>v</b> thay cho ü. Chế độ chữ Hán: bật bộ gõ Pinyin của hệ điều hành.</p>`;
  let q = [], i = 0, good = 0, bad = 0, streak = 0, t0 = null, err = false, composing = false, timer = null;
  const inp = $('#inp', v);
  const build = () => {
    clearTimeout(timer); timer = null;
    let list = wordsOf(Store.s.level);
    if ($('#onlyFav', v).checked) list = list.filter(w => Store.isFav(w.id));
    q = $('#shuf', v).checked ? shuffle(list) : list; i = 0; good = bad = streak = 0; t0 = null;
    inp.value = ''; render(); stats();
  };
  const stats = () => {
    $('#sD', v).textContent = good + '/' + q.length;
    $('#sA', v).textContent = good + bad ? Math.round(good / (good + bad) * 100) + '%' : '100%';
    $('#sS', v).textContent = streak;
    const m = t0 ? (Date.now() - t0) / 6e4 : 0; $('#sW', v).textContent = m > 0.02 ? Math.round(good / m) : 0;
  };
  const render = () => {
    inp.className = ''; err = false;
    if (!q.length) { $('#hz', v).textContent = '—'; $('#py', v).textContent = ''; $('#mn', v).textContent = 'Không có từ nào (hãy đánh dấu ★ trong Từ điển).'; inp.disabled = true; return; }
    if (i >= q.length) { $('#hz', v).innerHTML = '🎉 Hoàn thành!'; $('#py', v).textContent = ''; $('#mn', v).textContent = 'Chọn cấp khác hoặc bấm “Làm lại”.'; inp.disabled = true; $('#prog', v).style.width = '100%'; return; }
    inp.disabled = false; const w = q[i];
    $('#hz', v).textContent = w.h;
    $('#py', v).textContent = Store.s.pinyin ? w.p : '';
    $('#mn', v).textContent = Store.s.mean ? w.m : '';
    inp.placeholder = $('#mode', v).value === 'pinyin' ? 'gõ pinyin…' : 'gõ chữ Hán…';
    $('#prog', v).style.width = (i / q.length * 100) + '%';
    speak(w.h);
  };
  const next = ok => { clearTimeout(timer); timer = null; if (!q[i]) return; Store.record(q[i].id, ok); if (ok) { good++; streak++; } else { bad++; streak = 0; } i++; inp.value = ''; render(); stats(); };
  const check = () => {
    clearTimeout(timer); timer = null;
    if (i >= q.length || !inp.value) { inp.className = ''; return; }
    if (!t0) t0 = Date.now();
    const w = q[i], pin = $('#mode', v).value === 'pinyin';
    const x = pin ? normPinyin(inp.value) : inp.value, t = pin ? normPinyin(w.p) : w.h;
    if (x === t) { inp.className = 'good'; const ok = !err; timer = setTimeout(() => next(ok), 120); }
    else if (t.startsWith(x)) inp.className = '';
    else { inp.className = 'bad'; err = true; }
  };
  inp.addEventListener('compositionstart', () => composing = true);
  inp.addEventListener('compositionend', () => { composing = false; check(); });
  inp.addEventListener('input', () => { if (!composing) check(); });
  inp.addEventListener('keydown', e => { if (e.key === 'Tab') { e.preventDefault(); $('#skip', v).click(); } });
  $('#skip', v).onclick = () => { if (i < q.length) next(false); inp.focus(); };
  $('#re', v).onclick = () => { build(); inp.focus(); };
  $('#spk', v).onclick = () => { if (q[i]) { const s = Store.s.speak; Store.s.speak = true; speak(q[i].h); Store.s.speak = s; } inp.focus(); };
  ['mode', 'shuf', 'onlyFav'].forEach(id => $('#' + id, v).addEventListener('change', () => { id === 'mode' ? (inp.value = '', render()) : build(); inp.focus(); }));
  levelBar($('#lv', v), () => { build(); inp.focus(); });
  build(); inp.focus();
  return () => { clearTimeout(timer); speechSynthesis && speechSynthesis.cancel(); };
};

// ===== Flashcard (SRS) =====
Pages.flash = v => {
  v.innerHTML = `
    <h1>🗂️ Flashcard</h1><p class="sub">Ôn lặp lại ngắt quãng: từ nhớ sẽ xuất hiện thưa dần, từ quên sẽ quay lại sớm.</p>
    <div id="lv"></div>
    <div class="card fc" id="card"></div>
    <div class="actions" id="btns"></div>
    <div class="tip center" id="info"></div>
    <p class="tip center">Phím tắt: Space = lật thẻ · 1 = Quên · 2 = Nhớ</p>`;
  let q = [], flipped = false;
  const card = $('#card', v), btns = $('#btns', v);
  const build = () => {
    const now = Date.now();
    q = wordsOf(Store.s.level).filter(w => { const p = Store.d.prog[w.id]; return !p || p.due <= now; })
      .sort((a, b) => ((Store.d.prog[a.id] || {}).due || 0) - ((Store.d.prog[b.id] || {}).due || 0)).slice(0, 50);
    q = shuffle(q); flipped = false; show();
  };
  const show = () => {
    if (!q.length) { card.innerHTML = '<div class="big">🎉</div><p>Đã ôn hết thẻ đến hạn của HSK ' + Store.s.level + '!</p>'; btns.innerHTML = ''; $('#info', v).textContent = ''; return; }
    const w = q[0];
    card.innerHTML = flipped
      ? `<div class="hanzi zh">${esc(w.h)}</div><div class="pinyin">${esc(w.p)}</div><div class="meaning" style="font-size:1.3rem;color:var(--ink)">${esc(w.m)}</div>`
      : `<div class="hanzi zh">${esc(w.h)}</div><div class="meaning">Bấm để lật thẻ</div>`;
    btns.innerHTML = flipped
      ? '<button class="btn bad" id="no">✗ Quên (1)</button><button class="btn ok" id="yes">✓ Nhớ (2)</button>'
      : '<button class="btn primary" id="flip">Lật thẻ (Space)</button>';
    if (flipped) { $('#no', v).onclick = () => rate(false); $('#yes', v).onclick = () => rate(true); }
    else $('#flip', v).onclick = flip;
    $('#info', v).textContent = 'Còn ' + q.length + ' thẻ · hộp ' + ((Store.d.prog[w.id] || {}).box || 0) + '/5';
  };
  const flip = () => { if (!q.length) return; flipped = !flipped; if (flipped) speak(q[0].h); show(); };
  const rate = ok => { if (!q.length || !flipped) return; const w = q.shift(); Store.record(w.id, ok); if (!ok) q.push(w); flipped = false; show(); };
  card.onclick = flip;
  const key = e => {
    if (e.target.tagName === 'INPUT') return;
    if (e.code === 'Space') { e.preventDefault(); flip(); }
    else if (e.key === '1') rate(false); else if (e.key === '2') rate(true);
  };
  document.addEventListener('keydown', key);
  levelBar($('#lv', v), build); build();
  return () => { document.removeEventListener('keydown', key); speechSynthesis && speechSynthesis.cancel(); };
};

// ===== Trắc nghiệm =====
Pages.quiz = v => {
  v.innerHTML = `
    <h1>✅ Trắc nghiệm</h1><p class="sub">10 câu mỗi lượt.</p>
    <div id="lv"></div>
    <div class="opts"><label>Dạng câu hỏi: <select id="kind">
      <option value="h2m">Chữ Hán → nghĩa</option><option value="m2h">Nghĩa → chữ Hán</option><option value="h2p">Chữ Hán → pinyin</option><option value="mix">Trộn</option></select></label></div>
    <div class="card" id="box"></div>`;
  const box = $('#box', v);
  let qs = [], n = 0, score = 0, locked = false, quizTimer = null;
  const make = () => {
    const pool = wordsOf(Store.s.level);
    if (pool.length < 4) return [];
    const kinds = ['h2m', 'm2h', 'h2p'];
    return shuffle(pool).slice(0, 10).map(w => {
      let k = $('#kind', v).value; if (k === 'mix') k = kinds[Math.random() * 3 | 0];
      const f = { h2m: [w.h, 'm', 'm'], m2h: [w.m, 'h', 'h'], h2p: [w.h, 'p', 'p'] }[k];
      const wrong = shuffle(pool.filter(x => x !== w && x[f[2]] !== w[f[2]])).slice(0, 3);
      return { w, k, prompt: k === 'm2h' ? w.m : w.h, ans: w[f[2]], opts: shuffle([w, ...wrong].map(x => x[f[2]])), zhOpt: f[2] === 'h' };
    });
  };
  const start = () => { clearTimeout(quizTimer); qs = make(); n = 0; score = 0; ask(); };
  const ask = () => {
    locked = false;
    if (!qs.length) { box.innerHTML = '<p>Cấp này chưa đủ từ để tạo câu hỏi.</p>'; return; }
    if (n >= qs.length) {
      const pct = Math.round(score / qs.length * 100);
      box.innerHTML = `<div class="center"><div class="big">${score}/${qs.length}</div><p>${pct >= 80 ? '🎉 Tuyệt vời!' : pct >= 50 ? '👍 Khá tốt, luyện thêm nhé.' : '💪 Cố lên, ôn lại flashcard rồi thử lại.'}</p><button class="btn primary" id="again">Làm lượt mới</button></div>`;
      $('#again', v).onclick = start; return;
    }
    const q = qs[n];
    const lab = { h2m: 'Nghĩa của từ này là gì?', m2h: 'Chọn chữ Hán đúng', h2p: 'Pinyin của từ này là gì?' }[q.k];
    box.innerHTML = `<div class="sub">Câu ${n + 1}/${qs.length} · Điểm ${score}</div><div class="bar" style="margin:0 0 14px"><div style="width:${n / qs.length * 100}%"></div></div>
      <div class="center"><div class="${q.k === 'm2h' ? 'big' : 'hanzi zh'}" style="${q.k === 'm2h' ? 'font-size:1.6rem' : ''}">${esc(q.prompt)}</div><p class="sub">${lab}</p></div>
      ${q.opts.map((o, i) => `<button class="opt ${q.zhOpt ? 'zh' : ''}" data-o="${esc(o)}"><kbd>${i + 1}</kbd>${esc(o)}</button>`).join('')}`;
    box.querySelectorAll('.opt').forEach(b => b.onclick = () => pick(b));
  };
  const pick = b => {
    if (locked) return; locked = true;
    const q = qs[n], ok = b.dataset.o === q.ans;
    Store.record(q.w.id, ok); if (ok) { score++; } else b.classList.add('wrong');
    box.querySelectorAll('.opt').forEach(x => { if (x.dataset.o === q.ans) x.classList.add('right'); });
    speak(q.w.h);
    quizTimer = setTimeout(() => { n++; ask(); }, ok ? 600 : 1400);
  };
  const key = e => { const i = +e.key - 1; if (i >= 0 && i < 4) { const b = box.querySelectorAll('.opt')[i]; if (b) pick(b); } };
  document.addEventListener('keydown', key);
  $('#kind', v).onchange = start;
  levelBar($('#lv', v), start); start();
  return () => document.removeEventListener('keydown', key);
};

// ===== Từ điển =====
Pages.dict = v => {
  v.innerHTML = `
    <h1>📖 Từ điển</h1><p class="sub">Tra theo chữ Hán, pinyin hoặc nghĩa. Bấm ★ để đánh dấu yêu thích.</p>
    <div id="lv"></div>
    <div class="opts"><input type="search" id="q" placeholder="Tìm từ…" style="flex:1;min-width:200px"><label><input type="checkbox" id="fav"> Chỉ yêu thích</label><span id="cnt"></span></div>
    <div class="card" style="padding:6px 12px"><table><tbody id="tb"></tbody></table></div>`;
  const draw = () => {
    const q = $('#q', v).value.trim().toLowerCase(), qn = normPinyin(q);
    const lv = Store.s.dictLevel;
    let l = (lv ? wordsOf(lv) : WORDS);
    if ($('#fav', v).checked) l = l.filter(w => Store.isFav(w.id));
    if (q) l = l.filter(w => w.h.includes(q) || w.m.toLowerCase().includes(q) || (qn && normPinyin(w.p).includes(qn)));
    $('#cnt', v).textContent = l.length + ' từ';
    $('#tb', v).innerHTML = l.map(w => `<tr><td class="h zh">${esc(w.h)}</td><td class="p">${esc(w.p)}</td><td>${esc(w.m)}</td><td>HSK ${w.level}</td>
      <td><button class="spk" data-s="${esc(w.h)}">🔊</button><button class="star ${Store.isFav(w.id) ? 'on' : ''}" data-f="${esc(w.id)}">★</button></td></tr>`).join('') || '<tr><td>Không tìm thấy.</td></tr>';
  };
  $('#tb', v).onclick = e => {
    const s = e.target.closest('[data-s]'), f = e.target.closest('[data-f]');
    if (s) { const o = Store.s.speak; Store.s.speak = true; speak(s.dataset.s); Store.s.speak = o; }
    if (f) { Store.toggleFav(f.dataset.f); f.classList.toggle('on'); if ($('#fav', v).checked) draw(); }
  };
  $('#q', v).oninput = draw; $('#fav', v).onchange = draw;
  levelBar($('#lv', v), draw, true, 'dictLevel'); draw();
};

// ===== Thống kê =====
Pages.stats = v => {
  const days = []; for (let i = 6; i >= 0; i--) { const t = Date.now() - i * DAY; days.push([new Date(t).getDate() + '/' + (new Date(t).getMonth() + 1), Store.d.days[dayKey(t)] || 0]); }
  const max = Math.max(1, ...days.map(d => d[1]));
  const total = Object.values(Store.d.days).reduce((a, b) => a + b, 0);
  const prog = Object.values(Store.d.prog);
  const ok = prog.reduce((a, p) => a + p.ok, 0), bad = prog.reduce((a, p) => a + p.bad, 0);
  const rows = [1, 2, 3, 4, 5, 6, 7, 8, 9].map(l => {
    const ws = wordsOf(l), P = w => Store.d.prog[w.id];
    const m = ws.filter(w => P(w) && P(w).box >= 4).length, lr = ws.filter(w => P(w) && P(w).box > 0 && P(w).box < 4).length, n = ws.length - m - lr;
    return `<div class="row"><div class="lbl">HSK ${l}</div><div class="track"><i style="width:${m / ws.length * 100}%;background:var(--ok)"></i><i style="width:${lr / ws.length * 100}%;background:#e6a700"></i></div><div style="width:90px;font-size:.8rem;color:var(--muted)">${m}/${ws.length} thuộc</div></div>`;
  }).join('');
  v.innerHTML = `
    <h1>📊 Thống kê</h1><p class="sub">Tiến độ học của bạn.</p>
    <div class="stats">
      <div class="stat"><b>🔥 ${Store.streak()}</b><span>Ngày liên tiếp</span></div><div class="stat"><b>${total}</b><span>Lượt luyện</span></div>
      <div class="stat"><b>${prog.length}</b><span>Từ đã học</span></div><div class="stat"><b>${ok + bad ? Math.round(ok / (ok + bad) * 100) : 0}%</b><span>Tỉ lệ đúng</span></div>
    </div>
    <h2>7 ngày gần nhất</h2><div class="card"><div class="chart" style="margin-bottom:20px">${days.map(d => `<div style="height:${d[1] / max * 100}%" title="${d[1]}"><span>${d[0]}</span></div>`).join('')}</div></div>
    <h2>Tiến độ theo cấp <small style="font-weight:400;color:var(--muted)">(xanh: đã thuộc · vàng: đang học)</small></h2><div class="card">${rows}</div>
    <h2>Thành tích</h2><div class="grid achievements">${[
      ['first','🌱','Bắt đầu','Hoàn thành lượt luyện đầu tiên'],['hundred','💯','Trăm từ','Luyện 100 lượt'],['streak3','🔥','Đà học','Học 3 ngày liên tiếp'],['streak7','🚀','Tuần bền bỉ','Học 7 ngày liên tiếp'],['mastered10','🧠','Nắm vững','Thuộc 10 từ']
    ].map(([id,ic,title,desc]) => `<div class="tile ${Store.d.achievements[id] ? 'achievement-on' : 'achievement-off'}"><div class="ic">${ic}</div><b>${title}</b><span>${desc}</span></div>`).join('')}</div>
    <h2>Phiên học gần đây</h2><div class="card">${(Store.d.sessions || []).slice(0, 8).map(s => `<div class="row"><span>${s.type === 'practice' ? '⚡ Luyện nhanh' : esc(s.type)}</span><span style="margin-left:auto;color:var(--muted)">${s.correct}/${s.total} đúng · ${s.seconds}s · ${new Date(s.at).toLocaleDateString('vi-VN')}</span></div>`).join('') || '<p class="sub">Chưa có phiên học nào.</p>'}</div>`;
};

// ===== Cài đặt =====
Pages.settings = v => {
  const s = Store.s;
  v.innerHTML = `
    <h1>⚙️ Cài đặt</h1><p class="sub">Mọi dữ liệu lưu ngay trên trình duyệt của bạn.</p>
    <div class="card">
      <div class="setting" ${Auth.user ? 'hidden' : ''}><span>Tên của bạn</span><input type="text" id="name" value="${esc(Store.d.name)}" placeholder="Tên…"></div>
      <div class="setting"><span>Giao diện</span><select id="theme"><option value="light">Sáng</option><option value="dark">Tối</option></select></div>
      <div class="setting"><span>Mục tiêu mỗi ngày (số từ)</span><input type="number" id="goal" min="5" max="500" value="${s.goal}" style="width:90px"></div>
      <div class="setting"><span>Hiện pinyin khi gõ</span><input type="checkbox" id="pinyin" ${s.pinyin ? 'checked' : ''}></div>
      <div class="setting"><span>Hiện nghĩa khi gõ</span><input type="checkbox" id="mean" ${s.mean ? 'checked' : ''}></div>
      <div class="setting"><span>Phát âm tự động (cần trình duyệt hỗ trợ giọng zh-CN)</span><input type="checkbox" id="speak" ${s.speak ? 'checked' : ''}></div>
    </div>
    <h2>Dữ liệu</h2>
    <div class="actions" style="justify-content:flex-start">
      <button class="btn" id="exp">⬇ Xuất file sao lưu</button>
      <label class="btn">⬆ Nhập sao lưu<input type="file" id="imp" accept=".json" hidden></label>
      <button class="btn bad" id="rst">Xóa toàn bộ tiến độ</button>
    </div>`;
  $('#theme', v).value = s.theme;
  $('#name', v).oninput = e => { Store.d.name = e.target.value; Store.save(); };
  $('#theme', v).onchange = e => { Store.set('theme', e.target.value); document.documentElement.dataset.theme = e.target.value; };
  $('#goal', v).onchange = e => Store.set('goal', Math.max(5, Math.min(500, +e.target.value || 20)));
  ['pinyin', 'mean', 'speak'].forEach(k => $('#' + k, v).onchange = e => Store.set(k, e.target.checked));
  $('#exp', v).onclick = () => {
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(Store.d)], { type: 'application/json' }));
    a.download = 'hsk-backup-' + dayKey() + '.json'; a.click(); URL.revokeObjectURL(a.href);
  };
  $('#imp', v).onchange = e => {
    const f = e.target.files[0]; if (!f) return;
    f.text().then(t => { const d = JSON.parse(t); if (!d || typeof d !== 'object' || !d.settings) throw 0; localStorage.setItem(Store.key, JSON.stringify(d)); Store.load(); toast('Đã nhập sao lưu'); route(); })
      .catch(() => toast('File không hợp lệ'));
  };
  $('#rst', v).onclick = () => { if (confirm('Xóa toàn bộ tiến độ và cài đặt?')) { Store.reset(); toast('Đã xóa'); route(); } };
};
