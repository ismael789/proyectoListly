import AsyncStorage from '@react-native-async-storage/async-storage';
import { ListRecord, UserPreferences } from './types';

const STORAGE_KEY_LISTS = '@listly:lists';
const STORAGE_KEY_THEME = '@listly:theme';
const STORAGE_KEY_PREFS = '@listly:preferences';

export const INITIAL_DEMO_LISTS: ListRecord[] = [
  {
    id: 'list-compras-semana',
    name: 'Supermercado semanal',
    category: 'Compras',
    createdAt: '2026-10-20T10:00:00.000Z',
    items: [
      { id: 'item-leche', name: 'Leche deslactosada', quantity: 2, completed: true, createdAt: '2026-10-20T10:05:00.000Z', completedAt: '2026-10-21T08:30:00.000Z' },
      { id: 'item-huevos', name: 'Huevos de campo', quantity: 12, completed: false, createdAt: '2026-10-20T10:06:00.000Z' },
      { id: 'item-pan', name: 'Pan integral artesanal', quantity: 1, completed: false, createdAt: '2026-10-20T10:07:00.000Z' },
      { id: 'item-aguacates', name: 'Aguacates maduros', quantity: 3, completed: false, createdAt: '2026-10-20T10:08:00.000Z' },
      { id: 'item-cafe', name: 'Café en grano tostado', quantity: 1, completed: true, createdAt: '2026-10-20T10:09:00.000Z', completedAt: '2026-10-21T09:15:00.000Z' },
    ],
  },
  {
    id: 'list-universidad-tesis',
    name: 'Avances de Universidad',
    category: 'Universidad',
    createdAt: '2026-10-21T14:30:00.000Z',
    items: [
      { id: 'item-reporte', name: 'Terminar reporte metodológico', quantity: 1, completed: false, createdAt: '2026-10-21T14:35:00.000Z' },
      { id: 'item-expo', name: 'Preparar diapositivas de sustentación', quantity: 1, completed: true, createdAt: '2026-10-21T14:36:00.000Z', completedAt: '2026-10-22T17:00:00.000Z' },
      { id: 'item-apuntes', name: 'Revisar notas del asesor', quantity: 1, completed: false, createdAt: '2026-10-21T14:37:00.000Z' },
    ],
  },
  {
    id: 'list-viaje-escapada',
    name: 'Viaje de fin de semana',
    category: 'Viaje',
    createdAt: '2026-10-18T09:00:00.000Z',
    items: [
      { id: 'item-cargador', name: 'Cargador rápido y power bank', quantity: 1, completed: true, createdAt: '2026-10-18T09:05:00.000Z', completedAt: '2026-10-18T20:00:00.000Z' },
      { id: 'item-audifonos', name: 'Audífonos con cancelación de ruido', quantity: 1, completed: true, createdAt: '2026-10-18T09:06:00.000Z', completedAt: '2026-10-18T20:05:00.000Z' },
      { id: 'item-documentos', name: 'Pasaporte e identificaciones', quantity: 1, completed: true, createdAt: '2026-10-18T09:07:00.000Z', completedAt: '2026-10-18T20:10:00.000Z' },
    ],
  },
  {
    id: 'list-hogar-mantenimiento',
    name: 'Pendientes del hogar',
    category: 'Hogar',
    createdAt: '2026-10-22T11:00:00.000Z',
    items: [
      { id: 'item-bombillas', name: 'Bombillas LED para cocina', quantity: 4, completed: false, createdAt: '2026-10-22T11:05:00.000Z' },
      { id: 'item-filtro', name: 'Cambiar filtro de agua', quantity: 1, completed: false, createdAt: '2026-10-22T11:06:00.000Z' },
    ],
  },
];

export const DEFAULT_PREFERENCES: UserPreferences = {
  confirmDelete: true,
  autoSortCompleted: true,
};

export async function loadStoredLists(): Promise<ListRecord[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY_LISTS);
    if (!raw) return INITIAL_DEMO_LISTS;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_DEMO_LISTS;
  } catch (error) {
    console.warn('[Storage] Error al cargar listas locales:', error);
    return INITIAL_DEMO_LISTS;
  }
}

export async function saveStoredLists(lists: ListRecord[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY_LISTS, JSON.stringify(lists));
  } catch (error) {
    console.warn('[Storage] Error al guardar listas locales:', error);
  }
}

export async function loadStoredTheme(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(STORAGE_KEY_THEME);
  } catch {
    return null;
  }
}

export async function saveStoredTheme(theme: string): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY_THEME, theme);
  } catch (error) {
    console.warn('[Storage] Error al guardar tema:', error);
  }
}

export async function loadStoredPreferences(): Promise<UserPreferences> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY_PREFS);
    if (!raw) return DEFAULT_PREFERENCES;
    return { ...DEFAULT_PREFERENCES, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export async function saveStoredPreferences(prefs: UserPreferences): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY_PREFS, JSON.stringify(prefs));
  } catch (error) {
    console.warn('[Storage] Error al guardar preferencias:', error);
  }
}
