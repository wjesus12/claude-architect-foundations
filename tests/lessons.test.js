/* Valida el contenido de las lecciones: cobertura, bilingüismo y quizzes. */
const fs = require('fs');
global.window = global;
global.CAF = {};
const load = f => eval(fs.readFileSync(f, 'utf8'));
load('js/content/blueprint.js');
const REG = {};
CAF.addLessons = arr => arr.forEach(l => { if (REG[l.id]) throw new Error('duplicada ' + l.id); REG[l.id] = l; });
['intro', 'd1', 'd2', 'd3', 'd4', 'd5'].forEach(n => load(`js/content/lessons-${n}.js`));
load('js/content/academy-parts.js');
'abcdefgh'.split('').forEach(n => load(`js/content/academy-${n}.js`));
load('js/content/glossary.js');

let errors = [], words = { en: 0, es: 0 };
const bil = (o, where) => {
  if (o == null) return errors.push(`${where}: vacío`);
  if (typeof o === 'string') return;
  for (const k of ['en', 'es']) {
    if (!o[k] || !String(o[k]).trim()) errors.push(`${where}: falta ${k}`);
    else words[k] += String(o[k]).split(/\s+/).length;
  }
};
const acad = Array.from({ length: 26 }, (_, i) => 'a' + String(i + 1).padStart(2, '0'));
const expected = ['0', 'en', ...CAF.allTS().map(t => t.id), ...acad];
const inParts = CAF.ACADEMY.flatMap(p => p.modules);
if (inParts.join() !== acad.join()) errors.push('CAF.ACADEMY no lista a01…a26 en orden: ' + inParts.join());
CAF.ACADEMY.forEach(p => { bil(p.title, 'parte ' + p.letter); bil(p.blurb, 'parte ' + p.letter + '.blurb'); });
for (const id of expected) if (!REG[id]) errors.push('falta la lección ' + id);
let quizzes = 0;
for (const l of Object.values(REG)) {
  const w = 'L' + l.id;
  if (l.track === 'academy') {
    if (!acad.includes(l.id)) errors.push(w + ': id de academia inesperado');
    (l.exam || []).forEach(x => { if (!expected.slice(0, 32).includes(x)) errors.push(w + ': enlace a examen inexistente ' + x); });
    (l.docs || []).forEach((d, i) => { if (!d || !d.url || !d.label) errors.push(w + '.docs' + i + ' incompleto'); });
  } else if (l.id !== '0' && l.id !== 'en') {
    const ts = CAF.findTS(l.id);
    if (!ts) errors.push(w + ': no es un task statement');
    else if (ts.domain !== l.domain) errors.push(w + ': dominio incorrecto');
  }
  if (l.title) bil(l.title, w + '.title');
  bil(l.summary, w + '.summary');
  (l.objectives || []).forEach((o, i) => bil(o, `${w}.obj${i}`));
  l.blocks.forEach((b, i) => {
    const bw = `${w}.b${i}(${b.type})`;
    if (['p', 'h', 'trap', 'note'].includes(b.type)) bil(b.text, bw);
    if (['list', 'steps'].includes(b.type)) b.items.forEach((x, j) => bil(x, bw + j));
    if (b.type === 'compare') { bil(b.bad.title, bw); bil(b.good.title, bw); [...b.bad.items, ...b.good.items].forEach((x, j) => bil(x, bw + j)); }
    if (b.type === 'terms') b.items.forEach((x, j) => bil(x, bw + j));
    if (b.type === 'table') { b.head.forEach((x, j) => bil(x, bw + 'h' + j)); b.rows.forEach((r, j) => { if (r.length !== b.head.length) errors.push(bw + ' fila ' + j + ' columnas'); r.forEach((c, k) => bil(c, bw + 'r' + j + k)); }); }
    if (b.type === 'example') { bil(b.situation, bw); bil(b.answer, bw); }
    if (b.type === 'code' && !b.code.trim()) errors.push(bw + ' código vacío');
    if (b.type === 'code' && b.caption) bil(b.caption, bw + '.cap');
  });
  if (!l.quiz || l.quiz.length < 2) errors.push(w + ': quiz con menos de 2 preguntas');
  (l.quiz || []).forEach((q, i) => {
    quizzes++;
    bil(q.q, `${w}.q${i}`);
    if (q.options.length !== 4) errors.push(`${w}.q${i}: ${q.options.length} opciones`);
    const ok = q.options.filter(o => o.ok).length;
    if (ok !== 1) errors.push(`${w}.q${i}: ${ok} correctas`);
    q.options.forEach((o, j) => { bil(o.t, `${w}.q${i}.o${j}`); bil(o.why, `${w}.q${i}.why${j}`); });
  });
}
let give = 0; Object.values(REG).forEach(l => (l.quiz || []).forEach(q => { const L = q.options.map(o => o.t.en.length), c = q.options.findIndex(o => o.ok), r = Math.max(...L.filter((_, i) => i !== c)); if (L[c] > r * 1.15) give++; }));
if (give / quizzes > 0.15) errors.push(`sesgo de longitud en quizzes: ${give}/${quizzes}`);
const cats = CAF.GLOSSARY_CATS, terms = new Set();
CAF.GLOSSARY.forEach(g => {
  if (terms.has(g.term.toLowerCase())) errors.push('glosario duplicado ' + g.term); terms.add(g.term.toLowerCase());
  if (!cats[g.cat]) errors.push('glosario ' + g.term + ': categoría ' + g.cat);
  if (!g.en || !g.es) errors.push('glosario ' + g.term + ': falta en/es');
  if (g.mod && !REG[g.mod]) errors.push('glosario ' + g.term + ': módulo ' + g.mod + ' inexistente');
});
if (CAF.GLOSSARY.length < 100) errors.push('glosario con menos de 100 términos');
console.log(`academia: ${acad.filter(id => REG[id]).length}/26 módulos · glosario: ${CAF.GLOSSARY.length} términos`);
console.log(`lecciones: ${Object.keys(REG).length}/${expected.length} · quizzes: ${quizzes} · palabras EN ${words.en} · ES ${words.es} · delatadas por longitud ${give}/${quizzes}`);
if (errors.length) { console.log(errors.slice(0, 40).join('\n')); process.exit(1); }
console.log('OK lecciones');
