import React, { useState } from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { searchSintomas } from '@/constants/sintomas';
import { searchCodigosError } from '@/constants/codigos_error';
import { getEquipoInfo } from '@/constants/equipos';
import { EmptyState } from '@/components/EmptyState';
import colors from '@/constants/colors';

const STAR_COLOR = '#F5821F';

function Stars({ count }: { count: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 1 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Feather key={i} name="star" size={12} color={i <= count ? STAR_COLOR : '#CBD5E1'} />
      ))}
    </View>
  );
}

const SUGGESTIONS = [
  'no enfría', 'compresor no arranca', 'hace ruido', 'no centrifuga',
  'no desagua', 'fuga de agua', 'error electrónico', 'escarcha excesiva',
  'E50', '1 Flash',
];

export default function BuscarTab() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const results = searchSintomas(query);
  const codeResults = searchCodigosError(query);
  const hasResults = results.length > 0 || codeResults.length > 0;
  const topPadding = Platform.OS === 'web' ? 67 : insets.top;

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPadding + 16, backgroundColor: c.background, borderBottomColor: c.border }]}>
        <Text style={[styles.title, { color: c.foreground }]}>Buscar diagnóstico</Text>
        <Text style={[styles.sub, { color: c.mutedForeground }]}>
          Busca síntomas, causas, artículos y códigos de error
        </Text>
        <View style={[styles.searchBar, { backgroundColor: c.card, borderColor: query ? c.primary : c.border, borderRadius: colors.radius }]}>
          <Feather name="search" size={16} color={query ? c.primary : c.mutedForeground} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Ej: no enfría, E50, 1 Flash..."
            placeholderTextColor={c.mutedForeground}
            style={[styles.searchInput, { color: c.foreground }]}
            autoCorrect={false}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Feather name="x" size={16} color={c.mutedForeground} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          padding: 16,
          paddingBottom: Platform.OS === 'web' ? 34 + 84 : insets.bottom + 90,
          flexGrow: (!query || !hasResults) ? 1 : undefined,
        }}
      >
        {!query ? (
          <>
            <Text style={[styles.hintTitle, { color: c.mutedForeground }]}>Búsquedas frecuentes</Text>
            <View style={styles.chips}>
              {SUGGESTIONS.map((s) => (
                <TouchableOpacity
                  key={s}
                  onPress={() => setQuery(s)}
                  style={[styles.chip, { backgroundColor: c.secondary, borderRadius: 20 }]}
                >
                  <Text style={[styles.chipText, { color: c.primary }]}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        ) : !hasResults ? (
          <EmptyState
            icon="search"
            title="Sin resultados"
            description={`No se encontraron causas para "${query}". Intenta con otros términos.`}
          />
        ) : (
          <>
            {codeResults.length > 0 && (
              <View style={[styles.resultGroup, { backgroundColor: c.card, borderColor: c.border, borderRadius: colors.radius }]}>
                <Text style={[styles.resultGroupTitle, { color: c.accent }]}>Códigos de error encontrados</Text>
                {codeResults.map((cod, index) => (
                  <View
                    key={`${cod.equipoTipo}-${cod.codigo}-${index}`}
                    style={[styles.resultItem, { borderTopColor: c.border, borderTopWidth: index > 0 ? 1 : 0 }]}
                  >
                    <View style={styles.resultHeader}>
                      <View style={[styles.codigoBadge, { backgroundColor: c.accent + '18', borderRadius: 6 }]}>
                        <Text style={[styles.codigoBadgeText, { color: c.accent }]}>{cod.codigo}</Text>
                      </View>
                      <Text style={[styles.codigoEquipo, { color: c.mutedForeground }]}>
                        {getEquipoInfo(cod.equipoTipo).label}
                      </Text>
                    </View>
                    <Text style={[styles.resultCause, { color: c.foreground }]}>{cod.descripcion}</Text>
                    <Text style={[styles.resultDetail, { color: c.mutedForeground }]} numberOfLines={3}>
                      {cod.solucion}
                    </Text>
                    {cod.equivalentes && (
                      <Text style={[styles.codigoEquivalentes, { color: c.mutedForeground }]}>
                        También: {cod.equivalentes}
                      </Text>
                    )}
                  </View>
                ))}
              </View>
            )}
            {results.map(({ entry }, entryIdx) => (
              <View key={entryIdx} style={[styles.resultGroup, { backgroundColor: c.card, borderColor: c.border, borderRadius: colors.radius }]}>
                <Text style={[styles.resultGroupTitle, { color: c.primary }]}>
                  Posibles causas para: "{entry.keywords[0]}"
                </Text>
                {entry.results.map((r, i) => (
                  <TouchableOpacity
                    key={i}
                    onPress={() => r.treeId ? router.push('/diagnostico/nuevo') : r.articleId ? router.push(`/biblioteca/articulo/${r.articleId}` as any) : undefined}
                    activeOpacity={r.treeId || r.articleId ? 0.75 : 1}
                    style={[styles.resultItem, { borderTopColor: c.border, borderTopWidth: i > 0 ? 1 : 0 }]}
                  >
                    <View style={styles.resultHeader}>
                      <Stars count={r.stars} />
                      {r.treeId && (
                        <View style={[styles.diagBadge, { backgroundColor: c.primary + '15', borderRadius: 6 }]}>
                          <Text style={[styles.diagBadgeText, { color: c.primary }]}>Árbol diagnóstico</Text>
                        </View>
                      )}
                      {r.articleId && (
                        <View style={[styles.diagBadge, { backgroundColor: c.accent + '15', borderRadius: 6 }]}>
                          <Text style={[styles.diagBadgeText, { color: c.accent }]}>Biblioteca</Text>
                        </View>
                      )}
                    </View>
                    <Text style={[styles.resultCause, { color: c.foreground }]}>{r.cause}</Text>
                    <Text style={[styles.resultDetail, { color: c.mutedForeground }]}>{r.detail}</Text>
                    {(r.treeId || r.articleId) && (
                      <View style={styles.resultAction}>
                        <Feather name={r.treeId ? 'git-branch' : 'book-open'} size={12} color={c.primary} />
                        <Text style={[styles.resultActionText, { color: c.primary }]}>
                          {r.treeId ? 'Iniciar diagnóstico guiado' : 'Leer artículo'}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 2,
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_700Bold' }),
  },
  sub: {
    fontSize: 13,
    marginBottom: 12,
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_400Regular' }),
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1.5,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_400Regular' }),
  },
  hintTitle: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_600SemiBold' }),
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_500Medium' }),
  },
  resultGroup: {
    borderWidth: 1,
    marginBottom: 16,
    overflow: 'hidden',
  },
  resultGroupTitle: {
    fontSize: 12,
    fontWeight: '700',
    padding: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_700Bold' }),
  },
  resultItem: {
    padding: 12,
    gap: 4,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  diagBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  diagBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_600SemiBold' }),
  },
  resultCause: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_600SemiBold' }),
  },
  resultDetail: {
    fontSize: 12,
    lineHeight: 17,
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_400Regular' }),
  },
  resultAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  resultActionText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_600SemiBold' }),
  },
  codigoBadge: {
    paddingHorizontal: 7,
    paddingVertical: 4,
  },
  codigoBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_700Bold' }),
  },
  codigoEquipo: {
    fontSize: 11,
    flex: 1,
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_400Regular' }),
  },
  codigoEquivalentes: {
    fontSize: 11,
    marginTop: 3,
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_400Regular' }),
  },
});
