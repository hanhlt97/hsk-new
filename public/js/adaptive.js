const LessonEngine = {
  plan(words, progress, randomize = shuffle) {
    const selected = randomize(words).sort((a, b) => {
      const x = progress[a.id], y = progress[b.id];
      return Number(Boolean(y && y.bad)) - Number(Boolean(x && x.bad)) || (x?.box || 0) - (y?.box || 0);
    }).slice(0, 6);
    return selected.flatMap(w => [
      { w, skill: 'meaning', retry: false },
      { w, skill: 'type', retry: false }
    ]).sort((a, b) => Number(a.skill === 'type') - Number(b.skill === 'type'));
  },
  options(words, w, field) {
    const others = [...new Set(words.filter(x => x.id !== w.id).map(x => x[field]))].filter(x => x !== w[field]);
    return shuffle([w[field], ...shuffle(others).slice(0, 3)]);
  },
  matches(skill, value, w) {
    return skill === 'type' ? normPinyin(value) !== '' && normPinyin(value) === normPinyin(w.p) : value === w.m;
  },
  retry(queue, index) {
    const q = queue[index];
    if (!q.retry) queue.splice(Math.min(queue.length, index + 3), 0, { ...q, retry: true });
  }
};

Pages.lesson = v => {
  let level = Store.s.level, queue = [], index = 0, locked = false, finished = false, started = 0;
  let correct = 0, baseCorrect = 0, results = [], composing = false;
  const audioAvailable = 'speechSynthesis' in window;
  const titles = { meaning: 'Nhận diện nghĩa', type: 'Tự nhớ pinyin', listen: 'Nghe và chọn nghĩa' };
  const play = w => {
    if (!audioAvailable) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(w.h); u.lang = 'zh-CN'; u.rate = .8;
    speechSynthesis.speak(u);
  };
  const start = (words = wordsOf(level)) => {
    queue = LessonEngine.plan(words, Store.d.prog); index = correct = baseCorrect = 0;
    locked = finished = false; results = []; started = Date.now(); render();
  };
  const complete = () => {
    if (!finished) {
      Store.session('adaptive', baseCorrect, queue.filter(q => !q.retry).length, Math.round((Date.now() - started) / 1000), level);
      finished = true;
    }
    const missed = [...new Map(results.filter(r => !r.ok).map(r => [r.w.id, r.w])).values()];
    v.innerHTML = `<div class="card"><div class="eyebrow">BÁO CÁO PHIÊN HỌC · HSK ${level}</div><h1>Nhìn rõ điều cần luyện tiếp</h1><div class="stats"><div class="stat"><b>${baseCorrect}/${queue.filter(q => !q.retry).length}</b><span>Đúng lần đầu</span></div><div class="stat"><b>${correct}/${results.length}</b><span>Đúng cả lượt ôn</span></div><div class="stat"><b>${Math.round((Date.now() - started) / 1000)}s</b><span>Thời gian phiên</span></div></div><h2>Phân tích kỹ năng</h2>${Object.entries(titles).map(([s, title]) => { const rs = results.filter(r => r.skill === s); return `<p>${title}: ${rs.filter(r => r.ok).length}/${rs.length} lượt đúng</p>`; }).join('')}<h2>Nhật ký lỗi</h2>${results.filter(r => !r.ok).map(r => `<div class="card"><b class="zh">${esc(r.w.h)}</b> · ${titles[r.skill]}<p>Bạn trả lời: ${esc(r.value || '(bỏ qua)')}</p><p>Đáp án: ${esc(r.skill === 'type' ? r.w.p : r.w.m)}</p></div>`).join('') || '<p>Không có lỗi trong phiên này.</p>'}<div class="actions"><button class="btn primary" id="redo">Học phiên mới</button>${missed.length ? '<button class="btn" id="repair">Chỉ luyện từ sai</button>' : ''}<a class="btn" href="#/stats">Xem tiến độ</a></div></div>`;
    $('#redo', v).onclick = () => start();
    if (missed.length) $('#repair', v).onclick = () => start(missed);
  };
  const render = () => {
    if (index >= queue.length) { complete(); return; }
    const q = queue[index], w = q.w; locked = false; composing = false;
    const body = q.skill === 'type'
      ? '<form id="answerForm"><label for="lessonAnswer">Pinyin (không bắt buộc dấu thanh)</label><input class="lesson-input" id="lessonAnswer" autocomplete="off" autocapitalize="off" spellcheck="false" required><button class="btn primary">Kiểm tra</button></form>'
      : LessonEngine.options(wordsOf(level), w, 'm').map((o, i) => `<button class="opt" data-answer="${esc(o)}"><kbd>${i + 1}</kbd>${esc(o)}</button>`).join('');
    v.innerHTML = `<h1>Bài học thích ứng</h1><p class="sub">Không dùng mô hình AI. Chọn từ theo lỗi và mức nhớ; từ sai quay lại sau tối đa hai câu xen kẽ.</p><div class="opts"><label for="lessonLevel">Cấp học</label><select id="lessonLevel">${Array.from({length:9}, (_, i) => `<option value="${i + 1}" ${i + 1 === level ? 'selected' : ''}>HSK ${i + 1}</option>`).join('')}</select><button class="btn" id="restartLesson">Khởi động lại</button></div><div class="card center"><div class="eyebrow">${index + 1}/${queue.length} · ${titles[q.skill]}${q.retry ? ' · ÔN LẠI' : ''}</div><div class="bar"><div style="width:${index / queue.length * 100}%"></div></div><div class="lesson-prompt zh">${q.skill === 'listen' ? '听' : esc(w.h)}</div>${q.skill === 'listen' ? '<button class="btn" id="replay">Phát âm</button><p class="tip">Cần giọng Trung của thiết bị. Không nghe được? Bấm “Đổi sang đọc”.</p><button class="btn" id="readInstead">Đổi sang đọc</button>' : ''}<div class="lesson-options">${body}</div><button class="btn" id="skipLesson">Không biết / bỏ qua</button><div class="lesson-feedback" id="lessonFeedback" role="status" aria-live="polite"></div></div><p class="tip">Từ vựng mẫu, chưa đối chiếu danh sách HSK chính thức. Có thể rời trang bất cứ lúc nào; chỉ phiên hoàn tất mới được ghi vào lịch sử.</p>`;
    $('#lessonLevel', v).onchange = e => { level = +e.target.value; Store.set('level', level); start(); };
    $('#restartLesson', v).onclick = () => start();
    v.querySelectorAll('[data-answer]').forEach(b => b.onclick = () => answer(b.dataset.answer));
    $('#skipLesson', v).onclick = () => answer('');
    const form = $('#answerForm', v);
    if (form) {
      const inp = $('#lessonAnswer', v);
      inp.oncompositionstart = () => composing = true; inp.oncompositionend = () => composing = false;
      form.onsubmit = e => { e.preventDefault(); if (!composing) answer(inp.value); };
      inp.focus();
    }
    if (q.skill === 'listen') {
      $('#replay', v).onclick = () => play(w);
      $('#readInstead', v).onclick = () => { q.skill = 'meaning'; render(); };
      play(w);
    }
  };
  const answer = value => {
    if (locked || finished) return;
    locked = true;
    const q = queue[index], ok = LessonEngine.matches(q.skill, value, q.w);
    Store.record(q.w.id, ok); if (ok) { correct++; if (!q.retry) baseCorrect++; }
    results.push({ w: q.w, skill: q.skill, value, ok });
    if (!ok) LessonEngine.retry(queue, index);
    v.querySelectorAll('.lesson-options button, .lesson-options input, #skipLesson, #readInstead').forEach(el => el.disabled = true);
    $('#lessonFeedback', v).innerHTML = `<h2 class="${ok ? 'right-text' : 'wrong-text'}">${ok ? 'Chính xác' : 'Cùng sửa lỗi này'}</h2><p><b class="zh">${esc(q.w.h)}</b> · ${esc(q.w.p)} · ${esc(q.w.m)}</p>${!ok ? `<p>${q.skill === 'type' ? 'Đọc từng âm tiết rồi gõ lại. Không cần dấu thanh; ü có thể gõ bằng v.' : 'Đối chiếu chữ Hán và nghĩa, sau đó tự nhắc lại khi đáp án bị ẩn.'} ${!q.retry ? 'Từ này sẽ xuất hiện lại trong phiên.' : 'Đã lưu lỗi để ôn ở phiên sau.'}</p>` : ''}<button class="btn primary" id="nextLesson">Tiếp tục</button>`;
    $('#nextLesson', v).onclick = () => { index++; render(); };
    $('#nextLesson', v).focus();
  };
  const key = e => {
    if (['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target.tagName) || locked) return;
    if (/^[1-4]$/.test(e.key)) { const b = v.querySelectorAll('[data-answer]')[+e.key - 1]; if (b) b.click(); }
  };
  document.addEventListener('keydown', key);
  const originalPlan = LessonEngine.plan;
  start();
  return () => { document.removeEventListener('keydown', key); if (audioAvailable) speechSynthesis.cancel(); };
};
NAV.splice(1, 0, ['lesson', 'Bài học']);
