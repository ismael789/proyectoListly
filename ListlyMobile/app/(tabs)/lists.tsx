import { useState } from 'react';
import { router } from 'expo-router';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Badge, EmptyState, Heading, ListCard, PrimaryButton } from '../../src/components';
import { ListCategory, useLists } from '../../src/store';
import { useAppTheme } from '../../src/theme';
import { useResponsiveLayout } from '../../src/responsive';

const allCategories: ('Todas' | ListCategory)[] = [
  'Todas',
  'Compras',
  'Universidad',
  'Hogar',
  'Viaje',
  'Trabajo',
  'Personal',
  'General',
];

export default function ListsScreen() {
  const { lists } = useLists();
  const { colors } = useAppTheme();
  const { horizontalPadding } = useResponsiveLayout();
  const [selectedCategory, setSelectedCategory] = useState<'Todas' | ListCategory>('Todas');
  const [searchQuery, setSearchQuery] = useState('');

  // Filtrado por categoría y búsqueda
  const filteredLists = lists.filter(list => {
    const matchesCategory =
      selectedCategory === 'Todas' || list.category === selectedCategory;
    const matchesSearch =
      searchQuery.trim() === '' ||
      list.name.toLowerCase().includes(searchQuery.toLowerCase().trim());
    return matchesCategory && matchesSearch;
  });

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={[styles.content, { paddingHorizontal: horizontalPadding }]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <Heading
        title="Mis listas"
        subtitle="Administra y organiza tus tareas por categoría."
        rightElement={
          <Pressable
            onPress={() => router.push('/create-list')}
            style={[
              styles.addIconButton,
              { backgroundColor: colors.primary, borderColor: colors.primary },
            ]}
            hitSlop={8}
          >
            <Ionicons name="add" size={20} color={colors.white} />
          </Pressable>
        }
      />

      {/* Buscador rápido */}
      <View
        style={[
          styles.searchBox,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <Ionicons name="search-outline" size={18} color={colors.muted} />
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Buscar una lista..."
          placeholderTextColor={colors.muted}
          style={[styles.searchInput, { color: colors.text }]}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={() => setSearchQuery('')} hitSlop={8}>
            <Ionicons name="close-circle" size={17} color={colors.muted} />
          </Pressable>
        )}
      </View>

      {/* Filtros de categoría */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.categoriesRow, { paddingRight: horizontalPadding }]}
      >
        {allCategories.map(cat => (
          <Badge
            key={cat}
            label={cat}
            active={selectedCategory === cat}
            onPress={() => setSelectedCategory(cat)}
          />
        ))}
      </ScrollView>

      {/* Lista de tarjetas o estado vacío */}
      <View style={{ gap: 10 }}>
        <View style={styles.listHeaderRow}>
          <Text style={[styles.listHeaderCount, { color: colors.muted }]}>
            {filteredLists.length} {filteredLists.length === 1 ? 'lista' : 'listas'}{' '}
            {selectedCategory !== 'Todas' ? `en ${selectedCategory}` : ''}
          </Text>
        </View>

        {filteredLists.length > 0 ? (
          filteredLists.map(list => (
            <ListCard
              key={list.id}
              list={list}
              onPress={() =>
                router.push({ pathname: '/list/[id]', params: { id: list.id } })
              }
            />
          ))
        ) : (
          <EmptyState
            title={
              searchQuery.trim().length > 0
                ? 'No se encontraron resultados'
                : 'No hay listas en esta categoría'
            }
            body={
              searchQuery.trim().length > 0
                ? `No existe ninguna lista con el término "${searchQuery}".`
                : 'Crea una nueva lista o selecciona otra categoría.'
            }
            icon="search-outline"
            actionTitle="Crear lista"
            onAction={() => router.push('/create-list')}
          />
        )}
      </View>

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
  addIconButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    padding: 0,
  },
  categoriesRow: {
    gap: 8,
    paddingVertical: 2,
  },
  listHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  listHeaderCount: {
    fontSize: 12,
    fontWeight: '600',
  },
});
