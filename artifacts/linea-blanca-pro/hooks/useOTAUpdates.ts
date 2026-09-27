import * as Updates from 'expo-updates';
import { useEffect } from 'react';
import { Alert, Platform } from 'react-native';

/**
 * FOTA (EAS Update): al arrancar la app pregunta al servidor de Expo
 * si existe una actualización publicada para este canal. Si existe,
 * la descarga en segundo plano y ofrece reiniciar para aplicarla.
 * Si el usuario elige "Después", el update se aplicará en el próximo arranque.
 */
export function useOTAUpdates() {
  useEffect(() => {
    // Los updates OTA solo funcionan en builds nativos (no en web ni en dev client).
    if (Platform.OS === 'web' || __DEV__ || !Updates.isEnabled) return;

    let cancelled = false;

    async function checkAndApply() {
      try {
        const result = await Updates.checkForUpdateAsync();
        if (cancelled || !result.isAvailable) return;

        await Updates.fetchUpdateAsync();
        if (cancelled) return;

        Alert.alert(
          'Actualización lista',
          'Se descargó una nueva versión de la app. ¿Reiniciar ahora para aplicarla?',
          [
            { text: 'Después', style: 'cancel' },
            { text: 'Reiniciar', onPress: () => void Updates.reloadAsync() },
          ],
          { cancelable: true }
        );
      } catch {
        // Sin conexión u otro error transitorio: se reintenta en el próximo arranque.
      }
    }

    void checkAndApply();

    return () => {
      cancelled = true;
    };
  }, []);
}
