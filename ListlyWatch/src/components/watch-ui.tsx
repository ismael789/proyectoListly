import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useWatchTheme } from '../theme';
import { ListCategory, ListItem, ListRecord } from '../types';

export const watchCategoryIcons: Record<ListCategory, keyof typeof Ionicons.glyphMap> = {
  Compras: 'basket-outline',
  Universidad: 'school-outline',
  Hogar: 'home-outline',
  Viaje: 'airplane-outline',
  Trabajo: 'briefcase-outline',
  Personal: 'person-outline',
  General: 'layers-outline',
};

// 1. Reloj digital superior estándar para Wear OS (TimeText)
export function WatchTimeText() {
  const { colors } = useWatchTheme();
  const [time, setTime] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      setTime(`${h}:${m}`);
    };
    update();
    const interval = setInterval(update, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.timeContainer} pointerEvents="none">
      <Text style={[styles.timeText, { color: colors.muted }]}>{time}</Text>
    </View>
  );
}

// 2. Contenedor con márgenes curvados seguros para pantallas circulares de smartwatch
export function WatchScaffold({
  children,
  title,
  showBack = false,
  onBack,
}: {
  children: React.ReactNode;
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
}) {
  const { colors } = useWatchTheme();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  // En pantallas circulares (diámetro típico 360 - 454 px), los márgenes superior e inferior
  // deben ser generosos para evitar que el bisel corte los controles.
  const isCompactDial = width < 380;
  const isVeryCompactDial = width < 330;
  const horizontalPadding = isVeryCompactDial ? 10 : isCompactDial ? 14 : 18;

  return (
    <View style={[styles.scaffold, { backgroundColor: colors.background, paddingBottom: insets.bottom }]}>
      <WatchTimeText />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingHorizontal: horizontalPadding,
            paddingTop: isVeryCompactDial ? 6 : 10,
            paddingBottom: 54, // Espacio amplio para no quedar detrás del borde curvo inferior
            width: '100%',
            alignSelf: 'center',
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Botón de regreso amplio y cómodo */}
        {showBack && (
          <Pressable
            onPress={onBack}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Volver a la pantalla anterior"
            style={({ pressed }) => [
              styles.backButton,
              {
                backgroundColor: colors.surfaceAlt,
                borderColor: colors.border,
                opacity: pressed ? 0.75 : 1,
              },
            ]}
            hitSlop={8}
          >
            <Ionicons name="chevron-back" size={20} color={colors.primary} />
            <Text style={[styles.backText, { color: colors.text }]}>Atrás</Text>
          </Pressable>
        )}

        {/* Título de pantalla en tipografía grande (20-24pt) */}
        {title && (
          <View style={styles.titleBox}>
            <Text
              style={[styles.screenTitle, { color: colors.text }]}
              numberOfLines={2}
            >
              {title}
            </Text>
          </View>
        )}

        {children}
      </ScrollView>
    </View>
  );
}

// 3. Tarjeta grande de lista para reloj (WatchListCard)
// Diseñada con altura amplia (88-96dp), tipografía de 18-20pt y barra de progreso visible
export function WatchListCard({
  list,
  onPress,
}: {
  list: ListRecord;
  onPress: () => void;
}) {
  const { colors } = useWatchTheme();
  const { width } = useWindowDimensions();
  const total = list.items.length;
  const completed = list.items.filter(i => i.completed).length;
  const pending = total - completed;
  const isDone = total > 0 && pending === 0;
  const progressRatio = total > 0 ? completed / total : 0;
  const percent = Math.round(progressRatio * 100);

  return (
    <Pressable
      onPress={onPress}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={`Lista ${list.name}, categoría ${list.category}, ${completed} de ${total} completadas. ${isDone ? 'Terminada' : `${pending} pendientes`}`}
      style={({ pressed }) => [
        [styles.largeCard, width < 330 && { paddingHorizontal: 11, paddingVertical: 10, minHeight: 78, gap: 6 }],
        {
          backgroundColor: colors.surface,
          borderColor: isDone ? colors.primary : colors.border,
          borderWidth: isDone ? 1.8 : 1,
          opacity: pressed ? 0.75 : 1,
        },
      ]}
    >
      {/* Fila superior: Categoría e indicador de estado */}
      <View style={styles.cardHeaderRow}>
        <View
          style={[
            styles.cardCategoryPill,
            { backgroundColor: isDone ? colors.primary : colors.surfaceAlt },
          ]}
        >
          <Ionicons
            name={
              isDone
                ? 'checkmark'
                : watchCategoryIcons[list.category] || 'layers-outline'
            }
            size={14}
            color={isDone ? '#000000' : colors.primary}
          />
          <Text
            style={[
              styles.cardCategoryText,
              { color: isDone ? '#000000' : colors.textSecondary },
            ]}
          >
            {list.category}
          </Text>
        </View>

        {isDone ? (
          <View style={[styles.doneBadge, { backgroundColor: colors.primarySoft }]}>
            <Ionicons name="checkmark-circle" size={13} color={colors.primary} />
            <Text style={[styles.doneBadgeText, { color: colors.primary }]}>
              Terminada
            </Text>
          </View>
        ) : (
          <Text style={[styles.pendingText, { color: colors.muted }]}>
            {pending} {pending === 1 ? 'pendiente' : 'pendientes'}
          </Text>
        )}
      </View>

      {/* Nombre de la lista: texto grande (18-20pt) con espacio suficiente */}
      <Text
        style={[styles.largeCardTitle, { color: colors.text }]}
        numberOfLines={2}
      >
        {list.name}
      </Text>

      {/* Indicador de progreso legible: "3 de 7" + barra prominente (7dp) */}
      <View style={styles.progressContainer}>
        <View style={styles.progressTextRow}>
          <Text style={[styles.progressCount, { color: colors.textSecondary }]}>
            {completed} de {total}
          </Text>
          <Text style={[styles.progressPercent, { color: colors.primary }]}>
            {percent}%
          </Text>
        </View>

        <View style={[styles.thickTrack, { backgroundColor: colors.surfaceAlt }]}>
          <View
            style={[
              styles.thickFill,
              {
                backgroundColor: colors.primary,
                width: `${percent}%`,
              },
            ]}
          />
        </View>
      </View>
    </Pressable>
  );
}

// 4. Fila táctil de tarea en el reloj (WatchItemRow)
// Altura amplia (56-62dp), texto grande (16-18pt), casilla de verificación de 28x28dp
export function WatchItemRow({
  item,
  onToggle,
}: {
  item: ListItem;
  onToggle: () => void;
}) {
  const { colors } = useWatchTheme();
  const { width } = useWindowDimensions();

  return (
    <Pressable
      onPress={onToggle}
      accessible={true}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: item.completed }}
      accessibilityLabel={`${item.name}, cantidad ${item.quantity}. ${item.completed ? 'Completado, toca para desmarcar' : 'Pendiente, toca para completar'}`}
      style={({ pressed }) => [
        [styles.largeItemRow, width < 330 && { paddingHorizontal: 10, paddingVertical: 9, minHeight: 52, gap: 8 }],
        {
          backgroundColor: item.completed ? colors.surfaceAlt : colors.surface,
          borderColor: item.completed ? colors.border : colors.border,
          opacity: pressed ? 0.75 : item.completed ? 0.65 : 1,
        },
      ]}
      hitSlop={8}
    >
      {/* Casilla de verificación grande y diferenciada (28x28dp) */}
      <View
        style={[
          styles.largeCheckbox,
          {
            borderColor: item.completed ? colors.primary : colors.muted,
            backgroundColor: item.completed ? colors.primary : 'transparent',
            borderWidth: item.completed ? 0 : 2,
          },
        ]}
      >
        {item.completed && (
          <Ionicons name="checkmark" size={19} color="#000000" />
        )}
      </View>

      {/* Nombre de la tarea: 16-18pt bold, permite 2 líneas completas */}
      <View style={{ flex: 1, gap: 3 }}>
        <Text
          style={[
            styles.largeItemText,
            {
              color: item.completed ? colors.muted : colors.text,
              textDecorationLine: item.completed ? 'line-through' : 'none',
            },
          ]}
          numberOfLines={2}
        >
          {item.name}
        </Text>
      </View>

      {/* Cantidad visible únicamente cuando es relevante (> 1) */}
      {item.quantity > 1 && (
        <View
          style={[
            styles.prominentQtyPill,
            { backgroundColor: colors.surfaceAlt, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.prominentQtyText, { color: colors.textSecondary }]}>
            x{item.quantity}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

// 5. Toast / Feedback discreto de acción
export function WatchToast({
  message,
  visible,
}: {
  message: string;
  visible: boolean;
}) {
  const { colors } = useWatchTheme();
  if (!visible) return null;

  return (
    <View style={styles.toastContainer} pointerEvents="none">
      <View
        style={[
          styles.toastPill,
          { backgroundColor: colors.primary },
        ]}
      >
        <Ionicons name="checkmark-circle" size={16} color="#000000" />
        <Text style={styles.toastText} numberOfLines={1}>
          {message}
        </Text>
      </View>
    </View>
  );
}

// 6. Banner cuando todas las tareas están completadas
export function WatchAllDoneBanner() {
  const { colors } = useWatchTheme();
  return (
    <View
      style={[
        styles.allDoneBox,
        { backgroundColor: colors.primarySoft, borderColor: colors.primary },
      ]}
    >
      <Ionicons name="sparkles" size={18} color={colors.primary} />
      <View style={{ flex: 1 }}>
        <Text style={[styles.allDoneHeading, { color: colors.primary }]}>
          ¡Todo completado!
        </Text>
        <Text style={[styles.allDoneSub, { color: colors.textSecondary }]}>
          Has terminado todas las tareas de esta lista.
        </Text>
      </View>
    </View>
  );
}

// 7. Componentes de Estado: Carga, Vacío y Error
export function WatchLoadingState() {
  const { colors } = useWatchTheme();
  return (
    <View style={styles.stateCenter}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={[styles.stateTitle, { color: colors.text, marginTop: 12 }]}>
        Cargando...
      </Text>
      <Text style={[styles.stateSub, { color: colors.muted }]}>
        Abriendo tus listas
      </Text>
    </View>
  );
}

export function WatchEmptyState({
  title,
  subtitle,
  icon = 'layers-outline',
  actionLabel,
  onAction,
}: {
  title: string;
  subtitle: string;
  icon?: keyof typeof Ionicons.glyphMap;
  actionLabel?: string;
  onAction?: () => void;
}) {
  const { colors } = useWatchTheme();
  return (
    <View style={styles.stateCenter}>
      <View style={[styles.largeStateCircle, { backgroundColor: colors.surfaceAlt }]}>
        <Ionicons name={icon} size={28} color={colors.primary} />
      </View>
      <Text style={[styles.stateTitle, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.stateSub, { color: colors.muted }]}>{subtitle}</Text>
      {actionLabel && onAction && (
        <Pressable
          onPress={onAction}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
          style={({ pressed }) => [
            styles.largeActionBtn,
            { backgroundColor: colors.primary, opacity: pressed ? 0.8 : 1 },
          ]}
        >
          <Text style={styles.largeActionBtnText}>{actionLabel}</Text>
        </Pressable>
      )}
    </View>
  );
}

export function WatchErrorState({ onRetry }: { onRetry: () => void }) {
  const { colors } = useWatchTheme();
  return (
    <View style={styles.stateCenter}>
      <View style={[styles.largeStateCircle, { backgroundColor: colors.surfaceAlt }]}>
        <Ionicons name="alert-circle-outline" size={28} color={colors.danger} />
      </View>
      <Text style={[styles.stateTitle, { color: colors.text }]}>
        Error al cargar
      </Text>
      <Text style={[styles.stateSub, { color: colors.muted }]}>
        No se pudieron leer los datos del reloj.
      </Text>
      <Pressable
        onPress={onRetry}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Reintentar carga de listas"
        style={({ pressed }) => [
          styles.largeActionBtn,
          { backgroundColor: colors.primary, opacity: pressed ? 0.8 : 1 },
        ]}
      >
        <Text style={styles.largeActionBtnText}>Reintentar</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  scaffold: {
    flex: 1,
  },
  timeContainer: {
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 4,
  },
  timeText: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  scrollContent: {
    gap: 12, // Separación cómoda para evitar toques accidentales
  },
  titleBox: {
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  backButton: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    minHeight: 46, // Área táctil amplia
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 22,
    borderWidth: 1,
    marginBottom: 8,
  },
  backText: {
    fontSize: 15,
    fontWeight: '700',
  },
  largeCard: {
    minHeight: 94, // Tarjeta grande y cómoda
    borderRadius: 22,
    paddingHorizontal: 15,
    paddingVertical: 13,
    gap: 8,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  cardCategoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
  },
  cardCategoryText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  doneBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  doneBadgeText: {
    fontSize: 12,
    fontWeight: '800',
  },
  pendingText: {
    fontSize: 13,
    fontWeight: '600',
  },
  largeCardTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
    lineHeight: 23,
  },
  progressContainer: {
    gap: 6,
    marginTop: 2,
  },
  progressTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressCount: {
    fontSize: 13,
    fontWeight: '700',
  },
  progressPercent: {
    fontSize: 14,
    fontWeight: '800',
  },
  thickTrack: {
    height: 7, // Barra visible de 7dp
    borderRadius: 4,
    overflow: 'hidden',
  },
  thickFill: {
    height: 7,
    borderRadius: 4,
  },
  largeItemRow: {
    minHeight: 58, // Fila amplia de casi 60dp
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minWidth: 0,
  },
  largeCheckbox: {
    width: 28, // Casilla grande de 28x28dp
    height: 28,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  largeItemText: {
    fontSize: 16, // Texto de tarea de 16-17pt
    fontWeight: '700',
    lineHeight: 21,
    flexShrink: 1,
  },
  prominentQtyPill: {
    borderWidth: 1,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
  },
  prominentQtyText: {
    fontSize: 13,
    fontWeight: '800',
  },
  allDoneBox: {
    borderWidth: 1.5,
    borderRadius: 18,
    padding: 13,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  allDoneHeading: {
    fontSize: 15,
    fontWeight: '800',
  },
  allDoneSub: {
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
  },
  toastContainer: {
    position: 'absolute',
    bottom: 14,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 99,
  },
  toastPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    minHeight: 40,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    elevation: 6,
  },
  toastText: {
    color: '#000000',
    fontSize: 13,
    fontWeight: '800',
  },
  stateCenter: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
    gap: 8,
  },
  largeStateCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  stateTitle: {
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
  stateSub: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 280,
  },
  largeActionBtn: {
    marginTop: 10,
    minHeight: 48,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  largeActionBtnText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '800',
  },
});
