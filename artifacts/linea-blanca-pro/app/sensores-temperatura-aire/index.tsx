import React, { useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { FlatList, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import {
  TEMPERATURE_TABLE_AIR,
  TEMPERATURE_TABLE_AIR_TP,
  type AirSensorRow,
} from '@/constants/sensores-aire-tabla';
import colors from '@/constants/colors';

type AirTableKind = 'ntc' | 'tp';

const AIR_TABLE_KINDS: { key: AirTableKind; label: string }[] = [
  { key: 'ntc', label: 'T1 / T2 / T3 / T4' },
  { key: 'tp', label: 'TP (descarga)' },
];

export default function SensoresAireTablaScreen() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === 'web' ? 67 : insets.top;
  const params = useLocalSearchParams<{ tabla?: string }>();
  const [kind, setKind] = useState<AirTableKind>(params.tabla === 'tp' ? 'tp' : 'ntc');

  const isTp = kind === 'tp';
  const rows: AirSensorRow[] = isTp ? TEMPERATURE_TABLE_AIR_TP : TEMPERATURE_TABLE_AIR;

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <FlatList<AirSensorRow>
        key={kind}
        data={rows}
        keyExtractor={(item) => item.interval}
        contentContainerStyle={{
          padding: 16,
          paddingTop: topPadding + 16,
          paddingBottom: Platform.OS === 'web' ? 34 : insets.bottom + 40,
        }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            <View style={styles.titleRow}>
              <View style={[styles.titleIcon, { backgroundColor: c.primary + '18' }]}>
                <Feather name="thermometer" size={22} color={c.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.titleText, { color: c.foreground }]}>
                  {isTp ? 'Tabla del sensor TP (aire)' : 'Tabla de sensores T1, T2, T3, T4 (aire)'}
                </Text>
                <Text style={[styles.subtitle, { color: c.mutedForeground }]}>
                  Resistencia vs temperatura · aire acondicionado
                </Text>
              </View>
            </View>

            <View style={styles.segmented}>
              {AIR_TABLE_KINDS.map((option) => {
                const active = option.key === kind;
                return (
                  <TouchableOpacity
                    key={option.key}
                    onPress={() => setKind(option.key)}
                    activeOpacity={0.8}
                    style={[
                      styles.segment,
                      {
                        backgroundColor: active ? c.primary : c.card,
                        borderColor: active ? c.primary : c.border,
                        borderRadius: colors.radius,
                      },
                    ]}
                  >
                    <Text
                      style={[styles.segmentText, { color: active ? '#FFFFFF' : c.mutedForeground }]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={[styles.infoCard, { backgroundColor: c.secondary, borderRadius: colors.radius }]}>
              <Feather name="info" size={17} color={c.primary} />
              <Text style={[styles.infoText, { color: c.secondaryForeground }]}>
                {isTp
                  ? 'Esta tabla es para los sensores TP de descarga del compresor (código EC54 y similares). Mide el sensor con el equipo apagado y compara la resistencia con la temperatura real de la tubería de descarga.'
                  : 'Esta tabla es para los sensores de temperatura de aire acondicionado: T1 ambiente interior, T2/tubificación interior, T3 condensador exterior y T4 ambiente exterior. Compara la medición del multímetro con la temperatura real donde está el sensor.'}
              </Text>
            </View>

            <View style={[styles.specCard, { backgroundColor: c.card, borderColor: c.border, borderRadius: colors.radius }]}>
              <Text style={[styles.sectionLabel, { color: c.mutedForeground }]}>
                {isTp ? 'ESPECIFICACIONES DEL SENSOR TP' : 'ESPECIFICACIONES DEL SENSOR (AIRE)'}
              </Text>
              <View style={styles.specGrid}>
                <SpecItem
                  label="Tipos de sensor"
                  value={isTp ? 'TP' : 'T1 / T2 / T3 / T4'}
                  colors={c}
                />
                <SpecItem
                  label="Rango de temperatura"
                  value={isTp ? '-20 °C a 130 °C' : '-20 °C a 139 °C'}
                  colors={c}
                />
                <SpecItem label="Incremento" value="1 °C" colors={c} />
                <SpecItem label="Unidad resistencia" value="kΩ (kiloohmios)" colors={c} />
              </View>
            </View>

            <Text style={[styles.sectionLabel, { color: c.mutedForeground }]}>
              {isTp
                ? 'TABLA DE REFERENCIA · TP (°C / °F / kΩ)'
                : 'TABLA DE REFERENCIA · T1 T2 T3 T4 (°C / °F / kΩ)'}
            </Text>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, styles.temperatureColumn, { color: c.foreground }]}>T (°C)</Text>
              <Text style={[styles.tableHeaderText, styles.fahrenheitColumn, { color: c.foreground }]}>T (°F)</Text>
              <Text style={[styles.tableHeaderText, styles.resistanceColumn, { color: c.foreground }]}>R (kΩ)</Text>
            </View>
          </View>
        }
        renderItem={({ item, index }) => (
          <View style={[styles.tableRow, { backgroundColor: index % 2 === 0 ? c.card : c.muted }]}>
            <Text style={[styles.tableText, styles.temperatureColumn, { color: c.foreground }]}>
              {String(item.temperatureC)}
            </Text>
            <Text style={[styles.tableText, styles.fahrenheitColumn, { color: c.foreground }]}>
              {String(item.temperatureF)}
            </Text>
            <Text style={[styles.tableText, styles.resistanceColumn, { color: c.foreground }]}>
              {String(item.resistanceKohm)}
            </Text>
          </View>
        )}
        ListFooterComponent={
          <Text style={[styles.footerNote, { color: c.mutedForeground }]}>
            {isTp
              ? 'Valores de resistencia del sensor TP para aire acondicionado, °C / °F / kΩ, según el manual Kalley. El manual no especifica resistencia por encima de 130 °C; verifica siempre la tabla del modelo específico.'
              : 'Valores de resistencia por sensor (T1/T2/T3/T4) para aire acondicionado, °C / °F / kΩ, según rango de medición del manual Kalley. Verifica siempre la tabla del modelo específico.'}
          </Text>
        }
      />
    </View>
  );
}

function SpecItem({
  label,
  value,
  colors: c,
}: {
  label: string;
  value: string;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View style={styles.specItem}>
      <Text style={[styles.specLabel, { color: c.mutedForeground }]}>{label}</Text>
      <Text style={[styles.specValue, { color: c.foreground }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  titleIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleText: {
    fontSize: 25,
    fontWeight: '800',
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_700Bold' }),
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_400Regular' }),
  },
  segmented: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  segment: {
    flex: 1,
    borderWidth: 1,
    paddingVertical: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentText: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_700Bold' }),
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 14,
    marginBottom: 16,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_400Regular' }),
  },
  specCard: {
    borderWidth: 1,
    padding: 14,
    marginBottom: 18,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 9,
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_700Bold' }),
  },
  specGrid: {
    gap: 8,
  },
  specItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  specLabel: {
    fontSize: 12,
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_400Regular' }),
  },
  specValue: {
    flex: 1,
    fontSize: 12,
    textAlign: 'right',
    fontWeight: '600',
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_600SemiBold' }),
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 11,
    paddingHorizontal: 14,
    gap: 8,
  },
  tableHeaderText: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_700Bold' }),
  },
  temperatureColumn: {
    flex: 1,
  },
  fahrenheitColumn: {
    flex: 1,
    textAlign: 'center',
  },
  resistanceColumn: {
    flex: 1,
    textAlign: 'right',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#D7DEE8',
  },
  tableText: {
    fontSize: 13,
    fontVariant: ['tabular-nums'],
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_400Regular' }),
  },
  footerNote: {
    fontSize: 11,
    lineHeight: 17,
    marginTop: 14,
    textAlign: 'center',
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_400Regular' }),
  },
});
