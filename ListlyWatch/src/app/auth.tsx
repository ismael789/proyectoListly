import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { WatchScaffold } from '../components/watch-ui';
import { useAuth } from '../auth-context';
import { AuthSession, clearAuthSession } from '../auth-storage';
import { ApiError } from '../api/client';
import { login, register } from '../api/auth.api';
import { useWatchLists } from '../store';
import { useWatchTheme } from '../theme';

export default function WatchAuthScreen() {
  const { colors } = useWatchTheme();
  const { saveSession, activateSession, error: sessionError, isLoading: authLoading } = useAuth();
  const { syncFromApi } = useWatchLists();
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (authLoading) {
    return (
      <WatchScaffold title="Listly">
        <View style={styles.loading}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </WatchScaffold>
    );
  }

  const submit = async () => {
    setError(null);
    setMessage(null);
    setIsSubmitting(true);
    try {
      const response = isRegistering
        ? await register(email.trim(), password)
        : await login(email.trim(), password);
      if (!response.session) {
        setMessage('Confirma tu correo y vuelve a iniciar sesión.');
        return;
      }
      const session = response.session as AuthSession;
      await saveSession(session);
      const synced = await syncFromApi();
      if (!synced) {
        await clearAuthSession();
        setError('No se pudieron cargar las listas. Revisa la conexión y la migración de Supabase.');
        return;
      }
      activateSession(session);
    } catch (submitError) {
      setError(submitError instanceof ApiError ? submitError.message : 'No se pudo completar la autenticación.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <WatchScaffold title="Listly">
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {isRegistering ? 'Crear cuenta' : 'Iniciar sesión'}
        </Text>
        <TextInput
          accessibilityLabel="Correo electrónico"
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="Correo"
          placeholderTextColor={colors.muted}
          value={email}
          onChangeText={setEmail}
          style={[styles.input, { color: colors.text, borderColor: colors.border }]}
        />
        <TextInput
          accessibilityLabel="Contraseña"
          autoCapitalize="none"
          placeholder="Contraseña (8+)"
          placeholderTextColor={colors.muted}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={[styles.input, { color: colors.text, borderColor: colors.border }]}
        />
        {(error || sessionError) && <Text style={[styles.feedback, { color: colors.danger }]}>{error || sessionError}</Text>}
        {message && <Text style={[styles.feedback, { color: colors.primary }]}>{message}</Text>}
        <Pressable
          accessibilityRole="button"
          disabled={isSubmitting}
          onPress={() => void submit()}
          style={[styles.submit, { backgroundColor: colors.primary, opacity: isSubmitting ? 0.7 : 1 }]}
        >
          {isSubmitting
            ? <ActivityIndicator color={colors.background} />
            : <Text style={[styles.submitText, { color: colors.background }]}>{isRegistering ? 'Crear cuenta' : 'Entrar'}</Text>}
        </Pressable>
        <Pressable
          disabled={isSubmitting}
          onPress={() => {
            setIsRegistering(!isRegistering);
            setError(null);
            setMessage(null);
          }}
          style={styles.switchMode}
        >
          <Text style={[styles.switchText, { color: colors.primary }]}>
            {isRegistering ? 'Ya tengo cuenta' : 'Crear cuenta'}
          </Text>
        </Pressable>
      </View>
    </WatchScaffold>
  );
}

const styles = StyleSheet.create({
  loading: { minHeight: 120, alignItems: 'center', justifyContent: 'center' },
  card: { gap: 9, borderWidth: 1, borderRadius: 20, padding: 14 },
  subtitle: { fontSize: 15, fontWeight: '700', textAlign: 'center' },
  input: { minHeight: 42, borderWidth: 1, borderRadius: 12, paddingHorizontal: 10, fontSize: 13 },
  feedback: { fontSize: 12, lineHeight: 16 },
  submit: { minHeight: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  submitText: { fontSize: 14, fontWeight: '800' },
  switchMode: { alignItems: 'center', paddingVertical: 4 },
  switchText: { fontSize: 12, fontWeight: '700' },
});
