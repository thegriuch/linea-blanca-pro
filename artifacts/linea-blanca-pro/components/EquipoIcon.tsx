import React from 'react';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { getEquipoInfo } from '@/constants/equipos';
import type { EquipoTipo } from '@/types/diagnostico';

interface Props {
  tipo: EquipoTipo;
  size: number;
  color: string;
}

/** Renderiza el icono del tipo de equipo en la familia que corresponda. */
export function EquipoIcon({ tipo, size, color }: Props) {
  const equipo = getEquipoInfo(tipo);

  if (equipo.family === 'material') {
    return (
      <MaterialCommunityIcons
        name={equipo.icon as keyof typeof MaterialCommunityIcons.glyphMap}
        size={size}
        color={color}
      />
    );
  }

  return <Feather name={equipo.icon as keyof typeof Feather.glyphMap} size={size} color={color} />;
}
