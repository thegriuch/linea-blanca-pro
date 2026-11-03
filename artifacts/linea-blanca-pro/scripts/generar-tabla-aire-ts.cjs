/**
 * Genera constants/sensores-aire-tabla.ts a partir de los datos del manual:
 *   - scripts/sensores-aire-tabla.cjs → sensores T1/T2/T3/T4
 *   - scripts/sensores-tp-tabla.cjs   → sensores TP (descarga de compresor)
 *
 * Ambos archivos traen 4 grupos de [°C, °F, kΩ] por línea (4 bloques de
 * columnas: -20…19, 20…59, 60…99, 100…139 °C). Hay que transponerlos para
 * obtener la tabla ordenada por temperatura.
 *
 * Uso: node scripts/generar-tabla-aire-ts.cjs
 */
const fs = require('fs');
const path = require('path');
const { TEMPERATURE_TABLE_AIR } = require('./sensores-aire-tabla.cjs');
const { TEMPERATURE_TABLE_AIR_TP } = require('./sensores-tp-tabla.cjs');

/** Transpone los 4 bloques de columnas en filas ordenadas por temperatura. */
function transpose(manualTable) {
  const rows = [];
  const groups = manualTable[0].length / 3;
  for (let g = 0; g < groups; g += 1) {
    for (const line of manualTable) {
      const [c, f, r] = [line[g * 3], line[g * 3 + 1], line[g * 3 + 2]];
      if (typeof c !== 'number' || typeof f !== 'number' || typeof r !== 'number') continue;
      rows.push({ c, f, r });
    }
  }
  return rows;
}

const rowsAir = transpose(TEMPERATURE_TABLE_AIR);
const rowsTp = transpose(TEMPERATURE_TABLE_AIR_TP);

const bodyAir = rowsAir
  .map(({ c, f, r }, i) => `  { interval: '${i + 1}', temperatureC: ${c}, temperatureF: ${f}, resistanceKohm: ${r} },`)
  .join('\n');

const bodyTp = rowsTp
  .map(({ c, f, r }, i) => `  { interval: '${i + 1}', temperatureC: ${c}, temperatureF: ${f}, resistanceKohm: ${r} },`)
  .join('\n');

const out = `export interface AirSensorRow {
  interval: string;
  temperatureC: number;
  temperatureF: number;
  resistanceKohm: number;
}

/**
 * Tabla de resistencia para los sensores T1/T2/T3/T4 de aire acondicionado.
 * Fuente: manual técnico Kalley (resistencia vs temperatura).
 *
 * Rango: -20 °C a ${rowsAir[rowsAir.length - 1].c} °C.
 * Generado por scripts/generar-tabla-aire-ts.cjs — no editar a mano.
 */
export const TEMPERATURE_TABLE_AIR: AirSensorRow[] = [
${bodyAir}
];

/**
 * Tabla de resistencia para los sensores TP (descarga del compresor) de
 * algunos equipos de aire acondicionado.
 * Fuente: "Temperature Sensor Resistance Value Table for TP" del manual Kalley.
 *
 * Rango: -20 °C a ${rowsTp[rowsTp.length - 1].c} °C (el manual no trae valores por
 * encima de esa temperatura).
 * Generado por scripts/generar-tabla-aire-ts.cjs — no editar a mano.
 */
export const TEMPERATURE_TABLE_AIR_TP: AirSensorRow[] = [
${bodyTp}
];
`;

fs.writeFileSync(path.join(__dirname, '..', 'constants', 'sensores-aire-tabla.ts'), out, 'utf8');
console.log(`T1/T2/T3/T4: ${rowsAir.length} filas (-20 °C a ${rowsAir[rowsAir.length - 1].c} °C)`);
console.log(`TP: ${rowsTp.length} filas (-20 °C a ${rowsTp[rowsTp.length - 1].c} °C)`);
