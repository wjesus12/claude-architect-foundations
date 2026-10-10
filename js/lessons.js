/* Motor de lecciones. El contenido vive en js/content/lessons-*.js y se registra con CAF.addLessons().
   Bloques soportados: p, h, list, code, compare, trap, note, terms, steps, scene, table, example. */
(function () {
  const REG = {};
  CAF.addLessons = arr => arr.forEach(l => (REG[l.id] = l));
  CAF.lessonIds = () => ['0', 'en', ...CAF.allTS().map(t => t.id)];
  /* Ruta «Aprende Claude desde cero»: módulos a01…aNN en el orden de CAF.ACADEMY */
  CAF.academyIds = () => (CAF.ACADEMY || []).flatMap(part => part.modules);
  CAF.academyPart = id => (CAF.ACADEMY || []).find(part => part.modules.includes(id));

  /* ---------- resaltado mínimo de código ---------- */
  function hl(code, lang) {
    let s = CAF.esc(code);
    const tok = [];
    /* cada token protegido se sustituye por UN carácter de uso privado: sin dígitos ni letras
       que las expresiones siguientes puedan volver a capturar */
    const keep = (re, cls) => { s = s.replace(re, m => { tok.push(`<span class="hl-${cls}">${m}</span>`); return String.fromCharCode(0xE000 + tok.length - 1); }); };
    if (lang === 'json') {
      keep(/&quot;(?:[^&]|&(?!quot;))*?&quot;(?=\s*:)/g, 'key');
      keep(/&quot;(?:[^&]|&(?!quot;))*?&quot;/g, 'str');
      keep(/\b(true|false|null)\b/g, 'kw');
      keep(/-?\b\d+(\.\d+)?\b/g, 'num');
    } else if (lang === 'bash') {
      keep(/#.*$/gm, 'com');
      keep(/&quot;.*?&quot;|&#39;.*?&#39;/g, 'str');
      keep(/(^|\s)(--?[\w-]+)/g, 'kw');
      keep(/\$\{?\w+\}?/g, 'num');
    } else if (lang === 'yaml' || lang === 'md') {
      keep(/^---$/gm, 'com');
      keep(/^#{1,6} .*$/gm, 'key');
      keep(/^\s*[\w-]+(?=:)/gm, 'key');
      keep(/&quot;.*?&quot;|&#39;.*?&#39;/g, 'str');
      keep(/@[\w./-]+/g, 'num');
      keep(/`[^`]+`/g, 'kw');
    } else {
      keep(/#.*$/gm, 'com');
      keep(/\/\/.*$/gm, 'com');
      keep(/&quot;.*?&quot;|&#39;.*?&#39;/g, 'str');
      keep(/\b(def|return|if|elif|else|while|for|in|not|and|or|import|from|async|await|const|let|function|True|False|None|break|continue|try|except|raise|with|as|class)\b/g, 'kw');
      keep(/\b\d+(\.\d+)?\b/g, 'num');
    }
    return s.replace(/[\uE000-\uF8FF]/g, c => tok[c.charCodeAt(0) - 0xE000]);
  }

  /* ---------- bloques ---------- */
  function block(b, mode) {
    const L = o => CAF.L(o, mode), LB = (o, t) => CAF.LB(o, mode, t);
    switch (b.type) {
      case 'h': return `<h3 class="lx-h">${L(b.text)}</h3>`;
      case 'p': return `<div class="lx-p">${LB(b.text)}</div>`;
      case 'list': return `<ul class="lx-list">${b.items.map(i => `<li>${LB(i, 'span')}</li>`).join('')}</ul>`;
      case 'steps': return `<ol class="lx-steps">${b.items.map((i, n) => `<li style="--i:${n}"><span class="lx-steps__n mono">${String(n + 1).padStart(2, '0')}</span><div>${LB(i, 'span')}</div></li>`).join('')}</ol>`;
      case 'code': return `<figure class="lx-code"><figcaption class="mono"><span>${CAF.esc(b.title || b.lang)}</span><button class="lx-copy" data-copy>copiar</button></figcaption><pre><code>${hl(b.code.replace(/^\n/, ''), b.lang)}</code></pre>${b.caption ? `<div class="lx-code__cap">${LB(b.caption, 'span')}</div>` : ''}</figure>`;
      case 'compare': return `<div class="lx-cmp">
          <div class="lx-cmp__col lx-cmp__col--bad"><div class="lx-cmp__t mono">✗ ${L(b.bad.title)}</div><ul>${b.bad.items.map(i => `<li>${LB(i, 'span')}</li>`).join('')}</ul></div>
          <div class="lx-cmp__col lx-cmp__col--good"><div class="lx-cmp__t mono">✓ ${L(b.good.title)}</div><ul>${b.good.items.map(i => `<li>${LB(i, 'span')}</li>`).join('')}</ul></div></div>`;
      case 'trap': return `<aside class="lx-trap"><div class="lx-trap__k mono">⚠ ${mode === 'en' ? 'Exam trap' : mode === 'es' ? 'Trampa del examen' : 'Exam trap · Trampa del examen'}</div>${LB(b.text)}</aside>`;
      case 'note': return `<aside class="lx-note"><div class="lx-note__k mono">✻ ${mode === 'en' ? 'Key idea' : mode === 'es' ? 'Idea clave' : 'Key idea · Idea clave'}</div>${LB(b.text)}</aside>`;
      case 'terms': return `<dl class="lx-terms">${b.items.map(t => `<div><dt class="mono">${CAF.esc(t.term)}</dt><dd>${LB(t, 'span')}</dd></div>`).join('')}</dl>`;
      case 'table': return `<div class="tablewrap"><table class="table lx-table"><thead><tr>${b.head.map(h => `<th>${L(h)}</th>`).join('')}</tr></thead><tbody>${b.rows.map(r => `<tr>${r.map(c => `<td>${L(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
      case 'scene': return `<div class="lx-scene">${CAF.Scenes.forDomain(b.domain)}</div>`;
      case 'example': return `<div class="lx-ex"><div class="lx-ex__k mono">${mode === 'en' ? 'Worked example' : mode === 'es' ? 'Ejemplo resuelto' : 'Worked example · Ejemplo resuelto'}</div>${LB(b.situation)}<div class="lx-ex__a">${LB(b.answer)}</div></div>`;
      default: return '';
    }
  }

  /* ---------- mini-quiz ---------- */
  function quizHTML(l, mode) {
    if (!l.quiz || !l.quiz.length) return '';
    return `<section class="block block--panel lx-quiz" id="lxQuiz">
      <div class="block__head"><h2 class="block__title">${mode === 'en' ? 'Check yourself' : mode === 'es' ? 'Compruébalo' : 'Check yourself · Compruébalo'}</h2><span class="mono muted">${l.quiz.length} preguntas · +${CAF.G.XP.answerOk} xp cada acierto</span></div>
      ${l.quiz.map((q, qi) => {
        const order = CAF.shuffle(q.options.map((o, i) => i), CAF.seeded(qi + 7 + l.id.length * 31));
        return `<div class="qz" data-q="${qi}">
          <div class="qz__stem">${CAF.LB(q.q, mode)}</div>
          <div class="qz__opts">${order.map((oi, k) => `<button class="qz__o" data-o="${oi}"><span class="qz__l mono">${'ABCD'[k]}</span><span>${CAF.L(q.options[oi].t, mode)}</span></button>`).join('')}</div>
          <div class="qz__why" hidden></div>
        </div>`;
      }).join('')}
    </section>`;
  }

  function bindQuiz(root, l, mode) {
    root.addEventListener('click', e => {
      const b = e.target.closest('.qz__o'); if (!b) return;
      const box = b.closest('.qz'); if (box.classList.contains('is-done')) return;
      const q = l.quiz[box.dataset.q], oi = Number(b.dataset.o), ok = !!q.options[oi].ok;
      box.classList.add('is-done');
      CAF.$$('.qz__o', box).forEach(x => {
        const o = q.options[x.dataset.o];
        x.classList.add(o.ok ? 'is-ok' : x === b ? 'is-bad' : 'is-dim');
      });
      const why = CAF.$('.qz__why', box);
      why.hidden = false;
      why.innerHTML = q.options.map((o, i) => `<div class="qz__w ${o.ok ? 'qz__w--ok' : ''} ${i === oi ? 'qz__w--me' : ''}"><span class="mono">${o.ok ? '✓' : '✗'}</span>${CAF.LB(o.why, mode, 'span')}</div>`).join('');
      CAF.G.recordAnswer({ qid: `L${l.id}-${box.dataset.q}`, domain: l.domain || null, ok, mode });
      const p = CAF.Store.P();
      const L = p.lessons[l.id] || (p.lessons[l.id] = {});
      L.quiz = (L.quiz || 0) + (ok ? 1 : 0); CAF.Store.commit();
    });
  }

  /* ---------- vista ---------- */
  function render(id) {
    const l = REG[id];
    const ts = CAF.findTS(id);
    if (!l && !ts) return CAF.Views.notFound();
    if (!l) return CAF.Views.lessonFallback ? CAF.Views.lessonFallback(id) : CAF.Views.notFound();
    const qs = new URLSearchParams((location.hash.split('?')[1]) || '');
    const mode = CAF.MODES[qs.get('lang')] ? qs.get('lang') : CAF.lang();
    const d = CAF.domain(l.domain);
    const academy = l.track === 'academy';
    const part = academy ? CAF.academyPart(id) : null;
    const ids = academy ? CAF.academyIds() : CAF.lessonIds(), i = ids.indexOf(id);
    const prev = ids[i - 1], next = ids[i + 1];
    const title = l.title || ts;
    const p = CAF.Store.P();
    const done = !!p.lessons[id]?.done;
    const label = x => x.startsWith('a') && x !== 'en' ? 'M' + x.slice(1) : x === '0' ? 'L0' : x === 'en' ? 'Exam English' : x;
    const T3 = (en, es) => mode === 'en' ? en : mode === 'es' ? es : `${en} · ${es}`;

    const html = `
      <section class="vhero lx-hero">
        <div class="vhero__copy">
          <div class="vhero__kicker mono">${academy ? `<a href="#/academia">~/academia</a> / ${label(id)} · ${CAF.esc(CAF.T(part.title, mode === 'bi' ? 'es' : mode))}` : `~/leccion/${id}${d ? ` · D${d.id} · ${d.weight}%` : ''}`}${l.minutes ? ` · ${l.minutes} min` : ''}</div>
          <h1 class="vhero__title">${d || academy ? `<span class="lx-id mono">${academy ? label(id) : id}</span> ` : ''}${CAF.L(title, mode)}</h1>
          ${l.summary ? `<div class="vhero__lede">${CAF.LB(l.summary, mode)}</div>` : ''}
          <div class="lx-lang"><span class="mono muted">idioma de esta lección</span>${CAF.langPicker(mode, 'lxlang')}</div>
        </div>
        <div class="vhero__art">${l.scene ? `<div class="vhero__scene">${CAF.Scenes.forDomain(l.scene)}</div>` : l.art === 'mascot' || !d ? CAF.Art.mascot({ px: 12, mood: academy ? 'happy' : 'think' }) : `<div class="vhero__scene">${CAF.Scenes.forDomain(d.id)}</div>`}</div>
      </section>
      <div class="lx-layout">
        <article class="lx-body">
          ${l.objectives ? `<section class="lx-obj"><div class="lx-obj__k mono">${academy ? T3('What you will learn', 'Qué aprenderás') : T3('What the exam measures', 'Lo que mide el examen')}</div><ul>${l.objectives.map(o => `<li>${CAF.LB(o, mode, 'span')}</li>`).join('')}</ul></section>` : ''}
          ${l.blocks.map(b => block(b, mode)).join('')}
        </article>
        <aside class="lx-side">
          <div class="lx-side__card">
            <div class="mono muted small">fuentes</div>
            ${(l.sources || (d ? d.courses : [])).map(k => CAF.COURSES[k] ? `<a class="course course--s" href="${CAF.COURSES[k].url}" target="_blank" rel="noopener"><span class="course__k mono">skilljar</span><span>${CAF.COURSES[k].name}</span></a>` : '').join('')}
            ${(l.docs || []).map(x => `<a class="course course--s" href="${x.url}" target="_blank" rel="noopener"><span class="course__k mono">docs</span><span>${CAF.esc(x.label)}</span></a>`).join('')}
            ${academy ? `${(l.exam || []).map(t => `<a class="course course--s" href="#/leccion/${t}"><span class="course__k mono">examen</span><span>Lección ${t}</span></a>`).join('')}<a class="course course--s" href="#/academia"><span class="course__k mono">ruta</span><span>Mapa de módulos</span></a><a class="course course--s" href="#/glosario"><span class="course__k mono">glosario</span><span>Términos clave</span></a>` : `<a class="course course--s" href="#/practica${d ? '?d=' + d.id : ''}"><span class="course__k mono">practicar</span><span>Preguntas de este dominio</span></a>`}
          </div>
          <div class="lx-side__card lx-side__mascot">${CAF.Art.mascot({ px: 6, mood: done ? 'happy' : 'idle' })}<span class="mono small">${done ? 'Lección completada' : 'Lee, responde el quiz y márcala como hecha'}</span></div>
        </aside>
      </div>
      ${quizHTML(l, mode)}
      <nav class="lx-nav">
        ${prev ? `<a class="btn" href="#/leccion/${prev}">← ${label(prev)}</a>` : '<span></span>'}
        <button class="btn ${done ? '' : 'btn--primary'}" id="lxDone">${done ? '✓ Completada' : `Marcar como completada · +${CAF.G.XP.lesson} xp`}</button>
        ${next ? `<a class="btn" href="#/leccion/${next}">${label(next)} →</a>` : academy ? '<a class="btn" href="#/leccion/0">Ruta al examen →</a>' : '<span></span>'}
      </nav>`;

    return {
      html,
      mount(root) {
        CAF.bindLangPicker(root, m => { location.hash = `#/leccion/${id}?lang=${m}`; });
        bindQuiz(root, l, mode);
        root.addEventListener('click', e => {
          const c = e.target.closest('[data-copy]');
          if (c) { navigator.clipboard?.writeText(c.closest('.lx-code').querySelector('code').textContent); c.textContent = 'copiado ✓'; setTimeout(() => (c.textContent = 'copiar'), 1400); }
        });
        CAF.$('#lxDone', root).addEventListener('click', () => {
          const p = CAF.Store.P();
          const L = p.lessons[id] || (p.lessons[id] = {});
          if (L.done) return;
          L.done = true; L.at = Date.now();
          CAF.G.award(CAF.G.XP.lesson, `lección ${label(id)}`);
          CAF.confetti(40);
          CAF.toast(`Lección ${label(id)} completada`, 'ok');
          CAF.App.refresh();
        });
      }
    };
  }

  CAF.Lessons = { render, REG, hl, block };
})();
