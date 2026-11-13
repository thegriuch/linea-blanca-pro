import React, { useState } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import colors from '@/constants/colors';

interface Props {
  cause: string;
  probability: number; // 0–100
  action?: string;
  rank: number;
}

export function ProbabilityBar({ cause, probability, action, rank }: Props) {
  const c = useColors();
  // La causa y la acción se pueden expandir para leerlas completas.
  const [expanded, setExpanded] = useState(false);
  const barColor =
    probability >= 70 ? c.destructive
    : probability >= 40 ? c.warning
    : c.success;

  return (
    <TouchableOpacity
      onPress={() => setExpanded((value) => !value)}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={expanded ? 'Contraer la causa y la acción' : 'Expandir la causa y la acción'}
      style={[styles.container, { backgroundColor: c.card, borderRadius: colors.radius, borderColor: c.border }]}
    >
      <View style={styles.header}>
        <View style={[styles.rankBadge, { backgroundColor: rank === 1 ? c.primary : c.muted }]}>
          <Text style={[styles.rank, { color: rank === 1 ? c.primaryForeground : c.mutedForeground }]}>
            #{rank}
          </Text>
        </View>
        <Text style={[styles.cause, { color: c.foreground }]} numberOfLines={expanded ? undefined : 2}>
          {cause}
        </Text>
        <Text style={[styles.percent, { color: barColor }]}>{probability}%</Text>
      </View>
      <View style={[styles.track, { backgroundColor: c.muted }]}>
        <View style={[styles.fill, { width: `${probability}%`, backgroundColor: barColor, borderRadius: 4 }]} />
      </View>
      {action && (
        <Text style={[styles.action, { color: c.mutedForeground }]} numberOfLines={expanded ? undefined : 3}>
          {action}
        </Text>
      )}
      <View style={styles.expandRow}>
        <Feather name={expanded ? 'chevron-up' : 'chevron-down'} size={14} color={c.primary} />
        <Text style={[styles.expandText, { color: c.primary }]}>
          {expanded ? 'Ver menos' : 'Ver completo'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  rankBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rank: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_700Bold' }),
  },
  cause: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_600SemiBold' }),
  },
  percent: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_700Bold' }),
  },
  track: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    height: 8,
  },
  action: {
    fontSize: 12,
    marginTop: 6,
    lineHeight: 16,
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_400Regular' }),
  },
  expandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    marginTop: 8,
  },
  expandText: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_700Bold' }),
  },
});
