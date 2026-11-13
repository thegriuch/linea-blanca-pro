import type { DiagnosticTree } from '@/types/diagnostico';
import { INVERTER_TREE } from '@/constants/arbol_inverter';

// ══════════════════════════════════════════════════════════════════════════
// Árboles COMUNES: síntomas y diagnósticos reutilizados por varios productos
// (nunca duplicados: viven aquí y los archivos por producto los importan).
// ══════════════════════════════════════════════════════════════════════════

export const NOENCIENDE: DiagnosticTree = {
  start: {
    id: 'start', type: 'question',
    text: '¿El voltaje de la toma, medido en el paso inicial, está dentro del rango nominal del equipo?',
    options: [
      { label: 'No hay voltaje o es incorrecto', nextId: 'result_sin_voltaje', color: 'danger' },
      { label: 'Sí, voltaje correcto', nextId: 'gate_inverter_noenciende', color: 'success' },
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
  gate_inverter_noenciende: {
    gate: 'inverter_si',
    id: 'gate_inverter_noenciende', type: 'question',
    text: '¿El compresor del equipo es tecnología Inverter?',
    detail: 'Los compresores Inverter no usan relé PTC externo: los alimenta un módulo driver (tarjeta inverter) que controla la velocidad. Verifica la placa del compresor o el manual del equipo.',
    tip: 'Indicios de Inverter: módulo electrónico grande cerca del compresor, sin PTC externo visible y frecuencia variable audible al operar.',
    options: [
      { label: 'Sí, es tecnología Inverter', nextId: 'medir_senal', color: 'neutral' },
      { label: 'No, es compresor convencional', nextId: 'revisar_cable', color: 'success' },
    ],
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
      { label: 'Sí, están bien', nextId: 'noenciende_voltaje_tarjeta', color: 'success' },
    ],
  },
  noenciende_voltaje_tarjeta: {
    id: 'noenciende_voltaje_tarjeta', type: 'measure',
    text: 'Medir el voltaje en la entrada de la tarjeta de control',
    detail: 'Con el equipo conectado y el interruptor en encendido, mide entre L y N en el conector de alimentación de la tarjeta. Debe llegar el voltaje nominal de la red (120 V ±10 % o 220 V ±10 %). Verifica también el fusible o protector térmico interno de la tarjeta.',
    tip: 'Mide en el conector, no en el cable: un terminal flojo puede dar voltaje en vacío y caer al conectar la carga.',
    evidenceLabel: 'Foto de la medición de voltaje en el conector de la tarjeta',
    nextId: 'noenciende_voltaje_ok',
  },
  noenciende_voltaje_ok: {
    id: 'noenciende_voltaje_ok', type: 'question',
    text: '¿Llega el voltaje nominal a la entrada de la tarjeta?',
    options: [
      { label: 'No llega voltaje a la tarjeta', nextId: 'noenciende_interruptor', color: 'danger' },
      { label: 'Sí llega, pero el equipo no enciende', nextId: 'noenciende_panel', color: 'success' },
    ],
  },
  noenciende_interruptor: {
    id: 'noenciende_interruptor', type: 'measure',
    text: 'Verificar interruptor de puerta, selector y protector térmico en serie',
    detail: 'Revisa continuidad del interruptor de puerta/luz, del selector de funciones y del protector térmico o fusible interno. Cualquiera de ellos abierto corta la alimentación a la tarjeta aunque la toma tenga voltaje.',
    evidenceLabel: 'Foto de la continuidad de interruptor/selector y del fusible interno',
    nextId: 'noenciende_interruptor_ok',
  },
  noenciende_interruptor_ok: {
    id: 'noenciende_interruptor_ok', type: 'question',
    text: '¿Algún interruptor, selector o fusible interno está abierto?',
    options: [
      { label: 'Sí, hay un componente abierto', nextId: 'result_interruptor', color: 'danger' },
      { label: 'No, todos dan continuidad', nextId: 'result_cableado_alimentacion', color: 'neutral' },
    ],
  },
  noenciende_panel: {
    id: 'noenciende_panel', type: 'question',
    text: '¿El display o panel de control muestra alguna señal al energizar?',
    options: [
      { label: 'Sí, enciende pero no arranca', nextId: 'result_tarjeta', color: 'neutral' },
      { label: 'No, apagado total', nextId: 'result_fuente_tarjeta', color: 'danger' },
    ],
  },
  result_interruptor: {
    id: 'result_interruptor', type: 'result',
    text: 'Interruptor, selector o fusible interno abierto',
    result: {
      causes: [
        { cause: 'Interruptor de puerta abierto o defectuoso', probability: 45 },
        { cause: 'Fusible o protector térmico interno abierto', probability: 35 },
        { cause: 'Selector de funciones con contactos abiertos', probability: 20 },
      ],
      recommendation: 'Reemplazar el componente abierto. Si el fusible térmico está abierto, revisar la causa del sobrecalentamiento antes de instalar el repuesto: un fusible nuevo se abre de nuevo si el problema persiste.',
      parts: ['Interruptor de puerta', 'Fusible térmico', 'Selector de funciones'],
    },
  },
  result_cableado_alimentacion: {
    id: 'result_cableado_alimentacion', type: 'result',
    text: 'Cableado de alimentación de la tarjeta interrumpido',
    result: {
      causes: [
        { cause: 'Cable o terminal del arnés de alimentación abierto', probability: 55 },
        { cause: 'Conector de la tarjeta con pin quemado o flojo', probability: 30 },
        { cause: 'Punto de unión o bornera con falso contacto', probability: 15 },
      ],
      recommendation: 'Medir continuidad del arnés tramo por tramo hasta la tarjeta. Reparar terminales y bornera; si el conector está quemado, reemplazar el conector y verificar la carga que lo calentó.',
      parts: ['Arnés de alimentación', 'Conector de tarjeta'],
    },
  },
  result_fuente_tarjeta: {
    id: 'result_fuente_tarjeta', type: 'result',
    text: 'Tarjeta sin respuesta con alimentación presente',
    result: {
      causes: [
        { cause: 'Fuente conmutada de la tarjeta dañada (sin 5 V/12 V internos)', probability: 55 },
        { cause: 'Tarjeta principal bloqueada o con firmware corrupto', probability: 30 },
        { cause: 'Display desconectado o quemado (equipo opera sin mostrar)', probability: 15 },
      ],
      recommendation: 'Verificar las tensiones internas de la tarjeta (5 V y 12 V) en el conector del display. Si no hay tensiones, reemplazar la tarjeta; si hay tensiones y el display no responde, probar con un display conocido bueno.',
      parts: ['Tarjeta de control', 'Display / panel'],
    },
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
  // Nodos de tecnología Inverter compartidos (se alcanzan vía gate_inverter_noenciende)
  ...INVERTER_TREE,
};;

export const ERRORELECTRONICO: DiagnosticTree = {
  // Este árbol se entra con el código YA validado en el flujo inicial
  // (paso 1B de la app), por eso no se vuelve a preguntar: el técnico que
  // llega aquí por E7/F7/CE (comunicación) o por 'no sé el código' pasa
  // directo al diagnóstico correspondiente.
  start: {
    id: 'start', type: 'question',
    // Si el código ya se validó en el flujo inicial (E7/F7/CE), no se vuelve a
    // preguntar por el código: el gate entra directo a la rama de comunicación.
    gate: 'codigo_si',
    text: '¿El código registrado corresponde a una falla de comunicación entre tarjetas?',
    detail: 'Códigos típicos de comunicación: CE, E7, F7, EC, Err, Com, 13 FLASH. Si el código es de sensor o de compresor, entra por la rama correspondiente. Esta pantalla no repite la validación del código: ya la hiciste al iniciar el diagnóstico.',
    options: [
      { label: 'Sí, es falla de comunicación (CE, E7, F7, EC, 13 FLASH)', nextId: 'result_comunicacion', color: 'danger' },
      { label: 'Es error de sensor (Er, E1, E2, F1, F2)', nextId: 'result_sensor', color: 'neutral' },
      { label: 'Es error de compresor o refrigeración', nextId: 'result_error_compresor', color: 'danger' },
      { label: 'No identificado / otro código', nextId: 'buscar_codigo', color: 'neutral' },
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
};;

export const FUGA_AGUA: DiagnosticTree = {
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
    id: 'fuga_trasera', type: 'measure',
    text: 'Secar la zona y revisar mangueras, acoples y válvula de paso',
    detail: 'Seca bien la parte trasera, coloca papel o cartón bajo las conexiones y pon el equipo en funcionamiento. Revisa manguera de entrada, acoples y válvula de paso. Una fuga que solo aparece en la bandeja del compresor apunta al drenaje de descongelamiento, no a la hidráulica.',
    evidenceLabel: 'Foto de la zona seca y del punto exacto donde aparece el agua',
    nextId: 'fuga_trasera_ok',
  },
  fuga_trasera_ok: {
    id: 'fuga_trasera_ok', type: 'question',
    text: '¿Dónde aparece el agua?',
    options: [
      { label: 'En manguera, acople o válvula de paso', nextId: 'result_manguera', color: 'danger' },
      { label: 'En la bandeja del compresor (parte baja trasera)', nextId: 'result_descongelamiento', color: 'neutral' },
    ],
  },
  fuga_interior: {
    id: 'fuga_interior', type: 'measure',
    text: 'Revisar el canal de drenaje del evaporador y la bandeja interior',
    detail: 'Desmonta la tapa del evaporador y verifica que el canal y la manguera de drenaje estén libres. Vierte un poco de agua en el canal: debe salir por la parte trasera sin estancarse. Revisa también si el hielo del evaporador desborda el canal.',
    evidenceLabel: 'Foto del canal de drenaje y de la prueba de vertido',
    nextId: 'fuga_interior_ok',
  },
  fuga_interior_ok: {
    id: 'fuga_interior_ok', type: 'question',
    text: '¿El agua se estanca o desborda del canal de drenaje?',
    options: [
      { label: 'Sí, el canal está tapado o desborda', nextId: 'result_descongelamiento', color: 'danger' },
      { label: 'No, el drenaje está libre y el agua viene de otra parte', nextId: 'result_fuga_interior', color: 'neutral' },
    ],
  },
  result_fuga_interior: {
    id: 'result_fuga_interior', type: 'result',
    text: 'Fuga interior con drenaje libre',
    result: {
      causes: [
        { cause: 'Empaque de puerta dañado (condensación excesiva)', probability: 50 },
        { cause: 'Bandeja de drenaje rota o desplazada', probability: 30 },
        { cause: 'Exceso de escarcha en el evaporador que desborda', probability: 20 },
      ],
      recommendation: 'Revisar el empaque con la prueba del papel y la bandeja de drenaje. Si el evaporador está escarchado, validar el ciclo de deshielo antes de cerrar el caso.',
      parts: ['Empaque de puerta', 'Bandeja de drenaje'],
    },
  },
};;

export const RUIDOEXCESIVO: DiagnosticTree = {
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
    text: 'Medir las presiones del compresor en marcha',
    detail: 'Usa el amperaje registrado al inicio del diagnóstico y mide las presiones de operación. Un compresor ruidoso puede trabajar contra presiones incorrectas.',
    gifUri: 'medicion-compresor-kalley',
    nextId: 'gate_inverter_ruido',
  },
  gate_inverter_ruido: {
    gate: 'inverter_si',
    id: 'gate_inverter_ruido', type: 'question',
    text: '¿El compresor del equipo es tecnología Inverter?',
    detail: 'Los compresores Inverter no usan relé PTC externo: los alimenta un módulo driver (tarjeta inverter) que controla la velocidad. Verifica la placa del compresor o el manual del equipo.',
    tip: 'Indicios de Inverter: módulo electrónico grande cerca del compresor, sin PTC externo visible y frecuencia variable audible al operar.',
    options: [
      { label: 'Sí, es tecnología Inverter', nextId: 'medir_senal', color: 'neutral' },
      { label: 'No, es compresor convencional', nextId: 'result_compresor_ruido', color: 'success' },
    ],
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
  // Nodos de tecnología Inverter compartidos (se alcanzan vía gate_inverter_ruido)
  ...INVERTER_TREE,
};;

export const CONGELAMUCHO: DiagnosticTree = {
  start: {
    id: 'start', type: 'question',
    text: '¿El termostato / control permite ajustar la temperatura y el compresor cicla (encendido/apagado)?',
    options: [
      { label: 'No cicla — compresor corre siempre', nextId: 'congela_medir_termostato', color: 'danger' },
      { label: 'Sí cicla pero igual congela', nextId: 'congela_medir_temperatura', color: 'neutral' },
    ],
  },
  congela_medir_termostato: {
    id: 'congela_medir_termostato', type: 'measure',
    text: 'Medir el termostato desenergizado (continuidad en frío y con el bulbo enfriado)',
    detail: 'Desconecta el termostato y mide continuidad entre sus terminales: debe cerrar (0 Ω) a temperatura ambiente y abrir (OL) cuando el bulbo se enfría en agua con hielo. Gira el dial de mínimo a máximo y confirma que los contactos cambian de estado.',
    tip: 'Si nunca abre, el compresor queda energizado permanentemente y el evaporador termina escarchado. Compara la referencia del termostato con el catálogo del modelo.',
    evidenceLabel: 'Foto del termostato y de la medición de continuidad (cerrado y abierto)',
    nextId: 'congela_termostato_ok',
  },
  congela_termostato_ok: {
    id: 'congela_termostato_ok', type: 'question',
    text: '¿El termostato abre el circuito cuando alcanza la temperatura de corte?',
    options: [
      { label: 'No, los contactos quedan cerrados siempre', nextId: 'result_termostato_fijo', color: 'danger' },
      { label: 'Sí abre, pero el equipo sigue congelando', nextId: 'congela_medir_ntc', color: 'success' },
    ],
  },
  congela_medir_ntc: {
    id: 'congela_medir_ntc', type: 'measure',
    text: 'Medir el sensor NTC del refrigerador y comparar con la tabla del fabricante',
    detail: 'Mide el NTC a temperatura ambiente y contrástalo con la tabla del modelo (por ejemplo 10 kΩ a 25 °C, 5 kΩ a 10 °C). Revisa también que el sensor esté en su clip y no desplazado cerca del evaporador.',
    tip: 'Un NTC deriva con los años: la lectura puede parecer creíble y aun así estar 3–5 °C fuera, suficiente para que el control enfríe de más.',
    evidenceLabel: 'Foto de la lectura del NTC junto a la tabla de referencia',
    nextId: 'congela_ntc_ok',
  },
  congela_ntc_ok: {
    id: 'congela_ntc_ok', type: 'question',
    text: '¿La lectura del NTC está fuera de la tabla o el sensor está desplazado?',
    options: [
      { label: 'Sí, descalibrado o fuera de posición', nextId: 'result_sensor_descalibrado', color: 'danger' },
      { label: 'No, lectura y posición correctas', nextId: 'congela_medir_temperatura', color: 'success' },
    ],
  },
  congela_medir_temperatura: {
    id: 'congela_medir_temperatura', type: 'measure',
    text: 'Medir la temperatura real del compartimiento con termómetro',
    detail: 'Coloca un termómetro en el centro del compartimiento de refrigeración, con el equipo estabilizado (mínimo 2 horas sin abrir). El rango esperado es 2–7 °C. Registra también la temperatura del congelador.',
    tip: 'No midas con el termómetro pegado a la pared ni al evaporador: mide el aire en el centro del compartimiento.',
    evidenceLabel: 'Foto del termómetro en el compartimiento y de la temperatura seleccionada',
    nextId: 'congela_temperatura_ok',
  },
  congela_temperatura_ok: {
    id: 'congela_temperatura_ok', type: 'question',
    text: '¿La temperatura real del compartimiento está por debajo de 2 °C?',
    options: [
      { label: 'Sí, está por debajo de 2 °C', nextId: 'congela_medir_presion', color: 'danger' },
      { label: 'No, está en rango o por encima', nextId: 'result_ajuste', color: 'neutral' },
    ],
  },
  congela_medir_presion: {
    id: 'congela_medir_presion', type: 'measure',
    text: 'Medir presión de succión y amperaje del compresor con el sistema estabilizado',
    detail: 'Con el compresor en régimen, mide la presión de succión y el amperaje y compáralos con la placa del equipo. Presión de succión alta con amperaje por encima de placa indica sobrecarga de refrigerante; presión y amperaje normales descartan el sistema y apuntan al control.',
    tip: 'Si el evaporador está totalmente escarchado, descongela antes de medir: la escarcha falsea la presión y el amperaje.',
    evidenceLabel: 'Foto del manómetro y de la pinza amperimétrica junto a la placa',
    nextId: 'congela_presion_ok',
  },
  congela_presion_ok: {
    id: 'congela_presion_ok', type: 'question',
    text: '¿La presión de succión es alta y el amperaje supera el de placa?',
    options: [
      { label: 'Sí, sobrecarga de refrigerante', nextId: 'result_sobrecarga', color: 'danger' },
      { label: 'No, presión y amperaje en rango', nextId: 'result_control_temperatura', color: 'neutral' },
    ],
  },
  result_sensor_descalibrado: {
    id: 'result_sensor_descalibrado', type: 'result',
    text: 'Sensor de temperatura descalibrado o desplazado',
    result: {
      causes: [
        { cause: 'NTC descalibrado (deriva con la temperatura)', probability: 60 },
        { cause: 'Sensor fuera de su clip o pegado al evaporador', probability: 30 },
        { cause: 'Conector del sensor con resistencia de contacto', probability: 10 },
      ],
      recommendation: 'Reemplazar el NTC y confirmar la lectura contra la tabla a dos temperaturas distintas. Ubicarlo en su clip original y verificar el conector.',
      parts: ['Sensor NTC'],
    },
  },
  result_sobrecarga: {
    id: 'result_sobrecarga', type: 'result',
    text: 'Sistema sobrecargado de refrigerante',
    result: {
      causes: [
        { cause: 'Carga de refrigerante por encima de la especificada', probability: 65 },
        { cause: 'Restricción en el capilar que eleva la presión de succión', probability: 20 },
        { cause: 'Condensador con flujo de aire insuficiente', probability: 15 },
      ],
      recommendation: 'Recuperar el refrigerante, hacer vacío y cargar por peso según la placa. Verificar el flujo de aire del condensador antes de liberar el equipo.',
      parts: ['Carga de refrigerante', 'Filtro secante'],
    },
  },
  result_control_temperatura: {
    id: 'result_control_temperatura', type: 'result',
    text: 'Control de temperatura con consigna o histéresis fuera de rango',
    result: {
      causes: [
        { cause: 'Consigna de temperatura en el mínimo con ambiente frío', probability: 45 },
        { cause: 'Tarjeta de control con histéresis o lectura alterada', probability: 40 },
        { cause: 'Damper o difusor de aire obstruido (frío concentrado)', probability: 15 },
      ],
      recommendation: 'Ajustar la consigna al rango de trabajo (3–7 °C). Si persiste, verificar la lectura de la tarjeta en modo servicio y el recorrido del aire entre compartimentos.',
      parts: ['Tarjeta de control', 'Sensor NTC'],
    },
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
};;

export const ESCARCHA: DiagnosticTree = {
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
      { label: 'No, no calienta la resistencia de deshielo', nextId: 'escarcha_medir_resistencia', color: 'danger' },
      { label: 'Sí, pero sigue acumulando', nextId: 'result_frecuencia', color: 'neutral' },
    ],
  },
  escarcha_medir_resistencia: {
    id: 'escarcha_medir_resistencia', type: 'measure',
    text: 'Medir la resistencia de deshielo y su fusible térmico',
    detail: 'Desconecta la resistencia y mide su valor óhmico: debe coincidir con la placa (típicamente 100–300 Ω). Verifica continuidad del fusible térmico y del termostato de deshielo en serie. Con el equipo en ciclo de deshielo, confirma que llega voltaje a la resistencia.',
    tip: 'Una resistencia abierta no calienta y el evaporador termina bloqueado de hielo; si el fusible térmico está abierto, hubo un sobrecalentamiento previo que hay que corregir.',
    evidenceLabel: 'Foto de la medición de la resistencia y del fusible térmico',
    nextId: 'escarcha_resistencia_ok',
  },
  escarcha_resistencia_ok: {
    id: 'escarcha_resistencia_ok', type: 'question',
    text: '¿La resistencia o el fusible térmico están abiertos?',
    options: [
      { label: 'Sí, abiertos (sin continuidad)', nextId: 'result_resistencia', color: 'danger' },
      { label: 'No, la resistencia está en rango', nextId: 'escarcha_senal_tarjeta', color: 'neutral' },
    ],
  },
  escarcha_senal_tarjeta: {
    id: 'escarcha_senal_tarjeta', type: 'measure',
    text: 'Verificar la señal de deshielo desde la tarjeta o el timer',
    detail: 'Fuerza un ciclo de deshielo (según el manual o el modo de servicio) y mide si la tarjeta o el timer entrega voltaje al circuito de deshielo. Si no hay señal, la falla está en el control o en el sensor de deshielo.',
    evidenceLabel: 'Foto de la medición de la señal de deshielo',
    nextId: 'escarcha_senal_ok',
  },
  escarcha_senal_ok: {
    id: 'escarcha_senal_ok', type: 'question',
    text: '¿La tarjeta o el timer entregan voltaje al circuito de deshielo?',
    options: [
      { label: 'No, no hay señal de deshielo', nextId: 'result_control_deshielo', color: 'danger' },
      { label: 'Sí, hay señal y no calienta', nextId: 'result_resistencia', color: 'neutral' },
    ],
  },
  result_control_deshielo: {
    id: 'result_control_deshielo', type: 'result',
    text: 'Control de deshielo sin señal de salida',
    result: {
      causes: [
        { cause: 'Tarjeta o timer de deshielo sin salida', probability: 50 },
        { cause: 'Sensor o termostato de deshielo con lectura fuera de rango', probability: 35 },
        { cause: 'Cableado entre control y resistencia interrumpido', probability: 15 },
      ],
      recommendation: 'Verificar el sensor de deshielo contra la tabla y la continuidad del circuito hasta la resistencia. Si el control no conmuta, solicitar la tarjeta o el timer según el modelo.',
      parts: ['Tarjeta de control', 'Sensor de deshielo'],
    },
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
};;

export const CONGELA_NOENFRIA: DiagnosticTree = {
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
    gate: 'inverter_si',
    id: 'tipo_compresor_congela', type: 'question',
    text: '¿El equipo usa compresor Inverter?',
    detail: 'Las comprobaciones del módulo Inverter aparecen aquí después de las etapas iniciales obligatorias de voltaje y código de error.',
    options: [
      { label: 'Sí, es Inverter', nextId: 'medir_senal', color: 'neutral' },
      { label: 'No, es convencional', nextId: 'ev_ventilador_congela', color: 'success' },
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
  // Nodos de tecnología Inverter compartidos (se alcanzan vía tipo_compresor_congela)
  ...INVERTER_TREE,
};



// ── Registro de árboles comunes ──────────────────────────────────────────────
export const ARBOLES_COMUNES: Record<string, DiagnosticTree> = {
  noenciende: NOENCIENDE,
  errorelectronico: ERRORELECTRONICO,
  fuga_agua: FUGA_AGUA,
  ruidoexcesivo: RUIDOEXCESIVO,
  congelamucho: CONGELAMUCHO,
  escarcha: ESCARCHA,
  congela_noenfria: CONGELA_NOENFRIA,
};
