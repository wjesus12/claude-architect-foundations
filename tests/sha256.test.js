const fs = require('fs'), crypto = require('crypto');
global.window = global; global.CAF = {};
eval(fs.readFileSync('js/sha256.js', 'utf8'));
const bad = ['', 'abc', 'contraseña ñ', 'x'.repeat(55), 'x'.repeat(56), 'y'.repeat(200)]
  .filter(s => CAF.sha256(s) !== crypto.createHash('sha256').update(s).digest('hex'));
if (bad.length) { console.log('sha256 falla en', bad); process.exit(1); }
console.log('OK sha256');
