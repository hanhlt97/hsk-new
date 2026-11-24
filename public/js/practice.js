Pages.practice = v => {
  v.innerHTML = `
    <h1>⚡ Luyện nhanh</h1>
    <p class="sub">Một phiên 10 từ, ưu tiên từ mới và từ trả lời sai gần đây.</p>
    <div class="opts"><label>Cấp: <select id="pl"></select></label><label>Độ dài: <select id="plen"><option value="10">10 từ</option><option value="20">20 từ</option><option value="all">Tất cả</option></select></label><label>Chế độ: <select id="pmode"><option value="pinyin">Gõ pinyin</option><option value="hanzi">Gõ chữ Hán</option></select></label></div>
    <div class="card center"><div class="eyebrow" id="pmeta"></div><div class="hanzi zh" id="ph">…</div><div class="pinyin" id="pp"></div><div class="meaning" id="pm"></div><input id="pi" autocomplete="off" spellcheck="false"><div class="actions"><button class="btn" id="pskip">Bỏ qua (Tab)</button><button class="btn" id="prestart">Làm lại</button></div><div class="bar"><div id="pbar"></div></div></div>
    <div class="stats"><div class="stat"><b id="pg">0</b><span>Đúng</span></div><div class="stat"><b id="pa">100%</b><span>Chính xác</span></div><div class="stat"><b id="pst">0</b><span>Chuỗi</span></div></div>`;
  const level = $('#pl', v), inp = $('#pi', v); let q = [], i = 0, good = 0, attempts = 0, streak = 0, error = false, timer, composing = false, started = 0, saved = false;
  for (let l = 1; l <= 9; l++) level.insertAdjacentHTML('beforeend', `<option value="${l}">HSK ${l}</option>`); level.value = Store.s.level;
  const score = () => { $('#pg', v).textContent = good; $('#pa', v).textContent = attempts ? Math.round(good / attempts * 100) + '%' : '100%'; $('#pst', v).textContent = streak; };
  const build = () => {
    clearTimeout(timer); const list = shuffle(wordsOf(+level.value)).sort((a, b) => ((Store.d.prog[a.id] || {}).box || 0) - ((Store.d.prog[b.id] || {}).box || 0) || ((Store.d.prog[b.id] || {}).bad || 0) - ((Store.d.prog[a.id] || {}).bad || 0));
    const amount = $('#plen', v).value === 'all' ? list.length : +$('#plen', v).value; q = list.slice(0, amount); i = good = attempts = streak = 0; started = Date.now(); saved = false; show(); score(); inp.focus();
  };
  const show = () => { error = false; inp.className = ''; inp.value = ''; if (i >= q.length) { if (!saved && q.length) { Store.session('practice', good, q.length, Math.round((Date.now() - started) / 1000)); saved = true; } $('#ph', v).textContent = '🎉'; $('#pm', v).textContent = `Hoàn thành ${good}/${q.length} từ`; inp.disabled = true; $('#pmeta', v).textContent = 'Phiên hoàn tất'; $('#pbar', v).style.width = '100%'; score(); return; } inp.disabled = false; const w = q[i]; $('#pmeta', v).textContent = `Từ ${i + 1}/${q.length}`; $('#ph', v).textContent = w.h; $('#pp', v).textContent = Store.s.pinyin ? w.p : ''; $('#pm', v).textContent = Store.s.mean ? w.m : ''; $('#pbar', v).style.width = i / q.length * 100 + '%'; speak(w.h); };
  const next = ok => { clearTimeout(timer); if (!q[i]) return; Store.record(q[i].id, ok); attempts++; if (ok) { good++; streak++; } else streak = 0; i++; show(); score(); };
  const check = () => { clearTimeout(timer); if (i >= q.length || !inp.value) return; const w = q[i], x = $('#pmode', v).value === 'pinyin' ? normPinyin(inp.value) : inp.value, t = $('#pmode', v).value === 'pinyin' ? normPinyin(w.p) : w.h; if (x === t) { inp.className = 'good'; timer = setTimeout(() => next(!error), 120); } else if (t.startsWith(x)) inp.className = ''; else { inp.className = 'bad'; error = true; } };
  inp.addEventListener('compositionstart', () => composing = true); inp.addEventListener('compositionend', () => { composing = false; check(); }); inp.addEventListener('input', () => { if (!composing) check(); }); inp.addEventListener('keydown', e => { if (e.key === 'Tab') { e.preventDefault(); next(false); } });
  $('#pskip', v).onclick = () => next(false); $('#prestart', v).onclick = build; ['pl', 'plen', 'pmode'].forEach(id => $('#' + id, v).onchange = build); build();
  return () => clearTimeout(timer);
};
NAV.splice(1, 0, ['practice', 'Luyện nhanh']);
