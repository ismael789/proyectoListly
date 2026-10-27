import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  WatchEmptyState,
  WatchErrorState,
  WatchListCard,
  WatchLoadingState,
  WatchScaffold,
} from '../components/watch-ui';
import { useWatchLists } from '../store';
import { useWatchTheme } from '../theme';

export default function WatchHomeScreen() {
  const { lists, isLoading, hasError, retryLoad, reloadDemo } = useWatchLists();
  const { colors, mode, setMode } = useWatchTheme();
  const { width } = useWindowDimensions();

  // Estadísticas globales del reloj
  const totalLists = lists.length;
  const allItems = lists.flatMap(l => l.items);
  const pendingTasks = allItems.filter(i => !i.completed).length;

  if (isLoading) {
    return (
      <WatchScaffold>
        <WatchLoadingState />
      </WatchScaffold>
    );
  }

  if (hasError) {
    return (
      <WatchScaffold>
        <WatchErrorState onRetry={retryLoad} />
      </WatchScaffold>
    );
  }

  return (
    <WatchScaffold>
      {/* 1. Cabecera compacta con nombre y contador grande de tareas pendientes */}
      <View style={styles.topHeader}>
        <View style={styles.brandTitleRow}>
          <View style={[styles.brandDot, { backgroundColor: colors.primary }]} />
          <Text style={[styles.brandTitle, { color: colors.text }]}>Listly</Text>
        </View>

        {/* Contador grande y destacado de pendientes */}
        <View
          style={[
            styles.largePendingBadge,
            {
              backgroundColor: pendingTasks > 0 ? colors.primarySoft : colors.surfaceAlt,
              borderColor: pendingTasks > 0 ? colors.primary : colors.border,
            },
          ]}
        >
          <Text
            style={[
              styles.largePendingNumber,
              { color: pendingTasks > 0 ? colors.primary : colors.muted },
            ]}
          >
            {pendingTasks}
          </Text>
          <Text
            style={[
              styles.largePendingLabel,
              { color: pendingTasks > 0 ? colors.primary : colors.muted },
            ]}
          >
            {pendingTasks === 1 ? 'pendiente' : 'pendientes'}
          </Text>
        </View>
      </View>

      {/* 2. Lista vertical de tarjetas grandes (una lista por tarjeta) */}
      {totalLists > 0 ? (
        <View style={{ gap: 12 }}>
          {lists.map(list => (
            <WatchListCard
              key={list.id}
              list={list}
              onPress={() =>
                router.push({
                  pathname: '/list/[id]',
                  params: { id: list.id },
                })
              }
            />
          ))}

          {/* Acciones de pie de página amplias y cómodas */}
          <View style={[styles.footerRow, width < 340 && styles.footerColumn]}>
            {/* Alternar tema */}
            <Pressable
              onPress={() => setMode(mode === 'dark' ? 'light' : 'dark')}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={`Cambiar tema. Actual: ${mode === 'dark' ? 'Oscuro' : 'Claro'}`}
              style={({ pressed }) => [
                styles.largeFooterBtn,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  opacity: pressed ? 0.75 : 1,
                },
              ]}
              hitSlop={8}
            >
              <Ionicons
                name={mode === 'dark' ? 'sunny-outline' : 'moon-outline'}
                size={16}
                color={colors.text}
              />
              <Text style={[styles.largeFooterBtnText, { color: colors.text }]}>
                {mode === 'dark' ? 'Claro' : 'Oscuro'}
              </Text>
            </Pressable>

            {/* Ajustes / Demo */}
            <Pressable
              onPress={() => router.push('/settings')}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Ir a ajustes del reloj"
              style={({ pressed }) => [
                styles.largeFooterBtn,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  opacity: pressed ? 0.75 : 1,
                },
              ]}
              hitSlop={8}
            >
              <Ionicons name="settings-outline" size={16} color={colors.textSecondary} />
              <Text style={[styles.largeFooterBtnText, { color: colors.textSecondary }]}>
                Ajustes
              </Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <WatchEmptyState
          title="Sin listas"
          subtitle="No hay listas activas en el reloj."
          icon="file-tray-outline"
          actionLabel="Cargar listas demo"
          onAction={reloadDemo}
        />
      )}
    </WatchScaffold>
  );
}

const styles = StyleSheet.create({
  topHeader: {
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
    paddingHorizontal: 6,
  },
  brandTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },
  brandTitle: {
    fontSize: 21, // Título de 21pt visible
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  largePendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    borderWidth: 1.5,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  largePendingNumber: {
    fontSize: 18,
    fontWeight: '800',
  },
  largePendingLabel: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginTop: 6,
    paddingHorizontal: 4,
  },
  footerColumn: {
    alignItems: 'stretch',
  },
  largeFooterBtn: {
    flex: 1,
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minWidth: 0,
  },
  largeFooterBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
