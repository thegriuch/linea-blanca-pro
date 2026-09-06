/**
 * Utilidades de cálculo para la Regla de Refrigerantes.
 *
 * Interpolación lineal entre puntos de la tabla de saturación.
 * Conversiones PSI ↔ kPa  y  absoluto ↔ manométrico.
 */

const KPA_PER_PSI = 6.894757;
const ATM_KPA     = 101.325;   // presión atmosférica estándar
const ATM_PSIA    = ATM_KPA / KPA_PER_PSI; // ≈ 14.696 psi(a)

/** Convierte kPa absolutos a psi absolutos */
export function kpaToPsia(kpa: number): number {
  return kpa / KPA_PER_PSI;
}

/** Convierte psi absolutos a kPa absolutos */
export function psiaToKpa(psia: number): number {
  return psia * KPA_PER_PSI;
}

/** Convierte psi manométrico (gauge) a psi absoluto */
export function psigToPsia(psig: number): number {
  return psig + ATM_PSIA;
}

/** Convierte psi absoluto a psi manométrico (gauge) */
export function psiaToPsig(psia: number): number {
  return psia - ATM_PSIA;
}

/**
 * Interpolación lineal en la tabla de saturación.
 * Dado T (°C) devuelve P (kPa absolutos).
 * Devuelve null si T está fuera del rango de la tabla.
 */
export function tempToKpa(
  tabla: [number, number][],
  tempC: number
): number | null {
  if (tabla.length < 2) return null;
  const tMin = tabla[0][0];
  const tMax = tabla[tabla.length - 1][0];
  if (tempC < tMin || tempC > tMax) return null;

  for (let i = 0; i < tabla.length - 1; i++) {
    const [t0, p0] = tabla[i];
    const [t1, p1] = tabla[i + 1];
    if (tempC >= t0 && tempC <= t1) {
      const frac = (tempC - t0) / (t1 - t0);
      return p0 + frac * (p1 - p0);
    }
  }
  return null;
}

/**
 * Interpolación inversa: dado P (kPa absolutos) devuelve T (°C).
 * Devuelve null si P está fuera del rango.
 */
export function kpaToTemp(
  tabla: [number, number][],
  kpa: number
): number | null {
  if (tabla.length < 2) return null;
  const pMin = tabla[0][1];
  const pMax = tabla[tabla.length - 1][1];
  if (kpa < pMin || kpa > pMax) return null;

  for (let i = 0; i < tabla.length - 1; i++) {
    const [t0, p0] = tabla[i];
    const [t1, p1] = tabla[i + 1];
    if (kpa >= p0 && kpa <= p1) {
      const frac = (kpa - p0) / (p1 - p0);
      return t0 + frac * (t1 - t0);
    }
  }
  return null;
}

/** Límites de temperatura para el selector */
export function tempRange(tabla: [number, number][]): [number, number] {
  return [tabla[0][0], tabla[tabla.length - 1][0]];
}

/** Límites de presión psi(a) para el selector */
export function psiaRange(tabla: [number, number][]): [number, number] {
  return [
    Math.round(kpaToPsia(tabla[0][1]) * 10) / 10,
    Math.round(kpaToPsia(tabla[tabla.length - 1][1]) * 10) / 10,
  ];
}

export { ATM_PSIA };
