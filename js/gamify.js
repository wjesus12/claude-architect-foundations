/* XP, niveles, rachas e insignias. Emite eventos que la mascota y la terminal escuchan. */
(function () {
  const LEVELS = [
    { xp: 0,     name: 'Prompt Apprentice',   es: 'Aprendiz de prompts' },
    { xp: 300,   name: 'Tool Caller',         es: 'Invocador de tools' },
    { xp: 900,   name: 'Loop Engineer',       es: 'Ingeniero de bucles' },
    { xp: 2000,  name: 'Context Keeper',      es: 'Guardián del contexto' },
    { xp: 3800,  name: 'Orchestrator',        es: 'Orquestador' },
    { xp: 6500,  name: 'Architect',           es: 'Arquitecto' },
    { xp: 10000, name: 'Principal Architect', es: 'Arquitecto principal' }
  ];

  const XP = { answerOk: 15, answerBad: 3, lesson: 60, lab: 50, arch: 80, card: 4, examPass: 400, examTake: 120, streakDay: 25 };

  /* Insignias con forma de «commit»: hash corto + mensaje */
  const BADGES = [
    { id: 'init',       hash: 'a1f0c3e', icon: '◆', en: 'git init', es: 'Primer inicio de sesión', test: () => true },
    { id: 'first-ok',   hash: 'b7d21e9', icon: '✓', en: 'first green check', es: 'Primera respuesta correcta', test: p => tot(p).ok >= 1 },
    { id: 'fifty',      hash: 'c03aa41', icon: '⁵⁰', en: '50 answers committed', es: '50 preguntas respondidas', test: p => tot(p).n >= 50 },
    { id: 'two-hundred',hash: 'c9e4f02', icon: '²⁰⁰', en: 'full bank sweep', es: '200 preguntas respondidas', test: p => tot(p).n >= 200 },
    { id: 'english',    hash: 'e11e5e7', icon: 'EN', en: 'thinks in English', es: '25 aciertos en modo inglés', test: p => p.langStats.en.ok >= 25 },
    { id: 'bridge',     hash: 'b1d9e00', icon: '⇄', en: 'language bridge', es: '25 aciertos en modo híbrido', test: p => p.langStats.bi.ok >= 25 },
    { id: 'gap-closed', hash: '9a9c105', icon: '≈', en: 'gap closed', es: 'Precisión en inglés a ≤5 pts del español (mín. 30 en cada uno)', test: p => gapClosed(p) },
    { id: 'lesson-5',   hash: 'd5e7a10', icon: '§', en: 'reads the docs', es: '5 lecciones completadas', test: p => done(p) >= 5 },
    { id: 'lesson-all', hash: 'f00d31e', icon: '§§', en: 'blueprint covered', es: 'Las 32 lecciones completadas', test: p => done(p) >= 32 },
    { id: 'academy-1',  hash: 'ac4d001', icon: '✦', en: 'hello, Claude', es: 'Primer módulo de «desde cero» completado', test: p => acad(p) >= 1 },
    { id: 'academy-half',hash:'ac4d050', icon: '◐', en: 'halfway there', es: 'Mitad de la ruta «desde cero»', test: p => CAF.academyIds && acad(p) >= Math.ceil(CAF.academyIds().length / 2) },
    { id: 'academy-all',hash: 'ac4d100', icon: '●', en: 'from zero to architect', es: 'Ruta «desde cero» completa', test: p => CAF.academyIds && CAF.academyIds().length > 0 && acad(p) >= CAF.academyIds().length },
    { id: 'exam-1',     hash: '0e1a2b3', icon: '⏱', en: 'first mock exam', es: 'Primer simulacro completo', test: p => p.exams.length >= 1 },
    { id: 'exam-pass',  hash: '7200000', icon: '720', en: 'cut score cleared', es: 'Simulacro aprobado (≥720)', test: p => p.exams.some(e => e.scaled >= 720) },
    { id: 'exam-pass-en',hash:'72e0e11', icon: '★', en: 'passed in English', es: 'Simulacro aprobado en modo inglés', test: p => p.exams.some(e => e.scaled >= 720 && e.mode === 'en') },
    { id: 'lab-5',      hash: 'deb0605', icon: '⚑', en: 'bug hunter', es: '5 labs de diagnóstico resueltos', test: p => okCount(p.labs) >= 5 },
    { id: 'arch-3',     hash: 'a4c41ec', icon: '⬡', en: 'draws the system', es: '3 retos de arquitectura resueltos', test: p => okCount(p.arch) >= 3 },
    { id: 'cards-50',   hash: 'ca4d550', icon: '▦', en: 'spaced repetition', es: '50 flashcards repasadas', test: p => Object.keys(p.srs).length >= 50 },
    { id: 'streak-3',   hash: '3d4ys00', icon: '🔥', en: '3-day streak', es: 'Racha de 3 días', test: p => p.streak.best >= 3 },
    { id: 'streak-7',   hash: '7d4ys00', icon: '🔥', en: '7-day streak', es: 'Racha de 7 días', test: p => p.streak.best >= 7 },
    { id: 'all-domains',hash: 'd0m41n5', icon: '⬢', en: 'every domain ≥70%', es: 'Los 5 dominios con ≥70 % (mín. 15 preguntas c/u)', test: p => [1,2,3,4,5].every(d => p.domainStats[d].n >= 15 && p.domainStats[d].ok / p.domainStats[d].n >= .7) }
  ];

  const tot = p => Object.values(p.langStats).reduce((a, s) => ({ n: a.n + s.n, ok: a.ok + s.ok }), { n: 0, ok: 0 });
  const done = p => CAF.lessonIds().filter(id => p.lessons[id]?.done).length;
  const acad = p => (CAF.academyIds ? CAF.academyIds() : []).filter(id => p.lessons[id]?.done).length;
  const okCount = o => Object.values(o).filter(x => x.ok).length;
  const pct = s => s.n ? Math.round(100 * s.ok / s.n) : null;
  function gapClosed(p) {
    const en = p.langStats.en, es = p.langStats.es;
    return en.n >= 30 && es.n >= 30 && (pct(es) - pct(en)) <= 5;
  }

  const listeners = {};
  const on = (ev, fn) => (listeners[ev] = listeners[ev] || []).push(fn);
  const emit = (ev, data) => (listeners[ev] || []).forEach(fn => { try { fn(data); } catch (e) { console.error(e); } });

  const today = () => new Date().toISOString().slice(0, 10);

  function level(xp) {
    let i = 0;
    while (i + 1 < LEVELS.length && xp >= LEVELS[i + 1].xp) i++;
    const cur = LEVELS[i], next = LEVELS[i + 1];
    return { index: i, ...cur, next, into: xp - cur.xp, span: next ? next.xp - cur.xp : 1, pct: next ? (xp - cur.xp) / (next.xp - cur.xp) : 1 };
  }

  function log(p, text, kind = 'info') {
    p.events.unshift({ t: Date.now(), text, kind });
    p.events.length = Math.min(p.events.length, 60);
  }

  function touchStreak(p) {
    const d = today();
    if (p.streak.last === d) return false;
    const y = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
    p.streak.count = p.streak.last === y ? p.streak.count + 1 : 1;
    p.streak.best = Math.max(p.streak.best, p.streak.count);
    p.streak.last = d;
    return true;
  }

  function award(amount, reason) {
    const p = CAF.Store.P();
    if (!CAF.Store.current()) return;
    const before = level(p.xp).index;
    if (touchStreak(p)) { p.xp += XP.streakDay; log(p, `racha +1 → ${p.streak.count} día(s)`, 'streak'); emit('streak', p.streak.count); }
    p.xp += amount;
    p.days[today()] = (p.days[today()] || 0) + amount;
    if (reason) log(p, `+${amount} xp · ${reason}`, 'xp');
    const after = level(p.xp);
    if (after.index > before) { log(p, `nivel ↑ ${after.name}`, 'level'); emit('levelup', after); }
    checkBadges(p);
    CAF.Store.commit();
    emit('xp', { amount, reason, xp: p.xp });
  }

  function checkBadges(p) {
    for (const b of BADGES) {
      if (!p.badges[b.id] && b.test(p)) {
        p.badges[b.id] = Date.now();
        log(p, `commit ${b.hash} · ${b.en}`, 'badge');
        emit('badge', b);
      }
    }
  }

  /* Registro común de una respuesta (simulacro, práctica, mini-quiz) */
  function recordAnswer({ qid, domain, ok, mode, silentXP }) {
    const p = CAF.Store.P();
    const a = p.answers[qid] || { n: 0, ok: 0 };
    a.n++; if (ok) a.ok++; a.last = ok; a.mode = mode; a.at = Date.now();
    p.answers[qid] = a;
    const ls = p.langStats[mode] || (p.langStats[mode] = { n: 0, ok: 0 });
    ls.n++; if (ok) ls.ok++;
    if (domain && p.domainStats[domain]) { p.domainStats[domain].n++; if (ok) p.domainStats[domain].ok++; }
    if (!silentXP) award(ok ? XP.answerOk : XP.answerBad, ok ? 'respuesta correcta' : 'intento');
    else { checkBadges(p); CAF.Store.commit(); }
    emit(ok ? 'correct' : 'wrong', { qid });
  }

  /* Puntuación estimada en la escala del examen (100–1000) a partir de los dominios */
  function readiness(p) {
    let w = 0, acc = 0;
    for (const d of CAF.DOMAINS) {
      const s = p.domainStats[d.id];
      if (s.n >= 3) { acc += d.weight * (s.ok / s.n); w += d.weight; }
    }
    if (!w) return null;
    const ratio = acc / w;
    return Math.round(100 + 900 * ratio);
  }

  function boot() {
    const p = CAF.Store.P();
    if (!CAF.Store.current()) return;
    if (touchStreak(p)) { p.xp += XP.streakDay; log(p, `racha → ${p.streak.count} día(s)`, 'streak'); }
    checkBadges(p);
    CAF.Store.commit();
  }

  CAF.G = { LEVELS, XP, BADGES, level, award, recordAnswer, readiness, on, emit, boot, pct, tot, done, acad, log };
})();
