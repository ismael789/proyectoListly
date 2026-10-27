import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from './theme';
import { ListCategory, ListItem, ListRecord } from './types';
import { useResponsiveLayout } from './responsive';

export const categoryIcons: Record<ListCategory, keyof typeof Ionicons.glyphMap> = {
  Compras: 'basket-outline',
  Universidad: 'school-outline',
  Hogar: 'home-outline',
  Viaje: 'airplane-outline',
  Trabajo: 'briefcase-outline',
  Personal: 'person-outline',
  General: 'layers-outline',
};

export function Screen({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const { colors } = useAppTheme();
  const { horizontalPadding } = useResponsiveLayout();
  return (
    <View
      style={[
        styles.screen,
        { backgroundColor: colors.background, paddingHorizontal: horizontalPadding },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function Heading({
  title,
  subtitle,
  rightElement,
}: {
  title: string;
  subtitle?: string;
  rightElement?: React.ReactNode;
}) {
  const { colors } = useAppTheme();
  const { scale } = useResponsiveLayout();
  return (
    <View style={styles.headingRow}>
      <View style={{ flex: 1, minWidth: 0, gap: 4 }}>
        <Text style={[styles.heading, { color: colors.text, fontSize: 26 * scale }]}>{title}</Text>
        {subtitle ? (
          <Text style={[styles.subtitle, { color: colors.muted }]}>{subtitle}</Text>
        ) : null}
      </View>
      {rightElement}
    </View>
  );
}

export function Badge({
  label,
  icon,
  active = false,
  onPress,
}: {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  active?: boolean;
  onPress?: () => void;
}) {
  const { colors } = useAppTheme();
  const content = (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: active ? colors.primary : colors.surfaceAlt,
          borderColor: active ? colors.primary : colors.border,
        },
      ]}
    >
      {icon && (
        <Ionicons
          name={icon}
          size={14}
          color={active ? colors.white : colors.textSecondary}
        />
      )}
      <Text
        style={[
          styles.badgeText,
          { color: active ? colors.white : colors.textSecondary },
        ]}
      >
        {label}
      </Text>
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} hitSlop={6}>
        {content}
      </Pressable>
    );
  }
  return content;
}

export function ListCard({
  list,
  onPress,
}: {
  list: ListRecord;
  onPress: () => void;
}) {
  const { colors } = useAppTheme();
  const total = list.items.length;
  const completed = list.items.filter(item => item.completed).length;
  const pending = total - completed;
  const progress = total > 0 ? completed / total : 0;
  const isDone = total > 0 && pending === 0;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: isDone ? colors.primarySoft : colors.border,
          opacity: pressed ? 0.9 : 1,
        },
      ]}
    >
      <View
        style={[
          styles.iconBox,
          { backgroundColor: isDone ? colors.primary : colors.primarySoft },
        ]}
      >
        <Ionicons
          name={categoryIcons[list.category] || 'layers-outline'}
          size={20}
          color={isDone ? colors.white : colors.primary}
        />
      </View>
      <View style={{ flex: 1, gap: 6 }}>
        <View style={styles.cardTitleRow}>
          <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={1}>
            {list.name}
          </Text>
          <Text
            style={[
              styles.count,
              { color: isDone ? colors.primary : colors.muted },
            ]}
          >
            {completed}/{total}
          </Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text style={[styles.cardMeta, { color: colors.muted }]}>
            {list.category}
          </Text>
          <Text style={{ color: colors.border }}>•</Text>
          <Text
            style={[
              styles.cardMeta,
              {
                color: isDone ? colors.primary : colors.muted,
                fontWeight: isDone ? '600' : '400',
              },
            ]}
          >
            {isDone ? 'Completada' : `${pending} pendiente${pending === 1 ? '' : 's'}`}
          </Text>
        </View>

        <View style={[styles.progressTrack, { backgroundColor: colors.surfaceAlt }]}>
          <View
            style={[
              styles.progressFill,
              {
                backgroundColor: colors.primary,
                width: `${Math.round(progress * 100)}%`,
              },
            ]}
          />
        </View>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.muted} />
    </Pressable>
  );
}

export function PrimaryButton({
  title,
  onPress,
  icon = 'add',
  compact = false,
  danger = false,
  disabled = false,
}: {
  title: string;
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  compact?: boolean;
  danger?: boolean;
  disabled?: boolean;
}) {
  const { colors } = useAppTheme();
  const bg = disabled
    ? colors.surfaceAlt
    : danger
    ? colors.danger
    : colors.primary;
  const textColor = disabled ? colors.muted : colors.white;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.primaryButton,
        {
          backgroundColor: bg,
          opacity: pressed ? 0.85 : 1,
          paddingVertical: compact ? 10 : 14,
        },
      ]}
    >
      {icon ? <Ionicons name={icon} size={18} color={textColor} /> : null}
      <Text style={[styles.primaryButtonText, { color: textColor }]}>{title}</Text>
    </Pressable>
  );
}

export function SecondaryButton({
  title,
  onPress,
  icon,
  compact = false,
}: {
  title: string;
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  compact?: boolean;
}) {
  const { colors } = useAppTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.secondaryButton,
        {
          borderColor: colors.border,
          backgroundColor: colors.surface,
          opacity: pressed ? 0.85 : 1,
          paddingVertical: compact ? 9 : 12,
        },
      ]}
    >
      {icon ? <Ionicons name={icon} size={16} color={colors.text} /> : null}
      <Text style={[styles.secondaryButtonText, { color: colors.text }]}>
        {title}
      </Text>
    </Pressable>
  );
}

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max,
}: {
  value: number;
  onChange: (val: number) => void;
  min?: number;
  max?: number;
}) {
  const { colors } = useAppTheme();
  return (
    <View
      style={[
        styles.stepperContainer,
        { backgroundColor: colors.surfaceAlt, borderColor: colors.border },
      ]}
    >
      <Pressable
        onPress={() => onChange(Math.max(min, value - 1))}
        style={({ pressed }) => [
          styles.stepperBtn,
          { opacity: pressed ? 0.6 : 1 },
        ]}
        hitSlop={8}
      >
        <Ionicons name="remove" size={16} color={colors.text} />
      </Pressable>
      <Text style={[styles.stepperValue, { color: colors.text }]}>{value}</Text>
      <Pressable
        onPress={() => onChange(max === undefined ? value + 1 : Math.min(max, value + 1))}
        style={({ pressed }) => [
          styles.stepperBtn,
          { opacity: pressed ? 0.6 : 1 },
        ]}
        hitSlop={8}
      >
        <Ionicons name="add" size={16} color={colors.text} />
      </Pressable>
    </View>
  );
}

export function EmptyState({
  title,
  body,
  icon = 'layers-outline',
  actionTitle,
  onAction,
}: {
  title: string;
  body: string;
  icon?: keyof typeof Ionicons.glyphMap;
  actionTitle?: string;
  onAction?: () => void;
}) {
  const { colors } = useAppTheme();
  return (
    <View
      style={[
        styles.empty,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <View
        style={[
          styles.emptyIconCircle,
          { backgroundColor: colors.primarySoft },
        ]}
      >
        <Ionicons name={icon} size={28} color={colors.primary} />
      </View>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.emptyBody, { color: colors.muted }]}>{body}</Text>
      {actionTitle && onAction && (
        <View style={{ marginTop: 8 }}>
          <PrimaryButton title={actionTitle} onPress={onAction} compact />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, paddingHorizontal: 20, paddingTop: 16 },
  headingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  heading: { fontSize: 26, fontWeight: '800', letterSpacing: -0.6 },
  subtitle: { fontSize: 13, lineHeight: 18 },
  card: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 0,
    gap: 12,
    marginBottom: 10,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
    minWidth: 0,
  },
  cardTitle: { fontSize: 15, fontWeight: '700', flex: 1, minWidth: 0 },
  count: { fontSize: 12, fontWeight: '700' },
  cardMeta: { fontSize: 12 },
  progressTrack: { height: 6, borderRadius: 8, overflow: 'hidden' },
  progressFill: { height: 6, borderRadius: 8 },
  primaryButton: {
    borderRadius: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minWidth: 0,
    flexShrink: 1,
  },
  primaryButtonText: { fontSize: 14, fontWeight: '700' },
  secondaryButton: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minWidth: 0,
    flexShrink: 1,
  },
  secondaryButtonText: { fontSize: 13, fontWeight: '600', flexShrink: 1, textAlign: 'center' },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  badgeText: { fontSize: 12, fontWeight: '600' },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    overflow: 'hidden',
  },
  stepperBtn: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperValue: {
    minWidth: 28,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '700',
  },
  empty: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    gap: 8,
    marginVertical: 12,
  },
  emptyIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: { fontSize: 16, fontWeight: '700', textAlign: 'center' },
  emptyBody: {
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    paddingHorizontal: 10,
  },
});
