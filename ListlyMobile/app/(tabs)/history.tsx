import { useState } from 'react';
import { router } from 'expo-router';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Badge, EmptyState, Heading, ListCard } from '../../src/components';
import { useLists } from '../../src/store';
import { useAppTheme } from '../../src/theme';
import { useResponsiveLayout } from '../../src/responsive';

export default function HistoryScreen() {
  const { lists, toggleItem, deleteItem, preferences } = useLists();
  const { colors } = useAppTheme();
  const { horizontalPadding } = useResponsiveLayout();
  const [viewMode, setViewMode] = useState<'items' | 'lists'>('items');

  // Obtener todos los elementos completados de todas las listas
  const completedItems = lists.flatMap(list =>
    list.items
      .filter(item => item.completed)
      .map(item => ({
        ...item,
        listId: list.id,
        listName: list.name,
        listCategory: list.category,
      }))
  );

  // Ordenar los más recientes primero si tienen fecha
  completedItems.sort((a, b) => {
    const timeA = a.completedAt ? new Date(a.completedAt).getTime() : 0;
    const timeB = b.completedAt ? new Date(b.completedAt).getTime() : 0;
    return timeB - timeA;
  });

  // Listas completamente finalizadas
  const completedLists = lists.filter(
    list => list.items.length > 0 && list.items.every(item => item.completed)
  );

  function formatDate(iso?: string | null): string {
    if (!iso) return 'Reciente';
    try {
      const date = new Date(iso);
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Reciente';
    }
  }

  function handleReactivateItem(listId: string, itemId: string, name: string) {
    Alert.alert(
      'Reactivar tarea',
      `¿Deseas volver a marcar "${name}" como pendiente?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Reactivar',
          onPress: () => toggleItem(listId, itemId),
        },
      ]
    );
  }

  function handleDeleteCompletedItem(listId: string, itemId: string, name: string) {
    if (preferences.confirmDelete) {
      Alert.alert(
        'Eliminar del historial',
        `¿Eliminar definitivamente "${name}"?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Eliminar',
            style: 'destructive',
            onPress: () => deleteItem(listId, itemId),
          },
        ]
      );
    } else {
      deleteItem(listId, itemId);
    }
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={[styles.content, { paddingHorizontal: horizontalPadding }]}
      showsVerticalScrollIndicator={false}
    >
      <Heading
        title="Historial"
        subtitle="Registro de tus tareas y listas completadas."
      />

      {/* Selector de vista: Tareas vs Listas completas */}
      <View style={styles.tabSelector}>
        <Pressable
          onPress={() => setViewMode('items')}
          style={[
            styles.tabButton,
            {
              backgroundColor: viewMode === 'items' ? colors.primary : colors.surface,
              borderColor: viewMode === 'items' ? colors.primary : colors.border,
            },
          ]}
        >
          <Ionicons
            name="checkbox"
            size={16}
            color={viewMode === 'items' ? colors.white : colors.textSecondary}
          />
          <Text
            style={[
              styles.tabButtonText,
              { color: viewMode === 'items' ? colors.white : colors.textSecondary },
            ]}
          >
            Tareas ({completedItems.length})
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setViewMode('lists')}
          style={[
            styles.tabButton,
            {
              backgroundColor: viewMode === 'lists' ? colors.primary : colors.surface,
              borderColor: viewMode === 'lists' ? colors.primary : colors.border,
            },
          ]}
        >
          <Ionicons
            name="albums"
            size={16}
            color={viewMode === 'lists' ? colors.white : colors.textSecondary}
          />
          <Text
            style={[
              styles.tabButtonText,
              { color: viewMode === 'lists' ? colors.white : colors.textSecondary },
            ]}
          >
            Listas ({completedLists.length})
          </Text>
        </Pressable>
      </View>

      {/* Vista de tareas individuales completadas */}
      {viewMode === 'items' && (
        <View style={{ gap: 10 }}>
          {completedItems.length > 0 ? (
            completedItems.map(item => (
              <View
                key={`${item.listId}-${item.id}`}
                style={[
                  styles.historyCard,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                ]}
              >
                <View
                  style={[
                    styles.checkBadge,
                    { backgroundColor: colors.primarySoft },
                  ]}
                >
                  <Ionicons name="checkmark-done" size={18} color={colors.primary} />
                </View>

                <View style={{ flex: 1, gap: 4 }}>
                  <Text
                    style={[
                      styles.itemTitle,
                      { color: colors.text, textDecorationLine: 'line-through' },
                    ]}
                  >
                    {item.name}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={[styles.itemMeta, { color: colors.muted }]}>
                      Cant: {item.quantity}
                    </Text>
                    <Text style={{ color: colors.border }}>•</Text>
                    <Pressable
                      onPress={() =>
                        router.push({
                          pathname: '/list/[id]',
                          params: { id: item.listId },
                        })
                      }
                      hitSlop={4}
                    >
                      <Text style={[styles.itemMetaList, { color: colors.primary }]}>
                        {item.listName}
                      </Text>
                    </Pressable>
                    <Text style={{ color: colors.border }}>•</Text>
                    <Text style={[styles.itemMeta, { color: colors.muted }]}>
                      {formatDate(item.completedAt)}
                    </Text>
                  </View>
                </View>

                {/* Acciones de item en historial */}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Pressable
                    onPress={() =>
                      handleReactivateItem(item.listId, item.id, item.name)
                    }
                    hitSlop={8}
                    style={[
                      styles.iconBtn,
                      { backgroundColor: colors.surfaceAlt },
                    ]}
                  >
                    <Ionicons
                      name="refresh-outline"
                      size={17}
                      color={colors.primary}
                    />
                  </Pressable>
                  <Pressable
                    onPress={() =>
                      handleDeleteCompletedItem(item.listId, item.id, item.name)
                    }
                    hitSlop={8}
                    style={[
                      styles.iconBtn,
                      { backgroundColor: colors.surfaceAlt },
                    ]}
                  >
                    <Ionicons
                      name="trash-outline"
                      size={17}
                      color={colors.muted}
                    />
                  </Pressable>
                </View>
              </View>
            ))
          ) : (
            <EmptyState
              title="No hay tareas completadas"
              body="Cuando marques tareas como terminadas en tus listas, podrás revisarlas aquí."
              icon="time-outline"
            />
          )}
        </View>
      )}

      {/* Vista de listas 100% completadas */}
      {viewMode === 'lists' && (
        <View style={{ gap: 10 }}>
          {completedLists.length > 0 ? (
            completedLists.map(list => (
              <ListCard
                key={list.id}
                list={list}
                onPress={() =>
                  router.push({
                    pathname: '/list/[id]',
                    params: { id: list.id },
                  })
                }
              />
            ))
          ) : (
            <EmptyState
              title="No hay listas completadas"
              body="Completa todos los elementos de alguna de tus listas para que figure aquí."
              icon="trophy-outline"
            />
          )}
        </View>
      )}

      <View style={{ height: 16 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
  paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 24,
    gap: 16,
  },
  tabSelector: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 2,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
  },
  tabButtonText: {
    fontSize: 13,
    fontWeight: '700',
  },
  historyCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 13,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkBadge: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  itemMeta: {
    fontSize: 11,
  },
  itemMetaList: {
    fontSize: 11,
    fontWeight: '700',
  },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
