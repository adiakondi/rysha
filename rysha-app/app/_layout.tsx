// app/_layout.tsx
import { Slot } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    // Hide splash as soon as layout mounts (safe and fast)
    SplashScreen.hideAsync().catch(() => {
      // Silent catch — prevents crash if already hidden
    });
  }, []);

  return <Slot />;
}