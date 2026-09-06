import React from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { useDiagnostico } from '@/contexts/DiagnosticoContext';
import { ReportListItem } from '@/components/ReportListItem';
import colors from '@/constants/colors';

const QUICK_ACTIONS = [
  { icon: 'plus-circle' as const, label: 'Nuevo\nDiagnóstico', route: '/diagnostico/nuevo', color: '#145DA0' },
  { icon: 'search' as const, label: 'Buscar\nSíntoma', route: '/(tabs)/buscar', color: '#F5821F' },
  { icon: 'book-open' as const, label: 'Biblioteca\nTécnica', route: '/(tabs)/biblioteca', color: '#047857' },
  { icon: 'clock' as const, label: 'Ver\nHistorial', route: '/(tabs)/historial', color: '#7C3AED' },
  { icon: 'thermometer' as const, label: 'Regla de\nRefrigerantes', route: '/refrigerantes', color: '#0891B2' },
];

export default function HomeScreen() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const { sessions, tecnico } = useDiagnostico();
  const recent = sessions.slice(0, 3);
  const topPadding = Platform.OS === 'web' ? 67 : insets.top;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: c.background }}
      contentContainerStyle={{ paddingBottom: Platform.OS === 'web' ? 34 + 84 : insets.bottom + 90 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero */}
      <LinearGradient
        colors={['#0D4B8A', '#145DA0', '#1A77C9']}
        style={[styles.hero, { paddingTop: topPadding + 24 }]}
      >
        <View style={styles.heroContent}>
          <Text style={styles.heroGreeting}>
            {tecnico ? `Hola, ${tecnico.split(' ')[0]}` : 'Línea Blanca Pro'}
          </Text>
          <Text style={styles.heroTitle}>Diagnóstico{'\n'}Técnico Profesional</Text>
          <Text style={styles.heroSub}>v2.0 · Plataforma de diagnóstico guiado</Text>
        </View>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNum}>{sessions.length}</Text>
            <Text style={styles.statLabel}>Diagnósticos</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: 'rgba(255,255,255,0.3)' }]} />
          <View style={styles.statItem}>
            <Text style={styles.statNum}>12</Text>
            <Text style={styles.statLabel}>Árboles</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: 'rgba(255,255,255,0.3)' }]} />
          <View style={styles.statItem}>
            <Text style={styles.statNum}>5</Text>
            <Text style={styles.statLabel}>Líneas</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.body}>
        {/* Quick actions */}
        <Text style={[styles.sectionTitle, { color: c.foreground }]}>Acciones rápidas</Text>
        <View style={styles.quickGrid}>
          {QUICK_ACTIONS.map((a) => (
            <TouchableOpacity
              key={a.label}
              onPress={() => router.push(a.route as any)}
              activeOpacity={0.75}
              style={[styles.quickCard, { backgroundColor: c.card, borderColor: c.border, borderRadius: colors.radius }]}
            >
              <View style={[styles.quickIcon, { backgroundColor: a.color + '18', borderRadius: 12 }]}>
                <Feather name={a.icon} size={24} color={a.color} />
              </View>
              <Text style={[styles.quickLabel, { color: c.foreground }]}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent diagnoses */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: c.foreground }]}>Recientes</Text>
          {sessions.length > 3 && (
            <TouchableOpacity onPress={() => router.push('/(tabs)/historial')}>
              <Text style={[styles.seeAll, { color: c.primary }]}>Ver todos</Text>
            </TouchableOpacity>
          )}
        </View>
        {recent.length === 0 ? (
          <View style={[styles.emptyRecent, { backgroundColor: c.card, borderColor: c.border, borderRadius: colors.radius }]}>
            <Feather name="activity" size={28} color={c.mutedForeground} />
            <Text style={[styles.emptyRecentText, { color: c.mutedForeground }]}>
              Aún no hay diagnósticos.{'\n'}Comienza uno nuevo.
            </Text>
          </View>
        ) : (
          recent.map((s) => (
            <ReportListItem
              key={s.id}
              session={s}
              onPress={() => router.push(`/diagnostico/resultado/${s.id}` as any)}
            />
          ))
        )}

        {/* Info card */}
        <View style={[styles.infoCard, { backgroundColor: c.secondary, borderRadius: colors.radius }]}>
          <Feather name="info" size={18} color={c.primary} />
          <Text style={[styles.infoText, { color: c.secondaryForeground }]}>
            Sigue el árbol de decisión guiado para reducir errores de diagnóstico y generar reportes técnicos profesionales.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  hero: {
    paddingHorizontal: 20,
    paddingBottom: 28,
  },
  heroContent: {
    marginBottom: 20,
  },
  heroGreeting: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 14,
    marginBottom: 4,
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_500Medium' }),
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 34,
    marginBottom: 6,
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_700Bold' }),
  },
  heroSub: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_400Regular' }),
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 14,
    paddingVertical: 14,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNum: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_700Bold' }),
  },
  statLabel: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 11,
    marginTop: 2,
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_400Regular' }),
  },
  statDivider: {
    width: 1,
    height: '100%',
  },
  body: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 12,
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_700Bold' }),
  },
  seeAll: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_600SemiBold' }),
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickCard: {
    width: '47%',
    padding: 16,
    borderWidth: 1,
    alignItems: 'flex-start',
    gap: 10,
  },
  quickIcon: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickLabel: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_600SemiBold' }),
  },
  emptyRecent: {
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    gap: 10,
  },
  emptyRecentText: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_400Regular' }),
  },
  infoCard: {
    flexDirection: 'row',
    gap: 12,
    padding: 14,
    marginTop: 20,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_400Regular' }),
  },
});
