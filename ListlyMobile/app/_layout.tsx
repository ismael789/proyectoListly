import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider, useAppTheme } from '../src/theme';
import { ListProvider } from '../src/store';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from '../src/auth-context';
import { isApiConfigured } from '../src/api/client';

function RootNavigator() {
  const { colors, isDark } = useAppTheme();
  const { session } = useAuth();

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Protected guard={!isApiConfigured || Boolean(session)}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="list/[id]" />
          <Stack.Screen
            name="create-list"
            options={{ presentation: 'card', animation: 'slide_from_bottom' }}
          />
          <Stack.Screen
            name="edit-list/[id]"
            options={{ presentation: 'card', animation: 'slide_from_right' }}
          />
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
      <ThemeProvider>
        <AuthProvider>
          <ListProvider>
            <RootNavigator />
          </ListProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
