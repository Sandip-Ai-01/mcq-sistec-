/* ==========================================================
   SISTec MST – Exam engine v2 (vanilla JS, LocalStorage)
   Part A: 50 MCQs (auto-graded)   Part B: 5 theory (submit per answer)
   - Timer derives from a stored absolute end time => refresh-safe
   - Camera is mandatory; video stays on-device (no upload)
   - PDF report = print-optimised result page (Save as PDF)
   - Answer keys are only read after final submission
   ========================================================== */
(function () {
  'use strict';

  const KEY = 'sistec_mst_state_v2';
  const DURATION_MS = 90 * 60 * 1000;
  const NQ = QUESTIONS.length;                       // 50 MCQs
  const ITEMS = QUESTIONS.concat(THEORY.map((t) => Object.assign({ type: 'theory', unit: 'Part B' }, t)));
  const TOTAL = ITEMS.length;                        // 55
  const LETTERS = ['A', 'B', 'C', 'D'];
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));
  const isTheory = (i) => i >= NQ;

  let S = null, timerId = null, stream = null;
  let warned15 = false, warned5 = false, submitting = false;
  let savedTO = null, toastTO = null, draftTO = null;

  /* ---------- helpers ---------- */
  const esc = (t) => String(t).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const pad = (n) => String(n).padStart(2, '0');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const words = (t) => (t.trim() ? t.trim().split(/\s+/).length : 0);

  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* storage blocked/full */ } }
  function load() { try { return JSON.parse(localStorage.getItem(KEY)); } catch (e) { return null; } }
  function shuffled(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }
  function show(id) {
    ['loginScreen', 'examScreen', 'resultScreen'].forEach((s) => { $('#' + s).hidden = (s !== id); });
    window.scrollTo(0, 0);
  }
  function toast(msg, crit) {
    const t = $('#toast');
    t.textContent = msg; t.className = 'toast' + (crit ? ' crit' : ''); t.hidden = false;
    clearTimeout(toastTO); toastTO = setTimeout(() => { t.hidden = true; }, crit ? 7000 : 5000);
  }
  function openModal(id) { const m = $('#' + id); m.hidden = false; const b = m.querySelector('.btn.danger') || m.querySelector('.btn'); if (b) b.focus(); }
  const closeModal = (id) => { $('#' + id).hidden = true; };
  const anyModalOpen = () => $$('.overlay').some((o) => !o.hidden);

  /* ---------- camera ---------- */
  async function startCamera() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) throw new Error('Camera is not supported in this browser or page (use HTTPS).');
    if (stream && stream.getVideoTracks().some((t) => t.readyState === 'live')) return;
    stream = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240, facingMode: 'user' }, audio: false });
    const v = $('#camVideo'); v.srcObject = stream; await v.play().catch(() => {});
    $('#camBox').hidden = false;
    stream.getVideoTracks()[0].addEventListener('ended', () => {
      if (S && !S.submitted) { $('#camErr').textContent = ''; openModal('camModal'); }
    });
  }
  function snapshot() {
    try {
      const v = $('#camVideo'), c = $('#snapCanvas');
      if (!stream || !v.videoWidth) return null;
      c.getContext('2d').drawImage(v, 0, 0, c.width, c.height);
      return c.toDataURL('image/jpeg', 0.6);
    } catch (e) { return null; }
  }
  function stopCamera() { if (stream) stream.getTracks().forEach((t) => t.stop()); stream = null; $('#camBox').hidden = true; }

  async function retryCamera() {
    try { await startCamera(); closeModal('camModal'); }
    catch (e) { $('#camErr').textContent = 'Could not access the camera. Allow permission in the browser address bar and try again.'; }
  }

  /* ---------- login / start ---------- */
  function setErr(field, errId, msg) { $('#' + errId).textContent = msg || ''; $('#' + field).classList.toggle('invalid', !!msg); }

  async function startExam(e) {
    e.preventDefault();
    const name = $('#stName').value.trim().replace(/\s+/g, ' ');
    const roll = $('#stRoll').value.trim().toUpperCase();
    const branch = $('#stBranch').value, sem = $('#stSem').value;
    let ok = true;
    const check = (c, f, er, m) => { setErr(f, er, c ? '' : m); if (!c) ok = false; };
    check(name.length >= 3 && /^[A-Za-z .'-]+$/.test(name), 'stName', 'errName', 'Enter your full name (letters only).');
    check(/^[A-Za-z0-9\/-]{5,25}$/.test(roll), 'stRoll', 'errRoll', 'Enter a valid enrollment / roll number.');
    check(!!branch, 'stBranch', 'errBranch', 'Select your branch.');
    check(!!sem, 'stSem', 'errSem', 'Select your semester.');
    $('#errAgree').textContent = $('#stAgree').checked ? '' : 'Please confirm that you have read the instructions.';
    if (!$('#stAgree').checked) ok = false;
    if (!ok) return;

    const btn = $('#loginForm button[type=submit]'); btn.disabled = true;
    $('#errCam').textContent = '';
    try { await startCamera(); }
    catch (err) {
      $('#errCam').textContent = 'Camera access is required to start. Allow camera permission and try again. (' + (err.name || err.message) + ')';
      btn.disabled = false; return;
    }
    await new Promise((r) => setTimeout(r, 700));        // let the first frame arrive

    S = {
      student: { name, roll, branch, sem },
      endAt: Date.now() + DURATION_MS,
      answers: {}, visited: {}, marked: {}, theory: {}, drafts: {},
      cur: 0,
      perms: QUESTIONS.map(() => shuffled([0, 1, 2, 3])),   // perms[q][displayPos] = original index
      photos: { start: snapshot(), end: null },
      submitted: false, result: null
    };
    save(); btn.disabled = false;
    enterExam();
  }

  /* ---------- exam ---------- */
  function enterExam() {
    $('#tbStudent').innerHTML = `<b>${esc(S.student.name)}</b><br>Roll No: ${esc(S.student.roll)}`;
    buildPalette(); show('examScreen'); renderQuestion(); updateTimer();
    clearInterval(timerId); timerId = setInterval(updateTimer, 1000);
  }

  function updateTimer() {
    if (!S || S.submitted) return;
    const rem = S.endAt - Date.now();
    if (rem <= 0) { $('#timer').textContent = '00:00:00'; finalize(true); return; }
    const sec = Math.ceil(rem / 1000);
    $('#timer').textContent = `${pad(Math.floor(sec / 3600))}:${pad(Math.floor(sec % 3600 / 60))}:${pad(sec % 60)}`;
    const box = $('#timerBox');
    box.classList.toggle('warn', rem <= 15 * 60000 && rem > 5 * 60000);
    box.classList.toggle('crit', rem <= 5 * 60000);
    if (rem <= 5 * 60000 && !warned5) { warned5 = warned15 = true; toast('Only 5 minutes remaining! Submit your theory answers and finish.', true); }
    else if (rem <= 15 * 60000 && !warned15) { warned15 = true; toast('Warning: 15 minutes remaining.'); }
  }

  /* palette */
  function buildPalette() {
    $('#paletteGrid').innerHTML = ITEMS.map((_, i) =>
      `<button class="pn nv${isTheory(i) ? ' th' : ''}" data-i="${i}">${isTheory(i) ? 'T' + (i - NQ + 1) : i + 1}</button>`).join('');
  }
  function isAnswered(i) {
    const id = ITEMS[i].id;
    return isTheory(i) ? !!(S.theory[id] && S.theory[id].text) : S.answers[id] !== undefined;
  }
  function statusOf(i) {
    const id = ITEMS[i].id, a = isAnswered(i), m = !!S.marked[id], v = !!S.visited[id];
    if (a && m) return 'am'; if (m) return 'mk'; if (a) return 'an'; return v ? 'na' : 'nv';
  }
  function counts() { const c = { nv: 0, na: 0, an: 0, mk: 0, am: 0 }; ITEMS.forEach((_, i) => c[statusOf(i)]++); return c; }
  function refreshPalette() {
    $$('#paletteGrid .pn').forEach((b) => {
      const i = +b.dataset.i;
      b.className = 'pn ' + statusOf(i) + (isTheory(i) ? ' th' : '') + (i === S.cur ? ' cur' : '');
      b.setAttribute('aria-label', (isTheory(i) ? 'Theory question ' + (i - NQ + 1) : 'Question ' + (i + 1)) + ', ' + statusOf(i));
    });
    const c = counts();
    $('#cNV').textContent = c.nv; $('#cNA').textContent = c.na; $('#cAN').textContent = c.an;
    $('#cMK').textContent = c.mk; $('#cAM').textContent = c.am;
  }

  /* question rendering */
  function renderQuestion(dir) {
    const i = S.cur, item = ITEMS[i], th = isTheory(i);
    S.visited[item.id] = true;
    $('#options').hidden = th; $('#theoryBox').hidden = !th; $('#qMarks').hidden = !th;
    $('#qUnit').textContent = th ? 'Part B · ' + item.topic : 'Part A · ' + item.unit;
    $('#clearBtn').textContent = th ? 'Clear Answer' : 'Clear Response';

    if (th) {
      const n = i - NQ + 1;
      $('#qNum').textContent = `Theory question ${n} of ${THEORY.length}`;
      $('#qText').textContent = `T${n}. ${item.question}`;
      const t = $('#thText'); t.value = S.drafts[item.id] !== undefined ? S.drafts[item.id] : (S.theory[item.id] ? S.theory[item.id].text : '');
      syncTheory();
    } else {
      const perm = S.perms[i];
      $('#qNum').textContent = `Question ${i + 1} of ${NQ}`;
      $('#qText').textContent = `Q${i + 1}. ${item.question}`;
      $('#options').innerHTML = perm.map((orig, d) => `
        <button class="opt${S.answers[item.id] === orig ? ' sel' : ''}" role="radio" aria-checked="${S.answers[item.id] === orig}" data-orig="${orig}" aria-label="Option ${LETTERS[d]}">
          <span class="let">${LETTERS[d]}</span><span class="txt">${esc(item.options[orig])}</span>
          <span class="tick"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></span>
        </button>`).join('');
    }
    const card = $('#qCard');
    card.classList.remove('go-next', 'go-prev'); void card.offsetWidth;
    if (dir && !reduceMotion) card.classList.add(dir > 0 ? 'go-next' : 'go-prev');
    syncMark();
    $('#prevBtn').disabled = i === 0; $('#nextBtn').disabled = i === TOTAL - 1;
    refreshPalette(); save();
  }

  function syncMark() {
    const on = !!S.marked[ITEMS[S.cur].id];
    $('#markBtn').classList.toggle('on', on); $('#markBtn').setAttribute('aria-pressed', on);
    $('#markTxt').textContent = on ? 'Unmark Review' : 'Mark for Review';
    $('#ribbon').classList.toggle('on', on);
  }

  function go(i, dir) {
    if (i < 0 || i >= TOTAL || !S || S.submitted) return;
    const d = dir !== undefined ? dir : (i > S.cur ? 1 : -1);
    S.cur = i; renderQuestion(d);
    $('#palette').classList.remove('open'); $('#paletteToggle').setAttribute('aria-expanded', 'false');
  }

  function flashSaved(msg) {
    const m = $('#savedMsg'); m.textContent = msg; m.classList.add('show');
    clearTimeout(savedTO); savedTO = setTimeout(() => m.classList.remove('show'), 1600);
  }

  /* MCQ */
  function selectOption(orig) {
    if (isTheory(S.cur)) return;
    S.answers[ITEMS[S.cur].id] = orig;                 // single answer per question
    $$('#options .opt').forEach((b) => { const on = +b.dataset.orig === orig; b.classList.toggle('sel', on); b.setAttribute('aria-checked', on); });
    save(); refreshPalette(); flashSaved('✓ Answer saved');
  }
  function selectByPos(d) { if (isTheory(S.cur)) return; const orig = S.perms[S.cur][d]; if (orig !== undefined) selectOption(orig); }

  /* Theory */
  function syncTheory() {
    const id = ITEMS[S.cur].id, cur = $('#thText').value, sub = S.theory[id];
    $('#thCount').textContent = words(cur) + ' words';
    const btn = $('#thSubmit'), st = $('#thStatus');
    if (sub && sub.text === cur) {
      btn.textContent = 'Submitted ✓'; btn.disabled = true;
      st.textContent = '✓ Submitted at ' + new Date(sub.at).toLocaleTimeString();
    } else {
      btn.textContent = sub ? 'Update Answer' : 'Submit Answer'; btn.disabled = false;
      st.textContent = sub ? 'Unsaved changes – click Update Answer' : '';
    }
  }
  function onTheoryInput() {
    S.drafts[ITEMS[S.cur].id] = $('#thText').value;     // never lose a draft
    syncTheory(); clearTimeout(draftTO); draftTO = setTimeout(save, 400);
  }
  function submitTheory() {
    const id = ITEMS[S.cur].id, text = $('#thText').value.trim();
    if (!text) { toast('Write your answer before submitting.'); return; }
    S.theory[id] = { text, at: Date.now() }; S.drafts[id] = text;
    save(); syncTheory(); refreshPalette(); flashSaved('✓ Theory answer submitted');
  }

  function toggleMark() { const id = ITEMS[S.cur].id; if (S.marked[id]) delete S.marked[id]; else S.marked[id] = true; syncMark(); refreshPalette(); save(); }

  function clearResponse() {
    const id = ITEMS[S.cur].id;
    if (isTheory(S.cur)) { delete S.theory[id]; delete S.drafts[id]; $('#thText').value = ''; syncTheory(); }
    else { delete S.answers[id]; $$('#options .opt').forEach((b) => { b.classList.remove('sel'); b.setAttribute('aria-checked', 'false'); }); }
    refreshPalette(); save();
  }

  /* ---------- submit ---------- */
  function askSubmit() {
    let ans = 0, th = 0, mk = 0;
    ITEMS.forEach((it, i) => { if (S.marked[it.id]) mk++; if (isAnswered(i)) { if (isTheory(i)) th++; else ans++; } });
    // include a theory draft that has not been submitted yet in the warning
    $('#mAns').textContent = ans; $('#mUn').textContent = NQ - ans; $('#mTh').textContent = th + '/' + THEORY.length; $('#mMk').textContent = mk;
    openModal('submitModal');
  }

  function finalize(auto) {
    if (submitting || !S || S.submitted) return;
    submitting = true; clearInterval(timerId);
    S.photos.end = snapshot();
    S.submitted = true; S.result = computeResult(); save();
    stopCamera();
    ['submitModal', 'restartModal', 'camModal'].forEach(closeModal);
    $('#toast').hidden = true;
    renderResult();
    toast(auto ? 'Time is up – submitted automatically. You can download your PDF report.' : 'Examination submitted. You can download your PDF report.');
  }

  function computeResult() {
    let correct = 0, wrong = 0, none = 0;
    QUESTIONS.forEach((qd) => { const a = S.answers[qd.id]; if (a === undefined) none++; else if (a === qd.answer) correct++; else wrong++; });
    const th = THEORY.filter((t) => S.theory[t.id] && S.theory[t.id].text).length;
    return { correct, wrong, none, attempted: correct + wrong, marks: correct, pct: +(correct / NQ * 100).toFixed(2), theorySubmitted: th };
  }
  function gradeOf(p) { if (p >= 90) return 'A+'; if (p >= 80) return 'A'; if (p >= 70) return 'B+'; if (p >= 60) return 'B'; if (p >= 50) return 'C'; if (p >= 40) return 'D'; return 'F'; }

  /* ---------- result ---------- */
  function renderResult() {
    const r = S.result, st = S.student;
    show('resultScreen');
    $('#rName').textContent = st.name;
    $('#rMeta').textContent = `Roll No: ${st.roll} · ${st.branch} · Semester ${st.sem}`;
    $('#rPartB').textContent = `Part B (theory, 50 marks): ${r.theorySubmitted} of ${THEORY.length} answers submitted · marks awarded after faculty evaluation`;
    $('#rGrade').textContent = gradeOf(r.pct);
    $('#rPct').textContent = r.pct + '% (Part A)';
    const pill = $('#rStatus'), pass = r.pct >= 40;
    pill.textContent = pass ? 'Part A: Pass' : 'Part A: Needs improvement'; pill.className = 'status-pill ' + (pass ? 'pass' : 'fail');

    $('#stats').innerHTML = [
      ['MCQs', NQ, ''], ['Attempted', r.attempted, ''], ['Correct', r.correct, 'ok'], ['Incorrect', r.wrong, 'bad'],
      ['Unanswered', r.none, 'none'], ['Part A marks', `${r.marks} / ${NQ}`, ''], ['Theory submitted', `${r.theorySubmitted} / ${THEORY.length}`, '']
    ].map(([l, v, c]) => `<div class="stat ${c}"><b>${v}</b><span>${l}</span></div>`).join('');

    const ph = S.photos || {};
    $('#snaps').innerHTML = [['Start of exam', ph.start], ['End of exam', ph.end]].filter((p) => p[1])
      .map(([l, src]) => `<figure><img src="${src}" alt="Camera snapshot: ${l}">${l}</figure>`).join('');

    const num = $('#scoreNum'), fg = $('#ringFg'), C = 339.292, target = C * (1 - r.marks / NQ);
    fg.style.strokeDashoffset = C;
    if (reduceMotion) { num.textContent = r.marks; fg.style.strokeDashoffset = target; }
    else {
      num.textContent = 0; requestAnimationFrame(() => { fg.style.strokeDashoffset = target; });
      const t0 = performance.now();
      (function step(t) { const p = Math.min((t - t0) / 1600, 1); num.textContent = Math.round(r.marks * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step); })(t0);
    }
    renderReview(); setFilter('all');
  }

  function renderReview() {
    const mcq = QUESTIONS.map((qd, i) => {
      const a = S.answers[qd.id], perm = S.perms[i];
      const state = a === undefined ? 'none' : (a === qd.answer ? 'correct' : 'wrong');
      const label = { none: 'Unanswered', correct: 'Correct', wrong: 'Incorrect' }[state];
      const opts = perm.map((orig, d) => {
        const right = orig === qd.answer, mine = orig === a;
        const tag = right && mine ? 'Your answer · Correct' : right ? 'Correct answer' : mine ? 'Your answer' : '';
        return `<div class="ro ${right ? 'right' : (mine ? 'mine-bad' : '')}"><b>${LETTERS[d]}.</b><span>${esc(qd.options[orig])}</span>${tag ? `<em>${tag}</em>` : ''}</div>`;
      }).join('');
      return `<article class="rv ${state}" data-s="${state}"><div class="rv-top"><span>Q${i + 1} · ${esc(qd.topic)}</span><span class="badge ${state}">${label}</span></div>
        <p class="q">${esc(qd.question)}</p>${opts}<p class="expl"><b>Explanation:</b> ${esc(qd.explanation)}</p></article>`;
    }).join('');
    const theory = THEORY.map((t, i) => {
      const sub = S.theory[t.id];
      return `<article class="rv" data-s="theory"><div class="rv-top"><span>T${i + 1} · ${esc(t.topic)} · ${t.marks} marks</span>
        <span class="badge ${sub ? 'correct' : 'none'}">${sub ? 'Submitted' : 'Not submitted'}</span></div>
        <p class="q">${esc(t.question)}</p><p><b>Your answer:</b></p><div class="ans">${sub ? esc(sub.text) : 'No answer submitted.'}</div>
        <p class="expl"><b>Key points expected:</b> ${esc(t.keyPoints)}</p></article>`;
    }).join('');
    $('#review').innerHTML = `<h3 class="part">Part A – MCQs</h3>${mcq}<h3 class="part">Part B – Theory (faculty evaluation pending)</h3>${theory}`;
  }

  function setFilter(f) {
    $$('#filters .f').forEach((b) => b.classList.toggle('active', b.dataset.f === f));
    $$('#review .rv').forEach((el) => { el.hidden = !(f === 'all' || el.dataset.s === f); });
  }

  /* PDF: print-optimised report -> "Save as PDF" */
  function downloadPDF() {
    setFilter('all');
    const old = document.title; document.title = `SISTec_MST_${S.student.roll}_Report`;
    const restore = () => { document.title = old; window.removeEventListener('afterprint', restore); };
    window.addEventListener('afterprint', restore);
    window.print();
  }

  function restart() {
    try { localStorage.removeItem(KEY); } catch (e) { /* ignore */ }
    S = null; submitting = false; warned15 = warned5 = false; stopCamera();
    $('#loginForm').reset(); $$('.err').forEach((e) => { e.textContent = ''; }); $$('.invalid').forEach((e) => e.classList.remove('invalid'));
    $('#timerBox').className = 'timer'; closeModal('restartModal'); show('loginScreen');
  }

  /* ---------- events ---------- */
  $('#loginForm').addEventListener('submit', startExam);
  $('#options').addEventListener('click', (e) => { const b = e.target.closest('.opt'); if (b && S && !S.submitted) selectOption(+b.dataset.orig); });
  $('#paletteGrid').addEventListener('click', (e) => { const b = e.target.closest('.pn'); if (b) go(+b.dataset.i); });
  $('#prevBtn').addEventListener('click', () => go(S.cur - 1, -1));
  $('#nextBtn').addEventListener('click', () => go(S.cur + 1, 1));
  $('#markBtn').addEventListener('click', toggleMark);
  $('#clearBtn').addEventListener('click', clearResponse);
  $('#thText').addEventListener('input', onTheoryInput);
  $('#thSubmit').addEventListener('click', submitTheory);
  $('#submitBtn').addEventListener('click', askSubmit);
  $('#contBtn').addEventListener('click', () => closeModal('submitModal'));
  $('#confirmSubmit').addEventListener('click', () => finalize(false));
  $('#restartBtn').addEventListener('click', () => openModal('restartModal'));
  $('#restartNo').addEventListener('click', () => closeModal('restartModal'));
  $('#restartYes').addEventListener('click', restart);
  $('#pdfBtn').addEventListener('click', downloadPDF);
  $('#pdfBtn2').addEventListener('click', downloadPDF);
  $('#camRetry').addEventListener('click', retryCamera);
  $('#filters').addEventListener('click', (e) => { const b = e.target.closest('.f'); if (b) setFilter(b.dataset.f); });
  $('#paletteToggle').addEventListener('click', () => { const o = $('#palette').classList.toggle('open'); $('#paletteToggle').setAttribute('aria-expanded', o); });

  // Keyboard navigation (off while typing or when a modal is open)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { closeModal('submitModal'); closeModal('restartModal'); return; }
    if (!S || S.submitted || $('#examScreen').hidden || anyModalOpen()) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (/^(TEXTAREA|INPUT|SELECT)$/.test((e.target.tagName || ''))) return;
    const k = e.key.toLowerCase();
    if (k === 'arrowright') { e.preventDefault(); go(S.cur + 1, 1); }
    else if (k === 'arrowleft') { e.preventDefault(); go(S.cur - 1, -1); }
    else if (k.length === 1 && 'abcd'.includes(k)) selectByPos('abcd'.indexOf(k));
    else if (k.length === 1 && '1234'.includes(k)) selectByPos(+k - 1);
    else if (k === 'm') toggleMark();
  });

  window.addEventListener('beforeunload', (e) => { if (S && !S.submitted && !$('#examScreen').hidden) { e.preventDefault(); e.returnValue = ''; } });
  document.addEventListener('visibilitychange', () => { if (!document.hidden) updateTimer(); });

  /* ---------- boot: resume saved session ---------- */
  const saved = load();
  const valid = saved && saved.student && Array.isArray(saved.perms) && saved.perms.length === NQ && saved.theory;
  if (valid) {
    S = saved;
    if (S.submitted && S.result) renderResult();
    else {
      enterExam();
      if (S && !S.submitted) {                                   // camera must be re-enabled after a refresh
        startCamera().catch(() => { $('#camErr').textContent = ''; openModal('camModal'); });
        toast('Examination resumed. Your timer kept running.');
      }
    }
  } else {
    try { localStorage.removeItem(KEY); } catch (e) { /* ignore */ }
    show('loginScreen');
  }
})();
