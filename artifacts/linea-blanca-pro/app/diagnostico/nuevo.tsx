import React, { useEffect, useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import { useColors } from '@/hooks/useColors';
import { useDiagnostico } from '@/contexts/DiagnosticoContext';
import { PrimaryButton } from '@/components/PrimaryButton';
import { FormField } from '@/components/FormField';
import { StepProgress } from '@/components/StepProgress';
import { EquipoIcon } from '@/components/EquipoIcon';
import { EQUIPOS } from '@/constants/equipos';
import type { EquipoTipo } from '@/types/diagnostico';
import colors from '@/constants/colors';

const STEPS = ['Datos', 'Equipo', 'Falla'];

export default function NuevoScreen() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const { currentSession, startSession, discardSession, updateCliente, setTecnico, tecnico, setEquipo } = useDiagnostico();
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [ciudad, setCiudad] = useState('');
  const [tecnicoLocal, setTecnicoLocal] = useState(tecnico);
  const [equipo, setEquipoLocal] = useState<EquipoTipo>('nevera');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    // Cada entrada a “Nuevo diagnóstico” debe comenzar con un ID y evidencias
    // propios, incluso si quedó una sesión incompleta en almacenamiento.
    discardSession();
    startSession();
  }, []);

  const handleContinue = () => {
    // Campos obligatorios: se listan todos los vacíos en un solo aviso para que
    // el técnico sepa qué diligenciar antes de continuar. En web Alert.alert no
    // muestra nada, así que el aviso también se pinta dentro del formulario.
    const faltantes: string[] = [];
    if (!nombre.trim()) faltantes.push('Nombre del cliente');
    if (faltantes.length > 0) {
      const mensaje = `Hay campos obligatorios sin diligenciar: ${faltantes.join(', ')}. Completa los campos marcados con * para continuar.`;
      setFormError(mensaje);
      if (Platform.OS !== 'web') Alert.alert('Campos obligatorios', mensaje);
      return;
    }
    setFormError('');
    setTecnico(tecnicoLocal);
    updateCliente({ nombre, telefono, ciudad });
    setEquipo({
      tipo: equipo,
      marca: '',
      modelo: '',
      serie: '',
      fallaId: '',
      fallaLabel: '',
      treeId: '',
    });
    router.push('/diagnostico/falla');
  };

  return (
    <KeyboardAwareScrollViewCompat
      style={{ flex: 1, backgroundColor: c.background }}
      contentContainerStyle={{
        padding: 20,
        paddingBottom: insets.bottom + 40,
      }}
    >
      <StepProgress steps={STEPS} currentIndex={0} />

      <Text style={[styles.sectionTitle, { color: c.foreground }]}>Datos del cliente</Text>

      <FormField
        label="Nombre del cliente"
        value={nombre}
        onChangeText={(texto) => {
          setNombre(texto);
          if (formError) setFormError('');
        }}
        placeholder="Nombre completo"
        required
      />
      <FormField label="Teléfono" value={telefono} onChangeText={setTelefono} placeholder="+57 300 000 0000" keyboardType="phone-pad" />
      <FormField label="Ciudad" value={ciudad} onChangeText={setCiudad} placeholder="Medellín, Bogotá..." />
      <FormField label="Técnico responsable" value={tecnicoLocal} onChangeText={setTecnicoLocal} placeholder="Tu nombre" />

      <Text style={[styles.sectionTitle, { color: c.foreground, marginTop: 20 }]}>Tipo de equipo</Text>
      <View style={styles.equipoGrid}>
        {EQUIPOS.map((e) => {
          const selected = equipo === e.id;
          return (
            <TouchableOpacity
              key={e.id}
              onPress={() => setEquipoLocal(e.id)}
              activeOpacity={0.75}
              style={[
                styles.equipoCard,
                {
                  backgroundColor: selected ? e.color + '18' : c.card,
                  borderColor: selected ? e.color : c.border,
                  borderRadius: colors.radius,
                },
              ]}
            >
              <EquipoIcon tipo={e.id} size={22} color={selected ? e.color : c.mutedForeground} />
              <Text style={[styles.equipoLabel, { color: selected ? e.color : c.foreground }]} numberOfLines={2}>
                {e.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {formError ? (
        <View style={[styles.errorBox, { backgroundColor: c.card, borderColor: c.destructive, borderRadius: colors.radius }]}>
          <Feather name="alert-circle" size={16} color={c.destructive} />
          <Text style={[styles.errorText, { color: c.destructive }]}>{formError}</Text>
        </View>
      ) : null}

      <PrimaryButton label="Continuar a falla" icon="arrow-right" onPress={handleContinue} />
    </KeyboardAwareScrollViewCompat>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 14,
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_700Bold' }),
  },
  equipoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  equipoCard: {
    width: '47%',
    padding: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    gap: 8,
  },
  equipoLabel: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_600SemiBold' }),
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: 12,
    borderWidth: 1.5,
    marginBottom: 14,
  },
  errorText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_500Medium' }),
  },
});
