import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useLists } from '../src/store';
import { useAuth } from '../src/auth-context';
import { AuthSession, clearAuthSession } from '../src/auth-storage';
import { ApiError } from '../src/api/client';
import { login, register } from '../src/api/auth.api';
import { useAppTheme } from '../src/theme';

export default function AuthScreen() {
  const { colors } = useAppTheme();
  const { saveSession, activateSession, error: sessionError, isLoading: authLoading } = useAuth();
  const { syncFromApi } = useLists();
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (authLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator color={colors.primary} />
      </View>
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
        setMessage('Revisa tu correo para confirmar la cuenta y luego inicia sesión.');
        return;
      }

      const session = response.session as AuthSession;
      await saveSession(session);
      const synced = await syncFromApi();
      if (!synced) {
        await clearAuthSession();
        setError('La cuenta se autenticó, pero no se pudo cargar la base de datos. Verifica la migración de Supabase y vuelve a intentarlo.');
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
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text }]}>Listly</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {isRegistering ? 'Crea tu cuenta para sincronizar tus listas.' : 'Inicia sesión para ver tus listas.'}
        </Text>

        <TextInput
          accessibilityLabel="Correo electrónico"
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          placeholder="Correo electrónico"
          placeholderTextColor={colors.muted}
          value={email}
          onChangeText={setEmail}
          style={[styles.input, { color: colors.text, borderColor: colors.border }]}
        />
        <TextInput
          accessibilityLabel="Contraseña"
          autoCapitalize="none"
          autoComplete={isRegistering ? 'new-password' : 'password'}
          placeholder="Contraseña (mínimo 8 caracteres)"
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
            ? <ActivityIndicator color={colors.white} />
            : <Text style={[styles.submitText, { color: colors.white }]}>{isRegistering ? 'Crear cuenta' : 'Iniciar sesión'}</Text>}
        </Pressable>

        <Pressable
          accessibilityRole="button"
          disabled={isSubmitting}
          onPress={() => {
            setIsRegistering(!isRegistering);
            setError(null);
            setMessage(null);
          }}
          style={styles.switchMode}
        >
          <Text style={[styles.switchText, { color: colors.primary }]}>
            {isRegistering ? 'Ya tengo una cuenta' : 'Crear una cuenta'}
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  card: { width: '100%', maxWidth: 440, alignSelf: 'center', borderWidth: 1, borderRadius: 24, padding: 24, gap: 14 },
  title: { fontSize: 30, fontWeight: '800', textAlign: 'center' },
  subtitle: { fontSize: 15, textAlign: 'center', marginBottom: 8 },
  input: { minHeight: 50, borderWidth: 1, borderRadius: 14, paddingHorizontal: 14, fontSize: 16 },
  feedback: { fontSize: 14, lineHeight: 20 },
  submit: { minHeight: 50, alignItems: 'center', justifyContent: 'center', borderRadius: 15 },
  submitText: { fontSize: 16, fontWeight: '700' },
  switchMode: { alignItems: 'center', paddingVertical: 8 },
  switchText: { fontSize: 15, fontWeight: '700' },
});
