import AsyncStorage from '@react-native-async-storage/async-storage';
import { ListRecord } from './types';

const STORAGE_KEY_WATCH_LISTS = '@listly_watch:lists';
const STORAGE_KEY_WATCH_THEME = '@listly_watch:theme';

export const WATCH_DEMO_LISTS: ListRecord[] = [
  {
    id: 'list-compras-semana',
    name: 'Supermercado',
    category: 'Compras',
    createdAt: '2026-10-20T10:00:00.000Z',
    items: [
      { id: 'item-leche', name: 'Leche', quantity: 2, completed: true, completedAt: '2026-10-21T08:30:00.000Z' },
      { id: 'item-huevos', name: 'Huevos', quantity: 12, completed: false },
      { id: 'item-pan', name: 'Pan integral', quantity: 1, completed: false },
      { id: 'item-aguacates', name: 'Aguacates', quantity: 3, completed: false },
      { id: 'item-cafe', name: 'Café en grano', quantity: 1, completed: true, completedAt: '2026-10-21T09:15:00.000Z' },
    ],
  },
  {
    id: 'list-universidad-tesis',
    name: 'Universidad',
    category: 'Universidad',
    createdAt: '2026-10-21T14:30:00.000Z',
    items: [
      { id: 'item-reporte', name: 'Reporte tesis', quantity: 1, completed: false },
      { id: 'item-expo', name: 'Diapositivas', quantity: 1, completed: true, completedAt: '2026-10-22T17:00:00.000Z' },
      { id: 'item-apuntes', name: 'Revisar notas', quantity: 1, completed: false },
    ],
  },
  {
    id: 'list-viaje-escapada',
    name: 'Fin de semana',
    category: 'Viaje',
    createdAt: '2026-10-18T09:00:00.000Z',
    items: [
      { id: 'item-cargador', name: 'Cargador', quantity: 1, completed: true, completedAt: '2026-10-18T20:00:00.000Z' },
      { id: 'item-audifonos', name: 'Audífonos', quantity: 1, completed: true, completedAt: '2026-10-18T20:05:00.000Z' },
      { id: 'item-documentos', name: 'Pasaporte', quantity: 1, completed: true, completedAt: '2026-10-18T20:10:00.000Z' },
    ],
  },
  {
    id: 'list-hogar-mantenimiento',
    name: 'Hogar',
    category: 'Hogar',
    createdAt: '2026-10-22T11:00:00.000Z',
    items: [
      { id: 'item-bombillas', name: 'Bombillas LED', quantity: 4, completed: false },
      { id: 'item-filtro', name: 'Filtro de agua', quantity: 1, completed: false },
    ],
  },
];

export async function loadWatchLists(): Promise<ListRecord[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY_WATCH_LISTS);
    if (!raw) return WATCH_DEMO_LISTS;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return WATCH_DEMO_LISTS;
  } catch {
    return WATCH_DEMO_LISTS;
  }
}

export async function saveWatchLists(lists: ListRecord[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY_WATCH_LISTS, JSON.stringify(lists));
  } catch (err) {
    console.warn('[WatchStorage] Error saving lists:', err);
  }
}

export async function loadWatchTheme(): Promise<'dark' | 'light'> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY_WATCH_THEME);
    if (raw === 'light' || raw === 'dark') return raw;
    return 'dark'; // Wear OS por defecto es Dark AMOLED
  } catch {
    return 'dark';
  }
}

export async function saveWatchTheme(theme: 'dark' | 'light'): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY_WATCH_THEME, theme);
  } catch (err) {
    console.warn('[WatchStorage] Error saving theme:', err);
  }
}
