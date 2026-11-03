import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { useColors } from '@/hooks/useColors';

/**
 * Créditos de autoría que se muestran al final de la pantalla de inicio.
 */
export function AppFooter() {
  const c = useColors();

  return (
    <View style={styles.container}>
      <View style={[styles.divider, { backgroundColor: c.border }]} />
      <Text style={[styles.text, { color: c.mutedForeground }]}>
        Desarrollado por el área de soporte técnico de Kalley
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 28,
    alignItems: 'center',
    gap: 12,
  },
  divider: {
    height: 1,
    width: '55%',
  },
  text: {
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
    letterSpacing: 0.2,
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_400Regular' }),
  },
});
