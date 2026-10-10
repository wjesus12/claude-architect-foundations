/* Vistas. Cada una devuelve HTML y, si hace falta, un `mount(root)` para conectar eventos. */
(function () {
  const esc = s => CAF.esc(s);
  const P = () => CAF.Store.P();
  const me = () => CAF.Store.me();

  /* ---------- piezas comunes ---------- */
  function vhero({ kicker, title, lede, actions = '', art = '', cls = '' }) {
    return `<section class="vhero ${cls}">
      <div class="vhero__copy">
        <div class="vhero__kicker mono">${kicker}</div>
        <h1 class="vhero__title">${title}</h1>
        ${lede ? `<p class="vhero__lede">${lede}</p>` : ''}
        ${actions ? `<div class="vhero__actions">${actions}</div>` : ''}
      </div>
      <div class="vhero__art">${art}</div>
    </section>`;
  }

  const floatChips = list => `<div class="chips-float" aria-hidden="true">${list.map((t, i) => `<span class="fchip mono" style="--i:${i}">${t}</span>`).join('')}</div>`;

  function gauge(score) {
    const v = score == null ? 0 : (score - 100) / 900;
    const cx = 120, cy = 118, r = 96;
    const pt = a => [cx + r * Math.cos(Math.PI * (1 - a)), cy - r * Math.sin(Math.PI * (1 - a))];
    const [ex, ey] = pt(1), [sx, sy] = pt(0);
    const passA = (720 - 100) / 900;
    const [px1, py1] = [cx + (r - 14) * Math.cos(Math.PI * (1 - passA)), cy - (r - 14) * Math.sin(Math.PI * (1 - passA))];
    const [px2, py2] = [cx + (r + 10) * Math.cos(Math.PI * (1 - passA)), cy - (r + 10) * Math.sin(Math.PI * (1 - passA))];
    const len = Math.PI * r;
    const ang = -90 + 180 * v;
    return `<svg class="gauge" viewBox="0 0 240 140" role="img" aria-label="Puntuación estimada ${score ?? 'sin datos'} de 1000">
      <path d="M${sx},${sy} A${r},${r} 0 0 1 ${ex},${ey}" class="gauge__track"/>
      <path d="M${sx},${sy} A${r},${r} 0 0 1 ${ex},${ey}" class="gauge__bar ${score >= 720 ? 'is-pass' : ''}" stroke-dasharray="${len.toFixed(1)}" stroke-dashoffset="${len.toFixed(1)}" style="--to:${(len * (1 - v)).toFixed(1)}"/>
      <line x1="${px1.toFixed(1)}" y1="${py1.toFixed(1)}" x2="${px2.toFixed(1)}" y2="${py2.toFixed(1)}" class="gauge__cut"/>
      <text x="${(px2 + 4).toFixed(1)}" y="${(py2 - 4).toFixed(1)}" class="gauge__cutt">720</text>
      <g class="gauge__needle" style="--a:${ang.toFixed(1)}deg"><line x1="${cx}" y1="${cy}" x2="${cx}" y2="${cy - r + 22}"/><circle cx="${cx}" cy="${cy}" r="5"/></g>
      <text x="${cx}" y="${cy - 26}" class="gauge__val">${score ?? '—'}</text>
      <text x="16" y="136" class="gauge__end">100</text><text x="224" y="136" class="gauge__end gauge__end--r">1000</text>
    </svg>`;
  }

  function domainCard(d) {
    const s = P().domainStats[d.id];
    const done = d.ts.filter(t => P().lessons[t.id]?.done).length;
    const acc = s.n ? s.ok / s.n : 0;
    return `<a class="dcard" href="#/dominio/${d.id}" style="--i:${d.id}">
      <div class="dcard__scene">${CAF.Scenes.forDomain(d.id)}</div>
      <div class="dcard__body">
        <div class="dcard__top mono"><span class="dcard__id">D${d.id}</span><span class="dcard__w">${d.weight}% del examen</span></div>
        <h3 class="dcard__name">${CAF.L(d.name)}</h3>
        <div class="dcard__meta mono">
          <span>${done}/${d.ts.length} lecciones</span>
          <span>${s.n ? Math.round(acc * 100) + '% acierto' : 'sin respuestas'}</span>
        </div>
        <div class="dcard__bar"><i style="--v:${(done / d.ts.length).toFixed(2)}"></i></div>
      </div>
    </a>`;
  }

  function langGap() {
    const L = P().langStats;
    const row = m => {
      const s = L[m], v = s.n ? s.ok / s.n : 0;
      return `<div class="gap__row"><span class="gap__k mono">${CAF.MODES[m].short}</span><span class="gap__bar"><i class="gap__fill gap__fill--${m}" style="--v:${v.toFixed(2)}"></i></span><span class="gap__v mono">${s.n ? Math.round(v * 100) + '%' : '—'}</span></div>`;
    };
    const en = L.en, es = L.es;
    let note = 'Responde en los tres modos para medir cuánto te cuesta el idioma.';
    if (en.n >= 5 && es.n >= 5) {
      const g = Math.round(100 * es.ok / es.n - 100 * en.ok / en.n);
      note = g > 5 ? `El inglés te cuesta <b>${g} puntos</b>. Usa el modo puente y luego vuelve a EN.` : g < -5 ? 'Te va mejor en inglés que en español: ¡a por el examen!' : 'Brecha de idioma cerrada (≤5 pts). El inglés ya no te resta.';
    }
    return `<div class="gap">${row('en')}${row('bi')}${row('es')}<p class="gap__note">${note}</p></div>`;
  }

  function eventLog(limit = 7) {
    const ev = P().events.slice(0, limit);
    if (!ev.length) return '<p class="muted mono">Aún no hay commits. Empieza una lección o un simulacro.</p>';
    return `<ol class="gitlog mono">${ev.map(e => `<li class="gitlog__i gitlog__i--${e.kind}"><span class="gitlog__h">${(e.t % 0xfffffff).toString(16).slice(0, 7)}</span><span class="gitlog__m">${esc(e.text)}</span><span class="gitlog__t">${CAF.ago(e.t)}</span></li>`).join('')}</ol>`;
  }

  /* ---------- INICIO ---------- */
  function home() {
    const u = me(), p = P(), lv = CAF.G.level(p.xp), score = CAF.G.readiness(p);
    const next = CAF.allTS().find(t => !p.lessons[t.id]?.done);
    const lastExam = p.exams[p.exams.length - 1];
    const acIds = CAF.academyIds(), acDone = CAF.G.acad(p), acNext = acIds.find(id => !p.lessons[id]?.done);
    const acta = acIds.length ? `
      <a class="acta" href="${acNext ? '#/leccion/' + acNext : '#/academia'}">
        ${CAF.Art.mascot({ px: 6, mood: acDone ? 'happy' : 'idle' })}
        <div>
          <div class="acta__k mono">~/academia · ${acIds.length} módulos · ${acDone ? `${acDone}/${acIds.length} hechos` : 'empieza aquí'}</div>
          <div class="acta__t">${acDone >= acIds.length ? 'Ruta desde cero completada ✓' : 'Aprende Claude desde cero'}</div>
          <div class="acta__s">Modelos y niveles de pensamiento, Claude chat, Cowork y Claude Code, prompting, API, MCP, skills, conectores, plugins, artifacts, harness y agentes: la teoría antes de los ejercicios.</div>
          <div class="acta__bar"><i style="width:${acIds.length ? (100 * acDone / acIds.length).toFixed(1) : 0}%"></i></div>
        </div>
        <span class="btn btn--primary">${acNext ? (acDone ? 'Continuar · M' + acNext.slice(1) : 'Empezar · M01') : 'Ver mapa'} ▸</span>
      </a>` : '';
    return {
      html: `
      <section class="hero">
        <div class="hero__copy">
          <div class="hero__cmd mono"><span class="tl__accent">❯</span> <span id="heroType"></span><span class="caret"></span></div>
          <h1 class="hero__title">Tu examen,<br><em>en el idioma del examen.</em></h1>
          <p class="hero__lede">${esc(u.name)}, vas en el nivel <b>${lv.name}</b>. Practica cada escenario en inglés, en español o en las dos lenguas, con la misma dificultad, y mide cuánto te cuesta el idioma.</p>
          <div class="hero__actions">
            <a class="btn btn--primary btn--lg" href="#/simulacro">Simulacro de examen ▸</a>
            <a class="btn btn--lg" href="#/leccion/${next ? next.id : '0'}">${next ? 'Continuar · lección ' + next.id : 'Repasar lecciones'}</a>
          </div>
          <div class="hero__modes">
            <span class="mono muted">modo de idioma por defecto</span>
            ${CAF.langPicker(CAF.lang(), 'homeLang')}
          </div>
        </div>
        <div class="hero__stage" aria-hidden="true">
          ${CAF.Art.spark({ size: 300, rays: 13, cls: 'hero__spark', seed: 5 })}
          ${floatChips(['stop_reason: "tool_use"', 'CLAUDE.md', 'isError: true', 'tool_choice: "any"', '/compact', 'PostToolUse', '.mcp.json', 'context: fork'])}
          <div class="hero__walk">${CAF.Art.mascot({ px: 11, walk: true, cls: 'hero__mascot' })}</div>
          <div class="hero__ground"></div>
        </div>
      </section>
      ${acta}
      <section class="kpis">
        <div class="kpi kpi--gauge">
          <div class="kpi__label mono">puntuación estimada</div>
          ${gauge(score)}
          <div class="kpi__foot mono">${score == null ? 'Responde al menos 3 preguntas por dominio' : score >= 720 ? 'Por encima del corte · sigue así' : `Te faltan ${720 - score} pts para el corte`}</div>
        </div>
        <div class="kpi">
          <div class="kpi__label mono">nivel</div>
          <div class="kpi__big">${lv.name}</div>
          <div class="kpi__sub">${lv.es}</div>
          <div class="xpbar"><i style="--v:${lv.pct.toFixed(3)}"></i></div>
          <div class="kpi__foot mono"><span data-count="${p.xp}">0</span> xp${lv.next ? ` · ${lv.next.xp - p.xp} para ${lv.next.name}` : ' · nivel máximo'}</div>
        </div>
        <div class="kpi kpi--streak">
          <div class="kpi__label mono">racha</div>
          <div class="flame" aria-hidden="true"><i></i><i></i><i></i></div>
          <div class="kpi__big"><span data-count="${p.streak.count}">0</span> <small>día${p.streak.count === 1 ? '' : 's'}</small></div>
          <div class="kpi__foot mono">mejor racha: ${p.streak.best}</div>
        </div>
        <div class="kpi kpi--gap">
          <div class="kpi__label mono">brecha de idioma</div>
          ${langGap()}
        </div>
      </section>

      <section class="block">
        <div class="block__head"><h2 class="block__title">Los cinco dominios</h2><span class="mono muted">el peso es la proporción de preguntas en el examen</span></div>
        <div class="dgrid">${CAF.DOMAINS.map(domainCard).join('')}</div>
      </section>

      <section class="split">
        <div class="block block--panel">
          <div class="block__head"><h2 class="block__title">Escenarios del examen</h2><a class="mono" href="#/escenarios">ver los 6 →</a></div>
          <p class="muted">El día del examen te tocan <b>4 de estos 6</b> al azar. Cada uno arrastra preguntas de varios dominios.</p>
          <div class="scn-mini">${CAF.SCENARIOS.map(s => `<a class="scn-chip" href="#/escenarios" style="--i:${s.id}">${CAF.Scenes.icon(s.icon, 18)}<span>${CAF.L({ en: s.en, es: s.es })}</span></a>`).join('')}</div>
        </div>
        <div class="block block--panel">
          <div class="block__head"><h2 class="block__title mono">git log</h2><span class="mono muted">${lastExam ? 'último simulacro: ' + lastExam.scaled : 'tu bitácora'}</span></div>
          ${eventLog()}
        </div>
      </section>`,
      mount(root) {
        CAF.type(CAF.$('#heroType', root), `claude --resume ${u.name.toLowerCase().replace(/\s+/g, '-')}`, 34);
        CAF.$$('[data-count]', root).forEach(el => CAF.countUp(el, Number(el.dataset.count)));
        CAF.bindLangPicker(root, m => { CAF.Store.setPref('lang', m); CAF.App.renderChrome(); CAF.App.refresh(); CAF.toast('Modo por defecto: ' + CAF.MODES[m].es, 'ok'); });
        walker(CAF.$('.hero__walk', root));
      }
    };
  }

  /* La mascota pasea de un lado a otro y se gira; al hacer clic salta */
  function walker(el) {
    if (!el) return;
    const svg = el.querySelector('.mascot');
    let x = 10, dir = 1, paused = 0;
    const stage = el.parentElement;
    const tick = () => {
      if (!document.body.contains(el)) return;
      if (CAF.Store.current()?.prefs.motion !== false) {
        const max = Math.max(20, stage.clientWidth - el.clientWidth - 10);
        if (paused > 0) { paused--; svg.classList.remove('is-walking'); }
        else {
          svg.classList.add('is-walking');
          x += dir * 0.9;
          if (x > max || x < 10) { dir *= -1; paused = 70; CAF.Art.setMood(svg, Math.random() > .5 ? 'happy' : 'think'); setTimeout(() => CAF.Art.setMood(svg, 'idle'), 1400); }
          if (Math.random() < .002) paused = 120;
        }
        el.style.transform = `translateX(${x}px) scaleX(${dir})`;
      }
      requestAnimationFrame(tick);
    };
    el.addEventListener('click', () => CAF.Art.react(svg, 'jump'));
    el.style.pointerEvents = 'auto';
    requestAnimationFrame(tick);
  }

  /* ---------- DOMINIOS ---------- */
  function domains() {
    return {
      html: vhero({
        kicker: '~/dominios · blueprint oficial',
        title: 'Cinco dominios, <em>treinta objetivos</em>',
        lede: 'Cada pregunta del examen se escribe contra uno de estos 30 task statements. Cada uno es una lección aquí.',
        art: `<div class="weights">${CAF.DOMAINS.map(d => `<div class="weights__col" style="--h:${d.weight * 3}px;--i:${d.id}"><span class="weights__v mono">${d.weight}%</span><i></i><span class="weights__k mono">D${d.id}</span></div>`).join('')}</div>`
      }) + `<div class="dgrid dgrid--wide">${CAF.DOMAINS.map(domainCard).join('')}</div>`
    };
  }

  function domain(id) {
    const d = CAF.domain(id);
    if (!d) return notFound();
    const p = P();
    return {
      html: vhero({
        kicker: `~/dominio-${d.id} · ${d.weight}% del examen`,
        title: CAF.L(d.name),
        lede: CAF.L(d.blurb),
        actions: `<a class="btn btn--primary" href="#/leccion/${d.ts[0].id}">Empezar por ${d.ts[0].id} ▸</a><a class="btn" href="#/practica?d=${d.id}">Practicar este dominio</a>`,
        art: `<div class="vhero__scene">${CAF.Scenes.forDomain(d.id)}</div>`
      }) + `
      <section class="block">
        <div class="block__head"><h2 class="block__title">Task statements</h2><span class="mono muted">objetivos oficiales · Exam Guide v1.0</span></div>
        <ol class="tslist">${d.ts.map((t, i) => {
          const L = p.lessons[t.id];
          return `<li style="--i:${i}"><a class="tsrow ${L?.done ? 'is-done' : ''}" href="#/leccion/${t.id}">
            <span class="tsrow__id mono">${t.id}</span>
            <span class="tsrow__t">${CAF.L(t)}</span>
            <span class="tsrow__st mono">${L?.done ? '✓ hecho' : '○ pendiente'}</span></a></li>`;
        }).join('')}</ol>
      </section>
      <section class="block block--panel">
        <div class="block__head"><h2 class="block__title">Dónde se estudia</h2><span class="mono muted">Anthropic Academy · gratis</span></div>
        <div class="courses">${d.courses.map(k => `<a class="course" href="${CAF.COURSES[k].url}" target="_blank" rel="noopener"><span class="course__k mono">skilljar</span><span>${CAF.COURSES[k].name}</span><span class="course__go">↗</span></a>`).join('')}</div>
      </section>`
    };
  }

  /* ---------- ESCENARIOS ---------- */
  function scenarios() {
    return {
      html: vhero({
        kicker: '~/escenarios · 4 de 6 al azar',
        title: 'Seis contextos de <em>producción</em>',
        lede: 'El examen no pregunta definiciones sueltas: te pone en un sistema real y te pide la mejor decisión de arquitectura.',
        art: `<div class="dice" aria-hidden="true">${[1, 2, 3, 4, 5, 6].map(i => `<span class="dice__f mono" style="--i:${i}">S${i}</span>`).join('')}</div>`
      }) + `<div class="scn-grid">${CAF.SCENARIOS.map(s => `
        <article class="scn" style="--i:${s.id}">
          <div class="scn__top"><span class="scn__ico">${CAF.Scenes.icon(s.icon, 26)}</span><span class="mono scn__id">S${s.id}</span></div>
          <h3 class="scn__title">${CAF.L({ en: s.en, es: s.es })}</h3>
          ${CAF.LB(s.desc)}
          <div class="scn__doms mono">${s.domains.map(d => `<a href="#/dominio/${d}">D${d}</a>`).join('')}</div>
        </article>`).join('')}</div>`
    };
  }

  /* ---------- LECCIÓN (la teoría llega en la fase 2) ---------- */
  function lesson(id) { return CAF.Lessons.render(id); }
  function lessonFallback(id) {
    const t = id === '0' ? { id: '0', en: 'How the exam thinks', es: 'Cómo piensa el examen', domain: 0 } : CAF.findTS(id);
    if (!t) return notFound();
    const d = CAF.domain(t.domain);
    return {
      html: vhero({
        kicker: `~/leccion/${t.id}${d ? ' · D' + d.id : ''}`,
        title: CAF.L(t),
        lede: 'La teoría completa de esta lección llega en la fase 2 del proyecto.',
        art: CAF.Art.mascot({ px: 12, mood: 'think' })
      }) + (d ? `<section class="block block--panel"><div class="block__head"><h2 class="block__title">Cursos recomendados</h2></div><div class="courses">${d.courses.map(k => `<a class="course" href="${CAF.COURSES[k].url}" target="_blank" rel="noopener"><span class="course__k mono">skilljar</span><span>${CAF.COURSES[k].name}</span><span class="course__go">↗</span></a>`).join('')}</div></section>` : '')
    };
  }

  /* ---------- CONFIGURACIÓN DE ENTRENAMIENTOS ---------- */
  function setupPanel({ kind, title, kicker, lede, art, fields, startLabel, onStart, qs }) {
    const mode = CAF.MODES[qs.get('lang')] ? qs.get('lang') : CAF.lang();
    return {
      html: vhero({ kicker, title, lede, art }) + `
      <form class="setup" id="setup">
        <div class="setup__group">
          <div class="setup__label mono">01 · idioma de las preguntas</div>
          ${CAF.langPicker(mode, 'mode')}
          <p class="setup__help" id="modeHelp">${modeHelp(mode)}</p>
        </div>
        ${fields}
        <div class="setup__go"><button class="btn btn--primary btn--lg" type="submit">${startLabel} ▸</button></div>
      </form>`,
      mount(root) {
        const form = CAF.$('#setup', root);
        CAF.bindLangPicker(form, m => { CAF.$('#modeHelp', root).innerHTML = modeHelp(m); });
        form.addEventListener('click', e => { const c = e.target.closest('.chip-t'); if (c) { c.classList.toggle('is-on'); c.setAttribute('aria-pressed', c.classList.contains('is-on')); } });
        form.addEventListener('submit', e => {
          e.preventDefault();
          const fd = new FormData(form);
          const cfg = { kind, mode: fd.get('mode'), domains: CAF.$$('.chip-t.is-on[data-d]', form).map(b => Number(b.dataset.d)), fd };
          onStart(cfg);
        });
      }
    };
  }
  const modeHelp = m => ({
    en: '<b>Como el examen:</b> enunciado, opciones y botones en inglés. Úsalo para ensayar el día real.',
    es: '<b>Concepto:</b> todo en español, sin perder los términos técnicos. Úsalo para fijar la lógica.',
    bi: '<b>Puente:</b> cada bloque en inglés y, justo debajo, su traducción. Úsalo para aprender el inglés del examen.'
  }[m]);
  const domainChips = (sel = []) => `<div class="setup__group"><div class="setup__label mono">02 · dominios</div><div class="chips">${CAF.DOMAINS.map(d => `<button type="button" class="chip-t ${!sel.length || sel.includes(d.id) ? 'is-on' : ''}" data-d="${d.id}" aria-pressed="${!sel.length || sel.includes(d.id)}"><span class="mono">D${d.id}</span> ${esc(d.name.es)}</button>`).join('')}</div></div>`;
  const levelSelect = n => `<div class="setup__group"><div class="setup__label mono">${n} · dificultad</div>
    <div class="seg">${[['all', 'Todas'], ['basic', 'Base'], ['mid', 'Intermedia'], ['hard', 'Difícil']].map(([v, l], i) => `<label class="seg__o"><input type="radio" name="level" value="${v}" ${i === 0 ? 'checked' : ''}><span>${l}</span></label>`).join('')}</div></div>`;
  const notReady = what => CAF.toast(`${what} se conecta en su fase. La configuración (incluido el idioma) ya queda lista.`, 'info', 4200);

  function simulacro(qs) {
    if (CAF.Exam && CAF.Exam.setup) return CAF.Exam.setup(qs);
    return setupPanel({
      kind: 'exam', qs,
      kicker: '~/simulacro · formato CCAR-F',
      title: 'Simulacro <em>cronometrado</em>',
      lede: '60 preguntas · 4 escenarios al azar de 6 · 120 minutos · escala 100–1000 · aprobado con 720.',
      art: `<div class="clock" aria-hidden="true"><div class="clock__face"><i class="clock__h"></i><i class="clock__m"></i></div><span class="mono">120:00</span></div>`,
      fields: `<div class="setup__group"><div class="setup__label mono">02 · forma</div>
          <div class="seg">${[['A', 'Forma A'], ['B', 'Forma B'], ['C', 'Forma C'], ['R', 'Aleatoria']].map(([v, l], i) => `<label class="seg__o"><input type="radio" name="form" value="${v}" ${i === 3 ? 'checked' : ''}><span>${l}</span></label>`).join('')}</div></div>
        <div class="setup__group"><div class="setup__label mono">03 · reglas</div>
          <label class="check"><input type="checkbox" name="timer" checked> Cronómetro real (120 min)</label>
          <label class="check"><input type="checkbox" name="review" checked> Revisión con explicación al final</label></div>`,
      startLabel: 'Empezar simulacro',
      onStart: () => notReady('El banco de 200 preguntas')
    });
  }
  function practica(qs) {
    if (CAF.Practice && CAF.Practice.setup) return CAF.Practice.setup(qs);
    const sel = qs.get('d') ? [Number(qs.get('d'))] : [];
    return setupPanel({
      kind: 'practice', qs,
      kicker: '~/practica · aprendizaje con explicación inmediata',
      title: 'Práctica <em>a tu medida</em>',
      lede: 'Elige idioma, dominios, escenario y dificultad. Cada respuesta se explica opción por opción.',
      art: CAF.Art.mascot({ px: 12, mood: 'happy' }),
      fields: domainChips(sel) + `<div class="setup__group"><div class="setup__label mono">03 · escenario</div>
          <select name="scenario" class="select"><option value="">Todos los escenarios</option>${CAF.SCENARIOS.map(s => `<option value="${s.id}">S${s.id} · ${esc(s.es)}</option>`).join('')}</select></div>` + levelSelect('04') +
        `<div class="setup__group"><div class="setup__label mono">05 · cantidad</div><div class="seg">${[10, 20, 30].map((n, i) => `<label class="seg__o"><input type="radio" name="count" value="${n}" ${i === 0 ? 'checked' : ''}><span>${n}</span></label>`).join('')}</div></div>`,
      startLabel: 'Empezar práctica',
      onStart: () => notReady('El banco de preguntas')
    });
  }
  function labs(qs) {
    if (CAF.Labs && CAF.Labs.view) return CAF.Labs.view(qs);
    return setupPanel({ kind: 'labs', qs, kicker: '~/labs · diagnóstico', title: 'Encuentra <em>el fallo</em>',
      lede: 'Te damos un JSON de la API, un .mcp.json, un CLAUDE.md o un schema de tool con un error de producción. Señala la línea y elige el arreglo.',
      art: `<pre class="artcode mono" aria-hidden="true"><span>{ "stop_reason": </span><span class="artcode__bug">"max_tokens"</span><span> }</span></pre>`,
      fields: domainChips() + levelSelect('03'), startLabel: 'Abrir labs', onStart: () => notReady('Los 25 labs') });
  }
  function arquitecto(qs) {
    if (CAF.Arch && CAF.Arch.view) return CAF.Arch.view(qs);
    return setupPanel({ kind: 'arch', qs, kicker: '~/arquitecto · lienzo', title: 'Dibuja <em>el sistema</em>',
      lede: 'Arrastra coordinador, subagentes, servidores MCP, hooks y la persona humana; conéctalos para resolver el caso.',
      art: CAF.Scenes.agents(), fields: levelSelect('02'), startLabel: 'Abrir lienzo', onStart: () => notReady('Los 15 retos de arquitectura') });
  }
  function flashcards(qs) {
    if (CAF.Flash && CAF.Flash.view) return CAF.Flash.view(qs);
    return setupPanel({ kind: 'flash', qs, kicker: '~/flashcards · SM-2', title: 'Repaso <em>espaciado</em>',
      lede: 'Las tarjetas que fallas vuelven antes; las que dominas se espacian. En inglés, en español o en las dos.',
      art: `<div class="cardstack" aria-hidden="true"><i></i><i></i><i><span class="mono">tool_choice: "any"</span></i></div>`,
      fields: domainChips(), startLabel: 'Repasar', onStart: () => notReady('Las 150 flashcards') });
  }

  /* ---------- PROGRESO ---------- */
  function progreso() {
    const p = P(), lv = CAF.G.level(p.xp);
    const got = CAF.G.BADGES.filter(b => p.badges[b.id]).length;
    return {
      html: vhero({
        kicker: `~/progreso · ${esc(me().name)}`,
        title: `${lv.name}<em> · ${p.xp} xp</em>`,
        lede: `${got} de ${CAF.G.BADGES.length} commits desbloqueados · racha ${p.streak.count} (mejor ${p.streak.best})`,
        art: `<div class="ringrow">${CAF.DOMAINS.map(d => { const s = p.domainStats[d.id]; return CAF.Art.ring({ value: s.n ? s.ok / s.n : 0, size: 84, stroke: 7, label: 'D' + d.id, sub: s.n ? Math.round(100 * s.ok / s.n) + '%' : '—' }); }).join('')}</div>`
      }) + `
      <section class="split">
        <div class="block block--panel"><div class="block__head"><h2 class="block__title">Brecha de idioma</h2><span class="mono muted">mismas preguntas, distinto idioma</span></div>${langGap()}</div>
        <div class="block block--panel"><div class="block__head"><h2 class="block__title">Actividad · 12 semanas</h2></div>${heat(p)}</div>
      </section>
      <section class="block">
        <div class="block__head"><h2 class="block__title">Commits (insignias)</h2></div>
        <div class="badges">${CAF.G.BADGES.map((b, i) => `<div class="badge ${p.badges[b.id] ? 'is-on' : ''}" style="--i:${i}">
          <span class="badge__ico">${b.icon}</span><span class="badge__hash mono">${b.hash}</span><span class="badge__en mono">${esc(b.en)}</span><span class="badge__es">${esc(b.es)}</span></div>`).join('')}</div>
      </section>
      <section class="block block--panel"><div class="block__head"><h2 class="block__title mono">git log</h2></div>${eventLog(30)}</section>`
    };
  }
  function heat(p) {
    const cells = [];
    for (let i = 83; i >= 0; i--) {
      const d = new Date(Date.now() - i * 864e5).toISOString().slice(0, 10);
      const v = p.days[d] || 0;
      const k = v === 0 ? 0 : v < 60 ? 1 : v < 200 ? 2 : v < 500 ? 3 : 4;
      cells.push(`<i class="heat__c heat__c--${k}" title="${d}: ${v} xp"></i>`);
    }
    return `<div class="heat">${cells.join('')}</div><div class="heat__legend mono">menos <i class="heat__c heat__c--0"></i><i class="heat__c heat__c--1"></i><i class="heat__c heat__c--2"></i><i class="heat__c heat__c--3"></i><i class="heat__c heat__c--4"></i> más</div>`;
  }

  /* ---------- AJUSTES ---------- */
  function ajustes() {
    const u = me();
    return {
      html: vhero({ kicker: '~/ajustes', title: 'Preferencias de <em>' + esc(u.name) + '</em>', lede: 'Se guardan en tu perfil, en este navegador.', art: CAF.Art.mascot({ px: 12 }) }) + `
      <form class="setup" id="prefs">
        <div class="setup__group"><div class="setup__label mono">idioma por defecto</div>${CAF.langPicker(u.prefs.lang, 'lang')}</div>
        <div class="setup__group"><div class="setup__label mono">tema</div>
          <div class="seg">${[['dark', 'Oscuro · terminal'], ['light', 'Claro · papel']].map(([v, l]) => `<label class="seg__o"><input type="radio" name="theme" value="${v}" ${u.prefs.theme === v ? 'checked' : ''}><span>${l}</span></label>`).join('')}</div></div>
        <div class="setup__group"><div class="setup__label mono">movimiento</div>
          <label class="check"><input type="checkbox" name="motion" ${u.prefs.motion !== false ? 'checked' : ''}> Animaciones y mascota en movimiento</label></div>
        <div class="setup__group"><div class="setup__label mono">${u.role === 'admin' ? 'contraseña' : 'PIN'}</div>
          <div class="row"><input class="input" type="password" name="secret" placeholder="nuevo ${u.role === 'admin' ? 'contraseña (mín. 6)' : 'PIN (mín. 4)'}" autocomplete="new-password"><button class="btn" type="button" id="saveSecret">Cambiar</button></div></div>
        <div class="setup__group"><div class="setup__label mono">tu respaldo</div>
          <div class="row"><button class="btn" type="button" id="expMe">Exportar mi progreso (.json)</button></div></div>
      </form>`,
      mount(root) {
        const f = CAF.$('#prefs', root);
        f.addEventListener('change', e => {
          const t = e.target;
          if (t.name === 'lang') { CAF.Store.setPref('lang', t.value); CAF.$$('.langpick__opt', f).forEach(l => l.classList.toggle('is-on', l.contains(t))); CAF.App.renderChrome(); }
          if (t.name === 'theme') CAF.App.setTheme(t.value);
          if (t.name === 'motion') { CAF.Store.setPref('motion', t.checked); document.documentElement.classList.toggle('no-motion', !t.checked); }
          CAF.toast('Guardado', 'ok', 1400);
        });
        CAF.$('#saveSecret', root).addEventListener('click', () => {
          try { CAF.Store.setSecret(u.id, f.secret.value); f.secret.value = ''; CAF.toast('Actualizado', 'ok'); } catch (x) { CAF.toast(x.message, 'err'); }
        });
        CAF.$('#expMe', root).addEventListener('click', () => CAF.download(`caf-${u.name}-${new Date().toISOString().slice(0, 10)}.json`, CAF.Store.exportUser(u.id)));
      }
    };
  }

  function notFound() {
    return { html: vhero({ kicker: '~/404', title: 'Ruta <em>no encontrada</em>', lede: 'Escribe /help en la terminal para ver a dónde puedes ir.', art: CAF.Art.mascot({ px: 12, mood: 'sad' }), actions: '<a class="btn btn--primary" href="#/inicio">Volver al inicio</a>' }) };
  }

  CAF.Views = { home, domains, domain, scenarios, lesson, lessonFallback, simulacro, practica, labs, arquitecto, flashcards, progreso, ajustes, notFound, vhero, setupPanel, domainChips, levelSelect, gauge, langGap, eventLog, walker, floatChips };
})();
