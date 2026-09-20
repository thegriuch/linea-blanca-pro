/**
 * Línea Blanca Pro — Tabla de códigos de error por tipo de electrodoméstico
 * Los códigos pueden variar ligeramente por modelo — siempre confirmar con el manual del equipo.
 */
import type { EquipoTipo } from '@/types/diagnostico';
import { CODIGOS_AIRE_MANUAL } from '@/constants/codigos_aire_manual';

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
    codigo: 'E1',
    equivalentes: 'E10',
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
    codigo: 'E2',
    equivalentes: 'E21',
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
    codigo: 'E4',
    equivalentes: 'E40',
    descripcion: 'Carga desbalanceada — el tambor no puede centrifugar de forma segura',
    causas: [
      'Ropa concentrada en un solo lado del tambor',
      'Pieza de ropa grande (colchón, cobija) que no puede distribuirse',
      'Lavadora sin nivelar correctamente',
      'Amortiguadores de suspensión desgastados',
      'Resortes de suspensión flojos o rotos',
    ],
    solucion: 'Abrir la puerta, redistribuir la ropa manualmente y reiniciar el ciclo. Si persiste con carga normal → verificar nivelación con nivel de burbuja y ajustar las patas. Si vibra excesivamente → revisar amortiguadores y resortes de suspensión.',
    partes: ['Amortiguadores de suspensión', 'Resortes de suspensión', 'Switch de impacto'],
  },
  {
    codigo: 'E3',
    equivalentes: 'E30 (door lock)',
    descripcion: 'Error de puerta/tapa — el equipo no detecta que la puerta está cerrada',
    causas: [
      'Desbalance del producto',
      'Puerta o tapa no cerrada completamente',
      'Interruptor de seguridad de puerta (door switch) defectuoso',
      'Traba electrónica de puerta (door lock) averiada',
      'Lengüeta de puerta rota o deformada',
    ],
    solucion: 'Verificar que la puerta cierra completamente con clic. Medir continuidad del interruptor de puerta (debe cambiar estado al cerrar). Verificar que el solenoide de la traba electrónica recibe voltaje y traba. Revisar la lengua plástica de la puerta. Verificar nivelacion del tambor, no de la lavadora.',
    partes: ['Interruptor de puerta / door switch', 'Traba electrónica / door lock'],
  },
  {
    codigo: 'E7',
    equivalentes: 'No tiene',
    descripcion: 'Error de Frenado de giro',
    causas: [
      'Retractor dañado',
      'Freno o clutch dañado',
      'PCB Con defecto en el envio de señales',
    ],
    solucion: 'Verficar el rettractor, Verificar conexiones estables. Verificar continuidad del freno o clutch. Si persiste el error, reemplazar PCB.',
    partes: ['Freno o Clutch', 'Retractor', 'PCB'],
  },
  {
    codigo: 'F8',
    equivalentes: 'E33',
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
    codigo: 'FD',
    equivalentes: 'No tiene',
    descripcion: 'Falla por bloqueo en voltaje en cerradura electronica',
    causas: [
      'Cerradura electronica dañada',
      'Cables rotos o sin continuidad',
      'Terminales de la cerradura dañados o sulfatados',
      'Daño mecanico en la cerradura',
      'Daño en PCB',
    ],
    solucion: 'Verificar si el espétillo esta defectuoso o si hay una interferencia. Verificar continuidad de los cables. Verificar que la cerradura recibe voltaje y funciona correctamente. Si persiste el error, reemplazar la cerradura y/o PCB.',
    partes: ['Door lock', 'PCB'],
  },
   {
    codigo: 'C8',
    equivalentes: 'E61, E62, E64',
    descripcion: 'Falla entre tarjeta inverter y tarjeta PCB',
    causas: [
      'Falla de contactos desde PCB',
      'Falla por daños en PCB',
      'Tarjeta inverter no reconoce las señales',
      'MCableado sin continuidad',
    ],
    solucion: 'Reconectar la tarjeta PCB a la tarjeta inverter, revisar las conexiones y el cableado (continuidad de los cables). Verificar que en los conectores no hayan sulfataciones. Verificar que estén llegando los 120V +/- 10% a la tarjeta motor. Si persiste el error, reemplazar la tarjeta PCB y/o Tarjeta inverter.',
    partes: ['PCB', 'Tarjeta inverter'],
  },
];

// ── SECADORAS ─────────────────────────────────────────────────────────────────
// Códigos específicos de secadoras (secado, calefacción, flujo de aire y motor).
const SECADORA: CodigoError[] = [
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
    equivalentes: 'E22,',
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
    partes: ['Amortiguadores de suspensión', 'Resortes de suspensión', 'Switch de impacto'],
  },
   {
    codigo: 'E30',
    equivalentes: 'E3 (door lock)',
    descripcion: 'Error de puerta/tapa — el equipo no detecta que la puerta está cerrada',
    causas: [
      'Desbalance del producto',
      'Puerta o tapa no cerrada completamente',
      'Interruptor de seguridad de puerta (door switch) defectuoso',
      'Traba electrónica de puerta (door lock) averiada',
      'Lengüeta de puerta rota o deformada',
    ],
    solucion: 'Verificar que la puerta cierra completamente con clic. Medir continuidad del interruptor de puerta (debe cambiar estado al cerrar). Verificar que el solenoide de la traba electrónica recibe voltaje y traba. Revisar la lengua plástica de la puerta. Verificar nivelacion del tambor, no de la lavadora.',
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
   {
    codigo: 'E60',
    equivalentes: 'E61, E62, E64',
    descripcion: 'El motor no esta girando, despues de intentar arrancar varias veces, la tarjeta inverter del motor detecta que el motor no gira',
    causas: [
      'Falla de contactos desde PCB',
      'Falla por daños en PCB',
      'Tarjeta inverter del motor no reconoce las señales',
      'Motor dañado',
    ],
    solucion: 'Reconectar la tarjeta PCB al motor, revisar las conexiones y el cableado (continuidad de los cables). Verificar que en los conectores no hayan sulfataciones. Verificar que estén llegando los 120V +/- 10% al motor. Si persiste el error, reemplazar la tarjeta PCB y/o el motor.',
    partes: ['Motor de lavado'],
  },
   {
    codigo: 'E80',
    equivalentes: 'No tiene',
    descripcion: 'No se detecta comunicacion entre tarjeta PCB y tarjeta display',
    causas: [
      'Conectores sulfatados o conectores sin contacto',
      'Cableado dañado, sin continuidad',
      'Tarjeta PCB y/o tarjeta display dañadas',
    ],
    solucion: 'Verificar conexiones y continuidad de los cables. Revisar que no haya sulfataciones en los conectores. Verificar entradas y salidas de las tarjetas PCB y Display. Si persiste el error, reemplazar la tarjeta PCB y/o tarjeta display.',
    partes: ['Tarjeta Display y/o PCB'],
  },
];

// ── NEVERAS / REFRIGERADORES ──────────────────────────────────────────────────
const NEVERA: CodigoError[] = [
  {
    codigo: '1 Flash',
    equivalentes: 'F1, 1F, Er F1, E1',
    descripcion: 'Error de sensor de temperatura del compartimento de refrigeración',
    causas: [
      'Sensor NTC del compartimento de refrigeración en circuito abierto o corto',
      'Conector del sensor suelto o con corrosión',
      'Tarjeta principal con falla en la lectura del sensor',
    ],
    solucion: 'Desconectar y medir el sensor NTC (Ver tabla de valores del sensor NTC). Verificar continuidad del cableado hasta la tarjeta. Limpiar conectores. Si el valor del sensor está fuera de rango → reemplazar sensor.',
    partes: ['Sensor NTC de refrigerador', 'Tarjeta principal'],
  },
  {
    codigo: '2 Flash',
    equivalentes: 'F2, 2F, Er F2, E2',
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
    codigo: '3 Flash',
    equivalentes: 'F3, 3F, E3, amb. sensor',
    descripcion: 'Error de sensor ambiental / sensor de temperatura exterior',
    causas: [
      'Sensor NTC ambiental en circuito abierto o corto',
      'Sensor expuesto a fuente de calor que da lectura incorrecta',
    ],
    solucion: 'Localizar el sensor ambiental (generalmente en la parte superior del gabinete o en el panel de control). Medir resistencia a temperatura ambiente. Reemplazar si está fuera de especificación.',
    partes: ['Sensor NTC ambiental'],
  },
  {
    codigo: '4 Flash',
    equivalentes: 'F4, 4F, defrost sensor, E4',
    descripcion: 'Error de sensor de descongelamiento',
    causas: [
      'Sensor de deshielo (defrost sensor) en corto o circuito abierto',
      'Termostato de deshielo pegado (siempre abierto)',
    ],
    solucion: 'Medir el sensor de deshielo (debe cambiar resistencia con temperatura). Verificar el termostato de deshielo (bimetálico — debe cerrar a temperatura baja). Revisar si hay formación excesiva de escarcha en el evaporador.',
    partes: ['Sensor de deshielo', 'Termostato de deshielo'],
  },
  {
    codigo: '5 Flash',
    equivalentes: 'F5, 5F, fan motor freezer, E5',
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

];

// ── AIRES ACONDICIONADOS ──────────────────────────────────────────────────────
const AIRE: CodigoError[] = [
 {
    codigo: 'EC07',
    descripcion: 'Velocidad del ventilador DC exterior fuera de control',
    causas: ['Motor o ventilador DC exterior defectuoso o bloqueado', 'Conector o cableado del motor', 'Alimentación o realimentación anormal', 'PCB exterior o circuito de control del ventilador'],
    solucion: 'Apagar el equipo y verificar que el ventilador gire libremente. Inspeccionar conectores y cableado. Comprobar alimentación y señal del motor según el manual. Si motor y cableado son correctos, revisar la PCB exterior.',
    partes: ['Motor del ventilador exterior', 'PCB exterior'],
  },
  {
    codigo: 'EC51',
    descripcion: 'Error de EEPROM de la unidad exterior',
    causas: ['EEPROM o PCB exterior defectuosa', 'Fallo de alimentación o comunicación interna de la PCB', 'Datos de memoria corruptos'],
    solucion: 'Desenergizar y reiniciar según el tiempo indicado por el manual. Revisar alimentación y conectores de la PCB. Si el código permanece, confirmar la PCB correspondiente.',
    partes: ['EEPROM', 'PCB exterior'],
  },
  {
    codigo: 'EC52',
    descripcion: 'Sensor de temperatura de serpentín del condensador T3 abierto o en corto',
    causas: ['Sensor T3 abierto o cortocircuitado', 'Conector flojo u oxidado', 'Cableado dañado', 'PCB exterior'],
    solucion: 'Inspeccionar sensor y conector. Medir su resistencia y compararla con la tabla del modelo y la temperatura real. Comprobar la continuidad del cableado hasta la PCB.',
    partes: ['Sensor T3', 'PCB exterior'],
  },
  {
    codigo: 'EC53',
    descripcion: 'Sensor de temperatura ambiente exterior T4 abierto o en corto',
    causas: ['Sensor T4 defectuoso', 'Cableado o conector', 'PCB exterior'],
    solucion: 'Medir la resistencia del T4 a temperatura conocida y compararla con la curva especificada por Midea. Revisar continuidad y conectores.',
    partes: ['Sensor T4', 'PCB exterior'],
  },
  {
    codigo: 'EC54',
    descripcion: 'Sensor de temperatura de descarga del compresor TP abierto o en corto',
    causas: ['Sensor TP defectuoso', 'Sensor mal instalado sobre la tubería', 'Cableado o conector', 'PCB exterior'],
    solucion: 'Inspeccionar la posición y fijación del sensor. Medir su resistencia según la tabla del modelo y revisar el cableado hasta la PCB.',
    partes: ['Sensor TP', 'PCB exterior'],
  },
  {
    codigo: 'EC56',
    descripcion: 'Sensor T2B de la unidad exterior fuera de rango',
    causas: ['Sensor T2B', 'Conector o cableado', 'PCB exterior'],
    solucion: 'Inspeccionar la conexión, medir la resistencia y compararla con la tabla del modelo. Comprobar continuidad y revisar la PCB si la entrada permanece anormal.',
    partes: ['Sensor T2B', 'PCB exterior'],
  },
  {
    codigo: 'ECC1',
    descripcion: 'Otro sensor de refrigerante de unidad interior detecta fuga (multizona)',
    causas: ['Fuga real', 'Sensor de refrigerante defectuoso o fuera de calibración', 'Conexión del sensor', 'Circuito de control'],
    solucion: 'Ventilar y detener el equipo cuando el refrigerante pueda ser inflamable. Inspeccionar conexiones y circuito frigorífico, comprobar el sensor según el manual y buscar la fuga antes de recargar.',
    partes: ['Sensor de refrigerante', 'Material de reparación de fuga'],
  },
  {
    codigo: 'EH00',
    descripcion: 'Fallo EEPROM de la unidad interior',
    causas: ['EEPROM o PCB interior', 'Alimentación inestable', 'Fallo de memoria'],
    solucion: 'Desenergizar y reiniciar según el manual. Revisar alimentación y conectores. Si persiste, verificar la PCB interior.',
    partes: ['EEPROM', 'PCB interior'],
  },
  {
    codigo: 'EH02',
    descripcion: 'Error de detección de cruce por cero',
    causas: ['Alimentación anormal', 'Circuito de detección de la PCB', 'Conectores o cableado', 'PCB interior'],
    solucion: 'Medir la alimentación AC, revisar conexiones y comprobar el circuito de detección según el procedimiento de servicio.',
    partes: ['PCB interior', 'Filtro de línea'],
  },
  {
    codigo: 'EH03',
    descripcion: 'Velocidad del ventilador interior fuera de control',
    causas: ['Motor interior', 'Rodete bloqueado o sucio', 'Conector o cableado', 'Señal de realimentación', 'PCB'],
    solucion: 'Comprobar giro libre y suciedad, inspeccionar conectores y verificar alimentación y señal del motor según el modelo.',
    partes: ['Motor del ventilador interior', 'PCB interior'],
  },
  {
    codigo: 'EH0A',
    descripcion: 'Error de parámetros EEPROM de la unidad interior',
    causas: ['Datos EEPROM corruptos', 'PCB interior', 'Configuración incompatible'],
    solucion: 'Reiniciar, comprobar compatibilidad y configuración de la PCB, y consultar el procedimiento de actualización o reemplazo del modelo.',
    partes: ['EEPROM', 'PCB interior'],
  },
  {
    codigo: 'EH0B',
    descripcion: 'Error de comunicación entre PCB principal y display interior',
    causas: ['Cable de comunicación', 'Conectores', 'PCB principal', 'Tarjeta display'],
    solucion: 'Apagar y reiniciar, revisar cableado y conectores, y probar la PCB principal y el display según el flujo del modelo.',
    partes: ['Cable de comunicación', 'PCB principal', 'Tarjeta display'],
  },
  {
    codigo: 'EH3A',
    descripcion: 'Protección por tensión DC baja del módulo de ventilador externo',
    causas: ['Fuente o alimentación del módulo', 'Bus DC bajo', 'Cableado o conectores', 'Módulo o PCB del ventilador'],
    solucion: 'Verificar alimentación y conectores, medir el bus DC con el procedimiento seguro del fabricante e inspeccionar el módulo.',
    partes: ['Módulo de ventilador externo', 'PCB del ventilador'],
  },
  {
    codigo: 'EH3B',
    descripcion: 'Fallo por tensión DC alta del módulo de ventilador externo',
    causas: ['Fuente o rectificación anormal', 'Circuito de bus DC', 'PCB o módulo del ventilador'],
    solucion: 'Comprobar alimentación y bus DC con seguridad, revisar conectores y PCB. No manipular capacitores sin comprobar su descarga.',
    partes: ['Módulo de ventilador externo', 'PCB del ventilador'],
  },
  {
    codigo: 'EH3C',
    descripcion: 'Anomalía del módulo o motor de aire fresco o su realimentación',
    causas: ['Motor o módulo de aire fresco', 'Cableado o señal de realimentación', 'PCB'],
    solucion: 'Comprobar conectores, verificar funcionamiento y señal del módulo, y revisar la PCB si la señal es correcta.',
    partes: ['Módulo de aire fresco', 'PCB'],
  },
  {
    codigo: 'EH60',
    descripcion: 'Sensor de temperatura ambiente interior T1 abierto o en corto',
    causas: ['Sensor T1', 'Cableado o conector', 'PCB'],
    solucion: 'Medir la resistencia del T1 a temperatura conocida y compararla con la tabla del modelo. Comprobar continuidad y revisar la PCB si corresponde.',
    partes: ['Sensor T1', 'PCB interior'],
  },
  {
    codigo: 'EH61',
    descripcion: 'Sensor de temperatura de tubería o serpentín interior T2 abierto o en corto',
    causas: ['Sensor T2', 'Montaje del sensor', 'Cableado o conector', 'PCB'],
    solucion: 'Verificar la posición del sensor, medir su resistencia según la tabla del modelo y comprobar continuidad.',
    partes: ['Sensor T2', 'PCB interior'],
  },
  {
    codigo: 'EH62',
    descripcion: 'Anomalía del sensor o módulo de aire fresco o entrada de temperatura, según plataforma',
    causas: ['Sensor o módulo correspondiente', 'Cableado o conector', 'PCB'],
    solucion: 'Identificar el modelo exacto, consultar su tabla de códigos, inspeccionar conectores y medir el sensor o señal indicada.',
    partes: ['Sensor o módulo de aire fresco', 'PCB'],
  },
  {
    codigo: 'EHB3',
    descripcion: 'Fallo de comunicación entre controlador cableado y unidad principal',
    causas: ['Cableado del controlador', 'Conectores o polaridad', 'Controlador cableado', 'PCB interior'],
    solucion: 'Revisar continuidad, polaridad y conexiones. Comprobar alimentación del controlador y probar controlador o PCB según el procedimiento.',
    partes: ['Controlador cableado', 'Cableado', 'PCB interior'],
  },
  {
    codigo: 'EHBA',
    descripcion: 'Fallo de comunicación entre módulo de ventilador externo y unidad interior',
    causas: ['Cableado o señal del módulo', 'Motor o módulo externo', 'PCB interior o del módulo'],
    solucion: 'Inspeccionar conectores, verificar alimentación y señal de realimentación y comprobar el módulo del ventilador.',
    partes: ['Módulo de ventilador externo', 'PCB interior'],
  },
  {
    codigo: 'EHBE',
    descripcion: 'Error de comunicación entre radar y display o fallo del radar',
    causas: ['Cable de comunicación', 'Radar', 'Tarjeta display'],
    solucion: 'Revisar conectores y cableado, reiniciar según el manual y comprobar radar y display por separado.',
    partes: ['Radar', 'Tarjeta display', 'Cable de comunicación'],
  },
  {
    codigo: 'EHC1',
    descripcion: 'Sensor de refrigerante detecta fuga',
    causas: ['Fuga real', 'Sensor activado por concentración de refrigerante', 'Conexiones, serpentín o tubería', 'Fallo del sensor después de descartar fuga'],
    solucion: 'Detener el equipo y ventilar cuando corresponda. Buscar y reparar la fuga, comprobar sensor y conexiones y verificar estanqueidad antes de operar.',
    partes: ['Sensor de refrigerante', 'Material de reparación de fuga'],
  },
  {
    codigo: 'EHC2',
    descripcion: 'Sensor fuera de rango y además se detecta condición de fuga',
    causas: ['Fuga real', 'Sensor fuera de rango', 'Cableado o conector', 'PCB'],
    solucion: 'Tratar como evento de fuga, inspeccionar el circuito frigorífico, comprobar sensor y cableado y seguir el procedimiento del modelo.',
    partes: ['Sensor de refrigerante', 'Material de reparación de fuga', 'PCB'],
  },
  {
    codigo: 'EHC3',
    descripcion: 'Sensor de refrigerante fuera de rango',
    causas: ['Sensor defectuoso', 'Cableado o conector', 'PCB interior'],
    solucion: 'Revisar la conexión sensor-PCB, comprobar alimentación y señal según el manual y sustituir el sensor como prueba controlada.',
    partes: ['Sensor de refrigerante', 'PCB interior'],
  },
  {
    codigo: 'EL01',
    descripcion: 'Fallo de comunicación entre unidad interior y exterior',
    causas: ['Cable de comunicación', 'Polaridad o conexiones', 'Alimentación', 'PCB interior o exterior'],
    solucion: 'Desenergizar antes de intervenir, revisar cableado, terminales y continuidad, verificar alimentación de ambas unidades y comprobar las PCB.',
    partes: ['Cable de comunicación', 'PCB interior', 'PCB exterior'],
  },
  {
    codigo: 'EL0C',
    descripcion: 'Sistema con falta de refrigerante o detección de fuga',
    causas: ['Fuga', 'Carga insuficiente', 'Obstrucción o condición anormal similar', 'Sensor o algoritmo de detección'],
    solucion: 'Inspeccionar fugas, comprobar presiones y temperaturas según refrigerante y modelo, verificar carga por peso y revisar serpentines y flujo de aire.',
    partes: ['Refrigerante especificado', 'Filtro secante', 'Material de reparación de fuga'],
  },
  {
    codigo: 'FHCC',
    descripcion: 'Error del sensor de refrigerante',
    causas: ['Sensor', 'Cableado o conector', 'PCB'],
    solucion: 'Comprobar la conexión sensor-PCB, verificar alimentación y señal y probar el sensor según el manual.',
    partes: ['Sensor de refrigerante', 'PCB'],
  },
  {
    codigo: 'PC00',
    descripcion: 'Protección del módulo IPM o sobrecorriente IGBT',
    causas: ['IPM o IGBT', 'Compresor', 'Cableado del compresor', 'Ventilación o disipación térmica', 'PCB inverter'],
    solucion: 'Desenergizar y descargar capacitores antes de medir. Inspeccionar conexiones, aislamiento y bobinados del compresor y revisar IPM y disipador.',
    partes: ['IPM o IGBT', 'Compresor inverter', 'PCB inverter'],
  },
  {
    codigo: 'PC01',
    descripcion: 'Protección por tensión alta o baja',
    causas: ['Red eléctrica', 'Conexiones flojas', 'Fuente o rectificador', 'Bus DC', 'PCB inverter'],
    solucion: 'Medir la tensión de entrada con seguridad, revisar terminales y comprobar el bus DC según el manual. Si la alimentación es normal, diagnosticar la PCB inverter.',
    partes: ['Fuente o rectificador', 'PCB inverter'],
  },
  {
    codigo: 'PC02',
    descripcion: 'Protección por alta temperatura del compresor o IPM o condición de alta presión, según plataforma',
    causas: ['Falta de ventilación', 'Condensador sucio', 'Ventilador exterior', 'Sobrecarga de refrigerante', 'Restricción del circuito', 'Compresor sobrecalentado'],
    solucion: 'Verificar flujo de aire y limpieza del condensador, comprobar ventilador, medir temperaturas y presiones con el refrigerante correcto y revisar la protección térmica.',
    partes: ['Ventilador exterior', 'Compresor', 'PCB inverter'],
  },
  {
    codigo: 'PC03',
    descripcion: 'Protección de presión del sistema',
    causas: ['Fuga o carga insuficiente', 'Sobrecarga', 'Restricción', 'Flujo de aire insuficiente', 'Condiciones ambientales extremas', 'Compresor o válvula de expansión'],
    solucion: 'Medir la presión según refrigerante y modelo, comparar con las condiciones reales de operación y revisar temperaturas, flujo de aire, restricciones y fugas.',
    partes: ['Sensor de presión', 'Válvula de expansión', 'Filtro secante'],
  },
  {
    codigo: 'PC04',
    descripcion: 'Error del accionamiento inverter del compresor',
    causas: ['PCB inverter', 'IPM', 'Compresor', 'Cableado U/V/W', 'Alimentación DC'],
    solucion: 'Desenergizar y descargar capacitores. Revisar conexiones U/V/W, bobinados, aislamiento, IPM y PCB según el procedimiento.',
    partes: ['Compresor inverter', 'IPM', 'PCB inverter'],
  },
  {
    codigo: 'PC08',
    descripcion: 'Protección por sobrecorriente',
    causas: ['Compresor', 'IPM o inverter', 'Tensión anormal', 'Cableado', 'Carga mecánica o frigorífica anormal'],
    solucion: 'Medir corriente si es seguro, comprobar tensión, revisar compresor e IPM y buscar una condición frigorífica anormal.',
    partes: ['Compresor inverter', 'IPM', 'PCB inverter'],
  },
  {
    codigo: 'PC0L',
    descripcion: 'Protección por baja temperatura ambiente exterior',
    causas: ['Temperatura ambiente realmente muy baja', 'Sensor T4 incorrecto', 'Condiciones fuera de especificación'],
    solucion: 'Medir la temperatura ambiente, compararla con la lectura de T4 y verificar el sensor si la lectura es incorrecta.',
    partes: ['Sensor T4'],
  },
  {
    codigo: 'PC40',
    descripcion: 'Fallo de comunicación entre control principal exterior y circuito o driver del compresor',
    causas: ['Cableado o conectores', 'PCB principal', 'Driver o IPM', 'Alimentación del circuito'],
    solucion: 'Inspeccionar conectores, verificar alimentación del driver y comprobar las señales de comunicación según el manual.',
    partes: ['Driver o IPM', 'PCB exterior', 'Cableado'],
  },
  {
    codigo: 'AP',
    descripcion: 'Modo AP o configuración de conexión Wi‑Fi',
    causas: ['Modo de configuración de red activo'],
    solucion: 'No es una falla. Completar o cancelar la configuración Wi‑Fi siguiendo el manual del equipo.',
  },
  {
    codigo: 'CL',
    descripcion: 'Recordatorio de limpieza del filtro',
    causas: ['Mantenimiento programado'],
    solucion: 'No es una falla. Limpiar el filtro y reiniciar el recordatorio según el manual.',
    partes: ['Filtro de aire'],
  },
  {
    codigo: 'DF',
    descripcion: 'Descongelamiento',
    causas: ['Ciclo de deshielo activo'],
    solucion: 'No es una falla. Esperar a que termine el ciclo de descongelamiento.',
  },
  {
    codigo: 'FC',
    descripcion: 'Enfriamiento forzado',
    causas: ['Modo de servicio o enfriamiento forzado activo'],
    solucion: 'No es una falla. Salir del modo forzado según el procedimiento del modelo.',
  },
  {
    codigo: 'SC',
    descripcion: 'Autolimpieza',
    causas: ['Función Self Clean activa'],
    solucion: 'No es una falla. Esperar a que finalice la autolimpieza.',
  },
  {
    codigo: 'CP',
    descripcion: 'Control remoto desactivado o función asociada',
    causas: ['Función o estado de operación activo según la plataforma'],
    solucion: 'No necesariamente es una falla. Confirmar la función en el manual del modelo y habilitar el control remoto si corresponde.',
  },
  {
    codigo: 'DE',
    descripcion: 'Señal de entrada DR',
    causas: ['Entrada DR activa o configuración del modelo'],
    solucion: 'No necesariamente es una falla. Verificar la configuración de la entrada DR y el procedimiento del modelo si el estado permanece.',
  },
  {
    codigo: 'FP',
    descripcion: 'Calefacción para temperatura ambiente inferior a 8 °C',
    causas: ['Función de protección o calefacción activa'],
    solucion: 'No es una falla por sí mismo. Confirmar la temperatura ambiente y esperar o salir de la función según el manual.',
  },
  {
    codigo: 'LP',
    descripcion: 'Protección por baja temperatura ambiente',
    causas: ['Temperatura exterior por debajo del rango de funcionamiento'],
    solucion: 'Es un estado de protección. Verificar las condiciones ambientales y el rango permitido por el modelo.',
  },
  {
    codigo: 'NF',
    descripcion: 'Recordatorio de reemplazo o limpieza de filtro',
    causas: ['Mantenimiento programado'],
    solucion: 'No es una falla. Limpiar o reemplazar el filtro y reiniciar el recordatorio según el manual.',
    partes: ['Filtro de aire'],
  },
  {
    codigo: '--',
    descripcion: 'Conflicto de modo entre unidades interiores',
    causas: ['Unidades multizona solicitando modos incompatibles'],
    solucion: 'No es necesariamente una falla. Revisar que las unidades interiores del sistema multizona no estén solicitando frío y calor simultáneamente.',
  },
];
const CONGELADOR: CodigoError[] = [
   {
    codigo: '1 Flash',
    equivalentes: 'F1, 1F, Er F1, E1',
    descripcion: 'Proteccion contra sobrecorriente, Aterrizaje a tierra',
    causas: [
      'Corto en alguna bobina del compresor',
      'Conectores suelto, aterrizados a tierra o con corrosión',
      'Tarjeta principal con falla Aterrizada a tierra',
    ],
    solucion: 'Desconectar y medir resistencia 2 de las 3 salidas UVW tiene que haber mas de 1MΩ, si no, cambio de PCB. Medir bobinas de compresor de 15Ω - 20Ω, si no, cambio de compresor',
    partes: ['Tarjeta inversora', 'Compresor'],
  },
  {
    codigo: '2 Flash',
    equivalentes: 'No tiene',
    descripcion: 'Proteccion contra sobretensiones',
    causas: [
      'Medicion de entrada de voltaje mayor a 132V (Para productos  funcionales a 120V)o 242V (Para productos  funcionales a 220V)',
      'Baja corriente, por novedades en las instalaciones electricas del sitio',
    ],
    solucion: 'Rechazo de garantia',
    partes: ['Ninguno'],
  },
  {
    codigo: '3 Flash',
    equivalentes: 'No tiene',
    descripcion: 'Proteccion contra subtensiones',
    causas: [
      'Medicion de entrada de voltaje menor a 109V (Para productos  funcionales a 120V) o 198V (Para productos  funcionales a 220V)',
      'Baja corriente, por novedades en las instalaciones electricas del sitio',
    ],
    solucion: 'Localizar el sensor ambiental (generalmente en la parte superior del gabinete o en el panel de control). Medir resistencia a temperatura ambiente. Reemplazar si está fuera de especificación.',
    partes: ['Sensor NTC ambiental'],
  },
  {

      codigo: '4 Flash',
    equivalentes: 'No tiene',
    descripcion: 'Proteccion contra sobrecorriente al IPM, Aterrizaje a tierra',
    causas: [
      'Corto en alguna bobina del compresor',
      'Conectores suelto, aterrizados a tierra o con corrosión',
      'Tarjeta principal con falla Aterrizada a tierra',
    ],
    solucion: 'Desconectar y medir resistencia 2 de las 3 salidas UVW tiene que haber mas de 1MΩ, si no, cambio de PCB. Medir bobinas de compresor de 15Ω - 20Ω, si no, cambio de compresor',
    partes: ['Tarjeta inversora', 'Compresor'],
  },
  {
    codigo: '5 Flash',
    equivalentes: 'No tiene',
    descripcion: 'Estrangulamiento de temperatura, compresor muy caliente',
    causas: [
      'Lubricacion deficiente en el compresor',
      'Si enfria pero deficientemente, es obstruccion',
    ],
    solucion: 'Validar obstrucciones en el sistema. Verificar ',
    partes: ['Motor ventilador evaporador', 'Tarjeta principal'],
  },
  {
   codigo: '6 Flash',
   equivalentes: 'No tiene',
   descripcion: 'Falta de protección de fase',
   causas: [
    'Arnés de cableado UVW desconectado o con mala conexión',
    'Resistencia infinita entre fases del compresor',
    'Obstrucción en el sistema de tuberías',
    'Falla en la placa del inversor',
  ],
  solucion:
    'Verificar la conexión del arnés UVW entre la placa inversora y el compresor. Medir la resistencia entre fases; si es infinita, reemplazar el compresor. Si persiste, reemplazar la placa del inversor.',
  partes: ['Arnés UVW', 'Compresor', 'Placa del inversor'],
},
{
  codigo: '7 Flash',
  equivalentes: 'No tiene',
  descripcion: 'Falla de polarización de voltaje',
  causas: [
    'Error temporal de alimentación o voltaje',
    'Falla interna en la placa del inversor',
  ],
  solucion:
    'Apagar y reiniciar el equipo. Si la falla continúa, reemplazar la placa del inversor.',
  partes: ['Placa del inversor'],
},
{
  codigo: '8 Flash',
  equivalentes: 'No tiene',
  descripcion: 'Protección contra pasos en falso',
  causas: [
    'Compresor dañado o sin respuesta',
    'Falla de arranque detectada por la placa inversora',
    'Falla en la placa del inversor',
  ],
  solucion:
    'Verificar la respuesta del compresor. Si no responde y el indicador parpadea, reemplazar el compresor. Si vibra al arrancar y entra en protección, reemplazar la placa del inversor.',
  partes: ['Compresor', 'Placa del inversor'],
},
{
   codigo: '9 Flash',
   equivalentes: 'No tiene',
   descripcion: 'Protección contra bloqueos de carrera',
   causas: [
    'Compresor bloqueado o dañado',
    'Compresor sin respuesta al arranque',
    'Falla en la placa del inversor',
  ],
   solucion:
    'Comprobar el funcionamiento del compresor. Si no responde y el indicador parpadea, reemplazar el compresor. Si vibra al iniciar y activa la protección, reemplazar la placa del inversor.',
  partes: ['Compresor', 'Placa del inversor'],
},
{
  codigo: '10 Flash',
  equivalentes: 'No tiene',
  descripcion:
    'Protección contra sobretemperatura y sobrepotencia de la placa de frecuencia variable',
  causas: [
    'Lubricación insuficiente en el compresor',
    'Obstrucción en el circuito de refrigeración',
    'Compresor trabajando con temperatura elevada',
  ],
  solucion:
    'Verificar la lubricación del compresor si el refrigerador aún enfría. Si no enfría, validar posibles obstrucciones en el circuito de refrigeración.',
  partes: ['Compresor', 'Placa del inversor', 'Sistema de refrigeración'],
},
{
  codigo: '11 Flash',
  equivalentes: 'No tiene',
  descripcion: 'Fallo de arranque',
  causas: [
    'Compresor dañado o sin respuesta',
    'Bloqueo durante el arranque del compresor',
    'Falla en la placa del inversor',
  ],
  solucion:
    'Revisar la respuesta del compresor al encender. Si no responde y el indicador parpadea, reemplazar el compresor. Si vibra al arrancar y se protege, reemplazar la placa del inversor.',
  partes: ['Compresor', 'Placa del inversor'],
},
{
  codigo: '12 Flash',
  equivalentes: 'No tiene',
  descripcion: 'Reducción de potencia y frecuencia',
  causas: [
    'Lubricación insuficiente en el compresor',
    'Obstrucción en el circuito de refrigeración',
    'Alta carga de trabajo del compresor',
  ],
  solucion:
    'Si el refrigerador enfría de forma deficiente, revisar la lubricación del compresor. Si no enfría, verificar obstrucciones en el circuito de refrigeración.',
  partes: ['Compresor', 'Placa del inversor', 'Sistema de refrigeración'],
},
{
  codigo: '13 Flash',
  equivalentes: 'No tiene',
  descripcion: 'Fallo de comunicación UART',
  causas: [
    'Cableado de comunicación desconectado o defectuoso',
    'Falla en la placa de control principal',
    'Falla en la placa del inversor',
  ],
  solucion:
    'Comprobar el cableado de comunicación entre la placa de control principal y la placa del inversor. Si está correcto, reemplazar la placa principal o la placa del inversor.',
  partes: [
    'Cableado de comunicación',
    'Tarjeta principal',
    'Placa del inversor',
  ],
},
]

NEVERA;
const DISPENSADORES: CodigoError[] = NEVERA;
const NEVECON: CodigoError[] = NEVERA;
const MINIBAR: CodigoError[] = NEVERA;

// ── VITRINAS ──────────────────────────────────────────────────────────────────
const VITRINA: CodigoError[] = CONGELADOR;

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

export interface CodigoErrorEncontrado extends CodigoError {
  equipoTipo: EquipoTipo;
}

function normalizeSearchText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function searchCodigosError(query: string): CodigoErrorEncontrado[] {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return [];

  return (Object.entries(CODIGOS_POR_EQUIPO) as [EquipoTipo, CodigoError[]][])
    .flatMap(([equipoTipo, codigos]) =>
      codigos.map((codigo) => ({ ...codigo, equipoTipo })),
    )
    .filter((codigo) => {
      const searchableText = normalizeSearchText([
        codigo.codigo,
        codigo.equivalentes ?? '',
        codigo.descripcion,
        ...codigo.causas,
        codigo.solucion,
      ].join(' '));
      return searchableText.includes(normalizedQuery);
    });
}
