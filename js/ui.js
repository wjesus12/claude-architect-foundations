/* Utilidades de interfaz: toasts, modal, selector de idioma, efectos. */
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  function toast(msg, kind = 'info', ms = 3200) {
    const box = $('#toasts');
    if (!box) return;
    const el = document.createElement('div');
    el.className = `toast toast--${kind}`;
    el.innerHTML = `<span class="toast__k">${kind === 'ok' ? '✓' : kind === 'err' ? '✗' : kind === 'badge' ? '◆' : '●'}</span><span>${msg}</span>`;
    box.appendChild(el);
    setTimeout(() => el.classList.add('is-out'), ms);
    setTimeout(() => el.remove(), ms + 400);
  }

  /* Modal simple con foco atrapado */
  function modal({ title, body, actions = [], wide = false }) {
    const wrap = document.createElement('div');
    wrap.className = 'modal';
    wrap.innerHTML = `<div class="modal__card ${wide ? 'modal__card--wide' : ''}" role="dialog" aria-modal="true" aria-label="${CAF.esc(title)}">
        <div class="modal__head"><span class="modal__title">${title}</span><button class="iconbtn" data-x aria-label="Cerrar">✕</button></div>
        <div class="modal__body">${body}</div>
        <div class="modal__foot">${actions.map((a, i) => `<button class="btn ${a.primary ? 'btn--primary' : a.danger ? 'btn--danger' : ''}" data-a="${i}">${a.label}</button>`).join('')}</div>
      </div>`;
    const prev = document.activeElement;
    const close = () => { wrap.remove(); prev && prev.focus && prev.focus(); };
    wrap.addEventListener('click', e => {
      if (e.target === wrap || e.target.closest('[data-x]')) return close();
      const b = e.target.closest('[data-a]');
      if (b) { const a = actions[b.dataset.a]; if (!a.onClick || a.onClick(wrap) !== false) close(); }
    });
    wrap.addEventListener('keydown', e => {
      if (e.key === 'Escape') close();
      if (e.key === 'Enter' && e.target.matches('input')) { e.preventDefault(); wrap.querySelector('.modal__foot .btn--primary, .modal__foot .btn--danger')?.click(); }
    });
    document.body.appendChild(wrap);
    const f = wrap.querySelector('.modal__body input, .modal__body select, .modal__body textarea') || wrap.querySelector('.modal__foot .btn--primary, .modal__foot .btn');
    CAF.Term && CAF.Term.setOpen(false);
    requestAnimationFrame(() => f && f.focus());
    return { el: wrap, close };
  }

  /* Selector de modo de idioma: aparece en TODO entrenamiento */
  function langPicker(current, name = 'lang') {
    return `<div class="langpick" role="radiogroup" aria-label="Idioma de las preguntas">
      ${Object.values(CAF.MODES).map(m => `
        <label class="langpick__opt ${current === m.id ? 'is-on' : ''}">
          <input type="radio" name="${name}" value="${m.id}" ${current === m.id ? 'checked' : ''}>
          <span class="langpick__code">${m.short}</span>
          <span class="langpick__lbl">${m.id === 'en' ? 'Como el examen' : m.id === 'es' ? 'Concepto' : 'Puente EN↔ES'}</span>
        </label>`).join('')}
    </div>`;
  }
  function bindLangPicker(root, onChange) {
    root.addEventListener('change', e => {
      if (!e.target.matches('.langpick input')) return;
      $$('.langpick__opt', e.target.closest('.langpick')).forEach(l => l.classList.toggle('is-on', l.contains(e.target)));
      onChange && onChange(e.target.value);
    });
  }

  /* Confeti pixelado (cuadritos naranja/crema) */
  function confetti(n = 60) {
    if (CAF.Store.current()?.prefs.motion === false) return;
    const layer = document.createElement('div');
    layer.className = 'confetti';
    const colors = ['var(--clay)', 'var(--clay-hi)', 'var(--ok)', 'var(--warn)', 'var(--ink)'];
    for (let i = 0; i < n; i++) {
      const p = document.createElement('i');
      p.style.left = Math.random() * 100 + 'vw';
      p.style.background = colors[i % colors.length];
      p.style.setProperty('--dx', (Math.random() * 160 - 80) + 'px');
      p.style.setProperty('--r', (Math.random() * 720 - 360) + 'deg');
      p.style.animationDelay = (Math.random() * .5) + 's';
      p.style.animationDuration = (1.6 + Math.random() * 1.4) + 's';
      layer.appendChild(p);
    }
    document.body.appendChild(layer);
    setTimeout(() => layer.remove(), 3600);
  }

  /* Máquina de escribir para líneas de terminal */
  function type(el, text, speed = 18) {
    return new Promise(res => {
      if (CAF.Store.current()?.prefs.motion === false) { el.textContent = text; return res(); }
      let i = 0;
      const tick = () => {
        el.textContent = text.slice(0, ++i);
        if (i < text.length) el._tt = setTimeout(tick, speed + (text[i - 1] === ' ' ? 10 : 0));
        else res();
      };
      clearTimeout(el._tt);
      tick();
    });
  }

  function countUp(el, to, ms = 900) {
    const from = 0, t0 = performance.now();
    const step = t => {
      const k = Math.min(1, (t - t0) / ms);
      el.textContent = Math.round(from + (to - from) * (1 - Math.pow(1 - k, 3))).toLocaleString('es-PE');
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  function download(name, text, type = 'application/json') {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], { type }));
    a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }
  function pickFile(accept = '.json') {
    return new Promise(res => {
      const i = document.createElement('input');
      i.type = 'file'; i.accept = accept;
      i.onchange = () => { const f = i.files[0]; if (!f) return res(null); const r = new FileReader(); r.onload = () => res(r.result); r.readAsText(f); };
      i.click();
    });
  }

  /* Barajado uniforme (Fisher–Yates). sort(random) sesga la opción A. */
  function shuffle(arr, rnd = Math.random) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }
  function seeded(seed) {
    let s = seed >>> 0 || 1;
    return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  }

  const ago = t => {
    if (!t) return 'nunca';
    const m = Math.round((Date.now() - t) / 60000);
    if (m < 1) return 'ahora';
    if (m < 60) return `hace ${m} min`;
    const h = Math.round(m / 60);
    if (h < 24) return `hace ${h} h`;
    return `hace ${Math.round(h / 24)} d`;
  };

  Object.assign(CAF, { $, $$, toast, modal, langPicker, bindLangPicker, confetti, type, countUp, download, pickFile, shuffle, seeded, ago });
})();
