import { useState } from 'react';
import { router } from 'expo-router';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Heading, PrimaryButton, categoryIcons } from '../src/components';
import { ListCategory, useLists } from '../src/store';
import { useAppTheme } from '../src/theme';
import { useResponsiveLayout } from '../src/responsive';
import { validateText } from '../src/validation';

const availableCategories: ListCategory[] = [
  'Compras',
  'Universidad',
  'Hogar',
  'Viaje',
  'Trabajo',
  'Personal',
  'General',
];

export default function CreateListScreen() {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ListCategory>('Compras');
  const { addList, validationRules, validationError, fieldError, clearBackendFeedback } = useLists();
  const { colors } = useAppTheme();
  const { horizontalPadding } = useResponsiveLayout();

  async function handleSave() {
    const nameError = validateText(name, 'El nombre', validationRules?.lists.name);
    if (nameError) {
      Alert.alert('Nombre no válido', nameError);
      return;
    }
    clearBackendFeedback();
    const newListId = await addList(name, category);
    if (!newListId) return;
    router.replace({ pathname: '/list/[id]', params: { id: newListId } });
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={[styles.content, { paddingHorizontal: horizontalPadding }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
      {/* Botón Volver */}
      <Pressable
        onPress={() => router.back()}
        style={styles.backButton}
        hitSlop={8}
      >
        <Ionicons name="arrow-back" size={20} color={colors.primary} />
        <Text style={[styles.backText, { color: colors.primary }]}>Volver</Text>
      </Pressable>

      <Heading
        title="Nueva lista"
        subtitle="Organiza tus tareas dándole un nombre y una categoría."
      />
      {validationError && <Text style={[styles.devNotice, { color: colors.muted }]}>Reglas dinámicas no disponibles; se mantiene el modo local de desarrollo.</Text>}

      {/* Input Nombre */}
      <View style={{ gap: 8, marginTop: 14 }}>
        <Text style={[styles.fieldLabel, { color: colors.text }]}>
          Nombre de la lista
        </Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Ej. Compras de fin de semana, Tesis..."
          placeholderTextColor={colors.muted}
          autoFocus
          returnKeyType="done"
          onSubmitEditing={handleSave}
          maxLength={validationRules?.lists.name?.maxLength ?? undefined}
          style={[
            styles.textInput,
            {
              color: colors.text,
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        />
        {fieldError?.field === 'name' && <Text style={[styles.fieldError, { color: colors.danger }]}>{fieldError.message}</Text>}
        {validationRules?.lists.name?.maxLength !== null && validationRules?.lists.name?.maxLength !== undefined && (
          <Text style={[styles.counter, { color: colors.muted }]}>
            {name.length} / {validationRules.lists.name?.maxLength}
          </Text>
        )}
      </View>

      {/* Selector de Categoría */}
      <View style={{ gap: 10, marginTop: 8 }}>
        <Text style={[styles.fieldLabel, { color: colors.text }]}>
          Categoría
        </Text>
        <View style={styles.categoryGrid}>
          {availableCategories.map(item => {
            const isSelected = item === category;
            return (
              <Pressable
                key={item}
                onPress={() => setCategory(item)}
                style={[
                  styles.categoryChip,
                  {
                    backgroundColor: isSelected
                      ? colors.primarySoft
                      : colors.surface,
                    borderColor: isSelected ? colors.primary : colors.border,
                  },
                ]}
              >
                <Ionicons
                  name={categoryIcons[item] || 'layers-outline'}
                  size={18}
                  color={isSelected ? colors.primary : colors.muted}
                />
                <Text
                  style={[
                    styles.categoryText,
                    {
                      color: isSelected ? colors.primary : colors.text,
                      fontWeight: isSelected ? '700' : '500',
                    },
                  ]}
                >
                  {item}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={{ height: 24 }} />

      {/* Botón de acción */}
      <PrimaryButton
        title="Crear lista"
        onPress={handleSave}
        icon="checkmark"
      />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 32,
    gap: 16,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  backText: {
    fontSize: 14,
    fontWeight: '700',
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
  },
  counter: {
    alignSelf: 'flex-end',
    fontSize: 11,
  },
  fieldError: { fontSize: 12 },
  devNotice: { fontSize: 11, lineHeight: 15 },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 14,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 13,
  },
});
