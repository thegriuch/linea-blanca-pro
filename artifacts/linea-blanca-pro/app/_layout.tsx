import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { DiagnosticoProvider } from '@/contexts/DiagnosticoContext';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from '@expo-google-fonts/inter';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: 'Atrás', headerShadowVisible: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="diagnostico/nuevo" options={{ title: 'Nuevo Diagnóstico', headerShadowVisible: false }} />
      <Stack.Screen name="diagnostico/falla" options={{ title: 'Seleccionar Falla', headerShadowVisible: false }} />
      <Stack.Screen name="diagnostico/arbol" options={{ title: 'Diagnóstico Guiado', headerShadowVisible: false }} />
      <Stack.Screen name="diagnostico/conclusion" options={{ title: 'Conclusión', headerShadowVisible: false }} />
      <Stack.Screen name="diagnostico/resultado/[id]" options={{ title: 'Resultado', headerShadowVisible: false }} />
      <Stack.Screen name="biblioteca/[category]" options={{ title: 'Biblioteca', headerShadowVisible: false }} />
      <Stack.Screen name="biblioteca/articulo/[id]" options={{ title: 'Artículo', headerShadowVisible: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <GestureHandlerRootView>
            <KeyboardProvider>
              <DiagnosticoProvider>
                <RootLayoutNav />
              </DiagnosticoProvider>
            </KeyboardProvider>
          </GestureHandlerRootView>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
