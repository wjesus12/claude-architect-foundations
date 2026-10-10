/* Flashcards: 150, reparto por peso, bilingües, cobertura de los 30 task statements, y SM-2. */
const fs = require('fs');
global.window = global; global.document = { addEventListener() {} }; global.CAF = {};
eval(fs.readFileSync('js/content/blueprint.js', 'utf8'));
eval(fs.readFileSync('js/content/flashcards.js', 'utf8'));
eval(fs.readFileSync('js/flash.js', 'utf8'));
const c = CAF.FLASHCARDS, by = {}, errors = [];
c.forEach(x => {
  by[x.domain] = (by[x.domain] || 0) + 1;
  const ts = CAF.findTS(x.ts);
  if (!ts || ts.domain !== x.domain) errors.push(x.id + ': task statement');
  for (const f of ['front', 'back']) for (const k of ['en', 'es']) if (!x[f][k] || !x[f][k].trim()) errors.push(`${x.id}: ${f}.${k}`);
});
if (c.length !== 150) errors.push('total ' + c.length);
const want = { 1: 40, 2: 28, 3: 30, 4: 30, 5: 22 };
for (const d in want) if (by[d] !== want[d]) errors.push(`D${d}: ${by[d]} (esperado ${want[d]})`);
if (new Set(c.map(x => x.id)).size !== c.length) errors.push('ids duplicados');
const cov = new Set(c.map(x => x.ts));
CAF.allTS().forEach(t => { if (!cov.has(t.id)) errors.push('sin tarjeta: ' + t.id); });
/* SM-2 */
const s = CAF.Flash.schedule;
let st = s(undefined, 4, 0); if (st.iv !== 1) errors.push('sm2 good#1');
st = s(st, 4, 0); if (st.iv !== 6) errors.push('sm2 good#2');
st = s(st, 1, 0); if (st.reps !== 0 || st.due !== 600000) errors.push('sm2 again');
let e = s(undefined, 1, 0); for (let i = 0; i < 12; i++) e = s(e, 1, 0); if (e.ef !== 1.3) errors.push('sm2 ef floor');
if (errors.length) { console.log(errors.join('\n')); process.exit(1); }
console.log(`OK flashcards (${c.length}, ${cov.size}/30 task statements, SM-2)`);
