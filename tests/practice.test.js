/* Labs y retos de arquitectura: estructura, bilingüismo y coherencia. */
const fs = require('fs');
global.window = global; global.document = { addEventListener() {} }; global.CAF = {};
const load = f => eval(fs.readFileSync(f, 'utf8'));
load('js/content/blueprint.js'); load('js/content/labs.js'); load('js/content/arch.js');
const errors = [];
const bil = (o, w) => { if (!o) return errors.push(w + ': vacío'); for (const k of ['en', 'es']) if (!o[k] || !String(o[k]).trim()) errors.push(`${w}: falta ${k}`); };
/* labs */
const by = {};
if (CAF.LABS.length !== 25) errors.push('labs: ' + CAF.LABS.length);
if (new Set(CAF.LABS.map(l => l.id)).size !== CAF.LABS.length) errors.push('labs: ids duplicados');
CAF.LABS.forEach(l => {
  const w = l.id; by[l.domain] = (by[l.domain] || 0) + 1;
  const ts = CAF.findTS(l.ts); if (!ts || ts.domain !== l.domain) errors.push(w + ': task statement');
  bil(l.title, w + '.title'); bil(l.context, w + '.context'); bil(l.question, w + '.question'); bil(l.explain, w + '.explain');
  if (l.hint) bil(l.hint, w + '.hint');
  if (!l.lines.length) errors.push(w + ': sin líneas');
  if (!l.bug.length || l.bug.some(i => i < 0 || i >= l.lines.length || !l.lines[i].trim())) errors.push(w + ': índice de bug inválido');
  if (l.options.length !== 4) errors.push(w + ': opciones ' + l.options.length);
  if (l.options.filter(o => o.ok).length !== 1) errors.push(w + ': correctas ≠ 1');
  l.options.forEach((o, i) => { bil(o.t, `${w}.o${i}`); bil(o.why, `${w}.why${i}`); });
  if (!['basic', 'mid', 'hard'].includes(l.level)) errors.push(w + ': nivel');
});
const giveLab = CAF.LABS.filter(l => { const L = l.options.map(o => o.t.en.length), c = l.options.findIndex(o => o.ok), r = Math.max(...L.filter((_, i) => i !== c)); return L[c] > r * 1.15; }).map(l => l.id);
if (giveLab.length / CAF.LABS.length > 0.15) errors.push('sesgo de longitud en labs: ' + giveLab.join(' '));
/* arquitectura */
if (CAF.ARCH.length !== 15) errors.push('arch: ' + CAF.ARCH.length);
CAF.ARCH.forEach(a => {
  const w = a.id, T = CAF.ARCH_NODES;
  bil(a.title, w + '.title'); bil(a.brief, w + '.brief'); bil(a.explain, w + '.explain');
  if (!CAF.findTS(a.ts)) errors.push(w + ': ts');
  a.palette.forEach(t => { if (!T[t]) errors.push(`${w}: tipo desconocido ${t}`); });
  const pal = new Set(a.palette);
  a.need.nodes.forEach(([t]) => { if (!pal.has(t)) errors.push(`${w}: nodo requerido fuera de la paleta ${t}`); if (T[t] && T[t].trap) errors.push(`${w}: requiere un distractor ${t}`); });
  const needT = new Set(a.need.nodes.map(([t]) => t));
  a.need.edges.forEach(([x, y]) => { if (!needT.has(x) || !needT.has(y)) errors.push(`${w}: arista con nodo no requerido ${x}->${y}`); });
  (a.forbid.edges || []).forEach(([x, y]) => { if (a.need.edges.some(([p, q]) => p === x && q === y)) errors.push(`${w}: arista requerida y prohibida ${x}->${y}`); });
  (a.forbid.nodes || []).forEach(t => { if (needT.has(t)) errors.push(`${w}: nodo requerido y prohibido ${t}`); if (!pal.has(t)) errors.push(`${w}: nodo prohibido fuera de la paleta ${t}`); });
});
Object.entries(CAF.ARCH_NODES).forEach(([k, n]) => { if (!n.en || !n.es || !n.g) errors.push('nodo ' + k); });
if (errors.length) { console.log(errors.join('\n')); process.exit(1); }
console.log(`OK labs (${CAF.LABS.length}: ${Object.entries(by).map(([d, n]) => 'D' + d + ' ' + n).join(' · ')}) · OK arquitectura (${CAF.ARCH.length} retos, ${Object.keys(CAF.ARCH_NODES).length} componentes)`);
