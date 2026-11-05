/* Hook de módulos para ejecutar el validador compilado: resuelve el alias '@/'
   a archivos .js dentro de .tmp-validar. Uso:
   node scripts/ejecutar-validador.cjs */
const path = require('node:path');
const fs = require('node:fs');
const { execSync } = require('node:child_process');
const Module = require('node:module');

const APP_DIR = path.join(__dirname, '..');
const COMPILED = path.join(APP_DIR, '.tmp-validar');
const TARGET_SCRIPT = path.join(COMPILED, 'scripts', 'validar-arboles.js');

if (!fs.existsSync(TARGET_SCRIPT)) {
  execSync('npx tsc -p tsconfig.validar.json', { cwd: APP_DIR, stdio: 'inherit' });
}

const origResolve = Module._resolveFilename;

Module._resolveFilename = function (request, ...args) {
  if (request.startsWith('@/')) {
    request = path.join(COMPILED, request.slice(2));
  }
  return origResolve.call(this, request, ...args);
};

require(TARGET_SCRIPT);
