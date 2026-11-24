Pages.work = v => {
  const keys = Object.keys(WORK); let selected = keys[0], mode = 'words', index = 0, queue = [];
  const render = () => {
    const d = WORK[selected];
    v.innerHTML = `<h1>💼 Tiếng Trung đi làm</h1><p class="sub">Bộ từ và mẫu câu dùng trong văn phòng, kỹ thuật, nhà máy và khu công nghiệp. Đây là nhóm nghề nghiệp, không phải cấp HSK.</p><div class="work-tabs">${keys.map(k => `<button class="btn ${k === selected ? 'primary' : ''}" data-dept="${k}">${WORK[k].icon} ${WORK[k].name}</button>`).join('')}</div><div class="card work-head"><div><span class="eyebrow">CHUYÊN ĐỀ NGHỀ NGHIỆP</span><h2>${d.icon} ${d.name}</h2><p class="sub">${d.desc}</p></div><div class="actions"><button class="btn primary" id="startWork">⚡ Luyện chuyên đề</button><button class="btn" id="showPhrases">🗣️ Mẫu câu</button></div></div><div id="workBody"></div>`;
    v.querySelectorAll('[data-dept]').forEach(b => b.onclick = () => { selected = b.dataset.dept; render(); });
    $('#startWork', v).onclick = () => { mode = 'quiz'; queue = shuffle(WORK_WORDS.filter(w => w.dept === selected)); index = 0; renderPractice(); };
    $('#showPhrases', v).onclick = () => { mode = 'phrases'; renderPhrases(); };
    renderWords();
  };
  const renderWords = () => {
    const d = WORK[selected]; $('#workBody', v).innerHTML = `<div class="work-grid">${d.words.map(([h,p,m]) => `<div class="work-word"><div class="work-hanzi zh">${esc(h)}</div><b>${esc(p)}</b><span>${esc(m)}</span><button class="spk" data-s="${esc(h)}">🔊</button></div>`).join('')}</div>`;
    $('#workBody', v).onclick = e => { const b = e.target.closest('[data-s]'); if (b) { const old = Store.s.speak; Store.s.speak = true; speak(b.dataset.s); Store.s.speak = old; } };
  };
  const renderPhrases = () => { const d = WORK[selected]; $('#workBody', v).innerHTML = `<div class="phrase-list">${d.phrases.map(([h,p,m]) => `<div class="card"><div class="work-hanzi zh">${esc(h)}</div><div class="pinyin">${esc(p)}</div><div>${esc(m)}</div><button class="btn sm" data-s="${esc(h)}">🔊 Nghe</button></div>`).join('')}</div>`; $('#workBody', v).onclick = e => { const b = e.target.closest('[data-s]'); if (b) { const old = Store.s.speak; Store.s.speak = true; speak(b.dataset.s); Store.s.speak = old; } }; };
  const renderPractice = () => {
    if (index >= queue.length) { $('#workBody', v).innerHTML = `<div class="card center"><div class="big">🎉</div><h2>Hoàn thành chuyên đề</h2><p>Bạn đã luyện ${queue.length} mục: ${WORK[selected].name}.</p><button class="btn primary" id="againWork">Luyện lại</button></div>`; $('#againWork', v).onclick = () => { index = 0; queue = shuffle(queue); renderPractice(); }; return; }
    const w = queue[index], opts = shuffle([w.m, ...shuffle(queue.filter(x => x.id !== w.id)).slice(0, 3).map(x => x.m)]);
    $('#workBody', v).innerHTML = `<div class="card center"><div class="eyebrow">${index + 1}/${queue.length} · ${WORK[selected].name}</div><div class="bar"><div style="width:${index / queue.length * 100}%"></div></div><div class="work-hanzi zh">${esc(w.h)}</div><div class="pinyin">${esc(w.p)}</div><p>Chọn nghĩa đúng:</p>${opts.map((x,n) => `<button class="opt" data-a="${esc(x)}"><kbd>${n+1}</kbd>${esc(x)}</button>`).join('')}<div id="wf" class="lesson-feedback"></div></div>`;
    $('#workBody', v).querySelectorAll('[data-a]').forEach(b => b.onclick = () => { const ok = b.dataset.a === w.m; Store.record(w.id, ok); $('#wf', v).innerHTML = ok ? '<span class="right-text">✓ Đúng</span>' : `<span class="wrong-text">✗ ${esc(w.m)}</span>`; $('#workBody', v).querySelectorAll('[data-a]').forEach(x => x.disabled = true); setTimeout(() => { index++; renderPractice(); }, ok ? 450 : 1100); });
  };
  render();
};
NAV.push(['work', 'Đi làm']);
