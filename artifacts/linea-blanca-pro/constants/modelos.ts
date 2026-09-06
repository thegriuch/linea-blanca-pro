/**
 * Línea Blanca Pro — Modelos de referencia por tipo de equipo
 * Lista de modelos comunes en el mercado colombiano.
 */
import type { EquipoTipo } from '@/types/diagnostico';

export const MODELOS_POR_EQUIPO: Record<EquipoTipo, string[]> = {
  nevera: [
    'K-NT245',
    'K-NT332',
    'K-NT332A',
    'K-N187L',
    'K-N187L2',
    'K-N187L2GO',
    'Otro modelo',
  ],
  congelador: [
    'K-CH99LI',
    'K-CH99L2',
    'K-CH100L',
    'K-CH142L',
    'K-CH142L2',
    'K-CH145L',
    'K-CH198L',
    'K-CH194LIB-G',
    'K-CH198L02',
    'K-CH198L3',
    'K-CH200L',
    'K-CH200L2',
    'K-CH293L',
    'K-CH293LI',
    'K-CH295L02',
    'K-CH418L',
    'K-CH508',
    'Otro modelo',
  ],
  nevecon: [
    'K-N362L4',
    'K-N439L2',
    'K-N529L2',
    'Otro modelo',
  ],
  minibar: [
    'K-MB43G',
    'K-MB45G02',
    'K-MB47R-N-R',
    'K-MB93G',
    'K-MB43RN',
    'Otro modelo',
  ],
  lavadora: [
    'K-LD10G',
    'K-LD12G',
    'K-LD12GE',
    'K-LD14G',
    'K-LD14GE',
    'K-LD16GE',
    'K-LD18G-B',
    'K-LD18G2-B2',
    'K-LAVSA5B',
    'K-LAVSA7B',
    'K-LDT10B',
    'K-LDT10B1',
    'K-LDT13',
    'Otro modelo',
  ],
  secadora: [
    'K-LAVSE12GO',
    'K-LS14',
    'K-LS15',
    'Otro modelo',
  ],
  aire: [
    'K-A12D',
    'K-A12B',
    'K-AC12P',
    'Otro modelo',
  ],
  vitrina: [
    'K-SC211L',
    'K-SC211L2',
    'K-SC211L3',
    'K-SC309L',
    'K-SC309L2',
    'K-SC416L',
    'K-SCH254L',
    'KVH254L',
    'Otro modelo',
  ],
  dispensadores: [
    'K-DAG',
    'K-DAG2',
    'K-DARN',
    'K-WD15B2',
    'K-WD15C',
    'K-WD15KR',
    'K-WD5K',
    'K-WDLL15',
    'K-DABN',
    'Otro modelo',
  ],
  otro: [
    'No aplica / Desconocido',
    'Otro modelo',
  ],
};

export function getModelos(tipo: EquipoTipo): string[] {
  return MODELOS_POR_EQUIPO[tipo] ?? ['Otro modelo'];
}
