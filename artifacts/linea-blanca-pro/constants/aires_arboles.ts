import type { DiagnosticTree } from '@/types/diagnostico';

const AIRE_E5_IPM: DiagnosticTree = {
  start: {
    id: 'start',
    type: 'question',
    text: '¿El compresor tiene devanados en corto?',
    detail: 'Con el equipo desenergizado, mide U-V, U-W, V-W y verifica que no exista continuidad a tierra.',
    gifUri: 'medicion-compresor-kalley',
    options: [
      { label: 'Sí, hay corto o desbalance', nextId: 'e5_compresor', color: 'danger' },
      { label: 'No, las bobinas están equilibradas', nextId: 'e5_ipm', color: 'success' },
    ],
  },
  e5_compresor: {
    id: 'e5_compresor',
    type: 'evidence',
    text: 'Documentar la medición del compresor',
    detail: 'Toma una foto de las tres mediciones y de la placa del compresor antes de solicitar el repuesto.',
    evidenceLabel: 'Foto de resistencia U-V, U-W, V-W y aislamiento',
    nextId: 'e5_result_compresor',
  },
  e5_result_compresor: {
    id: 'e5_result_compresor',
    type: 'result',
    text: 'Compresor inverter con devanados en corto',
    result: {
      causes: [
        { cause: 'Devanados del compresor en corto o desbalanceados', probability: 85 },
        { cause: 'Terminal o conexión del compresor deteriorada', probability: 15 },
      ],
      recommendation: 'Confirmar que la medición se hizo con el equipo desconectado y solicitar el compresor inverter correcto. Verificar el módulo IPM antes de instalar el repuesto.',
      parts: ['Compresor inverter'],
    },
  },
  e5_ipm: {
    id: 'e5_ipm',
    type: 'question',
    text: '¿El módulo IPM (IGBT) está dañado?',
    detail: 'Revisa el módulo de potencia, su disipador y las señales de salida según el manual del modelo.',
    gifUri: 'medir-señal-inverter',
    options: [
      { label: 'Sí, el IPM está dañado', nextId: 'e5_result_ipm', color: 'danger' },
      { label: 'No se confirma daño en el IPM', nextId: 'e5_voltaje', color: 'success' },
    ],
  },
  e5_result_ipm: {
    id: 'e5_result_ipm',
    type: 'result',
    text: 'Módulo IPM / inverter defectuoso',
    result: {
      causes: [
        { cause: 'IGBT o módulo IPM en corto', probability: 75 },
        { cause: 'Circuito de disparo o disipación térmica defectuosa', probability: 25 },
      ],
      recommendation: 'Descargar capacitores, documentar la prueba y reemplazar el módulo IPM o la tarjeta inverter. Confirmar que el compresor no esté en corto para proteger el repuesto nuevo.',
      parts: ['Módulo IPM', 'Tarjeta inverter'],
    },
  },
  e5_voltaje: {
    id: 'e5_voltaje',
    type: 'measure',
    text: 'Medir el voltaje de alimentación del aire acondicionado',
    detail: 'Mide el voltaje de entrada durante la condición de falla y compáralo con el valor nominal de la placa.',
    gifUri: 'medir-voltaje',
    nextId: 'e5_voltaje_ok',
  },
  e5_voltaje_ok: {
    id: 'e5_voltaje_ok',
    type: 'question',
    text: '¿El voltaje de alimentación está bajo o presenta variaciones?',
    options: [
      { label: 'Sí, está bajo o inestable', nextId: 'e5_result_voltaje', color: 'danger' },
      { label: 'No, el voltaje es normal', nextId: 'e5_condensador', color: 'success' },
    ],
  },
  e5_result_voltaje: {
    id: 'e5_result_voltaje',
    type: 'result',
    text: 'Corregir alimentación antes de condenar el inverter',
    result: {
      causes: [
        { cause: 'Voltaje de alimentación bajo o inestable', probability: 55 },
        { cause: 'Conexiones o terminales de alimentación flojos', probability: 20 },
        { cause: 'Protección IPM sensible a una condición externa', probability: 25 },
      ],
      recommendation: 'Corregir la alimentación y sus conexiones. Después de estabilizar el voltaje, repetir la prueba del código E5.',
      parts: ['Terminales de alimentación', 'Protector eléctrico'],
    },
  },
  e5_condensador: {
    id: 'e5_condensador',
    type: 'question',
    text: '¿El condensador exterior está obstruido o sucio y sobrecarga el compresor?',
    detail: 'Revisa el flujo de aire, la limpieza del serpentín y el funcionamiento del ventilador exterior.',
    gifUri: 'manometros',
    options: [
      { label: 'Sí, hay obstrucción o flujo insuficiente', nextId: 'e5_result_condensador', color: 'danger' },
      { label: 'No, el condensador está limpio y ventilado', nextId: 'e5_result_final', color: 'success' },
    ],
  },
  e5_result_condensador: {
    id: 'e5_result_condensador',
    type: 'result',
    text: 'Limpiar el condensador y corregir el flujo de aire',
    result: {
      causes: [
        { cause: 'Serpentín del condensador obstruido por suciedad', probability: 60 },
        { cause: 'Ventilador exterior con flujo insuficiente', probability: 25 },
        { cause: 'Sobrecarga térmica del compresor', probability: 15 },
      ],
      recommendation: 'Limpiar el condensador, comprobar el ventilador y repetir la prueba de corriente. No reemplazar el IPM hasta confirmar que la condición térmica quedó corregida.',
      parts: ['Motor del ventilador exterior', 'Condensador o serpentín'],
    },
  },
  e5_result_final: {
    id: 'e5_result_final',
    type: 'result',
    text: 'Revisar IPM / inverter después de descartar causas externas',
    result: {
      causes: [
        { cause: 'Módulo IPM con falla intermitente', probability: 55 },
        { cause: 'Circuito de control del inverter', probability: 25 },
        { cause: 'Compresor con falla que aparece bajo carga', probability: 20 },
      ],
      recommendation: 'Con compresor, alimentación, condensador y ventilación dentro de especificación, revisar el módulo IPM y la tarjeta inverter siguiendo el manual del modelo.',
      parts: ['Módulo IPM', 'Tarjeta inverter', 'Compresor inverter'],
    },
  },
};

const AIRE_F1_NTC: DiagnosticTree = {
  start: {
    id: 'start',
    type: 'question',
    text: '¿El sensor NTC de temperatura interior está en corto o abierto?',
    detail: 'Desconecta el sensor, mide su resistencia a temperatura conocida y compárala con la tabla del modelo. A 25 °C muchos sensores son cercanos a 10 kΩ, pero no es un valor universal.',
    gifUri: 'medir-continuidad-tierra',
    options: [
      { label: 'Sí, está abierto o en corto', nextId: 'f1_sensor', color: 'danger' },
      { label: 'No, la lectura está dentro de rango', nextId: 'f1_conector', color: 'success' },
    ],
  },
  f1_sensor: {
    id: 'f1_sensor',
    type: 'evidence',
    text: 'Registrar la medición del sensor NTC interior',
    detail: 'Fotografía la lectura del multímetro y la referencia del sensor antes de reemplazarlo.',
    evidenceLabel: 'Foto de resistencia del sensor NTC interior',
    nextId: 'f1_result_sensor',
  },
  f1_result_sensor: {
    id: 'f1_result_sensor',
    type: 'result',
    text: 'Sensor NTC interior fuera de especificación',
    result: {
      causes: [
        { cause: 'Sensor NTC abierto o en corto', probability: 90 },
        { cause: 'Terminal del sensor deteriorado', probability: 10 },
      ],
      recommendation: 'Reemplazar el sensor por la referencia compatible con el modelo y confirmar la lectura después de la reparación.',
      parts: ['Sensor NTC de temperatura interior'],
    },
  },
  f1_conector: {
    id: 'f1_conector',
    type: 'question',
    text: '¿El conector del sensor tiene corrosión o está suelto?',
    options: [
      { label: 'Sí, hay corrosión o falso contacto', nextId: 'f1_result_conector', color: 'danger' },
      { label: 'No, el conector está firme y limpio', nextId: 'f1_result_control', color: 'success' },
    ],
  },
  f1_result_conector: {
    id: 'f1_result_conector',
    type: 'result',
    text: 'Corregir conexión del sensor NTC interior',
    result: {
      causes: [
        { cause: 'Falso contacto u oxidación en el conector', probability: 75 },
        { cause: 'Cableado del sensor deteriorado', probability: 25 },
      ],
      recommendation: 'Limpiar o reparar el conector, verificar continuidad hasta la PCB y probar el equipo antes de cambiar la tarjeta.',
      parts: ['Conector o cableado del sensor'],
    },
  },
  f1_result_control: {
    id: 'f1_result_control',
    type: 'result',
    text: 'Revisar lectura de la PCB interior',
    result: {
      causes: [
        { cause: 'Entrada de lectura del sensor en la PCB interior', probability: 65 },
        { cause: 'Intermitencia que no aparece en la medición estática', probability: 35 },
      ],
      recommendation: 'Confirmar continuidad desde el sensor hasta la PCB y revisar la entrada electrónica según el manual del modelo. Sustituir la PCB solo después de descartar sensor y cableado.',
      parts: ['PCB interior'],
    },
  },
};

const AIRE_F2_NTC: DiagnosticTree = {
  start: {
    id: 'start',
    type: 'question',
    text: '¿El sensor NTC del evaporador está en corto o abierto?',
    detail: 'Mide la resistencia del sensor y compárala con la temperatura real y la tabla del modelo.',
    gifUri: 'medir-continuidad-tierra',
    options: [
      { label: 'Sí, está abierto o en corto', nextId: 'f2_sensor', color: 'danger' },
      { label: 'No, la lectura está dentro de rango', nextId: 'f2_sujecion', color: 'success' },
    ],
  },
  f2_sensor: {
    id: 'f2_sensor',
    type: 'evidence',
    text: 'Registrar la medición del sensor NTC del evaporador',
    detail: 'Toma una foto de la lectura y del montaje del sensor para anexarla al informe.',
    evidenceLabel: 'Foto de resistencia del sensor NTC del evaporador',
    nextId: 'f2_result_sensor',
  },
  f2_result_sensor: {
    id: 'f2_result_sensor',
    type: 'result',
    text: 'Sensor NTC del evaporador fuera de especificación',
    result: {
      causes: [
        { cause: 'Sensor NTC abierto o en corto', probability: 90 },
        { cause: 'Cable del sensor deteriorado', probability: 10 },
      ],
      recommendation: 'Reemplazar el sensor por la referencia compatible y comprobar la temperatura reportada por el equipo.',
      parts: ['Sensor NTC de evaporador'],
    },
  },
  f2_sujecion: {
    id: 'f2_sujecion',
    type: 'question',
    text: '¿El sensor está desprendido del tubo del evaporador?',
    options: [
      { label: 'Sí, está suelto o mal sujeto', nextId: 'f2_result_sujecion', color: 'danger' },
      { label: 'No, está sujeto correctamente', nextId: 'f2_result_control', color: 'success' },
    ],
  },
  f2_result_sujecion: {
    id: 'f2_result_sujecion',
    type: 'result',
    text: 'Corregir montaje del sensor del evaporador',
    result: {
      causes: [
        { cause: 'Sensor desprendido del tubo del evaporador', probability: 85 },
        { cause: 'Aislamiento o abrazadera deteriorada', probability: 15 },
      ],
      recommendation: 'Volver a sujetar el sensor en el punto indicado por el fabricante, asegurar el contacto térmico y confirmar la lectura.',
      parts: ['Abrazadera o soporte del sensor'],
    },
  },
  f2_result_control: {
    id: 'f2_result_control',
    type: 'result',
    text: 'Revisar cableado y entrada de la PCB',
    result: {
      causes: [
        { cause: 'Cableado intermitente entre sensor y PCB', probability: 55 },
        { cause: 'Entrada de lectura de la PCB interior', probability: 45 },
      ],
      recommendation: 'Comprobar continuidad desde el sensor hasta la PCB y revisar la entrada electrónica conforme al manual del modelo.',
      parts: ['Cableado del sensor', 'PCB interior'],
    },
  },
};

export const AIR_ERROR_TREES: Record<string, DiagnosticTree> = {
  aire_e5_ipm: AIRE_E5_IPM,
  aire_f1_ntc: AIRE_F1_NTC,
  aire_f2_ntc: AIRE_F2_NTC,
};

const CODE_TREE_IDS: Record<string, string> = {
  E5: 'aire_e5_ipm',
  F1: 'aire_f1_ntc',
  F2: 'aire_f2_ntc',
};

export function getAirErrorTreeId(code: string): string | undefined {
  return CODE_TREE_IDS[code.trim().toUpperCase()];
}