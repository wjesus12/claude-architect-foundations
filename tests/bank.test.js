/* Banco de preguntas: cobertura, bilingüismo, estructura y ensamblado de simulacros. */
const fs = require('fs');
global.window = global; global.document = { addEventListener() {}, getElementById() { return null; } }; global.CAF = {};
const load = f => eval(fs.readFileSync(f, 'utf8'));
load('js/content/blueprint.js'); load('js/ui.js'); load('js/i18n.js'); load('js/exam.js');
for (let n = 1; n <= 6; n++) load(`js/content/bank-s${n}.js`);
const B = CAF.BANK, errors = [];
const bil = (o, w) => { if (!o) return errors.push(w + ': vacío'); for (const k of ['en', 'es']) if (!o[k] || !String(o[k]).trim()) errors.push(`${w}: falta ${k}`); };
const want = { total: 200, s: { 1: 32, 2: 33, 3: 35, 4: 35, 5: 37, 6: 28 }, d: { 1: 54, 2: 36, 3: 40, 4: 40, 5: 30 } };
const byS = {}, byD = {};
if (B.length !== want.total) errors.push('total ' + B.length);
if (new Set(B.map(q => q.id)).size !== B.length) errors.push('ids duplicados');
let longest = 0, multi = 0; const giveaway = [];
B.forEach(q => {
  byS[q.s] = (byS[q.s] || 0) + 1; byD[q.d] = (byD[q.d] || 0) + 1;
  if (q.id.includes('-')) errors.push(q.id + ': id con guion');
  const ts = CAF.findTS(q.ts); if (!ts || ts.domain !== q.d) errors.push(`${q.id}: ts ${q.ts} no es del dominio ${q.d}`);
  if (!CAF.SCENARIOS.find(s => s.id === q.s)) errors.push(q.id + ': escenario');
  if (!['basic', 'mid', 'hard'].includes(q.lv)) errors.push(q.id + ': nivel');
  if (q.pat && !CAF.PATTERNS[q.pat]) errors.push(q.id + ': patrón ' + q.pat);
  bil(q.q, q.id + '.q');
  const ok = q.o.filter(o => o.ok).length;
  if (ok === 1 && q.o.length !== 4) errors.push(`${q.id}: ${q.o.length} opciones (simple)`);
  if (ok === 2) { multi++; if (q.o.length !== 5) errors.push(`${q.id}: ${q.o.length} opciones (múltiple)`); if (!/TWO|DOS/.test(q.q.en + q.q.es)) errors.push(q.id + ': múltiple sin "TWO"'); }
  if (ok < 1 || ok > 2) errors.push(`${q.id}: ${ok} correctas`);
  q.o.forEach((o, i) => { bil(o.t, `${q.id}.o${i}`); bil(o.w, `${q.id}.w${i}`); });
  if (ok === 1 && !q.official) { const L = q.o.map(o => o.t.en.length), c = q.o.findIndex(o => o.ok); const rest = Math.max(...L.filter((_, i) => i !== c)); if (L[c] > rest * 1.15) { longest++; giveaway.push(q.id); } }
});
for (const k in want.s) if (byS[k] !== want.s[k]) errors.push(`S${k}: ${byS[k]} (esperado ${want.s[k]})`);
for (const k in want.d) if (byD[k] !== want.d[k]) errors.push(`D${k}: ${byD[k]} (esperado ${want.d[k]})`);
const off = B.filter(q => q.official);
if (off.length !== 12) errors.push('oficiales ' + off.length);
/* ensamblado */
for (const f of ['A', 'B', 'C', 'R']) {
  const { scenarios, items } = CAF.Exam.assembleExam(f);
  if (scenarios.length !== 4) errors.push(`forma ${f}: ${scenarios.length} escenarios`);
  if (items.length !== 60) errors.push(`forma ${f}: ${items.length} ítems`);
  if (new Set(items.map(i => i.id)).size !== items.length) errors.push(`forma ${f}: ítems repetidos`);
}
const A1 = CAF.Exam.assembleExam('A').items.map(i => i.id).join(), A2 = CAF.Exam.assembleExam('A').items.map(i => i.id).join();
if (A1 !== A2) errors.push('forma A no es determinista');
if (errors.length) { console.log(errors.slice(0, 50).join('\n')); process.exit(1); }
const single = B.length - multi;
console.log(`OK banco (${B.length}: ${Object.entries(byS).map(([s, n]) => 'S' + s + ' ' + n).join(' · ')} | ${Object.entries(byD).map(([d, n]) => 'D' + d + ' ' + n).join(' · ')} | oficiales ${off.length} · múltiples ${multi}) · correcta notablemente más larga (>15 %) en ${longest}/${single} (${Math.round(100 * longest / single)} %)`);
if (longest / single > 0.15) { console.log('Demasiadas respuestas delatadas por su longitud:', giveaway.join(' ')); process.exit(1); }
