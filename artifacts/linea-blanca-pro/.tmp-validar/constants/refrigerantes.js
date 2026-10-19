"use strict";
/**
 * Línea Blanca Pro — Datos de saturación de refrigerantes
 *
 * Fuente: ASHRAE Fundamentals Handbook / NIST Webbook
 * Presiones en kPa absolutos. T en °C.
 * Conversión: 1 psi = 6.89476 kPa  |  psi(g) = psi(a) - 14.696
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.REFRIGERANTES_MAP = exports.REFRIGERANTES = void 0;
// ---------------------------------------------------------------------------
// R134a — HFC-134a / Tetrafluoroetano
// ---------------------------------------------------------------------------
const tablaR134a = [
    [-40, 51.25], [-35, 66.18], [-30, 84.43], [-25, 106.4],
    [-20, 132.7], [-15, 163.9], [-10, 200.7], [-5, 244.0],
    [0, 292.8], [5, 348.9], [10, 414.6], [15, 490.4],
    [20, 577.9], [25, 678.7], [30, 794.0], [35, 925.8],
    [40, 1076], [45, 1247], [50, 1440], [55, 1658],
    [60, 1902], [65, 2174], [70, 2478], [75, 2815],
    [80, 3189], [85, 3602],
];
// ---------------------------------------------------------------------------
// R290 — Propano
// ---------------------------------------------------------------------------
const tablaR290 = [
    [-40, 100.8], [-35, 126.4], [-30, 156.9], [-25, 192.9],
    [-20, 235.3], [-15, 284.8], [-10, 341.8], [-5, 407.2],
    [0, 481.7], [5, 566.1], [10, 661.0], [15, 767.5],
    [20, 886.3], [25, 1018], [30, 1163], [35, 1323],
    [40, 1499], [45, 1691], [50, 1901], [55, 2129],
    [60, 2377], [65, 2646], [70, 2938], [75, 3252],
    [80, 3590],
];
// ---------------------------------------------------------------------------
// R32 — Difluorometano
// ---------------------------------------------------------------------------
const tablaR32 = [
    [-50, 101.3], [-45, 133.5], [-40, 173.2], [-35, 221.6],
    [-30, 280.0], [-25, 349.6], [-20, 432.2], [-15, 529.4],
    [-10, 641.6], [-5, 771.3], [0, 920.0], [5, 1089],
    [10, 1280], [15, 1496], [20, 1737], [25, 2006],
    [30, 2305], [35, 2635], [40, 2999], [45, 3399],
    [50, 3836],
];
// ---------------------------------------------------------------------------
// R600a — Isobutano
// Valores tomados del documento de referencia
// "Regla_Refrigerantes_PSI_Temperatura_Tiempo" (columna R-600a PSIG),
// convertidos a kPa absolutos: kPa = (psig + 14.696) × 6.894757.
// Documento: -20 °C = -4.2 psig · 0 °C = 8.1 · 10 °C = 17.3 · 20 °C = 30.6 ·
//            30 °C = 43.8 · 40 °C = 57.9 · 50 °C = 84.1
// ---------------------------------------------------------------------------
const tablaR600a = [
    [-20, 72.4], [-10, 108.2], [0, 157.2], [5, 195.8],
    [10, 220.6], [20, 312.3], [30, 403.3], [40, 500.5],
    [50, 681.2],
];
// ---------------------------------------------------------------------------
// Mapa principal
// ---------------------------------------------------------------------------
exports.REFRIGERANTES = [
    {
        id: 'R134a',
        nombre: 'R134a',
        nombreComercial: 'Tetrafluoroetano',
        grupoSeguridad: 'A1',
        tCritica: 101.06,
        pCritica: 4059,
        tEbullicion: -26.37,
        color: '#145DA0',
        descripcion: 'Refrigerante HFC sin cloro. Muy usado en refrigeración doméstica y automotriz.',
        tabla: tablaR134a,
    },
    {
        id: 'R290',
        nombre: 'R290',
        nombreComercial: 'Propano',
        grupoSeguridad: 'A3',
        tCritica: 96.74,
        pCritica: 4247,
        tEbullicion: -42.11,
        color: '#D97706',
        descripcion: 'Hidrocarburo natural. Alta eficiencia, bajo GWP. Inflamable — precaución en carga.',
        tabla: tablaR290,
    },
    {
        id: 'R32',
        nombre: 'R32',
        nombreComercial: 'Difluorometano',
        grupoSeguridad: 'A2L',
        tCritica: 78.11,
        pCritica: 5782,
        tEbullicion: -51.65,
        color: '#047857',
        descripcion: 'Refrigerante HFC de bajo GWP. Muy usado en splits. Ligeramente inflamable.',
        tabla: tablaR32,
    },
    {
        id: 'R600a',
        nombre: 'R600a',
        nombreComercial: 'Isobutano',
        grupoSeguridad: 'A3',
        tCritica: 134.69,
        pCritica: 3629,
        tEbullicion: -11.75,
        color: '#DC2626',
        descripcion: 'Hidrocarburo natural. Estándar en refrigeración doméstica moderna. Inflamable.',
        tabla: tablaR600a,
    },
];
exports.REFRIGERANTES_MAP = Object.fromEntries(exports.REFRIGERANTES.map((r) => [r.id, r]));
