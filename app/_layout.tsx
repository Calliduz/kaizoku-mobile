import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { useHistoryStore } from '@/store/useHistoryStore';
import { Colors } from '@/constants/theme';

export { ErrorBoundary } from 'expo-router';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const isHydrated = useHistoryStore((s) => s._hydrated);

  useEffect(() => {
    // Hide splash once the MMKV store has hydrated — prevents flicker
    if (isHydrated) {
      SplashScreen.hideAsync();
    }
  }, [isHydrated]);

  return (
    <GestureHandlerRootView style={styles.root}>
      <StatusBar style="light" backgroundColor={Colors.bgPrimary} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.bgPrimary },
          animation: 'fade',
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="anime/[id]"
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="player/[id]/[episodeId]"
          options={{ animation: 'fade', presentation: 'fullScreenModal' }}
        />
      </Stack>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.bgPrimary,
  },
});
