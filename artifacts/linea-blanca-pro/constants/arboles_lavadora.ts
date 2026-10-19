import type { DiagnosticTree } from '@/types/diagnostico';
import { INVERTER_TREE } from '@/constants/arbol_inverter';

// ══════════════════════════════════════════════════════════════════════════
// Árboles base de lavadora/secadora por síntoma (migrados de arboles.ts).
// Los códigos de error de lavadora tienen árboles dedicados en
// arboles_codigos_lavadora.ts y las fallas silenciosas más abajo.
// ══════════════════════════════════════════════════════════════════════════

export const NOCENTRIFUGA: DiagnosticTree = {
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
};;

export const NODESAGUA: DiagnosticTree = {
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
};;

export const NOLLENA: DiagnosticTree = {
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
};;

export const ERRORELECTRONICO_LAVADORA: DiagnosticTree = {
  start: {
    id: 'start', type: 'question',
    // El código ya fue validado en el flujo inicial (paso 1B): esta pantalla
    // solo clasifica la falla si el técnico entró por una falla de síntoma.
    text: '¿Qué tipo de falla electrónica reporta la lavadora?',
    detail: 'Si entraste con un código de error ya validado, el árbol te lleva directo a la rama correspondiente. Estas ramas son para clasificar fallas electrónicas cuando se llega por síntoma.',
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
    ntcTable: true,
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
};;

export const NOLAVADO: DiagnosticTree = {
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
};;

export const NOSECA: DiagnosticTree = {
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
    nextId: 'gate_inverter_secadora',
  },
  gate_inverter_secadora: {
    id: 'gate_inverter_secadora', type: 'question',
    text: '¿El compresor del equipo es tecnología Inverter?',
    detail: 'Algunas secadoras premium y lavadoras-secadoras usan compresor inverter en su bomba de calor. Verifica la placa o el manual del equipo.',
    tip: 'Indicios de Inverter: módulo electrónico grande cerca del compresor y frecuencia variable audible al operar.',
    options: [
      { label: 'Sí, es tecnología Inverter', nextId: 'inv_start', color: 'neutral' },
      { label: 'No, es compresor convencional', nextId: 'result_motor_secadora', color: 'success' },
    ],
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
  // Nodos de tecnología Inverter compartidos (se alcanzan vía gate_inverter_secadora)
  ...INVERTER_TREE,
};;


// ══════════════════════════════════════════════════════════════════════════
// Árboles de FALLAS SILENCIOSAS — LAVADORAS y LAVADORA-SECADORA (sin código)
// Basados en el "Manual de revisión y diagnóstico de lavadoras digitales"
// (Parte II). Solo procedimientos con multímetro, pinza y prueba manual:
// se EXCLUYEN las validaciones que requieren osciloscopio.
// ══════════════════════════════════════════════════════════════════════════

// ── 1. Falla de encendido total (placa muerta) ──────────────────────────────
const LAV_PLACA_MUERTA: DiagnosticTree = {
  start: {
    id: 'start', type: 'measure',
    text: 'Confirmar tomacorriente y cable de poder, luego medir la fuente SMPS de la tarjeta',
    detail: 'Confirma que el tomacorriente tiene voltaje y que el cable de poder da continuidad. En la tarjeta, mide continuidad del fusible principal y del varistor. Mide el voltaje DC en el capacitor principal de la fuente: debe haber entre 160 y 320 V DC.',
    gifUri: 'medir-voltaje',
    evidenceLabel: 'Foto del voltaje DC medido en el capacitor principal de la SMPS',
    nextId: 'pm_fuente',
  },
  pm_fuente: {
    id: 'pm_fuente', type: 'question',
    text: '¿El capacitor principal tiene voltaje DC (160–320 V) pero la placa sigue muerta?',
    options: [
      { label: 'Sí, hay bus DC y no enciende nada', nextId: 'pm_conmutador', color: 'danger' },
      { label: 'No hay voltaje en el capacitor', nextId: 'pm_result_entrada', color: 'danger' },
    ],
  },
  pm_result_entrada: {
    id: 'pm_result_entrada', type: 'result',
    text: 'Falla en la entrada AC de la fuente conmutada',
    result: {
      causes: [
        { cause: 'Fusible principal abierto por pico eléctrico', probability: 45 },
        { cause: 'Varistor o rectificador de entrada en corto', probability: 35 },
        { cause: 'Capacitor principal abierto o seco', probability: 20 },
      ],
      recommendation: 'Reemplazar el fusible solo después de descartar corto aguas abajo. Si el varistor o el rectificador están en corto, reemplazarlos junto con el fusible. Documenta la medición como evidencia.',
      parts: ['Fusible principal SMPS', 'Varistor', 'Rectificador de entrada'],
    },
  },
  pm_conmutador: {
    id: 'pm_conmutador', type: 'question',
    text: '¿El integrado conmutador (ej. LNK304, TNY) marca corto entre Drain y Source?',
    detail: 'Con la placa desenergizada y el capacitor descargado, mide en escala de diodos entre los pines Drain y Source del integrado de la SMPS.',
    options: [
      { label: 'Sí, el conmutador está en corto', nextId: 'pm_result_smps', color: 'danger' },
      { label: 'No, el conmutador mide bien', nextId: 'pm_result_secundario', color: 'neutral' },
    ],
  },
  pm_result_smps: {
    id: 'pm_result_smps', type: 'result',
    text: 'Integrado conmutador de la SMPS en corto',
    result: {
      causes: [
        { cause: 'Integrado conmutador (LNK304/TNY u otro) en corto Drain-Source', probability: 70 },
        { cause: 'Resistencia fusible de la SMPS abierta por el corto', probability: 30 },
      ],
      recommendation: 'Reemplazar el integrado conmutador junto con la resistencia fusible. Verificar el primario y el diodo de retorno (snubber) antes de energizar. Documenta la medición como evidencia.',
      parts: ['Integrado conmutador SMPS', 'Resistencia fusible'],
    },
  },
  pm_result_secundario: {
    id: 'pm_result_secundario', type: 'result',
    text: 'Falla en el secundario de la fuente (5 V / 12 V)',
    result: {
      causes: [
        { cause: 'Diodo de salida o filtro del secundario en corto', probability: 50 },
        { cause: 'Regulador de 5 V del microcontrolador dañado', probability: 30 },
        { cause: 'Carga en corto aguas abajo (display o motor paso a paso)', probability: 20 },
      ],
      recommendation: 'Medir los diodos de salida y el regulador de 5 V; desconectar cargas para aislar el corto. Reparar el secundario y verificar el arranque de la fuente.',
      parts: ['Regulador de 5 V', 'Diodos de salida SMPS'],
    },
  },
};

// ── 2. Carga agua, pero el ciclo no inicia (se congela) ──────────────────────
const LAV_CICLO_CONGELADO: DiagnosticTree = {
  start: {
    id: 'start', type: 'question',
    text: '¿El bloqueapuertas queda en un estado ambiguo (ni cerrado ni abierto) por humedad?',
    detail: 'Una resistencia parásita por humedad (ej. 100 Ω en el switch del bloqueapuertas) no marca cerrado ni abierto y deja al microcontrolador atascado: llena agua pero el software no arranca el ciclo.',
    gifUri: 'medir-continuidad-tierra',
    options: [
      { label: 'Sí, el bloqueapuertas mide ambiguo', nextId: 'cc_result_bloc', color: 'danger' },
      { label: 'No, el bloqueapuertas marca limpio', nextId: 'cc_presostato', color: 'success' },
    ],
  },
  cc_result_bloc: {
    id: 'cc_result_bloc', type: 'result',
    text: 'Blocapuertas con fuga resistiva por humedad',
    result: {
      causes: [
        { cause: 'Contactos del bloqueapuertas con resistencia parásita por humedad', probability: 75 },
        { cause: 'Conector del bloqueapuertas con fuga o sulfato', probability: 25 },
      ],
      recommendation: 'Reemplazar el bloqueapuertas y secar/proteger la zona de humedad. Verificar que la señal llegue limpia a la tarjeta antes de liberar el equipo.',
      parts: ['Blocapuertas'],
    },
  },
  cc_presostato: {
    id: 'cc_presostato', type: 'question',
    text: '¿La lectura de nivel rebota entre "lleno" y "llenando" (presostato oscilante)?',
    detail: 'Fugas milimétricas en la manguera del presostato hacen oscilar la señal de nivel y generan un bucle infinito en el software. Revisa la manguera con agua jabonosa presurizando suavemente.',
    options: [
      { label: 'Sí, la señal de nivel es intermitente', nextId: 'cc_result_presostato', color: 'danger' },
      { label: 'No, el nivel es estable', nextId: 'cc_uart', color: 'success' },
    ],
  },
  cc_result_presostato: {
    id: 'cc_result_presostato', type: 'result',
    text: 'Presostato oscilante por fuga en su manguera',
    result: {
      causes: [
        { cause: 'Manguera del presostato con fuga milimétrica', probability: 65 },
        { cause: 'Presostato con cámara o diafragma deteriorado', probability: 35 },
      ],
      recommendation: 'Reemplazar la manguera del presostato (corte limpio y ajuste firme) o el presostato si su diafragma está dañado. Confirmar que el ciclo avanza después de la corrección.',
      parts: ['Manguera del presostato', 'Presostato'],
    },
  },
  cc_uart: {
    id: 'cc_uart', type: 'question',
    text: '¿La máquina es inverter y hay pérdida de comunicación entre display y placa (bus UART TX/RX)?',
    detail: 'En lavadoras inverter, la pérdida de comunicación (cables TX/RX) entre el display y la placa inverter bloquea el inicio del ciclo aunque todo lo demás esté bien.',
    options: [
      { label: 'Sí, hay falla de comunicación UART', nextId: 'cc_result_uart', color: 'danger' },
      { label: 'No aplica o la comunicación está bien', nextId: 'cc_result_tarjeta', color: 'neutral' },
    ],
  },
  cc_result_uart: {
    id: 'cc_result_uart', type: 'result',
    text: 'Bus UART entre display y placa inverter interrumpido',
    result: {
      causes: [
        { cause: 'Cable TX/RX del bus UART con falso contacto', probability: 55 },
        { cause: 'Circuito de comunicación del display dañado', probability: 25 },
        { cause: 'Circuito de comunicación de la placa inverter dañado', probability: 20 },
      ],
      recommendation: 'Rehacer terminales y verificar continuidad del bus en ambos extremos. Si el cable está correcto, aislar el lado que no responde según el diagrama del modelo.',
      parts: ['Cableado del display', 'Placa inverter'],
    },
  },
  cc_result_tarjeta: {
    id: 'cc_result_tarjeta', type: 'result',
    text: 'Tarjeta principal sin señal de arranque de ciclo',
    result: {
      causes: [
        { cause: 'Etapa de entrada de la tarjeta (bloc/nivel) con falla de lectura', probability: 50 },
        { cause: 'Microcontrolador con firmware atascado por señal marginal', probability: 30 },
        { cause: 'Tarjeta principal defectuosa', probability: 20 },
      ],
      recommendation: 'Con blocapuertas, presostato y comunicación verificados, probar el modo de servicio del modelo. Si el hardware responde en manual, solicitar la tarjeta principal.',
      parts: ['Tarjeta principal'],
    },
  },
};

// ── 3. El motor zumba o vibra a mitad del ciclo (no gira) ────────────────────
const LAV_MOTOR_ZUMBA: DiagnosticTree = {
  start: {
    id: 'start', type: 'question',
    text: '¿El motor es convencional (AC con capacitor) o inverter?',
    detail: 'El procedimiento cambia por completo: el motor convencional se diagnostica con capacitor y triacs de giro; el inverter se diagnostica midiendo el módulo IPM en escala de diodos.',
    options: [
      { label: 'Motor convencional AC', nextId: 'mz_bloqueo', color: 'neutral' },
      { label: 'Motor inverter', nextId: 'mz_ipm', color: 'neutral' },
    ],
  },
  mz_bloqueo: {
    id: 'mz_bloqueo', type: 'question',
    text: '¿La tina o el tambor están trabados mecánicamente?',
    detail: 'Con el equipo desenergizado, gira el tambor a mano. Un objeto atascado entre tina y tambor o un rodamiento agarrotado impiden el giro aunque el motor reciba potencia.',
    options: [
      { label: 'Sí, hay bloqueo mecánico', nextId: 'mz_result_bloqueo', color: 'danger' },
      { label: 'No, gira libre a mano', nextId: 'mz_capacitor', color: 'success' },
    ],
  },
  mz_result_bloqueo: {
    id: 'mz_result_bloqueo', type: 'result',
    text: 'Motor bloqueado mecánicamente',
    result: {
      causes: [
        { cause: 'Objeto extraño entre tina y tambor', probability: 60 },
        { cause: 'Rodamiento o buje del tambor agarrotado', probability: 40 },
      ],
      recommendation: 'Retirar el objeto o reemplazar el rodamiento/depósito de rodamientos. Verificar el amperaje del motor en marcha después de la corrección.',
      parts: ['Rodamiento del tambor'],
    },
  },
  mz_capacitor: {
    id: 'mz_capacitor', type: 'measure',
    text: 'Medir el capacitor de marcha del motor',
    detail: 'Descarga el capacitor y mide su capacitancia real. Si baja del 50 % del valor nominal en microfaradios, el motor pierde el par de arranque y solo zumba.',
    gifUri: 'medir-continuidad-tierra',
    evidenceLabel: 'Foto del valor medido del capacitor vs el nominal de la placa',
    nextId: 'mz_capacitor_ok',
  },
  mz_capacitor_ok: {
    id: 'mz_capacitor_ok', type: 'question',
    text: '¿El capacitor está por debajo del 50 % de su valor o fuera de tolerancia?',
    options: [
      { label: 'Sí, capacitor deficiente', nextId: 'mz_result_capacitor', color: 'danger' },
      { label: 'No, el capacitor mide bien', nextId: 'mz_triac', color: 'success' },
    ],
  },
  mz_result_capacitor: {
    id: 'mz_result_capacitor', type: 'result',
    text: 'Capacitor de marcha del motor deficiente',
    result: {
      causes: [
        { cause: 'Capacitor de marcha con capacitancia por debajo del 50 % del valor nominal', probability: 80 },
        { cause: 'Conector o terminal del capacitor deteriorado', probability: 20 },
      ],
      recommendation: 'Reemplazar el capacitor con el valor exacto de la placa (μF y voltaje). Verificar el arranque y el amperaje del motor después del cambio.',
      parts: ['Capacitor de marcha'],
    },
  },
  mz_triac: {
    id: 'mz_triac', type: 'question',
    text: '¿Hay un triac de giro en corto en la tarjeta (el motor solo fuerza un sentido)?',
    detail: 'Si el triac de uno de los giros quedó en corto, el motor recibe potencia en ambas bobinas a la vez y solo zumba/vibra sin girar. Mide MT1-MT2 y MT1-Gate en la placa base.',
    options: [
      { label: 'Sí, triac en corto', nextId: 'mz_result_triac', color: 'danger' },
      { label: 'No, los triacs miden bien', nextId: 'mz_result_bobinas', color: 'success' },
    ],
  },
  mz_result_triac: {
    id: 'mz_result_triac', type: 'result',
    text: 'Triac de giro en corto en la tarjeta principal',
    result: {
      causes: [
        { cause: 'Triac de giro en corto (conduce directo)', probability: 65 },
        { cause: 'Optoacoplador de disparo del triac dañado', probability: 35 },
      ],
      recommendation: 'Reemplazar el triac y revisar el optoacoplador de disparo antes de energizar: un driver dañado puede destruir el triac nuevo. Confirmar el giro en ambos sentidos en prueba.',
      parts: ['Triac de giro', 'Optoacoplador MOC'],
    },
  },
  mz_result_bobinas: {
    id: 'mz_result_bobinas', type: 'result',
    text: 'Motor convencional con falla interna',
    result: {
      causes: [
        { cause: 'Devanado del motor abierto o desbalanceado', probability: 60 },
        { cause: 'Falla mecánica interna del motor (rodamiento)', probability: 40 },
      ],
      recommendation: 'Mide las tres bobinas con el multímetro (ninguna en abierto, sin continuidad a tierra) y verifica el giro libre del eje. Con bobinas fuera de especificación, solicitar el motor.',
      parts: ['Motor de lavadora'],
    },
  },
  mz_ipm: {
    id: 'mz_ipm', type: 'measure',
    text: 'Medir caída de tensión del módulo IPM en escala de diodos (bus DC hacia U, V, W)',
    detail: 'Desenergiza el equipo y descarga los capacitores del bus DC. En escala de diodos, mide desde el bus DC hacia cada fase U, V y W del módulo IPM: las tres deben medir aproximadamente igual (~0.5 V).',
    gifUri: 'medir-senal-inverter',
    evidenceLabel: 'Foto de las tres mediciones de diodo del IPM (U, V, W)',
    nextId: 'mz_ipm_ok',
  },
  mz_ipm_ok: {
    id: 'mz_ipm_ok', type: 'question',
    text: '¿Alguna fase marca 0 V (corto) o las mediciones son desbalanceadas?',
    options: [
      { label: 'Sí, el módulo está en corto o desbalanceado', nextId: 'mz_result_ipm', color: 'danger' },
      { label: 'No, las tres fases miden igual (~0.5 V)', nextId: 'mz_result_motor_inv', color: 'success' },
    ],
  },
  mz_result_ipm: {
    id: 'mz_result_ipm', type: 'result',
    text: 'Módulo IPM / IGBT en corto',
    result: {
      causes: [
        { cause: 'IGBT del módulo IPM en corto (0 V entre bus y fase)', probability: 70 },
        { cause: 'Tarjeta inverter con etapa de disparo dañada', probability: 30 },
      ],
      recommendation: 'Reemplazar el módulo IPM o la tarjeta inverter. Antes de energizar, confirmar que el motor no esté en corto para no dañar el repuesto nuevo.',
      parts: ['Módulo IPM', 'Tarjeta inverter'],
    },
  },
  mz_result_motor_inv: {
    id: 'mz_result_motor_inv', type: 'result',
    text: 'Motor inverter con falla (IPM correcto)',
    result: {
      causes: [
        { cause: 'Devanados del motor inverter desbalanceados o en corto', probability: 60 },
        { cause: 'Sensor Hall del motor sin señal por humedad o daño', probability: 40 },
      ],
      recommendation: 'Mide las bobinas del motor desenergizado y verifica la señal del sensor Hall en el conector. Con bobinas fuera de especificación, solicitar el motor con la referencia exacta.',
      parts: ['Motor inverter de lavadora', 'Sensor Hall'],
    },
  },
};

// ── 4. Llenado infinito de agua con la lavadora apagada ──────────────────────
const LAV_LLENADO_INFINITO: DiagnosticTree = {
  start: {
    id: 'start', type: 'question',
    text: '¿El agua entra incluso con la lavadora desconectada de la red?',
    detail: 'Si con la máquina desconectada sigue entrando agua, la falla es mecánica o el triac quedó fundido conduciendo directo. Si solo entra conectada, la tarjeta ordena el llenado.',
    options: [
      { label: 'Sí, entra agua sin energía', nextId: 'li_triac', color: 'danger' },
      { label: 'No, solo conectada a la red', nextId: 'li_result_orden', color: 'danger' },
    ],
  },
  li_result_orden: {
    id: 'li_result_orden', type: 'result',
    text: 'La tarjeta ordena llenado sin ciclo activo',
    result: {
      causes: [
        { cause: 'Presostato o señal de nivel con fuga que reporta "tina vacía"', probability: 45 },
        { cause: 'Microcontrolador con entrada de nivel dañada', probability: 35 },
        { cause: 'Válvula con fuga mecánica leve (goteo continuo)', probability: 20 },
      ],
      recommendation: 'Verificar la señal de nivel en la tarjeta y el asiento de las electroválvulas. Corregir la señal falsa de nivel antes de condenar la tarjeta.',
      parts: ['Presostato', 'Electroválvula'],
    },
  },
  li_triac: {
    id: 'li_triac', type: 'measure',
    text: 'Medir el triac de la válvula en la placa base (pines MT1 y MT2)',
    detail: 'Con la placa desenergizada y descargada, mide resistencia entre MT1 y MT2 del triac de la electroválvula. Una lectura menor a 5 Ω indica el triac fundido conduciendo directo.',
    evidenceLabel: 'Foto de la medición MT1-MT2 del triac de la válvula',
    nextId: 'li_triac_ok',
  },
  li_triac_ok: {
    id: 'li_triac_ok', type: 'question',
    text: '¿El triac mide menos de 5 Ω entre MT1 y MT2?',
    options: [
      { label: 'Sí, el triac se fundió', nextId: 'li_driver', color: 'danger' },
      { label: 'No, el triac mide abierto', nextId: 'li_result_valvula', color: 'success' },
    ],
  },
  li_driver: {
    id: 'li_driver', type: 'question',
    text: '¿El IC driver (ej. ULN2003) quedó dañado por el corto del triac?',
    detail: 'Antes de cambiar el triac, revisa el IC driver que lo gatilla: el cortocircuito del triac puede haberlo dañado también. Mide sus salidas contra tierra.',
    options: [
      { label: 'Sí, el driver también está dañado', nextId: 'li_result_ambos', color: 'danger' },
      { label: 'No, solo el triac', nextId: 'li_result_triac', color: 'danger' },
    ],
  },
  li_result_triac: {
    id: 'li_result_triac', type: 'result',
    text: 'Triac de la electroválvula fundido en corto',
    result: {
      causes: [
        { cause: 'Triac de la válvula fundido conduciendo directo (<5 Ω MT1-MT2)', probability: 85 },
        { cause: 'Soldadura fría o pista de disparo marginal', probability: 15 },
      ],
      recommendation: 'Reemplazar el triac por el equivalente exacto (verificar corriente y aislamiento). Verificar el driver antes de energizar y probar el llenado controlado en prueba.',
      parts: ['Triac de electroválvula'],
    },
  },
  li_result_ambos: {
    id: 'li_result_ambos', type: 'result',
    text: 'Triac y IC driver de válvula dañados',
    result: {
      causes: [
        { cause: 'Triac en corto que dañó el IC driver (ULN2003 u otro)', probability: 60 },
        { cause: 'Driver degradado que destruyó el triac', probability: 40 },
      ],
      recommendation: 'Reemplazar ambos componentes y revisar la fuente de 12 V de la etapa. Reparar solo el triac sin verificar el driver suele reproducir la falla.',
      parts: ['Triac de electroválvula', 'IC driver'],
    },
  },
  li_result_valvula: {
    id: 'li_result_valvula', type: 'result',
    text: 'Electroválvula mecánicamente abierta',
    result: {
      causes: [
        { cause: 'Dielco/membrana de la electroválvula que no cierra', probability: 65 },
        { cause: 'Sedimento que impide el cierre de la válvula', probability: 35 },
      ],
      recommendation: 'Reemplazar la electroválvula con la referencia del modelo y limpiar el filtro de malla de entrada. Verificar la presión de red dentro de rango (>0.5 bar).',
      parts: ['Electroválvula'],
    },
  },
};

// ── 5. Reseteos aleatorios y botones erráticos ───────────────────────────────
// Nota: el monitoreo de rizado con osciloscopio fue EXCLUIDO por alcance
// (solo multímetro/capacímetro o reemplazo preventivo de capacitores).
const LAV_RESETEOS: DiagnosticTree = {
  start: {
    id: 'start', type: 'question',
    text: '¿La lavadora se reinicia sola justo cuando arranca el motor o una carga pesada?',
    detail: 'Los capacitores electrolíticos de 5 V/12 V deshidratados (alta ESR) hacen que el voltaje caiga (ej. a 3.8 V) al encender el motor y el microcontrolador se reinicie por protección (Brown-Out Reset).',
    options: [
      { label: 'Sí, resetea al activar cargas', nextId: 'rs_capacitores', color: 'danger' },
      { label: 'No, resetea aleatorio sin carga', nextId: 'rs_botones', color: 'neutral' },
    ],
  },
  rs_capacitores: {
    id: 'rs_capacitores', type: 'question',
    text: '¿Los capacitores electrolíticos de la fuente tienen signos de deshidratación (tapa abombada, ESR alta o capacitancia baja)?',
    detail: 'Con capacitímetro/medidor ESR (o por reemplazo preventivo en equipos viejos), verifica los electrolíticos de 5 V y 12 V del regulador del microcontrolador.',
    options: [
      { label: 'Sí, capacitores deshidratados', nextId: 'rs_result_fuente', color: 'danger' },
      { label: 'No, los capacitores miden bien', nextId: 'rs_result_alimentacion', color: 'neutral' },
    ],
  },
  rs_result_fuente: {
    id: 'rs_result_fuente', type: 'result',
    text: 'Capacitores de la fuente con alta ESR provocan Brown-Out',
    result: {
      causes: [
        { cause: 'Capacitores electrolíticos de 5 V/12 V deshidratados (alta ESR)', probability: 70 },
        { cause: 'Regulador del microcontrolador degradado', probability: 30 },
      ],
      recommendation: 'Reemplazar todos los electrolíticos de la etapa de 5 V/12 V (no solo el evidente) y verificar el voltaje del microcontrolador con el motor en marcha. Evitará reseteos intermitentes difíciles de reproducir.',
      parts: ['Capacitores electrolíticos', 'Regulador de 5 V'],
    },
  },
  rs_result_alimentacion: {
    id: 'rs_result_alimentacion', type: 'result',
    text: 'Alimentación de red o tierra con falla',
    result: {
      causes: [
        { cause: 'Voltaje de red bajo o con microcortes', probability: 50 },
        { cause: 'Tomacorriente o tierra con contacto intermitente', probability: 35 },
        { cause: 'Tarjeta principal con soldadura fría', probability: 15 },
      ],
      recommendation: 'Medir el voltaje de red durante la falla y probar el equipo en otro circuito. Reinspeccionar soldaduras de la tarjeta si el problema sigue en otro tomacorriente.',
      parts: ['Protector eléctrico'],
    },
  },
  rs_botones: {
    id: 'rs_botones', type: 'question',
    text: '¿La máquina cambia de ciclo o pulsación sola (botones fantasma)?',
    detail: 'La humedad genera fugas de voltaje resistivas en botones sulfatados: el microcontrolador detecta pulsaciones fantasma y cambia de ciclo solo.',
    options: [
      { label: 'Sí, hay pulsaciones fantasma', nextId: 'rs_result_botones', color: 'danger' },
      { label: 'No, solo se reinicia el ciclo', nextId: 'rs_result_tarjeta', color: 'neutral' },
    ],
  },
  rs_result_botones: {
    id: 'rs_result_botones', type: 'result',
    text: 'Teclado con botones sulfatados / fugas resistivas',
    result: {
      causes: [
        { cause: 'Botones sulfatados con fuga resistiva por humedad', probability: 70 },
        { cause: 'Matriz del teclado con humedad o detergente', probability: 30 },
      ],
      recommendation: 'Reemplazar la membrana/teclado y secar el gabinete. En ambientes húmedos, revisar el sello del panel de control para evitar recurrencia.',
      parts: ['Teclado / membrana'],
    },
  },
  rs_result_tarjeta: {
    id: 'rs_result_tarjeta', type: 'result',
    text: 'Tarjeta principal con falla de microcontrolador',
    result: {
      causes: [
        { cause: 'Soldadura fría o pista intermitente en la tarjeta', probability: 45 },
        { cause: 'Cristal/reloj del microcontrolador degradado', probability: 30 },
        { cause: 'Microcontrolador dañado', probability: 25 },
      ],
      recommendation: 'Reinspeccionar y resoldar la zona del microcontrolador y el cristal. Si los reseteos persisten con alimentación y teclado verificados, solicitar la tarjeta principal.',
      parts: ['Tarjeta principal'],
    },
  },
};

// ── 6. Desagüe silencioso (retiene agua sin arrojar error) ───────────────────
const LAV_DESAGUE_SILENCIOSO: DiagnosticTree = {
  start: {
    id: 'start', type: 'question',
    text: '¿La bomba está mecánicamente bien (impulsor libre, sin objetos) y aun así no desagua?',
    detail: 'Descarta primero bloqueos físicos: filtro de la bomba, objetos extraños y manguera de drenaje. Esta rama es para cuando la bomba está sana pero no recibe la orden.',
    options: [
      { label: 'Sí, la bomba está sana', nextId: 'ds_voltaje', color: 'success' },
      { label: 'No, hay bloqueo o rotor con falla', nextId: 'ds_result_bomba', color: 'danger' },
    ],
  },
  ds_result_bomba: {
    id: 'ds_result_bomba', type: 'result',
    text: 'Bomba de drenaje con falla mecánica',
    result: {
      causes: [
        { cause: 'Objetos extraños o pelusas bloqueando el impulsor', probability: 55 },
        { cause: 'Rotor magnético oxidado o dilatado (zumba pero no gira)', probability: 45 },
      ],
      recommendation: 'Limpiar el filtro y el impulsor. Si la bomba zumba sin girar aun limpia, reemplazar la bomba completa (el rotor magnético no se repara de forma confiable).',
      parts: ['Bomba de drenaje'],
    },
  },
  ds_voltaje: {
    id: 'ds_voltaje', type: 'measure',
    text: 'Medir si la placa envía voltaje alterno a la bomba durante el ciclo de drenaje',
    detail: 'Con el equipo en el intento de drenaje, mide voltaje AC en los terminales de la bomba. Si la placa envía 0 V, la orden de drenaje no está llegando a la etapa de potencia.',
    gifUri: 'medir-voltaje',
    evidenceLabel: 'Foto del voltaje medido en los terminales de la bomba',
    nextId: 'ds_voltaje_ok',
  },
  ds_voltaje_ok: {
    id: 'ds_voltaje_ok', type: 'question',
    text: '¿La placa envía 0 V a la bomba durante el drenaje?',
    options: [
      { label: 'Sí, no llega voltaje a la bomba', nextId: 'ds_triac', color: 'danger' },
      { label: 'No, llega voltaje y la bomba no trabaja', nextId: 'ds_result_bomba_elec', color: 'danger' },
    ],
  },
  ds_result_bomba_elec: {
    id: 'ds_result_bomba_elec', type: 'result',
    text: 'Bomba con bobina abierta (recibe voltaje y no trabaja)',
    result: {
      causes: [
        { cause: 'Bobina de la bomba abierta', probability: 75 },
        { cause: 'Conector o cableado de la bomba deteriorado', probability: 25 },
      ],
      recommendation: 'Medir la resistencia de la bomba desenchufada. Con bobina abierta, reemplazar la bomba; con conector en mal estado, reparar el cableado y re-probar.',
      parts: ['Bomba de drenaje'],
    },
  },
  ds_triac: {
    id: 'ds_triac', type: 'question',
    text: '¿El cableado hasta la bomba está correcto y la orden no sale de la tarjeta?',
    detail: 'Si el cableado está bien, el triac de bomba está abierto o la pista del pulso desde el microcontrolador hacia la etapa de potencia está abierta o sulfatada.',
    options: [
      { label: 'Sí, cableado OK y sin orden de la tarjeta', nextId: 'ds_result_tarjeta', color: 'danger' },
      { label: 'Se corrigió el cableado/conector', nextId: 'ds_result_cable', color: 'success' },
    ],
  },
  ds_result_cable: {
    id: 'ds_result_cable', type: 'result',
    text: 'Conector o cableado de la bomba en mal estado',
    result: {
      causes: [
        { cause: 'Conector sulfatado o con falso contacto', probability: 60 },
        { cause: 'Cable interrumpido entre tarjeta y bomba', probability: 40 },
      ],
      recommendation: 'Rehacer terminales y verificar continuidad completa del circuito. Probar el ciclo de drenaje completo después de la corrección.',
      parts: ['Conector de la bomba', 'Cableado de la bomba'],
    },
  },
  ds_result_tarjeta: {
    id: 'ds_result_tarjeta', type: 'result',
    text: 'Triac de bomba o etapa de potencia sin salida',
    result: {
      causes: [
        { cause: 'Triac de bomba abierto (no conduce al gatillarse)', probability: 50 },
        { cause: 'Pista del pulso microcontrolador-etapa de potencia abierta o sulfatada', probability: 30 },
        { cause: 'IC driver de la bomba dañado', probability: 20 },
      ],
      recommendation: 'Verificar el triac de bomba en la placa base y la continuidad del pulso desde el microcontrolador. Reemplazar el triac o reparar la pista, y probar con la bomba conectada.',
      parts: ['Triac de bomba', 'Tarjeta principal'],
    },
  },
};

// ── 7. Lavado asimétrico (gira a un solo lado y enreda la ropa) ──────────────
const LAV_ASIMETRICO: DiagnosticTree = {
  start: {
    id: 'start', type: 'question',
    text: '¿El giro es correcto en un sentido y ausente o débil en el otro?',
    detail: 'El lavado asimétrico enreda la ropa porque uno de los dos giros no se ejecuta. Descarta primero que sea mecánico (actuador) o electrónico (optoacoplador/triac).',
    options: [
      { label: 'Solo gira bien en un sentido', nextId: 'as_opto', color: 'danger' },
      { label: 'Gira débil en ambos sentidos', nextId: 'as_result_mecanico', color: 'neutral' },
    ],
  },
  as_result_mecanico: {
    id: 'as_result_mecanico', type: 'result',
    text: 'Transmisión o motor con par insuficiente',
    result: {
      causes: [
        { cause: 'Capacitor de marcha por debajo del 50 % del valor nominal', probability: 45 },
        { cause: 'Engranajes de la transmisión desgastados', probability: 35 },
        { cause: 'Correa patinando o desgastada', probability: 20 },
      ],
      recommendation: 'Medir el capacitor, inspeccionar correa y engranajes. Corregir la causa mecánica/eléctrica y verificar el giro completo en ambos sentidos.',
      parts: ['Capacitor de marcha', 'Correa', 'Kit de transmisión'],
    },
  },
  as_opto: {
    id: 'as_opto', type: 'question',
    text: '¿Uno de los optoacopladores (ej. MOC3021) o triacs de giro está abierto?',
    detail: 'Si un optoacoplador o su triac quedó abierto, la tarjeta manda la orden de giro pero la potencia no llega al motor en ese sentido.',
    options: [
      { label: 'Sí, hay opto/triac abierto', nextId: 'as_result_opto', color: 'danger' },
      { label: 'No, la etapa de potencia está bien', nextId: 'as_actuador', color: 'success' },
    ],
  },
  as_result_opto: {
    id: 'as_result_opto', type: 'result',
    text: 'Optoacoplador o triac de giro abierto',
    result: {
      causes: [
        { cause: 'Optoacoplador de giro (MOC3021 u otro) quemado abierto', probability: 55 },
        { cause: 'Triac de giro abierto o sin disparo', probability: 45 },
      ],
      recommendation: 'Reemplazar el optoacoplador y el triac del sentido dañado. Verificar el par de los dos giros en prueba antes de cerrar el equipo.',
      parts: ['Optoacoplador MOC', 'Triac de giro'],
    },
  },
  as_actuador: {
    id: 'as_actuador', type: 'question',
    text: '¿El actuador de la transmisión (shifter) no embraga correctamente el eje de lavado?',
    detail: 'Los engranajes plásticos del actuador se rompen y la transmisión no conmuta entre agitación y centrifugado, o queda a medias en lavado.',
    options: [
      { label: 'Sí, el actuador está roto o a medias', nextId: 'as_result_actuador', color: 'danger' },
      { label: 'No, el actuador embraga bien', nextId: 'as_result_tarjeta', color: 'neutral' },
    ],
  },
  as_result_actuador: {
    id: 'as_result_actuador', type: 'result',
    text: 'Actuador (shifter) de la transmisión con engranajes rotos',
    result: {
      causes: [
        { cause: 'Engranajes plásticos del actuador rotos', probability: 70 },
        { cause: 'Solenoide/palanca del actuador con recorrido insuficiente', probability: 30 },
      ],
      recommendation: 'Reemplazar el actuador o su kit de engranajes con la referencia del modelo. Verificar la conmutación completa agitación-centrifugado en prueba.',
      parts: ['Actuador de transmisión', 'Kit de engranajes'],
    },
  },
  as_result_tarjeta: {
    id: 'as_result_tarjeta', type: 'result',
    text: 'Tarjeta sin secuencia de giro completa',
    result: {
      causes: [
        { cause: 'Salida de giro de la tarjeta intermitente', probability: 55 },
        { cause: 'Firmware/ciclo con falla de secuencia', probability: 25 },
        { cause: 'Sensor de posición del motor sin señal', probability: 20 },
      ],
      recommendation: 'Con actuador y etapa de potencia verificados, probar el modo de servicio del modelo y verificar la secuencia de giros. Sin secuencia correcta, solicitar la tarjeta principal.',
      parts: ['Tarjeta principal'],
    },
  },
};

// ── 8. Pausa infinita en centrifugado (reloj trabado) ────────────────────────
const LAV_PAUSA_CENTRIFUGADO: DiagnosticTree = {
  start: {
    id: 'start', type: 'question',
    text: '¿El centrifugado arranca y se queda trabado (reloj en los mismos minutos) sin completar?',
    detail: 'Causas típicas: el drain motor no jala la guaya del freno de la tina, el micro-switch de desbalanceo tiene contactos carbonizados, o el sensor Hall del motor inverter distorsiona los pulsos al subir revoluciones.',
    options: [
      { label: 'La tina no suelta el freno para centrifugar', nextId: 'pc_freno', color: 'danger' },
      { label: 'Arranca y se detiene por desbalanceo', nextId: 'pc_desbalanceo', color: 'danger' },
    ],
  },
  pc_freno: {
    id: 'pc_freno', type: 'question',
    text: '¿El drain motor (motor de drenaje) no tiene fuerza para jalar la guaya del freno?',
    detail: 'El drain motor debe liberar el freno de la tina antes de centrifugar. Si su recorrido o fuerza son insuficientes (o la guaya está pegada), el motor intenta centrifugar y la mecánica se lo impide.',
    options: [
      { label: 'Sí, el drain motor o la guaya fallan', nextId: 'pc_result_freno', color: 'danger' },
      { label: 'No, el freno libera bien', nextId: 'pc_desbalanceo', color: 'success' },
    ],
  },
  pc_result_freno: {
    id: 'pc_result_freno', type: 'result',
    text: 'Freno de tina trabado por drain motor o guaya en mal estado',
    result: {
      causes: [
        { cause: 'Drain motor con recorrido/fuerza insuficiente', probability: 50 },
        { cause: 'Guaya del freno pegada, oxidada o desgastada', probability: 35 },
        { cause: 'Palanca del freno de la tina agarrotada', probability: 15 },
      ],
      recommendation: 'Lubricar/reemplazar la guaya y probar el drain motor con alimentación directa según el manual. Si su fuerza es insuficiente, reemplazarlo. Verificar la liberación completa del freno en prueba.',
      parts: ['Drain motor', 'Guaya del freno'],
    },
  },
  pc_desbalanceo: {
    id: 'pc_desbalanceo', type: 'question',
    text: '¿El micro-switch de desbalanceo tiene contactos carbonizados o intermitentes?',
    detail: 'Los contactos carbonizados crean resistencia intermitente: la placa interpreta desbalanceo constante y frena/alarga el centrifugado de forma indefinida.',
    options: [
      { label: 'Sí, el micro-switch es intermitente', nextId: 'pc_result_switch', color: 'danger' },
      { label: 'No, el switch mide limpio', nextId: 'pc_hall', color: 'success' },
    ],
  },
  pc_result_switch: {
    id: 'pc_result_switch', type: 'result',
    text: 'Sensor de desbalanceo (micro-switch) con contactos carbonizados',
    result: {
      causes: [
        { cause: 'Contactos del micro-switch carbonizados', probability: 70 },
        { cause: 'Palanca/brazo del switch desajustado', probability: 30 },
      ],
      recommendation: 'Reemplazar el micro-switch de desbalanceo y verificar su actuación mecánica. Probar un centrifugado con carga balanceada después del cambio.',
      parts: ['Micro-switch de desbalanceo'],
    },
  },
  pc_hall: {
    id: 'pc_hall', type: 'question',
    text: '¿La máquina es inverter y el sensor Hall del motor distorsiona los pulsos al subir revoluciones?',
    detail: 'La humedad en el sensor Hall del motor distorsiona los pulsos de velocidad: la placa frena por seguridad y alarga el tiempo de forma indefinida.',
    options: [
      { label: 'Sí, la señal de RPM se distorsiona', nextId: 'pc_result_hall', color: 'danger' },
      { label: 'No aplica o la señal es estable', nextId: 'pc_result_tarjeta', color: 'neutral' },
    ],
  },
  pc_result_hall: {
    id: 'pc_result_hall', type: 'result',
    text: 'Sensor Hall del motor con señal distorsionada por humedad',
    result: {
      causes: [
        { cause: 'Humedad en el conector del sensor Hall', probability: 55 },
        { cause: 'Sensor Hall del motor degradado', probability: 45 },
      ],
      recommendation: 'Secar y proteger el conector del sensor Hall; si la señal sigue inestable a alta revolución, reemplazar el sensor o el motor según el diseño. Verificar el centrifugado completo en prueba.',
      parts: ['Sensor Hall', 'Motor inverter de lavadora'],
    },
  },
  pc_result_tarjeta: {
    id: 'pc_result_tarjeta', type: 'result',
    text: 'Tarjeta sin completar la etapa de centrifugado',
    result: {
      causes: [
        { cause: 'Lectura de la etapa de centrifugado en la tarjeta con falla', probability: 50 },
        { cause: 'Firmware atascado por señal marginal', probability: 30 },
        { cause: 'Tarjeta principal defectuosa', probability: 20 },
      ],
      recommendation: 'Con freno, desbalanceo y señal de RPM verificados, usar el modo de servicio para forzar el centrifugado. Si no completa, solicitar la tarjeta principal.',
      parts: ['Tarjeta principal'],
    },
  },
};

// ── 9. Paro en programas específicos (agua caliente / ropa pesada) ───────────
const LAV_PARO_PROGRAMAS: DiagnosticTree = {
  start: {
    id: 'start', type: 'question',
    text: '¿La máquina se pausa solo con agua caliente/tibia (o carga pesada)?',
    detail: 'Una válvula de agua caliente con la bobina secundaria abierta deja entrar solo la mitad del agua; el timeout del software se agota y pausa la máquina.',
    options: [
      { label: 'Sí, se pausa en agua caliente/tibia', nextId: 'pp_valvula', color: 'danger' },
      { label: 'Se pausa con carga pesada', nextId: 'pp_result_carga', color: 'neutral' },
    ],
  },
  pp_valvula: {
    id: 'pp_valvula', type: 'measure',
    text: 'Medir la bobina de la válvula de agua caliente',
    detail: 'Con la máquina desenergizada, mide la resistencia de la bobina de la válvula de caliente. Una bobina abierta explica el llenado a medias y el timeout del ciclo.',
    gifUri: 'medir-continuidad-tierra',
    evidenceLabel: 'Foto de la resistencia de la bobina de la válvula de caliente',
    nextId: 'pp_valvula_ok',
  },
  pp_valvula_ok: {
    id: 'pp_valvula_ok', type: 'question',
    text: '¿La bobina de la válvula de caliente está abierta?',
    options: [
      { label: 'Sí, bobina abierta', nextId: 'pp_result_valvula', color: 'danger' },
      { label: 'No, la válvula mide bien', nextId: 'pp_ntc', color: 'success' },
    ],
  },
  pp_result_valvula: {
    id: 'pp_result_valvula', type: 'result',
    text: 'Válvula de agua caliente con bobina secundaria abierta',
    result: {
      causes: [
        { cause: 'Bobina de la válvula de caliente abierta', probability: 80 },
        { cause: 'Conector de la válvula con falso contacto', probability: 20 },
      ],
      recommendation: 'Reemplazar la válvula (o su bobina si el diseño lo permite) con la referencia del modelo. Probar un ciclo de agua tibia completo después del cambio.',
      parts: ['Electroválvula de agua caliente'],
    },
  },
  pp_ntc: {
    id: 'pp_ntc', type: 'measure',
    text: 'Verificar el termistor NTC de la temperatura del agua',
    detail: 'Un NTC descalibrado puede reportar agua hirviendo estando fría y bloquear las etapas de calentamiento del firmware. Compara la resistencia con la tabla NTC a la temperatura actual.',
    ntcTable: true,
    evidenceLabel: 'Foto de la resistencia del NTC y su comparación con la tabla',
    nextId: 'pp_ntc_ok',
  },
  pp_ntc_ok: {
    id: 'pp_ntc_ok', type: 'question',
    text: '¿El NTC reporta una temperatura fuera de la realidad (descalibrado)?',
    options: [
      { label: 'Sí, el NTC está descalibrado', nextId: 'pp_result_ntc', color: 'danger' },
      { label: 'No, el NTC mide acorde a la tabla', nextId: 'pp_result_tarjeta', color: 'neutral' },
    ],
  },
  pp_result_ntc: {
    id: 'pp_result_ntc', type: 'result',
    text: 'Termistor NTC descalibrado bloquea el ciclo',
    result: {
      causes: [
        { cause: 'Termistor NTC con deriva de calibración', probability: 70 },
        { cause: 'Conector o cableado del NTC con fuga', probability: 30 },
      ],
      recommendation: 'Reemplazar el NTC con la referencia del modelo y revisar su conector. Verificar que las etapas de calentamiento se activen correctamente en prueba.',
      parts: ['Termistor NTC'],
    },
  },
  pp_result_carga: {
    id: 'pp_result_carga', type: 'result',
    text: 'Pausa por sobrecarga de ropa en programas pesados',
    result: {
      causes: [
        { cause: 'Sobrecarga crónica de ropa (por parte del cliente)', probability: 55 },
        { cause: 'Correa o transmisión con desgaste que eleva el esfuerzo', probability: 30 },
        { cause: 'Capacitor de marcha marginal que cae bajo carga', probability: 15 },
      ],
      recommendation: 'Educar al usuario sobre la capacidad real del equipo, revisar correa/transmisión y medir el capacitor. Verificar amperaje del motor con carga nominal.',
      parts: ['Capacitor de marcha', 'Correa'],
    },
  },
  pp_result_tarjeta: {
    id: 'pp_result_tarjeta', type: 'result',
    text: 'Tarjeta con falla en la lectura de válvula/temperatura',
    result: {
      causes: [
        { cause: 'Entrada de lectura de válvula o temperatura dañada', probability: 55 },
        { cause: 'Etapa de potencia de la válvula en la tarjeta', probability: 45 },
      ],
      recommendation: 'Con válvula y NTC verificados, probar el modo de servicio forzando cada válvula. Sin respuesta de la tarjeta, solicitarla con la referencia del modelo.',
      parts: ['Tarjeta principal'],
    },
  },
};

// ── 10. Interfaz de usuario "congelada" (botones no responden) ───────────────
const LAV_INTERFAZ_CONGELADA: DiagnosticTree = {
  start: {
    id: 'start', type: 'question',
    text: '¿Algún botón mecánico está pegado (en corto, midiendo 0 Ω constante)?',
    detail: 'Un solo botón pegado colapsa la matriz y bloquea todo el bus de datos del teclado: ningún botón responde aunque el display esté encendido.',
    options: [
      { label: 'Sí, hay un botón pegado en 0 Ω', nextId: 'ic_result_matriz', color: 'danger' },
      { label: 'No, los botones mecánicos están libres', nextId: 'ic_capacitivo', color: 'success' },
    ],
  },
  ic_result_matriz: {
    id: 'ic_result_matriz', type: 'result',
    text: 'Matriz de teclado colapsada por botón pegado',
    result: {
      causes: [
        { cause: 'Botón mecánico pegado en corto (0 Ω constante)', probability: 75 },
        { cause: 'Pista de la matriz del teclado en corto', probability: 25 },
      ],
      recommendation: 'Reemplazar la membrana/teclado o liberar el botón. Verificar que el bus del teclado quede limpio y todos los botones respondan en prueba.',
      parts: ['Teclado / membrana'],
    },
  },
  ic_capacitivo: {
    id: 'ic_capacitivo', type: 'question',
    text: '¿El teclado es táctil (capacitivo) y está sucio con detergente o grasa?',
    detail: 'Los sensores capacitivos saturados por detergente/grasa dejan de distinguir el dedo: la interfaz parece congelada aunque el display funcione.',
    options: [
      { label: 'Sí, teclado táctil saturado de suciedad', nextId: 'ic_result_capacitivo', color: 'danger' },
      { label: 'No, está limpio y sigue congelada', nextId: 'ic_display', color: 'success' },
    ],
  },
  ic_result_capacitivo: {
    id: 'ic_result_capacitivo', type: 'result',
    text: 'Teclado capacitivo saturado por detergente/grasa',
    result: {
      causes: [
        { cause: 'Superficie del teclado con residuos de detergente o grasa', probability: 70 },
        { cause: 'Humedad bajo el panel táctil', probability: 30 },
      ],
      recommendation: 'Limpiar el panel con paño apenas húmedo (sin chorros de agua), secar y probar. Si la saturación es interna, reemplazar el panel táctil.',
      parts: ['Panel táctil'],
    },
  },
  ic_display: {
    id: 'ic_display', type: 'question',
    text: '¿Los pines de reloj/datos (CLK/DIO) del IC del display (ej. TM1628) están fisurados o con soldadura fría?',
    detail: 'Si los pines CLK/DIO del integrado del display se fisuran, el display se congela y no obedece: el microcontrolador no puede dialogar con la interfaz.',
    options: [
      { label: 'Sí, soldadura/pines del IC display con falla', nextId: 'ic_result_display', color: 'danger' },
      { label: 'No, el IC display se ve bien', nextId: 'ic_result_tarjeta', color: 'neutral' },
    ],
  },
  ic_result_display: {
    id: 'ic_result_display', type: 'result',
    text: 'IC del display (TM1628 u otro) con CLK/DIO fisurados',
    result: {
      causes: [
        { cause: 'Soldadura fría o fisura en los pines CLK/DIO del IC display', probability: 65 },
        { cause: 'IC del display dañado', probability: 35 },
      ],
      recommendation: 'Resoldar los pines del IC display bajo lupa. Si el display sigue congelado con soldadura correcta, reemplazar el IC o la tarjeta display.',
      parts: ['IC display', 'Tarjeta display'],
    },
  },
  ic_result_tarjeta: {
    id: 'ic_result_tarjeta', type: 'result',
    text: 'Tarjeta principal sin diálogo con la interfaz',
    result: {
      causes: [
        { cause: 'Bus de datos del teclado en la tarjeta principal', probability: 50 },
        { cause: 'Microcontrolador con entrada del teclado dañada', probability: 50 },
      ],
      recommendation: 'Con teclado y display descartados, probar otro teclado conocido si es posible. Sin diálogo en modo de servicio, solicitar la tarjeta principal.',
      parts: ['Tarjeta principal'],
    },
  },
};

// ── 11. Salto aleatorio de etapas (EEPROM corrupta) ──────────────────────────
const LAV_EEPROM: DiagnosticTree = {
  start: {
    id: 'start', type: 'question',
    text: '¿El ciclo salta etapas al azar (de 45 min a 1 min, sin enjuagar)?',
    detail: 'El salto aleatorio de etapas apunta a memoria EEPROM corrupta por un pico eléctrico. Antes de condenar hardware, descarta fallas mecánicas/electrónicas con el modo de servicio.',
    options: [
      { label: 'Sí, salta etapas sin lógica', nextId: 'ep_test', color: 'danger' },
      { label: 'No, las etapas siguen el orden correcto', nextId: 'ep_result_otros', color: 'neutral' },
    ],
  },
  ep_result_otros: {
    id: 'ep_result_otros', type: 'result',
    text: 'Salto de etapas por otra causa',
    result: {
      causes: [
        { cause: 'Señal de nivel o bloqueapuertas marginal que altera el ciclo', probability: 45 },
        { cause: 'Teclado con pulsaciones fantasma', probability: 35 },
        { cause: 'Tarjeta con soldadura fría', probability: 20 },
      ],
      recommendation: 'Verificar presostato, bloqueapuertas y teclado antes de condenar la memoria. Documentar el patrón de la falla (frecuencia y etapa donde salta).',
      parts: ['Presostato', 'Blocapuertas'],
    },
  },
  ep_test: {
    id: 'ep_test', type: 'question',
    text: '¿En el modo de servicio (Test Mode) el hardware opera bien de forma manual?',
    detail: 'Entra al modo de servicio del modelo y fuerza cada etapa (llenado, lavado, drenaje, centrifugado). Si todo responde bien en manual, el hardware está sano y la memoria es la sospechosa.',
    options: [
      { label: 'Sí, hardware OK en modo de servicio', nextId: 'ep_result_eeprom', color: 'danger' },
      { label: 'No, alguna etapa falla en manual', nextId: 'ep_result_hardware', color: 'neutral' },
    ],
  },
  ep_result_hardware: {
    id: 'ep_result_hardware', type: 'result',
    text: 'Falla de hardware detectada en modo de servicio',
    result: {
      causes: [
        { cause: 'Etapa específica con sensor o actuador con falla', probability: 60 },
        { cause: 'Tarjeta con entrada/salida de esa etapa dañada', probability: 40 },
      ],
      recommendation: 'Aislar la etapa que falla en manual y repararla (sensor, actuador o tarjeta). El salto de etapas era consecuencia de esa falla, no de la memoria.',
      parts: ['Por etapa afectada'],
    },
  },
  ep_result_eeprom: {
    id: 'ep_result_eeprom', type: 'result',
    text: 'EEPROM corrupta por pico eléctrico',
    result: {
      causes: [
        { cause: 'Memoria EEPROM con corrupción por pico eléctrico', probability: 70 },
        { cause: 'Fuente con microcortes que corrompieron la memoria', probability: 30 },
      ],
      recommendation: 'Flashear/reflash de la memoria o reemplazo de la placa principal según disponibilidad del servicio. Verificar el protector eléctrico y la instalación a tierra para evitar recurrencia.',
      parts: ['Tarjeta principal', 'Protector eléctrico'],
    },
  },
};

// ── 12. No dispensa suavizante (falla de diverter) ───────────────────────────
const LAV_DIVERTER: DiagnosticTree = {
  start: {
    id: 'start', type: 'question',
    text: '¿El dispensador siempre tira el agua al cajón del jabón (nunca al suavizante)?',
    detail: 'El motorcito distribuidor de flujo (diverter) conmuta el agua entre compartimentos. Si sus levas están rotas, el agua siempre va al jabón.',
    options: [
      { label: 'Sí, el diverter nunca conmuta', nextId: 'dv_diverter', color: 'danger' },
      { label: 'Conmuta, pero el suavizante no sale', nextId: 'dv_wax', color: 'success' },
    ],
  },
  dv_diverter: {
    id: 'dv_diverter', type: 'question',
    text: '¿El motorcito diverter tiene levas rotas o no gira al activarse?',
    detail: 'Observa el diverter durante el llenado: debe girar y conmutar el flujo. Levas rotas dejan el flujo fijo en el jabón; si no gira, verifica también su bobina y conector.',
    options: [
      { label: 'Sí, levas rotas o motor sin girar', nextId: 'dv_result_diverter', color: 'danger' },
      { label: 'No, el diverter gira y conmuta', nextId: 'dv_wax', color: 'success' },
    ],
  },
  dv_result_diverter: {
    id: 'dv_result_diverter', type: 'result',
    text: 'Motor diverter con levas rotas o bobina abierta',
    result: {
      causes: [
        { cause: 'Levas del diverter rotas (flujo fijo al jabón)', probability: 60 },
        { cause: 'Bobina del motor diverter abierta', probability: 25 },
        { cause: 'Conector del diverter con falso contacto', probability: 15 },
      ],
      recommendation: 'Reemplazar el diverter completo (motor y levas) con la referencia del modelo. Verificar su activación durante el llenado en prueba.',
      parts: ['Motor diverter'],
    },
  },
  dv_wax: {
    id: 'dv_wax', type: 'measure',
    text: 'Medir los motores de cera (wax motors) del dispensador',
    detail: 'Los actuadores térmicos del dispensador miden aproximadamente 1.5 kΩ. Si están abiertos, no empujan la trampilla del suavizante y el agua pasa sin arrastrarlo.',
    gifUri: 'medir-continuidad-tierra',
    evidenceLabel: 'Foto de la resistencia medida de los wax motors',
    nextId: 'dv_wax_ok',
  },
  dv_wax_ok: {
    id: 'dv_wax_ok', type: 'question',
    text: '¿Alguno de los wax motors mide abierto (no da los ~1.5 kΩ)?',
    options: [
      { label: 'Sí, wax motor abierto', nextId: 'dv_result_wax', color: 'danger' },
      { label: 'No, miden bien', nextId: 'dv_result_cajon', color: 'success' },
    ],
  },
  dv_result_wax: {
    id: 'dv_result_wax', type: 'result',
    text: 'Motor de cera (wax motor) del dispensador abierto',
    result: {
      causes: [
        { cause: 'Wax motor con bobina abierta (no empuja la trampilla)', probability: 70 },
        { cause: 'Etapa de potencia del wax motor en la tarjeta', probability: 30 },
      ],
      recommendation: 'Reemplazar el wax motor con la referencia del modelo. Si el nuevo tampoco actúa, verificar la salida de la tarjeta durante el ciclo de enjuague.',
      parts: ['Wax motor del dispensador'],
    },
  },
  dv_result_cajon: {
    id: 'dv_result_cajon', type: 'result',
    text: 'Gaveta del dispensador obstruida',
    result: {
      causes: [
        { cause: 'Residuos de detergente solidificado tapando el canal del suavizante', probability: 65 },
        { cause: 'Trampilla mecánica del compartimento pegada', probability: 35 },
      ],
      recommendation: 'Desmontar y lavar la gaveta con agua tibia, liberar la trampilla y verificar el flujo al suavizante en un enjuague de prueba.',
      parts: ['Gaveta del dispensador'],
    },
  },
};

// ── 13. Paro súbito térmico del motor ────────────────────────────────────────
const LAV_TERMICO_MOTOR: DiagnosticTree = {
  start: {
    id: 'start', type: 'question',
    text: '¿El motor se detiene a mitad del lavado y el ciclo continúa "mágicamente" tras 30–60 min?',
    detail: 'Al superar 130 °C el bimetálico interno (Klixon) del motor se abre y la placa espera. Al enfriarse, el ciclo continúa. Es un paro térmico, no una falla electrónica.',
    options: [
      { label: 'Sí, se recupera tras enfriarse', nextId: 'tm_causas', color: 'danger' },
      { label: 'No se recupera aunque esté frío', nextId: 'tm_result_otros', color: 'neutral' },
    ],
  },
  tm_causas: {
    id: 'tm_causas', type: 'question',
    text: '¿Cuál de estas causas de recalentamiento aplica?',
    detail: 'El Klixon es el síntoma; la causa suele ser: capacitor deficiente (menos par, más corriente), rodamiento pegado (fricción extrema) o sobrecarga crónica de ropa.',
    options: [
      { label: 'Capacitor viejo o por debajo del 50 %', nextId: 'tm_result_capacitor', color: 'danger' },
      { label: 'El tambor cuesta girarlo (rodamiento)', nextId: 'tm_result_rodamiento', color: 'danger' },
      { label: 'El cliente carga de más la máquina', nextId: 'tm_result_sobrecarga', color: 'neutral' },
    ],
  },
  tm_result_capacitor: {
    id: 'tm_result_capacitor', type: 'result',
    text: 'Paro térmico por capacitor de marcha deficiente',
    result: {
      causes: [
        { cause: 'Capacitor de marcha por debajo del 50 % del valor nominal', probability: 75 },
        { cause: 'Terminal del capacitor con resistencia de contacto', probability: 25 },
      ],
      recommendation: 'Reemplazar el capacitor con el valor exacto de la placa y medir el amperaje del motor en lavado. El Klixon dejará de abrir al bajar el consumo.',
      parts: ['Capacitor de marcha'],
    },
  },
  tm_result_rodamiento: {
    id: 'tm_result_rodamiento', type: 'result',
    text: 'Paro térmico por fricción mecánica extrema',
    result: {
      causes: [
        { cause: 'Rodamiento del tambor pegado o con juego', probability: 70 },
        { cause: 'Fricción entre tambor y estator (desgaste)', probability: 30 },
      ],
      recommendation: 'Reemplazar el kit de rodamientos/depósito y verificar el giro libre del tambor. Un motor recalentado por fricción termina dañando sus bobinas si no se corrige.',
      parts: ['Kit de rodamientos'],
    },
  },
  tm_result_sobrecarga: {
    id: 'tm_result_sobrecarga', type: 'result',
    text: 'Paro térmico por sobrecarga crónica de ropa',
    result: {
      causes: [
        { cause: 'Sobrecarga habitual por encima de la capacidad', probability: 80 },
        { cause: 'Programa de carga pesada usado con ropa normal', probability: 20 },
      ],
      recommendation: 'Educar al usuario en la capacidad real del equipo y verificar amperaje con carga nominal. Si el consumo es correcto con carga adecuada, el motor está sano.',
      parts: [],
    },
  },
  tm_result_otros: {
    id: 'tm_result_otros', type: 'result',
    text: 'Motor o etapa de potencia con falla permanente',
    result: {
      causes: [
        { cause: 'Bobinas del motor con deriva térmica (fallan en caliente)', probability: 45 },
        { cause: 'Klixon degradado que abre antes de tiempo', probability: 35 },
        { cause: 'Triac de giro marginal en la tarjeta', probability: 20 },
      ],
      recommendation: 'Medir las bobinas en frío y, si es posible, en caliente al reproducirse el paro. Con Klixon o bobinas fuera de especificación, reemplazar el motor o la etapa afectada.',
      parts: ['Motor de lavadora', 'Triac de giro'],
    },
  },
};

// ── Registro de árboles silenciosos de lavadora ──────────────────────────────
export const LAVADORA_SILENT_TREES: Record<string, DiagnosticTree> = {
  lavadora_placamuerta:            LAV_PLACA_MUERTA,
  lavadora_ciclo_congelado:        LAV_CICLO_CONGELADO,
  lavadora_motor_zumba:            LAV_MOTOR_ZUMBA,
  lavadora_llenado_infinito:       LAV_LLENADO_INFINITO,
  lavadora_reseteos:               LAV_RESETEOS,
  lavadora_desague_silencioso:     LAV_DESAGUE_SILENCIOSO,
  lavadora_asimetrico:             LAV_ASIMETRICO,
  lavadora_pausa_centrifugado:     LAV_PAUSA_CENTRIFUGADO,
  lavadora_paro_programas:         LAV_PARO_PROGRAMAS,
  lavadora_interfaz_congelada:     LAV_INTERFAZ_CONGELADA,
  lavadora_eeprom:                 LAV_EEPROM,
  lavadora_diverter:               LAV_DIVERTER,
  lavadora_termico_motor:          LAV_TERMICO_MOTOR,
};
