"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DECISION_TREES = void 0;
exports.getTree = getTree;
exports.getNode = getNode;
const arboles_comunes_1 = require("@/constants/arboles_comunes");
const arboles_nevera_1 = require("@/constants/arboles_nevera");
const arboles_nevera_2 = require("@/constants/arboles_nevera");
const aires_arboles_1 = require("@/constants/aires_arboles");
const arbol_inverter_1 = require("@/constants/arbol_inverter");
const arboles_lavadora_1 = require("@/constants/arboles_lavadora");
const arboles_codigos_lavadora_1 = require("@/constants/arboles_codigos_lavadora");
// ── Registro completo ─────────────────────────────────────────────────────────
exports.DECISION_TREES = {
    // Comunes (todos los productos)
    ...arboles_comunes_1.ARBOLES_COMUNES,
    // Refrigeración doméstica (nevera/nevecón/minibar/congelador/vitrina)
    noenfria: arboles_nevera_1.NOENFRIA,
    noarranque: arboles_nevera_1.NOARRANQUE,
    ...arboles_nevera_2.NEVERA_CODE_TREES,
    // Aire acondicionado
    noenfria_aire: aires_arboles_1.NOENFRIA_AIRE,
    ...aires_arboles_1.AIR_ERROR_TREES,
    // Módulo Inverter como árbol navegable (flashes del congelador apuntan a 'inverter')
    inverter: { ...arbol_inverter_1.INVERTER_TREE, start: arbol_inverter_1.INVERTER_TREE.inv_start },
    // Lavadora / secadora
    nocentrifuga: arboles_lavadora_1.NOCENTRIFUGA,
    nodesagua: arboles_lavadora_1.NODESAGUA,
    nollena: arboles_lavadora_1.NOLLENA,
    errorelectronico_lavadora: arboles_lavadora_1.ERRORELECTRONICO_LAVADORA,
    nolavado: arboles_lavadora_1.NOLAVADO,
    noseca: arboles_lavadora_1.NOSECA,
    ...arboles_lavadora_1.LAVADORA_SILENT_TREES,
    ...arboles_codigos_lavadora_1.CODIGOS_LAVADORA_TREES,
};
function getTree(treeId) {
    return exports.DECISION_TREES[treeId] ?? arboles_comunes_1.ARBOLES_COMUNES.noenciende;
}
function getNode(treeId, nodeId) {
    const tree = getTree(treeId);
    return tree[nodeId] ?? tree['start'];
}
