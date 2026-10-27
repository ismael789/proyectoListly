import { useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  Badge,
  Heading,
  PrimaryButton,
  QuantityStepper,
  SecondaryButton,
  categoryIcons,
} from '../../src/components';
import { ListItem, useLists } from '../../src/store';
import { useAppTheme } from '../../src/theme';
import { useResponsiveLayout } from '../../src/responsive';
import { validateNumber, validateText } from '../../src/validation';

export default function ListDetailScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const listId = Array.isArray(params.id) ? params.id[0] : params.id;
  const {
    lists,
    addItem,
    toggleItem,
    editItem,
    deleteItem,
    deleteList,
    clearCompleted,
    preferences,
    validationRules,
    validationError,
    fieldError,
    clearBackendFeedback,
  } = useLists();
  const { colors } = useAppTheme();
  const { horizontalPadding, modalMaxWidth } = useResponsiveLayout();

  // Estados para agregar artículo
  const [newItemName, setNewItemName] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState(1);

  // Estados para editar artículo modal
  const [editingItem, setEditingItem] = useState<ListItem | null>(null);
  const [editName, setEditName] = useState('');
  const [editQuantity, setEditQuantity] = useState(1);

  const list = lists.find(item => item.id === listId);

  // Pantalla de no encontrado
  if (!list) {
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: colors.background, justifyContent: 'center' },
        ]}
      >
        <View style={styles.errorCard}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.danger} />
          <Text style={[styles.errorTitle, { color: colors.text }]}>
            Lista no encontrada
          </Text>
          <Text style={[styles.errorSubtitle, { color: colors.muted }]}>
            Es posible que la lista haya sido eliminada o que el identificador sea inválido.
          </Text>
          <PrimaryButton
            title="Volver a mis listas"
            onPress={() => router.replace('/lists')}
            icon="arrow-back"
          />
        </View>
      </View>
    );
  }

  // Cálculos de progreso
  const totalItems = list.items.length;
  const completedItems = list.items.filter(item => item.completed);
  const pendingItems = list.items.filter(item => !item.completed);
  const completedCount = completedItems.length;
  const progressRatio = totalItems > 0 ? completedCount / totalItems : 0;
  const progressPercent = Math.round(progressRatio * 100);

  // Ordenar si la preferencia autoSortCompleted está activada
  const displayedItems = preferences.autoSortCompleted
    ? [...pendingItems, ...completedItems]
    : list.items;

  function handleAddItem() {
    if (!list) return;
    const trimmed = newItemName.trim();
    const dynamicNameError = validateText(trimmed, 'El nombre del artículo', validationRules?.tasks.name);
    const dynamicQuantityError = validateNumber(newItemQuantity, 'La cantidad', validationRules?.tasks.quantity);
    if (dynamicNameError || dynamicQuantityError) {
      Alert.alert('Datos no válidos', dynamicNameError || dynamicQuantityError || 'Revisa los datos.');
      return;
    }
    clearBackendFeedback();
    if (!trimmed) {
      Alert.alert('Falta el nombre', 'Ingresa el nombre del artículo para agregarlo.');
      return;
    }
    addItem(list.id, trimmed, newItemQuantity);
    setNewItemName('');
    setNewItemQuantity(1);
    Keyboard.dismiss();
  }

  function handleConfirmDeleteList() {
    if (!list) return;
    const currentListId = list.id;
    const currentListName = list.name;

    const doDelete = () => {
      deleteList(currentListId);
      router.replace('/lists');
    };

    if (preferences.confirmDelete) {
      Alert.alert(
        'Eliminar lista',
        `¿Deseas eliminar definitivamente "${currentListName}" y todos sus artículos?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Eliminar', style: 'destructive', onPress: doDelete },
        ]
      );
    } else {
      doDelete();
    }
  }

  function handlePromptEdit(item: ListItem) {
    setEditingItem(item);
    setEditName(item.name);
    setEditQuantity(item.quantity);
  }

  function handleSaveEdit() {
    if (!list || !editingItem) return;
    const trimmed = editName.trim();
    const dynamicNameError = validateText(trimmed, 'El nombre del artículo', validationRules?.tasks.name);
    const dynamicQuantityError = validateNumber(editQuantity, 'La cantidad', validationRules?.tasks.quantity);
    if (dynamicNameError || dynamicQuantityError) {
      Alert.alert('Datos no válidos', dynamicNameError || dynamicQuantityError || 'Revisa los datos.');
      return;
    }
    clearBackendFeedback();
    if (!trimmed) {
      Alert.alert('Falta el nombre', 'El artículo debe tener un nombre válido.');
      return;
    }
    editItem(list.id, editingItem.id, trimmed, editQuantity);
    setEditingItem(null);
  }

  function handleDeleteItem(item: ListItem) {
    if (!list) return;
    const currentListId = list.id;

    if (preferences.confirmDelete) {
      Alert.alert(
        'Eliminar artículo',
        `¿Deseas eliminar "${item.name}"?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Eliminar',
            style: 'destructive',
            onPress: () => deleteItem(currentListId, item.id),
          },
        ]
      );
    } else {
      deleteItem(currentListId, item.id);
    }
  }

  function handleClearCompleted() {
    if (!list) return;
    const currentListId = list.id;

    Alert.alert(
      'Limpiar completados',
      `¿Deseas eliminar los ${completedCount} artículos completados de esta lista?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar completados',
          style: 'destructive',
          onPress: () => clearCompleted(currentListId),
        },
      ]
    );
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
      {/* Barra superior con navegación y acciones */}
      <View style={styles.topBar}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backButton}
          hitSlop={8}
        >
          <Ionicons name="arrow-back" size={20} color={colors.primary} />
          <Text style={[styles.backText, { color: colors.primary }]}>Listas</Text>
        </Pressable>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Pressable
            onPress={() =>
              router.push({
                pathname: '/edit-list/[id]',
                params: { id: list.id },
              })
            }
            hitSlop={8}
            style={[styles.headerIconBtn, { backgroundColor: colors.surfaceAlt }]}
          >
            <Ionicons name="pencil" size={17} color={colors.text} />
          </Pressable>

          <Pressable
            onPress={handleConfirmDeleteList}
            hitSlop={8}
            style={[styles.headerIconBtn, { backgroundColor: colors.surfaceAlt }]}
          >
            <Ionicons name="trash-outline" size={17} color={colors.danger} />
          </Pressable>
        </View>
      </View>

      {/* Título de la lista y Categoría */}
      <View style={{ gap: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Badge
            label={list.category}
            icon={categoryIcons[list.category] || 'layers-outline'}
          />
          <Text style={[styles.dateText, { color: colors.muted }]}>
            Creada el{' '}
            {new Date(list.createdAt).toLocaleDateString('es-ES', {
              day: 'numeric',
              month: 'short',
            })}
          </Text>
        </View>
        <Text style={[styles.title, { color: colors.text }]}>{list.name}</Text>
      </View>
      {validationError && <Text style={[styles.devNotice, { color: colors.muted }]}>Reglas dinámicas no disponibles; se mantiene el modo local de desarrollo.</Text>}

      {/* Tarjeta de Progreso */}
      <View
        style={[
          styles.progressCard,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <View style={styles.progressHeaderRow}>
          <Text style={[styles.progressLabel, { color: colors.text }]}>
            Progreso general
          </Text>
          <Text style={[styles.progressPercent, { color: colors.primary }]}>
            {progressPercent}%
          </Text>
        </View>

        <View
          style={[
            styles.progressTrack,
            { backgroundColor: colors.surfaceAlt },
          ]}
        >
          <View
            style={[
              styles.progressFill,
              {
                backgroundColor: colors.primary,
                width: `${progressPercent}%`,
              },
            ]}
          />
        </View>

        <View style={styles.progressFooterRow}>
          <Text style={[styles.progressCountText, { color: colors.muted }]}>
            {completedCount} de {totalItems} completados
          </Text>
          <Text style={[styles.progressPendingText, { color: colors.muted }]}>
            {pendingItems.length} pendientes
          </Text>
        </View>
      </View>

      {/* Formulario rápido para agregar artículo */}
      <View
        style={[
          styles.addCard,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <Text style={[styles.addCardTitle, { color: colors.text }]}>
          Agregar nuevo artículo
        </Text>
        <TextInput
          value={newItemName}
          onChangeText={setNewItemName}
          placeholder="Ej. 1kg Manzanas, Baterías..."
          placeholderTextColor={colors.muted}
          returnKeyType="done"
          onSubmitEditing={handleAddItem}
          maxLength={validationRules?.tasks.name?.maxLength ?? undefined}
          style={[
            styles.addInput,
            {
              color: colors.text,
              borderColor: colors.border,
              backgroundColor: colors.surfaceAlt,
            },
          ]}
        />
        {fieldError?.field === 'name' && <Text style={[styles.fieldError, { color: colors.danger }]}>{fieldError.message}</Text>}
        {validationRules?.tasks.name?.maxLength !== null && validationRules?.tasks.name?.maxLength !== undefined && (
          <Text style={[styles.counter, { color: colors.muted }]}>
            {newItemName.length} / {validationRules.tasks.name?.maxLength}
          </Text>
        )}
        <View style={styles.addControlRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={[styles.qtyLabel, { color: colors.muted }]}>Cantidad:</Text>
            <QuantityStepper
              value={newItemQuantity}
              onChange={setNewItemQuantity}
              min={validationRules?.tasks.quantity?.min ?? 1}
              max={validationRules?.tasks.quantity?.max ?? undefined}
            />
          </View>
          <PrimaryButton
            title="Agregar"
            onPress={handleAddItem}
            icon="add"
            compact
          />
        </View>
      </View>

      {/* Sección Artículos */}
      <View style={styles.itemsHeaderRow}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Artículos ({totalItems})
        </Text>
        {completedCount > 0 && (
          <Pressable onPress={handleClearCompleted} hitSlop={6}>
            <Text style={[styles.clearLink, { color: colors.danger }]}>
              Limpiar completados
            </Text>
          </Pressable>
        )}
      </View>

      {displayedItems.length > 0 ? (
        <View style={{ gap: 8 }}>
          {displayedItems.map(item => (
            <View
              key={item.id}
              style={[
                styles.itemRow,
                {
                  backgroundColor: colors.surface,
                  borderColor: item.completed ? colors.borderLight : colors.border,
                },
              ]}
            >
              {/* Checkbox táctil grande */}
              <Pressable
                onPress={() => toggleItem(list.id, item.id)}
                style={[
                  styles.checkbox,
                  {
                    borderColor: item.completed ? colors.primary : colors.muted,
                    backgroundColor: item.completed ? colors.primary : 'transparent',
                  },
                ]}
                hitSlop={8}
              >
                {item.completed && (
                  <Ionicons name="checkmark" size={17} color={colors.white} />
                )}
              </Pressable>

              {/* Título y cantidad (tocar para editar) */}
              <Pressable
                style={{ flex: 1, gap: 3 }}
                onPress={() => handlePromptEdit(item)}
              >
                <Text
                  style={[
                    styles.itemName,
                    {
                      color: item.completed ? colors.muted : colors.text,
                      textDecorationLine: item.completed ? 'line-through' : 'none',
                    },
                  ]}
                >
                  {item.name}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <View
                    style={[
                      styles.qtyPill,
                      { backgroundColor: colors.surfaceAlt },
                    ]}
                  >
                    <Text style={[styles.qtyPillText, { color: colors.muted }]}>
                      x{item.quantity}
                    </Text>
                  </View>
                  <Text style={[styles.editHint, { color: colors.muted }]}>
                    Toca para editar
                  </Text>
                </View>
              </Pressable>

              {/* Botón eliminar artículo */}
              <Pressable
                onPress={() => handleDeleteItem(item)}
                hitSlop={8}
                style={styles.itemDeleteBtn}
              >
                <Ionicons
                  name="trash-outline"
                  size={18}
                  color={colors.muted}
                />
              </Pressable>
            </View>
          ))}
        </View>
      ) : (
        <View
          style={[
            styles.emptyItemsBox,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Ionicons name="basket-outline" size={32} color={colors.primary} />
          <Text style={[styles.emptyItemsTitle, { color: colors.text }]}>
            Esta lista está vacía
          </Text>
          <Text style={[styles.emptyItemsSub, { color: colors.muted }]}>
            Usa el recuadro superior para agregar los primeros artículos.
          </Text>
        </View>
      )}

      {/* Modal para Editar Artículo */}
      <Modal
        visible={editingItem !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setEditingItem(null)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalCard,
              { backgroundColor: colors.surface, borderColor: colors.border, ...(modalMaxWidth ? { maxWidth: modalMaxWidth } : {}) },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Editar artículo
              </Text>
              <Pressable onPress={() => setEditingItem(null)} hitSlop={8}>
                <Ionicons name="close" size={22} color={colors.muted} />
              </Pressable>
            </View>

            <View style={{ gap: 6 }}>
              <Text style={[styles.fieldLabel, { color: colors.text }]}>
                Nombre
              </Text>
              <TextInput
                value={editName}
                onChangeText={setEditName}
                placeholder="Nombre del artículo"
                placeholderTextColor={colors.muted}
                maxLength={validationRules?.tasks.name?.maxLength ?? undefined}
                style={[
                  styles.modalInput,
                  {
                    color: colors.text,
                    backgroundColor: colors.surfaceAlt,
                    borderColor: colors.border,
                  },
                ]}
              />
              {fieldError?.field === 'name' && <Text style={[styles.fieldError, { color: colors.danger }]}>{fieldError.message}</Text>}
              {validationRules?.tasks.name?.maxLength !== null && validationRules?.tasks.name?.maxLength !== undefined && (
                <Text style={[styles.counter, { color: colors.muted }]}>
                  {editName.length} / {validationRules.tasks.name?.maxLength}
                </Text>
              )}
            </View>

            <View style={{ gap: 6 }}>
              <Text style={[styles.fieldLabel, { color: colors.text }]}>
                Cantidad
              </Text>
              <QuantityStepper
                value={editQuantity}
                onChange={setEditQuantity}
                min={validationRules?.tasks.quantity?.min ?? 1}
                max={validationRules?.tasks.quantity?.max ?? undefined}
              />
            </View>

            <View style={styles.modalActions}>
              <SecondaryButton
                title="Cancelar"
                onPress={() => setEditingItem(null)}
                compact
              />
              <PrimaryButton
                title="Guardar"
                onPress={handleSaveEdit}
                icon="checkmark"
                compact
              />
            </View>
          </View>
        </View>
      </Modal>

      <View style={{ height: 28 }} />
    </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 32,
    gap: 16,
  },
  errorCard: {
    alignItems: 'center',
    gap: 12,
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: '800',
  },
  errorSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  backText: {
    fontSize: 14,
    fontWeight: '700',
  },
  headerIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateText: {
    fontSize: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  progressCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    gap: 10,
  },
  progressHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  progressPercent: {
    fontSize: 16,
    fontWeight: '800',
  },
  progressTrack: {
    height: 8,
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: 8,
    borderRadius: 6,
  },
  progressFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressCountText: {
    fontSize: 12,
  },
  progressPendingText: {
    fontSize: 12,
  },
  addCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    gap: 12,
    flexWrap: 'wrap',
  },
  addCardTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  addInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
  },
  addControlRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  qtyLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  itemsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  clearLink: {
    fontSize: 12,
    fontWeight: '700',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderRadius: 15,
    padding: 13,
    minWidth: 0,
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 8,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
  },
  qtyPill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  qtyPillText: {
    fontSize: 11,
    fontWeight: '600',
  },
  editHint: {
    fontSize: 11,
  },
  itemDeleteBtn: {
    padding: 6,
  },
  emptyItemsBox: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
    gap: 8,
  },
  emptyItemsTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  emptyItemsSub: {
    fontSize: 12,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
    alignItems: 'center',
  },
  modalCard: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 20,
    gap: 16,
    width: '100%',
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
  },
  counter: {
    alignSelf: 'flex-end',
    fontSize: 11,
  },
  fieldError: {
    fontSize: 12,
  },
  devNotice: {
    fontSize: 11,
    lineHeight: 15,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 6,
    flexWrap: 'wrap',
  },
});
