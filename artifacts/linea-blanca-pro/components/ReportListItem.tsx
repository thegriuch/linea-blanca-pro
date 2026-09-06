import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { getEquipoInfo } from '@/constants/equipos';
import type { DiagnosticSession } from '@/types/diagnostico';
import colors from '@/constants/colors';

interface Props {
  session: DiagnosticSession;
  onPress: () => void;
}

export function ReportListItem({ session, onPress }: Props) {
  const c = useColors();
  const equipo = getEquipoInfo(session.equipo.tipo);
  const date = new Date(session.finishedAt ?? session.startedAt);
  const dateStr = date.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });
  const topCause = session.result?.causes[0]?.cause ?? session.conclusion.diagnostico ?? 'Diagnóstico en proceso';

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={[styles.card, { backgroundColor: c.card, borderColor: c.border, borderRadius: colors.radius }]}
    >
      <View style={[styles.iconWrap, { backgroundColor: equipo.color + '20', borderRadius: 10 }]}>
        <Feather name={equipo.icon as keyof typeof Feather.glyphMap} size={20} color={equipo.color} />
      </View>
      <View style={styles.info}>
        <Text style={[styles.cliente, { color: c.foreground }]} numberOfLines={1}>
          {session.cliente.nombre || 'Sin nombre'}
        </Text>
        <Text style={[styles.model, { color: c.mutedForeground }]} numberOfLines={1}>
          {equipo.label}{session.equipo.marca ? ` · ${session.equipo.marca}` : ''}{session.equipo.modelo ? ` ${session.equipo.modelo}` : ''}
        </Text>
        <Text style={[styles.falla, { color: c.primary }]} numberOfLines={1}>
          {session.equipo.fallaLabel || 'Falla no especificada'}
        </Text>
        <Text style={[styles.cause, { color: c.mutedForeground }]} numberOfLines={1}>
          {topCause}
        </Text>
      </View>
      <View style={styles.right}>
        <Text style={[styles.date, { color: c.mutedForeground }]}>{dateStr}</Text>
        {session.evidence.length > 0 && (
          <View style={styles.evidenceBadge}>
            <Feather name="camera" size={11} color={c.mutedForeground} />
            <Text style={[styles.evidenceCount, { color: c.mutedForeground }]}>{session.evidence.length}</Text>
          </View>
        )}
        <Feather name="chevron-right" size={16} color={c.mutedForeground} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    gap: 12,
  },
  iconWrap: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    gap: 2,
  },
  cliente: {
    fontSize: 15,
    fontWeight: '700',
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_700Bold' }),
  },
  model: {
    fontSize: 12,
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_400Regular' }),
  },
  falla: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_600SemiBold' }),
  },
  cause: {
    fontSize: 11,
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_400Regular' }),
  },
  right: {
    alignItems: 'flex-end',
    gap: 4,
  },
  date: {
    fontSize: 11,
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_400Regular' }),
  },
  evidenceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  evidenceCount: {
    fontSize: 11,
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_400Regular' }),
  },
});
