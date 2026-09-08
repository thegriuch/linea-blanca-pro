import React, { useState } from 'react';
import {
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { useDiagnostico } from '@/contexts/DiagnosticoContext';
import { ProbabilityBar } from '@/components/ProbabilityBar';
import { EmptyState } from '@/components/EmptyState';
import { getEquipoInfo } from '@/constants/equipos';
import { shareReport } from '@/utils/share';
import colors from '@/constants/colors';

function fmt(d: string | undefined): string {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('es-CO', {
    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export default function ResultadoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const c = useColors();
  const insets = useSafeAreaInsets();
  const { getSession } = useDiagnostico();
  const [sharing, setSharing] = useState(false);

  const session = getSession(id);

  if (!session) {
    return <EmptyState icon="file-text" title="Reporte no encontrado" description="Este diagnóstico no está disponible." />;
  }

  const equipo = getEquipoInfo(session.equipo.tipo);
  const { cliente, conclusion, result, evidence } = session;

  const handleShare = async () => {
    setSharing(true);
    try {
      await shareReport(session);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido.';
      Alert.alert('No se pudo generar el DOCX', message);
    } finally {
      setSharing(false);
    }
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: c.background }}
      contentContainerStyle={{ paddingBottom: Platform.OS === 'web' ? 34 : insets.bottom + 40 }}
    >
      {/* Header banner */}
      <View style={[styles.banner, { backgroundColor: equipo.color }]}>
        <View style={[styles.bannerIcon, { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 14 }]}>
          <Feather name={equipo.icon as keyof typeof Feather.glyphMap} size={28} color="#FFF" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.bannerTitle}>{equipo.label}</Text>
          <Text style={styles.bannerSub}>
            {session.equipo.marca}{session.equipo.modelo ? ` ${session.equipo.modelo}` : ''}
          </Text>
          <Text style={styles.bannerSub}>{fmt(session.finishedAt)}</Text>
          <Text style={styles.bannerSub}>ID: {session.id}</Text>
        </View>
        <TouchableOpacity
          onPress={handleShare}
          disabled={sharing}
          style={[styles.shareBtn, { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 10 }]}
        >
          <Feather name="share-2" size={18} color="#FFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.body}>
        {/* Client info */}
        <View style={[styles.section, { backgroundColor: c.card, borderColor: c.border, borderRadius: colors.radius }]}>
          <Text style={[styles.sectionTitle, { color: c.primary }]}>Cliente</Text>
          <InfoRow label="Nombre" value={cliente.nombre || '—'} c={c} />
          <InfoRow label="Teléfono" value={cliente.telefono || '—'} c={c} />
          <InfoRow label="Ciudad" value={cliente.ciudad || '—'} c={c} />
          <InfoRow label="Técnico" value={session.tecnico || '—'} c={c} />
        </View>

        {/* Equipment info */}
        <View style={[styles.section, { backgroundColor: c.card, borderColor: c.border, borderRadius: colors.radius }]}>
          <Text style={[styles.sectionTitle, { color: c.primary }]}>Equipo</Text>
          <InfoRow label="Tipo" value={equipo.label} c={c} />
          <InfoRow label="Marca" value={session.equipo.marca || '—'} c={c} />
          <InfoRow label="Modelo" value={session.equipo.modelo || '—'} c={c} />
          <InfoRow label="Serie" value={session.equipo.serie || '—'} c={c} />
          <InfoRow label="Falla reportada" value={session.equipo.fallaLabel || '—'} c={c} />
        </View>

        {/* Probabilistic diagnosis */}
        {result && result.causes.length > 0 && (
          <View>
            <Text style={[styles.groupTitle, { color: c.foreground }]}>Diagnóstico con probabilidades</Text>
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
                <Feather name="info" size={15} color={c.primary} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.recLabel, { color: c.primary }]}>Recomendación técnica</Text>
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

        {/* Conclusion */}
        {conclusion.diagnostico && (
          <View style={[styles.section, { backgroundColor: c.card, borderColor: c.border, borderRadius: colors.radius }]}>
            <Text style={[styles.sectionTitle, { color: c.primary }]}>Conclusión técnica</Text>
            <Text style={[styles.conclusionText, { color: c.foreground }]}>{conclusion.diagnostico}</Text>
            {conclusion.repuestos && <InfoRow label="Repuestos" value={conclusion.repuestos} c={c} />}
            {conclusion.tiempoEstimado && <InfoRow label="Tiempo estimado" value={conclusion.tiempoEstimado} c={c} />}
            {conclusion.observaciones && <InfoRow label="Observaciones" value={conclusion.observaciones} c={c} />}
          </View>
        )}

        {/* Evidence photos */}
        {evidence.length > 0 && (
          <View>
            <Text style={[styles.groupTitle, { color: c.foreground }]}>
              Evidencia fotográfica ({evidence.length})
            </Text>
            <View style={styles.photoGrid}>
              {evidence.map((ev, i) => (
                <View key={ev.id} style={[styles.photoWrap, { borderRadius: colors.radius, borderColor: c.border }]}>
                  <Image source={{ uri: ev.uri }} style={[styles.photo, { borderRadius: colors.radius }]} />
                  {ev.nodeText && (
                    <Text style={[styles.photoCaption, { color: c.mutedForeground }]} numberOfLines={2}>
                      {ev.nodeText}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Share button */}
        <TouchableOpacity
          onPress={handleShare}
          disabled={sharing}
          activeOpacity={0.75}
          style={[styles.shareFullBtn, { backgroundColor: c.primary, borderRadius: colors.radius }]}
        >
          <Feather name="share-2" size={18} color={c.primaryForeground} />
          <Text style={[styles.shareFullBtnText, { color: c.primaryForeground }]}>
            {sharing ? 'Preparando DOCX...' : 'Compartir reporte DOCX'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function InfoRow({ label, value, c }: { label: string; value: string; c: ReturnType<typeof useColors> }) {
  return (
    <View style={styles.infoRow}>
      <Text style={[styles.infoLabel, { color: c.mutedForeground }]}>{label}</Text>
      <Text style={[styles.infoValue, { color: c.foreground }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 20,
    paddingTop: 24,
  },
  bannerIcon: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_700Bold' }),
  },
  bannerSub: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 12,
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_400Regular' }),
  },
  shareBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    padding: 16,
    gap: 12,
  },
  section: {
    padding: 14,
    borderWidth: 1,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_700Bold' }),
  },
  groupTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
    marginTop: 4,
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_700Bold' }),
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '500',
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_500Medium' }),
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_600SemiBold' }),
  },
  conclusionText: {
    fontSize: 13,
    lineHeight: 19,
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_400Regular' }),
  },
  recBox: {
    flexDirection: 'row',
    gap: 10,
    padding: 12,
    marginTop: 4,
    alignItems: 'flex-start',
  },
  recLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 2,
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_700Bold' }),
  },
  recText: {
    fontSize: 12,
    lineHeight: 17,
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_400Regular' }),
  },
  partsBox: {
    padding: 12,
    gap: 6,
    marginTop: 4,
  },
  partsTitle: {
    fontSize: 12,
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
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  photoWrap: {
    width: '47%',
    borderWidth: 1,
    overflow: 'hidden',
  },
  photo: {
    width: '100%',
    height: 120,
  },
  photoCaption: {
    fontSize: 10,
    padding: 6,
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_400Regular' }),
  },
  shareFullBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 16,
    marginTop: 8,
  },
  shareFullBtnText: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_600SemiBold' }),
  },
});
