import type { DiagnosticTree } from '@/types/diagnostico';
import { INVERTER_TREE } from '@/constants/arbol_inverter';
import { ERRORELECTRONICO, ESCARCHA, CONGELA_NOENFRIA } from '@/constants/arboles_comunes';

// ══════════════════════════════════════════════════════════════════════════
// Árboles base de refrigeración doméstica (nevera/nevecón/minibar/congelador).
// Los síntomas comunes viven en arboles_comunes.ts y se reexportan aquí para
// que los códigos de nevera los usen sin duplicar diagnósticos.
// ══════════════════════════════════════════════════════════════════════════

export const NOENFRIA: DiagnosticTree = {

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
    nextId: 'inverter_gate',
  },
  // ── Portón inverter: se pregunta siempre tras voltaje/amperaje ──────────
  inverter_gate: {
    gate: 'inverter_si',
    id: 'inverter_gate', type: 'question',
    text: '¿El compresor del equipo es tecnología Inverter?',
    detail: 'Los compresores Inverter no usan relé PTC externo: los alimenta un módulo driver (tarjeta inverter) que controla la velocidad. Verifica la placa del compresor o el manual del equipo.',
    tip: 'Indicios de Inverter: módulo electrónico grande cerca del compresor, sin PTC externo visible y frecuencia variable audible al operar.',
    options: [
      { label: 'Sí, es tecnología Inverter', nextId: 'inv_start', color: 'neutral' },
      { label: 'No, es compresor convencional', nextId: 'consumo_bajo', color: 'success' },
    ],
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
    text: 'Medir bobinas del compresor (terminales C, S, R) y comparar con la placa',
    detail: 'Retira el relé PTC y mide la resistencia entre los tres pares: C–S (arranque), C–R (marcha) y S–R. Deben cumplir la relación C–S + C–R ≈ S–R. Valores típicos: C–R entre 8 y 20 Ω, C–S entre 15 y 40 Ω según el modelo — compáralos con el valor de la placa del compresor. Un valor por debajo de placa indica corto entre espiras; ∞ indica devanado abierto.',
    tip: 'Si algún par marca infinito (OL), esa bobina está abierta. Si todos marcan 0 Ω, hay corto interno. Un desbalance entre C–S y C–R mayor al 10 % también cuenta como falla.',
    gifUri: 'medir-bobinas',
    evidenceLabel: 'Foto de las tres mediciones (C-S, C-R, S-R) junto a la placa del compresor',
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
      { label: 'No, kit PTC normal', nextId: 'verificar_presiones', color: 'success' },
    ],
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
    tip: 'R134a en marcha: baja ≈ 0–15 psi, alta ≈ 100–200 psi. R600a: valores más bajos. Toma la presión manométrica a los 15 minutos de arrancado el producto: con el sistema estabilizado obtendrás los valores exactos. Documenta con foto de manómetros + pinza amperimétrica al mismo tiempo.',
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
  // Nodos de tecnología Inverter compartidos (se alcanzan vía inverter_gate)
  ...INVERTER_TREE,
  // Nodos de tecnología Inverter compartidos (se alcanzan vía tipo_compresor_congela)
  ...INVERTER_TREE,
};;

export const NOARRANQUE: DiagnosticTree = {
  start: {
    id: 'start', type: 'question',
    gate: 'inverter_si',
    text: '¿El compresor del equipo es tipo Inverter?',
    detail: 'Esta identificación se realiza después de validar el voltaje de alimentación y revisar si el equipo muestra un código de error.',
    options: [
      { label: 'Sí, es compresor Inverter', nextId: 'inv_start', color: 'neutral' },
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
    nextId: 'gate_inverter_arranque',
  },
  gate_inverter_arranque: {
    gate: 'inverter_si',
    id: 'gate_inverter_arranque', type: 'question',
    text: '¿El compresor del equipo es tecnología Inverter?',
    detail: 'Los compresores Inverter no usan relé PTC externo: los alimenta un módulo driver (tarjeta inverter) que controla la velocidad. Verifica la placa del compresor o el manual del equipo.',
    tip: 'Indicios de Inverter: módulo electrónico grande cerca del compresor, sin PTC externo visible y frecuencia variable audible al operar.',
    options: [
      { label: 'Sí, es tecnología Inverter', nextId: 'inv_start', color: 'neutral' },
      { label: 'No, es compresor convencional', nextId: 'result_ptc_o_compresor', color: 'success' },
    ],
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
    text: 'Medir las bobinas del compresor (C-S, C-R, S-R) desenergizado',
    detail: 'Retira el relé PTC y el capacitor, y mide entre los pines del compresor: C–S (arranque), C–R (marcha) y S–R. S-R debe ser la SUMA de las otras dos (C-S + C-R = S-R). Valores típicos en compresores domésticos: C-R entre 8 y 20 Ω, C-S entre 15 y 40 Ω (compara con la placa del compresor). S-R con el doble o más de lo esperado indica devanado de arranque abierto.',
    tip: 'Si alguna medida da infinito (∞) el devanado está abierto. Si da 0 Ω hay corto entre espiras. Compara siempre con el valor de la placa antes de condenar el compresor.',
    gifUri: 'medir-bobinas',
    evidenceLabel: 'Foto de las tres mediciones (C-S, C-R, S-R) junto a la placa del compresor',
    nextId: 'bobinas_arranque_ok',
  },
  bobinas_arranque_ok: {
    id: 'bobinas_arranque_ok', type: 'question',
    text: '¿Las bobinas cumplen la relación C-S + C-R = S-R y están dentro del rango de placa?',
    options: [
      { label: 'Sí, cumplen la relación y el rango', nextId: 'tierra_arranque', color: 'success' },
      { label: 'No, están abiertas, en corto o fuera de rango', nextId: 'result_compresor_falla', color: 'danger' },
    ],
  },
  tierra_arranque: {
    id: 'tierra_arranque', type: 'measure',
    text: 'Verificar aislamiento a tierra de las bobinas (C, S y R contra carcasa)',
    detail: 'Mide entre cada pin del compresor (C, S, R) y la carcasa (tubo de cobre desnudo o tornillo). Debe marcar ABIERTO (∞ / OL) en los tres. Continuidad o una resistencia baja (menos de 2 MΩ) significa bobinas caídas a tierra.',
    tip: 'Usa la escala de ohmios más alta. Un compresor caído a tierra dispara el breaker y destruye relés PTC nuevos: valida esto antes de cambiar el kit.',
    gifUri: 'medir-continuidad-tierra',
    evidenceLabel: 'Foto de la medición de C, S y R contra la carcasa (debe marcar OL/∞)',
    nextId: 'tierra_arranque_ok',
  },
  tierra_arranque_ok: {
    id: 'tierra_arranque_ok', type: 'question',
    text: '¿Alguna bobina está caída a tierra (continuidad con la carcasa)?',
    options: [
      { label: 'Sí, hay continuidad a tierra', nextId: 'result_compresor_tierra_conv', color: 'danger' },
      { label: 'No, aislamiento correcto (OL)', nextId: 'result_ptc_o_compresor', color: 'neutral' },
    ],
  },
  result_compresor_tierra_conv: {
    id: 'result_compresor_tierra_conv', type: 'result',
    text: 'Compresor con bobinas caídas a tierra — reemplazo obligatorio',
    result: {
      causes: [
        { cause: 'Aislamiento de los devanados degradado (bobinas caídas a tierra)', probability: 85 },
        { cause: 'Humedad interna del compresor conduciendo a la carcasa', probability: 15 },
      ],
      recommendation: 'El compresor no es reparable: reemplazar con la referencia exacta. NO instalar kit PTC ni capacitor nuevo sin cambiar el compresor: la caída a tierra los destruye al energizar. Verificar el estado del filtro secante si hubo humedad del sistema.',
      parts: ['Compresor', 'Filtro secante'],
    },
  },
  result_compresor_falla: {
    id: 'result_compresor_falla', type: 'result',
    text: 'Compresor con falla eléctrica interna',
    result: {
      causes: [
        { cause: 'Devanado abierto (bobina en infinito) o desbalanceado', probability: 55 },
        { cause: 'Devanado en corto entre espiras (valor por debajo de placa)', probability: 25 },
        { cause: 'Devanado en corto a tierra', probability: 15 },
        { cause: 'Compresor agarrotado (devanados ok pero no gira)', probability: 5 },
      ],
      recommendation: 'Con bobinas fuera de especificación (comparadas con la placa) o caídas a tierra, solicitar reemplazo de compresor con la evidencia fotográfica de las mediciones.',
      parts: ['Compresor'],
    },
  },
  // Nodos de tecnología Inverter compartidos (se alcanzan vía gate_inverter_arranque)
  ...INVERTER_TREE,
};;

// Reexportaciones de comunes usados por códigos y síntomas de nevera
export { ERRORELECTRONICO, ESCARCHA, CONGELA_NOENFRIA };


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
    ntcTable: true,
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
    ntcTable: true,
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
    ntcTable: true,
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
    ntcTable: true,
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
