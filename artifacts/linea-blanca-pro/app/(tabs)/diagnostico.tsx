import React from 'react';
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { useDiagnostico } from '@/contexts/DiagnosticoContext';
import { PrimaryButton } from '@/components/PrimaryButton';
import { getEquipoInfo } from '@/constants/equipos';
import colors from '@/constants/colors';

export default function DiagnosticoTab() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const { currentSession, discardSession } = useDiagnostico();
  const topPadding = Platform.OS === 'web' ? 67 : insets.top;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: c.background }}
      contentContainerStyle={{
        paddingTop: topPadding + 20,
        paddingHorizontal: 20,
        paddingBottom: Platform.OS === 'web' ? 34 + 84 : insets.bottom + 90,
      }}
    >
      <Text style={[styles.title, { color: c.foreground }]}>Diagnóstico</Text>
      <Text style={[styles.sub, { color: c.mutedForeground }]}>
        Diagnóstico guiado por árbol de decisión
      </Text>

      {/* Active session banner */}
      {currentSession && (
        <View style={[styles.activeBanner, { backgroundColor: c.primary + '15', borderColor: c.primary, borderRadius: colors.radius }]}>
          <View style={styles.activeBannerContent}>
            <Feather name="activity" size={18} color={c.primary} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.activeBannerTitle, { color: c.primary }]}>Diagnóstico en curso</Text>
              <Text style={[styles.activeBannerSub, { color: c.mutedForeground }]}>
                {getEquipoInfo(currentSession.equipo.tipo).label}
                {currentSession.equipo.fallaLabel ? ` · ${currentSession.equipo.fallaLabel}` : ''}
              </Text>
            </View>
          </View>
          <View style={styles.activeBannerActions}>
            <TouchableOpacity
              onPress={() => router.push('/diagnostico/arbol')}
              style={[styles.resumeBtn, { backgroundColor: c.primary, borderRadius: 10 }]}
            >
              <Text style={[styles.resumeBtnText, { color: c.primaryForeground }]}>Continuar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={discardSession}>
              <Text style={[styles.discardText, { color: c.destructive }]}>Descartar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* New diagnosis */}
      <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border, borderRadius: colors.radius }]}>
        <View style={[styles.cardIcon, { backgroundColor: '#145DA020', borderRadius: 16 }]}>
          <Feather name="plus-circle" size={32} color="#145DA0" />
        </View>
        <Text style={[styles.cardTitle, { color: c.foreground }]}>Nuevo Diagnóstico</Text>
        <Text style={[styles.cardDesc, { color: c.mutedForeground }]}>
          Selecciona el equipo y síntoma. El sistema te guiará paso a paso con preguntas diagnósticas, puntos de medición y recolección de evidencia.
        </Text>
        <PrimaryButton
          label="Iniciar diagnóstico"
          icon="arrow-right"
          onPress={() => router.push('/diagnostico/nuevo')}
        />
      </View>

      {/* Feature highlights */}
      <Text style={[styles.featTitle, { color: c.foreground }]}>¿Qué incluye el diagnóstico?</Text>
      {[
        { icon: 'git-branch', title: 'Árbol de decisión', desc: 'Flujo ramificado según tus respuestas. Cada respuesta afina el siguiente paso.' },
        { icon: 'camera', title: 'Evidencia fotográfica', desc: 'La app te pide fotos en los momentos clave del diagnóstico.' },
        { icon: 'bar-chart-2', title: 'Probabilidades', desc: 'Resultado con porcentaje de probabilidad por causa posible.' },
        { icon: 'file-text', title: 'Reporte exportable', desc: 'Genera y comparte un reporte técnico completo al finalizar.' },
      ].map((f) => (
        <View key={f.title} style={[styles.feature, { borderColor: c.border, borderRadius: colors.radius }]}>
          <View style={[styles.featureIcon, { backgroundColor: c.secondary, borderRadius: 10 }]}>
            <Feather name={f.icon as keyof typeof Feather.glyphMap} size={20} color={c.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.featureTitle, { color: c.foreground }]}>{f.title}</Text>
            <Text style={[styles.featureDesc, { color: c.mutedForeground }]}>{f.desc}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 4,
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_700Bold' }),
  },
  sub: {
    fontSize: 14,
    marginBottom: 20,
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_400Regular' }),
  },
  activeBanner: {
    borderWidth: 1,
    padding: 14,
    marginBottom: 16,
  },
  activeBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  activeBannerTitle: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_700Bold' }),
  },
  activeBannerSub: {
    fontSize: 12,
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_400Regular' }),
  },
  activeBannerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  resumeBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  resumeBtnText: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_600SemiBold' }),
  },
  discardText: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_600SemiBold' }),
  },
  card: {
    borderWidth: 1,
    padding: 20,
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  cardIcon: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_700Bold' }),
  },
  cardDesc: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_400Regular' }),
  },
  featTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_700Bold' }),
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
  },
  featureIcon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_600SemiBold' }),
  },
  featureDesc: {
    fontSize: 12,
    lineHeight: 17,
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_400Regular' }),
  },
});
