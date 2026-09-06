import React from 'react';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Image as ExpoImage } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { EmptyState } from '@/components/EmptyState';
import { findArticle } from '@/constants/componentes';
import colors from '@/constants/colors';

export default function ArticuloScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const c = useColors();
  const insets = useSafeAreaInsets();
  const found = findArticle(id);

  if (!found) {
    return <EmptyState icon="file-text" title="Artículo no encontrado" />;
  }

  const { article, category } = found;

  return (
    <>
      <Stack.Screen options={{ title: article.title }} />
      <ScrollView
        style={{ flex: 1, backgroundColor: c.background }}
        contentContainerStyle={{
          padding: 20,
          paddingBottom: Platform.OS === 'web' ? 34 : insets.bottom + 40,
        }}
      >
        {/* Article header */}
        <View style={[styles.catBadge, { backgroundColor: category.color + '15', borderRadius: 8 }]}>
          <Feather name={category.icon as keyof typeof Feather.glyphMap} size={13} color={category.color} />
          <Text style={[styles.catBadgeText, { color: category.color }]}>{category.title}</Text>
        </View>

        <Text style={[styles.title, { color: c.foreground }]}>{article.title}</Text>
        <Text style={[styles.summary, { color: c.mutedForeground }]}>{article.summary}</Text>

        {article.image && (
          <View style={[styles.illustrationCard, { backgroundColor: c.card, borderColor: c.border, borderRadius: colors.radius }]}>
            <ExpoImage source={article.image} contentFit="contain" style={styles.illustration} autoplay />
            {!!article.imageLabel && (
              <View style={[styles.illustrationCaption, { backgroundColor: c.muted }]}>
                <Feather name="image" size={13} color={category.color} />
                <Text style={[styles.illustrationCaptionText, { color: c.mutedForeground }]}>
                  {article.imageLabel}
                </Text>
              </View>
            )}
          </View>
        )}

        <View style={[styles.divider, { backgroundColor: c.border }]} />

        {/* Body paragraphs */}
        {article.body.map((para, i) => (
          <Text key={i} style={[styles.paragraph, { color: c.foreground }]}>{para}</Text>
        ))}

        {/* Bullets */}
        {article.bullets && article.bullets.length > 0 && (
          <View style={[styles.bulletBox, { backgroundColor: c.muted, borderRadius: colors.radius }]}>
            {article.bullets.map((b, i) => (
              <View key={i} style={styles.bulletRow}>
                <Text style={[styles.bulletDot, { color: c.primary }]}>•</Text>
                <Text style={[styles.bulletText, { color: c.foreground }]}>{b}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Tip */}
        {article.tip && (
          <View style={[styles.tipBox, { backgroundColor: c.secondary, borderRadius: colors.radius, borderLeftColor: c.primary }]}>
            <Feather name="zap" size={16} color={c.primary} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.tipLabel, { color: c.primary }]}>TIP TÉCNICO</Text>
              <Text style={[styles.tipText, { color: c.secondaryForeground }]}>{article.tip}</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  catBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 12,
  },
  catBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_700Bold' }),
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 28,
    marginBottom: 8,
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_700Bold' }),
  },
  summary: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
    fontStyle: 'italic',
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_400Regular' }),
  },
  illustrationCard: {
    borderWidth: 1,
    padding: 10,
    marginBottom: 20,
    gap: 8,
  },
  illustration: {
    width: '100%',
    height: 260,
    borderRadius: 8,
  },
  illustrationCaption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 8,
    paddingVertical: 7,
    borderRadius: 6,
  },
  illustrationCaptionText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 16,
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_400Regular' }),
  },
  divider: {
    height: 1,
    marginBottom: 20,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 14,
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_400Regular' }),
  },
  bulletBox: {
    padding: 14,
    gap: 8,
    marginBottom: 16,
  },
  bulletRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
  },
  bulletDot: {
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 20,
  },
  bulletText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_400Regular' }),
  },
  tipBox: {
    flexDirection: 'row',
    gap: 10,
    padding: 14,
    borderLeftWidth: 3,
    alignItems: 'flex-start',
  },
  tipLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 4,
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_700Bold' }),
  },
  tipText: {
    fontSize: 13,
    lineHeight: 19,
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_400Regular' }),
  },
});
