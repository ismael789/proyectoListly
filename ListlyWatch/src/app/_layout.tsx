import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { WatchProvider } from '../store';
import { useWatchTheme } from '../theme';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from '../auth-context';
import { isApiConfigured } from '../api/client';

function WatchNavigator() {
  const { colors } = useWatchTheme();
  const { session } = useAuth();

  return (
    <>
      <StatusBar style={colors.isDark ? 'light' : 'dark'} hidden={false} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Protected guard={!isApiConfigured || Boolean(session)}>
          <Stack.Screen name="index" />
          <Stack.Screen name="list/[id]" />
          <Stack.Screen name="settings" options={{ presentation: 'card' }} />
        </Stack.Protected>
        <Stack.Protected guard={isApiConfigured && !session}>
          <Stack.Screen name="auth" />
        </Stack.Protected>
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <WatchProvider>
          <WatchNavigator />
        </WatchProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
