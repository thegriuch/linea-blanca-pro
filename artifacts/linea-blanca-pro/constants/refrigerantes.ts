/**
 * Línea Blanca Pro — Datos de saturación de refrigerantes
 *
 * Fuente: ASHRAE Fundamentals Handbook / NIST Webbook
 * Presiones en kPa absolutos. T en °C.
 * Conversión: 1 psi = 6.89476 kPa  |  psi(g) = psi(a) - 14.696
 */

export interface RefrigeranteInfo {
  id: string;
  nombre: string;
  nombreComercial: string;
  grupoSeguridad: string;
  tCritica: number;   // °C
  pCritica: number;   // kPa
  tEbullicion: number; // °C a 1 atm (0 psi(g))
  color: string;       // hex
  descripcion: string;
  /** [T_celsius, P_kPa_abs] pares ordenados de menor a mayor T */
  tabla: [number, number][];
}

// ---------------------------------------------------------------------------
// R134a — HFC-134a / Tetrafluoroetano
// ---------------------------------------------------------------------------
const tablaR134a: [number, number][] = [
  [-40, 51.25], [-35, 66.18], [-30, 84.43], [-25, 106.4],
  [-20, 132.7], [-15, 163.9], [-10, 200.7], [-5,  244.0],
  [  0, 292.8], [  5, 348.9], [ 10, 414.6], [ 15, 490.4],
  [ 20, 577.9], [ 25, 678.7], [ 30, 794.0], [ 35, 925.8],
  [ 40, 1076 ], [ 45, 1247 ], [ 50, 1440 ], [ 55, 1658 ],
  [ 60, 1902 ], [ 65, 2174 ], [ 70, 2478 ], [ 75, 2815 ],
  [ 80, 3189 ], [ 85, 3602 ],
];

// ---------------------------------------------------------------------------
// R290 — Propano
// ---------------------------------------------------------------------------
const tablaR290: [number, number][] = [
  [-40, 100.8], [-35, 126.4], [-30, 156.9], [-25, 192.9],
  [-20, 235.3], [-15, 284.8], [-10, 341.8], [ -5, 407.2],
  [  0, 481.7], [  5, 566.1], [ 10, 661.0], [ 15, 767.5],
  [ 20, 886.3], [ 25, 1018 ], [ 30, 1163 ], [ 35, 1323 ],
  [ 40, 1499 ], [ 45, 1691 ], [ 50, 1901 ], [ 55, 2129 ],
  [ 60, 2377 ], [ 65, 2646 ], [ 70, 2938 ], [ 75, 3252 ],
  [ 80, 3590 ],
];

// ---------------------------------------------------------------------------
// R32 — Difluorometano
// ---------------------------------------------------------------------------
const tablaR32: [number, number][] = [
  [-50, 101.3], [-45, 133.5], [-40, 173.2], [-35, 221.6],
  [-30, 280.0], [-25, 349.6], [-20, 432.2], [-15, 529.4],
  [-10, 641.6], [ -5, 771.3], [  0, 920.0], [  5, 1089 ],
  [ 10, 1280 ], [ 15, 1496 ], [ 20, 1737 ], [ 25, 2006 ],
  [ 30, 2305 ], [ 35, 2635 ], [ 40, 2999 ], [ 45, 3399 ],
  [ 50, 3836 ],
];

// ---------------------------------------------------------------------------
// R600 — n-Butano
// ---------------------------------------------------------------------------
const tablaR600: [number, number][] = [
  [-20,  53.5], [-15,  69.0], [-10,  88.4], [ -5, 112.1],
  [  0, 141.0], [  5, 175.2], [ 10, 215.5], [ 15, 263.3],
  [ 20, 319.3], [ 25, 384.2], [ 30, 459.1], [ 35, 544.7],
  [ 40, 641.9], [ 45, 751.9], [ 50, 875.5], [ 55, 1013 ],
  [ 60, 1167 ], [ 65, 1338 ], [ 70, 1527 ], [ 75, 1734 ],
  [ 80, 1961 ], [ 85, 2209 ],
];

// ---------------------------------------------------------------------------
// R600a — Isobutano
// ---------------------------------------------------------------------------
const tablaR600a: [number, number][] = [
  [-30,  66.3], [-25,  86.3], [-20, 111.1], [-15, 141.0],
  [-10, 176.8], [ -5, 219.3], [  0, 269.2], [  5, 327.4],
  [ 10, 394.7], [ 15, 472.0], [ 20, 560.1], [ 25, 660.0],
  [ 30, 772.5], [ 35, 898.4], [ 40, 1038 ], [ 45, 1194 ],
  [ 50, 1366 ], [ 55, 1555 ], [ 60, 1762 ], [ 65, 1989 ],
  [ 70, 2236 ], [ 75, 2506 ], [ 80, 2799 ], [ 85, 3116 ],
  [ 90, 3458 ],
];

// ---------------------------------------------------------------------------
// Mapa principal
// ---------------------------------------------------------------------------
export const REFRIGERANTES: RefrigeranteInfo[] = [
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
    id: 'R600',
    nombre: 'R600',
    nombreComercial: 'n-Butano',
    grupoSeguridad: 'A3',
    tCritica: 151.98,
    pCritica: 3796,
    tEbullicion: -0.49,
    color: '#7C3AED',
    descripcion: 'Hidrocarburo natural. Usado en refrigeración doméstica europea. Inflamable.',
    tabla: tablaR600,
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

export const REFRIGERANTES_MAP: Record<string, RefrigeranteInfo> = Object.fromEntries(
  REFRIGERANTES.map((r) => [r.id, r])
);
