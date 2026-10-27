import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { ListRecord, ThemeMode } from './types';
import {
  WATCH_DEMO_LISTS,
  loadWatchLists,
  loadWatchTheme,
  saveWatchLists,
  saveWatchTheme,
} from './storage';
import { isApiConfigured } from './api/base-url';
import { getLists as apiGetLists } from './api/lists.api';
import { setTaskCompleted as apiSetTaskCompleted } from './api/tasks.api';
import { WatchThemeContext, watchPalettes } from './theme';
import { useAuth } from './auth-context';

// Consulta frecuente mientras el reloj está activo para reflejar cambios de Mobile rápidamente.
const WATCH_SYNC_INTERVAL_MS = 3000;

interface WatchFeedback {
  name: string;
  completed: boolean;
  message?: string;
}

interface WatchListContextValue {
  lists: ListRecord[];
  isLoading: boolean;
  isSyncing: boolean;
  hasError: boolean;
  error: string | null;
  lastToggledItem: WatchFeedback | null;
  clearLastFeedback: () => void;
  toggleItem: (listId: string, itemId: string) => void;
  reloadDemo: () => void;
  clearAllLists: () => void;
  triggerSimulatedError: () => void;
  retryLoad: () => void;
  syncFromApi: () => Promise<boolean>;
}

const WatchListContext = createContext<WatchListContextValue | null>(null);

export function WatchProvider({ children }: { children: React.ReactNode }) {
  const [lists, setLists] = useState<ListRecord[]>(WATCH_DEMO_LISTS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [themeMode, setThemeMode] = useState<ThemeMode>('dark');
  const [lastToggledItem, setLastToggledItem] = useState<WatchFeedback | null>(null);
  const pendingToggleIds = useRef(new Set<string>());
  const syncInFlight = useRef<Promise<boolean> | null>(null);
  const { session } = useAuth();

  const persistLists = (next: ListRecord[]) => {
    setLists(next);
    void saveWatchLists(next);
  };

  const syncFromApi = async (): Promise<boolean> => {
    if (!isApiConfigured) return false;
    if (syncInFlight.current) return syncInFlight.current;

    const request = (async () => {
      setIsSyncing(true);
      try {
        const remoteLists = await apiGetLists();
        setLists(currentLists => {
          const nextLists = remoteLists.map(remoteList => ({
            ...remoteList,
            items: remoteList.items.map(remoteItem => {
              if (!pendingToggleIds.current.has(remoteItem.id)) return remoteItem;
              const localItem = currentLists
                .find(localList => localList.id === remoteList.id)
                ?.items.find(item => item.id === remoteItem.id);
              return localItem || remoteItem;
            }),
          }));
          void saveWatchLists(nextLists);
          return nextLists;
        });
        setError(null);
        setHasError(false);
        return true;
      } catch (syncError) {
        setError(syncError instanceof Error ? syncError.message : 'No se pudo sincronizar el reloj.');
        return false;
      } finally {
        setIsSyncing(false);
        syncInFlight.current = null;
      }
    })();

    syncInFlight.current = request;
    return request;
  };

  useEffect(() => {
    let mounted = true;
    async function init() {
      try {
        const [storedLists, storedTheme] = await Promise.all([loadWatchLists(), loadWatchTheme()]);
        if (!mounted) return;
        setLists(storedLists);
        setThemeMode(storedTheme);
        setIsLoading(false);
      } catch (initError) {
        if (mounted) {
          setError(initError instanceof Error ? initError.message : 'No se pudieron cargar las listas.');
          setHasError(true);
          setIsLoading(false);
        }
      }
    }
    void init();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isApiConfigured || !session) return;

    const syncIfActive = () => {
      if (AppState.currentState === 'active') void syncFromApi();
    };

    syncIfActive();
    const interval = setInterval(syncIfActive, WATCH_SYNC_INTERVAL_MS);
    const subscription = AppState.addEventListener('change', state => {
      if (state === 'active') syncIfActive();
    });

    return () => {
      clearInterval(interval);
      subscription.remove();
    };
  }, [session]);

  const changeTheme = (newMode: ThemeMode) => {
    setThemeMode(newMode);
    void saveWatchTheme(newMode);
  };

  const toggleItem = (listId: string, itemId: string) => {
    if (pendingToggleIds.current.has(itemId)) return;
    const currentList = lists.find(list => list.id === listId);
    const currentItem = currentList?.items.find(item => item.id === itemId);
    if (!currentItem) return;

    const nextCompleted = !currentItem.completed;
    const previousCompleted = currentItem.completed;
    pendingToggleIds.current.add(itemId);
    persistLists(lists.map(list => list.id !== listId ? list : {
      ...list,
      items: list.items.map(item => item.id === itemId
        ? { ...item, completed: nextCompleted, completedAt: nextCompleted ? new Date().toISOString() : null }
        : item),
    }));
    setLastToggledItem({ name: currentItem.name, completed: nextCompleted });

    if (!isApiConfigured) {
      pendingToggleIds.current.delete(itemId);
      return;
    }

    setIsSyncing(true);
    void apiSetTaskCompleted(itemId, nextCompleted)
      .then(() => {
        setError(null);
        setLastToggledItem({
          name: currentItem.name,
          completed: nextCompleted,
          message: nextCompleted ? 'Completada' : 'Pendiente',
        });
      })
      .catch(syncError => {
        persistLists(lists.map(list => list.id !== listId ? list : {
          ...list,
          items: list.items.map(item => item.id === itemId
            ? { ...item, completed: previousCompleted, completedAt: currentItem.completedAt || null }
            : item),
        }));
        setError(syncError instanceof Error ? syncError.message : 'No se pudo actualizar.');
        setLastToggledItem({ name: currentItem.name, completed: previousCompleted, message: 'No se pudo actualizar' });
      })
      .finally(() => {
        pendingToggleIds.current.delete(itemId);
        setIsSyncing(false);
      });
  };

  const clearLastFeedback = () => setLastToggledItem(null);

  const reloadDemo = () => {
    setHasError(false);
    setError(null);
    persistLists(WATCH_DEMO_LISTS);
  };

  const clearAllLists = () => persistLists([]);

  const triggerSimulatedError = () => setHasError(true);

  const retryLoad = () => {
    setHasError(false);
    setError(null);
    if (isApiConfigured) {
      void syncFromApi();
    } else {
      setIsLoading(true);
      void loadWatchLists().then(result => {
        setLists(result);
        setIsLoading(false);
      }).catch(loadError => {
        setError(loadError instanceof Error ? loadError.message : 'No se pudieron cargar las listas.');
        setHasError(true);
        setIsLoading(false);
      });
    }
  };

  const colors = themeMode === 'light' ? watchPalettes.light : watchPalettes.dark;
  const listValue = useMemo<WatchListContextValue>(() => ({
    lists,
    isLoading,
    isSyncing,
    hasError,
    error,
    lastToggledItem,
    clearLastFeedback,
    toggleItem,
    reloadDemo,
    clearAllLists,
    triggerSimulatedError,
    retryLoad,
    syncFromApi,
  }), [lists, isLoading, isSyncing, hasError, error, lastToggledItem]);

  const themeValue = useMemo(() => ({ mode: themeMode, setMode: changeTheme, colors }), [themeMode, colors]);

  return (
    <WatchThemeContext.Provider value={themeValue}>
      <WatchListContext.Provider value={listValue}>{children}</WatchListContext.Provider>
    </WatchThemeContext.Provider>
  );
}

export function useWatchLists(): WatchListContextValue {
  const context = useContext(WatchListContext);
  if (!context) throw new Error('useWatchLists debe usarse dentro de WatchProvider');
  return context;
}
