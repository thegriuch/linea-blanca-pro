/**
 * Tabla de referencia del numeral 4 del Manual Técnico Kalley.
 *
 * Especificaciones de la tabla:
 * - R-18 °C = 16.9 kΩ
 * - B-18/25 = 3771 K
 * - Rango: -50 °C a 75 °C, en pasos de 0.5 °C
 */
export interface NtcReference {
  temperature: number;
  resistanceKohm: number;
}

const REFERENCE_TEMPERATURE_C = -18;
const REFERENCE_RESISTANCE_KOHM = 16.9;
const BETA = 3771;
const KELVIN_OFFSET = 273.15;

function resistanceAtTemperature(temperature: number): number {
  const referenceKelvin = REFERENCE_TEMPERATURE_C + KELVIN_OFFSET;
  const temperatureKelvin = temperature + KELVIN_OFFSET;
  const resistance = REFERENCE_RESISTANCE_KOHM * Math.exp(
    BETA * (1 / temperatureKelvin - 1 / referenceKelvin),
  );

  return Number(resistance.toFixed(3));
}

export const SENSOR_NTC_TABLE: NtcReference[] = Array.from(
  { length: 251 },
  (_, index) => {
    const temperature = Number((-50 + index * 0.5).toFixed(1));
    return {
      temperature,
      resistanceKohm: resistanceAtTemperature(temperature),
    };
  },
);

export const SENSOR_NTC_SPECIFICATIONS = {
  reference: 'R-18 °C = 16.9 kΩ',
  beta: 'B-18/25 = 3771 K',
  range: '-50 °C a 75 °C',
  step: '0,5 °C',
};