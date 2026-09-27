import type { DiagnosticTree } from '@/types/diagnostico';

// ─── Árboles dedicados para los códigos de error de NEVERA ────────────────────
// Según los diagramas de flujo: 1-5 Flash (sensores y ventilador) y E6/F6
// (ventilador del refrigerador). E7/F7/CE (comunicación) usa el árbol
// ERRORELECTRONICO existente. E1/E2/E3 también van a ERRORELECTRONICO.

// ── 1 Flash / F1 — Sensor NTC del refrigerador ────────────────────────────────
const NEVERA_F1_NTC: DiagnosticTree = {
  start: {
    id: 'start', type: 'evidence',
    text: 'Medir el sensor NTC del compartimento de refrigeración',
    detail: 'Desconecta el sensor y mide su resistencia con el multímetro. Compara con la tabla NTC del fabricante (a 25 °C ≈ 10 kΩ, varía con la temperatura). Revisa conector y cableado hasta la tarjeta.',
    evidenceLabel: 'Foto de la medición del NTC de refrigerador',
    nextId: 'f1_lectura',
  },
  f1_lectura: {
    id: 'f1_lectura', type: 'question',
    text: '¿La lectura del sensor está fuera de rango (OL, 0 Ω o valor inconsistente)?',
    options: [
      { label: 'Sí, fuera de rango', nextId: 'f1_result_sensor', color: 'danger' },
      { label: 'No, la lectura es correcta', nextId: 'f1_cableado', color: 'success' },
    ],
  },
  f1_result_sensor: {
    id: 'f1_result_sensor', type: 'result',
    text: 'Sensor NTC del refrigerador defectuoso',
    result: {
      causes: [
        { cause: 'Sensor NTC en circuito abierto o corto', probability: 70 },
        { cause: 'Conector del sensor con corrosión', probability: 20 },
        { cause: 'Tarjeta principal con falla de lectura', probability: 10 },
      ],
      recommendation: 'Reemplazar el sensor NTC con la referencia exacta. Verificar el conector antes de instalar el repuesto.',
      parts: ['Sensor NTC de refrigerador'],
    },
  },
  f1_cableado: {
    id: 'f1_cableado', type: 'measure',
    text: 'Verificar continuidad del cableado y conector del sensor hasta la tarjeta',
    detail: 'Mide continuidad desde el conector del sensor hasta la tarjeta principal. Revisa sulfatación, pines sueltos o cable pellizcado.',
    tip: 'Un cableado intermitente produce lecturas erráticas que la tarjeta interpreta como sensor abierto.',
    nextId: 'f1_cableado_ok',
  },
  f1_cableado_ok: {
    id: 'f1_cableado_ok', type: 'question',
    text: '¿El cableado está correcto y el código persiste después de reconectar?',
    options: [
      { label: 'Sí, cableado OK y el código persiste', nextId: 'f1_result_tarjeta', color: 'danger' },
      { label: 'No, había conector flojo o corrosión (corregido)', nextId: 'f1_result_cableado', color: 'success' },
    ],
  },
  f1_result_cableado: {
    id: 'f1_result_cableado', type: 'result',
    text: 'Cableado o conector del sensor en mal estado',
    result: {
      causes: [
        { cause: 'Cableado intermitente entre sensor y PCB', probability: 55 },
        { cause: 'Conector sulfatado o sin contacto', probability: 45 },
      ],
      recommendation: 'Reparar el cableado o reemplazar el conector. Limpiar los pines y verificar la lectura del sensor después de la corrección.',
      parts: ['Cableado del sensor', 'Conector del sensor'],
    },
  },
  f1_result_tarjeta: {
    id: 'f1_result_tarjeta', type: 'result',
    text: 'Tarjeta principal con falla en la lectura del sensor',
    result: {
      causes: [
        { cause: 'Entrada de lectura de la PCB dañada', probability: 60 },
        { cause: 'Alimentación de la tarjeta fuera de rango', probability: 40 },
      ],
      recommendation: 'Con sensor y cableado verificados, solicitar la tarjeta principal. Documenta la medición del sensor como evidencia.',
      parts: ['Tarjeta principal'],
    },
  },
};

// ── 2 Flash / F2 — Sensor NTC del congelador ──────────────────────────────────
const NEVERA_F2_NTC: DiagnosticTree = {
  start: {
    id: 'start', type: 'evidence',
    text: 'Medir el sensor NTC del congelador y revisar el evaporador',
    detail: 'Mide el sensor NTC del congelador (a 0 °C ≈ 15–30 kΩ). Inspecciona si el evaporador tiene escarcha excesiva que cubra el sensor.',
    evidenceLabel: 'Foto de la medición del NTC de congelador',
    nextId: 'f2_lectura',
  },
  f2_lectura: {
    id: 'f2_lectura', type: 'question',
    text: '¿La lectura del sensor está fuera de rango (OL, 0 Ω o valor inconsistente)?',
    options: [
      { label: 'Sí, fuera de rango', nextId: 'f2_result_sensor', color: 'danger' },
      { label: 'No, la lectura es correcta', nextId: 'f2_escarcha', color: 'success' },
    ],
  },
  f2_result_sensor: {
    id: 'f2_result_sensor', type: 'result',
    text: 'Sensor NTC del congelador defectuoso',
    result: {
      causes: [
        { cause: 'Sensor NTC en circuito abierto o corto', probability: 75 },
        { cause: 'Conector deteriorado por humedad', probability: 25 },
      ],
      recommendation: 'Reemplazar el sensor NTC del congelador. Verificar que el conector esté sellado contra humedad.',
      parts: ['Sensor NTC de congelador'],
    },
  },
  f2_escarcha: {
    id: 'f2_escarcha', type: 'question',
    text: '¿El evaporador del congelador tiene escarcha excesiva que cubre el sensor?',
    options: [
      { label: 'Sí, hay escarcha excesiva', nextId: 'f2_result_deshielo', color: 'danger' },
      { label: 'No, el evaporador está limpio', nextId: 'f2_result_cableado', color: 'success' },
    ],
  },
  f2_result_deshielo: {
    id: 'f2_result_deshielo', type: 'result',
    text: 'Ciclo de descongelamiento del congelador con falla',
    result: {
      causes: [
        { cause: 'Resistencia de deshielo abierta', probability: 55 },
        { cause: 'Termostato bimetálico de deshielo pegado o abierto', probability: 30 },
        { cause: 'Temporizador o tarjeta no activa el deshielo', probability: 15 },
      ],
      recommendation: 'Descongelar manualmente y verificar la resistencia y el termostato de deshielo. Reemplazar el componente que falle.',
      parts: ['Resistencia de deshielo', 'Termostato de deshielo'],
    },
  },
  f2_result_cableado: {
    id: 'f2_result_cableado', type: 'result',
    text: 'Cableado o tarjeta con lectura anormal del sensor del congelador',
    result: {
      causes: [
        { cause: 'Cableado intermitente entre sensor y PCB', probability: 55 },
        { cause: 'Entrada de lectura de la PCB', probability: 45 },
      ],
      recommendation: 'Verificar continuidad del cableado. Si es correcto y el código persiste, solicitar la tarjeta principal.',
      parts: ['Cableado del sensor', 'Tarjeta principal'],
    },
  },
};

// ── 3 Flash / F3 — Sensor NTC ambiental ───────────────────────────────────────
const NEVERA_F3_AMBIENTAL: DiagnosticTree = {
  start: {
    id: 'start', type: 'evidence',
    text: 'Medir el sensor NTC ambiental',
    detail: 'Localiza el sensor ambiental (generalmente en la parte superior del gabinete o en el panel de control). Mide su resistencia a temperatura ambiente conocida.',
    evidenceLabel: 'Foto de la medición del NTC ambiental',
    nextId: 'f3_lectura',
  },
  f3_lectura: {
    id: 'f3_lectura', type: 'question',
    text: '¿La lectura del sensor está fuera de especificación?',
    options: [
      { label: 'Sí, fuera de especificación', nextId: 'f3_result_sensor', color: 'danger' },
      { label: 'No, la lectura es correcta', nextId: 'f3_ubicacion', color: 'success' },
    ],
  },
  f3_result_sensor: {
    id: 'f3_result_sensor', type: 'result',
    text: 'Sensor NTC ambiental defectuoso',
    result: {
      causes: [
        { cause: 'Sensor ambiental en circuito abierto o corto', probability: 85 },
        { cause: 'Conector o cableado del sensor', probability: 15 },
      ],
      recommendation: 'Reemplazar el sensor ambiental. Verificar la lectura después de la instalación.',
      parts: ['Sensor NTC ambiental'],
    },
  },
  f3_ubicacion: {
    id: 'f3_ubicacion', type: 'question',
    text: '¿El sensor está expuesto a una fuente de calor o mal instalado?',
    options: [
      { label: 'Sí, está expuesto o mal fijado', nextId: 'f3_result_ubicacion', color: 'neutral' },
      { label: 'No, está bien ubicado y el código persiste', nextId: 'f3_result_tarjeta', color: 'danger' },
    ],
  },
  f3_result_ubicacion: {
    id: 'f3_result_ubicacion', type: 'result',
    text: 'Sensor ambiental mal ubicado — lectura distorsionada',
    result: {
      causes: [
        { cause: 'Fuente de calor cercana distorsiona la lectura', probability: 70 },
        { cause: 'Sensor mal fijado o separado de su soporte', probability: 30 },
      ],
      recommendation: 'Reposicionar el sensor lejos de fuentes de calor y fijarlo correctamente. Verificar que el código desaparezca tras el ciclo de prueba.',
      parts: [],
    },
  },
  f3_result_tarjeta: {
    id: 'f3_result_tarjeta', type: 'result',
    text: 'Tarjeta principal con lectura anormal del sensor ambiental',
    result: {
      causes: [
        { cause: 'Entrada de lectura de la PCB dañada', probability: 60 },
        { cause: 'Alimentación de la tarjeta fuera de rango', probability: 40 },
      ],
      recommendation: 'Con sensor y ubicación verificados, solicitar la tarjeta principal.',
      parts: ['Tarjeta principal'],
    },
  },
};

// ── 4 Flash / F4 — Sensor de deshielo + termostato bimetálico ─────────────────
const NEVERA_F4_DESHIELO: DiagnosticTree = {
  start: {
    id: 'start', type: 'evidence',
    text: 'Medir el sensor de deshielo y el termostato bimetálico',
    detail: 'El sensor de deshielo debe variar su resistencia con la temperatura. El termostato bimetálico debe cambiar de estado (cierre/apertura) según la temperatura del evaporador.',
    evidenceLabel: 'Foto de la medición del sensor y termostato de deshielo',
    nextId: 'f4_sensor',
  },
  f4_sensor: {
    id: 'f4_sensor', type: 'question',
    text: '¿El sensor de deshielo está en corto o abierto (sin variación de resistencia)?',
    options: [
      { label: 'Sí, sin variación', nextId: 'f4_result_sensor', color: 'danger' },
      { label: 'No, varía correctamente', nextId: 'f4_termostato', color: 'success' },
    ],
  },
  f4_result_sensor: {
    id: 'f4_result_sensor', type: 'result',
    text: 'Sensor de deshielo defectuoso',
    result: {
      causes: [
        { cause: 'Sensor de deshielo en corto o circuito abierto', probability: 80 },
        { cause: 'Conector o cableado del sensor', probability: 20 },
      ],
      recommendation: 'Reemplazar el sensor de deshielo. Verificar que el ciclo de descongelamiento opere correctamente después.',
      parts: ['Sensor de deshielo'],
    },
  },
  f4_termostato: {
    id: 'f4_termostato', type: 'question',
    text: '¿El termostato bimetálico no cambia de estado con la temperatura?',
    options: [
      { label: 'Sí, siempre abierto o siempre cerrado', nextId: 'f4_result_termostato', color: 'danger' },
      { label: 'No, cambia correctamente y el código persiste', nextId: 'f4_result_tarjeta', color: 'neutral' },
    ],
  },
  f4_result_termostato: {
    id: 'f4_result_termostato', type: 'result',
    text: 'Termostato de deshielo (bimetálico) pegado',
    result: {
      causes: [
        { cause: 'Bimetálico pegado en su último estado', probability: 85 },
        { cause: 'Bimetálico desplazado del evaporador', probability: 15 },
      ],
      recommendation: 'Reemplazar el termostato de deshielo y verificar su contacto térmico con el evaporador.',
      parts: ['Termostato de deshielo'],
    },
  },
  f4_result_tarjeta: {
    id: 'f4_result_tarjeta', type: 'result',
    text: 'Cableado o tarjeta con lectura anormal del deshielo',
    result: {
      causes: [
        { cause: 'Cableado intermitente entre sensor y PCB', probability: 55 },
        { cause: 'Entrada de lectura de la PCB', probability: 45 },
      ],
      recommendation: 'Verificar continuidad del cableado. Si es correcto, solicitar la tarjeta principal.',
      parts: ['Cableado del sensor', 'Tarjeta principal'],
    },
  },
};

// ── 5 Flash / F5 — Ventilador del congelador ──────────────────────────────────
const NEVERA_F5_VENTCONGELADOR: DiagnosticTree = {
  start: {
    id: 'start', type: 'evidence',
    text: 'Verificar el ventilador del congelador: giro libre y voltaje en el conector',
    detail: 'Comprueba que el aspa gire libremente (descongela manualmente si hay hielo). Mide el voltaje en el conector del motor durante la operación (típico 12 V DC o 120/220 V AC según el modelo).',
    evidenceLabel: 'Foto del ventilador y del voltaje medido en el conector',
    nextId: 'f5_bloqueo',
  },
  f5_bloqueo: {
    id: 'f5_bloqueo', type: 'question',
    text: '¿El aspa está bloqueada por hielo o roce mecánico?',
    options: [
      { label: 'Sí, está bloqueada', nextId: 'f5_result_hielo', color: 'danger' },
      { label: 'No, gira libremente', nextId: 'f5_voltaje', color: 'success' },
    ],
  },
  f5_result_hielo: {
    id: 'f5_result_hielo', type: 'result',
    text: 'Ventilador bloqueado por escarcha — revisar ciclo de deshielo',
    result: {
      causes: [
        { cause: 'Escarcha excesiva por ciclo de deshielo con falla', probability: 70 },
        { cause: 'Roce del aspa con el ducto o marco', probability: 30 },
      ],
      recommendation: 'Descongelar manualmente y verificar resistencia y termostato de deshielo. Corregir el roce mecánico si existe.',
      parts: ['Resistencia de deshielo', 'Termostato de deshielo'],
    },
  },
  f5_voltaje: {
    id: 'f5_voltaje', type: 'question',
    text: '¿Llega voltaje al motor durante la operación (típico 12 V DC)?',
    options: [
      { label: 'Sí, hay voltaje y no gira', nextId: 'f5_result_motor', color: 'danger' },
      { label: 'No llega voltaje', nextId: 'f5_result_tarjeta', color: 'neutral' },
    ],
  },
  f5_result_motor: {
    id: 'f5_result_motor', type: 'result',
    text: 'Motor del ventilador del congelador defectuoso',
    result: {
      causes: [
        { cause: 'Devanados del motor abiertos o en corto', probability: 65 },
        { cause: 'Rodamiento o buje agarrotado', probability: 35 },
      ],
      recommendation: 'Reemplazar el motor del ventilador del evaporador con la referencia exacta.',
      parts: ['Motor ventilador evaporador'],
    },
  },
  f5_result_tarjeta: {
    id: 'f5_result_tarjeta', type: 'result',
    text: 'Tarjeta principal no alimenta el ventilador',
    result: {
      causes: [
        { cause: 'Salida de la tarjeta sin voltaje', probability: 60 },
        { cause: 'Conector o cableado entre tarjeta y motor', probability: 40 },
      ],
      recommendation: 'Verificar conector y cableado. Si están correctos, solicitar la tarjeta principal.',
      parts: ['Tarjeta principal', 'Conector del ventilador'],
    },
  },
};

// ── E6 / F6 — Ventilador del refrigerador ─────────────────────────────────────
const NEVERA_F6_VENTREFRI: DiagnosticTree = {
  start: {
    id: 'start', type: 'evidence',
    text: 'Verificar el ventilador del refrigerador: giro, voltaje y señal de RPM',
    detail: 'Comprueba que el ventilador gire libremente, mide el voltaje del motor (típico 12 V DC) y verifica la señal de retroalimentación de velocidad (sensor Hall integrado).',
    evidenceLabel: 'Foto del ventilador del refrigerador y medición de voltaje',
    nextId: 'f6_giro',
  },
  f6_giro: {
    id: 'f6_giro', type: 'question',
    text: '¿El ventilador gira libremente?',
    options: [
      { label: 'No, está trabado o con roce', nextId: 'f6_result_bloqueo', color: 'danger' },
      { label: 'Sí, gira libremente', nextId: 'f6_voltaje', color: 'success' },
    ],
  },
  f6_result_bloqueo: {
    id: 'f6_result_bloqueo', type: 'result',
    text: 'Ventilador del refrigerador bloqueado',
    result: {
      causes: [
        { cause: 'Acumulación de hielo en el aspa', probability: 60 },
        { cause: 'Roce estructural del aspa con el ducto', probability: 40 },
      ],
      recommendation: 'Descongelar manualmente y corregir el roce. Si el daño del aspa es visible, reemplazar el motor.',
      parts: ['Motor ventilador refrigerador'],
    },
  },
  f6_voltaje: {
    id: 'f6_voltaje', type: 'question',
    text: '¿El motor recibe voltaje (típico 12 V DC) y no gira o no retorna la señal de RPM?',
    options: [
      { label: 'Sí, hay voltaje pero falla el motor o la señal', nextId: 'f6_result_motor', color: 'danger' },
      { label: 'No llega voltaje al motor', nextId: 'f6_result_tarjeta', color: 'neutral' },
    ],
  },
  f6_result_motor: {
    id: 'f6_result_motor', type: 'result',
    text: 'Motor del ventilador del refrigerador defectuoso (motor o señal Hall)',
    result: {
      causes: [
        { cause: 'Motor con devanados abiertos o en corto', probability: 55 },
        { cause: 'Sensor Hall de retroalimentación de RPM dañado', probability: 45 },
      ],
      recommendation: 'Reemplazar el motor del ventilador del refrigerador. Verificar que la señal de RPM retorne a la tarjeta después del cambio.',
      parts: ['Motor ventilador refrigerador'],
    },
  },
  f6_result_tarjeta: {
    id: 'f6_result_tarjeta', type: 'result',
    text: 'Tarjeta principal sin salida para el ventilador del refrigerador',
    result: {
      causes: [
        { cause: 'Salida de la tarjeta sin voltaje', probability: 60 },
        { cause: 'Conector o cableado entre tarjeta y motor', probability: 40 },
      ],
      recommendation: 'Verificar conector y cableado. Si están correctos, solicitar la tarjeta principal.',
      parts: ['Tarjeta principal'],
    },
  },
};

// ── Registro de árboles de códigos de nevera ──────────────────────────────────
export const NEVERA_CODE_TREES: Record<string, DiagnosticTree> = {
  nevera_f1_ntc:           NEVERA_F1_NTC,
  nevera_f2_ntc:           NEVERA_F2_NTC,
  nevera_f3_ambiental:     NEVERA_F3_AMBIENTAL,
  nevera_f4_deshielo:      NEVERA_F4_DESHIELO,
  nevera_f5_ventcongelador: NEVERA_F5_VENTCONGELADOR,
  nevera_f6_ventrefri:     NEVERA_F6_VENTREFRI,
};
