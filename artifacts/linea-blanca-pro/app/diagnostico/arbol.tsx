import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Image,
  Modal,
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
import { Image as ExpoImage } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { useDiagnostico } from '@/contexts/DiagnosticoContext';
import { PrimaryButton } from '@/components/PrimaryButton';
import { getNode } from '@/constants/arboles';
import { getCodigosError, type CodigoError } from '@/constants/codigos_error';
import { GIFS, getGifUri } from '@/constants/gifs';
import type { TreeNode } from '@/types/diagnostico';
import colors from '@/constants/colors';

const NODE_TYPE_ICON: Record<string, keyof typeof Feather.glyphMap> = {
  question: 'help-circle',
  action:   'tool',
  measure:  'activity',
  evidence: 'camera',
  result:   'check-circle',
};

const NODE_TYPE_LABEL: Record<string, string> = {
  question: 'PREGUNTA',
  action:   'ACCIÓN',
  measure:  'MEDICIÓN',
  evidence: 'EVIDENCIA',
  result:   'RESULTADO',
};

const NODE_TYPE_COLOR: Record<string, string> = {
  question: '#145DA0',
  action:   '#F5821F',
  measure:  '#047857',
  evidence: '#7C3AED',
  result:   '#15803D',
};

// ── Nodo sintético de voltaje ─────────────────────────────────────────────────
const VOLTAJE_NODE: TreeNode = {
  id:            '__ev_voltaje__',
  type:          'evidence',
  text:          'Registrar voltaje en la toma eléctrica del equipo',
  detail:        'Antes de tocar el equipo, mide el voltaje en la toma eléctrica con el multímetro. Verifica que esté dentro del ±10 % del nominal (110 V o 220 V según equipo). Si hay voltaje incorrecto, anótalo en el informe.',
  tip:           'Un voltaje bajo o muy variable puede ser la causa de la falla. Documenta siempre este dato como parte del diagnóstico.',
  evidenceLabel: 'Foto del multímetro mostrando el voltaje en la toma',
  nextId:        'start',
};

// ══════════════════════════════════════════════════════════════════════════════
export default function ArbolScreen() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const { currentSession, advanceNode, goBackNode, addEvidence, setResult } = useDiagnostico();

  // ── Etapas del flujo ────────────────────────────────────────────────────
  // ETAPA 0 — Voltaje
  const [voltajeListo, setVoltajeListo] = useState(false);
  const [voltajeUri, setVoltajeUri] = useState<string | null>(null);
  // ETAPA 1 — Verificación de código de error
  const [errorListo, setErrorListo] = useState(false);
  const [tieneError, setTieneError] = useState<boolean | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [codigoSel, setCodigoSel] = useState<CodigoError | null>(null);
  // ETAPA 2 — Árbol de diagnóstico
  const [evidenceUri, setEvidenceUri] = useState<string | null>(null);
  const [hiddenGifKey, setHiddenGifKey] = useState<string | null>(null);

  if (!currentSession) {
    router.replace('/diagnostico/nuevo');
    return null;
  }

  const { equipo, currentNodeId, path } = currentSession;
  const node: TreeNode = getNode(equipo.treeId, currentNodeId);
  const codigos = getCodigosError(equipo.tipo as any);

  const codigosFiltrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return codigos;
    return codigos.filter(
      (c) =>
        c.codigo.toLowerCase().includes(q) ||
        (c.equivalentes ?? '').toLowerCase().includes(q) ||
        c.descripcion.toLowerCase().includes(q),
    );
  }, [codigos, busqueda]);

  // Cuando llegamos a un nodo result, guardamos y vamos a conclusión
  useEffect(() => {
    if (voltajeListo && errorListo && node.type === 'result' && node.result) {
      setResult({
        causes:         node.result.causes,
        recommendation: node.result.recommendation,
        parts:          node.result.parts ?? [],
      });
      router.push('/diagnostico/conclusion');
    }
  }, [node.id, voltajeListo, errorListo]);

  const nodeColor = NODE_TYPE_COLOR[node.type] ?? c.primary;
  const gifKey = !voltajeListo ? 'medir-voltaje' : node.gifUri;
  const gifUri = getGifUri(gifKey);
  const gifLabel = GIFS.find((gif) => gif.key === gifKey)?.label;
  const gifVisible = Boolean(gifUri && hiddenGifKey !== gifKey);

  const toggleGif = () => {
    if (!gifKey || !gifUri) return;
    setHiddenGifKey(gifVisible ? gifKey : null);
  };

  const handleOption = (nextId: string, label: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    advanceNode(nextId, label);
    setEvidenceUri(null);
  };

  const handleContinue = () => {
    if (!node.nextId) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    advanceNode(node.nextId);
    setEvidenceUri(null);
  };

  const capturePhoto = async (onDone: (uri: string) => void) => {
    if (Platform.OS === 'web') {
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: 'images', quality: 0.8 });
      if (!result.canceled && result.assets[0]) onDone(result.assets[0].uri);
      return;
    }
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso requerido', 'La app necesita acceso a la cámara para tomar evidencia.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ mediaTypes: 'images', quality: 0.8 });
    if (!result.canceled && result.assets[0]) onDone(result.assets[0].uri);
  };

  const handleCaptureVoltaje = async () => {
    await capturePhoto((uri) => {
      setVoltajeUri(uri);
      addEvidence({
        uri,
        nodeId: '__ev_voltaje__',
        nodeText: VOLTAJE_NODE.evidenceLabel || VOLTAJE_NODE.text,
      });
    });
  };

  const handleCapturePhoto = async () => {
    await capturePhoto((uri) => {
      setEvidenceUri(uri);
      addEvidence({
        uri,
        nodeId: node.id,
        nodeText: node.evidenceLabel || node.text,
      });
    });
  };

  // Usar código de error como resultado final
  const usarCodigoComoDiagnostico = () => {
    if (!codigoSel) return;
    setResult({
      causes:         codigoSel.causas.map((c, i) => ({
        cause:       c,
        probability: Math.max(10, 70 - i * 15),
      })),
      recommendation: codigoSel.solucion,
      parts:          codigoSel.partes ?? [],
    });
    router.push('/diagnostico/conclusion');
  };

  // ── Botón Volver ──────────────────────────────────────────────────────────
  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Etapa 0: voltaje
    if (!voltajeListo) { router.back(); return; }
    // Etapa 1: verificación de error
    if (!errorListo) {
      if (codigoSel) { setCodigoSel(null); return; }
      if (tieneError !== null) { setTieneError(null); setBusqueda(''); return; }
      setVoltajeListo(false); return;
    }
    // Etapa 2: árbol
    if (path.length === 0) { setErrorListo(false); setTieneError(null); setCodigoSel(null); setBusqueda(''); return; }
    goBackNode();
    setEvidenceUri(null);
  };

  const stepsTotal = path.length + (voltajeListo ? 1 : 0) + (errorListo ? 1 : 0);
  const progressPct: `${number}%` = `${Math.min(100, Math.max(4, stepsTotal * 7))}%`;

  if (node.type === 'result' && voltajeListo && errorListo) return null;

  // ══════════════════════════════════════════════════════════════════════════
  // ETAPA 0 — Voltaje
  // ══════════════════════════════════════════════════════════════════════════
  if (!voltajeListo) {
    return (
      <ScrollView
        style={{ flex: 1, backgroundColor: c.background }}
        contentContainerStyle={{ padding: 20, paddingBottom: Platform.OS === 'web' ? 34 : insets.bottom + 40 }}
      >
        <View style={[styles.progressRow, { backgroundColor: c.muted, borderRadius: 6 }]}>
          <View style={[styles.progressFill, { backgroundColor: '#7C3AED', width: '3%', borderRadius: 6 }]} />
        </View>
        <Text style={[styles.progressLabel, { color: c.mutedForeground }]}>Paso previo · Voltaje eléctrico</Text>

        <View style={[styles.typeBadge, { backgroundColor: '#7C3AED18', borderRadius: 8 }]}>
          <Feather name="zap" size={14} color="#7C3AED" />
          <Text style={[styles.typeBadgeText, { color: '#7C3AED' }]}>EVIDENCIA INICIAL</Text>
        </View>

        <View style={[styles.nodeCard, { backgroundColor: c.card, borderColor: '#7C3AED', borderRadius: colors.radius }]}>
          <Text style={[styles.nodeText, { color: c.foreground }]}>{VOLTAJE_NODE.text}</Text>
          <Text style={[styles.nodeDetail, { color: c.mutedForeground }]}>{VOLTAJE_NODE.detail}</Text>
          <View style={[styles.tipBox, { backgroundColor: c.secondary, borderRadius: 10 }]}>
            <Feather name="info" size={14} color={c.primary} />
            <Text style={[styles.tipText, { color: c.secondaryForeground }]}>{VOLTAJE_NODE.tip}</Text>
          </View>
        </View>

          <GifInstruction
            uri={gifUri}
            label={gifLabel}
            visible={gifVisible}
            onToggle={toggleGif}
            colors={c}
          />

        <View style={styles.evidenceSection}>
          {voltajeUri && (
            <View style={styles.evidencePreview}>
              <Image source={{ uri: voltajeUri }} style={[styles.evidenceImg, { borderRadius: colors.radius }]} />
              <View style={[styles.evidenceCheckBadge, { backgroundColor: c.success }]}>
                <Feather name="check" size={14} color={c.successForeground} />
              </View>
            </View>
          )}
          <TouchableOpacity
            onPress={handleCaptureVoltaje}
            activeOpacity={0.75}
            style={[styles.captureBtn, { backgroundColor: '#7C3AED18', borderColor: '#7C3AED', borderRadius: colors.radius }]}
          >
            <Feather name="camera" size={20} color="#7C3AED" />
            <Text style={[styles.captureBtnText, { color: '#7C3AED' }]}>
              {voltajeUri ? 'Tomar otra foto' : 'Abrir cámara / galería'}
            </Text>
          </TouchableOpacity>
          <Text style={[styles.evidenceLabel, { color: c.mutedForeground }]}>{VOLTAJE_NODE.evidenceLabel}</Text>
        </View>

        {voltajeUri
          ? <PrimaryButton label="Guardar voltaje y continuar" icon="arrow-right" onPress={() => setVoltajeListo(true)} />
          : (
            <TouchableOpacity onPress={() => setVoltajeListo(true)} style={styles.skipLink}>
              <Text style={[styles.skipText, { color: c.mutedForeground }]}>Omitir foto de voltaje y continuar</Text>
            </TouchableOpacity>
          )}
        <View style={{ marginTop: 12 }}>
          <PrimaryButton label="Volver" variant="outline" onPress={handleBack} />
        </View>
      </ScrollView>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // ETAPA 1 — Verificación de código de error
  // ══════════════════════════════════════════════════════════════════════════
  if (!errorListo) {

    // 1A — Pregunta inicial: ¿hay código de error?
    if (tieneError === null) {
      return (
        <ScrollView
          style={{ flex: 1, backgroundColor: c.background }}
          contentContainerStyle={{ padding: 20, paddingBottom: Platform.OS === 'web' ? 34 : insets.bottom + 40 }}
        >
          <View style={[styles.progressRow, { backgroundColor: c.muted, borderRadius: 6 }]}>
            <View style={[styles.progressFill, { backgroundColor: c.primary, width: '10%', borderRadius: 6 }]} />
          </View>
          <Text style={[styles.progressLabel, { color: c.mutedForeground }]}>Verificación de código de error</Text>

          <View style={[styles.typeBadge, { backgroundColor: c.primary + '18', borderRadius: 8 }]}>
            <Feather name="alert-circle" size={14} color={c.primary} />
            <Text style={[styles.typeBadgeText, { color: c.primary }]}>CHEQUEO DE ERROR</Text>
          </View>

          <View style={[styles.nodeCard, { backgroundColor: c.card, borderColor: c.primary, borderRadius: colors.radius }]}>
            <Text style={[styles.nodeText, { color: c.foreground }]}>
              ¿El equipo muestra algún código de error o señal de falla?
            </Text>
            <Text style={[styles.nodeDetail, { color: c.mutedForeground }]}>
              Los códigos de error pueden aparecer como:
            </Text>
            <View style={{ gap: 6, marginTop: 2 }}>
              {[
                '• Números o letras en el display (E10, F1, UE...)',
                '• Destellos o parpadeos de LED (1 destello = código 1)',
                '• Indicadores de luz en secuencia',
              ].map((txt) => (
                <Text key={txt} style={[styles.bulletItem, { color: c.mutedForeground }]}>{txt}</Text>
              ))}
            </View>
          </View>

          <View style={styles.options}>
            <TouchableOpacity
              onPress={() => setTieneError(true)}
              activeOpacity={0.75}
              style={[styles.optionBtn, { borderColor: '#F5821F', backgroundColor: '#F5821F08', borderRadius: colors.radius }]}
            >
              <Feather name="alert-triangle" size={16} color="#F5821F" />
              <Text style={[styles.optionText, { color: '#F5821F' }]}>Sí, hay código de error o destellos</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setErrorListo(true)}
              activeOpacity={0.75}
              style={[styles.optionBtn, { borderColor: c.success, backgroundColor: c.success + '08', borderRadius: colors.radius }]}
            >
              <Feather name="check-circle" size={16} color={c.success} />
              <Text style={[styles.optionText, { color: c.success }]}>No, el equipo no muestra ningún código</Text>
            </TouchableOpacity>
          </View>

          <PrimaryButton label="Volver" variant="outline" onPress={handleBack} />
        </ScrollView>
      );
    }

    // 1B — Lista de códigos + búsqueda
    if (tieneError && !codigoSel) {
      return (
        <ScrollView
          style={{ flex: 1, backgroundColor: c.background }}
          contentContainerStyle={{ padding: 20, paddingBottom: Platform.OS === 'web' ? 34 : insets.bottom + 40 }}
        >
          <View style={[styles.progressRow, { backgroundColor: c.muted, borderRadius: 6 }]}>
            <View style={[styles.progressFill, { backgroundColor: '#F5821F', width: '15%', borderRadius: 6 }]} />
          </View>
          <Text style={[styles.progressLabel, { color: c.mutedForeground }]}>Identificar código de error</Text>

          <Text style={[styles.sectionTitle, { color: c.foreground }]}>¿Cuál es el código de error?</Text>
          <Text style={[styles.nodeDetail, { color: c.mutedForeground, marginBottom: 12 }]}>
            Selecciona el código que muestra el equipo. También puedes buscarlo por nombre o código alternativo.
          </Text>

          {/* Buscador */}
          <View style={[styles.searchRow, { backgroundColor: c.card, borderColor: c.border, borderRadius: 10 }]}>
            <Feather name="search" size={16} color={c.mutedForeground} />
            <TextInput
              style={[styles.searchInput, { color: c.foreground }]}
              placeholder="Buscar código (ej: E10, F1, UE...)"
              placeholderTextColor={c.mutedForeground}
              value={busqueda}
              onChangeText={setBusqueda}
              autoCapitalize="characters"
              returnKeyType="search"
            />
            {busqueda.length > 0 && (
              <TouchableOpacity onPress={() => setBusqueda('')}>
                <Feather name="x" size={16} color={c.mutedForeground} />
              </TouchableOpacity>
            )}
          </View>

          {codigos.length === 0 && (
            <View style={[styles.emptyCodes, { backgroundColor: c.card, borderRadius: colors.radius, borderColor: c.border }]}>
              <Feather name="info" size={20} color={c.mutedForeground} />
              <Text style={[styles.emptyCodesText, { color: c.mutedForeground }]}>
                No hay tabla de códigos disponible para este tipo de equipo. Continúa con el árbol de diagnóstico guiado.
              </Text>
            </View>
          )}

          {codigosFiltrados.map((cod) => (
            <TouchableOpacity
              key={cod.codigo}
              onPress={() => setCodigoSel(cod)}
              activeOpacity={0.75}
              style={[styles.codigoItem, { backgroundColor: c.card, borderColor: c.border, borderRadius: colors.radius }]}
            >
              <View style={[styles.codigoBadge, { backgroundColor: '#F5821F18', borderRadius: 8 }]}>
                <Text style={[styles.codigoBadgeText, { color: '#F5821F' }]}>{cod.codigo}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.codigoDescripcion, { color: c.foreground }]} numberOfLines={2}>
                  {cod.descripcion}
                </Text>
                {cod.equivalentes && (
                  <Text style={[styles.codigoEquivalentes, { color: c.mutedForeground }]} numberOfLines={1}>
                    También: {cod.equivalentes}
                  </Text>
                )}
              </View>
              <Feather name="chevron-right" size={16} color={c.mutedForeground} />
            </TouchableOpacity>
          ))}

          {codigosFiltrados.length === 0 && codigos.length > 0 && (
            <View style={[styles.emptyCodes, { backgroundColor: c.card, borderRadius: colors.radius, borderColor: c.border }]}>
              <Text style={[styles.emptyCodesText, { color: c.mutedForeground }]}>
                No se encontraron resultados para "{busqueda}"
              </Text>
            </View>
          )}

          <View style={{ height: 16 }} />
          <TouchableOpacity onPress={() => setErrorListo(true)} style={styles.skipLink}>
            <Text style={[styles.skipText, { color: c.mutedForeground }]}>Mi código no está en la lista — continuar con árbol guiado</Text>
          </TouchableOpacity>
          <View style={{ marginTop: 12 }}>
            <PrimaryButton label="Volver" variant="outline" onPress={handleBack} />
          </View>
        </ScrollView>
      );
    }

    // 1C — Detalle del código seleccionado
    if (codigoSel) {
      return (
        <ScrollView
          style={{ flex: 1, backgroundColor: c.background }}
          contentContainerStyle={{ padding: 20, paddingBottom: Platform.OS === 'web' ? 34 : insets.bottom + 40 }}
        >
          <View style={[styles.progressRow, { backgroundColor: c.muted, borderRadius: 6 }]}>
            <View style={[styles.progressFill, { backgroundColor: '#F5821F', width: '18%', borderRadius: 6 }]} />
          </View>
          <Text style={[styles.progressLabel, { color: c.mutedForeground }]}>Código de error identificado</Text>

          {/* Encabezado del código */}
          <View style={[styles.codigoHeader, { backgroundColor: '#F5821F12', borderRadius: colors.radius, borderColor: '#F5821F' }]}>
            <View style={[styles.codigoBadgeLg, { backgroundColor: '#F5821F', borderRadius: 10 }]}>
              <Text style={[styles.codigoBadgeLgText]}>{codigoSel.codigo}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.nodeText, { color: c.foreground, fontSize: 15 }]}>{codigoSel.descripcion}</Text>
              {codigoSel.equivalentes && (
                <Text style={[styles.codigoEquivalentes, { color: c.mutedForeground, marginTop: 4 }]}>
                  Equivalentes: {codigoSel.equivalentes}
                </Text>
              )}
            </View>
          </View>

          {/* Causas */}
          <Text style={[styles.sectionTitle, { color: c.foreground, marginTop: 16, marginBottom: 8 }]}>
            Posibles causas
          </Text>
          {codigoSel.causas.map((causa, i) => (
            <View key={i} style={[styles.causaRow, { borderColor: c.border }]}>
              <View style={[styles.causaNum, { backgroundColor: c.primary + '18', borderRadius: 12 }]}>
                <Text style={[styles.causaNumText, { color: c.primary }]}>{i + 1}</Text>
              </View>
              <Text style={[styles.causaText, { color: c.foreground }]}>{causa}</Text>
            </View>
          ))}

          {/* Solución */}
          <Text style={[styles.sectionTitle, { color: c.foreground, marginTop: 16, marginBottom: 8 }]}>
            Procedimiento de diagnóstico
          </Text>
          <View style={[styles.solucionBox, { backgroundColor: c.card, borderRadius: colors.radius, borderColor: c.border }]}>
            <Text style={[styles.nodeDetail, { color: c.foreground, lineHeight: 21 }]}>
              {codigoSel.solucion}
            </Text>
          </View>

          {/* Repuestos */}
          {codigoSel.partes && codigoSel.partes.length > 0 && (
            <>
              <Text style={[styles.sectionTitle, { color: c.foreground, marginTop: 16, marginBottom: 8 }]}>
                Repuestos posibles
              </Text>
              <View style={{ gap: 6 }}>
                {codigoSel.partes.map((parte) => (
                  <View key={parte} style={[styles.parteRow, { backgroundColor: c.muted, borderRadius: 8 }]}>
                    <Feather name="package" size={14} color={c.mutedForeground} />
                    <Text style={[styles.parteText, { color: c.foreground }]}>{parte}</Text>
                  </View>
                ))}
              </View>
            </>
          )}

          <View style={{ height: 20 }} />
          <PrimaryButton
            label="Este código identifica el problema → Registrar diagnóstico"
            icon="check-circle"
            onPress={usarCodigoComoDiagnostico}
          />
          <View style={{ height: 10 }} />
          <PrimaryButton
            label="Continuar con árbol de diagnóstico guiado"
            variant="secondary"
            icon="git-branch"
            onPress={() => { setErrorListo(true); }}
          />
          <View style={{ height: 10 }} />
          <PrimaryButton label="Volver" variant="outline" onPress={handleBack} />
        </ScrollView>
      );
    }
  }

  // ══════════════════════════════════════════════════════════════════════════
  // ETAPA 2 — Árbol de diagnóstico guiado
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: c.background }}
      contentContainerStyle={{ padding: 20, paddingBottom: Platform.OS === 'web' ? 34 : insets.bottom + 40 }}
    >
      <View style={[styles.progressRow, { backgroundColor: c.muted, borderRadius: 6 }]}>
        <View style={[styles.progressFill, { backgroundColor: c.primary, width: progressPct, borderRadius: 6 }]} />
      </View>
      <Text style={[styles.progressLabel, { color: c.mutedForeground }]}>
        Paso {path.length + 1} · árbol diagnóstico
      </Text>

      <View style={[styles.typeBadge, { backgroundColor: nodeColor + '18', borderRadius: 8 }]}>
        <Feather name={NODE_TYPE_ICON[node.type]} size={14} color={nodeColor} />
        <Text style={[styles.typeBadgeText, { color: nodeColor }]}>{NODE_TYPE_LABEL[node.type]}</Text>
      </View>

      <View style={[styles.nodeCard, { backgroundColor: c.card, borderColor: nodeColor, borderRadius: colors.radius }]}>
        <Text style={[styles.nodeText, { color: c.foreground }]}>{node.text}</Text>
        {node.detail && (
          <Text style={[styles.nodeDetail, { color: c.mutedForeground }]}>{node.detail}</Text>
        )}
        {node.tip && (
          <View style={[styles.tipBox, { backgroundColor: c.secondary, borderRadius: 10 }]}>
            <Feather name="info" size={14} color={c.primary} />
            <Text style={[styles.tipText, { color: c.secondaryForeground }]}>{node.tip}</Text>
          </View>
        )}
      </View>

      <GifInstruction
        uri={gifUri}
        label={gifLabel}
        visible={gifVisible}
        onToggle={toggleGif}
        colors={c}
      />

      {/* Evidencia */}
      {node.type === 'evidence' && (
        <View style={styles.evidenceSection}>
          {evidenceUri && (
            <View style={styles.evidencePreview}>
              <Image source={{ uri: evidenceUri }} style={[styles.evidenceImg, { borderRadius: colors.radius }]} />
              <View style={[styles.evidenceCheckBadge, { backgroundColor: c.success }]}>
                <Feather name="check" size={14} color={c.successForeground} />
              </View>
            </View>
          )}
          <TouchableOpacity
            onPress={handleCapturePhoto}
            activeOpacity={0.75}
            style={[styles.captureBtn, { backgroundColor: '#7C3AED18', borderColor: '#7C3AED', borderRadius: colors.radius }]}
          >
            <Feather name="camera" size={20} color="#7C3AED" />
            <Text style={[styles.captureBtnText, { color: '#7C3AED' }]}>
              {evidenceUri ? 'Tomar otra foto' : 'Abrir cámara'}
            </Text>
          </TouchableOpacity>
          {node.evidenceLabel && (
            <Text style={[styles.evidenceLabel, { color: c.mutedForeground }]}>{node.evidenceLabel}</Text>
          )}
        </View>
      )}

      {/* Opciones */}
      {node.type === 'question' && node.options && (
        <View style={styles.options}>
          {node.options.map((opt, i) => {
            const optColor =
              opt.color === 'success' ? c.success
              : opt.color === 'danger' ? c.destructive
              : c.primary;
            return (
              <TouchableOpacity
                key={i}
                onPress={() => handleOption(opt.nextId, opt.label)}
                activeOpacity={0.75}
                style={[styles.optionBtn, { borderColor: optColor, backgroundColor: optColor + '08', borderRadius: colors.radius }]}
              >
                <Feather name="chevron-right" size={16} color={optColor} />
                <Text style={[styles.optionText, { color: optColor }]}>{opt.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* Continuar (action / measure / evidence) */}
      {(node.type === 'action' || node.type === 'measure' || node.type === 'evidence') && node.nextId && (
        <View style={styles.continueSection}>
          {node.type === 'evidence' && !evidenceUri && (
            <TouchableOpacity onPress={handleContinue} style={styles.skipLink}>
              <Text style={[styles.skipText, { color: c.mutedForeground }]}>Omitir evidencia y continuar</Text>
            </TouchableOpacity>
          )}
          {(node.type !== 'evidence' || evidenceUri) && (
            <PrimaryButton
              label={node.type === 'evidence' ? 'Guardar evidencia y continuar' : 'Continuar'}
              icon="arrow-right"
              onPress={handleContinue}
            />
          )}
        </View>
      )}

      <View style={{ marginTop: 12 }}>
        <PrimaryButton label="Volver" variant="outline" onPress={handleBack} />
      </View>
    </ScrollView>
  );
}

function GifInstruction({
  uri,
  label,
  visible,
  onToggle,
  colors: c,
}: {
  uri?: number;
  label?: string;
  visible: boolean;
  onToggle: () => void;
  colors: ReturnType<typeof useColors>;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [zoomScale, setZoomScale] = useState(1);

  if (!uri) return null;

  const adjustZoom = (amount: number) => {
    setZoomScale((current) => Math.min(3, Math.max(1, Number((current + amount).toFixed(1)))));
  };

  return (
    <>
      <View style={[styles.gifCard, { backgroundColor: c.card, borderColor: c.border, borderRadius: colors.radius }]}>
        <View style={styles.gifHeader}>
          <View style={styles.gifTitleGroup}>
            <Feather name="play-circle" size={18} color={c.primary} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.gifTitle, { color: c.foreground }]}>Guía visual</Text>
              {!!label && <Text style={[styles.gifLabel, { color: c.mutedForeground }]}>{label}</Text>}
            </View>
          </View>
          <TouchableOpacity onPress={onToggle} activeOpacity={0.75} style={[styles.gifToggle, { borderColor: c.border }]}>
            <Feather name={visible ? 'eye-off' : 'eye'} size={14} color={c.primary} />
            <Text style={[styles.gifToggleText, { color: c.primary }]}>{visible ? 'Ocultar GIF' : 'Mostrar GIF'}</Text>
          </TouchableOpacity>
        </View>
        {visible ? (
          <TouchableOpacity
            onPress={() => setIsExpanded(true)}
            activeOpacity={0.9}
            accessibilityRole="button"
            accessibilityLabel={`Ampliar guía visual${label ? `: ${label}` : ''}`}
          >
            <View style={styles.gifImageFrame}>
              <ExpoImage source={uri} contentFit="contain" style={styles.gifImage} autoplay />
              <View style={[styles.gifZoomHint, { backgroundColor: c.foreground + 'CC' }]}>
                <Feather name="maximize-2" size={13} color={c.background} />
                <Text style={[styles.gifZoomHintText, { color: c.background }]}>Tocar para ampliar</Text>
              </View>
            </View>
          </TouchableOpacity>
        ) : (
          <Text style={[styles.gifHidden, { color: c.mutedForeground }]}>
            GIF oculto. Pulsa “Mostrar GIF” para ver la guía de esta validación.
          </Text>
        )}
      </View>

      <Modal
        visible={isExpanded}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setIsExpanded(false)}
      >
        <View style={styles.gifModalBackdrop}>
          <View style={[styles.gifModalPanel, { backgroundColor: c.card }]}>
            <View style={styles.gifModalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.gifModalTitle, { color: c.foreground }]}>Guía visual ampliada</Text>
                {!!label && <Text style={[styles.gifModalLabel, { color: c.mutedForeground }]}>{label}</Text>}
              </View>
              <TouchableOpacity
                onPress={() => setIsExpanded(false)}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="Cerrar guía visual ampliada"
                style={[styles.gifModalClose, { backgroundColor: c.muted }]}
              >
                <Feather name="x" size={22} color={c.foreground} />
              </TouchableOpacity>
            </View>
            <View style={styles.gifZoomControls}>
              <Text style={[styles.gifZoomLabel, { color: c.mutedForeground }]}>Nivel de detalle</Text>
              <View style={styles.gifZoomButtons}>
                <TouchableOpacity
                  onPress={() => adjustZoom(-0.5)}
                  disabled={zoomScale <= 1}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel="Reducir ampliación"
                  style={[styles.gifZoomButton, { backgroundColor: c.muted, opacity: zoomScale <= 1 ? 0.45 : 1 }]}
                >
                  <Feather name="minus" size={17} color={c.foreground} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setZoomScale(1)}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel="Restablecer ampliación al 100 por ciento"
                  style={[styles.gifZoomPercent, { borderColor: c.border }]}
                >
                  <Text style={[styles.gifZoomPercentText, { color: c.foreground }]}>{Math.round(zoomScale * 100)}%</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => adjustZoom(0.5)}
                  disabled={zoomScale >= 3}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel="Aumentar ampliación"
                  style={[styles.gifZoomButton, { backgroundColor: c.primary, opacity: zoomScale >= 3 ? 0.45 : 1 }]}
                >
                  <Feather name="plus" size={17} color={c.primaryForeground} />
                </TouchableOpacity>
              </View>
            </View>
            <ScrollView
              style={styles.gifModalViewport}
              contentContainerStyle={styles.gifModalVerticalContent}
              nestedScrollEnabled
              showsVerticalScrollIndicator
            >
              <ScrollView
                horizontal
                contentContainerStyle={styles.gifModalHorizontalContent}
                nestedScrollEnabled
                showsHorizontalScrollIndicator
              >
                <ExpoImage
                  source={uri}
                  contentFit="contain"
                  style={[styles.gifModalImage, {
                    width: 700 * zoomScale,
                    height: 1040 * zoomScale,
                  }]}
                  autoplay
                />
              </ScrollView>
            </ScrollView>
            <Text style={[styles.gifModalHint, { color: c.mutedForeground }]}>
              Usa − y + para leer detalles. Desplázate por la imagen ampliada y cierra para continuar.
            </Text>
          </View>
        </View>
      </Modal>
    </>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  progressRow:   { height: 6, marginBottom: 6, overflow: 'hidden' },
  progressFill:  { height: 6, minWidth: 12 },
  progressLabel: {
    fontSize: 12, marginBottom: 16,
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_400Regular' }),
  },
  typeBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 5, marginBottom: 12,
  },
  typeBadgeText: {
    fontSize: 11, fontWeight: '700', letterSpacing: 0.5,
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_700Bold' }),
  },
  nodeCard:   { borderWidth: 2, padding: 18, marginBottom: 20, gap: 10 },
  nodeText:   {
    fontSize: 18, fontWeight: '700', lineHeight: 25,
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_700Bold' }),
  },
  nodeDetail: {
    fontSize: 13, lineHeight: 19,
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_400Regular' }),
  },
  gifCard: {
    borderWidth: 1, padding: 12, marginBottom: 16, gap: 10,
  },
  gifHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10,
  },
  gifTitleGroup: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8,
  },
  gifTitle: {
    fontSize: 13, fontWeight: '700',
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_700Bold' }),
  },
  gifLabel: {
    fontSize: 11, lineHeight: 16, marginTop: 1,
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_400Regular' }),
  },
  gifToggle: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 8, paddingVertical: 6, borderWidth: 1, borderRadius: 7,
  },
  gifToggleText: {
    fontSize: 11, fontWeight: '700',
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_700Bold' }),
  },
  gifImage: {
    width: '100%', height: 190, borderRadius: 8,
  },
  gifImageFrame: {
    position: 'relative', overflow: 'hidden', borderRadius: 8,
  },
  gifZoomHint: {
    position: 'absolute', right: 8, bottom: 8,
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 8, paddingVertical: 6, borderRadius: 6,
  },
  gifZoomHintText: {
    fontSize: 11, fontWeight: '700',
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_700Bold' }),
  },
  gifHidden: {
    fontSize: 12, lineHeight: 18, paddingVertical: 7,
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_400Regular' }),
  },
  gifModalBackdrop: {
    flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.82)',
    alignItems: 'center', justifyContent: 'center', padding: 16,
  },
  gifModalPanel: {
    width: '100%', maxWidth: 760, maxHeight: '94%', padding: 16, borderRadius: 14, gap: 12,
  },
  gifModalHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
  },
  gifModalTitle: {
    fontSize: 16, fontWeight: '800',
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_700Bold' }),
  },
  gifModalLabel: {
    fontSize: 12, lineHeight: 17, marginTop: 2,
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_400Regular' }),
  },
  gifModalClose: {
    width: 38, height: 38, borderRadius: 19,
    alignItems: 'center', justifyContent: 'center',
  },
  gifModalImage: {
    borderRadius: 10,
  },
  gifZoomControls: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12,
  },
  gifZoomLabel: {
    flex: 1, fontSize: 12,
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_400Regular' }),
  },
  gifZoomButtons: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
  },
  gifZoomButton: {
    width: 34, height: 34, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
  },
  gifZoomPercent: {
    minWidth: 52, height: 34, paddingHorizontal: 8, borderWidth: 1, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
  },
  gifZoomPercentText: {
    fontSize: 12, fontWeight: '700',
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_700Bold' }),
  },
  gifModalViewport: {
    height: 500, borderRadius: 10, backgroundColor: 'rgba(0, 0, 0, 0.08)',
  },
  gifModalVerticalContent: {
    alignItems: 'stretch', paddingVertical: 8,
  },
  gifModalHorizontalContent: {
    alignItems: 'center', paddingHorizontal: 12,
  },
  gifModalHint: {
    fontSize: 12, textAlign: 'center',
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_400Regular' }),
  },
  tipBox:  { flexDirection: 'row', gap: 8, padding: 12, alignItems: 'flex-start' },
  tipText: {
    flex: 1, fontSize: 12, lineHeight: 17,
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_400Regular' }),
  },
  sectionTitle: {
    fontSize: 15, fontWeight: '700',
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_700Bold' }),
  },
  bulletItem: {
    fontSize: 13, lineHeight: 20,
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_400Regular' }),
  },
  options:  { gap: 10, marginBottom: 12 },
  optionBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderWidth: 1.5,
  },
  optionText: {
    flex: 1, fontSize: 15, fontWeight: '600',
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_600SemiBold' }),
  },
  evidenceSection: { marginBottom: 16, gap: 10 },
  evidencePreview: { position: 'relative', alignSelf: 'center' },
  evidenceImg:     { width: 200, height: 150 },
  evidenceCheckBadge: {
    position: 'absolute', top: 8, right: 8, width: 28, height: 28,
    borderRadius: 14, alignItems: 'center', justifyContent: 'center',
  },
  captureBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, padding: 16, borderWidth: 1.5, borderStyle: 'dashed',
  },
  captureBtnText: {
    fontSize: 15, fontWeight: '600',
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_600SemiBold' }),
  },
  evidenceLabel: {
    fontSize: 12, textAlign: 'center',
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_400Regular' }),
  },
  continueSection: { gap: 10 },
  skipLink: { alignItems: 'center', padding: 10 },
  skipText: {
    fontSize: 13, textDecorationLine: 'underline',
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_400Regular' }),
  },
  // Búsqueda de códigos
  searchRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 14, paddingVertical: 11, borderWidth: 1, marginBottom: 14,
  },
  searchInput: {
    flex: 1, fontSize: 15,
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_400Regular' }),
  },
  codigoItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 14, borderWidth: 1, marginBottom: 8,
  },
  codigoBadge: { paddingHorizontal: 10, paddingVertical: 5, minWidth: 50, alignItems: 'center' },
  codigoBadgeText: {
    fontSize: 13, fontWeight: '800', letterSpacing: 0.5,
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_700Bold' }),
    color: '#F5821F',
  },
  codigoDescripcion: {
    fontSize: 13, fontWeight: '600',
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_600SemiBold' }),
  },
  codigoEquivalentes: {
    fontSize: 11, marginTop: 2,
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_400Regular' }),
  },
  emptyCodes: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    padding: 16, borderWidth: 1, marginBottom: 12, marginTop: 4,
  },
  emptyCodesText: {
    flex: 1, fontSize: 13, lineHeight: 19,
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_400Regular' }),
  },
  // Detalle del código
  codigoHeader: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 14,
    padding: 16, borderWidth: 2,
  },
  codigoBadgeLg: { paddingHorizontal: 12, paddingVertical: 8, alignItems: 'center', justifyContent: 'center' },
  codigoBadgeLgText: {
    fontSize: 18, fontWeight: '800', color: '#FFF', letterSpacing: 1,
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_700Bold' }),
  },
  causaRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    paddingBottom: 10, marginBottom: 10, borderBottomWidth: StyleSheet.hairlineWidth,
  },
  causaNum: { width: 26, height: 26, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  causaNumText: {
    fontSize: 13, fontWeight: '700',
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_700Bold' }),
  },
  causaText: {
    flex: 1, fontSize: 14, lineHeight: 20,
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_400Regular' }),
  },
  solucionBox: { padding: 16, borderWidth: 1 },
  parteRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10,
  },
  parteText: {
    fontSize: 13,
    fontFamily: Platform.select({ ios: 'System', default: 'Inter_400Regular' }),
  },
});
