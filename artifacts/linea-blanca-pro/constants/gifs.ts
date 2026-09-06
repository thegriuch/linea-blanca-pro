/**
 * Registro de GIFs ilustrativos almacenados en el código de la aplicación.
 *
 * Los GIFs muestran cómo se debe realizar cada validación del árbol de
 * diagnóstico. Se deben colocar físicamente en `assets/images/gifs/` y
 * referenciarlos aquí mediante `require()`. Al estar empaquetados vía
 * `require`, quedan almacenados en el bundle de la app (modo offline incluido).
 */

export interface GifRef {
  /** Clave semántica para asignar a los nodos del árbol. */
  key: string;
  /** Recurso empaquetado del GIF. */
  uri: number;
  /** Etiqueta corta de la validación mostrada. */
  label: string;
}

export const GIFS: GifRef[] = [
  {
    key: 'medir-voltaje',
    uri: require('@/assets/images/gifs/medir-voltaje.gif'),
    label: 'Medir voltaje con multímetro',
  },
  {
    key: 'medir-amperaje',
    uri: require('@/assets/images/gifs/medir-amperaje.gif'),
    label: 'Medir amperaje con pinza amperimétrica',
  },
  {
    key: 'medir-bobinas',
    uri: require('@/assets/images/gifs/medir-bobinas.gif'),
    label: 'Medir bobinas del compresor (C, S, R)',
  },
  {
    key: 'medir-continuidad-tierra',
    uri: require('@/assets/images/gifs/medir-continuidad-tierra.gif'),
    label: 'Medir continuidad a tierra',
  },
  {
    key: 'medir-ptc',
    uri: require('@/assets/images/gifs/medir-ptc.gif'),
    label: 'Medir kit PTC y protector térmico',
  },
  {
    key: 'manometros',
    uri: require('@/assets/images/gifs/manometros.gif'),
    label: 'Conectar y leer manómetros',
  },
  {
    key: 'prueba-vacio',
    uri: require('@/assets/images/gifs/prueba-vacio.gif'),
    label: 'Prueba de vacío con bomba',
  },
  {
    key: 'prueba-jabonosa',
    uri: require('@/assets/images/gifs/prueba-jabonosa.gif'),
    label: 'Prueba jabonosa para detectar fugas',
  },
  {
    key: 'barrido-nitrogeno',
    uri: require('@/assets/images/gifs/barrido-nitrogeno.gif'),
    label: 'Barrido con nitrógeno seco',
  },
  {
    key: 'carga-refrigerante',
    uri: require('@/assets/images/gifs/carga-refrigerante.gif'),
    label: 'Carga de refrigerante por peso',
  },
  {
    key: 'medir-presiones-marcha',
    uri: require('@/assets/images/gifs/medir-presiones-marcha.gif'),
    label: 'Verificar presiones con compresor en marcha',
  },
  {
    key: 'medir-señal-inverter',
    uri: require('@/assets/images/gifs/medir-señal-inverter.gif'),
    label: 'Medir señal AC del módulo Inverter (U, V, W)',
  },
  {
    key: 'medicion-compresor-kalley',
    uri: require('@/assets/images/gifs/medicion_compresor_kalley_animado.gif'),
    label: 'Medición del compresor (animación)',
  },
];

/** Mapa por clave → recurso GIF. */
export const GIF_MAP: Record<string, number> = Object.fromEntries(
  GIFS.map((g) => [g.key, g.uri]),
);

/** Devuelve el recurso GIF para una clave dada, o undefined si no existe. */
export function getGifUri(key?: string): number | undefined {
  if (!key) return undefined;
  return GIF_MAP[key];
}
