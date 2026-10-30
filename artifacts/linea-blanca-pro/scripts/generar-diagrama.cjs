/* Genera docs/diagrama-arboles.html: mapa general (productos → fallas/códigos → árboles)
   y el diagrama de flujo de CADA árbol, tomado de los datos reales de constants/.
   Uso: node scripts/generar-diagrama.cjs   (idempotente; regenera .tmp-validar) */
const { execSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const COMPILED = path.join(ROOT, '.tmp-validar');

// 1) Compilar constantes TS → JS (misma configuración del validador)
execSync('pnpm exec tsc -p tsconfig.validar.json', { cwd: ROOT, stdio: 'inherit' });

// 2) Hook para resolver el alias '@/…' dentro de .tmp-validar
const Module = require('node:module');
const origResolve = Module._resolveFilename;
Module._resolveFilename = function (request, ...args) {
  if (request.startsWith('@/')) request = path.join(COMPILED, request.slice(2));
  // eslint-disable-next-line node/no-deprecated-api
  return origResolve.call(this, request, ...args);
};

// 3) Hook: los arboles exigen `absolutePath` (declarado en .replit-artifact/diagrama-dummy.ts)
Module.prototype.require = (function (origRequire) {
  const TS_TYPES = path.join(ROOT, '.replit-artifact');
  return function (request, ...args) {
    if (request === 'absolutePath') {
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const dummy = path.join(TS_TYPES, 'absolutePath');
        if (fs.existsSync(dummy + '.d.ts')) return { gifUri: '' };
        return { gifUri: '' };
      } catch {
        return { gifUri: '' };
      }
    }
    return origRequire.call(this, request, ...args);
  };
})(Module.prototype.require);

// 3) Logo oficial de Kalley embebido como data URI (docs/kalley-logo.svg)
const KALLEY_LOGO = Buffer.from(
  fs.readFileSync(path.join(ROOT, 'docs', 'kalley-logo.svg'), 'utf8'), 'utf8',
).toString('base64');

// 4) Cargar datos reales
const { DECISION_TREES } = require(path.join(COMPILED, 'constants', 'arboles_index.js'));
const { FALLAS_POR_EQUIPO } = require(path.join(COMPILED, 'constants', 'fallas.js'));
const { TREE_IDS_BY_EQUIPO } = require(path.join(COMPILED, 'constants', 'codigos_arboles.js'));
const { CODE_TREE_IDS } = require(path.join(COMPILED, 'constants', 'aires_arboles.js'));
const { ARBOLES_COMUNES } = require(path.join(COMPILED, 'constants', 'arboles_comunes.js'));
const nevera = require(path.join(COMPILED, 'constants', 'arboles_nevera.js'));
const aires = require(path.join(COMPILED, 'constants', 'aires_arboles.js'));
const lav = require(path.join(COMPILED, 'constants', 'arboles_lavadora.js'));
const lavCodes = require(path.join(COMPILED, 'constants', 'arboles_codigos_lavadora.js'));
const { EQUIPOS } = require(path.join(COMPILED, 'constants', 'equipos.js'));

// ── Paleta y estilo (identidad Línea Blanca Pro) ─────────────────────────────
const M = {
  azul: '#000B8C',        // azul corporativo Kalley (logo)
  azulProf: '#000747',    // sombra profunda del azul
  azulClaro: '#EDEFFF',   // tint suave del azul
  azulMed: '#1A21B8',     // azul hover / medición
  amarillo: '#FFC629',    // amarillo corporativo Kalley (logo)
  amarClaro: '#FFF6D6',
  verde: '#0B8A4E',       // semántico: resultado
  gris: '#373435',        // gris de marca
  texto: '#20222B',
  fondo: '#F2F4FA',
  borde: '#D9DCEF',
};

// ── Familias de secciones ────────────────────────────────────────────────────
const FAMILIAS = [
  { key: 'comunes', title: 'Árboles comunes (todos los productos)', ids: Object.keys(ARBOLES_COMUNES) },
  {
    key: 'refri', title: 'Refrigeración doméstica — nevera, nevecón, minibar, congelador, vitrina',
    ids: ['noenfria', 'noarranque', 'inverter', ...Object.keys(nevera.NEVERA_CODE_TREES)],
  },
  {
    key: 'aire', title: 'Aire acondicionado',
    ids: ['noenfria_aire', ...Object.keys(aires.AIR_ERROR_TREES)],
  },
  {
    key: 'lav_syn', title: 'Lavadora / secadora — síntomas principales',
    ids: ['nocentrifuga', 'nodesagua', 'nollena', 'nolavado', 'noseca', 'errorelectronico_lavadora'],
  },
  {
    key: 'lav_silent', title: 'Lavadora / secadora — fallas silenciosas (Parte II)',
    ids: Object.keys(lav.LAVADORA_SILENT_TREES),
  },
  {
    key: 'lav_cod', title: 'Lavadora / secadora — árboles por código de error',
    ids: Object.keys(lavCodes.CODIGOS_LAVADORA_TREES),
  },
];

// ── Utilidades de escape ─────────────────────────────────────────────────────
const htmlEsc = (s) => String(s)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

// Limpia un texto para usarlo DENTRO de "comillas" de Mermaid (sin " ni | ni saltos).
const merTxt = (s) => String(s)
  .replace(/\s+/g, ' ')
  .replace(/["|]/g, "'")
  .trim();

const shortTxt = (s, n) => {
  const t = merTxt(s);
  return t.length > n ? t.slice(0, n - 1) + '…' : t;
};

// Ordena los nodos de un árbol en BFS desde 'start' (los inalcanzables van al final).
function orderNodes(tree) {
  const seen = new Set();
  const out = [];
  let queue = [tree.start ? 'start' : Object.keys(tree)[0]];
  while (queue.length) {
    const id = queue.shift();
    if (!tree[id] || seen.has(id)) continue;
    seen.add(id);
    out.push(tree[id]);
    if (tree[id].nextId) queue.push(tree[id].nextId);
    for (const o of tree[id].options ?? []) queue.push(o.nextId);
  }
  for (const id of Object.keys(tree)) if (!seen.has(id)) out.push(tree[id]);
  return { nodes: out, count: out.length };
}

// ── Generador Mermaid por árbol ──────────────────────────────────────────────
const CLASS_DEFS = '  classDef qd fill:#EEF1FF,stroke:#000B8C,stroke-width:1.6px,color:#12124B\n' +
  '  classDef md fill:#E4E7FF,stroke:#1A21B8,stroke-width:1.6px,color:#0A0C4A\n' +
  '  classDef ad fill:#FFF8DE,stroke:#B89000,stroke-width:1.4px,color:#4A3800\n' +
  '  classDef ev fill:#F3F3F5,stroke:#373435,stroke-width:1.4px,color:#20222B\n' +
  '  classDef rs fill:#E9F5EE,stroke:#0B8A4E,stroke-width:1.8px,color:#06371F\n' +
  '  classDef gt fill:#FFFBEB,stroke:#B89000,stroke-width:1.4px,stroke-dasharray:5 4,color:#5F4A00\n' +
  '  classDef sm fill:#F4F4F7,stroke:#767B8C,stroke-width:1.2px,color:#33353D\n';

const TYPE_CLASS = { question: 'qd', measure: 'md', action: 'ad', evidence: 'ev', result: 'rs' };

function mermaidTree(treeId, tree) {
  const { nodes, count } = orderNodes(tree);
  const results = nodes.filter((n) => n.type === 'result');
  const gifs = nodes.filter((n) => n.gifUri);
  const lines = [
    `flowchart TD`,
    `%%{init: {"theme":"base","flowchart":{"htmlLabels":true,"curve":"basis","nodeSpacing":40,"rankSpacing":46},"themeVariables":{"fontFamily":"system-ui,Segoe UI,sans-serif","fontSize":"13px","primaryColor":"#EEF1FF","primaryTextColor":"#12124B","lineColor":"#A9AEC4","edgeLabelBackground":"#F2F4FA"}}}%%`,
    CLASS_DEFS,
  ];
  const sharedIds = new Set(Object.keys(nevera.INVERTER_TREE || {}));

  for (const n of nodes) {
    let label;
    if (n.type === 'result') {
      const causes = (n.result && n.result.causes) || [];
      const top = causes[0];
      label = `<b>${shortTxt(n.text, 60)}</b>` +
        `<br/><small>Principal: ${shortTxt(top ? top.cause : '—', 55)} · ${top ? top.probability : '—'}%` +
        ` · ${causes.length} causa${causes.length === 1 ? '' : 's'}</small>`;
    } else {
      label = `<b>${shortTxt(n.text, 78)}</b><br/><small>${n.id}` +
        (n.gifUri ? ' · guía visual' : '') + (n.gate ? ' · auto' : '') + '</small>';
    }
    lines.push(`  ${n.id}["${label}"]`);
  }

  for (const n of nodes) {
    for (const o of n.options ?? []) {
      if (!tree[o.nextId]) continue;
      lines.push(`  ${n.id} -->|"${shortTxt(o.label, 46)}"| ${o.nextId}`);
    }
    if (n.nextId && tree[n.nextId]) lines.push(`  ${n.id} --> ${n.nextId}`);
  }

  const buckets = { qd: [], md: [], ad: [], ev: [], rs: [], gt: [], sm: [] };
  for (const n of nodes) {
    const cls = n.gate ? 'gt' : (TYPE_CLASS[n.type] || 'sm');
    buckets[cls].push(n.id);
  }
  for (const [cls, ids] of Object.entries(buckets)) {
    if (ids.length) lines.push(`  class ${ids.join(',')} ${cls};`);
  }
  // Nodos que llegan por spread del árbol inverter compartido → borde punteado
  const shared = nodes.filter((n) => sharedIds.has(n.id)).map((n) => n.id);
  if (shared.length) {
    lines.push(`  classDef shared stroke-dasharray:3 3,stroke-width:2px;`);
    lines.push(`  class ${shared.join(',')} shared;`);
  }

  return {
    code: lines.join('\n'),
    stats: { pasos: count, resultados: results.length, guias: gifs.length },
  };
}

// ── Mapa general: producto → fallas / códigos → árbol ────────────────────────
const prodLabel = Object.fromEntries(EQUIPOS.map((e) => [e.id, e]));

// Agrupa los códigos de un producto por treeId: "E1, E10 → lav_e1_llenado"
function groupCodes(map) {
  const byTree = new Map();
  for (const [code, treeId] of Object.entries(map || {})) {
    if (!byTree.has(treeId)) byTree.set(treeId, []);
    byTree.get(treeId).push(code);
  }
  return [...byTree.entries()].map(([treeId, codes]) => ({ treeId, codes }));
}

let treeSections = '';
let tocChips = '';
let statsTrees = 0;
let statsNodes = 0;
let statsResults = 0;

for (const fam of FAMILIAS) {
  const ids = fam.ids.filter((id) => DECISION_TREES[id]);
  const missing = fam.ids.filter((id) => !DECISION_TREES[id]);
  if (missing.length) console.warn(`Aviso: árboles no encontrados en el índice: ${missing.join(', ')}`);

  const famCards = [];
  for (const treeId of ids) {
    const tree = DECISION_TREES[treeId];
    const { code, stats } = mermaidTree(treeId, tree);
    statsTrees++; statsNodes += stats.pasos; statsResults += stats.resultados;
    const startTxt = tree.start ? shortTxt(tree.start.text, 90) : '(sin nodo start)';
    famCards.push(`
      <details class="tree" id="tree-${treeId}">
        <summary>
          <span class="tid">${htmlEsc(treeId)}</span>
          <span class="sdesc">${htmlEsc(startTxt)}</span>
          <span class="stat">${stats.pasos} pasos · ${stats.resultados} diagnósticos · ${stats.guias} guías</span>
        </summary>
        <div class="graph"><pre class="mermaid">${htmlEsc(code)}</pre></div>
      </details>`);
    tocChips += `<a class="chip" href="#tree-${treeId}">${htmlEsc(treeId)}</a>`;
  }

  treeSections += `
  <section>
    <div class="secHead"><h2>${htmlEsc(fam.title)}</h2><span class="secCount">${ids.length} árbol(es)</span></div>
    ${famCards.join('\n')}
  </section>`;
}

// Tarjetas de productos (con fallas y códigos)
const ordenProductos = Object.keys(FALLAS_POR_EQUIPO);
const prodCards = ordenProductos.map((tipo) => {
  const info = prodLabel[tipo] || { label: tipo, color: M.gris };
  const fallas = FALLAS_POR_EQUIPO[tipo] || [];
  const seen = new Set();
  const fallaChips = fallas
    .filter((f) => (seen.has(f.treeId + '|' + f.label) ? false : (seen.add(f.treeId + '|' + f.label), true)))
    .map((f) =>
      `<span class="falla"><b>${htmlEsc(f.label)}</b><a href="#tree-${f.treeId}">${htmlEsc(f.treeId)}</a></span>`)
    .join('');
  const codeGroups = groupCodes(TREE_IDS_BY_EQUIPO[tipo]);
  const codeRows = codeGroups
    .map((g) => `<div class="codeRow"><span class="codes">${g.codes.map(htmlEsc).join(', ')}</span> <span class="arrow">→</span> <a href="#tree-${g.treeId}">${htmlEsc(g.treeId)}</a></div>`)
    .join('');
  const airCodes = tipo === 'aire' && CODE_TREE_IDS
    ? groupCodes(CODE_TREE_IDS)
        .map((g) => `<div class="codeRow"><span class="codes">${g.codes.map(htmlEsc).join(', ')}</span> <span class="arrow">→</span> <a href="#tree-${g.treeId}">${htmlEsc(g.treeId)}</a></div>`)
        .join('')
    : '';
  return `
  <div class="prodCard" style="border-top-color:${info.color}">
    <h3>${htmlEsc(info.label)}</h3>
    <div class="chips">${fallaChips}</div>
    ${codeRows ? `<h4>Códigos de error</h4><div class="codesBox">${codeRows}</div>` : ''}
    ${airCodes ? `<h4>Códigos de error (aire)</h4><div class="codesBox">${airCodes}</div>` : ''}
  </div>`;
}).join('\n');

// Flujo de entrada de la app
const flowEntrada = `flowchart TD
  classDef qd fill:#EEF1FF,stroke:#000B8C,stroke-width:1.6px,color:#12124B
  classDef md fill:#E4E7FF,stroke:#1A21B8,stroke-width:1.6px,color:#0A0C4A
  classDef ad fill:#FFF8DE,stroke:#B89000,stroke-width:1.4px,color:#4A3800
  A["Nuevo diagnóstico"] --> B["1 · Datos del cliente"] --> C["2 · Tipo de equipo"] --> D["3 · Falla reportada"]
  D --> V["Paso previo · Foto del voltaje"] --> W["Paso previo · Foto del amperaje"]
  W --> P{"¿Compresor Inverter?"}
  P -->|"Sí"| S["Paso previo · Salida de tarjeta inverter"] --> K{"¿Hay código de error o destellos?"}
  P -->|"No"| K
  K -->|"Sí"| CB["Tabla y selección del código"] --> AR["Árbol de decisión guiado"]
  K -->|"No"| AR
  AR --> R["Informe con probabilidades"] --> CO["Conclusión · IRIS · DOCX"]
  class A,B,C,D,V,W,S,CB,R,CO ad
  class P,K qd
  class AR md`;

// Estadística de guías visuales
const guiasCount = Object.values(DECISION_TREES).reduce(
  (acc, t) => acc + Object.values(t).filter((n) => n.gifUri).length, 0);

const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>Diagrama de flujo · Árboles de diagnóstico — Línea Blanca Pro</title>
<script src="https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js"></script>
<style>
  :root {
    --m-azul: ${M.azul}; --m-azulMed: ${M.azulMed}; --m-azulProf: ${M.azulProf};
    --m-azulClaro: ${M.azulClaro}; --m-amarillo: ${M.amarillo}; --m-amarClaro: ${M.amarClaro};
    --m-verde: ${M.verde}; --m-gris: ${M.gris}; --m-texto: ${M.texto};
    --m-fondo: ${M.fondo}; --m-borde: ${M.borde};
  }
  * { box-sizing: border-box; }
  html { scroll-behavior: smooth; }
  body {
    font-family: system-ui, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
    margin: 0; background: linear-gradient(180deg, #E7E9FA 0%, var(--m-fondo) 320px, #E7E9FA 100%);
    color: var(--m-texto);
  }
  header {
    position: sticky; top: 0; z-index: 40;
    background: linear-gradient(120deg, var(--m-azulProf) 0%, var(--m-azul) 55%, var(--m-azulMed) 100%);
    color: #fff; padding: 16px 28px 13px;
    display: flex; align-items: center; gap: 16px;
    box-shadow: 0 6px 22px rgba(0, 7, 71, .35);
    border-bottom: 4px solid var(--m-amarillo);
  }
  .logoBox {
    background: #fff; border-radius: 10px; padding: 6px;
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 3px 10px rgba(0, 7, 71, .4);
    flex: none; width: 58px; height: 58px; overflow: hidden;
  }
  .logoBox img { width: 100%; height: 100%; object-fit: contain; display: block; }
  header h1 { margin: 0 0 3px; font-size: 19px; letter-spacing: .01em; }
  header p { margin: 0; opacity: .82; font-size: 12.5px; }
  header .sub { color: var(--m-amarillo); font-weight: 600; opacity: 1; }
  main { max-width: 1180px; margin: 0 auto; padding: 26px 20px 80px; }

  .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 14px; margin: 0 0 18px; }
  .statBox {
    background: #fff; border: 1px solid var(--m-borde); border-radius: 12px; padding: 14px 18px 12px;
    font-size: 13px; color: #42506A; box-shadow: 0 4px 16px rgba(0, 7, 71, .07);
    position: relative; overflow: hidden;
  }
  .statBox::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 5px; background: var(--m-amarillo); }
  .statBox .num { display: block; font-size: 26px; font-weight: 800; color: var(--m-azul); line-height: 1.15; }
  .statBox b { color: var(--m-azul); }

  .legend {
    display: flex; gap: 14px; flex-wrap: wrap; font-size: 12.5px; margin: 4px 0 2px;
    background: #fff; border: 1px solid var(--m-borde); border-radius: 12px; padding: 10px 16px;
    box-shadow: 0 4px 16px rgba(0, 7, 71, .07);
  }
  .legend span { display: inline-flex; align-items: center; gap: 7px; color: #3A495E; }
  .legend i { width: 15px; height: 15px; border-radius: 4px; display: inline-block; border-width: 2px; border-style: solid; flex: none; }

  section {
    background: #fff; border: 1px solid var(--m-borde); border-radius: 14px;
    padding: 20px 22px 16px; margin: 22px 0;
    box-shadow: 0 6px 24px rgba(0, 7, 71, .06);
  }
  .secHead { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; flex-wrap: wrap; margin-bottom: 10px; }
  .secHead h2 {
    font-size: 16.5px; margin: 0; color: var(--m-azul);
    padding-left: 12px; border-left: 5px solid var(--m-amarillo); line-height: 1.3;
  }
  h2.solo {
    font-size: 16.5px; margin: 0 0 10px; color: var(--m-azul);
    padding-left: 12px; border-left: 5px solid var(--m-amarillo);
  }
  .secCount, .famcount {
    font-size: 11.5px; color: #3F4460; background: var(--m-azulClaro); border: 1px solid var(--m-borde);
    padding: 3px 10px; border-radius: 999px; font-weight: 600;
  }

  details.tree {
    border: 1px solid var(--m-borde); border-radius: 11px; margin: 12px 0; background: #FBFDFE;
    overflow: hidden; box-shadow: 0 2px 10px rgba(0, 7, 71, .05);
    transition: box-shadow .15s ease;
  }
  details.tree:hover { box-shadow: 0 4px 18px rgba(0, 7, 71, .10); }
  details.tree > summary {
    cursor: pointer; padding: 11px 14px; display: flex; gap: 10px; align-items: center;
    flex-wrap: wrap; list-style: none;
  }
  details.tree > summary::-webkit-details-marker { display: none; }
  details.tree > summary::before {
    content: ''; width: 8px; height: 8px; border-right: 2.4px solid var(--m-azul);
    border-bottom: 2.4px solid var(--m-azul); transform: rotate(-45deg);
    transition: transform .15s ease; flex: none; margin-top: -4px;
  }
  details.tree[open] > summary::before { transform: rotate(45deg); margin-top: 2px; }
  details.tree > summary:hover { background: #EEF0FB; }
  details.tree[open] > summary { border-bottom: 1px solid #DCDFF2; background: #EEF0FB; border-radius: 10px 10px 0 0; }
  .tid {
    font-family: ui-monospace, Menlo, Consolas, monospace; font-size: 12px; font-weight: 700;
    color: var(--m-azul); background: var(--m-amarClaro); border: 1px solid #EDD98E;
    padding: 3px 9px; border-radius: 7px; white-space: nowrap;
  }
  .sdesc { font-size: 13px; color: var(--m-texto); flex: 1; min-width: 220px; font-weight: 500; }
  .stat { font-size: 11px; color: #7A88A0; white-space: nowrap; }

  .graph { overflow: auto; padding: 10px 8px 16px; }
  .mermaid { background: #fff; }

  .prodCard {
    background: #FBFDFE; border: 1px solid var(--m-borde); border-radius: 13px;
    padding: 14px 18px 14px; margin: 14px 0; border-top-width: 5px;
    box-shadow: 0 4px 14px rgba(0, 7, 71, .06);
    transition: transform .12s ease, box-shadow .12s ease;
  }
  .prodCard:hover { transform: translateY(-2px); box-shadow: 0 8px 22px rgba(0, 7, 71, .11); }
  .prodCard h3 { margin: 0 0 10px; font-size: 14.5px; color: var(--m-azul); letter-spacing: .01em; }
  .prodCard h4 {
    margin: 14px 0 6px; font-size: 10.5px; text-transform: uppercase; letter-spacing: .09em;
    color: #7A88A0; border-top: 1px dashed var(--m-borde); padding-top: 10px;
  }
  .chips { display: flex; flex-wrap: wrap; gap: 7px; }
  .falla {
    display: inline-flex; gap: 8px; align-items: baseline;
    background: #fff; border: 1px solid var(--m-borde); border-radius: 9px; padding: 5px 10px;
    font-size: 12px; box-shadow: 0 1px 4px rgba(0, 7, 71, .05);
  }
  .falla a {
    font-family: ui-monospace, Menlo, Consolas, monospace; font-size: 11px; color: var(--m-azul);
    text-decoration: none; border-bottom: 1.5px solid var(--m-amarillo); font-weight: 600;
  }
  .falla a:hover { color: var(--m-azulMed); }
  .codeRow { font-size: 12px; padding: 3px 0; color: #42506A; }
  .codeRow .codes { font-family: ui-monospace, Menlo, Consolas, monospace; color: var(--m-azul); font-weight: 600; }
  .codeRow .arrow { color: var(--m-azul); padding: 0 2px; }
  .codeRow a {
    font-family: ui-monospace, Menlo, Consolas, monospace; color: var(--m-azul); font-weight: 700;
    text-decoration: none; border-bottom: 1.5px solid var(--m-amarillo);
  }
  .codesBox { columns: 2 340px; column-gap: 28px; }

  .toc { display: flex; flex-wrap: wrap; gap: 7px; margin: 14px 0 2px; }
  .chip {
    background: #fff; border: 1px solid var(--m-borde); color: var(--m-azul); border-radius: 999px;
    padding: 4px 12px; font-size: 11.5px; font-family: ui-monospace, Menlo, monospace;
    text-decoration: none; box-shadow: 0 1px 3px rgba(0, 7, 71, .06); transition: background .12s ease;
  }
  .chip:hover { background: var(--m-amarClaro); border-color: var(--m-amarillo); }

  .btns { display: flex; gap: 10px; margin-top: 14px; }
  .btns button {
    border: none; background: var(--m-azul); color: #fff; border-radius: 9px; padding: 8px 18px;
    font-size: 12.5px; font-weight: 600; cursor: pointer; letter-spacing: .02em;
    box-shadow: 0 3px 10px rgba(0, 7, 71, .25); transition: background .12s ease;
  }
  .btns button:hover { background: var(--m-azulMed); }
  .btns button.sec { background: #fff; color: var(--m-azul); border: 1.5px solid var(--m-borde); box-shadow: 0 2px 6px rgba(0, 7, 71, .08); }
  .btns button.sec:hover { background: var(--m-amarClaro); }

  .note { font-size: 12px; color: #6A778C; margin-top: 10px; }
  footer {
    text-align: center; color: #6A778C; font-size: 12px; padding: 26px 0 34px;
    border-top: 3px solid var(--m-amarillo); margin-top: 40px; background: #fff;
  }
</style>
</head>
<body>
<header>
  <div class="logoBox"><img src="data:image/svg+xml;base64,${KALLEY_LOGO}" alt="Kalley"/></div>
  <div>
    <h1>Diagrama de flujo · Árboles de diagnóstico</h1>
    <p><span class="sub">Línea Blanca Pro v2.0</span> — generado automáticamente desde <code>constants/</code> (scripts/generar-diagrama.cjs). Cada desplegable contiene el árbol real que navega la app.</p>
  </div>
</header>
<main>
  <div class="stats">
    <div class="statBox"><span class="num">${statsTrees}</span> árboles de diagnóstico</div>
    <div class="statBox"><span class="num">${statsNodes}</span> nodos totales</div>
    <div class="statBox"><span class="num">${statsResults}</span> diagnósticos finales (resultados)</div>
    <div class="statBox"><span class="num">${guiasCount}</span> pasos con guía visual (GIF/WebP)</div>
  </div>
  <div class="legend">
    <span><i style="background:#EEF1FF;border-color:#000B8C"></i> Pregunta</span>
    <span><i style="background:#E4E7FF;border-color:#1A21B8"></i> Medición técnica</span>
    <span><i style="background:#FFF8DE;border-color:#B89000"></i> Acción / procedimiento</span>
    <span><i style="background:#F3F3F5;border-color:#373435"></i> Evidencia fotográfica</span>
    <span><i style="background:#E9F5EE;border-color:#0B8A4E"></i> Resultado con probabilidades</span>
    <span><i style="background:#FFFBEB;border-color:#B89000;border-style:dashed"></i> Gate automático (anti-re-pregunta)</span>
    <span><i style="background:#fff;border-color:#767B8C;border-style:dashed"></i> Rama compartida del nodo Inverter</span>
  </div>

  <section>
    <h2 class="solo">Flujo de entrada de la app (hasta llegar al árbol)</h2>
    <div class="graph"><pre class="mermaid eager">${htmlEsc(flowEntrada)}</pre></div>
    <p class="note">Los nodos con borde punteado son gates: se responden solos con la información ya dada y evitan volver a preguntar lo mismo.</p>
  </section>

  <section>
    <h2 class="solo">Mapa general: producto → falla o código → árbol</h2>
    <p class="note" style="margin-top:0">Cada chip enlaza (clic o toque) al diagrama del árbol correspondiente.</p>
    ${prodCards}
  </section>

  <section>
    <h2 class="solo">Índice de árboles</h2>
    <div class="toc">${tocChips}</div>
    <div class="btns">
      <button onclick="expandAll(true)">Expandir todo</button>
      <button class="sec" onclick="expandAll(false)">Contraer todo</button>
    </div>
  </section>

  ${treeSections}
</main>
<footer>Generado por scripts/generar-diagrama.cjs · ${new Date().toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })} · Requiere internet para cargar Mermaid (CDN)</footer>

<script>
  mermaid.initialize({ startOnLoad: false, securityLevel: 'loose' });
  function render(el) {
    if (el.dataset.done) return;
    el.dataset.done = '1';
    try { mermaid.run({ nodes: [el] }); }
    catch (e) { el.textContent = 'Error al renderizar: ' + e.message; }
  }
  function expandAll(open) {
    document.querySelectorAll('details.tree').forEach((d) => {
      d.open = open;
      if (open) render(d.querySelector('pre.mermaid'));
    });
  }
  document.querySelectorAll('details.tree').forEach((d) => {
    d.addEventListener('toggle', () => {
      if (d.open) render(d.querySelector('pre.mermaid'));
    });
  });
  window.addEventListener('load', () => {
    document.querySelectorAll('pre.mermaid.eager').forEach((el) => render(el));
  });
</script>
</body>
</html>`;

const OUT = path.join(ROOT, 'docs', 'diagrama-arboles.html');
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, html, 'utf8');

console.log(`Diagrama generado: docs/diagrama-arboles.html`);
console.log(`  Árboles: ${statsTrees} · Nodos: ${statsNodes} · Resultados: ${statsResults} · Guías visuales: ${guiasCount}`);
