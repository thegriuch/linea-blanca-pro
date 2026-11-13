import type { DiagnosticTree } from '@/types/diagnostico';

// ─── "Tecnología Inverter" — nodos compartidos tras voltaje/amperaje ──────────
// Este bloque se distribuye (spread) dentro de cada árbol que tenga el portón
// `inverter_gate` (o equivalente), después de la medición de voltaje y amperaje.
// Compartir la definición garantiza un flujo idéntico en todos los diagnósticos.
export const INVERTER_TREE: DiagnosticTree = {
  // La medición de salida va inmediatamente después de la evidencia de la
  // tarjeta inverter (etapa previa del flujo) y antes de cualquier otra pregunta.
  medir_senal: {
    id: 'medir_senal', type: 'measure',
    text: 'Medir señal de salida del módulo Inverter hacia el compresor (terminales U, V, W)',
    detail: 'Con el equipo energizado y el compresor intentando arrancar, mide AC entre cada par de terminales: U-V, U-W, V-W. El rango esperado parte de 40 V y llega hasta 230 V AC según modelo y velocidad de operación, y los tres valores deben ser similares entre sí.',
    tip: 'Si los tres valores son similares y el compresor no gira, el compresor está bloqueado. Si algún valor es 0 o muy diferente, el módulo tiene falla en la etapa de potencia.',
    gifUri: 'medir-senal-inverter',
    nextId: 'senal_ok',
  },
  senal_ok: {
    id: 'senal_ok', type: 'question',
    text: '¿Los tres terminales (U–V, U–W, V–W) muestran señal AC similar entre sí?',
    options: [
      { label: 'Sí, señales balanceadas y similares', nextId: 'medir_bobinas_inv', color: 'neutral' },
      { label: 'No, algún terminal en 0 o con valor muy diferente', nextId: 'ev_falla_modulo', color: 'danger' },
    ],
  },
  ev_falla_modulo: {
    id: 'ev_falla_modulo', type: 'evidence',
    text: 'Registrar la salida de la tarjeta inverter',
    detail: 'Fotografía la tarjeta y el multímetro mostrando la medición entre U-V, U-W y V-W con el equipo en intento de arranque. Anota si la tarjeta muestra algún código de error o LED de diagnóstico.',
    evidenceLabel: 'Foto de la tarjeta inverter y la medición en la salida U, V, W',
    nextId: 'confirma_codigo_modulo',
  },
  confirma_codigo_modulo: {
    id: 'confirma_codigo_modulo', type: 'question',
    text: '¿La tarjeta inverter muestra algún código de error o LED de falla?',
    detail: 'Si ya validaste un código en el paso inicial, la falla del módulo queda confirmada. Si no muestra ningún código ni LED, hay que descartar el arnés y las conexiones antes de reemplazar la tarjeta.',
    options: [
      { label: 'No muestra ningún código ni LED', nextId: 'verif_conexiones_inv', color: 'danger' },
      { label: 'Sí muestra código o LED de falla', nextId: 'result_modulo_falla', color: 'neutral' },
    ],
  },
  verif_conexiones_inv: {
    id: 'verif_conexiones_inv', type: 'measure',
    text: 'Verificar conexiones entre la tarjeta principal y el módulo inverter',
    detail: 'Con el equipo desconectado revisa el conector y el arnés entre la tarjeta principal y el módulo: pines flojos, quemados u oxidados, terminales de U/V/W bien apretados y continuidad de cada hilo. Vuelve a conectar y mide la señal de control (PWM o 0–5 V) que la principal envía al módulo.',
    tip: 'Un conector quemado o un terminal flojo produce el mismo síntoma que una tarjeta dañada: entra alimentación y no hay salida. Descarta el arnés antes de cambiar el módulo.',
    evidenceLabel: 'Foto del conector/arnés y de la señal de control de la principal',
    nextId: 'conexiones_inv_ok',
  },
  conexiones_inv_ok: {
    id: 'conexiones_inv_ok', type: 'question',
    text: '¿Encuentras conexiones, continuidad o señal de control con falla?',
    options: [
      { label: 'Sí, conexiones o señal de control con falla', nextId: 'result_conexiones_inv', color: 'danger' },
      { label: 'No, conexiones y señal correctas', nextId: 'result_tarjeta_inv', color: 'neutral' },
    ],
  },
  result_conexiones_inv: {
    id: 'result_conexiones_inv', type: 'result',
    text: 'Falla en conexiones entre la tarjeta principal y el módulo inverter',
    result: {
      causes: [
        { cause: 'Conector o pin quemado, flojo u oxidado entre principal y módulo', probability: 50 },
        { cause: 'Arnés con hilo abierto o terminal mal apretado en U/V/W', probability: 35 },
        { cause: 'Señal de control de la principal interrumpida en el recorrido', probability: 15 },
      ],
      recommendation: 'Reparar el conector y los terminales, y reemplazar el arnés si hay hilos abiertos. Confirmar la señal de control de la principal y la salida en U-V/U-W/V-W antes de reemplazar la tarjeta inverter.',
      parts: ['Arnés / conector', 'Terminales U, V, W'],
    },
  },
  result_tarjeta_inv: {
    id: 'result_tarjeta_inv', type: 'result',
    text: 'Tarjeta inverter dañada: recibe alimentación y no entrega salida',
    result: {
      causes: [
        { cause: 'Etapa de potencia (IGBT/MOSFET) del módulo sin conmutación', probability: 70 },
        { cause: 'Fuente interna o gate driver del módulo dañado', probability: 20 },
        { cause: 'Señal de control de la tarjeta principal ausente', probability: 10 },
      ],
      recommendation: 'Con alimentación presente, sin salida en U-V/U-W/V-W, conexiones y señal de control correctas y sin código de error, la falla está en la tarjeta inverter. Descarga los capacitores y confirma que el compresor no esté en corto antes de instalar el módulo nuevo.',
      parts: ['Tarjeta inverter / módulo driver', 'Compresor Inverter'],
    },
  },
  result_modulo_falla: {
    id: 'result_modulo_falla', type: 'result',
    text: 'Módulo Inverter con falla declarada — revisar y reemplazar',
    result: {
      causes: [
        { cause: 'IGBT/MOSFET de salida del módulo defectuoso', probability: 60 },
        { cause: 'Circuito de disparo (gate driver) o fuente interna dañada', probability: 25 },
        { cause: 'Falla de comunicación entre tarjeta principal y módulo', probability: 15 },
      ],
      recommendation: 'Descarga los capacitores antes de manipular. Confirma que el compresor no esté en corto (U-V, U-W, V-W iguales y sin continuidad a tierra) para no dañar el módulo nuevo. Solicita el módulo con la referencia exacta.',
      parts: ['Módulo Inverter / Driver', 'Tarjeta inverter', 'Compresor Inverter'],
    },
  },
  // ── Validación del compresor: bobinas en rango y aislamiento a tierra ──────
  medir_bobinas_inv: {
    id: 'medir_bobinas_inv', type: 'measure',
    text: 'Medir las bobinas del compresor Inverter (U-V, U-W, V-W) desenergizado',
    detail: 'Descarga los capacitores y desconecta los cables del compresor. En escala de ohmios mide las tres fases: U-V, U-W y V-W. Las tres lecturas deben ser IDÉNTICAS entre sí (balanceadas), típicamente entre 0.5 y 4 Ω en compresores inverter pequeños y hasta 1–10 Ω según el modelo. Compara con el valor de la placa del compresor.',
    tip: 'Lecturas desbalanceadas entre fases (más de 10% de diferencia) = devanado con corto entre espiras. Una fase en abierto (∞) = devanado roto. Compara siempre con la placa.',
    gifUri: 'medir-bobinas',
    evidenceLabel: 'Foto de las tres mediciones de bobinas (U-V, U-W, V-W) y la placa del compresor',
    nextId: 'bobinas_inv_ok',
  },
  bobinas_inv_ok: {
    id: 'bobinas_inv_ok', type: 'question',
    text: '¿Las tres fases miden idénticas entre sí y dentro del rango de placa?',
    options: [
      { label: 'Sí, balanceadas y en rango', nextId: 'tierra_inv', color: 'success' },
      { label: 'No, desbalanceadas o con fase abierta', nextId: 'result_compresor_inverter', color: 'danger' },
    ],
  },
  tierra_inv: {
    id: 'tierra_inv', type: 'measure',
    text: 'Verificar aislamiento a tierra de las bobinas del compresor',
    detail: 'Con el compresor desconectado, mide continuidad/resistencia entre cada terminal (U, V, W) y el cuerpo del compresor (cobre desnudo o tornillo de la carcasa). Debe marcar ABIERTO (∞ / OL). Cualquier lectura de continuidad, o menos de 2 MΩ, significa bobinas caídas a tierra: el compresor no es reparable.',
    tip: 'Usa la escala de ohmios más alta del multímetro. Una caída a tierra bajo el módulo inverter lo destruye al instalar uno nuevo: valida esto ANTES de cambiar el módulo.',
    gifUri: 'medir-continuidad-tierra',
    evidenceLabel: 'Foto de la medición de cada terminal contra tierra (debe marcar OL/∞)',
    nextId: 'tierra_inv_ok',
  },
  tierra_inv_ok: {
    id: 'tierra_inv_ok', type: 'question',
    text: '¿Las bobinas están caídas a tierra (continuidad con la carcasa)?',
    options: [
      { label: 'Sí, hay continuidad a tierra', nextId: 'result_compresor_tierra', color: 'danger' },
      { label: 'No, aislamiento correcto (OL)', nextId: 'result_compresor_inverter', color: 'neutral' },
    ],
  },
  result_compresor_tierra: {
    id: 'result_compresor_tierra', type: 'result',
    text: 'Compresor Inverter con bobinas caídas a tierra — reemplazo obligatorio',
    result: {
      causes: [
        { cause: 'Aislamiento de los devanados degradado (bobinas caídas a tierra)', probability: 85 },
        { cause: 'Humedad interna del compresor que condujo a la carcasa', probability: 15 },
      ],
      recommendation: 'El compresor no es reparable: reemplazarlo con la referencia exacta. NO instalar un módulo inverter nuevo sin cambiar el compresor: la caída a tierra destruye el IGBT del módulo al energizar. Verificar también el filtro secante (humedad del sistema).',
      parts: ['Compresor Inverter', 'Filtro secante'],
    },
  },
  result_compresor_inverter: {
    id: 'result_compresor_inverter', type: 'result',
    text: 'Compresor Inverter bloqueado o con bobinas defectuosas — solicitar reemplazo',
    result: {
      causes: [
        { cause: 'Devanados del compresor desbalanceados, en corto entre espiras o abiertos', probability: 50 },
        { cause: 'Compresor inverter bloqueado mecánicamente', probability: 35 },
        { cause: 'Sensor de posición del rotor defectuoso', probability: 15 },
      ],
      recommendation: 'Con bobinas desbalanceadas o abiertas (verificadas contra la placa), el compresor se reemplaza con la referencia exacta. Si las bobinas y el aislamiento están correctos pero no gira con señal balanceada, está bloqueado mecánicamente: reemplazar también. Verificar el aislamiento a tierra del nuevo antes de energizar.',
      parts: ['Compresor Inverter'],
    },
  },
};
