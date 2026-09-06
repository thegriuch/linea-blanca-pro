import type { EquipoTipo, EquipoTipoInfo } from '@/types/diagnostico';

export const EQUIPOS = [
  { id: 'nevera', label: 'Nevera / Refrigerador', icon: 'package', color: '#145DA0' },
  { id: 'congelador', label: 'Congelador', icon: 'box', color: '#1A77C9' },
  { id: 'nevecon', label: 'Nevecón', icon: 'server', color: '#0D4B8A' },
  { id: 'minibar', label: 'Minibar', icon: 'grid', color: '#2563EB' },
  { id: 'lavadora', label: 'Lavadora / Digital y Semi', icon: 'refresh-cw', color: '#0891B2' },
  { id: 'secadora', label: 'Lavadora / Secadora', icon: 'wind', color: '#0284C7' },
  { id: 'aire', label: 'Aire Acondicionado', icon: 'wind', color: '#047857' },
  { id: 'vitrina', label: 'Vitrina Refrigerante', icon: 'tool', color: '#64748B' },
  { id: 'dispensadores', label: 'Dispensador de agua', icon: 'tool', color: '#001e49' },
  { id: 'otro', label: 'Otro producto que utiliza refrigeracion', icon: 'tool', color: '#787a05' },
] as unknown as EquipoTipoInfo[];

export function getEquipoInfo(tipo: EquipoTipo): EquipoTipoInfo {
  return EQUIPOS.find((e) => e.id === tipo) ?? EQUIPOS[EQUIPOS.length - 1];
}
