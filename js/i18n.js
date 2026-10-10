/* Modos de idioma del contenido de entrenamiento.
   en = como el examen real · es = dominar el concepto · bi = inglés + traducción debajo
   La interfaz (menús) va en español; el CONTENIDO sigue el modo elegido. */
(function () {
  const MODES = {
    en: { id: 'en', label: 'English', short: 'EN', tag: 'exam mode', es: 'Inglés (como el examen)' },
    es: { id: 'es', label: 'Español', short: 'ES', tag: 'concepto', es: 'Español' },
    bi: { id: 'bi', label: 'Híbrido', short: 'EN+ES', tag: 'puente', es: 'Híbrido (inglés + español)' }
  };

  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* Formato ligero dentro del contenido: `código` y **negrita** */
  const fmt = s => esc(s)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

  function pick(obj, lang) {
    if (obj == null) return '';
    if (typeof obj === 'string') return obj;
    return obj[lang] ?? obj.en ?? obj.es ?? '';
  }

  /* Texto en línea (títulos, opciones cortas) */
  function L(obj, mode) {
    mode = mode || CAF.lang();
    if (typeof obj === 'string') return fmt(obj);
    if (mode === 'bi') {
      const en = pick(obj, 'en'), es = pick(obj, 'es');
      if (en === es) return fmt(en);
      return `<span class="bi"><span class="bi__en" lang="en">${fmt(en)}</span><span class="bi__es" lang="es">${fmt(es)}</span></span>`;
    }
    return `<span lang="${mode}">${fmt(pick(obj, mode))}</span>`;
  }

  /* Bloque (párrafos, enunciados, explicaciones) */
  function LB(obj, mode, tag = 'p') {
    mode = mode || CAF.lang();
    if (typeof obj === 'string') return `<${tag}>${fmt(obj)}</${tag}>`;
    if (mode === 'bi') {
      const en = pick(obj, 'en'), es = pick(obj, 'es');
      return `<div class="biblock"><${tag} class="biblock__en" lang="en">${fmt(en)}</${tag}><${tag} class="biblock__es" lang="es"><span class="biblock__flag">ES</span>${fmt(es)}</${tag}></div>`;
    }
    return `<${tag} lang="${mode}">${fmt(pick(obj, mode))}</${tag}>`;
  }

  /* Texto plano (para atributos, terminal, aria) */
  function T(obj, mode) {
    mode = mode || CAF.lang();
    if (mode === 'bi') {
      const en = pick(obj, 'en'), es = pick(obj, 'es');
      return en === es ? en : `${en} · ${es}`;
    }
    return pick(obj, mode);
  }

  /* Interfaz de las pantallas de examen: en modo EN la cromática también va en inglés,
     igual que en Pearson VUE. */
  const EXAM_UI = {
    question: { en: 'Question', es: 'Pregunta' },
    of: { en: 'of', es: 'de' },
    next: { en: 'Next', es: 'Siguiente' },
    prev: { en: 'Previous', es: 'Anterior' },
    flag: { en: 'Flag for review', es: 'Marcar para revisar' },
    finish: { en: 'End exam', es: 'Terminar examen' },
    choose: { en: 'Choose', es: 'Elige' },
    chooseOne: { en: 'Choose one answer.', es: 'Elige una respuesta.' },
    chooseN: { en: 'Choose {n} answers.', es: 'Elige {n} respuestas.' },
    time: { en: 'Time remaining', es: 'Tiempo restante' },
    scenario: { en: 'Scenario', es: 'Escenario' },
    correct: { en: 'Correct', es: 'Correcta' },
    incorrect: { en: 'Incorrect', es: 'Incorrecta' },
    why: { en: 'Why', es: 'Por qué' },
    pass: { en: 'PASS', es: 'APROBADO' },
    fail: { en: 'FAIL', es: 'NO APROBADO' }
  };
  function UI(key, mode, vars) {
    mode = mode || CAF.lang();
    let s = EXAM_UI[key] ? (mode === 'en' ? EXAM_UI[key].en : mode === 'es' ? EXAM_UI[key].es : `${EXAM_UI[key].en} · ${EXAM_UI[key].es}`) : key;
    if (vars) for (const k in vars) s = s.split(`{${k}}`).join(vars[k]);
    return s;
  }

  Object.assign(CAF, { MODES, esc, fmt, pick, L, LB, T, UI });
})();
