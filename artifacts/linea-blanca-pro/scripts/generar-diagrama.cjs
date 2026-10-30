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
  return origResolve.call(this, request, ...args);
};

// 3) Cargar datos reales
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

// ── Familias de secciones ─────────────────────────────────────────────────────
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

// ── Utilidades de escape ──────────────────────────────────────────────────────
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

// ── Generador Mermaid por árbol ───────────────────────────────────────────────
const CLASS_DEFS = '  classDef qd fill:#EFF6FF,stroke:#145DA0,stroke-width:1.5px,color:#0f172a\n' +
  '  classDef md fill:#ECFEFF,stroke:#0E7490,stroke-width:1.5px,color:#0f172a\n' +
  '  classDef ad fill:#FFF7ED,stroke:#B45309,stroke-width:1.5px,color:#0f172a\n' +
  '  classDef ev fill:#F5F3FF,stroke:#7C3AED,stroke-width:1.5px,color:#0f172a\n' +
  '  classDef rs fill:#ECFDF5,stroke:#047857,stroke-width:1.5px,color:#0f172a\n' +
  '  classDef gt fill:#FEF9C3,stroke:#A16207,stroke-width:1.5px,stroke-dasharray:4 3,color:#0f172a\n' +
  '  classDef sm fill:#F1F5F9,stroke:#64748B,stroke-width:1.2px,color:#0f172a\n';

const TYPE_CLASS = { question: 'qd', measure: 'md', action: 'ad', evidence: 'ev', result: 'rs' };

function mermaidTree(treeId, tree) {
  const { nodes, count } = orderNodes(tree);
  const results = nodes.filter((n) => n.type === 'result');
  const gifs = nodes.filter((n) => n.gifUri);
  const lines = [
    `flowchart TD`,
    `%%{init: {"theme":"base","flowchart":{"htmlLabels":true,"curve":"basis","nodeSpacing":38,"rankSpacing":44},"themeVariables":{"fontFamily":"system-ui,Segoe UI,sans-serif","fontSize":"13px"}}}%%`,
    CLASS_DEFS,
  ];
  const sharedIds = new Set(Object.keys(nevera.INVERTER_TREE || {}));

  for (const n of nodes) {
    let label;
    if (n.type === 'result') {
      const causes = (n.result && n.result.causes) || [];
      const top = causes[0];
      label = `<b>${shortTxt(n.text, 60)}</b>` +
        `<br/><small>🎯 ${shortTxt(top ? top.cause : '—', 55)} · ${top ? top.probability : '—'}%` +
        ` · ${causes.length} causa${causes.length === 1 ? '' : 's'}</small>`;
    } else {
      label = `<b>${shortTxt(n.text, 78)}</b><br/><small>${n.id}` +
        (n.gifUri ? ' · 🎬 guía' : '') + (n.gate ? ' · ⏭ auto' : '') + '</small>';
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
  if (missing.length) console.warn(`⚠ Árboles no encontrados en el índice: ${missing.join(', ')}`);

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
          <span class="stat">${stats.pasos} pasos · ${stats.resultados} diagnósticos · ${stats.guias} guías 🎬</span>
        </summary>
        <div class="graph"><pre class="mermaid">${htmlEsc(code)}</pre></div>
      </details>`);
    tocChips += `<a class="chip" href="#tree-${treeId}">${htmlEsc(treeId)}</a>`;
  }

  treeSections += `
  <section>
    <h2>${htmlEsc(fam.title)}</h2>
    <p class="famcount">${ids.length} árbol(es)</p>
    ${famCards.join('\n')}
  </section>`;
}

// Tarjetas de productos (con fallas y códigos)
const ordenProductos = Object.keys(FALLAS_POR_EQUIPO);
const prodCards = ordenProductos.map((tipo) => {
  const info = prodLabel[tipo] || { label: tipo, color: '#64748B' };
  const fallas = FALLAS_POR_EQUIPO[tipo] || [];
  const seen = new Set();
  const fallaChips = fallas
    .filter((f) => (seen.has(f.treeId + '|' + f.label) ? false : (seen.add(f.treeId + '|' + f.label), true)))
    .map((f) =>
      `<span class="falla"><b>${htmlEsc(f.label)}</b><a href="#tree-${f.treeId}">${htmlEsc(f.treeId)}</a></span>`)
    .join('');
  const codeGroups = groupCodes(TREE_IDS_BY_EQUIPO[tipo]);
  const codeRows = codeGroups
    .map((g) => `<div class="codeRow"><span class="codes">${g.codes.map(htmlEsc).join(', ')}</span> → <a href="#tree-${g.treeId}">${htmlEsc(g.treeId)}</a></div>`)
    .join('');
  const airCodes = tipo === 'aire' && CODE_TREE_IDS
    ? groupCodes(CODE_TREE_IDS)
        .map((g) => `<div class="codeRow"><span class="codes">${g.codes.map(htmlEsc).join(', ')}</span> → <a href="#tree-${g.treeId}">${htmlEsc(g.treeId)}</a></div>`)
        .join('')
    : '';
  return `
  <div class="prodCard" style="border-top-color:${info.color}">
    <h3>${htmlEsc(info.label)}</h3>
    <div class="chips">${fallaChips}</div>
    ${codeRows ? `<h4>Códigos de error</h4><div class="codes">${codeRows}</div>` : ''}
    ${airCodes ? `<h4>Códigos de error (aire)</h4>${airCodes}` : ''}
  </div>`;
}).join('\n');

// Flujo de entrada de la app
const flowEntrada = `flowchart TD
  classDef qd fill:#EFF6FF,stroke:#145DA0,stroke-width:1.5px,color:#0f172a
  classDef md fill:#ECFEFF,stroke:#0E7490,stroke-width:1.5px,color:#0f172a
  classDef ad fill:#FFF7ED,stroke:#B45309,stroke-width:1.5px,color:#0f172a
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

// Estadísticas global de gifs/etiquetas
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
  :root { color-scheme: light; }
  * { box-sizing: border-box; }
  body { font-family: system-ui, 'Segoe UI', Roboto, sans-serif; margin: 0; background:#F8FAFC; color:#0f172a; }
  header { background:#145DA0; color:#fff; padding:24px 28px; }
  header h1 { margin:0 0 6px; font-size:22px; }
  header p { margin:0; opacity:.85; font-size:13px; }
  main { max-width:1180px; margin:0 auto; padding:24px 20px 80px; }
  .stats { display:flex; gap:12px; flex-wrap:wrap; margin:18px 0; }
  .statBox { background:#fff; border:1px solid #E2E8F0; border-radius:10px; padding:10px 16px; font-size:13px; }
  .statBox b { color:#145DA0; font-size:18px; }
  .legend { display:flex; gap:14px; flex-wrap:wrap; font-size:12px; margin:10px 0 4px; }
  .legend span { display:inline-flex; align-items:center; gap:6px; }
  .legend i { width:14px; height:14px; border-radius:3px; display:inline-block; border:1.5px solid; }
  section { background:#fff; border:1px solid #E2E8F0; border-radius:12px; padding:18px 20px; margin:18px 0; }
  h2 { font-size:16px; margin:0 0 2px; }
  .famcount { font-size:12px; color:#64748B; margin:0 0 10px; }
  details.tree { border:1px solid #E2E8F0; border-radius:10px; margin:10px 0; background:#FDAFD9; }
  details.tree { background:#fff; }
  details.tree > summary { cursor:pointer; padding:12px 14px; display:flex; gap:10px; align-items:baseline; flex-wrap:wrap; border-radius:10px; }
  details.tree > summary:hover { background:#F1F5F9; }
  .tid { font-family: ui-monospace, Menlo, Consolas, monospace; font-size:13px; color:#145DA0; font-weight:700; }
  .sdesc { font-size:13px; color:#0f172a; flex:1; min-width:200px; }
  .stat { font-size:11px; color:#64748B; white-space:nowrap; }
  .graph { overflow:auto; padding:8px 6px 14px; max-height:none; }
  .mermaid { background:#fff; }
  .prodCard { background:#fff; border:1px solid #E2E8F0; border-radius:12px; padding:14px 16px; margin:12px 0; border-top-width:4px; }
  .prodCard h3 { margin:0 0 8px; font-size:14.5px; color:#0f172a; }
  .prodCard h4 { margin:12px 0 6px; font-size:11px; text-transform:uppercase; letter-spacing:.06em; color:#64748B; }
  .chips { display:flex; flex-wrap:wrap; gap:6px; }
  .falla { display:inline-flex; gap:6px; align-items:baseline; background:#F1F5F9; border:1px solid #E2E8F0; border-radius:8px; padding:4px 8px; font-size:12px; }
  .falla a { font-family: ui-monospace, Menlo, Consolas, monospace; font-size:11px; color:#145DA0; }
  .codeRow { font-size:12px; padding:2px 0; }
  .codeRow .codes { font-family: ui-monospace, Menlo, Consolas, monospace; color:#B45309; }
  .codeRow a { font-family: ui-monospace, Menlo, Consolas, monospace; color:#145DA0; }
  .toc { display:flex; flex-wrap:wrap; gap:6px; margin:14px 0; }
  .chip { background:#fff; border:1px solid #BFDBFE; color:#145DA0; border-radius:999px; padding:3px 10px; font-size:11.5px; font-family:ui-monospace,Menlo,monospace; text-decoration:none; }
  .chip:hover { background:#EFF6FF; }
  h2.sec { margin-top:30px; }
  footer { text-align:center; color:#64748B; font-size:12px; padding:30px 0; }
  .btns { display:flex; gap:8px; margin:10px 0 0; }
  .btns button { border:1px solid #E2E8F0; background:#fff; border-radius:8px; padding:6px 12px; font-size:12px; cursor:pointer; }
  .btns button:hover { background:#F1F5F9; }
  .note { font-size:12px; color:#64748B; }
</style>
</head>
<body>
<header>
  <h1>🌲 Diagrama de flujo · Árboles de diagnóstico</h1>
  <p>Línea Blanca Pro v2.0 — generado automáticamente desde <code>constants/</code> (scripts/generar-diagrama.cjs). Cada tarjeta equivale al árbol real que navega la app.</p>
</header>
<main>
  <div class="stats">
    <div class="statBox"><b>${statsTrees}</b> árboles</div>
    <div class="statBox"><b>${statsNodes}</b> nodos totales</div>
    <div class="statBox"><b>${statsResults}</b> diagnósticos finales (resultados)</div>
    <div class="statBox"><b>${guiasCount}</b> pasos con guía visual 🎬</div>
  </div>
  <div class="legend">
    <span><i style="background:#EFF6FF;border-color:#145DA0"></i> Pregunta</span>
    <span><i style="background:#ECFEFF;border-color:#0E7490"></i> Medición técnica</span>
    <span><i style="background:#FFF7ED;border-color:#B45309"></i> Acción / procedimiento</span>
    <span><i style="background:#F5F3FF;border-color:#7C3AED"></i> Evidencia fotográfica</span>
    <span><i style="background:#ECFDF5;border-color:#047857"></i> Resultado con probabilidades</span>
    <span><i style="background:#FEF9C3;border-color:#A16207;border-style:dashed"></i> Gate automático (anti-re-pregunta)</span>
    <span><i style="background:#fff;border-color:#64748B;border-style:dashed"></i> Rama compartida del nodo Inverter</span>
  </div>

  <section>
    <h2>Flujo de entrada de la app (hasta llegar al árbol)</h2>
    <div class="graph"><pre class="mermaid eager">${htmlEsc(flowEntrada)}</pre></div>
    <p class="note">Tras elegir la falla (y el código, si lo hay), la app entra al árbol correspondiente. Los nodos marcados ⏭ son gates: se responden solos con la información ya dada.</p>
  </section>

  <section>
    <h2>Mapa general: producto → falla o código → árbol</h2>
    <p class="note">Las flechas no aplican: aquí cada chip lleva (clicando) al diagrama del árbol.</p>
    ${prodCards}
  </section>

  <section>
    <h2>Índice de árboles</h2>
    <div class="toc">${tocChips}</div>
    <div class="btns">
      <button onclick="expandAll(true)">Expandir todo</button>
      <button onclick="expandAll(false)">Contraer todo</button>
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

console.log(`✓ Diagrama generado: docs/diagrama-arboles.html`);
console.log(`  Árboles: ${statsTrees} · Nodos: ${statsNodes} · Resultados: ${statsResults} · Guías visuales: ${guiasCount}`);
