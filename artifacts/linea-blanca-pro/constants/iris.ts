import IRIS_DATA from '@/constants/iris_codigos.json';
import type { EquipoTipo } from '@/types/diagnostico';

// ── Tipos y datos base ────────────────────────────────────────────────────────

export interface CodigoIris {
  codigo: string;        // "CI-5337"
  falla: string;         // Falla detallada (bilingüe)
  fallaPrincipal: string;
  repuesto: string;      // Repuesto o Solución
  tipoSolucion: string;
  sublinea: string;
}

const DATA = IRIS_DATA as CodigoIris[];

/** Sublíneas del Excel → EquipoTipo de la app. */
const SUBLINEA_TO_EQUIPO: Record<string, EquipoTipo[]> = {
  'Neveras Y Nevecones':    ['nevera', 'nevecon', 'minibar'],
  'Congeladores':           ['congelador', 'vitrina'],
  'Lavadoras':              ['lavadora'],
  'Lavadora/Secadora':      ['lavadora', 'secadora'],
  'Dispensadores De Agua':  ['dispensadores'],
  'Split':                  ['aire'],
};

/** Palabras clave de la sublínea para clasificar códigos sin sublinea conocida. */
const SUBLINEA_KEYWORDS: [RegExp, EquipoTipo[]][] = [
  [/nevera|nevecon|minibar|refri/i,   ['nevera', 'nevecon', 'minibar']],
  [/congelador|vitrina|freezer/i,     ['congelador', 'vitrina']],
  [/lavadora/i,                       ['lavadora']],
  [/secadora/i,                       ['secadora']],
  [/lavadora\/secadora/i,             ['lavadora', 'secadora']],
  [/dispensador/i,                    ['dispensadores']],
  [/split|aire/i,                     ['aire']],
];

function equiposDeSublinea(sublinea: string): EquipoTipo[] {
  const exact = SUBLINEA_TO_EQUIPO[sublinea];
  if (exact) return exact;
  for (const [re, equipos] of SUBLINEA_KEYWORDS) {
    if (re.test(sublinea)) return equipos;
  }
  return [];
}

function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

// ── Alias técnicos de los árboles → vocabulario de repuestos del IRIS ─────────
// Los árboles nombran los componentes con terminología técnica (IPM, SMPS,
// blocapuertas, optoacoplador...). Cada alias lleva una lista ordenada de
// candidatos con el vocabulario real de los códigos IRIS; se usa el primero
// que exista en la sublínea del equipo. El texto se compara normalizado.
const ALIAS_REPUESTO: [RegExp, string[]][] = [
  [/\b(modulo ipm|ipm|igbt|placa inverter|tarjeta inverter|modulo inverter|driver inverter)\b/, ['Tarjeta principal', 'Tarjeta motor']],
  [/\b(tarjeta display|ic display|microcontrolador|eeprom|smps|conmutador|varistor|regulador de 5 v|diodos de salida|triac|optoacoplador|ic driver|pcb|main board|programador|tarjeta principal)\b/, ['Tarjeta principal']],
  [/\b(rectificador de entrada|resistencia fusible|capacitores electroliticos)\b/, ['Tarjeta principal', 'Ajuste eléctrico']],
  [/\b(blocapuertas|bloqueapuertas|door lock|sistema bloqueo|seguro bloqueo|traba electronica)\b/, ['Sistema bloqueo puerta', 'Seguro bloqueo puerta']],
  [/\b(interruptor de puerta|door switch|interruptor de tapa|interruptor seguridad|micro.?switch|sensor de desbalanceo|sensor de impacto|interruptor de impacto)\b/, ['Interruptor seguridad de puerta', 'Interruptor de impacto', 'Sensor de impacto', 'interruptor de puerta', 'Interruptor']],
  [/\b(sensor hall|hall|sensor de posicion)\b/, ['Sensor magnético']],
  [/\b(motor inverter|motor de corriente continua|motor bldc|acoplamiento direct drive|direct drive)\b/, ['Motor', 'Motor de corriente continua']],
  [/\b(kit de engranajes|actuador|shifter|transmision)\b/, ['Sistema de transmisión', 'Transmisión']],
  [/\b(drain motor|guaya del freno|palanca del freno|freno de la tina)\b/, ['Sistema de transmisión', 'Ajuste mecánico']],
  [/\b(capacitores?|condensador de alto voltaje)\b/, ['Capacitor', 'Condensador de alto voltaje', 'Ajuste eléctrico']],
  [/\b(condensador o serpentin|serpentin|servicio de limpieza de condensador)\b/, ['Condensador o serpentín', 'Condensador del compresor']],
  [/\b(fusible|breaker)\b/, ['Fusible', 'Ajuste eléctrico']],
  [/\b(clavija|cable de poder)\b/, ['Cable de poder', 'Ajuste eléctrico']],
  [/\b(termostato de seguridad|hi.?limit|termostato de ciclo|klixon|termostato)\b/, ['Termostato', 'Control temperatura', 'Selector de temperatura']],
  [/\b(resistencia calefactora|elemento calefactor|resistencia de deshielo|ignitor|resistencia)\b/, ['Resistencia', 'Resistencia descongelador']],
  [/\b(rele de calefaccion|rele|kit ptc|protector termico)\b/, ['Relé PTC / Protector térmico', 'Kit Relé PTC', 'Tarjeta principal']],
  [/\b(soportes? de compresor|amortiguadores de compresor)\b/, ['Soporte compresor']],
  [/\b(temporizador)\b/, ['Temporizador de centrifugado', 'Tarjeta principal']],
  [/\b(arnes|cableado|terminales de alimentacion|juego de cables|conector)\b/, ['Arnés de cableado', 'Juego de cables', 'Cable de conexión entre unidades', 'Cableado de compresor']],
  [/\b(material de soldadura|soldadura|protector electrico|por etapa afectada)\b/, ['Ajuste eléctrico']],
  [/\b(empaques?|acoples?|abrazadera)\b/, ['Ajuste mecánico', 'Abrazadera goma', 'Abrazadera de la junta']],
  [/\b(goma puerta|junta de puerta|sello de puerta|empaque de puerta|anillo de junta)\b/, ['Goma puerta', 'Junta de puerta', 'Sello de puerta', 'Empaque o junta magnetica de la puerta']],
  [/\b(compresor inverter|compresor)\b/, ['Compresor']],
  [/\b(refrigerante|carga de refrigerante|deteccion de fugas|recarga de gas|ajuste de presion)\b/, ['Reparación de fuga y recarga de gas', 'Ajuste de presión del gas', 'Cambio de producto con intervención en el sistema de refrigeración']],
  [/\b(valvula de gas)\b/, ['Valvula de alta presion', 'Valvula de baja presion']],
  [/\b(valvula de (agua )?caliente)\b/, ['Válvula de agua caliente', 'Válvula entrada de agua caliente']],
  [/\b(valvula de (agua )?fria|electrovalvula)\b/, ['Válvula de agua fría', 'Válvula entrada de agua fria', 'Electroválvula']],
  [/\b(filtros? de aire)\b/, ['Filtro de aire', 'Filtros', 'Filtro unidad interior']],
  [/\b(compuerta de aire)\b/, ['Aspa', 'Rejilla horizontal']],
  [/\b(blower wheel|ventilador de circulacion|motor con ventilador)\b/, ['Motor con ventilador', 'Motor aspas', 'Aspa', 'Aspas de flujo cruzado', 'Motor']],
  [/\b(sensor de ambiente|sensor de tuberia|termistor|ntc|sensor de temperatura|sensor de nivel|sensor)\b/, ['Sensor de temperatura', 'Sensor de ambiente', 'Sensor de tubería', 'Sensor', 'Sensor combinado']],
  [/\b(selector de temperatura)\b/, ['Selector de temperatura', 'Ajuste eléctrico']],
  [/\b(teclado|membrana|panel tactil)\b/, ['Botones de configuración', 'Tarjeta principal']],
  [/\b(suspension|amortiguador|resorte)\b/, ['Suspensión', 'Amortiguador', 'Amortiguador/dámper']],
  [/\b(dispensador detergente|gaveta|diverter)\b/, ['Dispensador detergente', 'Compartimiento dispensador', 'Tapa dispensador']],
];

/** Devuelve los candidatos IRIS del primer alias que coincida con el texto. */
function candidatosPorAlias(texto: string): string[] {
  const t = normalize(texto);
  if (!t) return [];
  for (const [re, candidatos] of ALIAS_REPUESTO) {
    if (re.test(t)) return candidatos;
  }
  return [];
}

// ── Índices de búsqueda ───────────────────────────────────────────────────────

interface IndexedEntry {
  entry: CodigoIris;
  equipos: EquipoTipo[];
  haystack: string; // texto normalizado para búsqueda por palabras
}

const INDEX: IndexedEntry[] = DATA.map((entry) => ({
  entry,
  equipos: equiposDeSublinea(entry.sublinea),
  haystack: normalize([entry.falla, entry.fallaPrincipal, entry.repuesto, entry.tipoSolucion].join(' ')),
}));

/** Registro rápido por repuesto normalizado (para mapeo directo solución → código). */
const BY_REPUESTO = new Map<string, CodigoIris[]>();
for (const { entry } of INDEX) {
  const key = normalize(entry.repuesto);
  const list = BY_REPUESTO.get(key) ?? [];
  list.push(entry);
  BY_REPUESTO.set(key, list);
}

// ── API pública ───────────────────────────────────────────────────────────────

/** Todos los códigos IRIS de un tipo de equipo. */
export function getIrisPorEquipo(tipo: EquipoTipo): CodigoIris[] {
  if (tipo === 'otro') return DATA;
  return INDEX
    .filter((e) => e.equipos.includes(tipo))
    .map((e) => e.entry);
}

/**
 * Sugiere códigos IRIS para una conclusión de diagnóstico, según la sublínea
 * del equipo y la solución dada (repuesto, conclusión y repuestos solicitados).
 *
 * Estrategia:
 * 1. Prioriza SIEMPRE los códigos de la misma sublínea del equipo:
 *    a. Coincidencia exacta del repuesto dado.
 *    b. Coincidencia parcial del repuesto ("compresor" ↔ "Compresor y/o filtro secador").
 *    c. Palabras clave de la solución dada contra falla, repuesto y tipo de solución.
 * 2. Si faltan sugerencias, completa con coincidencias exactas de otras sublíneas.
 * 3. Si nada coincide, devuelve códigos de la misma sublínea.
 */
interface Coincidencia {
  entry: CodigoIris;
  score: number;
}

function buscarEn(entries: CodigoIris[], opciones: Parameters<typeof sugerirCodigosIris>[1]): Coincidencia[] {
  const resultados = new Map<string, Coincidencia>();
  const set = new Set(entries);

  const push = (entry: CodigoIris, score: number) => {
    const prev = resultados.get(entry.codigo);
    if (!prev || prev.score < score) resultados.set(entry.codigo, { entry, score });
  };

  const textoLibre = normalize(
    [
      opciones.repuesto ?? '',
      opciones.conclusion ?? '',
      opciones.repuestosSolicitados ?? '',
      opciones.tipoSolucion ?? '',
    ].join(' '),
  );

  // a. Coincidencia exacta de repuesto/solución
  if (opciones.repuesto) {
    const key = normalize(opciones.repuesto);
    for (const entry of BY_REPUESTO.get(key) ?? []) {
      if (set.has(entry)) push(entry, 100);
    }
  }

  // b. Coincidencia parcial del repuesto
  if (opciones.repuesto) {
    const key = normalize(opciones.repuesto);
    if (key.length >= 4) {
      for (const entry of entries) {
        const rep = normalize(entry.repuesto);
        if (rep && rep !== key && (rep.includes(key) || key.includes(rep))) {
          push(entry, 80);
        }
      }
    }
  }

  // c. Búsqueda por palabras clave (mínimo 4 letras)
  const keywords = [...new Set(textoLibre.split(/[^a-z0-9ñ]+/).filter((w) => w.length >= 4))];
  if (keywords.length > 0) {
    for (const e of INDEX) {
      if (!set.has(e.entry)) continue;
      let score = 0;
      for (const kw of keywords) {
        if (e.haystack.includes(kw)) score += 10;
      }
      if (score > 0) push(e.entry, score);
    }
  }

  return [...resultados.values()];
}

export function sugerirCodigosIris(
  tipo: EquipoTipo,
  opciones: {
    repuesto?: string;
    conclusion?: string;
    repuestosSolicitados?: string;
    tipoSolucion?: string;
  },
  limite = 6,
): CodigoIris[] {
  const mismaLinea = getIrisPorEquipo(tipo);
  const ordenar = (a: Coincidencia, b: Coincidencia) =>
    b.score - a.score || a.entry.codigo.localeCompare(b.entry.codigo);

  // 1. Códigos de la misma sublínea
  const propios = buscarEn(mismaLinea, opciones).sort(ordenar);
  if (propios.length >= limite) {
    return propios.slice(0, limite).map((r) => r.entry);
  }

  // 2. Completar con coincidencias de otras sublíneas (solo repuesto exacto/parcial)
  const codigosPropios = new Set(mismaLinea.map((e) => e.codigo));
  const otras = buscarEn(
    DATA.filter((e) => !codigosPropios.has(e.codigo)),
    { repuesto: opciones.repuesto },
  ).sort(ordenar);

  const combinados = [...propios, ...otras];
  if (combinados.length > 0) {
    return combinados.slice(0, limite).map((r) => r.entry);
  }

  // 3. Fallback: códigos de la misma sublínea
  return mismaLinea.slice(0, limite);
}

/**
 * Devuelve el mejor código IRIS de la sublínea del equipo para un repuesto
 * dado (el repuesto que se sugiere cambiar). Orden: coincidencia exacta del
 * repuesto > coincidencia parcial > palabras clave. Devuelve undefined si no
 * hay ninguna relación razonable.
 */
export function getIrisParaRepuesto(tipo: EquipoTipo, repuesto: string): CodigoIris | undefined {
  const texto = normalize(repuesto);
  if (!texto) return undefined;

  const porLinea = getIrisPorEquipo(tipo);

  // Coincidencia exacta del repuesto en la misma sublínea
  const exacta = porLinea.find((e) => normalize(e.repuesto) === texto);
  if (exacta) return exacta;

  // Coincidencia parcial ("compresor" ↔ "Compresor y/o filtro secador")
  const parcial = porLinea.find((e) => {
    const rep = normalize(e.repuesto);
    return rep && rep !== texto && (rep.includes(texto) || texto.includes(rep));
  });
  if (parcial) return parcial;

  // Alias técnicos: los árboles nombran los componentes con terminología
  // técnica (IPM, blocapuertas, SMPS...); se resuelven al vocabulario real
  // del IRIS dentro de la sublínea del equipo.
  for (const candidato of candidatosPorAlias(repuesto)) {
    const clave = normalize(candidato);
    const hit = porLinea.find((e) => normalize(e.repuesto) === clave);
    if (hit) return hit;
  }

  // Palabras clave del repuesto contra falla + repuesto + tipo de solución (misma sublínea)
  const keywords = [...new Set(texto.split(/[^a-z0-9ñ]+/).filter((w) => w.length >= 4))];
  if (keywords.length === 0) return undefined;
  let mejor: { entry: CodigoIris; score: number } | undefined;
  for (const e of INDEX) {
    if (!e.equipos.includes(tipo)) continue;
    let score = 0;
    for (const kw of keywords) {
      if (e.haystack.includes(kw)) score += 10;
    }
    if (score > 0 && (!mejor || score > mejor.score)) mejor = { entry: e.entry, score };
  }
  return mejor?.entry;
}

/** Busca un código IRIS exacto por su identificador ("CI-5337"). */
export function getIrisPorCodigo(codigo: string): CodigoIris | undefined {
  const key = normalize(codigo);
  return DATA.find((e) => normalize(e.codigo) === key);
}

/**
 * Código IRIS genérico de la sublínea del equipo (Ajuste eléctrico o Ajuste
 * mecánico) para repuestos de árbol sin coincidencia directa. Garantiza que
 * todo repuesto con defecto quede ligado a un código IRIS en la conclusión
 * y en el reporte DOCX final.
 */
export function getIrisGenerico(tipo: EquipoTipo, repuesto?: string): CodigoIris | undefined {
  const porLinea = getIrisPorEquipo(tipo);
  if (porLinea.length === 0) return DATA[0];
  const mecanico = repuesto
    ? /rodamiento|correa|transmision|suspension|amortiguador|puerta|empaque|junta|tina|manguera|filtro|perilla|pata|rueda|bisagra|manija|canastilla|gaveta|ducto|levas|guaya|serpentin/.test(normalize(repuesto))
    : false;
  const clave = mecanico ? 'ajuste mecanico' : 'ajuste electrico';
  return porLinea.find((e) => normalize(e.repuesto) === clave) ?? porLinea[0];
}
