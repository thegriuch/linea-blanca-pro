"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCodigoTreeId = getCodigoTreeId;
// ── NEVERA (reutilizado por nevecon, minibar y dispensadores) ─────────────────
// 1-5 Flash → árboles dedicados. E6/F6 ventilador refri → árbol dedicado.
// E7/F7/CE comunicación y E1/E2/E3 → árbol ERRORELECTRONICO existente.
const NEVERA_TREE_IDS = {
    '1 FLASH': 'nevera_f1_ntc',
    '2 FLASH': 'nevera_f2_ntc',
    '3 FLASH': 'nevera_f3_ambiental',
    '4 FLASH': 'nevera_f4_deshielo',
    '5 FLASH': 'nevera_f5_ventcongelador',
    E6: 'nevera_f6_ventrefri',
};
// ── CONGELADOR (reutilizado por vitrina) ──────────────────────────────────────
// Los códigos son flashes de la placa inversora (inverter). Los códigos
// relacionados con el compresor/módulo usan el árbol inverter compartido;
// comunicación y arranque usan los árboles existentes.
const CONGELADOR_TREE_IDS = {
    '1 FLASH': 'inverter',
    '4 FLASH': 'inverter',
    '6 FLASH': 'inverter',
    '8 FLASH': 'noarranque',
    '9 FLASH': 'noarranque',
    '11 FLASH': 'noarranque',
    '13 FLASH': 'errorelectronico',
};
// ── LAVADORA ──────────────────────────────────────────────────────────────────
// Señales del motor inverter (E50/E58/E60) y comunicación (E80/C8) usan el
// árbol ERRORELECTRONICO_LAVADORA. Sensores/resistencias (E34-E38, E3A) también.
const LAVADORA_TREE_IDS = {
    E1: 'nollena',
    E10: 'nollena',
    E2: 'nodesagua',
    E21: 'nodesagua',
    E3: 'errorelectronico_lavadora',
    E30: 'errorelectronico_lavadora',
    E4: 'nocentrifuga',
    E40: 'nocentrifuga',
    E7: 'nocentrifuga',
    F8: 'nollena',
    E33: 'nollena',
    FD: 'errorelectronico_lavadora',
    C8: 'errorelectronico_lavadora',
    E34: 'errorelectronico_lavadora',
    E35: 'errorelectronico_lavadora',
    E36: 'errorelectronico_lavadora',
    E37: 'errorelectronico_lavadora',
    E38: 'errorelectronico_lavadora',
    E3A: 'errorelectronico_lavadora',
    E50: 'errorelectronico_lavadora',
    E58: 'errorelectronico_lavadora',
    E60: 'errorelectronico_lavadora',
    E61: 'errorelectronico_lavadora',
    E62: 'errorelectronico_lavadora',
    E64: 'errorelectronico_lavadora',
    E80: 'errorelectronico_lavadora',
};
// ── SECADORA (hereda códigos E-series de lavadora) ────────────────────────────
const SECADORA_TREE_IDS = {
    ...LAVADORA_TREE_IDS,
    E10: 'noenciende',
    E12: 'nollena',
    E22: 'nodesagua',
};
const TREE_IDS_BY_EQUIPO = {
    nevera: NEVERA_TREE_IDS,
    nevecon: NEVERA_TREE_IDS,
    minibar: NEVERA_TREE_IDS,
    dispensadores: NEVERA_TREE_IDS,
    congelador: CONGELADOR_TREE_IDS,
    vitrina: CONGELADOR_TREE_IDS,
    lavadora: LAVADORA_TREE_IDS,
    secadora: SECADORA_TREE_IDS,
};
/** Devuelve el treeId correspondiente a un código de error (no aire), o undefined. */
function getCodigoTreeId(tipo, codigo) {
    const map = TREE_IDS_BY_EQUIPO[tipo];
    if (!map)
        return undefined;
    return map[codigo.trim().toUpperCase()];
}
