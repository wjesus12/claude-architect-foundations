/* Labs de diagnóstico: 1) señala la(s) línea(s) con el fallo · 2) elige el arreglo.
   Contenido en js/content/labs.js (CAF.LABS). */
(function () {
  const LEVEL = { basic: 'Base', mid: 'Intermedia', hard: 'Difícil' };
  const KIND = { code: 'código', json: 'JSON', config: 'config', schema: 'schema', prompt: 'prompt', tree: 'árbol' };

  const modeOf = qs => (CAF.MODES[qs.get('lang')] ? qs.get('lang') : CAF.lang());

  /* ---------- listado ---------- */
  function list(qs) {
    const mode = modeOf(qs);
    const dom = Number(qs.get('d')) || 0;
    const p = CAF.Store.P();
    const labs = CAF.LABS.filter(l => !dom || l.domain === dom);
    const solved = CAF.LABS.filter(l => p.labs[l.id]?.ok).length;
    return {
      html: CAF.Views.vhero({
        kicker: `~/labs · ${solved}/${CAF.LABS.length} resueltos`,
        title: 'Encuentra <em>el fallo</em>',
        lede: 'Cada lab es un archivo real de producción con un error que el examen te haría diagnosticar. Señala la línea, elige el arreglo y lee por qué.',
        art: `<pre class="artcode mono" aria-hidden="true"><span>{ "stop_reason": </span><span class="artcode__bug">"max_tokens"</span><span> }</span></pre>`
      }) + `
      <section class="labbar">
        <div>${CAF.langPicker(mode, 'labLang')}</div>
        <div class="chips" role="group" aria-label="Filtrar por dominio">
          <a class="chip-t ${!dom ? 'is-on' : ''}" href="#/labs?lang=${mode}">Todos</a>
          ${CAF.DOMAINS.map(d => `<a class="chip-t ${dom === d.id ? 'is-on' : ''}" href="#/labs?lang=${mode}&d=${d.id}"><span class="mono">D${d.id}</span> ${CAF.LABS.filter(l => l.domain === d.id).length}</a>`).join('')}
        </div>
      </section>
      <div class="labgrid">${labs.map((l, i) => {
        const st = p.labs[l.id];
        return `<a class="labcard ${st?.ok ? 'is-ok' : st ? 'is-tried' : ''}" href="#/labs?id=${l.id}&lang=${mode}" style="--i:${i}">
          <div class="labcard__top mono"><span class="labcard__id">${l.id.toUpperCase()}</span><span>D${l.domain} · ${l.ts}</span></div>
          <div class="labcard__file mono">${CAF.esc(l.file)}</div>
          <h3 class="labcard__t">${CAF.L(l.title, mode)}</h3>
          <div class="labcard__foot mono"><span class="tag">${KIND[l.kind] || l.kind}</span><span>${LEVEL[l.level]}</span><span class="labcard__st">${st?.ok ? '✓ resuelto' : st ? '↻ ' + st.tries + ' intento(s)' : '○ nuevo'}</span></div>
        </a>`;
      }).join('')}</div>`,
      mount(root) { CAF.bindLangPicker(root, m => { location.hash = `#/labs?lang=${m}${dom ? '&d=' + dom : ''}`; }); }
    };
  }

  /* ---------- detalle ---------- */
  function detail(lab, qs) {
    const mode = modeOf(qs);
    const idx = CAF.LABS.indexOf(lab);
    const next = CAF.LABS[idx + 1];
    const order = CAF.shuffle(lab.options.map((_, i) => i));
    const multi = lab.bug.length > 1;
    const U = (en, es) => mode === 'en' ? en : mode === 'es' ? es : `${en} · ${es}`;

    const html = `
      <section class="vhero vhero--compact">
        <div class="vhero__copy">
          <div class="vhero__kicker mono"><a href="#/labs?lang=${mode}">~/labs</a> / ${lab.id} · D${lab.domain} · ${lab.ts} · ${LEVEL[lab.level]}</div>
          <h1 class="vhero__title">${CAF.L(lab.title, mode)}</h1>
          <div class="lx-lang">${CAF.langPicker(mode, 'labLang')}</div>
        </div>
        <div class="vhero__art">${CAF.Art.mascot({ px: 8, mood: 'think', cls: 'lab-mascot' })}</div>
      </section>
      <div class="labwrap">
        <div class="labmain">
          <div class="lab-ctx">${CAF.LB(lab.context, mode)}</div>
          <ol class="lab-steps mono"><li class="is-on" id="st1">1 · ${U(multi ? `Select the ${lab.bug.length} faulty lines` : 'Select the faulty line', multi ? `Señala las ${lab.bug.length} líneas con fallo` : 'Señala la línea con el fallo')}</li><li id="st2">2 · ${U('Choose the fix', 'Elige el arreglo')}</li></ol>
          <figure class="lab-file">
            <figcaption class="mono"><span>${CAF.esc(lab.file)}</span><span class="muted">${KIND[lab.kind]}</span></figcaption>
            <div class="lab-lines" id="labLines">${lab.lines.map((ln, i) => `<button class="lab-ln" data-i="${i}"><span class="lab-ln__n mono">${i + 1}</span><code class="lab-ln__c">${CAF.Lessons.hl(ln || ' ', lab.lang || (lab.kind === 'json' || lab.kind === 'schema' ? 'json' : lab.kind === 'config' || lab.kind === 'tree' ? 'yaml' : lab.kind === 'prompt' ? 'md' : 'python'))}</code></button>`).join('')}</div>
          </figure>
          <div class="lab-act"><button class="btn btn--primary" id="labCheck" disabled>${U('Confirm lines', 'Confirmar líneas')}</button><span class="mono muted small" id="labSel"></span></div>
          <section class="lab-fix" id="labFix" hidden>
            <div class="qz__stem">${CAF.LB(lab.question, mode)}</div>
            <div class="qz__opts">${order.map((oi, k) => `<button class="qz__o" data-o="${oi}"><span class="qz__l mono">${'ABCD'[k]}</span><span>${CAF.L(lab.options[oi].t, mode)}</span></button>`).join('')}</div>
            <div class="qz__why" id="labWhy" hidden></div>
          </section>
          <section class="lab-result" id="labResult" hidden></section>
        </div>
        <aside class="labside">
          <div class="lx-side__card"><div class="mono muted small">pista</div><div class="small">${CAF.LB(lab.hint || { en: 'Read the scenario constraint first: money, latency, sharing, or context?', es: 'Lee primero la restricción del escenario: ¿dinero, latencia, compartir o contexto?' }, mode)}</div></div>
          <a class="course course--s" href="#/leccion/${lab.ts}"><span class="course__k mono">teoría</span><span>Lección ${lab.ts}</span></a>
          ${next ? `<a class="course course--s" href="#/labs?id=${next.id}&lang=${mode}"><span class="course__k mono">siguiente</span><span>${next.id.toUpperCase()}</span></a>` : ''}
        </aside>
      </div>`;

    return {
      html,
      mount(root) {
        CAF.bindLangPicker(root, m => { location.hash = `#/labs?id=${lab.id}&lang=${m}`; });
        const sel = new Set();
        let lineOk = null, fixOk = null;
        const btn = CAF.$('#labCheck', root), info = CAF.$('#labSel', root);
        const svg = CAF.$('.lab-mascot', root);

        CAF.$('#labLines', root).addEventListener('click', e => {
          const b = e.target.closest('.lab-ln'); if (!b || lineOk !== null) return;
          const i = Number(b.dataset.i);
          if (sel.has(i)) sel.delete(i);
          else { if (sel.size >= lab.bug.length) { const first = sel.values().next().value; sel.delete(first); CAF.$(`.lab-ln[data-i="${first}"]`, root).classList.remove('is-sel'); } sel.add(i); }
          b.classList.toggle('is-sel', sel.has(i));
          btn.disabled = sel.size !== lab.bug.length;
          info.textContent = `${sel.size}/${lab.bug.length}`;
        });

        btn.addEventListener('click', () => {
          lineOk = lab.bug.every(i => sel.has(i)) && sel.size === lab.bug.length;
          CAF.$$('.lab-ln', root).forEach(b => {
            const i = Number(b.dataset.i);
            if (lab.bug.includes(i)) b.classList.add('is-bug');
            else if (sel.has(i)) b.classList.add('is-wrong');
            b.disabled = true;
          });
          btn.hidden = true; info.hidden = true;
          CAF.Art.react(svg, lineOk ? 'jump' : 'shake');
          CAF.toast(lineOk ? U('Right line(s)!', '¡Línea(s) correcta(s)!') : U('Not quite: the faulty line is highlighted.', 'No exactamente: la línea con el fallo está resaltada.'), lineOk ? 'ok' : 'err', 2200);
          CAF.$('#st1', root).classList.replace('is-on', lineOk ? 'is-ok' : 'is-bad');
          CAF.$('#st2', root).classList.add('is-on');
          const fix = CAF.$('#labFix', root); fix.hidden = false; fix.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        });

        CAF.$('#labFix', root).addEventListener('click', e => {
          const b = e.target.closest('.qz__o'); if (!b || fixOk !== null) return;
          const oi = Number(b.dataset.o);
          fixOk = !!lab.options[oi].ok;
          CAF.$$('.qz__o', root).forEach(x => { const o = lab.options[x.dataset.o]; x.classList.add(o.ok ? 'is-ok' : x === b ? 'is-bad' : 'is-dim'); });
          const why = CAF.$('#labWhy', root); why.hidden = false;
          why.innerHTML = order.map((i, k) => { const o = lab.options[i]; return `<div class="qz__w ${o.ok ? 'qz__w--ok' : ''} ${i === oi ? 'qz__w--me' : ''}"><span class="mono">${'ABCD'[k]} ${o.ok ? '✓' : '✗'}</span>${CAF.LB(o.why, mode, 'span')}</div>`; }).join('');
          CAF.$('#st2', root).classList.replace('is-on', fixOk ? 'is-ok' : 'is-bad');
          finish();
        });

        function finish() {
          const ok = lineOk && fixOk;
          const p = CAF.Store.P();
          const st = p.labs[lab.id] || (p.labs[lab.id] = { ok: false, tries: 0 });
          const firstSolve = ok && !st.ok;
          st.tries++; st.at = Date.now(); if (ok) st.ok = true;
          CAF.G.recordAnswer({ qid: 'LAB-' + lab.id, domain: lab.domain, ok, mode, silentXP: true });
          if (firstSolve) { CAF.G.award(CAF.G.XP.lab, 'lab ' + lab.id); CAF.confetti(45); }
          else CAF.G.award(ok ? 10 : 3, null);
          CAF.Art.react(svg, ok ? 'dance' : 'shake');
          const res = CAF.$('#labResult', root);
          res.hidden = false;
          res.innerHTML = `
            <div class="lab-verdict ${ok ? 'is-ok' : 'is-bad'}">
              <span class="lab-verdict__k mono">${ok ? '✓ ' + U('Lab solved', 'Lab resuelto') : '✗ ' + U('Not yet', 'Todavía no')}</span>
              <span class="mono small">${U('line', 'línea')} ${lineOk ? '✓' : '✗'} · ${U('fix', 'arreglo')} ${fixOk ? '✓' : '✗'}${firstSolve ? ` · +${CAF.G.XP.lab} xp` : ''}</span>
            </div>
            <div class="lx-note"><div class="lx-note__k mono">✻ ${U('Why it matters', 'Por qué importa')}</div>${CAF.LB(lab.explain, mode)}</div>
            ${lab.fixed ? `<figure class="lx-code"><figcaption class="mono"><span>${U('fixed', 'corregido')} · ${CAF.esc(lab.file)}</span></figcaption><pre><code>${CAF.Lessons.hl(lab.fixed.join('\n'), lab.lang || (['json', 'schema'].includes(lab.kind) ? 'json' : ['config', 'tree'].includes(lab.kind) ? 'yaml' : lab.kind === 'prompt' ? 'md' : 'python'))}</code></pre></figure>` : ''}
            <div class="row">${ok ? '' : `<a class="btn" href="#/labs?id=${lab.id}&lang=${mode}&r=${Date.now()}">${U('Try again', 'Reintentar')}</a>`}${next ? `<a class="btn btn--primary" href="#/labs?id=${next.id}&lang=${mode}">${U('Next lab', 'Siguiente lab')} →</a>` : `<a class="btn btn--primary" href="#/labs?lang=${mode}">${U('All labs', 'Todos los labs')}</a>`}</div>`;
          res.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }
    };
  }

  function view(qs) {
    const id = qs.get('id');
    if (id) { const lab = CAF.LABS.find(l => l.id === id); if (lab) return detail(lab, qs); }
    return list(qs);
  }

  CAF.Labs = { view };
})();
