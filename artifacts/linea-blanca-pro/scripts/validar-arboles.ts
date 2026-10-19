/* Valida que todos los nextId/option.nextId de los árboles apunten a nodos existentes. */
import { DECISION_TREES } from '../constants/arboles_index';

let errors = 0;

for (const [treeId, tree] of Object.entries(DECISION_TREES)) {
  for (const node of Object.values(tree)) {
    const refs: string[] = [];
    if (node.nextId) refs.push(node.nextId);
    for (const opt of node.options ?? []) refs.push(opt.nextId);
    for (const ref of refs) {
      if (!tree[ref]) {
        errors++;
        console.error(`✗ ${treeId}: '${node.id}' apunta a nodo inexistente '${ref}'`);
      }
    }
  }
  // Verificar que exista el nodo inicial requerido por getNode()
  if (!tree['start']) {
    console.warn(`⚠ ${treeId}: no tiene nodo 'start' propio (usa spread de otro árbol)`);
  }
}

if (errors > 0) {
  console.error(`\n${errors} referencia(s) rota(s).`);
  process.exit(1);
}
console.log('✓ Todos los árboles son consistentes (sin referencias rotas).');
