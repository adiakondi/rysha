// app/_layout.tsx
import { Slot, Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase'; // or '@/lib/supabase' if using alias
import { Session } from '@supabase/supabase-js';
import { View, ActivityIndicator, Text } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';

// Prevent the splash screen from auto-hiding right away
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('[RootLayout] Effect started');

    let isMounted = true;

    const prepare = async () => {
      try {
        console.log('[RootLayout] Starting getSession');
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('[RootLayout] getSession error:', error);
        } else {
          console.log('[RootLayout] getSession success - session exists:', !!session);
          if (isMounted) setSession(session);
        }
      } catch (err) {
        console.error('[RootLayout] Unexpected error in auth init:', err);
      } finally {
        console.log('[RootLayout] finally block reached - hiding splash & setting loading false');
        if (isMounted) {
          setLoading(false);
          // Hide splash only when we're ready to show content
          await SplashScreen.hideAsync().catch((e) =>
            console.log('[RootLayout] Splash hide failed:', e)
          );
        }
      }
    };

    prepare();

    console.log('[RootLayout] Setting up auth state listener');
    const { data: listener } = supabase.auth.onAuthStateChange((event, newSession) => {
      console.log('[RootLayout] Auth state changed:', event, 'session exists:', !!newSession);
      if (isMounted) setSession(newSession);
    });

    return () => {
      isMounted = false;
      console.log('[RootLayout] Cleaning up auth listener');
      listener?.subscription.unsubscribe();
    };
  }, []);

  console.log('[RootLayout] Rendering - loading:', loading, 'session:', !!session);

  // While loading → keep splash visible (no spinner needed)
  if (loading) {
    return null; // Splash screen stays visible
  }

  // After loading finishes
  if (!session) {
    console.log('[RootLayout] No session → redirecting to login');
    return <Redirect href="/" />;
  }

  console.log('[RootLayout] Has session → rendering normal app');
  return <Slot />;
}