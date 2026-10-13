/* Simulacro (formato CCAR-F) y práctica.
   Banco: CAF.addBank([{ id, s, d, ts, lv, pat, official?, n?, q:{en,es}, o:[{t:{en,es}, ok, w:{en,es}}] }]) */
(function () {
  const BANK = [];
  CAF.BANK = BANK;
  CAF.addBank = arr => arr.forEach(q => BANK.push(q));

  const LEVEL = { basic: 'Base', mid: 'Intermedia', hard: 'Difícil' };
  const FORM_SEED = { A: 1103, B: 2207, C: 3301 };
  const PER_SCENARIO = 15;
  let RUN = null;      // simulacro en curso
  let PRAC = null;     // práctica en curso
  let LAST = null;     // último resultado (para la pantalla de revisión)
  let TICK = null;

  const U = (mode, en, es) => mode === 'en' ? en : mode === 'es' ? es : `${en} · ${es}`;
  const nCorrect = q => q.o.filter(o => o.ok).length;
  const scaled = pct => Math.round(100 + 900 * pct);
  const fmtTime = s => { s = Math.max(0, Math.round(s)); const m = Math.floor(s / 60); return `${String(m).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`; };
  const scen = id => CAF.SCENARIOS.find(s => s.id === id);
  /* «Question 3 of 60» completo por idioma; en híbrido, una frase por idioma (no palabra a palabra) */
  const posTxt = (mode, i, n) => mode === 'en' ? `Question ${i} of ${n}` : mode === 'es' ? `Pregunta ${i} de ${n}` : `Question ${i} of ${n} · Pregunta ${i} de ${n}`;

  /* ---------- ensamblado ---------- */
  function assembleExam(form) {
    const rnd = form === 'R' ? Math.random : CAF.seeded(FORM_SEED[form]);
    const scenarios = CAF.shuffle(CAF.SCENARIOS.map(s => s.id), rnd).slice(0, CAF.EXAM.scenariosPerExam).sort((a, b) => a - b);
    /* Objetivo por dominio según el blueprint (60 × peso). En cada escenario se elige,
       pregunta a pregunta, el dominio con mayor déficit entre los disponibles en ese escenario. */
    const total = scenarios.length * PER_SCENARIO;
    const target = Object.fromEntries(CAF.DOMAINS.map(d => [d.id, total * d.weight / 100]));
    const got = Object.fromEntries(CAF.DOMAINS.map(d => [d.id, 0]));
    const items = [];
    scenarios.forEach(sid => {
      const byD = {};
      CAF.shuffle(BANK.filter(q => q.s === sid), rnd).forEach(q => (byD[q.d] = byD[q.d] || []).push(q));
      for (let k = 0; k < PER_SCENARIO; k++) {
        const avail = Object.keys(byD).filter(d => byD[d].length);
        if (!avail.length) break;
        avail.sort((a, b) => (target[b] - got[b]) - (target[a] - got[a]) || rnd() - 0.5);
        const d = avail[0];
        items.push(item(byD[d].shift(), rnd));
        got[d]++;
      }
    });
    return { scenarios, items };
  }
  const item = (q, rnd = Math.random) => ({ id: q.id, order: CAF.shuffle(q.o.map((_, i) => i), rnd) });

  /* ---------- render de una pregunta ---------- */
  function questionHTML(q, it, mode, opts = {}) {
    const sel = opts.sel || [];
    const multi = nCorrect(q) > 1;
    const sc = scen(q.s);
    const how = multi ? CAF.UI('chooseN', mode, { n: nCorrect(q) }) : CAF.UI('chooseOne', mode);
    return `
      <div class="xq ${opts.reveal ? 'is-reveal' : ''}">
        <details class="xq__scen" ${opts.openScen ? 'open' : ''}>
          <summary class="mono">${CAF.Scenes.icon(sc.icon, 16)}<span>${CAF.UI('scenario', mode)} ${sc.id} · ${CAF.L({ en: sc.en, es: sc.es }, mode)}</span></summary>
          ${CAF.LB(sc.desc, mode)}
        </details>
        ${q.official ? `<div class="xq__official mono">◆ ${U(mode, 'Official sample · Exam Guide v1.0', 'Muestra oficial · Exam Guide v1.0')}</div>` : ''}
        <div class="xq__stem">${CAF.LB(q.q, mode)}</div>
        <div class="xq__how mono">${how}</div>
        <div class="xq__opts" role="${multi ? 'group' : 'radiogroup'}">
          ${it.order.map((oi, k) => {
            const o = q.o[oi], on = sel.includes(oi);
            let cls = on ? 'is-on' : '';
            if (opts.reveal) cls += o.ok ? ' is-ok' : on ? ' is-bad' : ' is-dim';
            return `<button class="xo ${cls}" data-o="${oi}" role="${multi ? 'checkbox' : 'radio'}" aria-checked="${on}" ${opts.reveal ? 'disabled' : ''}>
              <span class="xo__k mono">${multi ? (on ? '☑' : '☐') : 'ABCDE'[k]}</span><span class="xo__t">${CAF.L(o.t, mode)}</span></button>`;
          }).join('')}
        </div>
        ${opts.reveal ? `<div class="xq__why">${it.order.map((oi, k) => { const o = q.o[oi]; return `<div class="qz__w ${o.ok ? 'qz__w--ok' : ''} ${sel.includes(oi) ? 'qz__w--me' : ''}"><span class="mono">${'ABCDE'[k]} ${o.ok ? '✓' : '✗'}</span>${CAF.LB(o.w, mode, 'span')}</div>`; }).join('')}
          <div class="xq__meta mono">D${q.d} · ${q.ts} · ${LEVEL[q.lv]}${q.pat && CAF.PATTERNS[q.pat] ? ` · ${U(mode, 'pattern', 'patrón')}: ${CAF.esc(CAF.T(CAF.PATTERNS[q.pat], mode))}` : ''} · <a href="#/leccion/${q.ts}">${U(mode, 'lesson', 'lección')} ${q.ts}</a></div></div>` : ''}
      </div>`;
  }
  const isRight = (q, sel) => { const c = q.o.map((o, i) => o.ok ? i : -1).filter(i => i >= 0); return sel.length === c.length && c.every(i => sel.includes(i)); };
  function toggle(q, sel, oi) {
    const multi = nCorrect(q) > 1;
    if (!multi) return [oi];
    if (sel.includes(oi)) return sel.filter(x => x !== oi);
    const next = [...sel, oi];
    return next.length > nCorrect(q) ? next.slice(1) : next;
  }

  /* =============== SIMULACRO =============== */
  function setup(qs) {
    if (RUN) return runView();
    const p = CAF.Store.P();
    const draft = p.examDraft;
    const panel = CAF.Views.setupPanel({
      kind: 'exam', qs,
      kicker: `~/simulacro · ${BANK.length} preguntas en el banco`,
      title: 'Simulacro <em>cronometrado</em>',
      lede: '60 preguntas · 4 escenarios al azar de 6 · 120 minutos · escala 100–1000 · aprobado con 720. En modo EN hasta los botones van en inglés, como en Pearson VUE.',
      art: `<div class="clock" aria-hidden="true"><div class="clock__face"><i class="clock__h"></i><i class="clock__m"></i></div><span class="mono">120:00</span></div>`,
      fields: `${draft ? `<div class="setup__group"><div class="lx-note"><div class="lx-note__k mono">✻ simulacro sin terminar</div><p>Tienes un simulacro a medias (${Object.keys(draft.answers).length}/${draft.items.length} respondidas). <button type="button" class="btn btn--s btn--primary" id="xResume">Reanudar</button> <button type="button" class="btn btn--s" id="xDiscard">Descartar</button></p></div></div>` : ''}
        <div class="setup__group"><div class="setup__label mono">02 · forma</div>
          <div class="seg">${[['A', 'Forma A'], ['B', 'Forma B'], ['C', 'Forma C'], ['R', 'Aleatoria']].map(([v, l], i) => `<label class="seg__o"><input type="radio" name="form" value="${v}" ${i === 3 ? 'checked' : ''}><span>${l}</span></label>`).join('')}</div>
          <p class="setup__help">Las formas A, B y C son fijas (mismos escenarios y preguntas): sirven para medir tu progreso y la brecha de idioma repitiendo la misma forma en EN y en ES.</p></div>
        <div class="setup__group"><div class="setup__label mono">03 · reglas</div>
          <label class="check"><input type="checkbox" name="timer" checked> Cronómetro real (120 min, envío automático al llegar a 0)</label></div>
        ${history(p)}`,
      startLabel: 'Empezar simulacro',
      onStart: cfg => {
        const { scenarios, items } = assembleExam(cfg.fd.get('form'));
        RUN = { form: cfg.fd.get('form'), mode: cfg.mode, scenarios, items, answers: {}, flags: [], i: 0, started: Date.now(), timer: !!cfg.fd.get('timer'), limit: CAF.EXAM.minutes * 60 };
        saveDraft();
        CAF.App.refresh();
      }
    });
    const mount0 = panel.mount;
    panel.mount = root => {
      mount0(root);
      CAF.$('#xResume', root)?.addEventListener('click', () => { RUN = CAF.Store.P().examDraft; CAF.App.refresh(); });
      CAF.$('#xDiscard', root)?.addEventListener('click', () => { delete CAF.Store.P().examDraft; CAF.Store.commit(); CAF.App.refresh(); });
      root.addEventListener('click', e => { const b = e.target.closest('[data-exam]'); if (b) { LAST = CAF.Store.P().exams[Number(b.dataset.exam)]; RUN = null; showResult(LAST, true); } });
    };
    return panel;
  }
  function history(p) {
    if (!p.exams.length) return '';
    return `<div class="setup__group"><div class="setup__label mono">historial</div>
      <div class="xhist">${p.exams.slice().reverse().slice(0, 8).map((e, k) => { const i = p.exams.length - 1 - k; return `<button type="button" class="xhist__i ${e.scaled >= 720 ? 'is-pass' : ''}" data-exam="${i}">
        <span class="mono xhist__s">${e.scaled}</span><span class="mono small">${CAF.MODES[e.mode].short} · forma ${e.form}</span><span class="mono small muted">${new Date(e.at).toLocaleDateString('es-PE')}</span></button>`; }).join('')}</div></div>`;
  }
  function saveDraft() { if (!RUN) return; CAF.Store.P().examDraft = RUN; CAF.Store.commit(); }
  const remaining = () => RUN.limit - (Date.now() - RUN.started) / 1000;

  function runView() {
    const m = RUN.mode, it = RUN.items[RUN.i], q = BANK.find(x => x.id === it.id);
    const answered = Object.keys(RUN.answers).length;
    return {
      html: `
      <div class="xbar">
        <span class="xbar__brand mono">${CAF.Art.spark({ size: 18, rays: 10 })} CCAR-F · ${U(m, 'Form', 'Forma')} ${RUN.form}</span>
        <span class="xbar__pos mono">${posTxt(m, RUN.i + 1, RUN.items.length)}</span>
        <span class="xbar__time mono ${RUN.timer ? '' : 'is-off'}" id="xTime" title="${CAF.UI('time', m)}">${RUN.timer ? '⏱ ' + fmtTime(remaining()) : U(m, 'untimed', 'sin cronómetro')}</span>
      </div>
      <div class="xprog"><i style="--v:${(answered / RUN.items.length).toFixed(3)}"></i></div>
      <div class="xlayout">
        <section class="xmain">${questionHTML(q, it, m, { sel: RUN.answers[it.id] || [], openScen: RUN.i === 0 || RUN.items[RUN.i - 1] && BANK.find(x => x.id === RUN.items[RUN.i - 1].id).s !== q.s })}
          <div class="xnav">
            <button class="btn" id="xPrev" ${RUN.i === 0 ? 'disabled' : ''}>← ${CAF.UI('prev', m)}</button>
            <button class="btn ${RUN.flags.includes(it.id) ? 'is-flag' : ''}" id="xFlag">⚑ ${CAF.UI('flag', m)}</button>
            ${RUN.i < RUN.items.length - 1 ? `<button class="btn btn--primary" id="xNext">${CAF.UI('next', m)} →</button>` : `<button class="btn btn--primary" id="xEnd">${CAF.UI('finish', m)}</button>`}
          </div>
        </section>
        <aside class="xside">
          <div class="xgrid" aria-label="Mapa de preguntas">${RUN.items.map((x, k) => `<button class="xg ${RUN.answers[x.id]?.length ? 'is-ans' : ''} ${RUN.flags.includes(x.id) ? 'is-flag' : ''} ${k === RUN.i ? 'is-cur' : ''}" data-go="${k}">${k + 1}</button>`).join('')}</div>
          <div class="xlegend mono small"><span><i class="xg is-ans"></i> ${U(m, 'answered', 'respondida')}</span><span><i class="xg is-flag"></i> ${U(m, 'flagged', 'marcada')}</span></div>
          <div class="mono small muted">${answered}/${RUN.items.length} · ${CAF.MODES[m].short}</div>
          <button class="btn btn--s" id="xEnd2">${CAF.UI('finish', m)}</button>
        </aside>
      </div>`,
      mount(root) {
        root.addEventListener('click', e => {
          const o = e.target.closest('.xo');
          if (o) { RUN.answers[it.id] = toggle(q, RUN.answers[it.id] || [], Number(o.dataset.o)); saveDraft(); paintSel(root, q, RUN.answers[it.id]); paintGrid(root); return; }
          const g = e.target.closest('[data-go]'); if (g) return go(Number(g.dataset.go));
          if (e.target.closest('#xPrev')) return go(RUN.i - 1);
          if (e.target.closest('#xNext')) return go(RUN.i + 1);
          if (e.target.closest('#xFlag')) { const f = RUN.flags.indexOf(it.id); f >= 0 ? RUN.flags.splice(f, 1) : RUN.flags.push(it.id); saveDraft(); e.target.closest('#xFlag').classList.toggle('is-flag'); paintGrid(root); return; }
          if (e.target.closest('#xEnd') || e.target.closest('#xEnd2')) return confirmEnd();
        });
        startTick(root);
      }
    };
  }
  function paintSel(root, q, sel) {
    const multi = nCorrect(q) > 1;
    CAF.$$('.xo', root).forEach(b => { const on = sel.includes(Number(b.dataset.o)); b.classList.toggle('is-on', on); b.setAttribute('aria-checked', on); if (multi) b.querySelector('.xo__k').textContent = on ? '☑' : '☐'; });
  }
  function paintGrid(root) {
    CAF.$$('.xg[data-go]', root).forEach((b, k) => { const id = RUN.items[k].id; b.classList.toggle('is-ans', !!RUN.answers[id]?.length); b.classList.toggle('is-flag', RUN.flags.includes(id)); });
    const bar = CAF.$('.xprog i', root); if (bar) bar.style.setProperty('--v', (Object.keys(RUN.answers).filter(k => RUN.answers[k].length).length / RUN.items.length).toFixed(3));
  }
  function go(i) { if (i < 0 || i >= RUN.items.length) return; RUN.i = i; saveDraft(); CAF.App.refresh(); }
  function startTick(root) {
    clearInterval(TICK);
    if (!RUN.timer) return;
    TICK = setInterval(() => {
      const el = document.getElementById('xTime');
      if (!RUN || !el) return clearInterval(TICK);
      const r = remaining();
      el.textContent = '⏱ ' + fmtTime(r);
      el.classList.toggle('is-low', r < 600);
      if (r <= 0) { clearInterval(TICK); CAF.toast(U(RUN.mode, 'Time is up. Submitting.', 'Se acabó el tiempo. Enviando.'), 'info'); finishExam(); }
    }, 1000);
  }
  function confirmEnd() {
    const m = RUN.mode;
    const un = RUN.items.filter(x => !RUN.answers[x.id]?.length).length;
    CAF.modal({ title: CAF.UI('finish', m),
      body: `<p>${un ? U(m, `You have <b>${un}</b> unanswered question(s) and ${RUN.flags.length} flagged.`, `Tienes <b>${un}</b> pregunta(s) sin responder y ${RUN.flags.length} marcada(s).`) : U(m, 'All questions answered.', 'Todas las preguntas respondidas.')}</p><p class="muted">${U(m, 'You cannot change answers after submitting.', 'No podrás cambiar las respuestas después de enviar.')}</p>`,
      actions: [{ label: U(m, 'Back to exam', 'Volver al examen') }, { label: CAF.UI('finish', m), primary: true, onClick: () => finishExam() }] });
  }

  function finishExam() {
    clearInterval(TICK);
    const R = RUN; RUN = null;
    const p = CAF.Store.P();
    delete p.examDraft;
    const per = {}, perS = {};
    let ok = 0;
    const detail = R.items.map(it => {
      const q = BANK.find(x => x.id === it.id), sel = R.answers[it.id] || [], right = isRight(q, sel);
      if (right) ok++;
      (per[q.d] = per[q.d] || { n: 0, ok: 0 }).n++; if (right) per[q.d].ok++;
      (perS[q.s] = perS[q.s] || { n: 0, ok: 0 }).n++; if (right) perS[q.s].ok++;
      CAF.G.recordAnswer({ qid: q.id, domain: q.d, ok: right, mode: R.mode, silentXP: true });
      return { id: q.id, sel, ok: right, order: it.order, flag: R.flags.includes(it.id) };
    });
    const pct = ok / R.items.length;
    const res = { at: Date.now(), form: R.form, mode: R.mode, scenarios: R.scenarios, total: R.items.length, ok, pct, scaled: scaled(pct), per, perS, secs: Math.round((Date.now() - R.started) / 1000), detail };
    p.exams.push(res);
    CAF.Store.commit();
    CAF.G.award(CAF.G.XP.examTake + (res.scaled >= CAF.EXAM.pass ? CAF.G.XP.examPass : 0), `simulacro ${res.scaled}/1000`);
    LAST = res;
    showResult(res);
  }

  function showResult(res, fromHistory) {
    location.hash = '#/simulacro/resultado';
    if (!fromHistory && res.scaled >= CAF.EXAM.pass) setTimeout(() => CAF.confetti(120), 300);
  }

  function resultView(qs) {
    const res = LAST || CAF.Store.P().exams.slice(-1)[0];
    if (!res) { location.hash = '#/simulacro'; return { html: '' }; }
    const m = res.mode, pass = res.scaled >= CAF.EXAM.pass;
    const filter = qs.get('f') || 'wrong';
    const rows = res.detail.filter(d => filter === 'all' || (filter === 'wrong' ? !d.ok : d.flag));
    return {
      html: `
      <section class="vhero xres ${pass ? 'is-pass' : 'is-fail'}">
        <div class="vhero__copy">
          <div class="vhero__kicker mono">~/simulacro/resultado · ${U(m, 'Form', 'Forma')} ${res.form} · ${CAF.MODES[m].label} · ${fmtTime(res.secs)}</div>
          <h1 class="vhero__title">${pass ? CAF.UI('pass', m) : CAF.UI('fail', m)} <em>${res.scaled}</em><small class="mono"> / 1000</small></h1>
          <p class="vhero__lede">${res.ok}/${res.total} ${U(m, 'correct', 'correctas')} (${Math.round(res.pct * 100)} %). ${U(m, 'Cut score', 'Corte')}: ${CAF.EXAM.pass}. ${pass ? U(m, 'Repeat the same form in English to confirm the language is no longer a barrier.', 'Repite la misma forma en inglés para confirmar que el idioma ya no es una barrera.') : U(m, 'Review the wrong items below, then the lessons of your weakest domain.', 'Revisa abajo las falladas y luego las lecciones de tu dominio más débil.')}</p>
          <div class="vhero__actions"><a class="btn btn--primary" href="#/simulacro">${U(m, 'New exam', 'Nuevo simulacro')}</a><a class="btn" href="#/practica">${U(m, 'Targeted practice', 'Práctica dirigida')}</a></div>
        </div>
        <div class="vhero__art">${CAF.Views.gauge(res.scaled)}${CAF.Art.mascot({ px: 7, mood: pass ? 'happy' : 'sad', cls: 'xres__m' })}</div>
      </section>
      <section class="split">
        <div class="block block--panel"><div class="block__head"><h2 class="block__title">${U(m, 'By domain', 'Por dominio')}</h2><span class="mono muted">${U(m, 'as on the real score report', 'como en el informe real')}</span></div>
          ${CAF.DOMAINS.filter(d => res.per[d.id]).map(d => { const s = res.per[d.id], v = s.ok / s.n; return `<div class="dombar"><span class="mono">D${d.id}</span><span class="dombar__n">${CAF.esc(CAF.T(d.name, m === 'bi' ? 'en' : m))}</span><span class="dombar__b"><i class="${v >= .72 ? 'is-ok' : v >= .55 ? 'is-mid' : 'is-low'}" style="--v:${v.toFixed(2)}"></i></span><span class="mono">${Math.round(v * 100)}%</span></div>`; }).join('')}
        </div>
        <div class="block block--panel"><div class="block__head"><h2 class="block__title">${U(m, 'By scenario', 'Por escenario')}</h2></div>
          ${res.scenarios.map(sid => { const s = res.perS[sid] || { n: 0, ok: 0 }, sc = scen(sid), v = s.n ? s.ok / s.n : 0; return `<div class="dombar"><span class="mono">S${sid}</span><span class="dombar__n">${CAF.esc(m === 'es' ? sc.es : sc.en)}</span><span class="dombar__b"><i class="${v >= .72 ? 'is-ok' : v >= .55 ? 'is-mid' : 'is-low'}" style="--v:${v.toFixed(2)}"></i></span><span class="mono">${s.ok}/${s.n}</span></div>`; }).join('')}
        </div>
      </section>
      <section class="block">
        <div class="block__head"><h2 class="block__title">${U(m, 'Review', 'Revisión')}</h2>
          <div class="seg">${[['wrong', U(m, 'Wrong', 'Falladas')], ['flag', U(m, 'Flagged', 'Marcadas')], ['all', U(m, 'All', 'Todas')]].map(([v, l]) => `<a class="chip-t ${filter === v ? 'is-on' : ''}" href="#/simulacro/resultado?f=${v}">${l}</a>`).join('')}</div>
        </div>
        <div class="xreview">${rows.length ? rows.map(d => { const q = BANK.find(x => x.id === d.id); return q ? `<article class="xrev ${d.ok ? 'is-ok' : 'is-bad'}"><div class="xrev__k mono">${d.ok ? '✓' : '✗'} ${q.id}${d.flag ? ' · ⚑' : ''}</div>${questionHTML(q, { id: q.id, order: d.order }, m, { sel: d.sel, reveal: true })}</article>` : ''; }).join('') : `<p class="muted">${U(m, 'Nothing here.', 'Nada por aquí.')}</p>`}</div>
      </section>`
    };
  }

  /* =============== PRÁCTICA =============== */
  function practiceSetup(qs) {
    if (PRAC) return practiceRun();
    const sel = qs.get('d') ? [Number(qs.get('d'))] : [];
    const p = CAF.Store.P();
    const wrongIds = Object.entries(p.answers).filter(([k, a]) => !k.includes('-') && a.last === false).map(([k]) => k);
    return CAF.Views.setupPanel({
      kind: 'practice', qs,
      kicker: `~/practica · ${BANK.length} preguntas · ${wrongIds.length} por repasar`,
      title: 'Práctica <em>a tu medida</em>',
      lede: 'Elige idioma, dominios, escenario y dificultad. Cada respuesta se corrige al instante con la explicación de todas las opciones.',
      art: CAF.Art.mascot({ px: 12, mood: 'happy' }),
      fields: CAF.Views.domainChips(sel) + `
        <div class="setup__group"><div class="setup__label mono">03 · escenario</div>
          <select name="scenario" class="select"><option value="">Todos los escenarios</option>${CAF.SCENARIOS.map(s => `<option value="${s.id}">S${s.id} · ${CAF.esc(s.es)} (${BANK.filter(q => q.s === s.id).length})</option>`).join('')}</select></div>
        ${CAF.Views.levelSelect('04')}
        <div class="setup__group"><div class="setup__label mono">05 · fuente</div>
          <div class="seg">${[['all', 'Todo el banco'], ['new', 'No respondidas'], ['wrong', `Falladas (${wrongIds.length})`], ['official', 'Muestras oficiales']].map(([v, l], i) => `<label class="seg__o"><input type="radio" name="src" value="${v}" ${i === 0 ? 'checked' : ''}><span>${l}</span></label>`).join('')}</div></div>
        <div class="setup__group"><div class="setup__label mono">06 · cantidad</div>
          <div class="seg">${[10, 20, 30].map((n, i) => `<label class="seg__o"><input type="radio" name="count" value="${n}" ${i === 0 ? 'checked' : ''}><span>${n}</span></label>`).join('')}</div></div>`,
      startLabel: 'Empezar práctica',
      onStart: cfg => {
        const fd = cfg.fd, sc = Number(fd.get('scenario')) || 0, lv = fd.get('level'), src = fd.get('src');
        let pool = BANK.filter(q => (!cfg.domains.length || cfg.domains.includes(q.d)) && (!sc || q.s === sc) && (lv === 'all' || q.lv === lv));
        const ans = CAF.Store.P().answers;
        if (src === 'new') pool = pool.filter(q => !ans[q.id]);
        if (src === 'wrong') pool = pool.filter(q => ans[q.id] && ans[q.id].last === false);
        if (src === 'official') pool = pool.filter(q => q.official);
        if (!pool.length) return CAF.toast('No hay preguntas con esos filtros.', 'err');
        const items = CAF.shuffle(pool).slice(0, Number(fd.get('count'))).map(q => item(q));
        PRAC = { mode: cfg.mode, items, i: 0, answers: {}, done: {}, ok: 0 };
        CAF.App.refresh();
      }
    });
  }

  function practiceRun() {
    const P = PRAC, m = P.mode;
    if (P.i >= P.items.length) return practiceSummary();
    const it = P.items[P.i], q = BANK.find(x => x.id === it.id), done = P.done[it.id];
    return {
      html: `
      <div class="xbar">
        <span class="xbar__brand mono">${CAF.Art.spark({ size: 18, rays: 10 })} ${U(m, 'Practice', 'Práctica')} · ${CAF.MODES[m].short}</span>
        <span class="xbar__pos mono">${posTxt(m, P.i + 1, P.items.length)}</span>
        <span class="xbar__time mono">✓ ${P.ok}</span>
      </div>
      <div class="xprog"><i style="--v:${(P.i / P.items.length).toFixed(3)}"></i></div>
      <div class="xlayout xlayout--single">
        <section class="xmain">${questionHTML(q, it, m, { sel: P.answers[it.id] || [], reveal: !!done, openScen: P.i === 0 || BANK.find(x => x.id === P.items[P.i - 1].id).s !== q.s })}
          <div class="xnav">
            <button class="btn" id="pQuit">${U(m, 'End practice', 'Terminar práctica')}</button>
            ${done ? `<button class="btn btn--primary" id="pNext">${P.i < P.items.length - 1 ? CAF.UI('next', m) + ' →' : U(m, 'See summary', 'Ver resumen')}</button>` : `<button class="btn btn--primary" id="pCheck" ${(P.answers[it.id] || []).length === nCorrect(q) ? '' : 'disabled'}>${U(m, 'Check answer', 'Comprobar')}</button>`}
          </div>
        </section>
        <aside class="xside xside--m">${CAF.Art.mascot({ px: 8, mood: done ? (done.ok ? 'happy' : 'sad') : 'think', cls: 'p-mascot' })}</aside>
      </div>`,
      mount(root) {
        root.addEventListener('click', e => {
          const o = e.target.closest('.xo');
          if (o && !done) { P.answers[it.id] = toggle(q, P.answers[it.id] || [], Number(o.dataset.o)); paintSel(root, q, P.answers[it.id]); CAF.$('#pCheck', root).disabled = P.answers[it.id].length !== nCorrect(q); return; }
          if (e.target.closest('#pCheck')) {
            const ok = isRight(q, P.answers[it.id]);
            P.done[it.id] = { ok }; if (ok) P.ok++;
            CAF.G.recordAnswer({ qid: q.id, domain: q.d, ok, mode: m });
            CAF.App.refresh(); return;
          }
          if (e.target.closest('#pNext')) { P.i++; CAF.App.refresh(); return; }
          if (e.target.closest('#pQuit')) { P.i = P.items.length; CAF.App.refresh(); }
        });
      }
    };
  }
  function practiceSummary() {
    const P = PRAC; PRAC = null;
    const n = Object.keys(P.done).length, m = P.mode;
    const byD = {}; Object.entries(P.done).forEach(([id, r]) => { const q = BANK.find(x => x.id === id); (byD[q.d] = byD[q.d] || { n: 0, ok: 0 }).n++; if (r.ok) byD[q.d].ok++; });
    return {
      html: `<div class="fc-done">
        ${CAF.Art.mascot({ px: 12, mood: n && P.ok / n >= .72 ? 'happy' : 'think' })}
        <h1 class="vhero__title">${U(m, 'Practice', 'Práctica')} <em>${P.ok}/${n}</em></h1>
        <p class="muted">${n ? Math.round(100 * P.ok / n) : 0} % · ${CAF.MODES[m].label}</p>
        <div class="ringrow">${Object.entries(byD).map(([d, s]) => CAF.Art.ring({ value: s.ok / s.n, size: 84, stroke: 7, label: 'D' + d, sub: `${s.ok}/${s.n}` })).join('')}</div>
        <div class="row"><a class="btn btn--primary" href="#/practica">${U(m, 'Practice again', 'Otra práctica')}</a><a class="btn" href="#/simulacro">${U(m, 'Mock exam', 'Simulacro')}</a></div>
      </div>`,
      mount() { if (n >= 10 && P.ok / n >= .8) CAF.confetti(50); }
    };
  }

  CAF.Exam = { setup, resultView, assembleExam, isRight, scaled };
  CAF.Practice = { setup: practiceSetup };
})();
