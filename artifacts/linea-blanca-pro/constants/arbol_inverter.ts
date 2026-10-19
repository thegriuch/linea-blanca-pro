import type { DiagnosticTree } from '@/types/diagnostico';

// ─── "Tecnología Inverter" — nodos compartidos tras voltaje/amperaje ──────────
// Este bloque se distribuye (spread) dentro de cada árbol que tenga el portón
// `inverter_gate` (o equivalente), después de la medición de voltaje y amperaje.
// Compartir la definición garantiza un flujo idéntico en todos los diagnósticos.
export const INVERTER_TREE: DiagnosticTree = {
  inv_start: {
    id: 'inv_start', type: 'evidence',
    text: 'Registrar placa del compresor y módulo Inverter (driver)',
    detail: 'Toma una foto legible de la referencia del compresor, del módulo Inverter y de cualquier LED o indicación visible. Esta evidencia permite solicitar el repuesto correcto.',
    tip: 'Indicios de compresor Inverter: módulo electrónico grande cerca del compresor, sin relé PTC externo visible y frecuencia variable audible al operar.',
    evidenceLabel: 'Foto de placa del compresor y módulo Inverter',
    nextId: 'check_modulo',
  },
  check_modulo: {
    id: 'check_modulo', type: 'question',
    text: '¿El módulo Inverter muestra señal de falla? (LED parpadeante, código en display, o sin respuesta)',
    detail: 'Algunos módulos tienen LEDs de diagnóstico. Consulta el manual técnico del equipo para interpretar el patrón de parpadeos o el código mostrado.',
    options: [
      { label: 'Sí, muestra falla o no responde', nextId: 'ev_falla_modulo', color: 'danger' },
      { label: 'No, módulo sin indicación de falla visible', nextId: 'medir_senal', color: 'neutral' },
    ],
  },
  ev_falla_modulo: {
    id: 'ev_falla_modulo', type: 'evidence',
    text: 'Registrar el código / indicación de falla del módulo Inverter',
    detail: 'Fotografía el módulo mostrando el LED o código de error. Anota exactamente el patrón de parpadeos o el código numérico para el informe.',
    evidenceLabel: 'Foto del módulo Inverter mostrando falla',
    nextId: 'result_modulo_falla',
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
  medir_senal: {
    id: 'medir_senal', type: 'measure',
    text: 'Medir señal de salida del módulo Inverter hacia el compresor (terminales U, V, W)',
    detail: 'Con el equipo energizado y el compresor intentando arrancar, mide AC entre cada par de terminales: U-V, U-W, V-W. Deben mostrar valores similares entre sí (20–200 V AC según modelo y velocidad de operación).',
    tip: 'Si los tres valores son similares y el compresor no gira → el compresor está bloqueado. Si algún valor es 0 o muy diferente → el módulo tiene falla en la etapa de potencia.',
    gifUri: 'medir-senal-inverter',
    nextId: 'senal_ok',
  },
  senal_ok: {
    id: 'senal_ok', type: 'question',
    text: '¿Los tres terminales (U–V, U–W, V–W) muestran señal AC similar entre sí?',
    options: [
      { label: 'Sí, señales balanceadas y similares', nextId: 'medir_bobinas_inv', color: 'neutral' },
      { label: 'No, algún terminal en 0 o con valor muy diferente', nextId: 'result_modulo_salida', color: 'danger' },
    ],
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
    tip: 'Usa la escala de ohmios más alta del multímetro. Una caída a tierra bajo el módulo inverter lo destruye al instalarlo nuevo: valida esto ANTES de cambiar el módulo.',
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
  result_modulo_salida: {
    id: 'result_modulo_salida', type: 'result',
    text: 'Módulo Inverter con falla en etapa de salida — solicitar reemplazo',
    result: {
      causes: [
        { cause: 'IGBT/MOSFET de salida del módulo defectuoso', probability: 75 },
        { cause: 'Circuito de disparo (gate driver) dañado', probability: 25 },
      ],
      recommendation: 'Señal desbalanceada confirma falla en la etapa de potencia del módulo inverter. Solicitar reemplazo con la referencia exacta. Antes de instalar, verificar que el compresor no esté en corto para no dañar el módulo nuevo.',
      parts: ['Módulo Inverter / Driver'],
    },
  },
};
