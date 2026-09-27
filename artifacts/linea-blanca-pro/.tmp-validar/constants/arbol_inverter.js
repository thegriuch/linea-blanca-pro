"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.INVERTER_TREE = void 0;
// ─── "Tecnología Inverter" — nodos compartidos tras voltaje/amperaje ──────────
// Este bloque se distribuye (spread) dentro de cada árbol que tenga el portón
// `inverter_gate` (o equivalente), después de la medición de voltaje y amperaje.
// Compartir la definición garantiza un flujo idéntico en todos los diagnósticos.
exports.INVERTER_TREE = {
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
        gifUri: 'medir-señal-inverter',
        nextId: 'senal_ok',
    },
    senal_ok: {
        id: 'senal_ok', type: 'question',
        text: '¿Los tres terminales (U–V, U–W, V–W) muestran señal AC similar entre sí?',
        options: [
            { label: 'Sí, señales balanceadas y similares', nextId: 'result_compresor_inverter', color: 'neutral' },
            { label: 'No, algún terminal en 0 o con valor muy diferente', nextId: 'result_modulo_salida', color: 'danger' },
        ],
    },
    result_compresor_inverter: {
        id: 'result_compresor_inverter', type: 'result',
        text: 'Compresor Inverter bloqueado o defectuoso — solicitar reemplazo',
        result: {
            causes: [
                { cause: 'Compresor inverter bloqueado mecánicamente', probability: 55 },
                { cause: 'Devanados del compresor inverter en corto o abiertos', probability: 35 },
                { cause: 'Sensor de posición del rotor defectuoso', probability: 10 },
            ],
            recommendation: 'Medir resistencia entre U-V, U-W, V-W en el compresor (deben ser idénticos, típicamente 1–10 Ω). Verificar que no haya continuidad a tierra. Solicitar compresor inverter con la referencia exacta del equipo.',
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
