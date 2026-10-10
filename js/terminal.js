/* Terminal híbrida: se escribe /comando o se hace clic en la interfaz; ambos caminos llevan al mismo sitio. */
(function () {
  const history = [];
  let hIndex = -1;
  const commands = {};

  function def(name, { desc, args = '', run, complete }) { commands[name] = { name, desc, args, run, complete }; }

  function print(html, kind = '') {
    const log = CAF.$('#termLog');
    if (!log) return;
    const row = document.createElement('div');
    row.className = `tl ${kind ? 'tl--' + kind : ''}`;
    row.innerHTML = html;
    log.appendChild(row);
    while (log.children.length > 200) log.firstChild.remove();
    log.scrollTop = log.scrollHeight;
    return row;
  }
  const echo = cmd => print(`<span class="tl__p">❯</span> <span class="tl__cmd">${CAF.esc(cmd)}</span>`, 'echo');
  const dot = (text, kind = 'ok') => print(`<span class="tl__dot tl__dot--${kind}">●</span> ${text}`);

  function exec(raw) {
    const line = String(raw || '').trim();
    if (!line) return;
    history.unshift(line); history.length = Math.min(history.length, 50); hIndex = -1;
    echo(line);
    const parts = line.replace(/^\//, '').split(/\s+/);
    const name = parts.shift().toLowerCase();
    const cmd = commands[name] || Object.values(commands).find(c => c.alias && c.alias.includes(name));
    if (!cmd) {
      const near = Object.keys(commands).filter(k => k.startsWith(name.slice(0, 2)));
      print(`<span class="tl__err">comando no encontrado:</span> /${CAF.esc(name)}${near.length ? ` · ¿quisiste decir ${near.map(n => `<button class="tl__link" data-cmd="/${n}">/${n}</button>`).join(' ')}?` : ' · escribe <button class="tl__link" data-cmd="/help">/help</button>'}`);
      return;
    }
    try { cmd.run(parts, line); } catch (e) { print(`<span class="tl__err">error:</span> ${CAF.esc(e.message)}`); }
  }

  function completeInput(input) {
    const v = input.value;
    const m = v.match(/^\/?(\S*)$/);
    if (m) {
      const opts = Object.keys(commands).filter(k => k.startsWith(m[1].toLowerCase()));
      if (opts.length === 1) input.value = '/' + opts[0] + ' ';
      else if (opts.length) hint(opts.map(o => '/' + o).join('  '));
      return;
    }
    const [, name, arg] = v.match(/^\/?(\S+)\s+(\S*)$/) || [];
    const c = commands[name];
    if (c && c.complete) {
      const opts = c.complete().filter(o => o.startsWith(arg || ''));
      if (opts.length === 1) input.value = `/${name} ${opts[0]}`;
      else if (opts.length) hint(opts.join('  '));
    }
  }
  function hint(t) { const h = CAF.$('#termHint'); if (h) { h.textContent = t; clearTimeout(h._t); h._t = setTimeout(() => (h.textContent = ''), 3500); } }

  function setOpen(open) {
    const term = CAF.$('#term');
    if (!term) return;
    term.classList.toggle('is-open', open);
  }

  function mount() {
    const form = CAF.$('#termForm'), input = CAF.$('#termInput'), term = CAF.$('#term');
    form.addEventListener('submit', e => { e.preventDefault(); const v = input.value; input.value = ''; setOpen(true); exec(v); });
    input.addEventListener('keydown', e => {
      if (e.key === 'Tab') { e.preventDefault(); completeInput(input); }
      else if (e.key === 'ArrowUp') { if (hIndex + 1 < history.length) { hIndex++; input.value = history[hIndex]; } e.preventDefault(); }
      else if (e.key === 'ArrowDown') { if (hIndex > 0) { hIndex--; input.value = history[hIndex]; } else { hIndex = -1; input.value = ''; } e.preventDefault(); }
      else if (e.key === 'Escape') { setOpen(false); input.blur(); }
    });
    input.addEventListener('focus', () => setOpen(true));
    term.addEventListener('click', e => {
      const b = e.target.closest('[data-cmd]');
      if (b) { exec(b.dataset.cmd); return; }
      if (!e.target.closest('.term__line')) term.classList.toggle('is-open');
    });
    document.addEventListener('keydown', e => {
      const typing = /input|textarea|select/i.test(document.activeElement?.tagName);
      if ((e.key === '/' && !typing) || (e.key === '`' && (e.ctrlKey || e.metaKey))) { e.preventDefault(); input.focus(); if (e.key === '/') input.value = '/'; }
    });
    document.addEventListener('click', e => { if (!e.target.closest('#term')) setOpen(false); });
  }

  /* ---------- comandos ---------- */
  const go = r => { location.hash = r; };
  const langs = () => ['en', 'es', 'bi'];

  def('help', { desc: 'lista de comandos', run() {
    print('<span class="tl__h">Comandos</span> · Tab autocompleta · ↑↓ historial · <kbd>/</kbd> enfoca la terminal');
    Object.values(commands).forEach(c => print(`<button class="tl__link" data-cmd="/${c.name}">/${c.name}</button>${c.args ? ` <span class="tl__arg">${c.args}</span>` : ''} <span class="tl__dim">— ${c.desc}</span>`, 'help'));
  } });
  def('inicio', { desc: 'panel principal', run() { go('#/inicio'); dot('panel principal'); } });
  def('academia', { desc: 'aprende Claude desde cero (mapa de módulos)', args: '[en|es|bi]', complete: langs, run([m]) {
    go('#/academia' + (m ? '?lang=' + m : ''));
    const p = CAF.Store.P();
    (CAF.ACADEMY || []).forEach(part => print(`<span class="tl__accent">${part.letter}</span> ${CAF.esc(part.title.es)} <span class="tl__dim">${part.modules.filter(id => p.lessons[id]?.done).length}/${part.modules.length}</span>`));
  } });
  def('modulo', { desc: 'abrir un módulo de la ruta desde cero', args: '<1-26 | a01…a26>', complete: () => CAF.academyIds(), run([id = '']) {
    const n = id.replace(/^[aAmM]/, ''), key = 'a' + String(parseInt(n, 10)).padStart(2, '0');
    if (!CAF.academyIds().includes(key)) throw new Error('módulo no encontrado. Ejemplo: /modulo 3');
    go('#/leccion/' + key); dot('M' + key.slice(1) + ' · ' + CAF.esc(CAF.Lessons.REG[key].title.es));
  } });
  def('glosario', { desc: 'glosario de términos de Claude', args: '[término]', run(args) {
    const q = args.join(' ').trim();
    go('#/glosario' + (q ? '?q=' + encodeURIComponent(q) : ''));
    if (q) (CAF.GLOSSARY || []).filter(g => (g.term + ' ' + (g.alias || '')).toLowerCase().includes(q.toLowerCase())).slice(0, 4)
      .forEach(g => print(`<span class="tl__accent">${CAF.esc(g.term)}</span> <span class="tl__dim">— ${CAF.esc(g.es)}</span>`));
  } });
  def('dominios', { desc: 'los 5 dominios del examen', run() { go('#/dominios'); CAF.DOMAINS.forEach(d => print(`<span class="tl__accent">D${d.id}</span> ${CAF.esc(d.name.en)} <span class="tl__dim">${d.weight}%</span>`)); } });
  def('dominio', { desc: 'abrir un dominio', args: '<1-5>', complete: () => ['1', '2', '3', '4', '5'], run([n]) {
    if (!CAF.domain(n)) throw new Error('usa /dominio 1 … /dominio 5');
    go('#/dominio/' + n); dot('dominio ' + n + ' · ' + CAF.esc(CAF.domain(n).name.en));
  } });
  def('leccion', { desc: 'abrir una lección', args: '<0 | en | 1.1 … 5.6>', complete: () => CAF.lessonIds(), run([id]) {
    if (!CAF.lessonIds().includes(id)) throw new Error('lección no encontrada. Ejemplo: /leccion 1.3');
    go('#/leccion/' + id);
  } });
  def('escenarios', { desc: 'los 6 escenarios del examen', run() { go('#/escenarios'); CAF.SCENARIOS.forEach(s => print(`<span class="tl__accent">S${s.id}</span> ${CAF.esc(s.en)} <span class="tl__dim">D${s.domains.join(' D')}</span>`)); } });
  def('simulacro', { desc: 'simulacro cronometrado', args: '[en|es|bi]', complete: langs, run([m]) { go('#/simulacro' + (m ? '?lang=' + m : '')); dot('preparando simulacro…', 'info'); } });
  def('practica', { desc: 'práctica por dominio, nivel e idioma', args: '[en|es|bi]', complete: langs, run([m]) { go('#/practica' + (m ? '?lang=' + m : '')); } });
  def('labs', { desc: 'labs de diagnóstico', run() { go('#/labs'); } });
  def('arquitecto', { desc: 'constructor de arquitecturas', run() { go('#/arquitecto'); } });
  def('flashcards', { desc: 'repaso espaciado (SM-2)', args: '[en|es|bi]', complete: langs, run([m]) { go('#/flashcards' + (m ? '?lang=' + m : '')); } });
  def('progreso', { desc: 'progreso, brecha de idioma e insignias', run() { go('#/progreso'); } });
  def('idioma', { desc: 'modo de idioma por defecto', args: '<en|es|bi>', complete: langs, run([m]) {
    if (!CAF.MODES[m]) { print(`modo actual: <span class="tl__accent">${CAF.MODES[CAF.lang()].label}</span> · opciones: en · es · bi`); return; }
    CAF.Store.setPref('lang', m); CAF.App.refresh(); dot(`idioma → ${CAF.MODES[m].es}`);
  } });
  def('tema', { desc: 'oscuro o claro', args: '<oscuro|claro>', complete: () => ['oscuro', 'claro'], run([t]) {
    const v = t === 'claro' || t === 'light' ? 'light' : t === 'oscuro' || t === 'dark' ? 'dark' : (document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
    CAF.App.setTheme(v); dot('tema → ' + (v === 'dark' ? 'oscuro' : 'claro'));
  } });
  def('stats', { desc: 'resumen rápido en la terminal', run() {
    const p = CAF.Store.P(), lv = CAF.G.level(p.xp), r = CAF.G.readiness(p);
    print(`<span class="tl__h">${CAF.esc(CAF.Store.me().name)}</span> · ${lv.name} · ${p.xp} xp · 🔥 ${p.streak.count}`);
    print(`puntuación estimada: <span class="tl__accent">${r ?? '—'}</span> / 1000 <span class="tl__dim">(aprobado 720)</span>`);
    CAF.DOMAINS.forEach(d => { const s = p.domainStats[d.id]; print(`D${d.id} ${CAF.Art.bar(s.n ? s.ok / s.n : 0, 20)} <span class="tl__dim">${s.n ? Math.round(100 * s.ok / s.n) + '%' : '—'} · ${s.n} resp.</span>`); });
    ['en', 'es', 'bi'].forEach(m => { const s = p.langStats[m]; print(`${CAF.MODES[m].short.padEnd(5, ' ')} ${CAF.Art.bar(s.n ? s.ok / s.n : 0, 20)} <span class="tl__dim">${s.n ? Math.round(100 * s.ok / s.n) + '%' : '—'}</span>`); });
  } });
  def('examen', { desc: 'datos del examen real CCAR-F', run() {
    const E = CAF.EXAM;
    print(`<span class="tl__h">${E.code}</span> · ${E.items} ítems · ${E.minutes} min · ${E.scenariosPerExam} de 6 escenarios · aprobado ${E.pass}/${E.scaleMax} · <span class="tl__dim">100 % en inglés</span>`);
  } });
  def('admin', { desc: 'panel de administración (solo admin)', run() { if (CAF.Store.me().role !== 'admin') throw new Error('solo la cuenta admin puede abrir este panel'); go('#/admin'); } });
  def('ajustes', { desc: 'preferencias del perfil', run() { go('#/ajustes'); } });
  def('clawd', { desc: 'saluda a la mascota', run() { CAF.$$('.mascot').forEach(m => CAF.Art.react(m, 'dance')); print('<span class="tl__accent">Clay</span> baila. Ahora, de vuelta al estudio.'); } });
  def('clear', { desc: 'limpiar la terminal', run() { CAF.$('#termLog').innerHTML = ''; } });
  def('salir', { desc: 'cerrar sesión', run() { CAF.App.logout(); } });

  CAF.Term = { mount, exec, print, dot, def, commands, setOpen };
})();
