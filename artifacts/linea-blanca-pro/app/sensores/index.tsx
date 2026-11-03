import React, { useState } from 'react';
import { Platform, StyleSheet, Text, View, FlatList, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { useLocalSearchParams } from 'expo-router';
import colors from '@/constants/colors';
import {
  SENSOR_NTC_SPECIFICATIONS,
  SENSOR_NTC_TABLE,
  type NtcReference,
} from '@/constants/sensores_ntc';
import {
  TEMPERATURE_TABLE_AIR,
  TEMPERATURE_TABLE_AIR_TP,
  type AirSensorRow,
} from '@/constants/sensores-aire-tabla';

type SensorTab = 'ntc' | 'aire-ntc' | 'aire-tp';

const SENSOR_TABS: { key: SensorTab; label: string; icon: 'thermometer' | 'wind' | 'droplet' }[] = [
  { key: 'ntc', label: 'NTC', icon: 'thermometer' },
  { key: 'aire-ntc', label: 'Aire T1-T4', icon: 'wind' },
  { key: 'aire-tp', label: 'Aire TP', icon: 'droplet' },
];

function formatTemperature(value: number): string {
  return value.toFixed(1).replace('.', ',');
}

type SensorRow = NtcReference | AirSensorRow;

export default function SensoresUnificadosScreen() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === 'web' ? 67 : insets.top;
  const params = useLocalSearchParams<{ tab?: string }>();
  const initialTab = (params.tab as SensorTab) || 'ntc';
  const [activeTab, setActiveTab] = useState<SensorTab>(initialTab);

  const isNtc = activeTab === 'ntc';
  const isAireNtc = activeTab === 'aire-ntc';
  const isAireTp = activeTab === 'aire-tp';

  const aireRows: AirSensorRow[] = isAireTp ? TEMPERATURE_TABLE_AIR_TP : TEMPERATURE_TABLE_AIR;
  const data: SensorRow[] = isNtc ? SENSOR_NTC_TABLE : aireRows;

  const getKey = (item: SensorRow): string => {
    if (isNtc) {
      return String((item as NtcReference).temperature);
    }
    return (item as AirSensorRow).interval;
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      {/* Tab Bar */}
      <View style={styles.tabBarContainer}>
        <View style={styles.tabBar}>
          {SENSOR_TABS.map((tab) => {
            const active = tab.key === activeTab;
            return (
              <TouchableOpacity
                key={tab.key}
                onPress={() => setActiveTab(tab.key)}
                activeOpacity={0.8}
                style={[
                  styles.tab,
                  {
                    backgroundColor: active ? c.primary : 'transparent',
                    borderColor: active ? c.primary : c.border,
                  },
                ]}
              >
                <View style={styles.tabContent}>
                  <Feather
                    name={tab.icon}
                    size={18}
                    color={active ? '#FFFFFF' : c.mutedForeground}
                  />
                  <Text
                    style={[
                      styles.tabLabel,
                      { color: active ? '#FFFFFF' : c.mutedForeground },
                    ]}
                  >
                    {tab.label}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Content */}
      <FlatList<SensorRow>
        data={data}
        keyExtractor={getKey}
        contentContainerStyle={{
          padding: 16,
          paddingTop: topPadding + 16,
          paddingBottom: Platform.OS === 'web' ? 34 : insets.bottom + 40,
        }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            {/* Header */}
            <View style={styles.titleRow}>
              <View
                style={[
                  styles.titleIcon,
                  { backgroundColor: c.primary + '18' },
                ]}
              >
                <Feather
                  name={isNtc ? 'thermometer' : 'wind'}
                  size={22}
                  color={c.primary}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.title, { color: c.foreground }]}>
                  {isNtc
                    ? 'Sensor NTC'
                    : isAireTp
                    ? 'Sensor TP (Descarga)'
                    : 'Sensores T1, T2, T3, T4 (Aire)'}
                </Text>
                <Text style={[styles.subtitle, { color: c.mutedForeground }]}>
                  {isNtc
                    ? 'Tabla de resistencia y temperatura'
                    : 'Resistencia vs temperatura · aire acondicionado'}
                </Text>
              </View>
            </View>

            {/* Info Card */}
            <View style={[styles.infoCard, { backgroundColor: c.secondary, borderRadius: colors.radius }]}>
              <Feather name="info" size={17} color={c.primary} />
              <Text style={[styles.infoText, { color: c.secondaryForeground }]}>
                {isNtc
                  ? 'Usa la temperatura medida en el componente y compara la resistencia esperada con la lectura del multímetro. Una diferencia importante puede indicar un sensor descalibrado o defectuoso.'
                  : isAireTp
                  ? 'Esta tabla es para los sensores TP de descarga del compresor (código EC54 y similares). Mide el sensor con el equipo apagado y compara la resistencia con la temperatura real de la tubería de descarga.'
                  : 'Esta tabla es para los sensores de temperatura de aire acondicionado: T1 ambiente interior, T2/tubificación interior, T3 condensador exterior y T4 ambiente exterior. Compara la medición del multímetro con la temperatura real donde está el sensor.'}
              </Text>
            </View>

            {/* Specs Card */}
            <View style={[styles.specCard, { backgroundColor: c.card, borderColor: c.border, borderWidth: 1, borderRadius: colors.radius }]}>
              <Text style={[styles.sectionLabel, { color: c.mutedForeground }]}>
                {isNtc
                  ? 'ESPECIFICACIONES DEL MANUAL'
                  : isAireTp
                  ? 'ESPECIFICACIONES DEL SENSOR TP'
                  : 'ESPECIFICACIONES DEL SENSOR (AIRE)'}
              </Text>
              <View style={styles.specGrid}>
                <SpecItem
                  label={isNtc ? 'Referencia' : 'Tipos de sensor'}
                  value={
                    isNtc
                      ? SENSOR_NTC_SPECIFICATIONS.reference
                      : isAireTp
                      ? 'TP'
                      : 'T1 / T2 / T3 / T4'
                  }
                  colors={c}
                />
                <SpecItem
                  label={isNtc ? 'Constante beta' : 'Rango de temperatura'}
                  value={
                    isNtc
                      ? SENSOR_NTC_SPECIFICATIONS.beta
                      : isAireTp
                      ? '-20 °C a 130 °C'
                      : '-20 °C a 139 °C'
                  }
                  colors={c}
                />
                <SpecItem
                  label={isNtc ? 'Rango' : 'Incremento'}
                  value={isNtc ? SENSOR_NTC_SPECIFICATIONS.range : '1 °C'}
                  colors={c}
                />
                <SpecItem
                  label={isNtc ? 'Incremento' : 'Unidad resistencia'}
                  value={isNtc ? SENSOR_NTC_SPECIFICATIONS.step : 'kΩ (kiloohmios)'}
                  colors={c}
                />
              </View>
            </View>

            {/* Table Header */}
            <Text style={[styles.sectionLabel, { color: c.mutedForeground }]}>
              {isNtc
                ? 'TABLA DE REFERENCIA'
                : isAireTp
                ? 'TABLA DE REFERENCIA · TP (°C / °F / kΩ)'
                : 'TABLA DE REFERENCIA · T1 T2 T3 T4 (°C / °F / kΩ)'}
            </Text>
            <View
              style={[
                styles.tableHeader,
                {
                  backgroundColor: c.primary,
                  borderTopLeftRadius: 8,
                  borderTopRightRadius: 8,
                },
              ]}
            >
              <Text style={[styles.tableHeaderText, styles.temperatureColumn, { color: '#FFFFFF' }]}>
                T (°C)
              </Text>
              {!isNtc && (
                <Text style={[styles.tableHeaderText, styles.fahrenheitColumn, { color: '#FFFFFF' }]}>
                  T (°F)
                </Text>
              )}
              <Text
                style={[
                  styles.tableHeaderText,
                  isNtc ? styles.resistanceColumn : styles.resistanceColumnAir,
                  { color: '#FFFFFF' },
                ]}
              >
                R (kΩ)
              </Text>
            </View>
          </View>
        }
        renderItem={({ item, index }) => {
          if (isNtc) {
            const ntcItem = item as NtcReference;
            return (
              <View style={[styles.tableRow, { backgroundColor: index % 2 === 0 ? c.card : c.muted }]}>
                <Text style={[styles.tableText, styles.temperatureColumn, { color: c.foreground }]}>
                  {formatTemperature(ntcItem.temperature)}
                </Text>
                <Text style={[styles.tableText, styles.resistanceColumn, { color: c.foreground }]}>
                  {ntcItem.resistanceKohm.toFixed(3)}
                </Text>
              </View>
            );
          }
          const airItem = item as AirSensorRow;
          return (
            <View style={[styles.tableRow, { backgroundColor: index % 2 === 0 ? c.card : c.muted }]}>
              <Text style={[styles.tableText, styles.temperatureColumnAir, { color: c.foreground }]}>
                {String(airItem.temperatureC)}
              </Text>
              <Text style={[styles.tableText, styles.fahrenheitColumn, { color: c.foreground }]}>
                {String(airItem.temperatureF)}
              </Text>
              <Text style={[styles.tableText, styles.resistanceColumnAir, { color: c.foreground }]}>
                {String(airItem.resistanceKohm)}
              </Text>
            </View>
          );
        }}
        ListFooterComponent={
          <Text style={[styles.footerNote, { color: c.mutedForeground }]}>
            {isNtc
              ? 'Valores calculados con R-18 °C = 16.9 kΩ y B-18/25 = 3771 K, redondeados a tres decimales como en el manual. Confirma siempre la especificación del modelo.'
              : isAireTp
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
  tabBarContainer: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#D7DEE8',
    backgroundColor: '#F8F9FA',
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    minHeight: 44,
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_600SemiBold' }),
  },
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
  temperatureColumnAir: {
    width: '33.33%',
  },
  fahrenheitColumn: {
    width: '33.33%',
    textAlign: 'center',
  },
  resistanceColumn: {
    width: '50%',
    textAlign: 'right',
  },
  resistanceColumnAir: {
    width: '33.33%',
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