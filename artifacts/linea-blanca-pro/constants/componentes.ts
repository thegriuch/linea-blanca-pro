/** Technical reference library — deep content for Línea Blanca Pro v2.0 */

import { GIF_MAP } from '@/constants/gifs';

export interface LibraryArticle {
  id: string;
  title: string;
  summary: string;
  body: string[];
  bullets?: string[];
  tip?: string;
  /** Ilustración local empaquetada; normalmente se toma del catálogo GIF_MAP. */
  image?: number;
  imageLabel?: string;
}

export interface LibraryCategory {
  id: string;
  title: string;
  icon: string;
  color: string;
  description: string;
  articles: LibraryArticle[];
}

export const LIBRARY_CATEGORIES: LibraryCategory[] = [
  {
    id: 'conceptos',
    title: 'Conceptos',
    icon: 'book-open',
    color: '#145DA0',
    description: 'Fundamentos de refrigeración y electricidad aplicada',
    articles: [
      {
        id: 'que-es-refrigeracion',
        title: '¿Qué es la refrigeración?',
        summary: 'El principio físico detrás de todo sistema de frío.',
        image: GIF_MAP['manometros'],
        imageLabel: 'Guía visual de conexión y lectura del sistema',
        body: [
          'La refrigeración es el proceso de extraer calor de un espacio o sustancia para bajar su temperatura por debajo de la del ambiente. No se "produce frío": se retira calor y se transporta hacia afuera.',
          'Esto se logra aprovechando que un refrigerante absorbe calor al evaporarse (a baja presión) y lo libera al condensarse (a alta presión). El compresor es el motor que mueve ese refrigerante en un ciclo continuo.',
          'Los cuatro componentes principales del ciclo de refrigeración son: compresor (eleva la presión del gas), condensador (disipa calor al ambiente), elemento de expansión (capilar o válvula), y evaporador (absorbe calor del espacio enfriado).',
        ],
        tip: 'Si entiendes que el sistema mueve calor de adentro hacia afuera, cualquier falla se vuelve más fácil de razonar: algo está impidiendo la absorción, el transporte o la liberación de ese calor.',
      },
      {
        id: 'electricidad-basica',
        title: 'Electricidad básica: voltaje, amperaje y resistencia',
        summary: 'Los conceptos eléctricos que usarás en cada visita.',
        image: GIF_MAP['medir-voltaje'],
        imageLabel: 'Medición de voltaje con multímetro',
        body: [
          'Voltaje (V): es la "presión" eléctrica que empuja la corriente. En Colombia y Latinoamérica los equipos domésticos trabajan a 110V o 220V AC.',
          'Amperaje (A): es la cantidad de corriente que fluye. Un compresor con amperaje muy alto puede estar en corto o sobrecargado. Uno con amperaje muy bajo puede no estar arrancando.',
          'Resistencia (Ω): es la oposición al paso de la corriente. Se mide con el equipo DESENERGIZADO. Las bobinas del compresor deben tener cierta resistencia; infinito (OL) indica bobina abierta.',
          'Potencia (W) = Voltaje × Amperaje. Un compresor de 400W a 110V consume aproximadamente 3.6A en marcha normal.',
          'Corriente Alterna (AC): el tipo que llega de la red eléctrica. Cambia de dirección 60 veces por segundo (60 Hz en Colombia).',
        ],
        tip: 'La ley de Ohm: V = I × R. Si sabes dos valores, puedes calcular el tercero. Es una herramienta fundamental para el diagnóstico.',
      },
      {
        id: 'medir-continuidad',
        title: 'Cómo medir continuidad con el multímetro',
        summary: 'La prueba más usada para detectar bobinas o cables abiertos.',
        image: GIF_MAP['medir-continuidad-tierra'],
        imageLabel: 'Prueba de continuidad y aislamiento a tierra',
        body: [
          'Selecciona el modo continuidad (símbolo de diodo o sonido) u ohmios en tu multímetro.',
          'Con el equipo DESENERGIZADO, toca las dos puntas en los extremos del componente a probar.',
          'Si el multímetro emite un pitido o muestra resistencia baja → hay continuidad → el circuito está cerrado.',
          'Si muestra "OL", "1" o infinito → el circuito está abierto → cable cortado o bobina quemada.',
          'Para verificar si hay cortocircuito a tierra: coloca una punta en el terminal y la otra en el chasis metálico. NO debe haber continuidad en un equipo sano.',
        ],
        tip: '¡Nunca midas continuidad con el equipo energizado! Puedes dañar el multímetro y sufrir un choque eléctrico.',
      },
      {
        id: 'presiones-refrigerante',
        title: 'Presiones del sistema de refrigeración',
        summary: 'Cómo interpretar los manómetros en campo.',
        image: GIF_MAP['manometros'],
        imageLabel: 'Lectura de manómetros',
        body: [
          'El kit de manómetros tiene dos manómetros: ALTA (lado rojo, del condensador) y BAJA (lado azul, del evaporador/succión).',
          'En un sistema correcto en marcha: la presión de BAJA baja por debajo de la presión de equilibrio, y la de ALTA sube por encima.',
          'En un sistema con GAS BAJO: ambas presiones estarán bajas. La diferencia entre alta y baja es mínima.',
          'En un sistema con CAPILAR OBSTRUIDO: la de baja baja mucho (puede ser negativa) y la de alta sube demasiado.',
          'En un sistema con COMPRESOR DESGASTADO: la diferencia entre alta y baja es pequeña aunque el gas esté correcto.',
        ],
        tip: 'Los valores exactos dependen del tipo de refrigerante y temperatura ambiente. Consulta la tabla de presiones según refrigerante.',
        bullets: [
          'R134a a 25°C: baja ≈ 0–15 psi en marcha; alta ≈ 100–200 psi',
          'R600a a 25°C: baja ≈ -5 a 5 psi en marcha; alta ≈ 60–120 psi',
          'R22 a 25°C: baja ≈ 65–70 psi en marcha; alta ≈ 225–250 psi',
          'R410A a 25°C: baja ≈ 100–130 psi en marcha; alta ≈ 250–350 psi',
        ],
      },
    ],
  },
  {
    id: 'componentes',
    title: 'Componentes',
    icon: 'cpu',
    color: '#F5821F',
    description: 'Guía técnica profunda de cada componente',
    articles: [
      {
        id: 'compresor-basico',
        title: 'Compresor convencional (ON/OFF)',
        summary: 'El corazón del sistema — qué es, cómo funciona y cómo falla.',
        image: GIF_MAP['medicion-compresor-kalley'],
        imageLabel: 'Medición del compresor',
        body: [
          '¿Qué es? Es una bomba hermética que comprime el refrigerante gaseoso para aumentar su presión y temperatura, permitiendo que se condense en el condensador y libere el calor absorbido.',
          '¿Cómo funciona? El motor eléctrico (dentro del compresor hermético) mueve un pistón o espiral que comprime el gas. El aceite lubricante circula con el refrigerante para proteger las partes móviles.',
          '¿Por qué falla? Las causas más comunes son: desgaste por horas de trabajo, falta de lubricación (aceite), sobrecalentamiento por condensador sucio, y fallas eléctricas en los devanados.',
          '¿Cómo medirlo? Mide las 3 bobinas (C, S, R). Todos deben tener resistencia; ninguno debe tener continuidad a tierra. Mide el amperaje en marcha y compáralo con el RLA de la placa.',
        ],
        bullets: [
          'Valores normales: C–R: 5–20 Ω, C–S: 2–15 Ω, S–R: suma de los anteriores',
          'Amperaje normal: 1.5A–5A según capacidad',
          'Temperatura de descarga normal: 80–120°C',
        ],
        tip: 'Un compresor que arranca fácil pero no enfría probablemente tiene fuga interna de válvulas. Un compresor que no arranca pero zumba probablemente tiene el capacitor/PTC o está atascado.',
      },
      {
        id: 'compresor-inverter',
        title: 'Compresor Inverter',
        summary: 'Tecnología de velocidad variable — más eficiente y más compleja.',
        image: GIF_MAP['medir-señal-inverter'],
        imageLabel: 'Medición de señal U, V y W del módulo Inverter',
        body: [
          '¿Qué es? Un compresor cuya velocidad es variable, controlada por un módulo electrónico (inverter) que varía la frecuencia de la corriente. En lugar de encenderse y apagarse, varía su velocidad según la demanda de frío.',
          '¿Cómo funciona? El módulo inverter convierte la corriente AC de la red en DC, y luego genera AC de frecuencia variable para el motor del compresor de 3 fases.',
          '¿Por qué falla? El módulo inverter puede dañarse por voltaje inestable, sobrecalentamiento o cortocircuito. El compresor en sí puede fallar igual que uno convencional.',
          '¿Cómo medirlo? El compresor inverter tiene 3 terminales de fase (U, V, W). La resistencia entre cualquier par debe ser igual y baja (1–15 Ω). NO tiene terminales C, S, R como el convencional.',
        ],
        bullets: [
          'Resistencia entre terminales: 1–5 Ω (simétrica entre los 3 pares)',
          'Sin continuidad a tierra en ningún terminal',
          'El módulo inverter tiene disipador de calor — verifique que esté limpio',
        ],
        tip: 'Nunca pruebes el compresor inverter directamente con corriente convencional: solo puede ser manejado por su módulo inverter específico.',
      },
      {
        id: 'kit-ptc',
        title: 'Kit PTC (Relé de arranque y protector térmico)',
        summary: 'El sistema de arranque del compresor convencional.',
        image: GIF_MAP['medir-ptc'],
        imageLabel: 'Medición del kit PTC y protector térmico',
        body: [
          '¿Qué es? El PTC (Positive Temperature Coefficient) es un dispositivo cerámico que actúa como relé de arranque. Al aplicarle corriente, se calienta rápidamente y aumenta su resistencia, desconectando el devanado de arranque (S) una vez que el compresor toma velocidad.',
          '¿Cómo funciona? Al inicio del arranque, el PTC tiene baja resistencia y permite corriente al devanado de arranque. En 0.5–1 segundo se calienta y su resistencia sube drásticamente, efectivamente desconectando el arranque.',
          '¿Por qué falla? Fatiga por ciclos de arranque frecuentes, sobrecalentamiento, o el compresor "rebota" constantemente y sobrecalienta el PTC.',
          '¿Cómo medirlo? Mide a temperatura ambiente (frío): un PTC bueno tiene cierta resistencia (puede variar entre 5 Ω y varios kΩ según modelo). Un PTC en corto marca 0 Ω. Un PTC abierto marca infinito.',
        ],
        tip: 'Para probar si el PTC es la causa: retíralo, instala uno nuevo y prueba. Si el compresor arranca, el PTC era el problema. Nunca arranques el compresor sin PTC en condiciones normales.',
      },
      {
        id: 'valvula-expansion',
        title: 'Elemento de expansión (capilar o válvula)',
        summary: 'El estrangulador del sistema que crea la diferencia de presiones.',
        image: GIF_MAP['barrido-nitrogeno'],
        imageLabel: 'Barrido del circuito con nitrógeno seco',
        body: [
          '¿Qué es? Es el componente que reduce drásticamente la presión del refrigerante líquido del lado de alta al lado de baja, provocando su expansión y enfriamiento.',
          'En refrigeración doméstica se usa principalmente el tubo capilar: un tubo de cobre de diámetro muy pequeño (0.5–2 mm) y longitud específica (0.5–5 metros según diseño).',
          '¿Por qué falla? El capilar se obstruye por: humedad que se congela en su interior, aceite quemado o partículas. También puede obstruirse si el filtro secante no se cambió.',
          'Síntomas de capilar obstruido: alta presión en el lado de alta, baja presión negativa en el lado de baja, compresor caliente y con ruido.',
        ],
        tip: 'El barrido con nitrógeno o agentes limpiadores puede despejar una obstrucción. Si hay daño físico (dobladura, aplaste), se debe reemplazar el capilar.',
      },
      {
        id: 'condensador',
        title: 'Condensador',
        summary: 'Donde el sistema libera el calor hacia el ambiente.',
        image: GIF_MAP['medir-presiones-marcha'],
        imageLabel: 'Verificación de presiones durante la marcha',
        body: [
          '¿Qué es? Es el intercambiador de calor en el lado de alta presión donde el refrigerante gaseoso (caliente) se enfría y condensa a estado líquido, liberando el calor absorbido del interior al ambiente.',
          'En neveras domésticas puede ser: serpentín en la pared trasera exterior (disipación natural), parrilla de alambres en la parte trasera o inferior (disipación natural), o condensador con ventilador forzado (más eficiente, usado en nevecones).',
          '¿Por qué falla? No falla el componente en sí, sino que acumula suciedad y polvo que impiden la disipación de calor, haciendo que el sistema trabaje con presiones más altas y menor eficiencia.',
          'Síntomas de condensador sucio: compresor muy caliente, alta presión elevada, producto no enfría bien aunque el sistema funciona.',
        ],
        tip: 'Limpia el condensador en cada visita. Un condensador limpio puede reducir el consumo eléctrico del equipo hasta un 20%.',
      },
      {
        id: 'evaporador',
        title: 'Evaporador',
        summary: 'Donde el frío "ocurre" — absorción de calor.',
        image: GIF_MAP['prueba-vacio'],
        imageLabel: 'Preparación del circuito frigorífico',
        body: [
          '¿Qué es? Es el intercambiador de calor en el lado de baja presión donde el refrigerante líquido se evapora absorbiendo calor del espacio enfriado (el interior de la nevera).',
          'En refrigeradores No Frost: el evaporador está oculto en la parte trasera del compartimiento con un ventilador que circula el aire. Requiere un sistema de descongelamiento automático.',
          'En refrigeradores ciclo simple (con escarcha): el evaporador está visible como la superficie interna del congelador. Se descongela manualmente.',
          '¿Por qué falla? Acumulación excesiva de escarcha (impide el intercambio de calor), fuga de refrigerante, o daño físico por herramienta durante descongelamiento.',
        ],
        tip: 'Si el evaporador está lleno de escarcha en un No Frost, el sistema de descongelamiento automático está fallando. Busca: resistencia de deshielo, termostato de deshielo, o temporizador.',
      },
      {
        id: 'filtro-secante',
        title: 'Filtro secante (deshidratador)',
        summary: 'El guardián del sistema contra la humedad.',
        image: GIF_MAP['barrido-nitrogeno'],
        imageLabel: 'Limpieza y barrido del circuito',
        body: [
          '¿Qué es? Es un recipiente metálico pequeño que contiene zeolitas (material desecante) y tamiz molecular que retiene humedad y partículas del sistema de refrigeración.',
          '¿Por qué es crítico? La humedad en el sistema de refrigeración se congela en el capilar (obstrucción) y forma ácidos que deterioran el aceite y los devanados del compresor.',
          '¿Cuándo cambiar? SIEMPRE que se abra el sistema (cambio de compresor, reparación de fuga, cualquier intervención que exponga el sistema a la atmósfera).',
          'Un filtro saturado tiene aspecto oscuro o con cristales. Uno nuevo es metálico sin residuos.',
        ],
        tip: 'Nunca reutilices un filtro secante. El costo de no cambiarlo puede ser la vida del nuevo compresor.',
      },
    ],
  },
  {
    id: 'herramientas',
    title: 'Herramientas',
    icon: 'tool',
    color: '#047857',
    description: 'Uso correcto del equipo de diagnóstico',
    articles: [
      {
        id: 'multimetro',
        title: 'Multímetro digital — uso en campo',
        summary: 'Tu herramienta más versátil. Úsala correctamente.',
        image: GIF_MAP['medir-voltaje'],
        imageLabel: 'Uso del multímetro en campo',
        body: [
          'VOLTAJE AC: selector en VAC o ~V. Puntas a la toma eléctrica o terminales. No toques las puntas con los dedos. Rango: elige mayor al esperado y baja.',
          'VOLTAJE DC: selector en VDC o -V. Respeta la polaridad (rojo = +, negro = -). Para baterías o transformadores de control.',
          'AMPERAJE: el multímetro básico mide hasta 10A en modo amperaje. Para compresores usa PINZA AMPERIMÉTRICA (más seguro, sin interrumpir el circuito).',
          'RESISTENCIA / CONTINUIDAD: equipo APAGADO y DESCONECTADO. Selector en Ω o modo continuidad. Espera que la lectura se estabilice.',
          'DIODO: para probar capacitores o diodos rectificadores en tarjetas electrónicas.',
        ],
        tip: 'Antes de cada medición, verifica que las puntas estén en los bornes correctos del multímetro según el tipo de medición.',
      },
      {
        id: 'kit-manometros',
        title: 'Kit de manómetros — conexión y lectura',
        summary: 'Cómo conectar el kit y qué esperar ver.',
        image: GIF_MAP['manometros'],
        imageLabel: 'Conexión y lectura del kit de manómetros',
        body: [
          'El kit tiene: manómetro de alta (rojo), manómetro de baja (azul), y 3 mangueras (alta, baja, servicio).',
          'CONEXIÓN: Baja (azul) va al puerto de baja del compresor (lado de succión). Alta (roja) va al puerto de alta o al condensador. Servicio (amarillo) va a la botella de gas o vacuum.',
          'LECTURA ESTÁTICA (equipo apagado): ambos manómetros deben marcar la presión de equilibrio del refrigerante a la temperatura ambiente actual.',
          'LECTURA EN MARCHA: baja debe bajar progresivamente, alta debe subir. Anota valores estables después de 5 minutos de funcionamiento.',
          'Al desconectar: cierra siempre las válvulas del manifold antes de retirar las mangueras para no liberar gas al ambiente.',
        ],
        tip: 'Calibra o verifica tus manómetros periódicamente. Un manómetro descalibrado puede llevarte a un diagnóstico equivocado.',
      },
      {
        id: 'bomba-vacio',
        title: 'Bomba de vacío — técnica correcta',
        summary: 'Clave para un sistema hermético y sin humedad.',
        image: GIF_MAP['prueba-vacio'],
        imageLabel: 'Prueba de vacío con bomba',
        body: [
          'La bomba de vacío extrae aire, humedad y gases no condensables del sistema ANTES de cargar el refrigerante.',
          'OBJETIVO: llegar a 400–500 micrones (micras Hg) de vacío. A ese nivel, el agua hierve a temperatura ambiente y se extrae.',
          'PROCEDIMIENTO: Conecta la bomba por el manifold. Abre todas las válvulas del manifold. Enciende la bomba y deja trabajar mínimo 30 minutos. Cierra las válvulas del manifold, apaga la bomba, y observa si el vacío se sostiene por 15 minutos.',
          'Si el vacío NO se sostiene: hay fuga en el sistema o en las conexiones del manifold. Localiza y repara antes de cargar.',
        ],
        tip: 'Cambia el aceite de la bomba de vacío regularmente. Un aceite contaminado reduce la capacidad de la bomba y puede no lograr el vacío necesario.',
      },
    ],
  },
  {
    id: 'procedimientos',
    title: 'Procedimientos',
    icon: 'clipboard',
    color: '#7C3AED',
    description: 'Guías paso a paso para intervenciones comunes',
    articles: [
      {
        id: 'cambio-compresor',
        title: 'Cambio de compresor — paso a paso',
        summary: 'El procedimiento completo para reemplazar un compresor.',
        image: GIF_MAP['medicion-compresor-kalley'],
        imageLabel: 'Medición y verificación del compresor',
        body: [
          '1. SEGURIDAD: Desconecta el equipo de la red eléctrica. Verifica ausencia de voltaje.',
          '2. RECUPERACIÓN: Recupera el refrigerante con máquina de recuperación. NUNCA liberes al ambiente.',
          '3. DESCONEXIÓN ELÉCTRICA: Retira los cables del compresor (foto antes para recordar conexión).',
          '4. DESCONEXIÓN HIDRÁULICA: Corta las tuberías del compresor con cortatubos. Protege las aberturas inmediatamente con tapones o cinta.',
          '5. RETIRO: Retira el compresor de sus soportes. Compara el nuevo con el antiguo (tipo de refrigerante, voltaje, capacidad).',
          '6. INSTALACIÓN: Instala el nuevo compresor. Verifica que los soportes amortiguadores estén en buen estado.',
          '7. SOLDADURA: Suelda con flujo de nitrógeno dentro de las tuberías para evitar óxido interno.',
          '8. FILTRO SECANTE: Instala filtro secante NUEVO. Obligatorio.',
          '9. VACÍO: Conecta bomba de vacío. Haz vacío hasta 400–500 micrones. Mantén 30 minutos mínimo.',
          '10. CARGA: Carga el refrigerante correcto en el peso exacto indicado en la placa del equipo.',
          '11. VERIFICACIÓN: Mide amperaje, presiones y temperatura. Documenta con fotos.',
        ],
        tip: 'Antes de instalar el nuevo compresor, verifica que tenga el aceite compatible con el refrigerante del sistema. Algunos compresores R600a requieren aceite éster.',
      },
      {
        id: 'carga-refrigerante',
        title: 'Carga de refrigerante — método por peso',
        summary: 'La forma correcta y precisa de cargar un sistema.',
        image: GIF_MAP['carga-refrigerante'],
        imageLabel: 'Carga de refrigerante por peso',
        body: [
          'La carga de refrigerante SIEMPRE debe hacerse por PESO (gramos) usando báscula de precisión, no "a ojo" ni "a presión".',
          '1. Identifica el refrigerante correcto y la carga en gramos (en la placa del equipo o manual técnico).',
          '2. Conecta la botella de refrigerante al manifold invertida (para cargar en líquido por el lado de baja o alta según sistema).',
          '3. Pesa la botella llena. Anota el peso inicial.',
          '4. Abre lentamente la válvula del manifold y deja entrar el refrigerante hasta el peso calculado.',
          '5. Mide presiones y amperaje. Compara con valores de referencia para el refrigerante y temperatura.',
          '6. Documenta la carga con foto de la báscula.',
        ],
        tip: 'En equipos R600a, trabaja lejos de fuentes de ignición: el isobutano es inflamable. Ventila el área de trabajo.',
      },
    ],
  },
  {
    id: 'seguridad',
    title: 'Seguridad',
    icon: 'shield',
    color: '#DC2626',
    description: 'Prácticas seguras en el campo',
    articles: [
      {
        id: 'seguridad-electrica',
        title: 'Seguridad eléctrica durante el diagnóstico',
        summary: 'Las reglas que no puedes ignorar.',
        image: GIF_MAP['medir-voltaje'],
        imageLabel: 'Medición eléctrica segura',
        body: [
          'REGLA #1: Nunca trabajes con el equipo energizado a menos que la medición lo requiera explícitamente (ej: medir voltaje en funcionamiento).',
          'REGLA #2: Antes de tocar terminales, verifica ausencia de voltaje con el multímetro. No asumas que está apagado.',
          'REGLA #3: Nunca "puentees" (cortocircuites) un protector térmico o fusible para forzar el arranque. Es la causa más común de accidentes graves.',
          'REGLA #4: Usa herramientas con mango aislado cuando trabajes cerca de componentes energizados.',
          'REGLA #5: En equipos de 220V, ten especial cuidado. La corriente a 220V tiene el doble de potencia letal.',
          'REGLA #6: Si el equipo tiene condensadores de arranque grandes (en aires acondicionados), descárgalos antes de tocarlos.',
        ],
        tip: 'Un choque eléctrico puede ocurrir aunque "ya hayas desconectado" el equipo si hay capacitores cargados. Espera unos segundos y mide antes de tocar.',
      },
      {
        id: 'seguridad-refrigerantes',
        title: 'Seguridad con refrigerantes',
        summary: 'Manejo seguro y responsable de gases refrigerantes.',
        image: GIF_MAP['carga-refrigerante'],
        imageLabel: 'Manipulación y carga de refrigerante',
        body: [
          'NUNCA liberes refrigerante a la atmósfera. Usa siempre máquina de recuperación.',
          'R600a (isobutano) es INFLAMABLE. Trabaja en área ventilada, lejos de fuentes de ignición (flama, chispa, cigarrillo).',
          'R32 es también moderadamente inflamable. Aplican mismas precauciones.',
          'R22, R134a y R410A no son inflamables pero son gases de efecto invernadero. Recupéralos siempre.',
          'Verifica que el refrigerante a cargar sea EXACTAMENTE el especificado en la placa. No mezcles refrigerantes incompatibles.',
          'Usa gafas protectoras al trabajar con refrigerantes a alta presión.',
        ],
      },
    ],
  },
];

export function getCategory(id: string): LibraryCategory | undefined {
  return LIBRARY_CATEGORIES.find((c) => c.id === id);
}

export function findArticle(id: string): { article: LibraryArticle; category: LibraryCategory } | undefined {
  for (const category of LIBRARY_CATEGORIES) {
    const article = category.articles.find((a) => a.id === id);
    if (article) return { article, category };
  }
  return undefined;
}
