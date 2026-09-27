/* Hook de módulos para ejecutar el validador compilado: resuelve el alias '@/'
   a archivos .js dentro de .tmp-validar. Uso:
   node scripts/ejecutar-validador.cjs */
const path = require('node:path');
const Module = require('node:module');

const COMPILED = path.join(__dirname, '..', '.tmp-validar');
const origResolve = Module._resolveFilename;

Module._resolveFilename = function (request, ...args) {
  if (request.startsWith('@/')) {
    request = path.join(COMPILED, request.slice(2));
  }
  return origResolve.call(this, request, ...args);
};

require(path.join(COMPILED, 'scripts', 'validar-arboles.js'));
