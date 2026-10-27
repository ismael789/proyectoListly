import Constants from 'expo-constants';

const configuredUrl = process.env.EXPO_PUBLIC_LISTLY_API_URL?.trim();
const expoHostUri = (Constants.expoConfig as { hostUri?: string } | null)?.hostUri;
const expoHost = expoHostUri?.split(':')[0];

// In Expo Go, hostUri is the machine running Metro. Reuse that host for the API.
export const API_BASE_URL = (configuredUrl || (expoHost ? `http://${expoHost}:3000/api` : 'http://localhost:3000/api')).replace(/\/$/, '');
export const isApiConfigured = Boolean(configuredUrl || expoHost);
