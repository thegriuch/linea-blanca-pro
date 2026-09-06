import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { useDiagnostico } from '@/contexts/DiagnosticoContext';
import { PrimaryButton } from '@/components/PrimaryButton';
import { StepProgress } from '@/components/StepProgress';
import { FormField } from '@/components/FormField';
import { getFallas } from '@/constants/fallas';
import { getModelos } from '@/constants/modelos';
import { getEquipoInfo } from '@/constants/equipos';
import colors from '@/constants/colors';
import type { FaultItem } from '@/types/diagnostico';

const STEPS = ['Datos', 'Equipo', 'Falla'];

// ── Dropdown de modelos ────────────────────────────────────────────────────────
function ModeloPicker({
  value,
  onChange,
  tipo,
}: {
  value: string;
  onChange: (v: string) => void;
  tipo: string;
}) {
  const c = useColors();
  const [visible, setVisible] = useState(false);
  const modelos = getModelos(tipo as any);

  return (
    <>
      <View style={{ marginBottom: 14 }}>
        <Text style={[styles.fieldLabel, { color: c.foreground }]}>Modelo</Text>
        <TouchableOpacity
          onPress={() => setVisible(true)}
          activeOpacity={0.8}
          style={[
            styles.dropdownBtn,
            { borderColor: c.input, backgroundColor: c.card, borderRadius: 10 },
          ]}
        >
          <Text
            style={[
              styles.dropdownText,
              { color: value ? c.foreground : c.mutedForeground },
            ]}
            numberOfLines={1}
          >
            {value || 'Seleccionar modelo...'}
          </Text>
          <Feather name="chevron-down" size={18} color={c.mutedForeground} />
        </TouchableOpacity>
      </View>

      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={() => setVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setVisible(false)}
        />
        <View style={[styles.modalSheet, { backgroundColor: c.card }]}>
          <View style={[styles.modalHandle, { backgroundColor: c.border }]} />
          <Text style={[styles.modalTitle, { color: c.foreground }]}>Seleccionar modelo</Text>
          <FlatList
            data={modelos}
            keyExtractor={(item) => item}
            style={{ maxHeight: 380 }}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              const selected = item === value;
              return (
                <TouchableOpacity
                  onPress={() => {
                    onChange(item);
                    setVisible(false);
                  }}
                  style={[
                    styles.modalItem,
                    {
                      backgroundColor: selected ? c.primary + '14' : 'transparent',
                      borderBottomColor: c.border,
                    },
                  ]}
                >
                  <Text style={[styles.modalItemText, { color: selected ? c.primary : c.foreground }]}>
                    {item}
                  </Text>
                  {selected && <Feather name="check" size={16} color={c.primary} />}
                </TouchableOpacity>
              );
            }}
          />
          <TouchableOpacity
            onPress={() => setVisible(false)}
            style={[styles.modalClose, { borderTopColor: c.border }]}
          >
            <Text style={[styles.modalCloseText, { color: c.mutedForeground }]}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </>
  );
}

// ── Pantalla principal ─────────────────────────────────────────────────────────
export default function FallaScreen() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const { currentSession, setEquipo } = useDiagnostico();
  const [modelo, setModelo] = useState(currentSession?.equipo.modelo ?? '');
  const [serie, setSerie] = useState(currentSession?.equipo.serie ?? '');
  const [selectedFalla, setSelectedFalla] = useState<FaultItem | null>(null);

  if (!currentSession) {
    router.replace('/diagnostico/nuevo');
    return null;
  }

  const equipo = getEquipoInfo(currentSession.equipo.tipo);
  const fallas = getFallas(currentSession.equipo.tipo);

  const handleStart = () => {
    if (!selectedFalla) {
      Alert.alert('Selecciona la falla', 'Debes seleccionar el síntoma principal del equipo.');
      return;
    }
    setEquipo({
      tipo: currentSession.equipo.tipo,
      marca: '',
      modelo,
      serie,
      fallaId: selectedFalla.id,
      fallaLabel: selectedFalla.label,
      treeId: selectedFalla.treeId,
    });
    router.push('/diagnostico/arbol');
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: c.background }}
      contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 40 }}
    >
      <StepProgress steps={STEPS} currentIndex={1} />

      {/* Equipo info */}
      <View style={[styles.equipoBanner, { backgroundColor: equipo.color + '15', borderRadius: colors.radius }]}>
        <Feather name={equipo.icon as keyof typeof Feather.glyphMap} size={20} color={equipo.color} />
        <Text style={[styles.equipoBannerText, { color: equipo.color }]}>{equipo.label}</Text>
      </View>

      <Text style={[styles.sectionTitle, { color: c.foreground }]}>Datos del equipo</Text>
      <ModeloPicker
        value={modelo}
        onChange={setModelo}
        tipo={currentSession.equipo.tipo}
      />
      <FormField label="N° de serie" value={serie} onChangeText={setSerie} placeholder="Número de serie (opcional)" />

      <Text style={[styles.sectionTitle, { color: c.foreground, marginTop: 8 }]}>Síntoma principal</Text>
      <Text style={[styles.hint, { color: c.mutedForeground }]}>
        Selecciona el síntoma que reporta el cliente. Esto define el árbol de diagnóstico a seguir.
      </Text>

      <View style={styles.fallaList}>
        {fallas.map((f) => {
          const sel = selectedFalla?.id === f.id;
          return (
            <TouchableOpacity
              key={f.id}
              onPress={() => setSelectedFalla(f)}
              activeOpacity={0.75}
              style={[
                styles.fallaItem,
                {
                  backgroundColor: sel ? c.primary + '12' : c.card,
                  borderColor: sel ? c.primary : c.border,
                  borderRadius: colors.radius,
                },
              ]}
            >
              <View style={[styles.fallaIcon, { backgroundColor: sel ? c.primary + '20' : c.muted, borderRadius: 10 }]}>
                <Feather name={f.icon as keyof typeof Feather.glyphMap} size={18} color={sel ? c.primary : c.mutedForeground} />
              </View>
              <Text style={[styles.fallaLabel, { color: sel ? c.primary : c.foreground }]}>{f.label}</Text>
              {sel && <Feather name="check-circle" size={18} color={c.primary} />}
            </TouchableOpacity>
          );
        })}
      </View>

      <PrimaryButton
        label="Iniciar árbol de diagnóstico"
        icon="git-branch"
        onPress={handleStart}
        disabled={!selectedFalla}
      />
      <View style={{ height: 12 }} />
      <PrimaryButton label="Volver" variant="outline" onPress={() => router.back()} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_600SemiBold' }),
  },
  dropdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 13,
    justifyContent: 'space-between',
  },
  dropdownText: {
    flex: 1,
    fontSize: 15,
    marginRight: 8,
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_400Regular' }),
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalSheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 12,
    paddingHorizontal: 16,
    paddingBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 20,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_700Bold' }),
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  modalItemText: {
    fontSize: 14,
    flex: 1,
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_400Regular' }),
  },
  modalClose: {
    marginTop: 12,
    paddingTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 14,
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_400Regular' }),
  },
  equipoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    marginBottom: 20,
  },
  equipoBannerText: {
    fontSize: 15,
    fontWeight: '700',
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_700Bold' }),
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_700Bold' }),
  },
  hint: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_400Regular' }),
  },
  fallaList: {
    gap: 8,
    marginBottom: 20,
  },
  fallaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderWidth: 1.5,
  },
  fallaIcon: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallaLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_500Medium' }),
  },
});
