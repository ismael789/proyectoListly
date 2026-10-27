import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { isApiConfigured } from '../../src/api/client';
import { useAuth } from '../../src/auth-context';
import { Heading } from '../../src/components';
import { useLists } from '../../src/store';
import { ThemeMode, useAppTheme } from '../../src/theme';
import { useResponsiveLayout } from '../../src/responsive';

interface ThemeOption {
  value: ThemeMode;
  label: string;
  detail: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const themeOptions: ThemeOption[] = [
  {
    value: 'light',
    label: 'Claro',
    detail: 'Fondos marfil y superficies limpias',
    icon: 'sunny-outline',
  },
  {
    value: 'dark',
    label: 'Oscuro',
    detail: 'Fondo carbón y tonos verdes suaves',
    icon: 'moon-outline',
  },
  {
    value: 'system',
    label: 'Automático',
    detail: 'Sincronizar con el tema del sistema Android',
    icon: 'phone-portrait-outline',
  },
];

export default function SettingsScreen() {
  const { colors, mode, setMode } = useAppTheme();
  const { horizontalPadding } = useResponsiveLayout();
  const { preferences, updatePreferences, resetToDemoData, clearAllData, lists } =
    useLists();
  const { signOut } = useAuth();

  function handleResetDemo() {
    Alert.alert(
      'Restablecer datos de demostración',
      '¿Deseas restaurar las listas y tareas de ejemplo iniciales? Los cambios no guardados se reemplazarán.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Restablecer',
          style: 'destructive',
          onPress: () => {
            resetToDemoData();
            Alert.alert('Éxito', 'Las listas de demostración han sido restauradas.');
          },
        },
      ]
    );
  }

  function handleClearAll() {
    Alert.alert(
      'Eliminar todos los datos',
      '¿Estás seguro de que deseas borrar todas las listas y elementos? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar todo',
          style: 'destructive',
          onPress: () => {
            clearAllData();
            Alert.alert('Datos eliminados', 'Todas las listas han sido borradas.');
          },
        },
      ]
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={[styles.content, { paddingHorizontal: horizontalPadding }]}
      showsVerticalScrollIndicator={false}
    >
      <Heading
        title="Ajustes"
        subtitle="Personaliza la apariencia y el comportamiento de Listly."
      />

      {/* Sección Apariencia */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Apariencia</Text>
      <View
        style={[
          styles.cardBox,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        {themeOptions.map((item, index) => {
          const selected = mode === item.value;
          return (
            <Pressable
              key={item.value}
              onPress={() => setMode(item.value)}
              style={[
                styles.optionRow,
                {
                  borderBottomWidth: index === themeOptions.length - 1 ? 0 : 1,
                  borderBottomColor: colors.borderLight,
                },
              ]}
            >
              <View
                style={[
                  styles.optionIconBox,
                  {
                    backgroundColor: selected
                      ? colors.primary
                      : colors.primarySoft,
                  },
                ]}
              >
                <Ionicons
                  name={item.icon}
                  size={20}
                  color={selected ? colors.white : colors.primary}
                />
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={[styles.optionLabel, { color: colors.text }]}>
                  {item.label}
                </Text>
                <Text style={[styles.optionDetail, { color: colors.muted }]}>
                  {item.detail}
                </Text>
              </View>
              <Ionicons
                name={selected ? 'radio-button-on' : 'radio-button-off'}
                size={22}
                color={selected ? colors.primary : colors.muted}
              />
            </Pressable>
          );
        })}
      </View>

      {/* Preferencias de Comportamiento */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Preferencias
      </Text>
      <View
        style={[
          styles.cardBox,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <View
          style={[
            styles.prefRow,
            { borderBottomWidth: 1, borderBottomColor: colors.borderLight },
          ]}
        >
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={[styles.optionLabel, { color: colors.text }]}>
              Confirmar eliminación
            </Text>
            <Text style={[styles.optionDetail, { color: colors.muted }]}>
              Pedir confirmación antes de borrar listas o artículos
            </Text>
          </View>
          <Switch
            value={preferences.confirmDelete}
            onValueChange={val => updatePreferences({ confirmDelete: val })}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.white}
          />
        </View>

        <View style={styles.prefRow}>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={[styles.optionLabel, { color: colors.text }]}>
              Ordenar completados al final
            </Text>
            <Text style={[styles.optionDetail, { color: colors.muted }]}>
              Mantener las tareas pendientes al inicio de la lista
            </Text>
          </View>
          <Switch
            value={preferences.autoSortCompleted}
            onValueChange={val => updatePreferences({ autoSortCompleted: val })}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.white}
          />
        </View>
      </View>

      {/* Gestión de Datos */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Gestión de datos
      </Text>
      <View
        style={[
          styles.cardBox,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <Pressable
          onPress={handleResetDemo}
          style={[
            styles.prefRow,
            { borderBottomWidth: 1, borderBottomColor: colors.borderLight },
          ]}
        >
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={[styles.optionLabel, { color: colors.text }]}>
              Restablecer datos de ejemplo
            </Text>
            <Text style={[styles.optionDetail, { color: colors.muted }]}>
              Restaura las listas de supermercado, viaje y universidad
            </Text>
          </View>
          <Ionicons name="refresh-outline" size={20} color={colors.primary} />
        </Pressable>

        <Pressable onPress={handleClearAll} style={styles.prefRow}>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={[styles.optionLabel, { color: colors.danger }]}>
              Borrar todas las listas
            </Text>
            <Text style={[styles.optionDetail, { color: colors.muted }]}>
              Eliminar {lists.length} listas almacenadas localmente
            </Text>
          </View>
          <Ionicons name="trash-outline" size={20} color={colors.danger} />
        </Pressable>
      </View>

      {isApiConfigured && (
        <>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Cuenta</Text>
          <View style={[styles.cardBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                Alert.alert('Cerrar sesión', 'Se borrará la copia local de tus listas en este dispositivo.', [
                  { text: 'Cancelar', style: 'cancel' },
                  {
                    text: 'Cerrar sesión',
                    style: 'destructive',
                    onPress: () => {
                      clearAllData();
                      void signOut().catch(error => {
                        Alert.alert('No se pudo cerrar sesión', error instanceof Error ? error.message : 'Inténtalo nuevamente.');
                      });
                    },
                  },
                ]);
              }}
              style={styles.prefRow}
            >
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={[styles.optionLabel, { color: colors.danger }]}>Cerrar sesión</Text>
                <Text style={[styles.optionDetail, { color: colors.muted }]}>Desconectar esta cuenta de Listly</Text>
              </View>
              <Ionicons name="log-out-outline" size={20} color={colors.danger} />
            </Pressable>
          </View>
        </>
      )}

      {/* Acerca de y Preparación Cloud / Wear OS */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Acerca de</Text>
      <View
        style={[
          styles.cardBox,
          { backgroundColor: colors.surface, borderColor: colors.border, padding: 18, gap: 10 },
        ]}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View
            style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              backgroundColor: colors.primary,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="checkmark" size={22} color={colors.white} />
          </View>
          <View>
            <Text style={[styles.aboutBrand, { color: colors.text }]}>Listly</Text>
            <Text style={[styles.aboutVersion, { color: colors.muted }]}>
              v1.0.0 (Expo SDK 57)
            </Text>
          </View>
        </View>

        <Text style={[styles.aboutDesc, { color: colors.textSecondary }]}>
          Listly es tu gestor minimalista de listas y tareas. Diseñado con una
          identidad visual en verde bosque, superficies marfil y soporte para tema oscuro.
        </Text>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            backgroundColor: colors.surfaceAlt,
            padding: 10,
            borderRadius: 12,
            marginTop: 4,
          }}
        >
          <Ionicons name="watch-outline" size={18} color={colors.primary} />
          <Text style={{ fontSize: 11, color: colors.textSecondary, flex: 1 }}>
            Preparado para sincronización con ListlyWatch (Wear OS) mediante backend en la nube.
          </Text>
        </View>
      </View>

      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
  paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 28,
    gap: 14,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginTop: 10,
    letterSpacing: -0.2,
  },
  cardBox: {
    borderWidth: 1,
    borderRadius: 18,
    overflow: 'hidden',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  optionIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  optionDetail: {
    fontSize: 12,
    lineHeight: 16,
  },
  prefRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    gap: 12,
  },
  aboutBrand: {
    fontSize: 17,
    fontWeight: '800',
  },
  aboutVersion: {
    fontSize: 12,
    fontWeight: '500',
  },
  aboutDesc: {
    fontSize: 13,
    lineHeight: 19,
  },
});
