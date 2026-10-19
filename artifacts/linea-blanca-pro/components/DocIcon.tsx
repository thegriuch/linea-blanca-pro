import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface Props {
  size?: number;
  color?: string;
}

/**
 * Icono de documento/reporte vectorial propio.
 * Reemplaza el glifo "file-text" de Feather, que a tamaños pequeños se ve
 * apretado y lavado (papel pequeño y líneas amontonadas).
 * Diseño relleno con recortes (fill-rule evenodd): el doblez y las líneas de
 * texto son agujeros que dejan ver el fondo, por lo que siempre hay contraste
 * en modo claro y oscuro sin conocer el color de fondo.
 */
export function DocIcon({ size = 24, color = '#000' }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        fill={color}
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8 2.75 H14.4 L19 7.35 V18.6 A2.65 2.65 0 0 1 16.35 21.25 H8 A2.65 2.65 0 0 1 5.35 18.6 V5.4 A2.65 2.65 0 0 1 8 2.75 Z
           M8.6 8 H15.4 V9.5 H8.6 Z
           M8.6 11.4 H15.4 V12.9 H8.6 Z
           M8.6 14.9 H13.4 V16.4 H8.6 Z"
      />
    </Svg>
  );
}
