import React from 'react';
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { LIBRARY_CATEGORIES } from '@/constants/componentes';
import colors from '@/constants/colors';

export default function BibliotecaTab() {
  const c = useColors();
  const insets = useSafeAreaInsets();
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
      <Text style={[styles.title, { color: c.foreground }]}>Biblioteca</Text>
      <Text style={[styles.sub, { color: c.mutedForeground }]}>
        Conceptos, componentes y procedimientos técnicos
      </Text>

      {LIBRARY_CATEGORIES.map((cat) => (
        <TouchableOpacity
          key={cat.id}
          onPress={() => router.push(`/biblioteca/${cat.id}` as any)}
          activeOpacity={0.75}
          style={[styles.catCard, { backgroundColor: c.card, borderColor: c.border, borderRadius: colors.radius }]}
        >
          <View style={[styles.catIcon, { backgroundColor: cat.color + '18', borderRadius: 12 }]}>
            <Feather name={cat.icon as keyof typeof Feather.glyphMap} size={24} color={cat.color} />
          </View>
          <View style={styles.catInfo}>
            <Text style={[styles.catTitle, { color: c.foreground }]}>{cat.title}</Text>
            <Text style={[styles.catDesc, { color: c.mutedForeground }]} numberOfLines={2}>
              {cat.description}
            </Text>
            <Text style={[styles.catCount, { color: cat.color }]}>
              {cat.articles.length} artículo{cat.articles.length !== 1 ? 's' : ''}
            </Text>
          </View>
          <Feather name="chevron-right" size={18} color={c.mutedForeground} />
        </TouchableOpacity>
      ))}

      {/* Info banner */}
      <View style={[styles.infoBanner, { backgroundColor: c.secondary, borderRadius: colors.radius }]}>
        <Feather name="book-open" size={18} color={c.primary} />
        <Text style={[styles.infoText, { color: c.secondaryForeground }]}>
          Biblioteca técnica con fundamentos de refrigeración, guías de componentes, herramientas de diagnóstico y procedimientos de campo.
        </Text>
      </View>
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
  catCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderWidth: 1,
    marginBottom: 10,
  },
  catIcon: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catInfo: {
    flex: 1,
    gap: 2,
  },
  catTitle: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_700Bold' }),
  },
  catDesc: {
    fontSize: 12,
    lineHeight: 17,
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_400Regular' }),
  },
  catCount: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_600SemiBold' }),
  },
  infoBanner: {
    flexDirection: 'row',
    gap: 12,
    padding: 14,
    marginTop: 10,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_400Regular' }),
  },
});
