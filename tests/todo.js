/* Ejecuta todas las pruebas: node tests/todo.js */
const { execSync } = require('child_process');
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
process.chdir(root);
let fail = 0;
const js = [...fs.readdirSync('js').filter(f => f.endsWith('.js')).map(f => 'js/' + f),
            ...fs.readdirSync('js/content').filter(f => f.endsWith('.js')).map(f => 'js/content/' + f)];
for (const f of js) { try { execSync(`node --check ${f}`, { stdio: 'pipe' }); } catch (e) { fail++; console.log('SINTAXIS', f, e.stderr.toString()); } }
console.log(`OK sintaxis (${js.length} archivos)`);
for (const t of fs.readdirSync('tests').filter(f => f.endsWith('.test.js'))) {
  try { process.stdout.write(execSync(`node tests/${t}`, { stdio: 'pipe' }).toString()); }
  catch (e) { fail++; console.log('FALLA', t, '\n' + e.stdout.toString() + e.stderr.toString()); }
}
console.log(fail ? `\n${fail} prueba(s) fallaron` : '\nTodo en verde');
process.exit(fail ? 1 : 0);
