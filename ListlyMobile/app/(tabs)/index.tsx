import { router } from 'expo-router';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { EmptyState, Heading, ListCard, PrimaryButton } from '../../src/components';
import { useLists } from '../../src/store';
import { useAppTheme } from '../../src/theme';
import { useResponsiveLayout } from '../../src/responsive';

export default function HomeScreen() {
  const { lists, isLoading } = useLists();
  const { colors } = useAppTheme();
  const { horizontalPadding } = useResponsiveLayout();

  // Estadísticas globales
  const totalLists = lists.length;
  const allItems = lists.flatMap(l => l.items);
  const totalTasks = allItems.length;
  const completedTasks = allItems.filter(i => i.completed).length;
  const pendingTasks = totalTasks - completedTasks;
  const globalProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Listas activas (con tareas o con pendientes)
  const activeLists = lists.filter(l => l.items.some(i => !i.completed));
  const recentLists = lists.slice(0, 4);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Buenos días' : hour < 19 ? 'Buenas tardes' : 'Buenas noches';

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={[styles.content, { paddingHorizontal: horizontalPadding }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Barra superior con marca */}
      <View style={styles.brandRow}>
        <View style={[styles.brandMark, { backgroundColor: colors.primary }]}>
          <Ionicons name="checkmark" size={20} color={colors.white} />
        </View>
        <Text style={[styles.brandName, { color: colors.text }]}>listly</Text>
        <View style={{ flex: 1 }} />
        <Pressable
          onPress={() => router.push('/settings')}
          style={[styles.avatar, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}
          hitSlop={8}
        >
          <Ionicons name="options-outline" size={18} color={colors.textSecondary} />
        </Pressable>
      </View>

      {/* Saludo y subtítulo */}
      <Heading
        title={greeting}
        subtitle="Organiza tus pendientes, un paso a la vez."
      />

      {/* Tarjeta de Resumen Principal */}
      <View style={[styles.summaryCard, { backgroundColor: colors.primary }]}>
        <View style={{ flex: 1, gap: 6 }}>
          <Text style={styles.summaryLabel}>RESUMEN GENERAL</Text>
          <Text style={styles.summaryTitle}>
            {pendingTasks} {pendingTasks === 1 ? 'pendiente' : 'pendientes'}
          </Text>
          <Text style={styles.summarySub}>
            {completedTasks} de {totalTasks} tareas completadas ({globalProgress}%)
          </Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${globalProgress}%` }]} />
          </View>
        </View>
        <View style={styles.summaryBadge}>
          <Ionicons name="sparkles" size={26} color="#FFFFFF" />
        </View>
      </View>

      {/* Métrica rápida en 2 columnas */}
      <View style={styles.metricsRow}>
        <View
          style={[
            styles.metricCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <View style={[styles.metricIconBox, { backgroundColor: colors.primarySoft }]}>
            <Ionicons name="folder-outline" size={18} color={colors.primary} />
          </View>
          <View>
            <Text style={[styles.metricValue, { color: colors.text }]}>
              {totalLists}
            </Text>
            <Text style={[styles.metricLabel, { color: colors.muted }]}>
              Listas totales
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.metricCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <View
            style={[
              styles.metricIconBox,
              { backgroundColor: colors.primarySoft },
            ]}
          >
            <Ionicons name="checkmark-done" size={18} color={colors.primary} />
          </View>
          <View>
            <Text style={[styles.metricValue, { color: colors.text }]}>
              {completedTasks}
            </Text>
            <Text style={[styles.metricLabel, { color: colors.muted }]}>
              Completadas
            </Text>
          </View>
        </View>
      </View>

      {/* Sección Listas Recientes */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Listas activas
        </Text>
        {lists.length > 0 && (
          <Pressable onPress={() => router.push('/lists')} hitSlop={6}>
            <Text style={[styles.link, { color: colors.primary }]}>Ver todas</Text>
          </Pressable>
        )}
      </View>

      {recentLists.length > 0 ? (
        recentLists.map(list => (
          <ListCard
            key={list.id}
            list={list}
            onPress={() => router.push({ pathname: '/list/[id]', params: { id: list.id } })}
          />
        ))
      ) : (
        <EmptyState
          title="Aún no tienes listas"
          body="Comienza creando tu primera lista de compras, tareas o proyectos."
          icon="folder-open-outline"
          actionTitle="Crear primera lista"
          onAction={() => router.push('/create-list')}
        />
      )}

      {/* Botón flotante/inferior de crear lista */}
      {recentLists.length > 0 && (
        <PrimaryButton
          title="Crear nueva lista"
          onPress={() => router.push('/create-list')}
          icon="add"
        />
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
    gap: 18,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    marginBottom: 4,
  },
  brandMark: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.6,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryCard: {
    borderRadius: 22,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  summaryLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: '#DCECE2',
  },
  summaryTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.6,
  },
  summarySub: {
    color: '#E0EDE5',
    fontSize: 12,
    lineHeight: 16,
  },
  progressTrack: {
    height: 6,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    overflow: 'hidden',
    marginTop: 4,
  },
  progressFill: {
    height: 6,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  summaryBadge: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  metricCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  metricIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  link: {
    fontSize: 13,
    fontWeight: '700',
  },
});
