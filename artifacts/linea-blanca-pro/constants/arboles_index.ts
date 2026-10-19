/**
 * Índice central de árboles de diagnóstico, organizado POR PRODUCTO.
 *
 * Cada árbol vive en un solo archivo (sin duplicar diagnósticos):
 * - arboles_comunes.ts: síntomas genéricos compartidos por varios productos
 * - arboles_nevera.ts: refrigeración doméstica (nevera/nevecón/minibar/congelador/vitrina)
 * - aires_arboles.ts: aire acondicionado (incluye NOENFRIA_AIRE)
 * - arboles_lavadora.ts: lavadora/secadora (síntomas + fallas silenciosas Parte II)
 * - arboles_codigos_lavadora.ts: árboles dedicados por código de error de lavadora
 * - arbol_inverter.ts: árbol del módulo Inverter (flashes de congelador)
 */
import type { DiagnosticTree } from '@/types/diagnostico';
import { ARBOLES_COMUNES } from '@/constants/arboles_comunes';
import { NOENFRIA, NOARRANQUE, ERRORELECTRONICO, ESCARCHA, CONGELA_NOENFRIA } from '@/constants/arboles_nevera';
import { NEVERA_CODE_TREES } from '@/constants/arboles_nevera';
import {
  NOENFRIA_AIRE,
  AIR_ERROR_TREES,
} from '@/constants/aires_arboles';
import { INVERTER_TREE } from '@/constants/arbol_inverter';
import {
  NOCENTRIFUGA,
  NODESAGUA,
  NOLLENA,
  ERRORELECTRONICO_LAVADORA,
  NOLAVADO,
  NOSECA,
  LAVADORA_SILENT_TREES,
} from '@/constants/arboles_lavadora';
import { CODIGOS_LAVADORA_TREES } from '@/constants/arboles_codigos_lavadora';

// ── Registro completo ─────────────────────────────────────────────────────────
export const DECISION_TREES: Record<string, DiagnosticTree> = {
  // Comunes (todos los productos)
  ...ARBOLES_COMUNES,

  // Refrigeración doméstica (nevera/nevecón/minibar/congelador/vitrina)
  noenfria:            NOENFRIA,
  noarranque:          NOARRANQUE,
  ...NEVERA_CODE_TREES,

  // Aire acondicionado
  noenfria_aire:       NOENFRIA_AIRE,
  ...AIR_ERROR_TREES,

  // Módulo Inverter como árbol navegable (flashes del congelador apuntan a 'inverter')
  inverter: { ...INVERTER_TREE, start: INVERTER_TREE.inv_start },

  // Lavadora / secadora
  nocentrifuga:               NOCENTRIFUGA,
  nodesagua:                  NODESAGUA,
  nollena:                    NOLLENA,
  errorelectronico_lavadora:  ERRORELECTRONICO_LAVADORA,
  nolavado:                   NOLAVADO,
  noseca:                     NOSECA,
  ...LAVADORA_SILENT_TREES,
  ...CODIGOS_LAVADORA_TREES,
};

export function getTree(treeId: string): DiagnosticTree {
  return DECISION_TREES[treeId] ?? ARBOLES_COMUNES.noenciende;
}

export function getNode(treeId: string, nodeId: string) {
  const tree = getTree(treeId);
  return tree[nodeId] ?? tree['start'];
}
