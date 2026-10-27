import { useEffect, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  WatchAllDoneBanner,
  WatchEmptyState,
  WatchItemRow,
  WatchScaffold,
  WatchToast,
  watchCategoryIcons,
} from '../../components/watch-ui';
import { useWatchLists } from '../../store';
import { useWatchTheme } from '../../theme';

export default function WatchListDetailScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const listId = Array.isArray(params.id) ? params.id[0] : params.id;
  const { lists, toggleItem, lastToggledItem, clearLastFeedback } = useWatchLists();
  const { colors } = useWatchTheme();
  const { width } = useWindowDimensions();

  const [toastMessage, setToastMessage] = useState<string>('');
  const [toastVisible, setToastVisible] = useState<boolean>(false);

  const list = lists.find(l => l.id === listId);

  // Mostrar toast sutil y legible al cambiar estado de una tarea
  useEffect(() => {
    if (lastToggledItem) {
      setToastMessage(lastToggledItem.message || (
        lastToggledItem.completed
          ? `✓ ${lastToggledItem.name}`
          : `○ ${lastToggledItem.name}`
      ));
      setToastVisible(true);
      const timer = setTimeout(() => {
        setToastVisible(false);
        clearLastFeedback();
      }, 1800);
      return () => clearTimeout(timer);
    }
  }, [lastToggledItem]);

  if (!list) {
    return (
      <WatchScaffold showBack onBack={() => router.replace('/')}>
        <WatchEmptyState
          title="No encontrada"
          subtitle="La lista solicitada no existe o fue eliminada."
          icon="alert-circle-outline"
          actionLabel="Volver al inicio"
          onAction={() => router.replace('/')}
        />
      </WatchScaffold>
    );
  }

  const total = list.items.length;
  const completed = list.items.filter(i => i.completed).length;
  const isAllDone = total > 0 && completed === total;
  const progressRatio = total > 0 ? completed / total : 0;
  const percent = Math.round(progressRatio * 100);

  return (
    <WatchScaffold showBack onBack={() => router.back()}>
      {/* 1. Categoría y Nombre de la lista con tipografía grande (22-24pt) */}
      <View style={styles.headerBox}>
        <View style={styles.categoryPill}>
          <Ionicons
            name={watchCategoryIcons[list.category] || 'layers-outline'}
            size={14}
            color={colors.primary}
          />
          <Text style={[styles.categoryText, { color: colors.primary }]}>
            {list.category}
          </Text>
        </View>

        <Text
          style={[styles.largeListName, { color: colors.text, fontSize: width < 330 ? 19 : 22, lineHeight: width < 330 ? 23 : 27 }]}
          numberOfLines={2}
        >
          {list.name}
        </Text>
      </View>

      {/* 2. Progreso de forma compacta y visible */}
      <View
        style={[
          styles.progressCard,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <View style={styles.progressRow}>
          <Text style={[styles.progressCountText, { color: colors.textSecondary }]}>
            {completed} de {total} completadas
          </Text>
          <Text style={[styles.progressPercentText, { color: colors.primary }]}>
            {percent}%
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
                width: `${percent}%`,
              },
            ]}
          />
        </View>
      </View>

      {/* 3. Mensaje breve y claro cuando todas están terminadas */}
      {isAllDone && <WatchAllDoneBanner />}

      {/* 4. Lista de tareas amplias y fáciles de tocar (58dp+ por fila) */}
      {total > 0 ? (
        <View style={{ gap: 10 }}>
          {list.items.map(item => (
            <WatchItemRow
              key={item.id}
              item={item}
              onToggle={() => toggleItem(list.id, item.id)}
            />
          ))}
        </View>
      ) : (
        <WatchEmptyState
          title="Lista vacía"
          subtitle="No hay artículos en esta lista."
          icon="basket-outline"
        />
      )}

      {/* 5. Feedback visual inmediato tipo toast */}
      <WatchToast message={toastMessage} visible={toastVisible} />
    </WatchScaffold>
  );
}

const styles = StyleSheet.create({
  headerBox: {
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  largeListName: {
    fontSize: 22, // Título grande de 22-24pt
    fontWeight: '800',
    letterSpacing: -0.6,
    lineHeight: 27,
    textAlign: 'center',
  },
  progressCard: {
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 7,
    marginBottom: 4,
    minWidth: 0,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressCountText: {
    fontSize: 13,
    fontWeight: '700',
  },
  progressPercentText: {
    fontSize: 14,
    fontWeight: '800',
  },
  progressTrack: {
    height: 7, // Barra de 7dp
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: 7,
    borderRadius: 4,
  },
});
