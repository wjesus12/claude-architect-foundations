/* Flashcards con repetición espaciada (SM-2 simplificado), en EN / ES / EN+ES. */
(function () {
  const DAY = 864e5;
  const GRADES = [
    { g: 0, q: 1, en: 'Again', es: 'Otra vez', hint: '10 min' },
    { g: 1, q: 3, en: 'Hard', es: 'Difícil', hint: '' },
    { g: 2, q: 4, en: 'Good', es: 'Bien', hint: '' },
    { g: 3, q: 5, en: 'Easy', es: 'Fácil', hint: '' }
  ];
  let S = null; // sesión activa
  /* Un único manejador de teclado para toda la app; la vista activa registra sus acciones. */
  const KEYS = { flip: null, grade: null };
  document.addEventListener('keydown', e => {
    if (!S || !KEYS.flip || !document.getElementById('fcStage')) return;
    if (/input|textarea|select/i.test(document.activeElement?.tagName)) return;
    if (e.code === 'Space' || e.key === 'Enter') { e.preventDefault(); KEYS.flip(); }
    if (['1', '2', '3', '4'].includes(e.key)) KEYS.grade(Number(e.key) - 1);
  });

  /* SM-2: devuelve el nuevo estado de la tarjeta */
  function schedule(st, q, now = Date.now()) {
    st = Object.assign({ ef: 2.5, iv: 0, reps: 0, due: 0, lapses: 0 }, st);
    st.ef = Math.max(1.3, st.ef + 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
    if (q < 3) { st.reps = 0; st.iv = 0; st.lapses++; st.due = now + 10 * 60e3; return st; }
    if (st.reps === 0) st.iv = q === 5 ? 3 : 1;
    else if (st.reps === 1) st.iv = q === 3 ? 3 : 6;
    else st.iv = Math.round(st.iv * (q === 3 ? 1.2 : q === 5 ? st.ef * 1.3 : st.ef));
    st.reps++;
    st.due = now + st.iv * DAY;
    return st;
  }
  const preview = (st, q) => { const n = schedule(st, q); return q < 3 ? '10 min' : n.iv === 1 ? '1 d' : n.iv + ' d'; };

  function stats(domains) {
    const p = CAF.Store.P(), now = Date.now();
    const pool = CAF.FLASHCARDS.filter(c => !domains.length || domains.includes(c.domain));
    let due = 0, fresh = 0, learned = 0;
    pool.forEach(c => { const s = p.srs[c.id]; if (!s) fresh++; else { if (s.due <= now) due++; if (s.iv >= 6) learned++; } });
    return { pool, due, fresh, learned, total: pool.length };
  }

  function view(qs) {
    if (S) return session();
    const st = stats([]);
    const panel = CAF.Views.setupPanel({
      kind: 'flash', qs,
      kicker: '~/flashcards · SM-2',
      title: 'Repaso <em>espaciado</em>',
      lede: `${st.total} tarjetas · ${st.due} pendientes hoy · ${st.fresh} nuevas · ${st.learned} dominadas. Las que fallas vuelven en 10 minutos; las que dominas se espacian días.`,
      art: `<div class="cardstack" aria-hidden="true"><i></i><i></i><i><span class="mono">tool_choice: "any"</span></i></div>`,
      fields: CAF.Views.domainChips(qs.get('d') ? [Number(qs.get('d'))] : []) + `
        <div class="setup__group"><div class="setup__label mono">03 · qué repasar</div>
          <div class="seg">${[['due', 'Pendientes + nuevas'], ['new', 'Solo nuevas'], ['all', 'Todas (barajadas)']].map(([v, l], i) => `<label class="seg__o"><input type="radio" name="pick" value="${v}" ${i === 0 ? 'checked' : ''}><span>${l}</span></label>`).join('')}</div></div>
        <div class="setup__group"><div class="setup__label mono">04 · tamaño de la sesión</div>
          <div class="seg">${[10, 20, 40].map((n, i) => `<label class="seg__o"><input type="radio" name="count" value="${n}" ${i === 1 ? 'checked' : ''}><span>${n}</span></label>`).join('')}</div></div>`,
      startLabel: 'Empezar repaso',
      onStart: cfg => start(cfg)
    });
    return panel;
  }

  function start(cfg) {
    const p = CAF.Store.P(), now = Date.now();
    const pick = cfg.fd.get('pick'), count = Number(cfg.fd.get('count'));
    let pool = CAF.FLASHCARDS.filter(c => !cfg.domains.length || cfg.domains.includes(c.domain));
    if (!pool.length) return CAF.toast('Elige al menos un dominio.', 'err');
    let queue;
    if (pick === 'new') queue = CAF.shuffle(pool.filter(c => !p.srs[c.id]));
    else if (pick === 'all') queue = CAF.shuffle(pool);
    else {
      const due = pool.filter(c => p.srs[c.id] && p.srs[c.id].due <= now).sort((a, b) => p.srs[a.id].due - p.srs[b.id].due);
      queue = [...due, ...CAF.shuffle(pool.filter(c => !p.srs[c.id]))];
    }
    queue = queue.slice(0, count);
    if (!queue.length) {
      CAF.toast('No hay tarjetas pendientes con ese filtro. Prueba «Todas».', 'info', 4000);
      return;
    }
    S = { mode: cfg.mode, queue, done: 0, total: queue.length, again: 0, flipped: false, results: [] };
    CAF.App.refresh();
  }

  function cardHTML(c) {
    const m = S.mode, d = CAF.domain(c.domain);
    const st = CAF.Store.P().srs[c.id];
    return `
      <div class="fc ${S.flipped ? 'is-flipped' : ''}" id="fcCard" tabindex="0" role="button" aria-label="Voltear tarjeta">
        <div class="fc__face fc__face--front">
          <div class="fc__meta"><span><b>D${d.id}</b> · ${c.ts}</span><span>${st ? 'repaso #' + (st.reps + 1) : 'nueva'}</span></div>
          <div class="fc__txt">${CAF.LB(c.front, m)}</div>
          <div class="fc__hint">${m === 'en' ? 'click or Space to flip' : m === 'es' ? 'clic o Espacio para voltear' : 'click or Space to flip · clic o Espacio para voltear'}</div>
        </div>
        <div class="fc__face fc__face--back">
          <div class="fc__meta"><span><b>D${d.id}</b> · ${c.ts}</span><a href="#/leccion/${c.ts}" class="mono">lección ${c.ts} →</a></div>
          <div class="fc__txt">${CAF.LB(c.back, m)}</div>
          <div class="fc__hint">1 · 2 · 3 · 4</div>
        </div>
      </div>
      <div class="fc-grade" ${S.flipped ? '' : 'hidden'}>
        ${GRADES.map(g => `<button class="btn" data-g="${g.g}"><span>${m === 'en' ? g.en : m === 'es' ? g.es : g.en + ' · ' + g.es}</span><small>${g.g + 1} · ${preview(st, g.q)}</small></button>`).join('')}
      </div>`;
  }

  function session() {
    const c = S.queue[0];
    const pct = S.done / S.total;
    if (!c) return summary();
    return {
      html: `
      <section class="vhero vhero--compact">
        <div class="vhero__copy">
          <div class="vhero__kicker mono">~/flashcards · ${CAF.MODES[S.mode].short} · ${S.done}/${S.total}</div>
          <h1 class="vhero__title">Repaso <em>espaciado</em></h1>
          <div class="xpbar"><i style="--v:${pct.toFixed(3)}"></i></div>
        </div>
        <div class="vhero__art">${CAF.Art.mascot({ px: 9, mood: 'think', cls: 'fc-mascot' })}</div>
      </section>
      <div class="fc-wrap">
        <div class="fc-stage" id="fcStage">${cardHTML(c)}</div>
        <aside class="fc-side">
          <div class="fc-stat"><span class="mono muted small">quedan</span><span class="fc-stat__n">${S.queue.length}</span></div>
          <div class="fc-stat"><span class="mono muted small">otra vez</span><span class="fc-stat__n">${S.again}</span></div>
          <button class="btn" id="fcQuit">Terminar sesión</button>
        </aside>
      </div>`,
      mount(root) {
        const flip = () => {
          if (S.flipped) return;
          S.flipped = true;
          CAF.$('#fcCard', root).classList.add('is-flipped');
          CAF.$('.fc-grade', root).hidden = false;
        };
        const grade = g => {
          if (!S.flipped) return;
          const card = S.queue.shift();
          const G = GRADES[g];
          const p = CAF.Store.P();
          p.srs[card.id] = schedule(p.srs[card.id], G.q);
          S.results.push({ id: card.id, g });
          if (G.q < 3) { S.again++; S.queue.splice(Math.min(3, S.queue.length), 0, card); }
          else S.done++;
          CAF.G.award(CAF.G.XP.card, null);
          CAF.Art.react(CAF.$('.fc-mascot', root), G.q < 3 ? 'shake' : 'jump');
          S.flipped = false;
          setTimeout(() => CAF.App.refresh(), 260);
        };
        root.addEventListener('click', e => {
          if (e.target.closest('#fcCard') && !e.target.closest('a')) flip();
          const b = e.target.closest('[data-g]'); if (b) grade(Number(b.dataset.g));
          if (e.target.closest('#fcQuit')) { S.queue = []; CAF.App.refresh(); }
        });
        KEYS.flip = flip; KEYS.grade = grade;
      }
    };
  }

  function summary() {
    const r = S.results;
    const counts = [0, 0, 0, 0]; r.forEach(x => counts[x.g]++);
    S_last = S; S = null;
    const html = `
      <div class="fc-done">
        ${CAF.Art.mascot({ px: 12, mood: 'happy', cls: 'fc-mascot' })}
        <h1 class="vhero__title">Sesión <em>completada</em></h1>
        <p class="muted">${S_last.done} tarjeta${S_last.done === 1 ? '' : 's'} · ${S_last.again} repetici${S_last.again === 1 ? 'ón' : 'ones'} · +${r.length * CAF.G.XP.card} xp</p>
        <div class="ringrow">${GRADES.map(g => CAF.Art.ring({ value: r.length ? counts[g.g] / r.length : 0, size: 84, stroke: 7, label: String(counts[g.g]), sub: g.es })).join('')}</div>
        <div class="row"><a class="btn btn--primary" href="#/flashcards">Otra sesión</a><a class="btn" href="#/progreso">Ver progreso</a></div>
      </div>`;
    return { html, mount() { if (S_last.done >= 10) CAF.confetti(50); CAF.G.award(0, null); } };
  }
  let S_last = null;

  CAF.Flash = { view, schedule, stats };
})();
