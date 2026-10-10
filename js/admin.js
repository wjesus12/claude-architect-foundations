/* Panel admin: alta y gestión de estudiantes, progreso comparado, respaldos. */
(function () {
  const esc = s => CAF.esc(s);

  function row(u) {
    const p = u.progress, lv = CAF.G.level(p.xp), score = CAF.G.readiness(p);
    const t = CAF.G.tot(p);
    const best = p.exams.reduce((m, e) => Math.max(m, e.scaled), 0);
    const L = p.langStats;
    const pc = s => s.n ? Math.round(100 * s.ok / s.n) + '%' : '—';
    return `<tr data-id="${u.id}">
      <td><span class="avatar avatar--s" style="--h:${u.hue}">${esc(u.name[0].toUpperCase())}</span> <b>${esc(u.name)}</b>${u.role === 'admin' ? ' <span class="tag mono">admin</span>' : ''}<div class="muted mono small">${CAF.ago(u.lastLogin)}</div></td>
      <td class="mono">${lv.name}<div class="muted small">${p.xp} xp · 🔥${p.streak.count}</div></td>
      <td class="mono">${CAF.G.acad(p)}/${CAF.academyIds().length}</td>
      <td class="mono">${CAF.G.done(p)}/${CAF.lessonIds().length}</td>
      <td class="mono">${t.n}<div class="muted small">${pc(t)}</div></td>
      <td class="mono small">EN ${pc(L.en)}<br>ES ${pc(L.es)}<br>EN+ES ${pc(L.bi)}</td>
      <td class="mono">${score ?? '—'}<div class="muted small">mejor sim: ${best || '—'}</div></td>
      <td class="admin__acts">
        <button class="btn btn--s" data-act="secret">${u.role === 'admin' ? 'Contraseña' : 'PIN'}</button>
        <button class="btn btn--s" data-act="rename">Renombrar</button>
        <button class="btn btn--s" data-act="export">Exportar</button>
        <button class="btn btn--s" data-act="reset">Reiniciar</button>
        ${u.role === 'admin' ? '' : '<button class="btn btn--s btn--danger" data-act="delete">Borrar</button>'}
      </td></tr>`;
  }

  function view() {
    if (CAF.Store.me().role !== 'admin') return CAF.Views.notFound();
    const us = CAF.Store.users();
    const students = us.filter(u => u.role !== 'admin');
    return {
      html: CAF.Views.vhero({
        kicker: '~/admin · cuenta administrada localmente',
        title: 'Panel de <em>administración</em>',
        lede: `${students.length} estudiante${students.length === 1 ? '' : 's'} en este navegador. Los datos viven solo aquí: exporta un respaldo antes de limpiar el navegador.`,
        actions: '<button class="btn btn--primary" id="aNew">+ Nuevo estudiante</button><button class="btn" id="aExp">Exportar todo</button><button class="btn" id="aImp">Importar respaldo</button>',
        art: `<div class="admin__art">${CAF.Art.mascot({ px: 9, mood: 'happy' })}${CAF.Art.mascot({ px: 7, cls: 'admin__m2' })}${CAF.Art.mascot({ px: 6, mood: 'think', cls: 'admin__m3' })}</div>`
      }) + `
      <section class="block block--panel">
        <div class="block__head"><h2 class="block__title">Perfiles</h2><span class="mono muted">el progreso por idioma muestra la brecha EN vs ES</span></div>
        <div class="tablewrap"><table class="table" id="aTable">
          <thead><tr><th>Perfil</th><th>Nivel</th><th>Desde cero</th><th>Lecciones</th><th>Respuestas</th><th>Por idioma</th><th>Estimado</th><th></th></tr></thead>
          <tbody>${us.map(row).join('')}</tbody>
        </table></div>
      </section>
      <section class="block block--panel block--danger">
        <div class="block__head"><h2 class="block__title">Zona peligrosa</h2></div>
        <p class="muted">Borra todos los perfiles y su progreso de este navegador, incluida la cuenta admin. No se puede deshacer.</p>
        <button class="btn btn--danger" id="aWipe">Borrar todo</button>
      </section>`,
      mount(root) {
        CAF.$('#aNew', root).addEventListener('click', newStudent);
        CAF.$('#aExp', root).addEventListener('click', () => CAF.download(`caf-respaldo-${new Date().toISOString().slice(0, 10)}.json`, CAF.Store.exportAll()));
        CAF.$('#aImp', root).addEventListener('click', async () => {
          const txt = await CAF.pickFile(); if (!txt) return;
          try {
            const r = CAF.Store.importAll(txt);
            CAF.toast(r === 'all' ? 'Respaldo completo restaurado' : 'Progreso importado en ' + r, 'ok');
            if (r === 'all' && !CAF.Store.current()) return location.reload();
            CAF.App.refresh();
          } catch (x) { CAF.toast(x.message, 'err', 5000); }
        });
        CAF.$('#aWipe', root).addEventListener('click', () => CAF.modal({
          title: 'Borrar todo',
          body: '<p>Escribe <code>BORRAR</code> para confirmar.</p><input class="input" id="wipeTxt" autocomplete="off">',
          actions: [{ label: 'Cancelar' }, { label: 'Borrar todo', danger: true, onClick: m => { if (m.querySelector('#wipeTxt').value !== 'BORRAR') { CAF.toast('Texto incorrecto', 'err'); return false; } CAF.Store.wipe(); location.hash = ''; location.reload(); } }]
        }));
        CAF.$('#aTable', root).addEventListener('click', e => {
          const b = e.target.closest('[data-act]'); if (!b) return;
          const id = b.closest('tr').dataset.id, u = CAF.Store.get(id);
          const act = b.dataset.act;
          if (act === 'export') return CAF.download(`caf-${u.name}.json`, CAF.Store.exportUser(id));
          if (act === 'secret') return ask(`Nuevo ${u.role === 'admin' ? 'contraseña' : 'PIN'} para ${esc(u.name)}`, 'password', v => CAF.Store.setSecret(id, v));
          if (act === 'rename') return ask(`Nuevo nombre para ${esc(u.name)}`, 'text', v => CAF.Store.rename(id, v), u.name);
          if (act === 'reset') return confirmAct(`¿Reiniciar todo el progreso de ${esc(u.name)}?`, () => CAF.Store.resetProgress(id));
          if (act === 'delete') return confirmAct(`¿Borrar el perfil de ${esc(u.name)}?`, () => CAF.Store.remove(id));
        });
      }
    };
  }

  function newStudent() {
    CAF.modal({
      title: 'Nuevo estudiante',
      body: `<label class="field"><span>Nombre</span><input class="input" id="nsName" maxlength="32"></label>
             <label class="field"><span>PIN (mín. 4)</span><input class="input" id="nsPin" type="password" inputmode="numeric" autocomplete="new-password"></label>
             <label class="field"><span>Idioma inicial</span><select class="select" id="nsLang"><option value="bi">Híbrido (EN + ES)</option><option value="es">Español</option><option value="en">Inglés</option></select></label>`,
      actions: [{ label: 'Cancelar' }, { label: 'Crear', primary: true, onClick: m => {
        try {
          const u = CAF.Store.createUser({ name: m.querySelector('#nsName').value, secret: m.querySelector('#nsPin').value });
          u.prefs.lang = m.querySelector('#nsLang').value; CAF.Store.commit();
          CAF.toast(`Perfil creado: ${esc(u.name)}`, 'ok'); CAF.App.refresh();
        } catch (x) { CAF.toast(x.message, 'err'); return false; }
      } }]
    });
  }
  function ask(title, type, fn, value = '') {
    CAF.modal({ title, body: `<input class="input" id="askV" type="${type}" value="${esc(value)}" autocomplete="off">`,
      actions: [{ label: 'Cancelar' }, { label: 'Guardar', primary: true, onClick: m => { try { fn(m.querySelector('#askV').value); CAF.toast('Hecho', 'ok'); CAF.App.refresh(); } catch (x) { CAF.toast(x.message, 'err'); return false; } } }] });
  }
  function confirmAct(text, fn) {
    CAF.modal({ title: 'Confirmar', body: `<p>${text}</p>`, actions: [{ label: 'Cancelar' }, { label: 'Sí, continuar', danger: true, onClick: () => { try { fn(); CAF.toast('Hecho', 'ok'); CAF.App.refresh(); } catch (x) { CAF.toast(x.message, 'err'); } } }] });
  }

  CAF.Admin = { view };
})();
