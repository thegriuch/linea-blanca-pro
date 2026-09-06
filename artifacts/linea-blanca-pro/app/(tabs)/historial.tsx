import React, { useState } from 'react';
import {
  Alert,
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
import { useDiagnostico } from '@/contexts/DiagnosticoContext';
import { ReportListItem } from '@/components/ReportListItem';
import { EmptyState } from '@/components/EmptyState';
import colors from '@/constants/colors';

export default function HistorialTab() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const { sessions, deleteSession } = useDiagnostico();
  const [query, setQuery] = useState('');
  const topPadding = Platform.OS === 'web' ? 67 : insets.top;

  const filtered = sessions.filter((s) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      s.cliente.nombre.toLowerCase().includes(q) ||
      s.equipo.marca.toLowerCase().includes(q) ||
      s.equipo.modelo.toLowerCase().includes(q) ||
      s.equipo.serie.toLowerCase().includes(q) ||
      s.equipo.fallaLabel.toLowerCase().includes(q) ||
      s.cliente.ciudad.toLowerCase().includes(q)
    );
  });

  const handleDelete = (id: string) => {
    Alert.alert('Eliminar reporte', '¿Estás seguro de que deseas eliminar este diagnóstico?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => deleteSession(id) },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPadding + 16, backgroundColor: c.background, borderBottomColor: c.border }]}>
        <Text style={[styles.title, { color: c.foreground }]}>Historial</Text>
        <Text style={[styles.count, { color: c.mutedForeground }]}>{sessions.length} diagnóstico{sessions.length !== 1 ? 's' : ''}</Text>
        {/* Search */}
        <View style={[styles.searchBar, { backgroundColor: c.card, borderColor: c.border, borderRadius: colors.radius }]}>
          <Feather name="search" size={16} color={c.mutedForeground} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Buscar por cliente, modelo, serie, falla..."
            placeholderTextColor={c.mutedForeground}
            style={[styles.searchInput, { color: c.foreground }]}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Feather name="x" size={16} color={c.mutedForeground} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* List */}
      <ScrollView
        contentContainerStyle={{
          padding: 16,
          paddingBottom: Platform.OS === 'web' ? 34 + 84 : insets.bottom + 90,
          flexGrow: filtered.length === 0 ? 1 : undefined,
        }}
      >
        {filtered.length === 0 ? (
          <EmptyState
            icon={sessions.length === 0 ? 'clock' : 'search'}
            title={sessions.length === 0 ? 'Sin diagnósticos aún' : 'Sin resultados'}
            description={
              sessions.length === 0
                ? 'Los diagnósticos completados aparecerán aquí.'
                : `No se encontraron diagnósticos con "${query}".`
            }
            action={sessions.length === 0 ? { label: 'Nuevo diagnóstico', onPress: () => router.push('/diagnostico/nuevo') } : undefined}
          />
        ) : (
          filtered.map((s) => (
            <View key={s.id}>
              <ReportListItem
                session={s}
                onPress={() => router.push(`/diagnostico/resultado/${s.id}` as any)}
              />
              <TouchableOpacity
                onPress={() => handleDelete(s.id)}
                style={[styles.deleteBtn, { marginTop: -8, marginBottom: 12 }]}
              >
                <Feather name="trash-2" size={13} color={c.destructive} />
                <Text style={[styles.deleteBtnText, { color: c.destructive }]}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          ))
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
  count: {
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
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_400Regular' }),
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-end',
    paddingHorizontal: 4,
  },
  deleteBtnText: {
    fontSize: 12,
    fontWeight: '500',
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_500Medium' }),
  },
});
