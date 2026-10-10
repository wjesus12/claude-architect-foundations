/* Pantalla de arranque: secuencia de boot + alta del admin (primer uso) o selección de perfil. */
(function () {
  const BOOT = [
    ['dim', 'claude-architect v1.0 · CCAR-F · exam guide v1.0 (jul 2026)'],
    ['ok', 'blueprint cargado · 5 dominios · 30 task statements · 6 escenarios'],
    ['ok', 'modos de idioma: EN · ES · EN+ES'],
    ['ok', 'almacenamiento local listo · sin servidor, tus datos no salen de este navegador']
  ];

  function render() {
    const gate = CAF.$('#gate');
    gate.hidden = false;
    gate.innerHTML = `
      <div class="gate__sky" aria-hidden="true">${CAF.Art.spark({ size: 520, rays: 14, cls: 'gate__bigspark', seed: 11 })}</div>
      <div class="gate__grid">
        <div class="gate__intro">
          <div class="gate__kicker mono">CCAR-F · entrenamiento</div>
          <h1 class="gate__title">Claude Certified<br><em>Architect</em><span class="gate__found">Foundations</span></h1>
          <p class="gate__lede">Prepárate para el examen como se presenta: escenarios de producción, 60 preguntas, 120 minutos, todo en inglés. Practica cada pregunta en inglés, en español o en las dos lenguas a la vez, hasta que el idioma deje de pesar.</p>
          <ul class="gate__facts mono">
            <li><b>60</b> ítems</li><li><b>120</b> min</li><li><b>720</b> para aprobar</li><li><b>EN</b> · ES · EN+ES</li>
          </ul>
        </div>
        <div class="gate__term">
          <div class="win">
            <div class="win__bar"><span class="win__title mono">~/claude-architect</span><span class="win__mode mono">acceso local</span></div>
            <div class="win__body" id="gateBody"><div class="boot mono" id="boot"></div><div id="gateForm"></div></div>
          </div>
          <div class="gate__walk" aria-hidden="true">${CAF.Art.mascot({ px: 7, walk: true, cls: 'gate__mascot' })}</div>
        </div>
      </div>`;
    runBoot();
  }

  async function runBoot() {
    const boot = CAF.$('#boot');
    const fast = sessionStorage.getItem('caf.booted') === '1';
    for (const [k, t] of BOOT) {
      const row = document.createElement('div');
      row.className = 'boot__row boot__row--' + k;
      row.innerHTML = `<span class="boot__dot">${k === 'ok' ? '✓' : '·'}</span><span class="boot__t"></span>`;
      boot.appendChild(row);
      if (fast) row.querySelector('.boot__t').textContent = t;
      else await CAF.type(row.querySelector('.boot__t'), t, 9);
    }
    try { sessionStorage.setItem('caf.booted', '1'); } catch (e) {}
    if (!CAF.$('#gateForm') || CAF.Store.current()) return; /* ya se entró durante la animación */
    CAF.Store.hasAdmin() ? profiles() : firstRun();
  }

  function firstRun() {
    const f = CAF.$('#gateForm');
    f.innerHTML = `
      <div class="gform">
        <div class="gform__q mono"><span class="tl__accent">?</span> Primera vez en este navegador. Crea la <b>cuenta administradora</b>: podrá dar de alta estudiantes, ver su progreso, reiniciarlos y exportar respaldos.</div>
        <form id="fAdmin" class="gform__f">
          <label class="field"><span>Nombre</span><input name="name" required maxlength="32" autocomplete="username" placeholder="p. ej. Wilmer"></label>
          <label class="field"><span>Contraseña (mín. 6)</span><input name="p1" type="password" required minlength="6" autocomplete="new-password"></label>
          <label class="field"><span>Repite la contraseña</span><input name="p2" type="password" required minlength="6" autocomplete="new-password"></label>
          <p class="gform__err" id="gErr" role="alert"></p>
          <button class="btn btn--primary btn--block">Crear admin y entrar ↵</button>
        </form>
      </div>`;
    CAF.$('#fAdmin').addEventListener('submit', e => {
      e.preventDefault();
      const fd = new FormData(e.target);
      if (fd.get('p1') !== fd.get('p2')) return err('Las contraseñas no coinciden.');
      try {
        const u = CAF.Store.createUser({ name: fd.get('name'), secret: fd.get('p1'), role: 'admin', hue: 18 });
        CAF.Store.login(u.id);
        CAF.App.enter(true);
      } catch (x) { err(x.message); }
    });
    CAF.$('#fAdmin input').focus();
  }

  function profiles() {
    const f = CAF.$('#gateForm');
    const us = CAF.Store.users();
    f.innerHTML = `
      <div class="gform">
        <div class="gform__q mono"><span class="tl__accent">?</span> ¿Quién va a estudiar? <span class="tl__dim">(${us.length} perfil${us.length > 1 ? 'es' : ''})</span></div>
        <ul class="plist" role="listbox" aria-label="Perfiles">
          ${us.map((u, i) => `<li><button class="plist__row" data-id="${u.id}" role="option">
              <span class="avatar" style="--h:${u.hue}">${CAF.esc(u.name.slice(0, 1).toUpperCase())}</span>
              <span class="plist__name">${CAF.esc(u.name)}</span>
              <span class="plist__role mono">${u.role === 'admin' ? 'admin' : 'estudiante'}</span>
              <span class="plist__meta mono">${CAF.G.level(u.progress.xp).name} · ${u.progress.xp} xp</span>
              <span class="plist__key mono">${i + 1}</span>
            </button></li>`).join('')}
        </ul>
        <div id="pinBox"></div>
        <p class="gform__foot mono">Los estudiantes los crea la cuenta admin desde su panel.</p>
      </div>`;
    f.addEventListener('click', e => { const b = e.target.closest('.plist__row'); if (b) askSecret(b.dataset.id); });
    f.addEventListener('keydown', e => { const n = Number(e.key); if (n && us[n - 1] && !e.target.matches('input')) askSecret(us[n - 1].id); });
    f.querySelector('.plist__row')?.focus();
  }

  function askSecret(id) {
    const u = CAF.Store.get(id);
    CAF.$$('.plist__row').forEach(b => b.classList.toggle('is-picked', b.dataset.id === id));
    const box = CAF.$('#pinBox');
    box.innerHTML = `<form id="fPin" class="gform__f gform__f--row">
        <label class="field field--grow"><span>${u.role === 'admin' ? 'Contraseña' : 'PIN'} de ${CAF.esc(u.name)}</span>
          <input name="s" type="password" required autocomplete="current-password" ${u.role === 'admin' ? '' : 'inputmode="numeric"'}></label>
        <button class="btn btn--primary">Entrar ↵</button>
      </form><p class="gform__err" id="gErr" role="alert"></p>`;
    const inp = box.querySelector('input'); inp.focus();
    CAF.$('#fPin').addEventListener('submit', e => {
      e.preventDefault();
      if (CAF.Store.verify(id, inp.value)) { CAF.Store.login(id); CAF.App.enter(false); }
      else { err('No coincide. Inténtalo de nuevo.'); inp.select(); CAF.$('.gate__mascot') && CAF.Art.react(CAF.$('.gate__mascot'), 'shake'); }
    });
  }

  function err(m) { const e = CAF.$('#gErr'); if (e) e.textContent = m; }

  function hide() { const g = CAF.$('#gate'); g.hidden = true; g.innerHTML = ''; }

  CAF.Gate = { render, hide };
})();
