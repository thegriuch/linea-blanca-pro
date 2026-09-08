import React, { useEffect, useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import { useColors } from '@/hooks/useColors';
import { useDiagnostico } from '@/contexts/DiagnosticoContext';
import { PrimaryButton } from '@/components/PrimaryButton';
import { FormField } from '@/components/FormField';
import { ProbabilityBar } from '@/components/ProbabilityBar';
import colors from '@/constants/colors';

export default function ConclusionScreen() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const { currentSession, setConclusion, completeSession } = useDiagnostico();
  const [isFinishing, setIsFinishing] = useState(false);

  useEffect(() => {
    if (!currentSession) {
      router.replace('/diagnostico/nuevo');
    }
  }, [currentSession]);

  if (!currentSession) {
    return null;
  }

  const { result, conclusion, equipo, evidence } = currentSession;

  const handleFinish = async () => {
    setIsFinishing(true);
    try {
      const completed = completeSession();
      if (completed) {
        router.replace(`/diagnostico/resultado/${completed.id}` as any);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido.';
      Alert.alert('No se pudo guardar el reporte', message);
    } finally {
      setIsFinishing(false);
    }
  };

  return (
    <KeyboardAwareScrollViewCompat
      style={{ flex: 1, backgroundColor: c.background }}
      contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 40 }}
    >
      {/* Probabilistic result */}
      {result && result.causes.length > 0 && (
        <View style={{ marginBottom: 24 }}>
          <Text style={[styles.sectionTitle, { color: c.foreground }]}>
            Diagnóstico con probabilidades
          </Text>
          {result.causes.map((cause, i) => (
            <ProbabilityBar
              key={i}
              rank={i + 1}
              cause={cause.cause}
              probability={cause.probability}
              action={cause.action}
            />
          ))}
          {result.recommendation && (
            <View style={[styles.recBox, { backgroundColor: c.secondary, borderRadius: colors.radius }]}>
              <Feather name="info" size={16} color={c.primary} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.recTitle, { color: c.primary }]}>Recomendación</Text>
                <Text style={[styles.recText, { color: c.secondaryForeground }]}>{result.recommendation}</Text>
              </View>
            </View>
          )}
          {result.parts && result.parts.length > 0 && (
            <View style={[styles.partsBox, { backgroundColor: c.muted, borderRadius: colors.radius }]}>
              <Text style={[styles.partsTitle, { color: c.foreground }]}>Repuestos posibles</Text>
              {result.parts.map((p, i) => (
                <View key={i} style={styles.partRow}>
                  <Feather name="package" size={13} color={c.accent} />
                  <Text style={[styles.partText, { color: c.foreground }]}>{p}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      {/* Evidence summary */}
      {evidence.length > 0 && (
        <View style={[styles.evidenceSummary, { backgroundColor: c.card, borderColor: c.border, borderRadius: colors.radius }]}>
          <Feather name="camera" size={16} color={c.primary} />
          <Text style={[styles.evidenceText, { color: c.foreground }]}>
            {evidence.length} foto{evidence.length !== 1 ? 's' : ''} de evidencia registrada{evidence.length !== 1 ? 's' : ''}
          </Text>
        </View>
      )}

      {/* Conclusion form */}
      <Text style={[styles.sectionTitle, { color: c.foreground }]}>Conclusión técnica</Text>
      <FormField
        label="Diagnóstico definitivo"
        value={conclusion.diagnostico}
        onChangeText={(v) => setConclusion({ diagnostico: v })}
        placeholder="Describe el problema encontrado y la solución aplicada..."
        multiline
      />
      <FormField
        label="Repuestos solicitados"
        value={conclusion.repuestos}
        onChangeText={(v) => setConclusion({ repuestos: v })}
        placeholder="Compresor, kit PTC, filtro secante..."
      />
      <FormField
        label="Tiempo estimado de reparación"
        value={conclusion.tiempoEstimado}
        onChangeText={(v) => setConclusion({ tiempoEstimado: v })}
        placeholder="2 horas, 1 día..."
      />
      <FormField
        label="Observaciones adicionales"
        value={conclusion.observaciones}
        onChangeText={(v) => setConclusion({ observaciones: v })}
        placeholder="Notas para el cliente o el equipo..."
        multiline
      />

      <View style={styles.actions}>
        <PrimaryButton
          label="Guardar reporte y ver resumen"
          icon="check-circle"
          onPress={handleFinish}
          loading={isFinishing}
        />
        <Text style={[styles.saveHint, { color: c.mutedForeground }]}>
          El reporte quedará guardado en Historial y podrás compartir el DOCX después.
        </Text>
        <View style={{ height: 10 }} />
        <PrimaryButton label="Volver al árbol" variant="outline" onPress={() => router.back()} />
      </View>
    </KeyboardAwareScrollViewCompat>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 14,
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_700Bold' }),
  },
  recBox: {
    flexDirection: 'row',
    gap: 10,
    padding: 14,
    marginTop: 4,
    alignItems: 'flex-start',
  },
  recTitle: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_700Bold' }),
  },
  recText: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_400Regular' }),
  },
  partsBox: {
    padding: 14,
    marginTop: 10,
    gap: 6,
  },
  partsTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_700Bold' }),
  },
  partRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  partText: {
    fontSize: 13,
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_400Regular' }),
  },
  evidenceSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  evidenceText: {
    fontSize: 13,
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_400Regular' }),
  },
  actions: {
    marginTop: 8,
  },
  saveHint: {
    fontSize: 12,
    lineHeight: 17,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 10,
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_400Regular' }),
  },
});
