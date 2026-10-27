import { router } from 'expo-router';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { isApiConfigured } from '../api/client';
import { useAuth } from '../auth-context';
import { WatchScaffold } from '../components/watch-ui';
import { useWatchLists } from '../store';
import { useWatchTheme } from '../theme';

export default function WatchSettingsScreen() {
  const { mode, setMode, colors } = useWatchTheme();
  const { reloadDemo, clearAllLists, triggerSimulatedError } = useWatchLists();
  const { signOut } = useAuth();

  return (
    <WatchScaffold title="Ajustes" showBack onBack={() => router.back()}>
      <View style={{ gap: 10 }}>
        {/* Cambiar tema */}
        <Pressable
          onPress={() => setMode(mode === 'dark' ? 'light' : 'dark')}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={`Tema visual. Actual: ${mode === 'dark' ? 'Oscuro AMOLED' : 'Claro'}. Toca para cambiar.`}
          style={({ pressed }) => [
            styles.largeSettingRow,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              opacity: pressed ? 0.75 : 1,
            },
          ]}
        >
          <View
            style={[
              styles.settingIconBox,
              { backgroundColor: colors.surfaceAlt },
            ]}
          >
            <Ionicons
              name={mode === 'dark' ? 'sunny-outline' : 'moon-outline'}
              size={20}
              color={colors.primary}
            />
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={[styles.largeSettingLabel, { color: colors.text }]}>
              Tema visual
            </Text>
            <Text style={[styles.largeSettingSub, { color: colors.textSecondary }]}>
              {mode === 'dark' ? 'Oscuro (AMOLED)' : 'Claro'}
            </Text>
          </View>
        </Pressable>

        {/* Restaurar demo */}
        <Pressable
          onPress={() => {
            reloadDemo();
            router.back();
          }}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Restaurar listas de demostración iniciales"
          style={({ pressed }) => [
            styles.largeSettingRow,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              opacity: pressed ? 0.75 : 1,
            },
          ]}
        >
          <View
            style={[
              styles.settingIconBox,
              { backgroundColor: colors.surfaceAlt },
            ]}
          >
            <Ionicons name="refresh-outline" size={20} color={colors.primary} />
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={[styles.largeSettingLabel, { color: colors.text }]}>
              Restaurar demo
            </Text>
            <Text style={[styles.largeSettingSub, { color: colors.textSecondary }]}>
              Recargar listas de ejemplo
            </Text>
          </View>
        </Pressable>

        {/* Probar estado de error recuperable */}
        <Pressable
          onPress={() => {
            triggerSimulatedError();
            router.back();
          }}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Probar pantalla de error recuperable"
          style={({ pressed }) => [
            styles.largeSettingRow,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              opacity: pressed ? 0.75 : 1,
            },
          ]}
        >
          <View
            style={[
              styles.settingIconBox,
              { backgroundColor: colors.surfaceAlt },
            ]}
          >
            <Ionicons name="bug-outline" size={20} color={colors.muted} />
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={[styles.largeSettingLabel, { color: colors.text }]}>
              Probar error
            </Text>
            <Text style={[styles.largeSettingSub, { color: colors.textSecondary }]}>
              Ver pantalla de reintento
            </Text>
          </View>
        </Pressable>

        {/* Vaciar listas (probar estado sin listas) */}
        <Pressable
          onPress={() => {
            clearAllLists();
            router.back();
          }}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Vaciar todas las listas del reloj para probar el estado vacío"
          style={({ pressed }) => [
            styles.largeSettingRow,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              opacity: pressed ? 0.75 : 1,
            },
          ]}
        >
          <View
            style={[
              styles.settingIconBox,
              { backgroundColor: colors.surfaceAlt },
            ]}
          >
            <Ionicons name="trash-outline" size={20} color={colors.danger} />
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={[styles.largeSettingLabel, { color: colors.danger }]}>
              Vaciar listas
            </Text>
            <Text style={[styles.largeSettingSub, { color: colors.textSecondary }]}>
              Ver pantalla vacía
            </Text>
          </View>
        </Pressable>

        {isApiConfigured && (
          <Pressable
            onPress={() => {
              clearAllLists();
              void signOut().catch(error => {
                Alert.alert('No se pudo cerrar sesión', error instanceof Error ? error.message : 'Inténtalo nuevamente.');
              });
            }}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Cerrar sesión y borrar la copia local"
            style={({ pressed }) => [
              styles.largeSettingRow,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                opacity: pressed ? 0.75 : 1,
              },
            ]}
          >
            <View style={[styles.settingIconBox, { backgroundColor: colors.surfaceAlt }]}>
              <Ionicons name="log-out-outline" size={20} color={colors.danger} />
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={[styles.largeSettingLabel, { color: colors.danger }]}>Cerrar sesión</Text>
              <Text style={[styles.largeSettingSub, { color: colors.textSecondary }]}>Desconectar esta cuenta</Text>
            </View>
          </Pressable>
        )}
      </View>
    </WatchScaffold>
  );
}

const styles = StyleSheet.create({
  largeSettingRow: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  settingIconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  largeSettingLabel: {
    fontSize: 15,
    fontWeight: '800',
  },
  largeSettingSub: {
    fontSize: 12,
    fontWeight: '500',
  },
});
