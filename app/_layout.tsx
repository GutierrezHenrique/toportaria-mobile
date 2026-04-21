import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuth } from '@/store/auth';
import { registerForPushAndSync } from '@/lib/push';
import { theme } from '@/lib/theme';

const qc = new QueryClient();

export default function RootLayout() {
  const token = useAuth((s) => s.token);
  const user = useAuth((s) => s.user);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const inAuth = segments[0] === 'login' || segments.length === 0;
    if (!token && !inAuth) router.replace('/login');
    if (token && inAuth) {
      if (user?.role === 'PORTEIRO') router.replace('/(porteiro)');
      else router.replace('/(morador)');
    }
  }, [token, segments, user?.role]);

  useEffect(() => {
    if (token) registerForPushAndSync().catch(() => {});
  }, [token]);

  return (
    <QueryClientProvider client={qc}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: theme.bg },
          }}
        />
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
