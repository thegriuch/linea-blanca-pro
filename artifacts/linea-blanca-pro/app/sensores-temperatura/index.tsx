import React from 'react';
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import {
  SENSOR_NTC_SPECIFICATIONS,
  SENSOR_NTC_TABLE,
  type NtcReference,
} from '@/constants/sensores_ntc';
import colors from '@/constants/colors';

function formatTemperature(value: number): string {
  return value.toFixed(1).replace('.', ',');
}

export default function SensoresTemperaturaScreen() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === 'web' ? 67 : insets.top;

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <FlatList<NtcReference>
        data={SENSOR_NTC_TABLE}
        keyExtractor={(item) => String(item.temperature)}
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
                <Text style={[styles.title, { color: c.foreground }]}>Sensor NTC</Text>
                <Text style={[styles.subtitle, { color: c.mutedForeground }]}>
                  Tabla de resistencia y temperatura
                </Text>
              </View>
            </View>

            <View style={[styles.infoCard, { backgroundColor: c.secondary, borderRadius: colors.radius }]}>
              <Feather name="info" size={17} color={c.primary} />
              <Text style={[styles.infoText, { color: c.secondaryForeground }]}>
                Usa la temperatura medida en el componente y compara la resistencia esperada
                con la lectura del multímetro. Una diferencia importante puede indicar un
                sensor descalibrado o defectuoso.
              </Text>
            </View>

            <View style={[styles.specCard, { backgroundColor: c.card, borderColor: c.border, borderRadius: colors.radius }]}>
              <Text style={[styles.sectionLabel, { color: c.mutedForeground }]}>ESPECIFICACIONES DEL MANUAL</Text>
              <View style={styles.specGrid}>
                <SpecItem label="Referencia" value={SENSOR_NTC_SPECIFICATIONS.reference} colors={c} />
                <SpecItem label="Constante beta" value={SENSOR_NTC_SPECIFICATIONS.beta} colors={c} />
                <SpecItem label="Rango" value={SENSOR_NTC_SPECIFICATIONS.range} colors={c} />
                <SpecItem label="Incremento" value={SENSOR_NTC_SPECIFICATIONS.step} colors={c} />
              </View>
            </View>

            <Text style={[styles.sectionLabel, { color: c.mutedForeground }]}>
              TABLA DE REFERENCIA
            </Text>
            <View style={[styles.tableHeader, { backgroundColor: c.primary, borderTopLeftRadius: 8, borderTopRightRadius: 8 }]}>
              <Text style={[styles.tableHeaderText, styles.temperatureColumn]}>T (°C)</Text>
              <Text style={[styles.tableHeaderText, styles.resistanceColumn]}>R (kΩ)</Text>
            </View>
          </View>
        }
        renderItem={({ item, index }) => (
          <View style={[styles.tableRow, { backgroundColor: index % 2 === 0 ? c.card : c.muted }]}>
            <Text style={[styles.tableText, styles.temperatureColumn, { color: c.foreground }]}>
              {formatTemperature(item.temperature)}
            </Text>
            <Text style={[styles.tableText, styles.resistanceColumn, { color: c.foreground }]}>
              {item.resistanceKohm.toFixed(3)}
            </Text>
          </View>
        )}
        ListFooterComponent={
          <Text style={[styles.footerNote, { color: c.mutedForeground }]}>
            Valores calculados con R-18 °C = 16.9 kΩ y B-18/25 = 3771 K, redondeados a tres
            decimales como en el manual. Confirma siempre la especificación del modelo.
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
  title: {
    fontSize: 25,
    fontWeight: '800',
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_700Bold' }),
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_400Regular' }),
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
  },
  tableHeaderText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_700Bold' }),
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#D7DEE8',
  },
  temperatureColumn: {
    width: '50%',
  },
  resistanceColumn: {
    width: '50%',
    textAlign: 'right',
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