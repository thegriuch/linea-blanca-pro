import React, { useState, useCallback, useMemo } from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
} from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useColors } from '@/hooks/useColors';
import { REFRIGERANTES, RefrigeranteInfo } from '@/constants/refrigerantes';
import {
  tempToKpa,
  kpaToTemp,
  kpaToPsia,
  psiaToKpa,
  psigToPsia,
  psiaToPsig,
  tempRange,
  psiaRange,
  ATM_PSIA,
} from '@/utils/refrigeranteCalc';

type Modo = 'temp_a_psi' | 'psi_a_temp';

export default function RefrigerantesScreen() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  const [seleccionado, setSeleccionado] = useState<RefrigeranteInfo>(REFRIGERANTES[0]);
  const [modo, setModo] = useState<Modo>('temp_a_psi');
  const [inputVal, setInputVal] = useState('');
  const [usarManometrico, setUsarManometrico] = useState(false); // psi(g) vs psi(a)

  // ── Cálculo ──────────────────────────────────────────────────────────────
  const resultado = useMemo(() => {
    const n = parseFloat(inputVal.replace(',', '.'));
    if (isNaN(n)) return null;
    const tabla = seleccionado.tabla;

    if (modo === 'temp_a_psi') {
      const kpa = tempToKpa(tabla, n);
      if (kpa === null) return null;
      const psia = kpaToPsia(kpa);
      return {
        valor: usarManometrico ? psiaToPsig(psia) : psia,
        unidad: usarManometrico ? 'psi (g)' : 'psi (a)',
        kpa,
      };
    } else {
      // psi → temp
      const psia = usarManometrico ? psigToPsia(n) : n;
      const kpa = psiaToKpa(psia);
      const t = kpaToTemp(tabla, kpa);
      if (t === null) return null;
      return { valor: t, unidad: '°C', kpa };
    }
  }, [inputVal, modo, seleccionado, usarManometrico]);

  // ── Rangos válidos ────────────────────────────────────────────────────────
  const rangoInfo = useMemo(() => {
    const tabla = seleccionado.tabla;
    if (modo === 'temp_a_psi') {
      const [tMin, tMax] = tempRange(tabla);
      return `Rango válido: ${tMin}°C a ${tMax}°C`;
    } else {
      const [pMin, pMax] = psiaRange(tabla);
      if (usarManometrico) {
        return `Rango válido: ${(pMin - ATM_PSIA).toFixed(1)} a ${(pMax - ATM_PSIA).toFixed(1)} psi (g)`;
      }
      return `Rango válido: ${pMin.toFixed(1)} a ${pMax.toFixed(1)} psi (a)`;
    }
  }, [seleccionado, modo, usarManometrico]);

  const ajustar = useCallback(
    (delta: number) => {
      const n = parseFloat(inputVal.replace(',', '.'));
      const base = isNaN(n) ? 0 : n;
      setInputVal(String(Math.round((base + delta) * 10) / 10));
    },
    [inputVal]
  );

  const cambiarModo = (m: Modo) => {
    setModo(m);
    setInputVal('');
  };

  const cambiarRefrigerante = (r: RefrigeranteInfo) => {
    setSeleccionado(r);
    setInputVal('');
  };

  // ── Etiquetas dinámica ───────────────────────────────────────────────────
  const labelInput = modo === 'temp_a_psi'
    ? 'Temperatura de saturación'
    : `Presión de saturación`;
  const unidadInput = modo === 'temp_a_psi'
    ? '°C'
    : usarManometrico ? 'psi (g)' : 'psi (a)';
  const labelResultado = modo === 'temp_a_psi'
    ? `Presión ${usarManometrico ? 'manométrica' : 'absoluta'}`
    : 'Temperatura de saturación';

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: c.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <LinearGradient
        colors={['#0D4B8A', '#145DA0']}
        style={[styles.header, { paddingTop: topPad + 8 }]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
          <Feather name="arrow-left" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={styles.headerTitle}>Regla de Refrigerantes</Text>
          <Text style={styles.headerSub}>Presión ↔ Temperatura de saturación</Text>
        </View>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Selector de refrigerante ────────────────────────────────── */}
        <Text style={[styles.sectionLabel, { color: c.mutedForeground }]}>REFRIGERANTE</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
        >
          {REFRIGERANTES.map((r) => {
            const active = r.id === seleccionado.id;
            return (
              <TouchableOpacity
                key={r.id}
                onPress={() => cambiarRefrigerante(r)}
                activeOpacity={0.75}
                style={[
                  styles.chip,
                  {
                    backgroundColor: active ? r.color : c.card,
                    borderColor: active ? r.color : c.border,
                  },
                ]}
              >
                <Text style={[styles.chipTop, { color: active ? '#fff' : c.foreground }]}>
                  {r.nombre}
                </Text>
                <Text style={[styles.chipSub, { color: active ? 'rgba(255,255,255,0.75)' : c.mutedForeground }]}>
                  {r.nombreComercial}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* ── Modo de cálculo ─────────────────────────────────────────── */}
        <Text style={[styles.sectionLabel, { color: c.mutedForeground, marginTop: 20 }]}>MODO DE CÁLCULO</Text>
        <View style={[styles.modoRow, { backgroundColor: c.muted, borderRadius: 12 }]}>
          {([
            { m: 'temp_a_psi' as Modo, icon: 'thermometer' as const, label: 'Temp → PSI' },
            { m: 'psi_a_temp' as Modo, icon: 'droplet'     as const, label: 'PSI → Temp' },
          ]).map(({ m, icon, label }) => (
            <TouchableOpacity
              key={m}
              onPress={() => cambiarModo(m)}
              style={[
                styles.modoBtn,
                {
                  backgroundColor: modo === m ? c.primary : 'transparent',
                  borderRadius: 10,
                },
              ]}
            >
              <Feather name={icon} size={16} color={modo === m ? '#fff' : c.mutedForeground} />
              <Text style={[styles.modoBtnLabel, { color: modo === m ? '#fff' : c.mutedForeground }]}>
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Toggle absoluta / manométrica (solo cuando hay PSI) */}
        <TouchableOpacity
          onPress={() => { setUsarManometrico(!usarManometrico); setInputVal(''); }}
          style={[styles.toggleRow, { borderColor: c.border, backgroundColor: c.card }]}
          activeOpacity={0.8}
        >
          <View>
            <Text style={[styles.toggleLabel, { color: c.foreground }]}>
              {usarManometrico ? 'Presión manométrica — psi (g)' : 'Presión absoluta — psi (a)'}
            </Text>
            <Text style={[styles.toggleSub, { color: c.mutedForeground }]}>
              {usarManometrico
                ? 'Lo que muestra el manómetro de campo'
                : 'Incluye la presión atmosférica (+ 14.7 psi)'}
            </Text>
          </View>
          <View style={[styles.pillToggle, { backgroundColor: usarManometrico ? c.primary : c.muted }]}>
            <Text style={{ color: usarManometrico ? '#fff' : c.mutedForeground, fontSize: 11, fontWeight: '700' }}>
              {usarManometrico ? 'g' : 'a'}
            </Text>
          </View>
        </TouchableOpacity>

        {/* ── Input ───────────────────────────────────────────────────── */}
        <Text style={[styles.sectionLabel, { color: c.mutedForeground, marginTop: 20 }]}>
          {labelInput.toUpperCase()}
        </Text>
        <View style={[styles.inputCard, { backgroundColor: c.card, borderColor: c.border }]}>
          <TouchableOpacity onPress={() => ajustar(-1)} style={styles.stepBtn} hitSlop={8}>
            <Feather name="minus" size={20} color={c.primary} />
          </TouchableOpacity>
          <View style={styles.inputCenter}>
            <TextInput
              value={inputVal}
              onChangeText={setInputVal}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor={c.mutedForeground}
              style={[styles.numInput, { color: c.foreground }]}
              textAlign="center"
              returnKeyType="done"
            />
            <Text style={[styles.unidadLabel, { color: c.mutedForeground }]}>{unidadInput}</Text>
          </View>
          <TouchableOpacity onPress={() => ajustar(+1)} style={styles.stepBtn} hitSlop={8}>
            <Feather name="plus" size={20} color={c.primary} />
          </TouchableOpacity>
        </View>
        <Text style={[styles.rangoText, { color: c.mutedForeground }]}>{rangoInfo}</Text>

        {/* ── Resultado ───────────────────────────────────────────────── */}
        <Text style={[styles.sectionLabel, { color: c.mutedForeground, marginTop: 20 }]}>
          {labelResultado.toUpperCase()}
        </Text>
        <View style={[
          styles.resultCard,
          {
            backgroundColor: resultado ? seleccionado.color : c.muted,
            borderRadius: 16,
          },
        ]}>
          {resultado ? (
            <>
              <Text style={styles.resultValor}>
                {resultado.valor.toFixed(2)}
              </Text>
              <Text style={styles.resultUnidad}>{resultado.unidad}</Text>
              {resultado.kpa && (
                <Text style={styles.resultSub}>
                  {resultado.kpa.toFixed(1)} kPa absolutos
                </Text>
              )}
            </>
          ) : (
            <View style={{ alignItems: 'center', gap: 6 }}>
              <Feather name="alert-circle" size={28} color={c.mutedForeground} />
              <Text style={[styles.resultVacio, { color: c.mutedForeground }]}>
                {inputVal
                  ? 'Valor fuera del rango de la tabla'
                  : 'Ingresa un valor para calcular'}
              </Text>
            </View>
          )}
        </View>

        {/* ── Ficha técnica ───────────────────────────────────────────── */}
        <Text style={[styles.sectionLabel, { color: c.mutedForeground, marginTop: 24 }]}>
          FICHA TÉCNICA — {seleccionado.nombre}
        </Text>
        <View style={[styles.fichaCard, { backgroundColor: c.card, borderColor: c.border }]}>
          <Text style={[styles.fichaDesc, { color: c.mutedForeground }]}>
            {seleccionado.descripcion}
          </Text>
          <View style={[styles.fichaDivider, { backgroundColor: c.border }]} />
          {[
            { label: 'Nombre comercial', valor: seleccionado.nombreComercial },
            { label: 'Grupo de seguridad', valor: seleccionado.grupoSeguridad },
            { label: 'T. crítica', valor: `${seleccionado.tCritica.toFixed(2)} °C` },
            { label: 'P. crítica', valor: `${seleccionado.pCritica.toFixed(0)} kPa` },
            { label: 'Ebullición (0 psi g)', valor: `${seleccionado.tEbullicion.toFixed(2)} °C` },
            {
              label: 'Ebullición (0 psi g)',
              valor: `${(kpaToPsia(psiaToKpa(ATM_PSIA))).toFixed(3)} psi (a)`,
              hide: true,
            },
          ]
            .filter((f) => !f.hide)
            .map((f) => (
              <View key={f.label} style={styles.fichaRow}>
                <Text style={[styles.fichaKey, { color: c.mutedForeground }]}>{f.label}</Text>
                <Text style={[styles.fichaVal, { color: c.foreground }]}>{f.valor}</Text>
              </View>
            ))}

          {/* Barra de color del gas */}
          <View style={styles.fichaRow}>
            <Text style={[styles.fichaKey, { color: c.mutedForeground }]}>Color identificativo</Text>
            <View style={[styles.colorDot, { backgroundColor: seleccionado.color }]} />
          </View>
        </View>

        {/* ── Nota de seguridad ────────────────────────────────────────── */}
        {(seleccionado.grupoSeguridad === 'A3' || seleccionado.grupoSeguridad === 'A2L') && (
          <View style={[styles.warningCard, { backgroundColor: '#FEF3C7', borderColor: '#FCD34D' }]}>
            <Feather name="alert-triangle" size={18} color="#D97706" />
            <Text style={[styles.warningText, { color: '#92400E' }]}>
              {seleccionado.grupoSeguridad === 'A3'
                ? `${seleccionado.nombre} es inflamable (grupo A3). Ventilación obligatoria, sin chispas, carga con equipo certificado.`
                : `${seleccionado.nombre} es ligeramente inflamable (A2L). Usar equipo certificado para este refrigerante.`}
            </Text>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_700Bold' }),
  },
  headerSub: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 11,
    marginTop: 2,
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_400Regular' }),
  },
  scroll: {
    padding: 16,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 8,
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_700Bold' }),
  },
  chips: {
    gap: 8,
    paddingRight: 4,
  },
  chip: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    minWidth: 90,
    alignItems: 'center',
  },
  chipTop: {
    fontSize: 15,
    fontWeight: '800',
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_700Bold' }),
  },
  chipSub: {
    fontSize: 10,
    marginTop: 2,
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_400Regular' }),
  },
  modoRow: {
    flexDirection: 'row',
    padding: 4,
    gap: 4,
  },
  modoBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
  },
  modoBtnLabel: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_600SemiBold' }),
  },
  toggleRow: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  toggleLabel: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_600SemiBold' }),
  },
  toggleSub: {
    fontSize: 11,
    marginTop: 2,
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_400Regular' }),
  },
  pillToggle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    gap: 8,
  },
  stepBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputCenter: {
    flex: 1,
    alignItems: 'center',
  },
  numInput: {
    fontSize: 40,
    fontWeight: '800',
    width: '100%',
    textAlign: 'center',
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_700Bold' }),
  },
  unidadLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: -4,
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_600SemiBold' }),
  },
  rangoText: {
    fontSize: 11,
    marginTop: 6,
    textAlign: 'center',
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_400Regular' }),
  },
  resultCard: {
    minHeight: 110,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 4,
  },
  resultValor: {
    color: '#fff',
    fontSize: 52,
    fontWeight: '800',
    lineHeight: 58,
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_700Bold' }),
  },
  resultUnidad: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_600SemiBold' }),
  },
  resultSub: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    marginTop: 4,
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_400Regular' }),
  },
  resultVacio: {
    fontSize: 13,
    textAlign: 'center',
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_400Regular' }),
  },
  fichaCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    gap: 2,
  },
  fichaDesc: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_400Regular' }),
  },
  fichaDivider: {
    height: 1,
    marginVertical: 8,
  },
  fichaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  fichaKey: {
    fontSize: 13,
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_400Regular' }),
  },
  fichaVal: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_600SemiBold' }),
  },
  colorDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
  },
  warningCard: {
    flexDirection: 'row',
    gap: 10,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 12,
    alignItems: 'flex-start',
  },
  warningText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_400Regular' }),
  },
});
