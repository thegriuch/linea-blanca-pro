import React, { useEffect, useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import { useColors } from '@/hooks/useColors';
import { useDiagnostico } from '@/contexts/DiagnosticoContext';
import { sugerirCodigosIris, getIrisParaRepuesto, getIrisGenerico, type CodigoIris } from '@/constants/iris';
import { PrimaryButton } from '@/components/PrimaryButton';
import { FormField } from '@/components/FormField';
import { ProbabilityBar } from '@/components/ProbabilityBar';
import colors from '@/constants/colors';

export default function ConclusionScreen() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const { currentSession, setConclusion, completeSession } = useDiagnostico();
  const [isFinishing, setIsFinishing] = useState(false);
  const [mostrarIris, setMostrarIris] = useState(false);

  useEffect(() => {
    if (!currentSession) {
      router.replace('/diagnostico/nuevo');
    }
  }, [currentSession]);

  if (!currentSession) {
    return null;
  }

  const { result, conclusion: conclusionRaw, equipo, evidence } = currentSession;
  // Defensa: sesiones restauradas de versiones anteriores pueden llegar sin
  // codigosIris (u otros campos); normalizar evita el crash en probabilidades.
  const conclusion = {
    ...conclusionRaw,
    codigosIris: Array.isArray(conclusionRaw?.codigosIris) ? conclusionRaw.codigosIris : [],
  };

  // Sugerencias IRIS según sublínea (tipo de equipo), conclusión y repuestos escritos
  const irisSugeridos: CodigoIris[] = sugerirCodigosIris(equipo.tipo, {
    conclusion: conclusion.diagnostico,
    repuestosSolicitados: conclusion.repuestos,
    repuesto: result?.parts?.[0],
  });

  // Cada repuesto sugerido por el árbol, vinculado SIEMPRE con su código IRIS
  // de la sublínea (fallback genérico Ajuste eléctrico/mecánico si no hay
  // coincidencia directa).
  const partesConIris: { parte: string; iris?: CodigoIris }[] = (result?.parts ?? []).map((parte) => ({
    parte,
    iris: getIrisParaRepuesto(equipo.tipo, parte) ?? getIrisGenerico(equipo.tipo, parte),
  }));
  const codigosDePartes = [
    ...new Set(partesConIris.map((p) => p.iris?.codigo).filter(Boolean) as string[]),
  ];
  const partesSinVincular = codigosDePartes.filter((codigo) => !conclusion.codigosIris.includes(codigo));

  const vincularPartes = () => {
    if (partesSinVincular.length === 0) return;
    setConclusion({ codigosIris: [...conclusion.codigosIris, ...partesSinVincular] });
  };

  const toggleIris = (codigo: string) => {
    const tiene = conclusion.codigosIris.includes(codigo);
    setConclusion({
      codigosIris: tiene
        ? conclusion.codigosIris.filter((c2) => c2 !== codigo)
        : [...conclusion.codigosIris, codigo],
    });
  };

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

  const handleFinishToHome = async () => {
    setIsFinishing(true);
    try {
      const completed = completeSession();
      if (completed) {
        router.replace('/(tabs)');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido.';
      Alert.alert('No se pudo finalizar el diagnóstico', message);
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
              {partesConIris.map(({ parte, iris }, i) => (
                <View key={i} style={styles.partRow}>
                  <Feather name="package" size={13} color={c.accent} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.partText, { color: c.foreground }]}>{parte}</Text>
                    {iris && (
                      <Text style={[styles.partIrisText, { color: c.primary }]} numberOfLines={2}>
                        IRIS {iris.codigo} → {iris.repuesto} · {iris.tipoSolucion}
                      </Text>
                    )}
                  </View>
                </View>
              ))}
              {partesSinVincular.length > 0 && (
                <TouchableOpacity
                  onPress={vincularPartes}
                  activeOpacity={0.75}
                  style={[styles.partLinkBtn, { borderColor: c.primary, borderRadius: colors.radius }]}
                >
                  <Feather name="link" size={14} color={c.primary} />
                  <Text style={[styles.partLinkText, { color: c.primary }]}>
                    Vincular {partesSinVincular.length} repuesto{partesSinVincular.length !== 1 ? 's' : ''} con su IRIS
                  </Text>
                </TouchableOpacity>
              )}
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

      {/* Códigos IRIS */}
      <Text style={[styles.sectionTitle, { color: c.foreground }]}>Código IRIS</Text>
      <Text style={[styles.irisHint, { color: c.mutedForeground }]}>
        Selecciona el código IRIS que corresponde a la falla diagnosticada y a la solución aplicada;
        los repuestos sugeridos por el árbol ya aparecen vinculados a su código.
        La ficha completa de cada código irá en el reporte final.
      </Text>

      {conclusion.codigosIris.length > 0 && (
        <View style={[styles.irisSelectedBox, { backgroundColor: c.secondary, borderRadius: colors.radius }]}>
          <Feather name="check-circle" size={15} color={c.primary} />
          <Text style={[styles.irisSelectedText, { color: c.secondaryForeground }]}>
            {conclusion.codigosIris.join(' · ')}
          </Text>
        </View>
      )}

      <TouchableOpacity
        onPress={() => setMostrarIris((v) => !v)}
        activeOpacity={0.75}
        style={[styles.irisToggle, { borderColor: c.primary, borderRadius: colors.radius }]}
      >
        <Feather name="list" size={17} color={c.primary} />
        <Text style={[styles.irisToggleText, { color: c.primary }]}>
          {mostrarIris ? 'Ocultar códigos sugeridos' : `Ver códigos IRIS sugeridos (${irisSugeridos.length})`}
        </Text>
        <Feather name={mostrarIris ? 'chevron-up' : 'chevron-down'} size={16} color={c.primary} />
      </TouchableOpacity>

      {mostrarIris && (
        <View style={{ gap: 8, marginBottom: 16 }}>
          {irisSugeridos.length === 0 && (
            <Text style={[styles.irisHint, { color: c.mutedForeground }]}>
              Escribe la conclusión o los repuestos para generar sugerencias.
            </Text>
          )}
          {irisSugeridos.map((iris) => {
            const sel = conclusion.codigosIris.includes(iris.codigo);
            return (
              <TouchableOpacity
                key={iris.codigo}
                onPress={() => toggleIris(iris.codigo)}
                activeOpacity={0.75}
                style={[styles.irisItem, {
                  backgroundColor: sel ? c.primary + '10' : c.card,
                  borderColor: sel ? c.primary : c.border,
                  borderRadius: colors.radius,
                }]}
              >
                <View style={[styles.irisBadge, { backgroundColor: c.primary, borderRadius: 7 }]}>
                  <Text style={styles.irisBadgeText}>{iris.codigo}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.irisFalla, { color: c.foreground }]} numberOfLines={1}>
                    {iris.falla}
                  </Text>
                  <Text style={[styles.irisSolucion, { color: c.mutedForeground }]} numberOfLines={2}>
                    {iris.repuesto} · {iris.tipoSolucion}
                  </Text>
                </View>
                <Feather
                  name={sel ? 'check-circle' : 'circle'}
                  size={18}
                  color={sel ? c.primary : c.mutedForeground}
                />
              </TouchableOpacity>
            );
          })}
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
        <PrimaryButton
          label="Finalizar diagnóstico y volver al menú"
          icon="home"
          variant="outline"
          onPress={handleFinishToHome}
          loading={isFinishing}
        />
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
  irisHint: {
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 10,
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_400Regular' }),
  },
  irisSelectedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    marginBottom: 10,
  },
  irisSelectedText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_700Bold' }),
  },
  irisToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 13,
    borderWidth: 1.5,
    marginBottom: 12,
  },
  irisToggleText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_700Bold' }),
  },
  irisItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderWidth: 1,
  },
  irisBadge: {
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  irisBadgeText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_700Bold' }),
  },
  irisFalla: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_600SemiBold' }),
  },
  irisSolucion: {
    fontSize: 11,
    lineHeight: 15,
    marginTop: 2,
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
  partIrisText: {
    fontSize: 11,
    lineHeight: 15,
    marginTop: 2,
    fontWeight: '600',
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_600SemiBold' }),
  },
  partLinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderWidth: 1,
  },
  partLinkText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_600SemiBold' }),
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
