import type { DiagnosticTree } from '@/types/diagnostico';

// ─── "No Enfría" — árbol fiel al diagrama oficial de flujo ───────────────────
const NOENFRIA: DiagnosticTree = {

  // ── INICIO ────────────────────────────────────────────────────────────────
  start: {
    id: 'start', type: 'question',
    text: '¿Enciende la luz del selector o display del producto?',
    detail: 'Verifica si hay luz interior al abrir la puerta, o si el display/selector muestra alguna señal de vida. Realiza la verificación inicial de encendido.',
    options: [
      { label: 'No enciende nada', nextId: 'revisar_cables_selector', color: 'danger' },
      { label: 'Sí, enciende normalmente', nextId: 'ev_corriente', color: 'success' },
    ],
  },

  // ── NO ENCIENDE → revisar cables, energía y selector ─────────────────────
  revisar_cables_selector: {
    id: 'revisar_cables_selector', type: 'action',
    text: 'Revisar cables y energía; revisar/reemplazar selector y tomar evidencia de voltaje',
    detail: 'Verifica voltaje en la toma eléctrica (120 V o según especificación). Revisa el cable de poder y la clavija. Inspecciona el selector de temperatura y reemplázalo si no da continuidad.',
    tip: 'Toma foto del voltaje medido en la toma y del estado del selector/cable. Esta evidencia es necesaria para justificar el repuesto.',
    nextId: 'result_sin_encendido',
  },
  result_sin_encendido: {
    id: 'result_sin_encendido', type: 'result',
    text: 'Falla en alimentación eléctrica o selector',
    result: {
      causes: [
        { cause: 'Selector de temperatura defectuoso', probability: 45 },
        { cause: 'Sin voltaje en toma eléctrica', probability: 30 },
        { cause: 'Cable de poder o clavija dañada', probability: 25 },
      ],
      recommendation: 'Verificar voltaje en toma (debe ser el nominal ±10 %). Si hay voltaje, medir continuidad del selector. Reemplazar el selector si falla. Documentar con foto del voltaje y estado del cable.',
      parts: ['Selector de temperatura', 'Cable de poder'],
    },
  },

  // ── SÍ ENCIENDE → verificar corriente al compresor ───────────────────────
ev_corriente: {
    id: 'ev_corriente', type: 'evidence',
    text: 'Verificar corriente al compresor y anexar evidencia',
    detail: 'Con pinza amperimétrica, mide el amperaje consumido por el compresor durante el intento de arranque. Compara con el valor RLA de la placa.',
    evidenceLabel: 'Foto del amperaje en compresor (pinza + display)',
    gifUri: 'medir-amperaje',
    nextId: 'consumo_bajo',
  },
  consumo_bajo: {
    id: 'consumo_bajo', type: 'question',
    text: '¿El consumo del compresor es bajo? (menor al RLA de placa)',
    detail: 'El RLA (Running Load Amps) está en la placa del compresor. Consumo muy bajo (<1 A) indica que el compresor casi no trabaja. Consumo normal o alto indica que sí intenta operar.',
    tip: 'RLA normal para compresores domésticos: 1.5–4 A según modelo. Si el compresor no arranca, el consumo puede ser 0 A.',
    options: [
      { label: 'Sí, consumo muy bajo (<1 A)', nextId: 'validar_presion_baja', color: 'neutral' },
      { label: 'No, consumo normal o alto', nextId: 'continuidad_tierra', color: 'neutral' },
    ],
  },

  // ── CONSUMO BAJO → validar presión ───────────────────────────────────────
validar_presion_baja: {
    id: 'validar_presion_baja', type: 'evidence',
    text: 'Validar presión con manómetros, tomar evidencia y anexar',
    detail: 'Conecta el kit de manómetros al sistema. Un sistema con carga correcta muestra presión de equilibrio estático según el refrigerante y temperatura ambiente.',
    tip: 'R134a estático a 25 °C: 50–80 psi. R600a estático a 25 °C: 30–35 psi. Anota el tipo de refrigerante de la placa.',
    evidenceLabel: 'Foto de manómetros con presión estática',
    gifUri: 'manometros',
    nextId: 'presion_muy_baja',
  },
  presion_muy_baja: {
    id: 'presion_muy_baja', type: 'question',
    text: '¿La presión estática está muy baja (casi 0 o negativa)?',
    detail: 'Presión cercana a 0 psi o en vacío indica que el sistema no tiene refrigerante suficiente. Si la presión es normal, el problema puede ser el control/termostato que no ordena el arranque.',
    options: [
      { label: 'Sí, presión muy baja o en vacío', nextId: 'prueba_vacio', color: 'danger' },
      { label: 'No, presión estática normal', nextId: 'check_termostato', color: 'neutral' },
    ],
  },

  // Presión normal con consumo bajo → termostato / control no ordena arranque
  check_termostato: {
    id: 'check_termostato', type: 'measure',
    text: 'Medir señal del termostato / control electrónico al compresor',
    detail: 'Con el equipo energizado y en modo frío, mide si llega voltaje a los terminales del compresor. Si no llega voltaje, el termostato o tarjeta no está ordenando el arranque.',
    tip: 'Debe haber voltaje nominal en los terminales del compresor cuando el termostato pide frío. Si no hay señal, el control es la falla.',
    nextId: 'result_termostato',
  },
  result_termostato: {
    id: 'result_termostato', type: 'result',
    text: 'Control o termostato no ordena arranque',
    result: {
      causes: [
        { cause: 'Termostato defectuoso', probability: 55 },
        { cause: 'Tarjeta de control dañada', probability: 30 },
        { cause: 'Sensor NTC en corto o abierto', probability: 15 },
      ],
      recommendation: 'Verificar que el termostato envíe señal al compresor (debe pedir frío a temperatura ambiente). Probar en bypass. Si tiene tarjeta electrónica, revisar códigos de error en display.',
      parts: ['Termostato', 'Tarjeta de control', 'Sensor NTC'],
    },
  },

  // Presión muy baja → prueba de vacío
prueba_vacio: {
    id: 'prueba_vacio', type: 'action',
    text: 'Prueba de vacío con bomba',
    detail: 'Recupera el refrigerante. Conecta la bomba de vacío y haz vacío completo del sistema (400–500 micrones). Cierra las válvulas y observa el manómetro por 15 minutos sin bomba.',
    tip: 'Si el vacío sube (pierde), hay fuga activa. Si se mantiene estable, el sistema es hermético pero tiene baja carga.',
    gifUri: 'prueba-vacio',
    nextId: 'pierde_vacio',
  },
  pierde_vacio: {
    id: 'pierde_vacio', type: 'question',
    text: '¿Se pierde el vacío tras 15 minutos?',
    options: [
      { label: 'No, retiene el vacío (sistema hermético)', nextId: 'recargar_baja_carga', color: 'success' },
      { label: 'Sí, pierde el vacío (hay fuga)', nextId: 'prueba_jabonosa', color: 'danger' },
    ],
  },

  // Retiene vacío → recargar por baja carga
  recargar_baja_carga: {
    id: 'recargar_baja_carga', type: 'action',
    text: 'Recargar gas por baja carga y tomar evidencias de prueba, consumo y presiones',
    detail: 'El sistema es hermético pero tiene baja carga. Recarga según el peso exacto de la placa. Cambia el filtro secante. Documenta el consumo final y las presiones de operación.',
    tip: 'Usa la cantidad exacta indicada en la placa (gramos o libras). La sobrecarga también causa falla de enfriamiento.',
    gifUri: 'carga-refrigerante',
    nextId: 'result_baja_carga',
  },
  result_baja_carga: {
    id: 'result_baja_carga', type: 'result',
    text: 'Baja carga de refrigerante — sistema hermético',
    result: {
      causes: [
        { cause: 'Gas consumido por micro fuga previa ya inactiva', probability: 70 },
        { cause: 'Servicio previo con carga incorrecta (subrecarga)', probability: 20 },
        { cause: 'Capilar parcialmente obstruido', probability: 10 },
      ],
      recommendation: 'Recargar al peso exacto de placa. Cambiar filtro secante nuevo. Documentar evidencias de prueba de vacío, consumo final y presiones de operación.',
      parts: ['Refrigerante (según placa)', 'Filtro secante'],
    },
  },

  // Pierde vacío → prueba jabonosa
prueba_jabonosa: {
    id: 'prueba_jabonosa', type: 'action',
    text: 'Prueba jabonosa en tuberías visibles',
    detail: 'Presuriza el sistema con nitrógeno seco a 100–150 psi. Aplica agua jabonosa o detector de fugas en todas las uniones, soldaduras, válvulas y tuberías visibles. Busca burbujas.',
    tip: 'Revisa especialmente: uniones del compresor, filtro secante, capilar y válvulas de servicio. La fuga puede ser lenta — espera unos segundos en cada punto.',
    gifUri: 'prueba-jabonosa',
    nextId: 'fuga_visible',
  },
  fuga_visible: {
    id: 'fuga_visible', type: 'question',
    text: '¿Fuga visible en tubería exterior?',
    options: [
      { label: 'Sí, fuga localizada', nextId: 'ev_fuga', color: 'danger' },
      { label: 'No, sin fuga visible exterior', nextId: 'result_fuga_interna', color: 'neutral' },
    ],
  },
  ev_fuga: {
    id: 'ev_fuga', type: 'evidence',
    text: 'Tomar evidencia, reparar fuga, barrer sistema y cambiar filtro',
    detail: 'Fotografía la fuga localizada. Procede a reparar la fuga, barre el sistema con nitrógeno seco y reemplaza el filtro secante antes de recargar.',
    evidenceLabel: 'Foto de la fuga en tubería/unión',
    nextId: 'result_fuga_exterior',
  },
  result_fuga_exterior: {
    id: 'result_fuga_exterior', type: 'result',
    text: 'Fuga exterior reparada — recargar gas y documentar',
    result: {
      causes: [
        { cause: 'Fuga en tubería o unión exterior', probability: 85 },
        { cause: 'Soldadura deficiente en servicio previo', probability: 10 },
        { cause: 'Vibración que causó fractura en tubería', probability: 5 },
      ],
      recommendation: 'Recargar gas según especificación. Documentar consumo, presiones de operación y resultado de la prueba jabonosa final.',
      parts: ['Filtro secante', 'Refrigerante (según placa)', 'Material de soldadura'],
    },
  },
  result_fuga_interna: {
    id: 'result_fuga_interna', type: 'result',
    text: 'Fuga interna — solicitar cambio del producto',
    result: {
      causes: [
        { cause: 'Fuga en evaporador (dentro de aislante o pared del gabinete)', probability: 55 },
        { cause: 'Fuga en capilar en zona no accesible', probability: 25 },
        { cause: 'Micro fuga en unión interna', probability: 20 },
      ],
      recommendation: 'Solicitar cambio del producto por fuga interna. Validar que no haya fisuras visibles en las paredes del gabinete. Documentar prueba de vacío fallida y prueba jabonosa como evidencia.',
      parts: ['Producto (cambio por garantía)'],
    },
  },

  // ── CONSUMO NORMAL/ALTO → continuidad a tierra ───────────────────────────
continuidad_tierra: {
    id: 'continuidad_tierra', type: 'measure',
    text: 'Medir continuidad a tierra de las bobinas del compresor',
    detail: 'Con el equipo DESENERGIZADO, mide resistencia entre cada terminal del compresor (C, S, R) y el chasis metálico (tierra). NO debe haber continuidad (debe marcar infinito / OL).',
    tip: 'Si hay continuidad a tierra, el devanado hace contacto con la carcasa — riesgo eléctrico. Documenta con foto antes de continuar.',
    gifUri: 'medir-continuidad-tierra',
    nextId: 'hay_continuidad_tierra',
  },
  hay_continuidad_tierra: {
    id: 'hay_continuidad_tierra', type: 'question',
    text: '¿Hay continuidad a tierra?',
    options: [
      { label: 'Sí, hay continuidad a tierra', nextId: 'ev_compresor_corto', color: 'danger' },
      { label: 'No, infinito en todos los terminales', nextId: 'medir_bobinas', color: 'success' },
    ],
  },
  ev_compresor_corto: {
    id: 'ev_compresor_corto', type: 'evidence',
    text: 'Tomar evidencia y solicitar compresor',
    detail: 'Registra la medición con foto. Verifica que el cable del compresor no tenga el aislante dañado antes de solicitar el repuesto.',
    evidenceLabel: 'Foto de medición compresor a tierra (multímetro)',
    nextId: 'result_compresor_corto',
  },
  result_compresor_corto: {
    id: 'result_compresor_corto', type: 'result',
    text: 'Compresor en corto a tierra — solicitar reemplazo',
    result: {
      causes: [
        { cause: 'Compresor en corto a tierra (devanado)', probability: 90 },
        { cause: 'Cable del compresor con aislante dañado tocando chasis', probability: 10 },
      ],
      recommendation: 'Verificar integridad del cable del compresor. Si el cable está bien, solicitar reemplazo de compresor con evidencia de la medición a tierra.',
      parts: ['Compresor'],
    },
  },

  // No continuidad a tierra → medir bobinas
medir_bobinas: {
    id: 'medir_bobinas', type: 'measure',
    text: 'Medir bobinas del compresor (terminales C, S, R)',
    detail: 'Mide la resistencia entre los tres pares: C–S, C–R, S–R. Deben cumplir: C–S + C–R ≈ S–R. Valores típicos: 5–30 Ω según modelo. Anota los tres valores.',
    tip: 'Si algún par marca infinito (OL), esa bobina está abierta. Si todos marcan 0 Ω, hay corto interno.',
    gifUri: 'medir-bobinas',
    nextId: 'bobina_infinito',
  },
  bobina_infinito: {
    id: 'bobina_infinito', type: 'question',
    text: '¿Alguna bobina marca infinito (circuito abierto)?',
    options: [
      { label: 'Sí, una o más en infinito', nextId: 'ev_bobina_abierta', color: 'danger' },
      { label: 'No, todas tienen resistencia', nextId: 'medir_ptc', color: 'success' },
    ],
  },
  ev_bobina_abierta: {
    id: 'ev_bobina_abierta', type: 'evidence',
    text: 'Tomar evidencia de las 3 bobinas y solicitar compresor',
    detail: 'Fotografía las tres mediciones. Confirma que los terminales no estén flojos o corroídos antes de solicitar el repuesto.',
    evidenceLabel: 'Foto de medición de las 3 bobinas (C-S, C-R, S-R)',
    nextId: 'result_compresor_abierto',
  },
  result_compresor_abierto: {
    id: 'result_compresor_abierto', type: 'result',
    text: 'Compresor con bobina abierta — solicitar reemplazo',
    result: {
      causes: [
        { cause: 'Compresor con devanado abierto', probability: 92 },
        { cause: 'Terminal de compresor suelto o corroído', probability: 8 },
      ],
      recommendation: 'Confirmar que los terminales no estén sueltos ni corroídos. Si la conexión está bien, solicitar reemplazo del compresor con evidencia de las 3 mediciones.',
      parts: ['Compresor'],
    },
  },

  // Bobinas OK → medir kit PTC
medir_ptc: {
    id: 'medir_ptc', type: 'measure',
    text: 'Medir kit PTC (relé de arranque) y protector térmico',
    detail: 'Retira el PTC del compresor. Mide su resistencia: un PTC bueno tiene resistencia (kΩ); un PTC en corto marca ~0 Ω. Agita el protector térmico: debe hacer clic al sacudir.',
    tip: 'Valores normales del PTC: 10–50 Ω según modelo. El protector que no retorna indica sobrecalentamiento previo del compresor.',
    gifUri: 'medir-ptc',
    nextId: 'ptc_corto',
  },
  ptc_corto: {
    id: 'ptc_corto', type: 'question',
    text: '¿PTC en corto (≈0 Ω) o protector térmico se activa permanentemente?',
    options: [
      { label: 'Sí, PTC en corto o protector no retorna', nextId: 'ev_ptc', color: 'danger' },
      { label: 'No, kit PTC normal', nextId: 'tipo_inverter', color: 'success' },
    ],
  },

  // ── VALIDACIÓN INVERTER ──────────────────────────────────────────────────
  tipo_inverter: {
    id: 'tipo_inverter', type: 'question',
    text: '¿El compresor del equipo es tipo Inverter?',
    detail: 'Los compresores Inverter NO tienen relé PTC externo. Se alimentan desde un módulo driver (inverter board) que controla la velocidad. Revisa la placa del compresor o el manual del equipo.',
    tip: 'Indicios de compresor Inverter: módulo electrónico grande cerca del compresor, sin PTC externo visible, frecuencia variable audible al operar.',
    options: [
      { label: 'Sí, es compresor Inverter', nextId: 'inverter_ev_placa', color: 'neutral' },
      { label: 'No, es compresor convencional', nextId: 'verificar_presiones', color: 'success' },
    ],
  },
  inverter_ev_placa: {
    id: 'inverter_ev_placa', type: 'evidence',
    text: 'Tomar foto de la placa del compresor y del módulo Inverter (driver)',
    detail: 'Registra el número de modelo del compresor y del módulo inverter. Esta información es necesaria para solicitar el repuesto correcto.',
    evidenceLabel: 'Foto de placa del compresor y módulo inverter',
    nextId: 'inverter_check_modulo',
  },
  inverter_check_modulo: {
    id: 'inverter_check_modulo', type: 'question',
    text: '¿El módulo Inverter muestra señal de falla? (LED parpadeante, código en display, o sin respuesta)',
    detail: 'Algunos módulos tienen LEDs de diagnóstico. Consulta el manual técnico del equipo para interpretar el patrón de parpadeos o el código mostrado.',
    options: [
      { label: 'Sí, muestra falla o no responde', nextId: 'inverter_ev_falla_modulo', color: 'danger' },
      { label: 'No, módulo sin indicación de falla visible', nextId: 'inverter_medir_señal', color: 'neutral' },
    ],
  },
  inverter_ev_falla_modulo: {
    id: 'inverter_ev_falla_modulo', type: 'evidence',
    text: 'Registrar el código / indicación de falla del módulo Inverter',
    detail: 'Fotografía el módulo mostrando el LED o código de error. Anota exactamente el patrón de parpadeos o el código numérico para el informe.',
    evidenceLabel: 'Foto del módulo inverter mostrando falla',
    nextId: 'result_modulo_inverter',
  },
  inverter_medir_señal: {
    id: 'inverter_medir_señal', type: 'measure',
    text: 'Medir señal de salida del módulo Inverter hacia el compresor (terminales U, V, W)',
    detail: 'Con el equipo energizado y el compresor intentando arrancar, mide AC entre cada par de terminales: U-V, U-W, V-W. Deben mostrar valores similares entre sí (20–200 V AC según modelo y velocidad de operación).',
    tip: 'Si los tres valores son similares y el compresor no gira → el compresor está bloqueado. Si algún valor es 0 o muy diferente → el módulo tiene falla en la etapa de potencia.',
    gifUri: 'medir-señal-inverter',
    nextId: 'inverter_señal_ok',
  },
  inverter_señal_ok: {
    id: 'inverter_señal_ok', type: 'question',
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
  ev_ptc: {
    id: 'ev_ptc', type: 'evidence',
    text: 'Tomar evidencia y solicitar kit PTC',
    detail: 'Fotografía el PTC y la medición en el multímetro. Solicitar kit PTC + protector térmico.',
    evidenceLabel: 'Foto del PTC y medición en multímetro',
    nextId: 'result_ptc',
  },
  result_ptc: {
    id: 'result_ptc', type: 'result',
    text: 'Kit PTC o protector térmico defectuoso — reemplazar',
    result: {
      causes: [
        { cause: 'PTC (relé de arranque) defectuoso', probability: 75 },
        { cause: 'Protector térmico dañado / activado permanentemente', probability: 25 },
      ],
      recommendation: 'Reemplazar kit PTC y protector térmico. Verificar ventilación del condensador antes de instalar. Si el amperaje sigue alto después del reemplazo, evaluar compresor.',
      parts: ['Kit PTC', 'Protector térmico'],
    },
  },

  // PTC OK → verificar presiones con compresor encendido
  verificar_presiones: {
    id: 'verificar_presiones', type: 'measure',
    text: 'Verificar presiones con compresor encendido',
    detail: 'Conecta el kit de manómetros. Enciende el equipo y observa las presiones durante 3–5 minutos. La presión de baja debe BAJAR y la de alta debe SUBIR al arrancar el compresor.',
    tip: 'R134a en marcha: baja ≈ 0–15 psi, alta ≈ 100–200 psi. R600a: valores más bajos. Documenta con foto de manómetros + pinza amperimétrica al mismo tiempo.',
    gifUri: 'medir-presiones-marcha',
    nextId: 'variacion_presion',
  },
  variacion_presion: {
    id: 'variacion_presion', type: 'question',
    text: '¿Hay variación de presiones? (baja desciende, alta sube)',
    detail: 'Un sistema correcto muestra diferencia clara entre alta y baja al arrancar. Si ambos manómetros se quedan iguales, el compresor no está bombeando o hay obstrucción total.',
    options: [
      { label: 'No, presiones estables sin variación', nextId: 'ev_escalar', color: 'danger' },
      { label: 'Sí, hay variación de presiones', nextId: 'presion_alta_ruido', color: 'success' },
    ],
  },

  // Sin variación → anexar evidencia y escalar
  ev_escalar: {
    id: 'ev_escalar', type: 'evidence',
    text: 'Anexar evidencia y escalar a soporte técnico',
    detail: 'Toma foto de los manómetros sin variación y del amperaje en marcha. Documenta toda la ruta de diagnóstico seguida hasta este punto.',
    evidenceLabel: 'Foto de manómetros + consumo (sin variación de presión)',
    nextId: 'result_escalar',
  },
  result_escalar: {
    id: 'result_escalar', type: 'result',
    text: 'Sin variación de presiones — escalar a soporte técnico',
    result: {
      causes: [
        { cause: 'Compresor no bombea (desgaste de válvulas internas)', probability: 55 },
        { cause: 'Capilar completamente obstruido (sin flujo)', probability: 30 },
        { cause: 'Falla interna del compresor con consumo aparente', probability: 15 },
      ],
      recommendation: 'Adjuntar toda la evidencia fotográfica (consumo, presiones sin variación). Escalar a soporte técnico especializado con informe detallado del diagnóstico realizado.',
      parts: ['Compresor'],
    },
  },

  // Con variación → ¿presiones muy altas + ruido?
  presion_alta_ruido: {
    id: 'presion_alta_ruido', type: 'question',
    text: '¿Presiones muy altas con ruido y el compresor no arranca bien?',
    detail: 'Presiones de alta anormalmente elevadas (>300 psi en R134a) junto con ruido metálico y dificultad para arrancar indican falla mecánica del compresor.',
    tip: 'Si las variaciones son normales y no hay ruido, el problema es obstrucción en el circuito frigorífico.',
    options: [
      { label: 'Sí, presión alta anormal + ruido', nextId: 'ev_arranque_directo', color: 'danger' },
      { label: 'No, variaciones normales sin ruido anormal', nextId: 'barrido_nitrogeno', color: 'neutral' },
    ],
  },

  // Presión alta + ruido → tomar evidencia, arranque directo, solicitar compresor
  ev_arranque_directo: {
    id: 'ev_arranque_directo', type: 'evidence',
    text: 'Tomar evidencia, intento de arranque directo; grabar video y solicitar compresor',
    detail: 'Documenta las presiones elevadas con foto. Intenta dar arranque directo al compresor (si el diseño lo permite) y graba el comportamiento en video. Adjunta toda la evidencia para solicitar el repuesto.',
    evidenceLabel: 'Foto de presiones elevadas + video de arranque directo',
    nextId: 'result_compresor_mecanico',
  },
  result_compresor_mecanico: {
    id: 'result_compresor_mecanico', type: 'result',
    text: 'Compresor con falla mecánica — solicitar reemplazo',
    result: {
      causes: [
        { cause: 'Compresor con falla mecánica interna (biela, pistón)', probability: 70 },
        { cause: 'Válvulas del compresor dañadas bajo presión alta', probability: 20 },
        { cause: 'Capilar obstruido causando sobrepresión en alta', probability: 10 },
      ],
      recommendation: 'Solicitar reemplazo de compresor. Adjuntar evidencia fotográfica y video de arranque directo para justificar la solicitud del repuesto.',
      parts: ['Compresor'],
    },
  },

  // Variaciones normales sin ruido → obstrucción probable → barrido nitrógeno
  barrido_nitrogeno: {
    id: 'barrido_nitrogeno', type: 'action',
    text: 'Barrido con nitrógeno seco y validar',
    detail: 'Recupera el gas, abre el sistema y realiza barrido completo con nitrógeno a través del capilar y filtro secante. La obstrucción puede ser aceite quemado, humedad solidificada o partículas.',
    tip: 'Usa flujo de nitrógeno de alta presión por el lado de alta. Observa si salen residuos o partículas por el lado de baja.',
    gifUri: 'barrido-nitrogeno',
    nextId: 'mejoro_nitrogeno',
  },
  mejoro_nitrogeno: {
    id: 'mejoro_nitrogeno', type: 'question',
    text: '¿Mejoró tras el barrido con nitrógeno?',
    options: [
      { label: 'Sí, flujo libre', nextId: 'result_obstruccion_nitro', color: 'success' },
      { label: 'No, sigue obstruido', nextId: 'barrido_agentes', color: 'danger' },
    ],
  },
  result_obstruccion_nitro: {
    id: 'result_obstruccion_nitro', type: 'result',
    text: 'Obstrucción eliminada — recargar gas y cambiar filtro secante',
    result: {
      causes: [
        { cause: 'Capilar obstruido por humedad o partículas', probability: 65 },
        { cause: 'Filtro secante saturado', probability: 30 },
        { cause: 'Aceite quemado acumulado en capilar', probability: 5 },
      ],
      recommendation: 'Reemplazar filtro secante. Hacer vacío profundo (400–500 micrones). Recargar gas según especificación de placa. Documentar consumo y presiones finales.',
      parts: ['Filtro secante', 'Refrigerante (según placa)'],
    },
  },

  barrido_agentes: {
    id: 'barrido_agentes', type: 'action',
    text: 'Barrido con agentes limpiadores; presurizar 30 min y validar',
    detail: 'Usa agente limpiador especializado para sistemas de refrigeración (p. ej. Rx-11 flush). Inyecta por el sistema, presuriza a 30 psi con nitrógeno y deja reposar 30 minutos. Luego libera y verifica flujo.',
    tip: 'Los agentes disuelven residuos orgánicos que el nitrógeno no logra desalojar. Purga bien antes de hacer vacío.',
    nextId: 'mejoro_agentes',
  },
  mejoro_agentes: {
    id: 'mejoro_agentes', type: 'question',
    text: '¿Mejoró tras el barrido con agentes?',
    options: [
      { label: 'Sí, sistema desobstruido', nextId: 'result_obstruccion_agentes', color: 'success' },
      { label: 'No, persiste el problema', nextId: 'result_escalar_final', color: 'danger' },
    ],
  },
  result_obstruccion_agentes: {
    id: 'result_obstruccion_agentes', type: 'result',
    text: 'Obstrucción eliminada con agentes — recargar gas y cambiar filtro',
    result: {
      causes: [
        { cause: 'Obstrucción por aceite quemado o contaminantes orgánicos', probability: 80 },
        { cause: 'Capilar con bloqueo parcial disuelto por agente', probability: 20 },
      ],
      recommendation: 'Hacer vacío profundo. Reemplazar filtro secante. Recargar gas según especificación de placa. Documentar todo el proceso con evidencia fotográfica.',
      parts: ['Filtro secante', 'Refrigerante (según placa)'],
    },
  },
  result_escalar_final: {
    id: 'result_escalar_final', type: 'result',
    text: 'Obstrucción irresoluble — anexar evidencia y escalar',
    result: {
      causes: [
        { cause: 'Obstrucción grave irresoluble con métodos estándar', probability: 100 },
      ],
      recommendation: 'Adjuntar evidencia fotográfica completa (presiones, consumo, resultados de barridos con nitrógeno y agentes). Escalar a soporte técnico especializado con informe detallado.',
      parts: [],
    },
  },
};

// ─── "No Arranca Compresor" tree ──────────────────────────────────────────────
const NOARRANQUE: DiagnosticTree = {
  start: {
    id: 'start', type: 'question',
    text: '¿El compresor del equipo es tipo Inverter?',
    detail: 'Esta identificación se realiza después de validar el voltaje de alimentación y revisar si el equipo muestra un código de error.',
    options: [
      { label: 'Sí, es compresor Inverter', nextId: 'inverter_ev_placa', color: 'neutral' },
      { label: 'No, es compresor convencional', nextId: 'noarranque_voltaje', color: 'success' },
    ],
  },
  noarranque_voltaje: {
    id: 'noarranque_voltaje', type: 'question',
    text: '¿Hay voltaje en los terminales del compresor cuando el equipo pide frío?',
    detail: 'Con multímetro en modo voltaje AC, mide en los terminales de alimentación del compresor mientras el termostato pide frío.',
    options: [
      { label: 'No hay voltaje', nextId: 'revisar_control', color: 'danger' },
      { label: 'Sí, hay voltaje normal', nextId: 'ev_voltaje_compresor', color: 'success' },
    ],
  },
  revisar_control: {
    id: 'revisar_control', type: 'measure',
    text: 'Revisar termostato / tarjeta de control',
    detail: 'Traza el circuito desde la toma hasta el compresor. Busca si el relé de la tarjeta o el termostato está abriendo el circuito.',
    nextId: 'result_control',
  },
  result_control: {
    id: 'result_control', type: 'result',
    text: 'Falla en control o termostato',
    result: {
      causes: [
        { cause: 'Termostato defectuoso (no cierra circuito)', probability: 55 },
        { cause: 'Tarjeta de control sin señal de salida', probability: 35 },
        { cause: 'Fusible o relé interno quemado', probability: 10 },
      ],
      recommendation: 'Probar bypass del termostato para confirmar. Si arranca en bypass, reemplazar termostato. Si no arranca, revisar tarjeta.',
      parts: ['Termostato', 'Tarjeta de control', 'Relé'],
    },
  },
  ev_voltaje_compresor: {
    id: 'ev_voltaje_compresor', type: 'evidence',
    text: 'Registrar voltaje en compresor',
    evidenceLabel: 'Foto del voltaje medido en terminales',
    nextId: 'hay_zumbido',
  },
  hay_zumbido: {
    id: 'hay_zumbido', type: 'question',
    text: '¿El compresor zumba o hace intento de arranque pero no arranca?',
    options: [
      { label: 'Sí, zumba y se protege', nextId: 'ev_amperaje_arranque', color: 'neutral' },
      { label: 'No, silencio total', nextId: 'medir_bobinas_arranque', color: 'danger' },
    ],
  },
  ev_amperaje_arranque: {
    id: 'ev_amperaje_arranque', type: 'evidence',
    text: 'Registrar amperaje en intento de arranque',
    evidenceLabel: 'Foto de amperaje durante intento de arranque',
    nextId: 'result_ptc_o_compresor',
  },
  result_ptc_o_compresor: {
    id: 'result_ptc_o_compresor', type: 'result',
    text: 'Compresor atascado o PTC deficiente',
    result: {
      causes: [
        { cause: 'Kit PTC desgastado o incorrecto', probability: 50 },
        { cause: 'Compresor agarrotado mecánicamente', probability: 35 },
        { cause: 'Condensador caliente impidiendo arranque', probability: 15 },
      ],
      recommendation: 'Cambiar kit PTC. Verificar temperatura del condensador (debe estar limpio). Si persiste, solicitar compresor.',
      parts: ['Kit PTC', 'Protector térmico', 'Compresor'],
    },
  },
  medir_bobinas_arranque: {
    id: 'medir_bobinas_arranque', type: 'measure',
    text: 'Medir continuidad de bobinas del compresor',
    detail: 'Desenergiza. Mide entre C–S, C–R y S–R. Verifica también que no haya continuidad a tierra.',
    nextId: 'result_compresor_falla',
  },
  result_compresor_falla: {
    id: 'result_compresor_falla', type: 'result',
    text: 'Compresor con falla eléctrica interna',
    result: {
      causes: [
        { cause: 'Devanado abierto (bobina en infinito)', probability: 60 },
        { cause: 'Devanado en corto a tierra', probability: 30 },
        { cause: 'Compresor agarrotado (devanados ok pero no gira)', probability: 10 },
      ],
      recommendation: 'Confirmar con medición de las 3 bobinas. Solicitar reemplazo de compresor con evidencia.',
      parts: ['Compresor'],
    },
  },
};

// ─── "Ruido excesivo" tree ────────────────────────────────────────────────────
const RUIDOEXCESIVO: DiagnosticTree = {
  start: {
    id: 'start', type: 'question',
    text: '¿Cuándo se presenta principalmente el ruido?',
    options: [
      { label: 'Cuando el compresor arranca o funciona', nextId: 'ruido_compresor' },
      { label: 'Cuando circula el refrigerante (burbujeo)', nextId: 'ruido_refrigerante' },
      { label: 'Ruido mecánico / vibración constante', nextId: 'ruido_mecanico' },
    ],
  },
  ruido_compresor: {
    id: 'ruido_compresor', type: 'measure',
    text: 'Medir amperaje y presiones del compresor en marcha',
    detail: 'Un compresor ruidoso puede tener alto amperaje (desgaste mecánico) o trabajar contra presiones incorrectas.',
    gifUri: 'medicion-compresor-kalley',
    nextId: 'result_compresor_ruido',
  },
  result_compresor_ruido: {
    id: 'result_compresor_ruido', type: 'result',
    text: 'Ruido originado en el compresor',
    result: {
      causes: [
        { cause: 'Desgaste mecánico del compresor', probability: 55 },
        { cause: 'Compresor mal asegurado / amortiguadores desgastados', probability: 30 },
        { cause: 'Obstrucción generando presión anormal', probability: 15 },
      ],
      recommendation: 'Verificar soportes del compresor y amortiguadores. Si hay vibración excesiva, revisar que esté bien asegurado. Evaluar reemplazo si hay desgaste interno.',
      parts: ['Amortiguadores de compresor', 'Compresor'],
    },
  },
  ruido_refrigerante: {
    id: 'ruido_refrigerante', type: 'question',
    text: '¿El burbujeo/ruido es excesivo y constante o normal al inicio?',
    options: [
      { label: 'Normal al inicio del ciclo', nextId: 'result_normal' },
      { label: 'Excesivo y no para', nextId: 'result_presiones_ruido' },
    ],
  },
  result_normal: {
    id: 'result_normal', type: 'result',
    text: 'Sonido normal de refrigerante en circulación',
    result: {
      causes: [
        { cause: 'Sonido normal de expansión del refrigerante', probability: 95 },
        { cause: 'Baja carga de refrigerante (ruido más pronunciado)', probability: 5 },
      ],
      recommendation: 'El sonido de burbujeo al inicio del ciclo es normal. Si es muy pronunciado, verificar presión de carga del refrigerante.',
      parts: [],
    },
  },
  result_presiones_ruido: {
    id: 'result_presiones_ruido', type: 'result',
    text: 'Ruido excesivo de refrigerante — baja carga probable',
    result: {
      causes: [
        { cause: 'Baja carga de refrigerante', probability: 70 },
        { cause: 'Capilar con obstrucción parcial', probability: 20 },
        { cause: 'Fuga activa de refrigerante', probability: 10 },
      ],
      recommendation: 'Verificar presión de refrigerante con manómetros. Si está baja, localizar posible fuga y recargar.',
      parts: ['Refrigerante', 'Filtro secante'],
    },
  },
  ruido_mecanico: {
    id: 'ruido_mecanico', type: 'question',
    text: '¿El ruido/vibración es del ventilador o del compresor?',
    options: [
      { label: 'Del ventilador (interno o externo)', nextId: 'result_ventilador' },
      { label: 'Del compresor o estructura', nextId: 'result_estructura' },
    ],
  },
  result_ventilador: {
    id: 'result_ventilador', type: 'result',
    text: 'Falla en ventilador — ruido mecánico',
    result: {
      causes: [
        { cause: 'Rodamiento del motor del ventilador desgastado', probability: 60 },
        { cause: 'Aspa del ventilador rozando con escarcha o estructura', probability: 30 },
        { cause: 'Cuerpo extraño en el ventilador', probability: 10 },
      ],
      recommendation: 'Limpiar área del ventilador. Verificar que el aspa no roce. Si el rodamiento está seco o dañado, reemplazar motor del ventilador.',
      parts: ['Motor ventilador', 'Aspa de ventilador'],
    },
  },
  result_estructura: {
    id: 'result_estructura', type: 'result',
    text: 'Vibración estructural o del compresor',
    result: {
      causes: [
        { cause: 'Compresor mal nivelado o soportes desgastados', probability: 50 },
        { cause: 'Tuberías vibrando contra la estructura', probability: 30 },
        { cause: 'Piezas sueltas en el gabinete', probability: 20 },
      ],
      recommendation: 'Nivelar el equipo. Verificar que los soportes del compresor estén en buen estado. Revisar que tuberías no rocen con paredes internas.',
      parts: ['Soportes de compresor'],
    },
  },
};

// ─── "No enciende" arbol generico ───────────────────────────────────────────────
const NOENCIENDE: DiagnosticTree = {
  start: {
    id: 'start', type: 'measure',
    text: 'Verificar voltaje en la toma eléctrica',
    detail: 'Mide el voltaje en la toma con multímetro. El voltaje debe estar dentro del ±10% del nominal (110V o 220V según equipo).',
    nextId: 'hay_voltaje',
  },
  hay_voltaje: {
    id: 'hay_voltaje', type: 'question',
    text: '¿Hay voltaje correcto en la toma eléctrica?',
    options: [
      { label: 'No hay voltaje o es incorrecto', nextId: 'result_sin_voltaje', color: 'danger' },
      { label: 'Sí, voltaje correcto', nextId: 'ev_voltaje', color: 'success' },
    ],
  },
  result_sin_voltaje: {
    id: 'result_sin_voltaje', type: 'result',
    text: 'Sin voltaje en toma eléctrica',
    result: {
      causes: [
        { cause: 'Breaker o fusible principal abierto', probability: 50 },
        { cause: 'Instalación eléctrica dañada', probability: 30 },
        { cause: 'Toma eléctrica defectuosa', probability: 20 },
      ],
      recommendation: 'Verificar panel eléctrico. Revisar breaker del circuito. Si el problema persiste, contactar electricista.',
      parts: ['Breaker / fusible'],
    },
  },
  ev_voltaje: {
    id: 'ev_voltaje', type: 'evidence',
    text: 'Registrar voltaje medido en toma',
    evidenceLabel: 'Foto del multímetro con voltaje',
    nextId: 'revisar_cable',
  },
  revisar_cable: {
    id: 'revisar_cable', type: 'measure',
    text: 'Revisar cable, clavija y fusible interno del equipo',
    detail: 'Inspecciona visualmente el cable (sin daños, sin cortes). Mide continuidad del cable y clavija. Si el equipo tiene fusible interno, verifícalo.',
    nextId: 'cable_ok',
  },
  cable_ok: {
    id: 'cable_ok', type: 'question',
    text: '¿El cable y clavija están en buen estado?',
    options: [
      { label: 'No, hay falla en cable', nextId: 'result_cable', color: 'danger' },
      { label: 'Sí, están bien', nextId: 'result_tarjeta', color: 'success' },
    ],
  },
  result_cable: {
    id: 'result_cable', type: 'result',
    text: 'Falla en cable de poder, clavija',
    result: {
      causes: [
        { cause: 'Cable de poder cortado o dañado', probability: 66 },
        { cause: 'Clavija defectuosa', probability: 33 },
      ],
      recommendation: 'Reemplazar el componente dañado. Verificar causa del daño (puede indicar cortocircuito interno).',
      parts: ['Fusible', 'Cable de poder', 'Clavija'],
    },
  },
  result_tarjeta: {
    id: 'result_tarjeta', type: 'result',
    text: 'Posible falla en tarjeta principal o display',
    result: {
      causes: [
        { cause: 'Tarjeta principal dañada', probability: 60 },
        { cause: 'Panel de control / display defectuoso', probability: 25 },
        { cause: 'Selector de función dañado', probability: 15 },
      ],
      recommendation: 'Verificar si hay voltaje en la entrada de la tarjeta. Si hay voltaje pero no reacciona, evaluar reemplazo de tarjeta.',
      parts: ['Tarjeta de control', 'Display / panel'],
    },
  },
};

// ─── "No centrifuga" washer tree ─────────────────────────────────────────────
const NOCENTRIFUGA: DiagnosticTree = {
  start: {
    id: 'start', type: 'question',
    text: '¿La lavadora llega a la etapa de centrifugado pero no centrifuga, o se detiene antes?',
    options: [
      { label: 'Llega a centrifugado pero no gira', nextId: 'verificar_tapa', color: 'neutral' },
      { label: 'Se detiene antes / no avanza programa', nextId: 'result_control_lavadora', color: 'danger' },
    ],
  },
  verificar_tapa: {
    id: 'verificar_tapa', type: 'question',
    text: '¿El interruptor de tapa / puerta está funcionando correctamente?',
    detail: 'En la mayoría de lavadoras, si la tapa está abierta o el interruptor falla, no centrifuga por seguridad.',
    options: [
      { label: 'No, interruptor defectuoso', nextId: 'result_interruptor', color: 'danger' },
      { label: 'Sí, interruptor ok', nextId: 'revisar_correa', color: 'success' },
    ],
  },
  result_interruptor: {
    id: 'result_interruptor', type: 'result',
    text: 'Interruptor de tapa / puerta defectuoso',
    result: {
      causes: [
        { cause: 'Interruptor de tapa roto o desconectado', probability: 85 },
        { cause: 'Bisagra dañada que no activa el switch', probability: 15 },
      ],
      recommendation: 'Reemplazar interruptor de tapa. Verificar que el mecanismo de la tapa lo active correctamente.',
      parts: ['Interruptor de tapa', 'Cable del interruptor'],
    },
  },
  revisar_correa: {
    id: 'revisar_correa', type: 'question',
    text: '¿La lavadora tiene correa (no acople directo) y está en buen estado?',
    options: [
      { label: 'Correa rota o desgastada', nextId: 'result_correa', color: 'danger' },
      { label: 'Acople directo / correa bien', nextId: 'result_motor_lavadora', color: 'neutral' },
    ],
  },
  result_correa: {
    id: 'result_correa', type: 'result',
    text: 'Correa de la lavadora rota o desgastada',
    result: {
      causes: [
        { cause: 'Correa de transmisión rota', probability: 80 },
        { cause: 'Correa desgastada (patina)', probability: 20 },
      ],
      recommendation: 'Reemplazar correa. Verificar polea del motor y del tambor. Revisar la causa de rotura (sobrecarga, desalineación).',
      parts: ['Correa de transmisión'],
    },
  },
  result_motor_lavadora: {
    id: 'result_motor_lavadora', type: 'result',
    text: 'Posible falla en motor o módulo de control',
    result: {
      causes: [
        { cause: 'Motor dañado (devanados o escobillas)', probability: 45 },
        { cause: 'Módulo de control sin señal de centrifugado', probability: 35 },
        { cause: 'Capacitor del motor defectuoso', probability: 20 },
      ],
      recommendation: 'Medir continuidad del motor. Verificar que la tarjeta envíe señal en modo centrifugado. Revisar capacitor de arranque del motor.',
      parts: ['Motor', 'Capacitor', 'Módulo de control'],
    },
  },
  result_control_lavadora: {
    id: 'result_control_lavadora', type: 'result',
    text: 'Falla en programador o módulo de control',
    result: {
      causes: [
        { cause: 'Programador mecánico dañado', probability: 50 },
        { cause: 'Módulo electrónico con error', probability: 35 },
        { cause: 'Sensor de desequilibrio activado', probability: 15 },
      ],
      recommendation: 'Verificar si la lavadora muestra código de error. Revisar el programador. Si el desequilibrio es el problema, redistribuir ropa y probar.',
      parts: ['Programador', 'Módulo de control'],
    },
  },
};

// ─── "No desagua" washer tree ─────────────────────────────────────────────────
const NODESAGUA: DiagnosticTree = {
  start: {
    id: 'start', type: 'question',
    text: '¿La bomba de drenaje hace ruido cuando intenta desaguar?',
    options: [
      { label: 'No, no hace nada', nextId: 'revisar_bomba_voltaje', color: 'danger' },
      { label: 'Sí, zumba pero no desagua', nextId: 'obstruccion_bomba', color: 'neutral' },
    ],
  },
  revisar_bomba_voltaje: {
    id: 'revisar_bomba_voltaje', type: 'measure',
    text: 'Verificar voltaje en la bomba de drenaje',
    detail: 'En el ciclo de drenaje, mide si llega voltaje a los terminales de la bomba. Sin voltaje indica falla en control.',
    nextId: 'result_control_drenaje',
  },
  result_control_drenaje: {
    id: 'result_control_drenaje', type: 'result',
    text: 'Sin señal al módulo de drenaje',
    result: {
      causes: [
        { cause: 'Módulo de control no activa drenaje', probability: 60 },
        { cause: 'Cable de la bomba dañado', probability: 25 },
        { cause: 'Bomba en corto (protección del módulo)', probability: 15 },
      ],
      recommendation: 'Verificar continuidad de la bomba. Revisar módulo de control. Probar con bomba conocida buena si es posible.',
      parts: ['Bomba de drenaje', 'Módulo de control'],
    },
  },
  obstruccion_bomba: {
    id: 'obstruccion_bomba', type: 'action',
    text: 'Revisar y limpiar filtro y bomba de drenaje',
    detail: 'Accede al filtro de la bomba de drenaje (generalmente en la parte frontal inferior). Limpia el filtro. Verifica que no haya objetos (monedas, botones) bloqueando el impulsor de la bomba.',
    nextId: 'result_obstruccion_bomba',
  },
  result_obstruccion_bomba: {
    id: 'result_obstruccion_bomba', type: 'result',
    text: 'Obstrucción en bomba o filtro de drenaje',
    result: {
      causes: [
        { cause: 'Filtro de drenaje obstruido', probability: 55 },
        { cause: 'Impulsor de bomba bloqueado por objeto extraño', probability: 30 },
        { cause: 'Manguera de drenaje doblada o tapada', probability: 15 },
      ],
      recommendation: 'Limpiar filtro completamente. Verificar manguera de drenaje. Si el impulsor está trabado y la bomba no gira, reemplazar bomba.',
      parts: ['Bomba de drenaje'],
    },
  },
};

// ─── "No llena" washer tree ───────────────────────────────────────────────────
const NOLLENA: DiagnosticTree = {
  start: {
    id: 'start', type: 'question',
    text: '¿La electroválvula de entrada hace clic cuando el equipo pide agua?',
    options: [
      { label: 'No, silencio total', nextId: 'revisar_voltaje_valvula', color: 'danger' },
      { label: 'Sí, hay clic pero no entra agua', nextId: 'revisar_presion_agua', color: 'neutral' },
    ],
  },
  revisar_voltaje_valvula: {
    id: 'revisar_voltaje_valvula', type: 'measure',
    text: 'Medir voltaje en la electroválvula durante llenado',
    detail: 'En el ciclo de llenado, mide si llega voltaje a los terminales de la electroválvula.',
    nextId: 'result_control_valvula',
  },
  result_control_valvula: {
    id: 'result_control_valvula', type: 'result',
    text: 'Sin señal a electroválvula',
    result: {
      causes: [
        { cause: 'Módulo de control no activa llenado', probability: 55 },
        { cause: 'Selector de programa dañado', probability: 30 },
        { cause: 'Sensor de nivel de agua defectuoso', probability: 15 },
      ],
      recommendation: 'Verificar sensor de presión/nivel. Revisar módulo de control. Comprobar que el selector esté en posición correcta.',
      parts: ['Sensor de nivel', 'Módulo de control'],
    },
  },
  revisar_presion_agua: {
    id: 'revisar_presion_agua', type: 'question',
    text: '¿La presión de agua de la red es adecuada (mayor a 0.5 bar)?',
    options: [
      { label: 'No, presión muy baja', nextId: 'result_presion_agua', color: 'danger' },
      { label: 'Sí, hay buena presión', nextId: 'result_valvula_tapada', color: 'neutral' },
    ],
  },
  result_presion_agua: {
    id: 'result_presion_agua', type: 'result',
    text: 'Baja presión de agua de red',
    result: {
      causes: [
        { cause: 'Presión de red insuficiente', probability: 70 },
        { cause: 'Filtro de manguera de entrada tapado', probability: 30 },
      ],
      recommendation: 'Limpiar el filtro de la manguera de entrada. Verificar que la llave de paso esté completamente abierta. Si la presión de red es baja, no es falla del equipo.',
      parts: [],
    },
  },
  result_valvula_tapada: {
    id: 'result_valvula_tapada', type: 'result',
    text: 'Electroválvula defectuosa o tapada',
    result: {
      causes: [
        { cause: 'Electroválvula con solenoide quemado', probability: 60 },
        { cause: 'Electroválvula tapada con sedimento', probability: 30 },
        { cause: 'Manguera de entrada doblada', probability: 10 },
      ],
      recommendation: 'Limpiar membrana de la electroválvula. Si tiene solenoide quemado (resistencia infinita), reemplazar electroválvula.',
      parts: ['Electroválvula de entrada'],
    },
  },
};

// ─── "Fuga de agua" tree ──────────────────────────────────────────────────────
const FUGA_AGUA: DiagnosticTree = {
  start: {
    id: 'start', type: 'question',
    text: '¿Dónde se origina la fuga de agua?',
    options: [
      { label: 'Parte inferior (bajo el equipo)', nextId: 'fuga_inferior', color: 'neutral' },
      { label: 'Parte trasera o lateral', nextId: 'fuga_trasera', color: 'neutral' },
      { label: 'Interior del compartimiento', nextId: 'fuga_interior', color: 'neutral' },
    ],
  },
  fuga_inferior: {
    id: 'fuga_inferior', type: 'question',
    text: '¿La fuga es continua o solo durante el descongelamiento?',
    options: [
      { label: 'Solo durante descongelamiento', nextId: 'result_descongelamiento', color: 'neutral' },
      { label: 'Continua / en cualquier momento', nextId: 'result_manguera', color: 'danger' },
    ],
  },
  result_descongelamiento: {
    id: 'result_descongelamiento', type: 'result',
    text: 'Fuga en ciclo de descongelamiento',
    result: {
      causes: [
        { cause: 'Manguera de drenaje de descongelamiento tapada', probability: 65 },
        { cause: 'Bandeja de drenaje desbordada', probability: 25 },
        { cause: 'Tapón de drenaje del evaporador tapado', probability: 10 },
      ],
      recommendation: 'Limpiar el canal de drenaje del evaporador. Verificar la manguera de drenaje. Limpiar la bandeja colectora del compresor.',
      parts: [],
    },
  },
  result_manguera: {
    id: 'result_manguera', type: 'result',
    text: 'Fuga en manguera o conexión hidráulica',
    result: {
      causes: [
        { cause: 'Manguera de conexión con grieta o porosidad', probability: 55 },
        { cause: 'Acoples con empaques deteriorados', probability: 35 },
        { cause: 'Bandeja del compresor desbordada', probability: 10 },
      ],
      recommendation: 'Inspeccionar todas las mangueras hidráulicas. Reemplazar empaques deteriorados. Verificar que la bandeja del compresor esté limpia.',
      parts: ['Manguera', 'Empaques', 'Acoples'],
    },
  },
  fuga_trasera: {
    id: 'fuga_trasera', type: 'result',
    text: 'Fuga en conexiones traseras / mangueras',
    result: {
      causes: [
        { cause: 'Manguera de suministro de agua deteriorada', probability: 60 },
        { cause: 'Unión de manguera con fuga', probability: 30 },
        { cause: 'Válvula de paso con fuga', probability: 10 },
      ],
      recommendation: 'Revisar todas las mangueras de agua en la parte trasera. Asegurar conexiones. Reemplazar mangueras deterioradas.',
      parts: ['Manguera de entrada', 'Acoples'],
    },
  },
  fuga_interior: {
    id: 'fuga_interior', type: 'result',
    text: 'Fuga interior — acumulación de agua dentro del compartimiento',
    result: {
      causes: [
        { cause: 'Canal de drenaje del evaporador tapado', probability: 50 },
        { cause: 'Bandeja de drenaje rota', probability: 25 },
        { cause: 'Empaque de puerta dañado (entrada de humedad excesiva)', probability: 25 },
      ],
      recommendation: 'Revisar y limpiar el drenaje del evaporador. Verificar el estado de los empaques de puerta. Inspeccionar bandeja de drenaje.',
      parts: ['Empaque de puerta', 'Bandeja de drenaje'],
    },
  },
};

// ─── "No enfría" AC tree ──────────────────────────────────────────────────────
const NOENFRIA_AIRE: DiagnosticTree = {
  start: {
    id: 'start', type: 'question',
    text: '¿El compresor de la unidad exterior arranca y funciona?',
    options: [
      { label: 'No, no arranca', nextId: 'noarranque_aire', color: 'danger' },
      { label: 'Sí, está funcionando', nextId: 'ev_presiones_aire', color: 'success' },
    ],
  },
  noarranque_aire: {
    id: 'noarranque_aire', type: 'measure',
    text: 'Verificar voltaje y continuidad del compresor',
    detail: 'Mide voltaje en terminales del compresor de la unidad exterior. Verifica bobinas del compresor sin continuidad a tierra.',
    nextId: 'result_noarranque_aire',
  },
  result_noarranque_aire: {
    id: 'result_noarranque_aire', type: 'result',
    text: 'Compresor de AC no arranca',
    result: {
      causes: [
        { cause: 'Capacitor del compresor defectuoso', probability: 45 },
        { cause: 'Compresor con devanado abierto o en corto', probability: 35 },
        { cause: 'Tarjeta de control exterior sin señal', probability: 20 },
      ],
      recommendation: 'Medir capacitor (debe dar valor nominal en µF). Medir bobinas del compresor. Verificar señal de la tarjeta al compresor.',
      parts: ['Capacitor de compresor', 'Compresor', 'Tarjeta exterior'],
    },
  },
  ev_presiones_aire: {
    id: 'ev_presiones_aire', type: 'evidence',
    text: 'Medir y registrar presiones del sistema AC',
    evidenceLabel: 'Foto de manómetros en el AC',
    nextId: 'presion_baja_aire',
  },
  presion_baja_aire: {
    id: 'presion_baja_aire', type: 'question',
    text: '¿La presión de baja es muy baja (por debajo del rango normal)?',
    detail: 'R22: baja normal ≈ 65–80 psi en marcha. R410A: baja normal ≈ 100–130 psi. R32: similar a R410A. Valores muy bajos indican baja carga.',
    options: [
      { label: 'Sí, presión de baja muy baja', nextId: 'result_baja_carga_aire', color: 'danger' },
      { label: 'No, presiones normales', nextId: 'result_filtros_sucios', color: 'neutral' },
    ],
  },
  result_baja_carga_aire: {
    id: 'result_baja_carga_aire', type: 'result',
    text: 'Baja carga de refrigerante en AC',
    result: {
      causes: [
        { cause: 'Fuga de refrigerante', probability: 75 },
        { cause: 'Servicio previo con carga incorrecta', probability: 25 },
      ],
      recommendation: 'Localizar la fuga con solución jabonosa o detector. Reparar, recuperar, hacer vacío y recargar según especificación del fabricante (kg o psi).',
      parts: ['Refrigerante (según placa)', 'Filtro-secante'],
    },
  },
  result_filtros_sucios: {
    id: 'result_filtros_sucios', type: 'result',
    text: 'Filtros sucios u obstrucción de airflow',
    result: {
      causes: [
        { cause: 'Filtros de aire sucios (unidad interior)', probability: 50 },
        { cause: 'Condensador exterior sucio', probability: 30 },
        { cause: 'Ventilador con problema', probability: 20 },
      ],
      recommendation: 'Limpiar filtros de la unidad interior. Limpiar condensador exterior con agua a presión. Verificar que los ventiladores funcionen correctamente.',
      parts: ['Filtros de aire'],
    },
  },
};

// ─── "Congela demasiado" tree ─────────────────────────────────────────────────
const CONGELAMUCHO: DiagnosticTree = {
  start: {
    id: 'start', type: 'question',
    text: '¿El termostato / control permite ajustar la temperatura y el compresor cicla (encendido/apagado)?',
    options: [
      { label: 'No cicla — compresor corre siempre', nextId: 'result_termostato_fijo', color: 'danger' },
      { label: 'Sí cicla pero igual congela', nextId: 'result_ajuste', color: 'neutral' },
    ],
  },
  result_termostato_fijo: {
    id: 'result_termostato_fijo', type: 'result',
    text: 'Termostato no corta — compresor corre continuamente',
    result: {
      causes: [
        { cause: 'Termostato defectuoso (contactos pegados)', probability: 65 },
        { cause: 'Sensor de temperatura averiado', probability: 25 },
        { cause: 'Tarjeta de control con falla de lectura', probability: 10 },
      ],
      recommendation: 'Probar bypass del termostato. Si el compresor se detiene manualmente, el termostato no está cortando. Reemplazar termostato o sensor NTC.',
      parts: ['Termostato', 'Sensor NTC'],
    },
  },
  result_ajuste: {
    id: 'result_ajuste', type: 'result',
    text: 'Temperatura de trabajo incorrecta o sensor desplazado',
    result: {
      causes: [
        { cause: 'Temperatura seleccionada demasiado fría', probability: 40 },
        { cause: 'Sensor NTC desplazado de posición correcta', probability: 40 },
        { cause: 'Sistema sobre cargado de refrigerante', probability: 20 },
      ],
      recommendation: 'Verificar que la temperatura seleccionada sea correcta (3–7°C para nevera). Verificar posición del sensor NTC. Medir carga de refrigerante.',
      parts: ['Sensor NTC'],
    },
  },
};

// ─── "Error electrónico" tree ─────────────────────────────────────────────────
const ERRORELECTRONICO: DiagnosticTree = {
  start: {
    id: 'start', type: 'question',
    text: '¿Cuál es el código de error que muestra el equipo?',
    options: [
      { label: 'Error de sensor (Er, E1, E2, F1, F2)', nextId: 'result_sensor', color: 'neutral' },
      { label: 'Error de comunicación (EC, Err, Com)', nextId: 'result_comunicacion', color: 'neutral' },
      { label: 'Error de compresor o refrigeración', nextId: 'result_error_compresor', color: 'danger' },
      { label: 'No sé el código', nextId: 'buscar_codigo', color: 'neutral' },
    ],
  },
  result_sensor: {
    id: 'result_sensor', type: 'result',
    text: 'Error de sensor de temperatura',
    result: {
      causes: [
        { cause: 'Sensor NTC abierto o en corto', probability: 70 },
        { cause: 'Conector del sensor suelto o corroído', probability: 20 },
        { cause: 'Tarjeta de control con canal de lectura dañado', probability: 10 },
      ],
      recommendation: 'Medir resistencia del sensor NTC (varía según temperatura, típicamente 5kΩ a 25°C). Verificar conector. Si el sensor está bien, evaluar tarjeta.',
      parts: ['Sensor NTC', 'Tarjeta de control'],
    },
  },
  result_comunicacion: {
    id: 'result_comunicacion', type: 'result',
    text: 'Error de comunicación entre tarjetas',
    result: {
      causes: [
        { cause: 'Cable de comunicación dañado o suelto', probability: 50 },
        { cause: 'Tarjeta de display o control dañada', probability: 40 },
        { cause: 'Interferencia eléctrica', probability: 10 },
      ],
      recommendation: 'Verificar cable de comunicación entre tarjetas. Hacer reset del equipo (desconectar 5 minutos). Si persiste, evaluar tarjetas.',
      parts: ['Cable de comunicación', 'Tarjeta de control'],
    },
  },
  result_error_compresor: {
    id: 'result_error_compresor', type: 'result',
    text: 'Error relacionado con el compresor o refrigeración',
    result: {
      causes: [
        { cause: 'Protección del compresor activada', probability: 45 },
        { cause: 'Temperatura de trabajo fuera de rango', probability: 30 },
        { cause: 'Falla en inverter del compresor', probability: 25 },
      ],
      recommendation: 'Verificar temperatura de trabajo. Revisar módulo inverter si el compresor es tipo inverter. Medir corriente del compresor.',
      parts: ['Módulo inverter', 'Tarjeta de control'],
    },
  },
  buscar_codigo: {
    id: 'buscar_codigo', type: 'action',
    text: 'Consultar manual técnico del modelo para identificar código',
    detail: 'Busca el código de error en el manual técnico del fabricante o en la base de conocimiento de la marca. Anota el código exactamente como aparece en el display.',
    nextId: 'result_codigo_desconocido',
  },
  result_codigo_desconocido: {
    id: 'result_codigo_desconocido', type: 'result',
    text: 'Error con código no identificado',
    result: {
      causes: [
        { cause: 'Error no estándar o específico del modelo', probability: 60 },
        { cause: 'Tarjeta con error de firmware', probability: 40 },
      ],
      recommendation: 'Tomar foto del código. Consultar manual técnico del fabricante. Intentar reset del equipo (desconectar 10 min). Si persiste, escalar con código y modelo exacto.',
      parts: ['Tarjeta de control'],
    },
  },
};

// ─── "Error electrónico — lavadora" tree ─────────────────────────────────────
// Específico para lavadoras: sin opción de compresor/refrigeración.
const ERRORELECTRONICO_LAVADORA: DiagnosticTree = {
  start: {
    id: 'start', type: 'question',
    text: '¿Cuál es el código de error que muestra la lavadora?',
    detail: 'Observa el display o los LEDs de la lavadora. Anota el código exactamente como aparece.',
    options: [
      { label: 'Error de sensor (Er, E1, E2, F1, F2, tE)', nextId: 'result_sensor', color: 'neutral' },
      { label: 'Error de comunicación (EC, Err, Com)', nextId: 'result_comunicacion', color: 'neutral' },
      { label: 'Error de desequilibrio / vibración (UE, dE, Ud, 3E)', nextId: 'result_desequilibrio', color: 'neutral' },
      { label: 'Error de puerta o tapa (dE, DE, DE1, LE, FL)', nextId: 'result_error_puerta_lavadora', color: 'neutral' },
      { label: 'Error de temperatura de agua (tE, HE, LE, E3)', nextId: 'result_temp_agua_lavadora', color: 'neutral' },
      { label: 'No sé el código / no hay display', nextId: 'buscar_codigo_lavadora', color: 'neutral' },
    ],
  },
  result_sensor: {
    id: 'result_sensor', type: 'result',
    text: 'Error de sensor — sensor de temperatura, nivel o velocidad defectuoso',
    result: {
      causes: [
        { cause: 'Sensor NTC de temperatura (termistor) fuera de rango', probability: 40 },
        { cause: 'Sensor de nivel de agua (presostato) defectuoso o con manguera tapada', probability: 35 },
        { cause: 'Sensor de velocidad del tambor (efecto Hall) dañado', probability: 25 },
      ],
      recommendation: 'Medir resistencia del sensor NTC (varía con la temperatura, típico 5–50 kΩ). Verificar manguera del presostato (soplar y escuchar clic). Revisar conexiones del sensor de Hall en el motor.',
      parts: ['Sensor NTC de temperatura', 'Presostato / sensor de nivel', 'Sensor de Hall de motor'],
    },
  },
  result_comunicacion: {
    id: 'result_comunicacion', type: 'result',
    text: 'Error de comunicación entre tarjetas — revisar cable plano y tarjetas',
    result: {
      causes: [
        { cause: 'Cable de comunicación entre tarjeta principal y display suelto o dañado', probability: 50 },
        { cause: 'Tarjeta de display o de interface defectuosa', probability: 30 },
        { cause: 'Tarjeta principal con falla de firmware o memoria', probability: 20 },
      ],
      recommendation: 'Verificar el cable plano (ribbon cable) entre las tarjetas — limpiar conectores. Hacer reset completo (desconectar 10 minutos). Si persiste, revisar tarjetas individualmente.',
      parts: ['Cable de comunicación / ribbon cable', 'Tarjeta de display', 'Tarjeta principal'],
    },
  },
  result_desequilibrio: {
    id: 'result_desequilibrio', type: 'result',
    text: 'Error de desequilibrio — carga mal distribuida o suspensión defectuosa',
    result: {
      causes: [
        { cause: 'Carga de ropa desbalanceada o atascada en un lado', probability: 50 },
        { cause: 'Lavadora sin nivelar o sobre superficie inestable', probability: 25 },
        { cause: 'Amortiguadores (shock absorbers) desgastados', probability: 15 },
        { cause: 'Resortes de suspensión del tambor flojos o rotos', probability: 10 },
      ],
      recommendation: 'Redistribuir la ropa uniformemente y reiniciar. Verificar nivelación con nivel de burbuja (ajustar patas). Si persiste con carga normal, revisar amortiguadores y resortes de suspensión.',
      parts: ['Amortiguadores de suspensión', 'Resortes de suspensión'],
    },
  },
  result_error_puerta_lavadora: {
    id: 'result_error_puerta_lavadora', type: 'result',
    text: 'Error de puerta/tapa — interruptor de seguridad o cierre defectuoso',
    result: {
      causes: [
        { cause: 'Interruptor de seguridad de puerta (door latch) defectuoso', probability: 55 },
        { cause: 'Traba electrónica de puerta (door lock) averiada', probability: 30 },
        { cause: 'Deformación de la puerta que impide el cierre completo', probability: 15 },
      ],
      recommendation: 'Verificar que la puerta cierra completamente y la traba hace clic. Medir continuidad del interruptor de seguridad (debe cerrar al travar). Revisar solenoide de la traba electrónica.',
      parts: ['Interruptor de puerta / door switch', 'Traba electrónica de puerta / door lock'],
    },
  },
  result_temp_agua_lavadora: {
    id: 'result_temp_agua_lavadora', type: 'result',
    text: 'Error de temperatura de agua — sensor NTC o resistencia calefactora',
    result: {
      causes: [
        { cause: 'Sensor NTC de temperatura del agua en corto o abierto', probability: 50 },
        { cause: 'Resistencia calefactora (heating element) quemada', probability: 35 },
        { cause: 'Termostato de seguridad activado permanentemente', probability: 15 },
      ],
      recommendation: 'Medir resistencia del NTC (debe variar con temperatura). Verificar continuidad de la resistencia calefactora (típico 20–50 Ω). Revisar termostato de seguridad en la resistencia.',
      parts: ['Sensor NTC de agua', 'Resistencia calefactora', 'Termostato de seguridad'],
    },
  },
  buscar_codigo_lavadora: {
    id: 'buscar_codigo_lavadora', type: 'action',
    text: 'Consultar manual técnico de la lavadora para identificar el código de error',
    detail: 'Busca en el manual técnico del fabricante (LG, Samsung, Mabe, Haceb, etc.) la tabla de códigos de error. Anota el código exactamente como aparece y consulta la causa específica del modelo.',
    tip: 'Muchos modelos de LG y Samsung tienen diagnóstico automático: mantén pulsado el botón de inicio 3 segundos para iniciar el autodiagnóstico.',
    nextId: 'result_codigo_lav_desconocido',
  },
  result_codigo_lav_desconocido: {
    id: 'result_codigo_lav_desconocido', type: 'result',
    text: 'Código de error no identificado — escalar con referencia del modelo',
    result: {
      causes: [
        { cause: 'Error específico del modelo no catalogado', probability: 60 },
        { cause: 'Tarjeta con firmware corrompido', probability: 40 },
      ],
      recommendation: 'Fotografiar el código de error con el modelo del equipo. Intentar reset completo (desconectar 15 minutos). Si persiste, contactar soporte técnico del fabricante con el modelo y código exacto.',
      parts: ['Tarjeta principal'],
    },
  },
};

// ─── "No lava bien" tree — lavadora ──────────────────────────────────────────
const NOLAVADO: DiagnosticTree = {
  start: {
    id: 'start', type: 'question',
    text: '¿El tambor de la lavadora gira durante el ciclo de lavado?',
    options: [
      { label: 'No, el tambor no gira o se mueve muy poco', nextId: 'ev_motor_lavado', color: 'danger' },
      { label: 'Sí gira, pero la ropa queda sucia o mal lavada', nextId: 'hay_agua_tambor', color: 'neutral' },
    ],
  },
  ev_motor_lavado: {
    id: 'ev_motor_lavado', type: 'measure',
    text: 'Medir continuidad del motor de lavado y verificar correa (si aplica)',
    detail: 'En lavadoras de carga superior con correa: verificar que la correa esté en buen estado y bien tensionada. En lavadoras sin correa (direct drive): medir resistencia de los devanados del motor (deben ser iguales entre sí).',
    tip: 'Si el motor zumba pero no gira, puede estar bloqueado mecánicamente o tener un capacitor defectuoso.',
    nextId: 'resultado_motor_lavado',
  },
  resultado_motor_lavado: {
    id: 'resultado_motor_lavado', type: 'result',
    text: 'Falla en motor o transmisión — tambor sin movimiento',
    result: {
      causes: [
        { cause: 'Correa de transmisión desgastada o rota', probability: 35 },
        { cause: 'Motor de lavado defectuoso o devanados en corto', probability: 30 },
        { cause: 'Capacitor del motor dañado', probability: 20 },
        { cause: 'Acoplamiento directo (direct drive) roto', probability: 15 },
      ],
      recommendation: 'Verificar estado visual de la correa. Medir continuidad de los devanados del motor. Revisar el capacitor de arranque (capacímetro o método de arranque manual con cautela). Revisar acoplamiento en motores direct drive.',
      parts: ['Correa de transmisión', 'Motor de lavado', 'Capacitor de motor', 'Acoplamiento direct drive'],
    },
  },
  hay_agua_tambor: {
    id: 'hay_agua_tambor', type: 'question',
    text: '¿Hay suficiente agua en el tambor durante el ciclo de lavado?',
    options: [
      { label: 'No, el nivel de agua es muy bajo o no entra agua', nextId: 'result_poca_agua_lavado', color: 'danger' },
      { label: 'Sí, el nivel de agua parece normal', nextId: 'tipo_problema_lavado', color: 'neutral' },
    ],
  },
  result_poca_agua_lavado: {
    id: 'result_poca_agua_lavado', type: 'result',
    text: 'Nivel de agua insuficiente — válvula de entrada o presostato',
    result: {
      causes: [
        { cause: 'Electroválvula de agua con bajo caudal o atascada', probability: 45 },
        { cause: 'Presostato (sensor de nivel) mal calibrado o defectuoso', probability: 35 },
        { cause: 'Presión de agua en el suministro demasiado baja', probability: 20 },
      ],
      recommendation: 'Verificar presión del suministro (mínimo 0,5 bar). Revisar filtros de las electroválvulas (limpiar con aguja). Medir si el presostato cambia de estado al alcanzar el nivel programado.',
      parts: ['Electroválvula de entrada de agua', 'Presostato / sensor de nivel'],
    },
  },
  tipo_problema_lavado: {
    id: 'tipo_problema_lavado', type: 'question',
    text: '¿Cuál es el síntoma exacto del mal lavado?',
    options: [
      { label: 'La ropa queda con detergente / jabón sin enjuagar', nextId: 'result_exceso_detergente', color: 'neutral' },
      { label: 'La ropa queda con manchas o suciedad', nextId: 'result_mal_programa', color: 'neutral' },
      { label: 'El ciclo termina muy rápido (menos de 20 minutos)', nextId: 'result_ciclo_corto', color: 'neutral' },
      { label: 'Olor feo en la ropa después de lavar', nextId: 'result_olor_lavadora', color: 'neutral' },
    ],
  },
  result_exceso_detergente: {
    id: 'result_exceso_detergente', type: 'result',
    text: 'Exceso de detergente o válvula de enjuague defectuosa',
    result: {
      causes: [
        { cause: 'Dosis de detergente excesiva (uso incorrecto)', probability: 55 },
        { cause: 'Electroválvula de enjuague con caudal insuficiente', probability: 25 },
        { cause: 'Ciclo de enjuague insuficiente por el programa seleccionado', probability: 20 },
      ],
      recommendation: 'Reducir la dosis de detergente (usar el recomendado para HE si aplica). Realizar ciclo de limpieza de tambor vacío con agua caliente. Verificar que la electroválvula de enjuague abre completamente.',
      parts: ['Electroválvula de enjuague (si aplica)'],
    },
  },
  result_mal_programa: {
    id: 'result_mal_programa', type: 'result',
    text: 'Programa o temperatura inadecuada para el tipo de ropa',
    result: {
      causes: [
        { cause: 'Selección incorrecta del programa de lavado', probability: 50 },
        { cause: 'Temperatura del agua insuficiente (resistencia calefactora apagada)', probability: 30 },
        { cause: 'Sobrecarga de ropa en el tambor', probability: 20 },
      ],
      recommendation: 'Verificar que el programa seleccionado sea adecuado para el tipo de tela y nivel de suciedad. Para manchas difíciles, usar ciclo de alta temperatura (60°C). No sobrecargar: máximo 80% de capacidad.',
      parts: [],
    },
  },
  result_ciclo_corto: {
    id: 'result_ciclo_corto', type: 'result',
    text: 'Ciclo de lavado muy corto — tarjeta de control o programador defectuoso',
    result: {
      causes: [
        { cause: 'Tarjeta principal con falla en el módulo de temporización', probability: 50 },
        { cause: 'Programador mecánico desgastado (lavadoras con timer)', probability: 30 },
        { cause: 'Error de configuración de fábrica o firmware corrupto', probability: 20 },
      ],
      recommendation: 'Verificar si el ciclo completo de lavado está programado correctamente. En lavadoras mecánicas, revisar el temporizador (continuidad en cada posición). En lavadoras electrónicas, hacer reset de fábrica y actualizar firmware si el fabricante lo permite.',
      parts: ['Tarjeta de control principal', 'Temporizador / programador mecánico'],
    },
  },
  result_olor_lavadora: {
    id: 'result_olor_lavadora', type: 'result',
    text: 'Olor en la lavadora — acumulación de hongos o biofilm en el tambor',
    result: {
      causes: [
        { cause: 'Acumulación de hongos y biofilm por humedad residual', probability: 60 },
        { cause: 'Detergente acumulado en la goma del tambo (frontales)', probability: 25 },
        { cause: 'Filtro de pelusa obstruido y con residuos', probability: 15 },
      ],
      recommendation: 'Ejecutar ciclo de limpieza con 500 ml de vinagre blanco o pastilla de limpieza especial para lavadoras, a la temperatura más alta sin ropa. Limpiar el sello de goma (lavadoras frontales) con paño húmedo. Dejar la puerta abierta entre usos para ventilar.',
      parts: [],
    },
  },
};

// ─── "No seca bien" tree — secadora ──────────────────────────────────────────
const NOSECA: DiagnosticTree = {
  start: {
    id: 'start', type: 'question',
    text: '¿El tambor de la secadora gira durante el ciclo?',
    options: [
      { label: 'No, el tambor no gira', nextId: 'ev_motor_secadora', color: 'danger' },
      { label: 'Sí gira, pero no calienta', nextId: 'revisar_calefactor', color: 'neutral' },
      { label: 'Gira y calienta, pero la ropa queda húmeda', nextId: 'revisar_ventilacion', color: 'neutral' },
    ],
  },
  ev_motor_secadora: {
    id: 'ev_motor_secadora', type: 'measure',
    text: 'Medir continuidad del motor de la secadora y revisar la correa del tambor',
    detail: 'La mayoría de secadoras usan correa (belt) para mover el tambor. Inspeccionar visualmente si la correa está rota, desgastada o fuera de lugar. Medir continuidad de los devanados del motor.',
    tip: 'Un motor sin correa gira sin carga y hace un zumbido corto — la correa rota es la causa más común de tambor parado.',
    nextId: 'result_motor_secadora',
  },
  result_motor_secadora: {
    id: 'result_motor_secadora', type: 'result',
    text: 'Motor de tambor o correa defectuosa',
    result: {
      causes: [
        { cause: 'Correa del tambor (belt) rota o desgastada', probability: 55 },
        { cause: 'Motor del tambor defectuoso', probability: 30 },
        { cause: 'Rodamiento de soporte del tambor agarrotado', probability: 15 },
      ],
      recommendation: 'Revisar visualmente la correa abriendo el panel frontal o trasero según el modelo. Verificar que el tensor (idler pulley) esté en posición correcta. Medir continuidad del motor. Comprobar que el tambor gire libremente a mano.',
      parts: ['Correa del tambor (belt)', 'Motor de secadora', 'Tensor de correa (idler pulley)', 'Rodamiento del tambor'],
    },
  },
  revisar_calefactor: {
    id: 'revisar_calefactor', type: 'measure',
    text: 'Medir continuidad del elemento calefactor y del termostato de seguridad',
    detail: 'Desconectar el equipo. Medir continuidad del elemento calefactor (resistencia o quemador de gas). En eléctrica: típico 8–20 Ω. Revisar también el termostato de seguridad (hi-limit) — si está abierto, no hay calor.',
    tip: 'El termostato de seguridad se activa permanentemente por sobrecalentamiento — generalmente causado por filtro de pelusa obstruido. Siempre limpiar el filtro antes de reemplazar el termostato.',
    nextId: 'calefactor_ok',
  },
  calefactor_ok: {
    id: 'calefactor_ok', type: 'question',
    text: '¿El elemento calefactor y el termostato de seguridad tienen continuidad?',
    options: [
      { label: 'No, el calefactor o termostato está abierto (sin continuidad)', nextId: 'result_calefactor', color: 'danger' },
      { label: 'Sí, tienen continuidad — el problema es otro', nextId: 'revisar_termostato_ciclo', color: 'neutral' },
    ],
  },
  result_calefactor: {
    id: 'result_calefactor', type: 'result',
    text: 'Elemento calefactor o termostato de seguridad defectuoso',
    result: {
      causes: [
        { cause: 'Elemento calefactor quemado (resistencia abierta)', probability: 45 },
        { cause: 'Termostato de seguridad (hi-limit) activado permanentemente por sobrecalentamiento', probability: 40 },
        { cause: 'Termostato de ciclo defectuoso', probability: 15 },
      ],
      recommendation: 'Limpiar el filtro de pelusa y el conducto de salida de aire ANTES de reemplazar componentes. Reemplazar el termostato de seguridad con la referencia exacta. En secadoras a gas, verificar también el ignitor y la válvula de gas.',
      parts: ['Elemento calefactor / resistencia', 'Termostato de seguridad (hi-limit)', 'Ignitor (si es a gas)', 'Válvula de gas (si es a gas)'],
    },
  },
  revisar_termostato_ciclo: {
    id: 'revisar_termostato_ciclo', type: 'question',
    text: '¿El termostato de ciclo (cycling thermostat) tiene continuidad y abre/cierra correctamente?',
    options: [
      { label: 'No, termostato de ciclo abierto permanentemente', nextId: 'result_termostato_ciclo', color: 'danger' },
      { label: 'Sí, termostato de ciclo OK — buscar otro origen', nextId: 'result_tarjeta_secadora', color: 'neutral' },
    ],
  },
  result_termostato_ciclo: {
    id: 'result_termostato_ciclo', type: 'result',
    text: 'Termostato de ciclo defectuoso — no activa el calefactor',
    result: {
      causes: [
        { cause: 'Termostato de ciclo abierto por desgaste o fallo', probability: 80 },
        { cause: 'Sensor de temperatura NTC fuera de especificación (modelos electrónicos)', probability: 20 },
      ],
      recommendation: 'Reemplazar el termostato de ciclo con la referencia del modelo. Verificar que la temperatura de activación sea la correcta para el modelo.',
      parts: ['Termostato de ciclo (cycling thermostat)'],
    },
  },
  result_tarjeta_secadora: {
    id: 'result_tarjeta_secadora', type: 'result',
    text: 'Posible falla en tarjeta de control — no activa el circuito de calefacción',
    result: {
      causes: [
        { cause: 'Relé de la tarjeta que controla el calefactor defectuoso', probability: 60 },
        { cause: 'Tarjeta principal con falla en el control de temperatura', probability: 40 },
      ],
      recommendation: 'Verificar con multímetro si llega voltaje al elemento calefactor cuando debería estar activo. Si el calefactor recibe voltaje y no calienta, el elemento está abierto. Si no recibe voltaje, el problema es la tarjeta o los termostatos en serie.',
      parts: ['Tarjeta de control principal', 'Relé de calefacción'],
    },
  },
  revisar_ventilacion: {
    id: 'revisar_ventilacion', type: 'question',
    text: '¿El conducto de salida de aire (ducto de ventilación) está limpio y libre de obstrucciones?',
    options: [
      { label: 'No, el ducto estaba obstruido o con pelusa acumulada', nextId: 'result_ducto_obstruido', color: 'danger' },
      { label: 'Sí, el ducto está limpio', nextId: 'result_ventilador_secadora', color: 'neutral' },
    ],
  },
  result_ducto_obstruido: {
    id: 'result_ducto_obstruido', type: 'result',
    text: 'Ducto de ventilación obstruido — limpiar y verificar flujo de aire',
    result: {
      causes: [
        { cause: 'Acumulación de pelusa en el ducto de salida de aire', probability: 70 },
        { cause: 'Ducto aplastado o mal instalado que restringe el flujo', probability: 20 },
        { cause: 'Filtro de pelusa interno obstruido', probability: 10 },
      ],
      recommendation: 'Limpiar el ducto de ventilación completo con cepillo flexible. Verificar que el trayecto del ducto no tenga codos de 90° innecesarios. Comprobar el flujo de aire en la salida exterior — debe sentirse fuerte. Un ducto limpio puede reducir el tiempo de secado hasta un 50%.',
      parts: [],
    },
  },
  result_ventilador_secadora: {
    id: 'result_ventilador_secadora', type: 'result',
    text: 'Ventilador de circulación de aire deficiente',
    result: {
      causes: [
        { cause: 'Paletas del ventilador (blower) con pelusa acumulada', probability: 45 },
        { cause: 'Ventilador (blower wheel) roto o flojo en el eje', probability: 35 },
        { cause: 'Motor del ventilador con bajo rendimiento', probability: 20 },
      ],
      recommendation: 'Limpiar el blower wheel de pelusa acumulada. Verificar que esté fijo al eje del motor (tornillo de fijación). Comprobar que el motor gire a la velocidad correcta.',
      parts: ['Blower wheel / ventilador de circulación', 'Motor del ventilador'],
    },
  },
};

// ─── "Escarcha excesiva" tree ─────────────────────────────────────────────────
const ESCARCHA: DiagnosticTree = {
  start: {
    id: 'start', type: 'question',
    text: '¿Dónde se acumula la escarcha principalmente?',
    options: [
      { label: 'En el evaporador (parte trasera interior)', nextId: 'escarcha_evaporador', color: 'neutral' },
      { label: 'En las paredes o puerta', nextId: 'result_empaque', color: 'neutral' },
    ],
  },
  escarcha_evaporador: {
    id: 'escarcha_evaporador', type: 'question',
    text: '¿El sistema de descongelamiento automático funciona? (termostato de deshielo o resistencia de deshielo)',
    options: [
      { label: 'No, no calienta la resistencia de deshielo', nextId: 'result_resistencia', color: 'danger' },
      { label: 'Sí, pero sigue acumulando', nextId: 'result_frecuencia', color: 'neutral' },
    ],
  },
  result_resistencia: {
    id: 'result_resistencia', type: 'result',
    text: 'Falla en sistema de descongelamiento',
    result: {
      causes: [
        { cause: 'Resistencia de descongelamiento abierta', probability: 45 },
        { cause: 'Termostato de deshielo defectuoso', probability: 35 },
        { cause: 'Temporizador de deshielo dañado', probability: 20 },
      ],
      recommendation: 'Medir resistencia de la resistencia calefactora (continuidad). Verificar termostato de deshielo. Si el equipo es con tarjeta, verificar señal de deshielo.',
      parts: ['Resistencia de deshielo', 'Termostato de deshielo', 'Temporizador'],
    },
  },
  result_frecuencia: {
    id: 'result_frecuencia', type: 'result',
    text: 'Exceso de humedad o ciclos incorrectos',
    result: {
      causes: [
        { cause: 'Empaque de puerta con fugas de aire húmedo', probability: 50 },
        { cause: 'Puerta abierta con frecuencia excesiva', probability: 30 },
        { cause: 'Ciclo de descongelamiento muy corto', probability: 20 },
      ],
      recommendation: 'Verificar estado del empaque (prueba del papel). Revisar que las puertas cierren correctamente. Ajustar frecuencia de descongelamiento si el control lo permite.',
      parts: ['Empaque de puerta'],
    },
  },
  result_empaque: {
    id: 'result_empaque', type: 'result',
    text: 'Empaque de puerta defectuoso — entrada de aire húmedo',
    result: {
      causes: [
        { cause: 'Empaque de puerta deteriorado o roto', probability: 70 },
        { cause: 'Puerta desalineada', probability: 20 },
        { cause: 'Bisagra de puerta dañada', probability: 10 },
      ],
      recommendation: 'Prueba del papel: deslizar hoja entre empaque y gabinete. Debe haber resistencia al jalar. Si no hay resistencia, reemplazar empaque.',
      parts: ['Empaque de puerta'],
    },
  },
};

// ─── "Congela pero no enfría" — flujo de distribución de aire e inverter ────────
const CONGELA_NOENFRIA: DiagnosticTree = {
  start: {
    id: 'start', type: 'question',
    text: '¿El congelador sí congela mientras el compartimento de refrigeración no enfría?',
    detail: 'Confirma que el evaporador del congelador produce frío y que el síntoma principal es la falta de transferencia de aire frío hacia la zona de refrigeración.',
    options: [
      { label: 'Sí, el congelador congela y la nevera no enfría', nextId: 'tipo_compresor_congela', color: 'success' },
      { label: 'No, ninguno de los dos compartimentos enfría', nextId: 'result_sin_produccion_frio', color: 'danger' },
    ],
  },
  tipo_compresor_congela: {
    id: 'tipo_compresor_congela', type: 'question',
    text: '¿El equipo usa compresor Inverter?',
    detail: 'Las comprobaciones del módulo Inverter aparecen aquí después de las etapas iniciales obligatorias de voltaje y código de error.',
    options: [
      { label: 'Sí, es Inverter', nextId: 'inverter_ev_placa_congela', color: 'neutral' },
      { label: 'No, es convencional', nextId: 'ev_ventilador_congela', color: 'success' },
    ],
  },
  inverter_ev_placa_congela: {
    id: 'inverter_ev_placa_congela', type: 'evidence',
    text: 'Registrar placa del compresor y módulo Inverter',
    detail: 'Toma una foto legible de la referencia del compresor, del módulo Inverter y de cualquier LED o indicación visible. Esta evidencia permite solicitar el repuesto correcto.',
    evidenceLabel: 'Foto de placa del compresor y módulo Inverter',
    nextId: 'inverter_estado_congela',
  },
  inverter_estado_congela: {
    id: 'inverter_estado_congela', type: 'question',
    text: '¿El módulo Inverter muestra una falla o el código de error registrado?',
    detail: 'Relaciona esta observación con el código que ya se revisó en el paso previo. No sustituyas el módulo sin comprobar alimentación, comunicación y compresor.',
    options: [
      { label: 'Sí, muestra falla o no responde', nextId: 'inverter_ev_falla_congela', color: 'danger' },
      { label: 'No, no muestra falla visible', nextId: 'inverter_medir_senal_congela', color: 'neutral' },
    ],
  },
  inverter_ev_falla_congela: {
    id: 'inverter_ev_falla_congela', type: 'evidence',
    text: 'Documentar la falla del módulo Inverter',
    detail: 'Fotografía el código, el patrón de destellos o el estado del LED. Registra también la referencia del módulo y la tensión medida en su alimentación.',
    evidenceLabel: 'Foto del módulo Inverter mostrando código o LED de falla',
    nextId: 'result_modulo_congela',
  },
  inverter_medir_senal_congela: {
    id: 'inverter_medir_senal_congela', type: 'measure',
    text: 'Medir señal del módulo Inverter hacia el compresor',
    detail: 'Con el equipo operando, mide la señal entre U-V, U-W y V-W. Los tres valores deben ser similares según el modelo. Trabaja solo con el procedimiento y protección indicados por el fabricante.',
    tip: 'Una señal desbalanceada apunta al módulo; señales balanceadas con compresor detenido orientan a compresor o control de velocidad.',
    gifUri: 'medir-señal-inverter',
    nextId: 'inverter_senal_congela',
  },
  inverter_senal_congela: {
    id: 'inverter_senal_congela', type: 'question',
    text: '¿La señal U-V / U-W / V-W está balanceada?',
    options: [
      { label: 'No, hay un terminal en 0 o muy diferente', nextId: 'result_modulo_congela', color: 'danger' },
      { label: 'Sí, los valores son similares', nextId: 'ev_ventilador_congela', color: 'success' },
    ],
  },
  ev_ventilador_congela: {
    id: 'ev_ventilador_congela', type: 'evidence',
    text: 'Verificar ventilador del evaporador y circulación de aire',
    detail: 'Con el equipo en demanda de frío, comprueba que el ventilador del evaporador gira libremente y que el aire frío llega al compartimento de refrigeración. Toma evidencia del ventilador y del conducto.',
    evidenceLabel: 'Foto del ventilador y conducto de aire',
    nextId: 'ventilador_congela_ok',
  },
  ventilador_congela_ok: {
    id: 'ventilador_congela_ok', type: 'question',
    text: '¿El ventilador del evaporador funciona y hay flujo de aire?',
    options: [
      { label: 'No, no gira o no hay flujo', nextId: 'result_ventilador_congela', color: 'danger' },
      { label: 'Sí, hay flujo de aire', nextId: 'compuerta_congela', color: 'success' },
    ],
  },
  compuerta_congela: {
    id: 'compuerta_congela', type: 'question',
    text: '¿La compuerta o ducto de aire hacia la nevera está abierto y despejado?',
    detail: 'Revisa que la compuerta no esté trabada, que el ducto no esté bloqueado por hielo y que el empaque o alimentos no obstruyan las salidas.',
    options: [
      { label: 'No, está cerrada o bloqueada', nextId: 'result_flujo_congela', color: 'danger' },
      { label: 'Sí, está abierta y despejada', nextId: 'medir_temperatura_congela', color: 'success' },
    ],
  },
  medir_temperatura_congela: {
    id: 'medir_temperatura_congela', type: 'measure',
    text: 'Medir temperaturas y revisar sensor del compartimento de refrigeración',
    detail: 'Mide la temperatura en ambos compartimentos y compara el sensor NTC del refrigerador con la tabla del fabricante. Si el flujo está correcto pero la lectura es errónea, revisar sensor y tarjeta.',
    nextId: 'result_sensor_congela',
  },
  result_sin_produccion_frio: {
    id: 'result_sin_produccion_frio', type: 'result',
    text: 'El síntoma no corresponde a “congela pero no enfría”',
    result: {
      causes: [
        { cause: 'El congelador tampoco está produciendo frío', probability: 100 },
      ],
      recommendation: 'Continuar con el árbol “No enfría” para revisar alimentación, compresor, presión y circuito frigorífico completo.',
      parts: [],
    },
  },
  result_modulo_congela: {
    id: 'result_modulo_congela', type: 'result',
    text: 'Revisar módulo Inverter y comunicación',
    result: {
      causes: [
        { cause: 'Módulo Inverter con falla en la etapa de salida', probability: 55 },
        { cause: 'Comunicación deficiente entre tarjeta y módulo Inverter', probability: 25 },
        { cause: 'Alimentación inestable o fuera de especificación', probability: 20 },
      ],
      recommendation: 'Confirmar alimentación, conectores y comunicación según el manual. Si la señal está desbalanceada o el código confirma la falla, solicitar módulo Inverter con la referencia exacta. Verificar el compresor antes de instalarlo.',
      parts: ['Módulo Inverter / Driver', 'Tarjeta de control'],
    },
  },
  result_ventilador_congela: {
    id: 'result_ventilador_congela', type: 'result',
    text: 'Falla en ventilador o circulación de aire',
    result: {
      causes: [
        { cause: 'Motor del ventilador del evaporador defectuoso', probability: 55 },
        { cause: 'Ventilador bloqueado por hielo', probability: 30 },
        { cause: 'Tarjeta no entrega alimentación al ventilador', probability: 15 },
      ],
      recommendation: 'Descongelar y revisar que el aspa gire libremente. Medir la alimentación del motor durante la operación. Si recibe voltaje y no gira, reemplazar el motor; si no recibe, revisar cableado y tarjeta.',
      parts: ['Motor ventilador evaporador', 'Tarjeta de control'],
    },
  },
  result_flujo_congela: {
    id: 'result_flujo_congela', type: 'result',
    text: 'Flujo de aire restringido entre compartimentos',
    result: {
      causes: [
        { cause: 'Ducto de aire bloqueado por hielo', probability: 45 },
        { cause: 'Compuerta de aire trabada o dañada', probability: 35 },
        { cause: 'Obstrucción por alimentos o empaque mal instalado', probability: 20 },
      ],
      recommendation: 'Retirar la obstrucción, descongelar completamente si hay hielo y comprobar el movimiento de la compuerta. Documentar el estado antes y después de la corrección.',
      parts: ['Compuerta de aire', 'Sensor o actuador de compuerta'],
    },
  },
  result_sensor_congela: {
    id: 'result_sensor_congela', type: 'result',
    text: 'Revisar sensor o control de temperatura del refrigerador',
    result: {
      causes: [
        { cause: 'Sensor NTC del compartimento de refrigeración fuera de rango', probability: 50 },
        { cause: 'Tarjeta interpreta incorrectamente la temperatura', probability: 30 },
        { cause: 'Flujo de aire insuficiente pese a ducto despejado', probability: 20 },
      ],
      recommendation: 'Comparar la resistencia del sensor con la tabla del fabricante, revisar conectores y verificar la lectura en la tarjeta. Confirmar temperaturas después de la reparación.',
      parts: ['Sensor NTC de refrigeración', 'Tarjeta de control'],
    },
  },
};

// ─── Export all trees ──────────────────────────────────────────────────────────
export const DECISION_TREES: Record<string, DiagnosticTree> = {
  noenfria:                 NOENFRIA,
  noarranque:               NOARRANQUE,
  ruidoexcesivo:            RUIDOEXCESIVO,
  noenciende:               NOENCIENDE,
  nocentrifuga:             NOCENTRIFUGA,
  nodesagua:                NODESAGUA,
  nollena:                  NOLLENA,
  fuga_agua:                FUGA_AGUA,
  noenfria_aire:            NOENFRIA_AIRE,
  congelamucho:             CONGELAMUCHO,
  errorelectronico:         ERRORELECTRONICO,
  errorelectronico_lavadora: ERRORELECTRONICO_LAVADORA,
  escarcha:                 ESCARCHA,
  nolavado:                 NOLAVADO,
  noseca:                   NOSECA,
  congela_noenfria:         CONGELA_NOENFRIA,
};

export function getTree(treeId: string): DiagnosticTree {
  return DECISION_TREES[treeId] ?? NOENCIENDE;
}

export function getNode(treeId: string, nodeId: string) {
  const tree = getTree(treeId);
  return tree[nodeId] ?? tree['start'];
}
// ─── END ────────────────────────────────────────────────────────────────────── Muchas gracias a todos este diagrama de flujo fue complicado pero se pudo y programarlo fue aun mas, mas de 1000 lineas de codigo de sangre, jajaja 