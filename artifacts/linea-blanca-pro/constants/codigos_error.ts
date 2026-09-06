/**
 * Línea Blanca Pro — Tabla de códigos de error por tipo de electrodoméstico
 * Los códigos pueden variar ligeramente por modelo — siempre confirmar con el manual del equipo.
 */
import type { EquipoTipo } from '@/types/diagnostico';

export interface CodigoError {
  codigo: string;         // Código exacto como aparece en el equipo
  equivalentes?: string; // Otros códigos equivalentes en otras modelos
  descripcion: string;   // Qué significa el código (breve)
  causas: string[];       // Posibles causas ordenadas de más a menos probable
  solucion: string;       // Pasos de diagnóstico y solución
  partes?: string[];      // Repuestos que generalmente se necesitan
}

// ── LAVADORAS ─────────────────────────────────────────────────────────────────
const LAVADORA: CodigoError[] = [
  {
    codigo: 'E10',
    equivalentes: 'E1',
    descripcion: 'No llena agua: el nivel no cambia en 3 min con las electroválvulas abiertas',
    causas: [
      'Presión de agua del suministro demasiado baja (< 0,5 bar)',
      'Filtros de la manguera de entrada obstruidos',
      'Electroválvula de entrada defectuosa (hay voltaje pero no abre)',
      'Sensor de nivel (presostato) o manguera del presostato obstruida',
      'Tarjeta PCB no envía señal de apertura a la electroválvula',
    ],
    solucion: 'Verificar presión del suministro de agua (abrir llave completamente). Limpiar los filtros de los puertos de entrada de la electroválvula. Si hay voltaje en la electroválvula y no abre → reemplazar electroválvula. Si no hay voltaje → soplar manguera del presostato, verificar sensor de nivel. Si persiste → revisar PCB y cableado entre PCB y sensor.',
    partes: ['Electroválvula de entrada de agua', 'Presostato / sensor de nivel', 'Tarjeta PCB principal'],
  },
  {
    codigo: 'E12',
    equivalentes: 'E2,',
    descripcion: 'Nivel de agua en el tambor supera el límite de alarma (sobrellenado)',
    causas: [
      'Electroválvula de entrada de agua no cierra (queda abierta)',
      'Sensor de nivel (presostato) defectuoso — no detecta nivel alto',
      'Manguera del presostato bloqueada o tapada',
      'Tarjeta PCB no cierra la señal de la electroválvula',
    ],
    solucion: 'Primero: reiniciar el equipo (desconectar 5 min) — puede resolverlo. Si la lavadora sigue llenando sin detenerse → la electroválvula está pegada o con fuga → reemplazarla. Verificar sensor de nivel soplando la manguera del presostato y escuchando el clic de cambio de estado. Revisar tarjeta PCB.',
    partes: ['Electroválvula de entrada de agua', 'Presostato / sensor de nivel'],
  },
  {
    codigo: 'E21',
    equivalentes: 'E2',
    descripcion: 'No desagua: el nivel no baja en 3 min con la bomba activa',
    causas: [
      'Manguera de desagüe doblada, aplastada o instalada demasiado alta',
      'Bomba de drenaje obstruida (moneda, botón, pelusa)',
      'Bomba de drenaje defectuosa o quemada',
      'Tarjeta PCB no activa la bomba de drenaje',
    ],
    solucion: 'Verificar que la manguera de desagüe no esté doblada ni sifoneada. Limpiar el filtro de la bomba de drenaje (panel frontal inferior en la mayoría de modelos). Medir si llega voltaje a la bomba durante el ciclo de drenaje — si llega y no drena → reemplazar bomba. Si no llega voltaje → revisar PCB.',
    partes: ['Bomba de drenaje', 'Tarjeta PCB principal'],
  },
  {
    codigo: 'E40',
    equivalentes: 'E4',
    descripcion: 'Carga desbalanceada — el tambor no puede centrifugar de forma segura',
    causas: [
      'Ropa concentrada en un solo lado del tambor',
      'Pieza de ropa grande (colchón, cobija) que no puede distribuirse',
      'Lavadora sin nivelar correctamente',
      'Amortiguadores de suspensión desgastados',
      'Resortes de suspensión flojos o rotos',
    ],
    solucion: 'Abrir la puerta, redistribuir la ropa manualmente y reiniciar el ciclo. Si persiste con carga normal → verificar nivelación con nivel de burbuja y ajustar las patas. Si vibra excesivamente → revisar amortiguadores y resortes de suspensión.',
    partes: ['Amortiguadores de suspensión', 'Resortes de suspensión'],
  },
  {
    codigo: 'E30',
    equivalentes: 'E3 (door lock)',
    descripcion: 'Error de puerta/tapa — el equipo no detecta que la puerta está cerrada',
    causas: [
      'Puerta o tapa no cerrada completamente',
      'Interruptor de seguridad de puerta (door switch) defectuoso',
      'Traba electrónica de puerta (door lock) averiada',
      'Lengüeta de puerta rota o deformada',
    ],
    solucion: 'Verificar que la puerta cierra completamente con clic. Medir continuidad del interruptor de puerta (debe cambiar estado al cerrar). Verificar que el solenoide de la traba electrónica recibe voltaje y traba. Revisar la lengua plástica de la puerta.',
    partes: ['Interruptor de puerta / door switch', 'Traba electrónica / door lock'],
  },
  {
    codigo: 'E34, E35',
    equivalentes: 'TE',
    descripcion: 'Error de sensor de temperatura del agua o falla en resistencia calefactora',
    causas: [
      'Sensor NTC de temperatura del agua en corto o circuito abierto',
      'Resistencia calefactora (heating element) quemada',
      'Termostato de seguridad de la resistencia activado permanentemente',
      'Conector del sensor suelto o con corrosión',
    ],
    solucion: 'Medir resistencia del sensor NTC (a 25°C ≈ 10 kΩ, varía con temperatura). Verificar continuidad de la resistencia calefactora (≈ 20–50 Ω). Revisar termostato de seguridad pegado al elemento calefactor. Revisar conectores en la tarjeta.',
    partes: ['Sensor NTC de temperatura', 'Resistencia calefactora / heating element', 'Termostato de seguridad'],
  },
  {
    codigo: 'E36',
    equivalentes: 'TE, Th',
    descripcion: 'Error resistencia calefactora',
    causas: [
      'Sensor NTC de temperatura del agua en corto o circuito abierto',
      'Resistencia calefactora (heating element) quemada',
      'Termostato de seguridad de la resistencia activado permanentemente',
      'Conector del sensor suelto o con corrosión',
    ],
    solucion: 'Medir resistencia del sensor NTC (a 25°C ≈ 10 kΩ, varía con temperatura). Verificar continuidad de la resistencia calefactora (≈ 20–50 Ω). Revisar termostato de seguridad pegado al elemento calefactor. Revisar conectores en la tarjeta.',
    partes: ['Sensor NTC de temperatura', 'Resistencia calefactora / heating element', 'Termostato de seguridad'],
  },
  {
    codigo: 'E37, E38',
    equivalentes: 'Los mismos E35, E36, pero de la zona de secado (lavadora/secadora)',
    descripcion: 'Error de sensor o resistencia de la zona de secado',
    causas: [
      'Sensor NTC de temperatura de la zona de secado en corto o circuito abierto',
      'Resistencia calefactora de secado quemada',
      'Termostato de seguridad de la zona de secado activado permanentemente',
      'Conector del sensor suelto o con corrosión',
    ],
    solucion: 'Medir resistencia del sensor NTC de la zona de secado. Verificar continuidad de la resistencia de secado. Revisar termostato de seguridad pegado al elemento. Revisar conectores en la tarjeta.',
    partes: ['Sensor NTC de secado', 'Resistencia de secado / heating element', 'Termostato de seguridad'],
  },
  {
    codigo: 'E3A',
    equivalentes: 'Relacionados a termostato',
    descripcion: 'Error de termostato de temperatura regulador',
    causas: [
      'Sensor NTC de temperatura del agua en corto o circuito abierto',
      'Resistencia calefactora (heating element) quemada',
      'Termostato de seguridad de la resistencia activado permanentemente',
      'Conector del sensor suelto o con corrosión',
    ],
    solucion: 'Medir resistencia del sensor NTC (a 25°C ≈ 10 kΩ, varía con temperatura). Verificar continuidad de la resistencia calefactora (≈ 20–50 Ω). Revisar termostato de seguridad pegado al elemento calefactor. Revisar conectores en la tarjeta.',
    partes: ['Sensor NTC de temperatura', 'Resistencia calefactora / heating element', 'Termostato de seguridad'],
  },
  {
    codigo: 'E33',
    equivalentes: 'F8',
    descripcion: 'Error de sensor de presión de agua / sensor de nivel',
    causas: [
      'Manguera del presostato obstruida o pinchada',
      'Presostato (sensor de nivel) defectuoso',
      'Residuos de jabón endurecido en la cámara del presostato',
      'Deficiencia en embobinado del motor',
    ],
    solucion: 'Desconectar y soplar la manguera del presostato desde ambos extremos. Limpiar la cámara del presostato. Verificar que el presostato cambia de estado (clic) al soplar. Si no cambia → reemplazar presostato.',
    partes: ['Presostato / sensor de nivel'],
  },
  {
    codigo: 'CE',
    equivalentes: '9E, E8 (corriente), overcurrent',
    descripcion: 'Protección por sobrecorriente — el motor o tarjeta detecta corriente excesiva',
    causas: [
      'Carga excesiva de ropa en el tambor',
      'Tambor bloqueado por objeto extraño (moneda, ropa atascada)',
      'Motor con devanados en corto',
      'Módulo de control del motor (BLDC driver) defectuoso',
    ],
    solucion: 'Reducir la carga de ropa y reiniciar. Revisar que nada bloquee el movimiento del tambor (girar a mano). Si el motor emite olor a quemado → revisar devanados. Si el problema persiste → revisar tarjeta de control del motor.',
    partes: ['Motor de lavado', 'Tarjeta de control BLDC'],
  },
  {
    codigo: 'E21',
    equivalentes: '11E, E9 (leak), FL (fuga)',
    descripcion: 'Fuga de agua detectada — sensor de bandeja anti-derrame activo',
    causas: [
      'Manguera de entrada o salida con fuga',
      'Sello de la bomba de drenaje deteriorado',
      'Tambor o tina con fisura',
      'Sello de goma (bota) de puerta (en frontales) deteriorado',
    ],
    solucion: 'Inspeccionar todas las mangueras (entrada, desagüe, interna). Revisar sello de la bomba de drenaje. En frontales, revisar el sello de goma (bota) de la puerta por fisuras. Vaciar la bandeja inferior si está llena de agua.',
    partes: ['Manguera de entrada', 'Manguera de desagüe', 'Sello de bomba', 'Sello de goma de puerta'],
  },
  {
    codigo: 'E50',
    equivalentes: 'No tiene',
    descripcion: 'La tarjeta inverter que está en el motor detecta señales anormales',
    causas: [
      'El voltaje AC es inestable',
      'La tarjeta inverter del motor está sobrecargada por un bloqueo en el motor',
      'Tarjeta inverter del motor con sensores o IPM dañado detectando corrientes inestables o temperaturas fuera de rango',
      'No se puede detectar la velocidad del motor; la PCB principal detecta señales de alta temperatura en el motor o en la tarjeta inverter',
      'El IPM de la tarjeta inverter del motor lee erróneamente las señales que vienen desde el motor',
    ],
    solucion: 'Verificar que estén llegando los 120V +/- 10% a la tarjeta inverter del motor. Verificar los embobinados del motor.',
    partes: ['Motor de lavado'],
  },
  {
    codigo: 'E58',
    equivalentes: 'No tiene',
    descripcion: 'Sobrecarga del motor: falla en las frecuencias o fase de motor abierta',
    causas: [
      'Embobinado del motor abierto',
      'La tarjeta inverter del motor está sobrecargada por un bloqueo en el motor',
      'Tarjeta inverter del motor con sensores o IPM dañado',
      'El IPM lee erróneamente las señales que vienen desde el motor',
    ],
    solucion: 'Verificar que estén llegando los 120V +/- 10% a la tarjeta inverter del motor. Verificar los embobinados del motor.',
    partes: ['Motor de lavado'],
  },
];

// ── SECADORAS ─────────────────────────────────────────────────────────────────
// Códigos específicos de secadoras (secado, calefacción, flujo de aire y motor).
const SECADORA: CodigoError[] = [
  {
    codigo: 'dE1',
    equivalentes: 'E1, dE',
    descripcion: 'No calienta: el elemento calefactor no recibe energía o está abierto',
    causas: [
      'Elemento calefactor (resistencia) abierto',
      'Termostato de seguridad (hi-limit) activado permanentemente por sobrecalentamiento',
      'Relé de la tarjeta que controla el calefactor defectuoso',
      'Filtro de pelusa o ducto de salida obstruidos',
    ],
    solucion: 'Desconectar el equipo. Medir continuidad del elemento calefactor (típico 8–20 Ω). Verificar termostato de seguridad (debe tener continuidad). Limpiar filtro de pelusa y ducto ANTES de reemplazar componentes. Verificar que llegue voltaje al elemento cuando la secadora debería calentar.',
    partes: ['Elemento calefactor / resistencia', 'Termostato de seguridad (hi-limit)', 'Tarjeta de control'],
  },
  {
    codigo: 'dE2',
    equivalentes: 'E2, tE (temp)',
    descripcion: 'El tambor no gira — correa del tambor rota o motor defectuoso',
    causas: [
      'Correa de transmisión del tambor rota o desgastada',
      'Motor del tambor defectuoso',
      'Tensor de correa (idler pulley) fuera de posición',
      'Rodamiento del tambor agarrotado',
    ],
    solucion: 'Abrir el panel frontal/trasero según el modelo. Inspeccionar visualmente la correa (belt). Verificar el tensor. Medir continuidad del motor. Comprobar que el tambor gire libremente a mano.',
    partes: ['Correa del tambor (belt)', 'Motor de secadora', 'Tensor de correa (idler pulley)', 'Rodamiento del tambor'],
  },
  {
    codigo: 'dE3',
    equivalentes: 'E3, F3',
    descripcion: 'Falla del sensor de temperatura de la secadora (NTC)',
    causas: [
      'Sensor NTC de temperatura fuera de rango (corto o abierto)',
      'Conector del sensor suelto o con corrosión',
      'Tarjeta de control con falla en la lectura del sensor',
    ],
    solucion: 'Medir la resistencia del sensor NTC (a temperatura ambiente típicamente 5–50 kΩ y debe variar con el calor). Verificar conectores y continuidad hasta la tarjeta. Reemplazar el sensor si está fuera de especificación.',
    partes: ['Sensor NTC de temperatura', 'Tarjeta de control'],
  },
  {
    codigo: 'dE4',
    equivalentes: 'E4, F4',
    descripcion: 'Flujo de aire deficiente o conducto de ventilación obstruido',
    causas: [
      'Acumulación de pelusa en el ducto de salida de aire',
      'Filtro de pelusa interno obstruido',
      'Ventilador (blower wheel) con pelusa o flojo en el eje',
      'Ducto aplastado o con codos excesivos que restringen el flujo',
    ],
    solucion: 'Limpiar el ducto de ventilación completo con cepillo flexible. Limpiar el blower wheel. Verificar que la aspa esté fija al eje. Comprobar flujo de aire en la salida exterior (debe sentirse fuerte). Un ducto limpio puede reducir el tiempo de secado hasta un 50%.',
    partes: ['Blower wheel / ventilador de circulación', 'Motor del ventilador'],
  },
  {
    codigo: 'dE5',
    equivalentes: 'E5, UE, de (desequilibrio)',
    descripcion: 'Error de desequilibrio o carga mal distribuida en el tambor',
    causas: [
      'Carga de ropa desbalanceada o atascada en un lado',
      'Secadora sin nivelar o sobre superficie inestable',
      'Amortiguadores de suspensión desgastados',
      'Resortes de suspensión flojos o rotos',
    ],
    solucion: 'Redistribuir la ropa uniformemente y reiniciar. Verificar nivelación con nivel de burbuja (ajustar patas). Si persiste con carga normal → revisar amortiguadores y resortes de suspensión.',
    partes: ['Amortiguadores de suspensión', 'Resortes de suspensión'],
  },
  {
    codigo: 'dE6',
    equivalentes: 'E6, dE (door)',
    descripcion: 'Error de puerta — el equipo no detecta que la puerta está cerrada',
    causas: [
      'Puerta no cerrada completamente',
      'Interruptor de seguridad de puerta (door switch) defectuoso',
      'Traba electrónica de puerta averiada',
      'Lengüeta de puerta rota o deformada',
    ],
    solucion: 'Verificar que la puerta cierre completamente con clic. Medir continuidad del interruptor de puerta (debe cambiar de estado al cerrar). Revisar la traba electrónica y la lengüeta de la puerta.',
    partes: ['Interruptor de puerta / door switch', 'Traba electrónica / door lock'],
  },
  {
    codigo: 'dE7',
    equivalentes: 'E7, CE (comm)',
    descripcion: 'Error de comunicación entre tarjeta principal y tarjeta de display',
    causas: [
      'Cable de comunicación (ribbon) suelto o dañado',
      'Tarjeta de display defectuosa',
      'Tarjeta principal con falla en el módulo de comunicación',
    ],
    solucion: 'Verificar y reconectar el cable plano. Hacer reset completo (desconectar 10 minutos). Si persiste → probar reemplazando la tarjeta de display primero.',
    partes: ['Cable de comunicación / ribbon cable', 'Tarjeta de display', 'Tarjeta principal'],
  },
  {
    codigo: 'dE8',
    equivalentes: 'E8, bE (belt)',
    descripcion: 'Falla en el sensor de rotación de la correa (belt switch)',
    causas: [
      'Sensor de rotación de correa defectuoso',
      'Correa rota que el sensor no detecta',
      'Suciedad o pelusa que bloquea el sensor',
    ],
    solucion: 'Verificar el sensor de rotación de la correa. Limpiarlo de pelusa. Verificar que la correa esté en buen estado y haga girar la polea del sensor. Reemplazar correa o sensor según diagnóstico.',
    partes: ['Sensor de rotación de correa', 'Correa del tambor (belt)'],
  },
  {
    codigo: 'dE9',
    equivalentes: 'E9, tE (temp)',
    descripcion: 'Error de termostato de ciclo o sobrecalentamiento',
    causas: [
      'Termostato de ciclo (cycling thermostat) abierto permanentemente',
      'Termostato de seguridad activado por sobrecalentamiento',
      'Filtro de pelusa o ducto obstruidos que causan sobrecalentamiento',
    ],
    solucion: 'Limpiar el filtro y el ducto ANTES de reemplazar componentes. Medir continuidad del termostato de ciclo y del de seguridad. Reemplazar con la referencia exacta del modelo.',
    partes: ['Termostato de ciclo (cycling thermostat)', 'Termostato de seguridad (hi-limit)'],
  },
];

// ── NEVERAS / REFRIGERADORES ──────────────────────────────────────────────────
const NEVERA: CodigoError[] = [
  {
    codigo: 'E1',
    equivalentes: 'F1, 1F, Er F1, Er 1',
    descripcion: 'Error de sensor de temperatura del compartimento de refrigeración',
    causas: [
      'Sensor NTC del compartimento de refrigeración en circuito abierto o corto',
      'Conector del sensor suelto o con corrosión',
      'Tarjeta principal con falla en la lectura del sensor',
    ],
    solucion: 'Desconectar y medir el sensor NTC (a 25°C ≈ 5–10 kΩ según modelo). Verificar continuidad del cableado hasta la tarjeta. Limpiar conectores. Si el valor del sensor está fuera de rango → reemplazar sensor.',
    partes: ['Sensor NTC de refrigerador', 'Tarjeta principal'],
  },
  {
    codigo: 'E2',
    equivalentes: 'F2, 2F, Er F2, Er 2',
    descripcion: 'Error de sensor de temperatura del congelador (freezer)',
    causas: [
      'Sensor NTC del congelador en circuito abierto o corto',
      'Sensor cubierto de hielo (evaporador con escarcha excesiva)',
      'Conector del sensor deteriorado por humedad',
    ],
    solucion: 'Medir el sensor NTC del congelador (a 0°C ≈ 15–30 kΩ). Descongelar manualmente el evaporador si está cubierto de hielo. Revisar el ciclo de descongelamiento (resistencia + termostato de deshielo). Reemplazar sensor si está fuera de rango.',
    partes: ['Sensor NTC de congelador', 'Resistencia de deshielo', 'Termostato de deshielo'],
  },
  {
    codigo: 'E3',
    equivalentes: 'F3, 3F, Er 3, amb. sensor',
    descripcion: 'Error de sensor ambiental / sensor de temperatura exterior',
    causas: [
      'Sensor NTC ambiental en circuito abierto o corto',
      'Sensor expuesto a fuente de calor que da lectura incorrecta',
    ],
    solucion: 'Localizar el sensor ambiental (generalmente en la parte superior del gabinete o en el panel de control). Medir resistencia a temperatura ambiente. Reemplazar si está fuera de especificación.',
    partes: ['Sensor NTC ambiental'],
  },
  {
    codigo: 'E4',
    equivalentes: 'F4, 4F, defrost sensor',
    descripcion: 'Error de sensor de descongelamiento',
    causas: [
      'Sensor de deshielo (defrost sensor) en corto o circuito abierto',
      'Termostato de deshielo pegado (siempre abierto)',
    ],
    solucion: 'Medir el sensor de deshielo (debe cambiar resistencia con temperatura). Verificar el termostato de deshielo (bimetálico — debe cerrar a temperatura baja). Revisar si hay formación excesiva de escarcha en el evaporador.',
    partes: ['Sensor de deshielo', 'Termostato de deshielo'],
  },
  {
    codigo: 'E5',
    equivalentes: 'F5, 5F, fan motor freezer',
    descripcion: 'Error de motor del ventilador del congelador',
    causas: [
      'Motor del ventilador del evaporador bloqueado por hielo',
      'Motor del ventilador quemado o devanados abiertos',
      'Conector del ventilador suelto',
      'Tarjeta no envía voltaje al ventilador',
    ],
    solucion: 'Verificar que el ventilador no está bloqueado por hielo (descongelar manualmente). Medir voltaje en el conector del motor durante operación (típico 12 V DC o 120/220 V AC). Si hay voltaje y no gira → reemplazar motor. Si no hay voltaje → revisar tarjeta.',
    partes: ['Motor ventilador evaporador', 'Tarjeta principal'],
  },
  {
    codigo: 'E6',
    equivalentes: 'F6, 6F, fan motor fridge',
    descripcion: 'Error de motor del ventilador del refrigerador (en modelos No Frost)',
    causas: [
      'Motor del ventilador del refrigerador bloqueado',
      'Motor quemado',
      'Señal de RPM no retorna a la tarjeta',
    ],
    solucion: 'Verificar que el ventilador gira libremente. Medir voltaje en el conector (típico 12 V DC). Verificar señal de retroalimentación de velocidad (Hall sensor integrado). Reemplazar motor si falla.',
    partes: ['Motor ventilador refrigerador'],
  },
  {
    codigo: 'E7',
    equivalentes: 'F7, 7F, Comm. error, CE',
    descripcion: 'Error de comunicación entre tarjeta principal y tarjeta de display',
    causas: [
      'Cable de comunicación entre tarjetas suelto o dañado',
      'Tarjeta de display defectuosa',
      'Tarjeta principal con falla en módulo de comunicación',
    ],
    solucion: 'Verificar y reconectar el cable de comunicación (ribbon cable o cable plano). Hacer reset completo (desconectar 10 minutos). Si persiste → probar reemplazando tarjeta de display primero.',
    partes: ['Cable de comunicación', 'Tarjeta de display', 'Tarjeta principal'],
  },
  {
    codigo: 'H1',
    equivalentes: 'HI, High Temp, alarm temp',
    descripcion: 'Alarma de alta temperatura — el refrigerador detectó temperatura muy alta',
    causas: [
      'Puerta abierta por mucho tiempo o cargada de alimentos calientes',
      'Falla de enfriamiento real (compresor, ventilador, refrigerante)',
      'Sensor de temperatura defectuoso dando lectura errónea',
    ],
    solucion: 'Verificar si el equipo está enfriando normalmente (colocar termómetro). Si la temperatura interior es normal → sensor defectuoso. Si no enfría → iniciar diagnóstico de "No enfría" para identificar la falla de refrigeración.',
    partes: [],
  },
  {
    codigo: 'FF',
    equivalentes: 'OF OF, o FF',
    descripcion: 'Modo de descongelamiento forzado activado (no es falla — es modo de servicio)',
    causas: [
      'Activado manualmente por el técnico para descongelar',
      'En algunos modelos puede indicar falla en ciclo normal de deshielo',
    ],
    solucion: 'Presionar los botones de modo servicio para salir del modo descongelamiento forzado (varía por modelo — consultar manual). Si el equipo entra solo a este modo → revisar ciclo de descongelamiento automático.',
    partes: [],
  },
];

// ── AIRES ACONDICIONADOS ──────────────────────────────────────────────────────
const AIRE: CodigoError[] = [
  {
    codigo: 'E1',
    equivalentes: 'F1, P1, HP (high pressure)',
    descripcion: 'Protección de alta presión del compresor',
    causas: [
      'Condensador obstruido (sucio, sin flujo de aire)',
      'Ventilador del condensador no funciona',
      'Sobrecarga de refrigerante',
      'Válvula de expansión obstruida o defectuosa',
    ],
    solucion: 'Limpiar el condensador (unidad exterior) con agua a presión. Verificar que el ventilador exterior funciona y el flujo de aire no está obstruido. Medir presión de descarga (debe ser < 30 bar para R22, < 27 bar para R410A). Si está alta → verificar refrigerante y flujo de aire.',
    partes: ['Motor ventilador condensador', 'Sensor de alta presión', 'Válvula de expansión'],
  },
  {
    codigo: 'E2',
    equivalentes: 'F2, zero-cross error',
    descripcion: 'Error de detección de cruce por cero — falla en alimentación eléctrica',
    causas: [
      'Variación excesiva en la frecuencia o voltaje de la red',
      'Tarjeta de control de la unidad interior defectuosa',
      'Filtro de línea dañado',
    ],
    solucion: 'Medir el voltaje de la red (debe estar ±10% del nominal). Verificar que la frecuencia sea estable (60 Hz en Colombia). Si la red es estable → posible falla en tarjeta de control interior.',
    partes: ['Tarjeta de control interior'],
  },
  {
    codigo: 'E3',
    equivalentes: 'F3, LP (low pressure), LP protection',
    descripcion: 'Protección de baja presión — falta de refrigerante o evaporador congelado',
    causas: [
      'Fuga de refrigerante (bajo nivel)',
      'Filtro deshidratador obstruido',
      'Evaporador congelado por bajo flujo de aire',
      'Sensor de baja presión defectuoso',
    ],
    solucion: 'Verificar presión de succión (normal: 3–5 bar R22, 6–9 bar R410A). Si está baja → buscar fuga con detectores. Si no hay fuga → revisar filtro deshidratador y flujo de aire en evaporador (limpieza de filtros).',
    partes: ['Sensor de baja presión', 'Filtro deshidratador', 'Refrigerante'],
  },
  {
    codigo: 'E4',
    equivalentes: 'F4, DT protection, discharge temp',
    descripcion: 'Alta temperatura de descarga del compresor — protección térmica activa',
    causas: [
      'Falta de refrigerante (presiones bajas)',
      'Condensador obstruido (no disipa calor)',
      'Sensor de temperatura de descarga defectuoso',
      'Relación de compresión muy alta por obstrucción',
    ],
    solucion: 'Medir temperatura de descarga (debe ser < 100°C). Verificar presiones del sistema. Limpiar condensador. Si todo está OK y sigue → reemplazar sensor de temperatura de descarga.',
    partes: ['Sensor de temperatura de descarga', 'Refrigerante'],
  },
  {
    codigo: 'E5',
    equivalentes: 'F5, IPM protection, overcurrent',
    descripcion: 'Protección de sobrecorriente del módulo IPM / inverter',
    causas: [
      'Compresor con devanados en corto',
      'Módulo IPM (IGBT) dañado',
      'Voltaje de alimentación bajo o con variaciones',
      'Condensador obstruido que sobrecarga el compresor',
    ],
    solucion: 'Medir corriente del compresor con pinza amperimétrica. Medir voltaje de alimentación. Medir resistencia de los devanados del compresor (U-V, U-W, V-W deben ser iguales). Si hay desbalance → compresor en corto. Si todo está bien → revisar módulo IPM.',
    partes: ['Módulo IPM / inverter board', 'Compresor inverter'],
  },
  {
    codigo: 'E6',
    equivalentes: 'F6, Comm. error, CE',
    descripcion: 'Error de comunicación entre unidad interior y exterior',
    causas: [
      'Cable de comunicación entre unidades roto o con conexión defectuosa',
      'Variación en la tensión de alimentación afecta la comunicación',
      'Tarjeta de la unidad interior o exterior defectuosa',
    ],
    solucion: 'Verificar el cable de señal entre las unidades (generalmente 3 hilos). Medir voltaje en los bornes de comunicación (varía por modelo, consultar diagrama). Hacer reset completo. Si persiste → cambiar tarjeta de la unidad interior primero.',
    partes: ['Cable de comunicación', 'Tarjeta unidad interior', 'Tarjeta unidad exterior'],
  },
  {
    codigo: 'F1',
    equivalentes: 'E1T, T1, indoor temp sensor',
    descripcion: 'Error de sensor de temperatura interior (NTC del ambiente)',
    causas: [
      'Sensor NTC de temperatura interior en corto o circuito abierto',
      'Conector del sensor con corrosión o suelto',
    ],
    solucion: 'Localizar el sensor NTC de temperatura del cuarto (generalmente en el panel frontal de la unidad interior). Medir resistencia (a 25°C ≈ 10 kΩ). Reemplazar si está fuera de especificación.',
    partes: ['Sensor NTC de temperatura interior'],
  },
  {
    codigo: 'F2',
    equivalentes: 'E2T, T2, coil temp sensor',
    descripcion: 'Error de sensor de temperatura del serpentín / evaporador interior',
    causas: [
      'Sensor NTC del evaporador en corto o circuito abierto',
      'Sensor desprendido del tubo del evaporador',
    ],
    solucion: 'Verificar que el sensor esté bien sujeto al tubo del evaporador. Medir resistencia del sensor. Reemplazar si está defectuoso.',
    partes: ['Sensor NTC de evaporador'],
  },
];

// ── CONGELADORES / NEVECONES ──────────────────────────────────────────────────
// Usan los mismos códigos que neveras en su mayoría
const CONGELADOR: CodigoError[] = NEVERA;
const NEVECON: CodigoError[] = NEVERA;
const MINIBAR: CodigoError[] = [
  ...NEVERA.slice(0, 4),
  {
    codigo: 'E8',
    equivalentes: 'Er 8',
    descripcion: 'Error de tarjeta o falla general en minibar electrónico',
    causas: ['Tarjeta de control defectuosa', 'Cortocircuito en carga'],
    solucion: 'Desconectar 10 minutos y reiniciar. Si persiste → revisar tarjeta de control.',
    partes: ['Tarjeta de control'],
  },
];

// ── VITRINAS ──────────────────────────────────────────────────────────────────
const VITRINA: CodigoError[] = [
  {
    codigo: 'E1',
    equivalentes: 'F1, T1',
    descripcion: 'Sensor de temperatura fuera de rango / lectura errática',
    causas: [
      'Sensor NTC suelto o en corto',
      'Cableado con corrosión por humedad',
      'Tarjeta de control con error en la lectura',
    ],
    solucion: 'Medir resistencia del sensor NTC a temperatura ambiente. Verificar conectores y continuidad hasta la tarjeta. Reemplazar sensor si está fuera de especificación; si persiste → revisar tarjeta.',
    partes: ['Sensor NTC', 'Cableado / conector', 'Tarjeta de control'],
  },
  {
    codigo: 'E2',
    equivalentes: 'C1, CP',
    descripcion: 'Unidad no enfría — compresor no arranca',
    causas: [
      'Falla en el relé de arranque o protector térmico',
      'Fuga de refrigerante o circuito bloqueado',
      'Problema en el motor del compresor',
    ],
    solucion: 'Verificar alimentación y continuidad del compresor. Medir protector/relé de arranque. Comprobar presiones del sistema y buscar fuga si la presión es baja. Reemplazar relé o compresor según diagnóstico.',
    partes: ['Relé/Protector de arranque', 'Compresor', 'Refrigerante (recarga)'],
  },
];

// ── DISPENSADORES ─────────────────────────────────────────────────────────────
const DISPENSADORES: CodigoError[] = [
  {
    codigo: 'dE1',
    equivalentes: 'DE1',
    descripcion: 'No dispensa agua',
    causas: [
      'Válvula de entrada de agua obstruida o defectuosa',
      'Filtro de línea taponado',
      'Baja presión de suministro',
    ],
    solucion: 'Verificar presión de suministro y filtros de entrada. Medir si la válvula recibe voltaje al activar el dispensador. Reemplazar válvula si tiene voltaje y no abre.',
    partes: ['Válvula de entrada', 'Filtro de línea', 'Kit de junta'],
  },
  {
    codigo: 'dE2',
    equivalentes: 'DE2',
    descripcion: 'No dispensa hielo',
    causas: [
      'Motor/cubeta de hielo atascada',
      'Sensor de nivel de hielo defectuoso',
      'Actuador del dispensador dañado',
    ],
    solucion: 'Retirar cubeta y verificar movimiento libre del motor. Medir continuidad del motor y del actuador. Reemplazar componente defectuoso; verificar sensores de bloqueo.',
    partes: ['Motor cubeta hielo', 'Actuador dispensador', 'Sensor de nivel'],
  },
];

// ── Tabla completa ────────────────────────────────────────────────────────────
export const CODIGOS_POR_EQUIPO: Record<EquipoTipo, CodigoError[]> = {
  nevera:        NEVERA,
  congelador:    CONGELADOR,
  nevecon:       NEVECON,
  minibar:       MINIBAR,
  lavadora:      LAVADORA,
  secadora:      SECADORA,
  aire:          AIRE,
  vitrina:       VITRINA,
  dispensadores: DISPENSADORES,
  otro:          [],
};

export function getCodigosError(tipo: EquipoTipo): CodigoError[] {
  return CODIGOS_POR_EQUIPO[tipo] ?? [];
}
