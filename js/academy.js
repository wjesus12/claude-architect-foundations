/* «Aprende Claude desde cero»: mapa de la ruta (#/academia) y glosario (#/glosario).
   Partes en CAF.ACADEMY (js/content/academy-parts.js); módulos registrados con CAF.addLessons({ track: 'academy' }). */
(function () {
  const modeOf = qs => (CAF.MODES[qs.get('lang')] ? qs.get('lang') : CAF.lang());
  const label = id => 'M' + id.slice(1);

  function map(qs) {
    const mode = modeOf(qs);
    const p = CAF.Store.P();
    const ids = CAF.academyIds();
    const doneN = ids.filter(id => p.lessons[id]?.done).length;
    const nextId = ids.find(id => !p.lessons[id]?.done);
    const mins = ids.reduce((a, id) => a + (CAF.Lessons.REG[id]?.minutes || 0), 0);
    const T3 = (en, es) => mode === 'en' ? en : mode === 'es' ? es : `${en} · ${es}`;

    const parts = CAF.ACADEMY.map((part, pi) => {
      const mods = part.modules.map((id, k) => {
        const l = CAF.Lessons.REG[id];
        if (!l) return '';
        const st = p.lessons[id]?.done ? 'done' : id === nextId ? 'next' : 'todo';
        return `<li class="amod amod--${st}" style="--i:${k}">
          <a href="#/leccion/${id}?lang=${mode}" class="amod__card">
            <span class="amod__dot mono">${st === 'done' ? '✓' : label(id)}</span>
            <span class="amod__body">
              <span class="amod__t">${CAF.L(l.title, mode)}</span>
              <span class="amod__meta mono">${label(id)} · ${l.minutes || 10} min${(l.exam || []).length ? ` · ${T3('exam', 'examen')} ${l.exam.join(' ')}` : ''}</span>
            </span>
            <span class="amod__go mono">${st === 'done' ? T3('review', 'repasar') : st === 'next' ? T3('start', 'empezar') + ' ▸' : '→'}</span>
          </a></li>`;
      }).join('');
      const pd = part.modules.filter(id => p.lessons[id]?.done).length;
      return `<section class="apart" style="--i:${pi}">
        <header class="apart__head">
          <span class="apart__letter">${part.letter}</span>
          <div><h2 class="apart__t">${CAF.L(part.title, mode)}${CAF.academyLevel(part.modules[0], mode) ? ` <span class="lvtag lvtag--${part.level}">${CAF.academyLevel(part.modules[0], mode).label}</span>` : ''}</h2><div class="apart__blurb">${CAF.LB(part.blurb, mode, 'span')}</div></div>
          <span class="apart__prog mono">${pd}/${part.modules.length}</span>
        </header>
        <ol class="apath">${mods}</ol>
      </section>`;
    }).join('');

    return {
      html: `
      <section class="vhero ahero">
        <div class="vhero__copy">
          <div class="vhero__kicker mono">~/academia · ${ids.length} ${T3('modules', 'módulos')} · ≈ ${Math.round(mins / 60)} h</div>
          <h1 class="vhero__title">${T3('Learn Claude', 'Aprende Claude')} <em>${T3('from zero', 'desde cero')}</em></h1>
          <p class="vhero__lede">${T3('A step-by-step path built from the Anthropic Academy courses and the current documentation: models and thinking, Claude chat, Cowork and Claude Code, prompting, the API, MCP, skills, plugins and agents. Finish it and the exam route will feel familiar.', 'Una ruta paso a paso construida con los cursos de Anthropic Academy y la documentación actual: modelos y pensamiento, Claude chat, Cowork y Claude Code, prompting, la API, MCP, skills, plugins y agentes. Al terminarla, la ruta del examen te resultará familiar.')}</p>
          <div class="vhero__actions">
            ${nextId ? `<a class="btn btn--primary" href="#/leccion/${nextId}?lang=${mode}">${doneN ? T3('Continue', 'Continuar') : T3('Start', 'Empezar')} · ${label(nextId)} ▸</a>` : `<a class="btn btn--primary" href="#/leccion/0">${T3('Go to the exam route', 'Ir a la ruta del examen')} ▸</a>`}
            <a class="btn" href="#/glosario?lang=${mode}">${T3('Glossary', 'Glosario')}</a>
          </div>
          <div class="lx-lang">${CAF.langPicker(mode, 'acLang')}</div>
        </div>
        <div class="vhero__art ahero__art">
          ${CAF.Art.ring({ value: ids.length ? doneN / ids.length : 0, size: 150, stroke: 12, label: `${doneN}/${ids.length}`, sub: T3('modules', 'módulos') })}
          ${CAF.Art.mascot({ px: 8, mood: doneN ? 'happy' : 'idle', walk: true, cls: 'ahero__m' })}
        </div>
      </section>
      <div class="aparts">${parts}</div>
      <section class="block block--panel abridge">
        <div class="block__head"><h2 class="block__title">${T3('Then: the exam route', 'Después: la ruta del examen')}</h2></div>
        <p class="muted">${T3('The 31 exam lessons follow the official blueprint (5 domains, 30 task statements). Each module above links to the exam lessons it prepares.', 'Las 31 lecciones del examen siguen el blueprint oficial (5 dominios, 30 task statements). Cada módulo de arriba enlaza con las lecciones del examen que prepara.')}</p>
        <div class="row" style="margin-top:12px"><a class="btn" href="#/leccion/0">L0 · ${T3('How the exam thinks', 'Cómo piensa el examen')}</a><a class="btn" href="#/dominios">${T3('The 5 domains', 'Los 5 dominios')}</a></div>
      </section>`,
      mount(root) { CAF.bindLangPicker(root, m => { location.hash = `#/academia?lang=${m}`; }); }
    };
  }

  /* ---------- glosario ---------- */
  function glossary(qs) {
    const mode = modeOf(qs);
    const cats = [...new Set(CAF.GLOSSARY.map(g => g.cat))];
    const T3 = (en, es) => mode === 'en' ? en : mode === 'es' ? es : `${en} · ${es}`;
    const CAT = CAF.GLOSSARY_CATS || {};
    const rows = CAF.GLOSSARY.slice().sort((a, b) => a.term.localeCompare(b.term, 'en', { sensitivity: 'base' }));
    return {
      html: `
      <section class="vhero vhero--compact">
        <div class="vhero__copy">
          <div class="vhero__kicker mono">~/glosario · ${rows.length} ${T3('terms', 'términos')}</div>
          <h1 class="vhero__title">${T3('Glossary', 'Glosario')} <em>Claude</em></h1>
          <div class="lx-lang">${CAF.langPicker(mode, 'glLang')}</div>
        </div>
        <div class="vhero__art">${CAF.Art.spark({ size: 110, rays: 12 })}</div>
      </section>
      <div class="gloss-bar">
        <input class="input gloss-q" id="glQ" type="search" placeholder="${T3('Search a term (e.g. effort, MCP, hook)…', 'Busca un término (p. ej. effort, MCP, hook)…')}" autocomplete="off">
        <div class="chips" id="glCats"><button class="chip-t is-on" data-cat="">${T3('All', 'Todas')}</button>${cats.map(c => `<button class="chip-t" data-cat="${c}">${CAF.esc(CAT[c] ? CAF.T(CAT[c], mode === 'bi' ? 'es' : mode) : c)}</button>`).join('')}</div>
      </div>
      <dl class="gloss" id="glList">${rows.map(g => `
        <div class="gloss__i" data-cat="${g.cat}" data-s="${CAF.esc((g.term + ' ' + g.en + ' ' + g.es + ' ' + (g.alias || '')).toLowerCase())}">
          <dt><span class="gloss__term mono">${CAF.esc(g.term)}</span><span class="gloss__cat mono">${CAF.esc(CAT[g.cat] ? CAF.T(CAT[g.cat], 'es') : g.cat)}</span></dt>
          <dd>${CAF.LB({ en: g.en, es: g.es }, mode, 'span')}${g.mod ? ` <a class="gloss__mod mono" href="#/leccion/${g.mod}">${label(g.mod)} →</a>` : ''}</dd>
        </div>`).join('')}</dl>
      <p class="muted mono small" id="glEmpty" hidden>${T3('No matching terms.', 'No hay términos que coincidan.')}</p>`,
      mount(root) {
        CAF.bindLangPicker(root, m => { location.hash = `#/glosario?lang=${m}`; });
        const q = CAF.$('#glQ', root), items = CAF.$$('.gloss__i', root), empty = CAF.$('#glEmpty', root);
        let cat = '';
        const apply = () => {
          const t = q.value.trim().toLowerCase();
          let n = 0;
          items.forEach(el => { const ok = (!cat || el.dataset.cat === cat) && (!t || el.dataset.s.includes(t)); el.hidden = !ok; if (ok) n++; });
          empty.hidden = n > 0;
        };
        q.addEventListener('input', apply);
        CAF.$('#glCats', root).addEventListener('click', e => {
          const b = e.target.closest('[data-cat]'); if (!b) return;
          cat = b.dataset.cat;
          CAF.$$('#glCats .chip-t', root).forEach(x => x.classList.toggle('is-on', x === b));
          apply();
        });
        const pre = qs.get('q'); if (pre) { q.value = pre; apply(); }
      }
    };
  }

  CAF.Academy = { map, glossary };
})();
