import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const AUTH_SESSION_KEY = 'listly-watch-auth-session';
const sessionClearedListeners = new Set<() => void>();

export interface AuthSession {
  access_token: string;
  refresh_token: string;
  expires_at?: number;
}

export async function loadAuthSession(): Promise<AuthSession | null> {
  const raw = Platform.OS === 'web'
    ? await AsyncStorage.getItem(AUTH_SESSION_KEY)
    : await SecureStore.getItemAsync(AUTH_SESSION_KEY);
  return raw ? JSON.parse(raw) as AuthSession : null;
}

export async function saveAuthSession(session: AuthSession): Promise<void> {
  const storedSession: AuthSession = {
    access_token: session.access_token,
    refresh_token: session.refresh_token,
    expires_at: session.expires_at,
  };
  if (Platform.OS === 'web') {
    await AsyncStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(storedSession));
  } else {
    await SecureStore.setItemAsync(AUTH_SESSION_KEY, JSON.stringify(storedSession));
  }
}

export async function clearAuthSession(): Promise<void> {
  if (Platform.OS === 'web') {
    await AsyncStorage.removeItem(AUTH_SESSION_KEY);
  } else {
    await SecureStore.deleteItemAsync(AUTH_SESSION_KEY);
  }
  sessionClearedListeners.forEach(listener => listener());
}

export function onAuthSessionCleared(listener: () => void): () => void {
  sessionClearedListeners.add(listener);
  return () => sessionClearedListeners.delete(listener);
}
