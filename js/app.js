/* Arranque, enrutado por hash y cromática (barra de estado + árbol lateral). */
(function () {
  const ROUTES = [
    [/^#\/?(inicio)?$/, () => CAF.Views.home(), 'inicio'],
    [/^#\/academia$/, (m, qs) => CAF.Academy.map(qs), 'academia'],
    [/^#\/glosario$/, (m, qs) => CAF.Academy.glossary(qs), 'glosario'],
    [/^#\/dominios$/, () => CAF.Views.domains(), 'dominios'],
    [/^#\/dominio\/(\d)$/, m => CAF.Views.domain(m[1]), 'dominio-$1'],
    [/^#\/escenarios$/, () => CAF.Views.scenarios(), 'escenarios'],
    [/^#\/leccion\/([\w.]+)$/, m => CAF.Views.lesson(m[1]), 'leccion/$1'],
    [/^#\/simulacro$/, (m, qs) => CAF.Views.simulacro(qs), 'simulacro'],
    [/^#\/simulacro\/resultado$/, (m, qs) => CAF.Exam.resultView(qs), 'simulacro/resultado'],
    [/^#\/practica$/, (m, qs) => CAF.Views.practica(qs), 'practica'],
    [/^#\/labs$/, (m, qs) => CAF.Views.labs(qs), 'labs'],
    [/^#\/arquitecto$/, (m, qs) => CAF.Views.arquitecto(qs), 'arquitecto'],
    [/^#\/flashcards$/, (m, qs) => CAF.Views.flashcards(qs), 'flashcards'],
    [/^#\/progreso$/, () => CAF.Views.progreso(), 'progreso'],
    [/^#\/ajustes$/, () => CAF.Views.ajustes(), 'ajustes'],
    [/^#\/admin$/, () => CAF.Admin.view(), 'admin']
  ];

  let currentPath = '';

  function setTheme(t) {
    document.documentElement.dataset.theme = t;
    document.querySelector('meta[name="theme-color"]').content = t === 'dark' ? '#1b1815' : '#f4efe6';
    CAF.Store.setPref('theme', t);
    renderChrome();
  }

  function route() {
    if (!CAF.Store.current()) return;
    const [hashPath, query = ''] = (location.hash || '#/inicio').split('?');
    const qs = new URLSearchParams(query);
    let view = null, path = 'inicio';
    for (const [re, fn, p] of ROUTES) {
      const m = hashPath.match(re);
      if (m) { view = fn(m, qs); path = p.replace('$1', m[1]); break; }
    }
    if (!view) view = CAF.Views.notFound();
    /* Un contenedor nuevo por render: los listeners de la vista anterior mueren con él
       y no se acumulan sobre #view. */
    const host = CAF.$('#view');
    host.classList.remove('is-in');
    const root = document.createElement('div');
    root.className = 'view__in';
    root.innerHTML = view.html;
    host.replaceChildren(root);
    void host.offsetWidth;
    host.classList.add('is-in');
    if (view.mount) view.mount(root);
    currentPath = path;
    renderChrome();
    if (!hashPath.includes('simulacro/run')) root.scrollTop = 0;
    window.scrollTo(0, 0);
    document.body.classList.remove('tree-open');
    CAF.$('#treeToggle')?.setAttribute('aria-expanded', 'false');
  }

  function renderChrome() {
    const u = CAF.Store.current(); if (!u) return;
    const p = u.progress, lv = CAF.G.level(p.xp), mode = CAF.lang();
    CAF.$('#statusbar').innerHTML = `
      <a class="sb__brand" href="#/inicio" aria-label="Inicio">${CAF.Art.spark({ size: 22, rays: 10, cls: 'sb__spark' })}<span class="mono">claude-architect</span></a>
      <span class="sb__path mono">~/${CAF.esc(currentPath)}</span>
      <div class="sb__lang mono" role="group" aria-label="Modo de idioma por defecto">
        ${['en', 'bi', 'es'].map(m => `<button class="sb__lb ${m === mode ? 'is-on' : ''}" data-lang="${m}" title="${CAF.MODES[m].es}">${CAF.MODES[m].short}</button>`).join('')}
      </div>
      <span class="sb__xp mono" title="${lv.es}"><span class="sb__lv">${lv.name}</span><span class="sb__xpbar"><i style="--v:${lv.pct.toFixed(3)}"></i></span>${p.xp} xp</span>
      <span class="sb__streak mono" title="Racha de días">🔥 ${p.streak.count}</span>
      <button class="iconbtn sb__theme" id="sbTheme" aria-label="Cambiar tema" title="Tema">${document.documentElement.dataset.theme === 'dark' ? '☀' : '☾'}</button>
      <button class="sb__user" id="sbUser" aria-haspopup="menu"><span class="avatar avatar--s" style="--h:${u.hue}">${CAF.esc(u.name[0].toUpperCase())}</span><span class="sb__uname">${CAF.esc(u.name)}</span></button>`;

    const is = r => currentPath === r || currentPath.startsWith(r + '/');
    const item = (href, label, active, extra = '', glyph = '├─') => `<a class="tree__i ${active ? 'is-on' : ''}" href="${href}"><span class="tree__g mono">${glyph}</span><span class="tree__l">${label}</span>${extra}</a>`;
    const dstate = d => {
      const done = d.ts.filter(t => p.lessons[t.id]?.done).length;
      return done === 0 ? '○' : done === d.ts.length ? '●' : '◐';
    };
    CAF.$('#tree').innerHTML = `
      <div class="tree__head mono">explorador</div>
      <nav class="tree__nav">
        ${item('#/inicio', 'inicio', is('inicio'), '', '◆ ')}
        <div class="tree__sec mono">▾ desde cero</div>
        ${item('#/academia', 'mapa de módulos', is('academia') || /^leccion\/a\d/.test(currentPath), `<span class="tree__st mono">${CAF.G.acad(p)}/${CAF.academyIds().length}</span>`)}
        ${item('#/glosario', 'glosario', is('glosario'), '', '└─')}
        <div class="tree__sec mono">▾ temario</div>
        ${item('#/leccion/0', 'cómo piensa el examen', currentPath === 'leccion/0')}
        ${item('#/leccion/en', '<span class="mono tree__d">EN</span> exam english', currentPath === 'leccion/en')}
        ${CAF.DOMAINS.map((d, i) => item(`#/dominio/${d.id}`, `<span class="mono tree__d">D${d.id}</span> ${CAF.esc(d.name.es)}`, is('dominio-' + d.id) || (currentPath.startsWith('leccion/' + d.id + '.')), `<span class="tree__st mono">${dstate(d)} ${d.weight}%</span>`)).join('')}
        ${item('#/escenarios', 'escenarios', is('escenarios'), '', '└─')}
        <div class="tree__sec mono">▾ entrenamiento</div>
        ${item('#/simulacro', 'simulacro', is('simulacro'), '<span class="tree__st mono">60·120\'</span>')}
        ${item('#/practica', 'práctica', is('practica'))}
        ${item('#/labs', 'labs de diagnóstico', is('labs'))}
        ${item('#/arquitecto', 'arquitecto', is('arquitecto'))}
        ${item('#/flashcards', 'flashcards', is('flashcards'), '', '└─')}
        <div class="tree__sec mono">▾ tú</div>
        ${item('#/progreso', 'progreso', is('progreso'))}
        ${item('#/ajustes', 'ajustes', is('ajustes'), '', u.role === 'admin' ? '├─' : '└─')}
        ${u.role === 'admin' ? item('#/admin', 'admin', is('admin'), '<span class="tree__st mono">⚙</span>', '└─') : ''}
      </nav>
      <div class="tree__foot">
        <div class="tree__mascot" id="treeMascot">${CAF.Art.mascot({ px: 4 })}</div>
        <div class="mono tree__tip">pulsa <kbd>/</kbd> para la terminal</div>
      </div>`;
  }

  function bindChrome() {
    CAF.$('#statusbar').addEventListener('click', e => {
      const lb = e.target.closest('[data-lang]');
      if (lb) { CAF.Store.setPref('lang', lb.dataset.lang); CAF.toast('Idioma por defecto: ' + CAF.MODES[lb.dataset.lang].es, 'ok', 1600); refresh(); return; }
      if (e.target.closest('#sbTheme')) return setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
      if (e.target.closest('#sbUser')) return userMenu(e.target.closest('#sbUser'));
    });
    CAF.$('#treeToggle').addEventListener('click', () => {
      const open = document.body.classList.toggle('tree-open');
      CAF.$('#treeToggle').setAttribute('aria-expanded', open);
    });
  }

  function userMenu(anchor) {
    const old = CAF.$('.umenu'); if (old) { old.remove(); return; }
    const u = CAF.Store.current();
    const m = document.createElement('div');
    m.className = 'umenu'; m.setAttribute('role', 'menu');
    m.innerHTML = `<div class="umenu__h"><b>${CAF.esc(u.name)}</b><span class="mono muted">${u.role === 'admin' ? 'admin' : 'estudiante'}</span></div>
      <a role="menuitem" href="#/progreso">Progreso</a><a role="menuitem" href="#/ajustes">Ajustes</a>
      ${u.role === 'admin' ? '<a role="menuitem" href="#/admin">Administración</a>' : ''}
      <button role="menuitem" id="umOut">Cerrar sesión</button>`;
    document.body.appendChild(m);
    const r = anchor.getBoundingClientRect();
    m.style.top = (r.bottom + 6) + 'px'; m.style.right = (window.innerWidth - r.right) + 'px';
    m.addEventListener('click', e => { if (e.target.id === 'umOut') logout(); m.remove(); });
    setTimeout(() => document.addEventListener('click', function off(e) { if (!m.contains(e.target)) { m.remove(); document.removeEventListener('click', off); } }), 0);
  }

  function enter(first) {
    CAF.Gate.hide();
    const u = CAF.Store.current();
    document.documentElement.dataset.theme = u.prefs.theme || 'dark';
    document.documentElement.classList.toggle('no-motion', u.prefs.motion === false);
    CAF.$('#app').hidden = false;
    CAF.G.boot();
    if (!location.hash || location.hash === '#') location.hash = '#/inicio';
    route();
    CAF.$('#termLog').innerHTML = '';
    CAF.Term.print(`<span class="tl__accent">✻</span> <b>Bienvenido${first ? '' : ' de vuelta'}, ${CAF.esc(u.name)}.</b> <span class="tl__dim">Escribe</span> <button class="tl__link" data-cmd="/help">/help</button> <span class="tl__dim">o usa el explorador. Idioma actual:</span> <span class="tl__accent">${CAF.MODES[CAF.lang()].label}</span>`);
    if (first) CAF.toast('Cuenta admin creada. Desde «admin» puedes dar de alta estudiantes.', 'ok', 5000);
  }

  function logout() {
    CAF.Store.logout();
    CAF.$('#app').hidden = true;
    CAF.$('#view').innerHTML = '';
    history.replaceState(null, '', location.pathname);
    CAF.Gate.render();
  }

  function refresh() { route(); }

  /* Reacciones globales a la gamificación */
  function wireEvents() {
    const mascots = () => CAF.$$('.mascot');
    CAF.G.on('correct', () => mascots().forEach(m => CAF.Art.react(m, 'jump')));
    CAF.G.on('wrong', () => mascots().forEach(m => CAF.Art.react(m, 'shake')));
    CAF.G.on('badge', b => { CAF.toast(`commit <span class="mono">${b.hash}</span> · ${CAF.esc(b.es)}`, 'badge', 4800); CAF.Term.print(`<span class="tl__accent">◆ commit ${b.hash}</span> ${CAF.esc(b.en)} <span class="tl__dim">· ${CAF.esc(b.es)}</span>`); });
    CAF.G.on('levelup', lv => { CAF.confetti(90); CAF.toast(`Nivel ↑ <b>${lv.name}</b> · ${lv.es}`, 'ok', 5000); mascots().forEach(m => CAF.Art.react(m, 'dance')); });
    CAF.G.on('xp', () => renderChrome());
  }

  function start() {
    let theme = 'dark';
    try { const u = CAF.Store.current(); if (u) theme = u.prefs.theme; else if (matchMedia('(prefers-color-scheme: light)').matches) theme = 'light'; } catch (e) {}
    document.documentElement.dataset.theme = theme;
    CAF.Term.mount();
    bindChrome();
    wireEvents();
    window.addEventListener('hashchange', route);
    CAF.Store.current() ? enter(false) : CAF.Gate.render();
  }

  CAF.App = { start, enter, logout, refresh, route, renderChrome, setTheme };
  document.addEventListener('DOMContentLoaded', start);
})();
