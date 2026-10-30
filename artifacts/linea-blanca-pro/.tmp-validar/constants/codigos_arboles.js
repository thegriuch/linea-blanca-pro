"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TREE_IDS_BY_EQUIPO = void 0;
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
    // E7/F7/CE: falla de comunicación tarjeta ↔ display → árbol genérico existente
    E7: 'errorelectronico',
    F7: 'errorelectronico',
    CE: 'errorelectronico',
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
    // Flashes con protección específica de la placa inversora → árbol inverter
    '2 FLASH': 'inverter', // sobretensión
    '3 FLASH': 'inverter', // subtensión
    '5 FLASH': 'noarranque', // compresor muy caliente (estrangulamiento térmico)
    '7 FLASH': 'inverter', // falla de polarización de voltaje
    '12 FLASH': 'inverter', // reducción de potencia y frecuencia
};
// ── LAVADORA / SECADORA — árbol dedicado por código ───────────────────────────
// Cada código tiene su propio árbol con las validaciones específicas de esa
// falla (arboles_codigos_lavadora.ts). Secadora hereda la serie E de lavadora
// y sobreescribe E10/E12/E22 con sus propios árboles donde difiere.
const LAVADORA_TREE_IDS = {
    E1: 'lav_e1_llenado',
    E10: 'lav_e1_llenado',
    E2: 'lav_e2_drenaje',
    E21: 'lav_e2_drenaje',
    E3: 'lav_e3_puerta',
    E30: 'lav_e3_puerta',
    E4: 'lav_e4_desbalance',
    E40: 'lav_e4_desbalance',
    E7: 'lav_e7_freno',
    F8: 'lav_f8_presostato',
    E33: 'lav_f8_presostato',
    FD: 'lav_fd_cerradura',
    C8: 'lav_c8_com_inverter',
    E34: 'lav_e34_temp',
    E35: 'lav_e34_temp',
    E36: 'lav_e34_temp',
    E37: 'lav_e37_secado',
    E38: 'lav_e37_secado',
    E3A: 'lav_e34_temp',
    E12: 'lav_e12_sobrellenado',
    E50: 'lav_e50_inverter',
    E58: 'lav_e58_sobrecarga',
    E60: 'lav_e60_motor',
    E61: 'lav_e60_motor',
    E62: 'lav_e60_motor',
    E64: 'lav_e60_motor',
    E80: 'lav_e80_display',
};
// La secadora hereda el mapeo de lavadora (misma serie E de sensores, motor
// inverter, comunicación y puerta) y sobreescribe los códigos de agua/drenaje
// que en secadora corresponden a la parte de lavado de la lavadora-secadora.
const SECADORA_TREE_IDS = {
    ...LAVADORA_TREE_IDS,
    E22: 'lav_e2_drenaje',
};
exports.TREE_IDS_BY_EQUIPO = {
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
    const map = exports.TREE_IDS_BY_EQUIPO[tipo];
    if (!map)
        return undefined;
    const limpio = codigo.trim().toUpperCase();
    // Los códigos compuestos de la tabla ('E34, E35' / 'E37, E38') se resuelven
    // por su PRIMER código listado: 'E34, E35' → 'E34'.
    const primero = limpio.split(',')[0].trim();
    return map[limpio] ?? map[primero];
}
