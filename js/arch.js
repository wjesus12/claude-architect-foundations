/* Constructor de arquitecturas: lienzo con nodos arrastrables y aristas dirigidas.
   Añadir: clic en la paleta · Mover: arrastrar · Conectar: clic en ● del origen y luego en el destino
   · Borrar: seleccionar + Supr (o botón) · clic en una flecha la elimina. */
(function () {
  const LEVEL = { basic: 'Base', mid: 'Intermedia', hard: 'Difícil' };
  const modeOf = qs => (CAF.MODES[qs.get('lang')] ? qs.get('lang') : CAF.lang());
  const N = t => CAF.ARCH_NODES[t];
  const KEY = { del: null };
  document.addEventListener('keydown', e => {
    if ((e.key === 'Delete' || e.key === 'Backspace') && KEY.del && document.getElementById('archCanvas') && !/input|textarea|select/i.test(document.activeElement?.tagName)) { e.preventDefault(); KEY.del(); }
  });

  /* ---------- listado ---------- */
  function list(qs) {
    const mode = modeOf(qs), p = CAF.Store.P();
    const solved = CAF.ARCH.filter(a => p.arch[a.id]?.ok).length;
    return {
      html: CAF.Views.vhero({
        kicker: `~/arquitecto · ${solved}/${CAF.ARCH.length} resueltos`,
        title: 'Dibuja <em>el sistema</em>',
        lede: 'Cada reto describe un problema de producción. Coloca los componentes y conéctalos en la dirección en que fluyen los datos. Ojo: la paleta incluye anti-patrones que el examen usa como distractores.',
        art: `<div class="vhero__scene">${CAF.Scenes.agents()}</div>`
      }) + `
      <section class="labbar"><div>${CAF.langPicker(mode, 'archLang')}</div></section>
      <div class="labgrid">${CAF.ARCH.map((a, i) => {
        const st = p.arch[a.id];
        return `<a class="labcard ${st?.ok ? 'is-ok' : st ? 'is-tried' : ''}" href="#/arquitecto?id=${a.id}&lang=${mode}" style="--i:${i}">
          <div class="labcard__top mono"><span class="labcard__id">${a.id.toUpperCase()}</span><span>${a.ts}</span></div>
          <div class="archmini">${a.need.nodes.slice(0, 6).map(([t]) => `<span class="an an--${N(t).c}">${N(t).g}</span>`).join('<i>→</i>')}</div>
          <h3 class="labcard__t">${CAF.L(a.title, mode)}</h3>
          <div class="labcard__foot mono"><span>${LEVEL[a.level]}</span><span>${a.need.nodes.length} nodos · ${a.need.edges.length} flechas</span><span class="labcard__st">${st?.ok ? '✓ resuelto' : st ? '↻ ' + st.tries : '○ nuevo'}</span></div>
        </a>`;
      }).join('')}</div>`,
      mount(root) { CAF.bindLangPicker(root, m => { location.hash = `#/arquitecto?lang=${m}`; }); }
    };
  }

  /* ---------- reto ---------- */
  function detail(ch, qs) {
    const mode = modeOf(qs);
    const U = (en, es) => mode === 'en' ? en : mode === 'es' ? es : `${en} · ${es}`;
    const nameOf = t => mode === 'en' ? N(t).en : mode === 'es' ? N(t).es : N(t).en;
    const p = CAF.Store.P();
    const saved = p.arch[ch.id]?.draft;
    const S = saved ? JSON.parse(JSON.stringify(saved)) : { nodes: [], edges: [], seq: 0 };
    let pending = null, selected = null, drag = null, sawSolution = !!p.arch[ch.id]?.sawSolution;
    const idx = CAF.ARCH.indexOf(ch), next = CAF.ARCH[idx + 1];

    const html = `
      <section class="vhero vhero--compact">
        <div class="vhero__copy">
          <div class="vhero__kicker mono"><a href="#/arquitecto?lang=${mode}">~/arquitecto</a> / ${ch.id} · ${ch.ts} · ${LEVEL[ch.level]}</div>
          <h1 class="vhero__title">${CAF.L(ch.title, mode)}</h1>
          <div class="lab-ctx">${CAF.LB(ch.brief, mode)}</div>
          <div class="lx-lang">${CAF.langPicker(mode, 'archLang')}</div>
        </div>
        <div class="vhero__art">${CAF.Art.mascot({ px: 8, mood: 'think', cls: 'arch-mascot' })}</div>
      </section>
      <div class="archwrap">
        <aside class="palette" aria-label="Componentes">
          <div class="mono muted small">${U('components · click to add', 'componentes · clic para añadir')}</div>
          ${CAF.shuffle(ch.palette, CAF.seeded(ch.id.charCodeAt(4) * 7)).map(t => `<button class="pal" data-add="${t}"><span class="an an--${N(t).c}">${N(t).g}</span><span>${CAF.L(N(t), mode)}</span></button>`).join('')}
        </aside>
        <div class="archmain">
          <div class="archtools">
            <button class="btn btn--s" id="aDel" disabled>${U('Delete selected', 'Borrar seleccionado')}</button>
            <button class="btn btn--s" id="aClear">${U('Clear', 'Limpiar')}</button>
            <span class="archhint mono small" id="aHint">${U('Tip: click ● on a node, then click the target node.', 'Consejo: clic en ● de un nodo y luego clic en el nodo destino.')}</span>
            <span class="grow"></span>
            <button class="btn btn--s" id="aSol">${U('Show solution', 'Ver solución')}</button>
            <button class="btn btn--primary btn--s" id="aCheck">${U('Check design', 'Comprobar diseño')}</button>
          </div>
          <div class="canvas" id="archCanvas">
            <svg class="canvas__svg" id="archSvg"><defs>
              <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z"/></marker>
              <marker id="arrowBad" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z"/></marker>
            </defs><g id="archEdges"></g><path id="archRubber" class="edge edge--rubber" d=""/></svg>
            <div class="canvas__empty" id="archEmpty">${CAF.Art.mascot({ px: 6, mood: 'idle' })}<span class="mono small">${U('Add components from the palette', 'Añade componentes desde la paleta')}</span></div>
          </div>
          <section class="arch-result" id="archResult" hidden></section>
        </div>
      </div>`;

    return {
      html,
      mount(root) {
        CAF.bindLangPicker(root, m => { persist(); location.hash = `#/arquitecto?id=${ch.id}&lang=${m}`; });
        const canvas = CAF.$('#archCanvas', root), svg = CAF.$('#archSvg', root), gE = CAF.$('#archEdges', root), rubber = CAF.$('#archRubber', root);
        const mascot = CAF.$('.arch-mascot', root);

        function persist() { const st = CAF.Store.P().arch[ch.id] || (CAF.Store.P().arch[ch.id] = { ok: false, tries: 0 }); st.draft = S; CAF.Store.commit(); }

        /* Busca la primera celda libre de una rejilla calculada con el ancho real del lienzo */
        function freeSpot() {
          const c = canvas.getBoundingClientRect();
          const cw = c.width < 600 ? 150 : 200, chh = 74;
          const cols = Math.max(1, Math.floor((c.width - 16) / cw)), rows = Math.max(1, Math.floor((c.height - 16) / chh));
          for (let r = 0; r < rows; r++) for (let k = 0; k < cols; k++) {
            const x = (8 + k * cw) / c.width, y = (8 + r * chh) / c.height;
            const busy = S.nodes.some(n => Math.abs(n.x - x) * c.width < cw * 0.8 && Math.abs(n.y - y) * c.height < chh * 0.8);
            if (!busy) return { x, y };
          }
          return { x: 0.05 + Math.random() * 0.5, y: 0.05 + Math.random() * 0.7 };
        }
        function addNode(type, x, y) {
          const id = 'n' + (++S.seq);
          const spot = x == null ? freeSpot() : { x, y };
          S.nodes.push({ id, type, x: spot.x, y: spot.y });
          render(); persist();
          return id;
        }

        function render() {
          CAF.$$('.anode', canvas).forEach(e => e.remove());
          CAF.$('#archEmpty', root).hidden = S.nodes.length > 0;
          S.nodes.forEach(n => {
            const el = document.createElement('div');
            el.className = `anode anode--${N(n.type).c} ${selected === n.id ? 'is-sel' : ''} ${pending === n.id ? 'is-src' : ''} ${N(n.type).trap ? 'anode--trap' : ''}`;
            el.dataset.id = n.id;
            el.style.left = (n.x * 100) + '%'; el.style.top = (n.y * 100) + '%';
            el.innerHTML = `<span class="an an--${N(n.type).c}">${N(n.type).g}</span><span class="anode__t">${CAF.esc(nameOf(n.type))}</span><button class="anode__port" data-port="${n.id}" aria-label="${U('connect from here', 'conectar desde aquí')}">●</button>`;
            canvas.appendChild(el);
          });
          CAF.$('#aDel', root).disabled = !selected;
          drawEdges();
        }

        function center(id) {
          const el = canvas.querySelector(`.anode[data-id="${id}"]`); if (!el) return null;
          const c = canvas.getBoundingClientRect(), r = el.getBoundingClientRect();
          return { x: r.left - c.left + r.width / 2, y: r.top - c.top + r.height / 2, w: r.width / 2 + 4, h: r.height / 2 + 4 };
        }
        const border = (a, b) => {
          const dx = b.x - a.x, dy = b.y - a.y;
          const t = Math.min(dx ? a.w / Math.abs(dx) : 1e9, dy ? a.h / Math.abs(dy) : 1e9);
          return { x: a.x + dx * t, y: a.y + dy * t };
        };
        function drawEdges(bad = new Set()) {
          const c = canvas.getBoundingClientRect();
          svg.setAttribute('viewBox', `0 0 ${c.width} ${c.height}`);
          gE.innerHTML = S.edges.map((e, i) => {
            const A = center(e.from), B = center(e.to); if (!A || !B) return '';
            const rev = S.edges.some(f => f.from === e.to && f.to === e.from);
            const s = border(A, B), t = border(B, A);
            let d = `M${s.x},${s.y} L${t.x},${t.y}`;
            if (rev) {
              const mx = (s.x + t.x) / 2, my = (s.y + t.y) / 2, len = Math.hypot(t.x - s.x, t.y - s.y) || 1;
              const ox = -(t.y - s.y) / len * 22, oy = (t.x - s.x) / len * 22;
              d = `M${s.x},${s.y} Q${mx + ox},${my + oy} ${t.x},${t.y}`;
            }
            const isBad = bad.has(i);
            return `<g class="edgewrap" data-e="${i}"><path class="edge-hit" d="${d}"/><path class="edge ${isBad ? 'edge--bad' : ''}" d="${d}" marker-end="url(#${isBad ? 'arrowBad' : 'arrow'})"/></g>`;
          }).join('');
        }

        /* paleta */
        CAF.$('.palette', root).addEventListener('click', e => {
          const b = e.target.closest('[data-add]'); if (!b) return;
          addNode(b.dataset.add);
          b.classList.add('is-pop'); setTimeout(() => b.classList.remove('is-pop'), 300);
        });

        /* lienzo: seleccionar, conectar, arrastrar */
        canvas.addEventListener('pointerdown', e => {
          const port = e.target.closest('[data-port]');
          const node = e.target.closest('.anode');
          const edge = e.target.closest('.edgewrap');
          if (port) {
            e.stopPropagation();
            pending = pending === port.dataset.port ? null : port.dataset.port;
            CAF.$('#aHint', root).textContent = pending ? U('Now click the target node (Esc to cancel).', 'Ahora clic en el nodo destino (Esc para cancelar).') : '';
            render(); return;
          }
          if (node && pending && node.dataset.id !== pending) {
            const from = pending, to = node.dataset.id;
            const exists = S.edges.findIndex(x => x.from === from && x.to === to);
            if (exists >= 0) S.edges.splice(exists, 1); else S.edges.push({ from, to });
            pending = null; rubber.setAttribute('d', '');
            CAF.$('#aHint', root).textContent = '';
            render(); persist(); return;
          }
          if (edge) { S.edges.splice(Number(edge.dataset.e), 1); render(); persist(); return; }
          if (node) {
            selected = node.dataset.id;
            const n = S.nodes.find(x => x.id === selected);
            const c = canvas.getBoundingClientRect();
            drag = { n, dx: e.clientX - (c.left + n.x * c.width), dy: e.clientY - (c.top + n.y * c.height), moved: false };
            node.setPointerCapture(e.pointerId);
            CAF.$$('.anode', canvas).forEach(x => x.classList.toggle('is-sel', x.dataset.id === selected));
            CAF.$('#aDel', root).disabled = false;
            return;
          }
          selected = null; pending = null; rubber.setAttribute('d', ''); render();
        });
        canvas.addEventListener('pointermove', e => {
          const c = canvas.getBoundingClientRect();
          if (drag) {
            drag.moved = true;
            const el = canvas.querySelector(`.anode[data-id="${drag.n.id}"]`);
            drag.n.x = Math.min(1 - el.offsetWidth / c.width, Math.max(0, (e.clientX - drag.dx - c.left) / c.width));
            drag.n.y = Math.min(1 - el.offsetHeight / c.height, Math.max(0, (e.clientY - drag.dy - c.top) / c.height));
            el.style.left = (drag.n.x * 100) + '%'; el.style.top = (drag.n.y * 100) + '%';
            drawEdges();
          } else if (pending) {
            const A = center(pending); if (A) rubber.setAttribute('d', `M${A.x},${A.y} L${e.clientX - c.left},${e.clientY - c.top}`);
          }
        });
        canvas.addEventListener('pointerup', () => { if (drag && drag.moved) persist(); drag = null; });
        root.addEventListener('keydown', e => { if (e.key === 'Escape') { pending = null; rubber.setAttribute('d', ''); render(); } });

        const delSel = () => {
          if (!selected) return;
          S.nodes = S.nodes.filter(n => n.id !== selected);
          S.edges = S.edges.filter(x => x.from !== selected && x.to !== selected);
          selected = null; render(); persist();
        };
        KEY.del = delSel;
        CAF.$('#aDel', root).addEventListener('click', delSel);
        CAF.$('#aClear', root).addEventListener('click', () => { S.nodes = []; S.edges = []; selected = pending = null; render(); persist(); CAF.$('#archResult', root).hidden = true; });
        CAF.$('#aSol', root).addEventListener('click', () => {
          CAF.modal({ title: U('Show the reference solution?', '¿Ver la solución de referencia?'),
            body: `<p>${U('Your canvas will be replaced. Solving after viewing gives reduced XP.', 'Tu lienzo se reemplazará. Resolverlo después de verla da menos XP.')}</p>`,
            actions: [{ label: U('Cancel', 'Cancelar') }, { label: U('Show it', 'Verla'), primary: true, onClick: () => { solution(); } }] });
        });
        CAF.$('#aCheck', root).addEventListener('click', check);
        window.addEventListener('resize', function onR() { if (!document.body.contains(canvas)) return window.removeEventListener('resize', onR); drawEdges(); });

        function solution() {
          sawSolution = true;
          const st = CAF.Store.P().arch[ch.id] || (CAF.Store.P().arch[ch.id] = { ok: false, tries: 0 });
          st.sawSolution = true;
          /* capas por BFS desde los nodos sin entradas */
          const types = ch.need.nodes.map(([t]) => t);
          const inc = Object.fromEntries(types.map(t => [t, 0]));
          ch.need.edges.forEach(([a, b]) => { if (a !== b && inc[b] != null) inc[b]++; });
          const layer = {}; const q = types.filter(t => !inc[t]); if (!q.length) q.push(types[0]);
          q.forEach(t => (layer[t] = 0));
          for (let k = 0; k < q.length; k++) ch.need.edges.forEach(([a, b]) => { if (a === q[k] && layer[b] == null) { layer[b] = layer[a] + 1; q.push(b); } });
          types.forEach(t => { if (layer[t] == null) layer[t] = 0; });
          const maxL = Math.max(...Object.values(layer));
          const byL = {}; types.forEach(t => (byL[layer[t]] = byL[layer[t]] || []).push(t));
          S.nodes = []; S.edges = []; S.seq = 0;
          const idOf = {};
          const narrow = canvas.getBoundingClientRect().width < 600;
          types.forEach(t => {
            const L = layer[t], row = byL[L].indexOf(t), rows = byL[L].length;
            const a = maxL ? L / maxL : 0, b = rows > 1 ? row / (rows - 1) : 0.5;
            /* lienzo estrecho: capas de arriba abajo; ancho: de izquierda a derecha */
            idOf[t] = narrow ? addNode(t, 0.03 + b * 0.5, 0.03 + a * 0.82) : addNode(t, 0.03 + a * 0.74, 0.06 + b * 0.76);
          });
          ch.need.edges.forEach(([a, b]) => S.edges.push({ from: idOf[a], to: idOf[b] }));
          render(); persist();
        }

        function check() {
          const have = t => S.nodes.filter(n => n.type === t);
          const hasEdge = (a, b) => S.edges.some(e => { const A = S.nodes.find(n => n.id === e.from), B = S.nodes.find(n => n.id === e.to); return A && B && A.type === a && B.type === b; });
          const rows = [];
          ch.need.nodes.forEach(([t, min]) => rows.push({ ok: have(t).length >= min, txt: U(`Component: ${N(t).en}`, `Componente: ${N(t).es}`) }));
          ch.need.edges.forEach(([a, b]) => rows.push({ ok: hasEdge(a, b), txt: U(`Flow: ${N(a).en} → ${N(b).en}`, `Flujo: ${N(a).es} → ${N(b).es}`) }));
          const bad = new Set();
          (ch.forbid.edges || []).forEach(([a, b]) => {
            const found = hasEdge(a, b);
            if (found) S.edges.forEach((e, i) => { const A = S.nodes.find(n => n.id === e.from), B = S.nodes.find(n => n.id === e.to); if (A && B && A.type === a && B.type === b) bad.add(i); });
            if (found) rows.push({ ok: false, txt: U(`Remove: ${N(a).en} → ${N(b).en}`, `Quita: ${N(a).es} → ${N(b).es}`), forbid: true });
          });
          (ch.forbid.nodes || []).forEach(t => { if (have(t).length) rows.push({ ok: false, txt: U(`Anti-pattern on canvas: ${N(t).en}`, `Anti-patrón en el lienzo: ${N(t).es}`), forbid: true }); });
          const ok = rows.every(r => r.ok);
          drawEdges(bad);
          CAF.$$('.anode', canvas).forEach(el => { const n = S.nodes.find(x => x.id === el.dataset.id); el.classList.toggle('is-badnode', !!(n && (ch.forbid.nodes || []).includes(n.type))); });

          const st = CAF.Store.P().arch[ch.id] || (CAF.Store.P().arch[ch.id] = { ok: false, tries: 0 });
          const first = ok && !st.ok;
          st.tries++; st.at = Date.now(); if (ok) st.ok = true; st.draft = S;
          CAF.G.recordAnswer({ qid: 'ARC-' + ch.id, domain: CAF.findTS(ch.ts).domain, ok, mode, silentXP: true });
          if (first) { CAF.G.award(sawSolution ? 15 : CAF.G.XP.arch, 'arquitectura ' + ch.id); if (!sawSolution) CAF.confetti(60); }
          else CAF.Store.commit();
          CAF.Art.react(mascot, ok ? 'dance' : 'shake');

          const passed = rows.filter(r => r.ok).length;
          const res = CAF.$('#archResult', root);
          res.hidden = false;
          res.innerHTML = `
            <div class="lab-verdict ${ok ? 'is-ok' : 'is-bad'}">
              <span class="lab-verdict__k mono">${ok ? '✓ ' + U('Design approved', 'Diseño aprobado') : '✗ ' + U('Not yet', 'Todavía no')}</span>
              <span class="mono small">${passed}/${rows.length} ${U('checks', 'comprobaciones')}${first ? ` · +${sawSolution ? 15 : CAF.G.XP.arch} xp` : ''}</span>
            </div>
            <ul class="checklist mono">${rows.map(r => `<li class="${r.ok ? 'is-ok' : r.forbid ? 'is-forbid' : 'is-miss'}">${r.ok ? '✓' : '✗'} ${CAF.esc(r.txt)}</li>`).join('')}</ul>
            ${ok ? `<div class="lx-note"><div class="lx-note__k mono">✻ ${U('Why this design', 'Por qué este diseño')}</div>${CAF.LB(ch.explain, mode)}</div>` : `<p class="muted small">${U('Fix the ✗ items and check again. Missing arrows? Check their direction.', 'Corrige los ✗ y vuelve a comprobar. ¿Faltan flechas? Revisa su dirección.')}</p>`}
            ${ok && next ? `<a class="btn btn--primary" href="#/arquitecto?id=${next.id}&lang=${mode}">${U('Next challenge', 'Siguiente reto')} →</a>` : ''}`;
          res.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }

        requestAnimationFrame(render);
      }
    };
  }

  function view(qs) {
    const id = qs.get('id');
    if (id) { const ch = CAF.ARCH.find(a => a.id === id); if (ch) return detail(ch, qs); }
    return list(qs);
  }

  CAF.Arch = { view };
})();
