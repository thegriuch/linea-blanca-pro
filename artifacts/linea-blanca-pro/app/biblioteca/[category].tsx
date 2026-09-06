import React from 'react';
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router, useLocalSearchParams, Stack } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { EmptyState } from '@/components/EmptyState';
import { getCategory } from '@/constants/componentes';
import colors from '@/constants/colors';

export default function CategoryScreen() {
  const { category } = useLocalSearchParams<{ category: string }>();
  const c = useColors();
  const insets = useSafeAreaInsets();
  const cat = getCategory(category);

  if (!cat) {
    return <EmptyState icon="book-open" title="Categoría no encontrada" />;
  }

  return (
    <>
      <Stack.Screen options={{ title: cat.title }} />
      <ScrollView
        style={{ flex: 1, backgroundColor: c.background }}
        contentContainerStyle={{
          padding: 16,
          paddingBottom: Platform.OS === 'web' ? 34 : insets.bottom + 20,
        }}
      >
        {/* Category header */}
        <View style={[styles.header, { backgroundColor: cat.color + '15', borderRadius: colors.radius }]}>
          <View style={[styles.headerIcon, { backgroundColor: cat.color + '25', borderRadius: 14 }]}>
            <Feather name={cat.icon as keyof typeof Feather.glyphMap} size={28} color={cat.color} />
          </View>
          <View>
            <Text style={[styles.headerTitle, { color: cat.color }]}>{cat.title}</Text>
            <Text style={[styles.headerDesc, { color: c.mutedForeground }]}>{cat.description}</Text>
          </View>
        </View>

        {cat.articles.map((article) => (
          <TouchableOpacity
            key={article.id}
            onPress={() => router.push(`/biblioteca/articulo/${article.id}` as any)}
            activeOpacity={0.75}
            style={[styles.articleCard, { backgroundColor: c.card, borderColor: c.border, borderRadius: colors.radius }]}
          >
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={[styles.articleTitle, { color: c.foreground }]}>{article.title}</Text>
              <Text style={[styles.articleSummary, { color: c.mutedForeground }]} numberOfLines={2}>
                {article.summary}
              </Text>
            </View>
            <Feather name="chevron-right" size={16} color={c.mutedForeground} />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    marginBottom: 16,
  },
  headerIcon: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_700Bold' }),
  },
  headerDesc: {
    fontSize: 12,
    lineHeight: 17,
    maxWidth: 220,
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_400Regular' }),
  },
  articleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    marginBottom: 10,
    gap: 12,
  },
  articleTitle: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_600SemiBold' }),
  },
  articleSummary: {
    fontSize: 12,
    lineHeight: 17,
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_400Regular' }),
  },
});
