import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { ListCategory, ListItem, ListRecord, UserPreferences } from './types';
import {
  DEFAULT_PREFERENCES,
  INITIAL_DEMO_LISTS,
  loadStoredLists,
  loadStoredPreferences,
  saveStoredLists,
  saveStoredPreferences,
} from './storage';
import { ApiError } from './api/client';
import { isApiConfigured } from './api/base-url';
import { getValidationRules as apiGetValidationRules, ValidationRules } from './api/validation.api';
import {
  createList as apiCreateList,
  deleteList as apiDeleteList,
  getLists as apiGetLists,
  updateList as apiUpdateList,
} from './api/lists.api';
import {
  createTask as apiCreateTask,
  deleteTask as apiDeleteTask,
  setTaskCompleted as apiSetTaskCompleted,
  updateTask as apiUpdateTask,
} from './api/tasks.api';
import { useAuth } from './auth-context';

const MOBILE_SYNC_INTERVAL_MS = 3000;

interface ListContextValue {
  lists: ListRecord[];
  isLoading: boolean;
  isSyncing: boolean;
  error: string | null;
  lastActionMessage: string | null;
  validationRules: ValidationRules | null;
  validationError: string | null;
  fieldError: { field: string; message: string; limit?: number } | null;
  preferences: UserPreferences;
  updatePreferences: (prefs: Partial<UserPreferences>) => void;
  addList: (name: string, category: ListCategory) => Promise<string>;
  updateList: (id: string, name: string, category: ListCategory) => void;
  deleteList: (id: string) => void;
  addItem: (listId: string, name: string, quantity: number) => string;
  toggleItem: (listId: string, itemId: string) => void;
  editItem: (listId: string, itemId: string, name: string, quantity: number) => void;
  deleteItem: (listId: string, itemId: string) => void;
  clearCompleted: (listId: string) => void;
  resetToDemoData: () => void;
  clearAllData: () => void;
  syncFromApi: () => Promise<boolean>;
  clearBackendFeedback: () => void;
}

const ListContext = createContext<ListContextValue | null>(null);

const makeId = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`;

export function ListProvider({ children }: { children: React.ReactNode }) {
  const [lists, setLists] = useState<ListRecord[]>(INITIAL_DEMO_LISTS);
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastActionMessage, setLastActionMessage] = useState<string | null>(null);
  const [validationRules, setValidationRules] = useState<ValidationRules | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<{ field: string; message: string; limit?: number } | null>(null);
  const syncInFlight = useRef<Promise<boolean> | null>(null);
  const { session } = useAuth();

  const persistLists = (next: ListRecord[]) => {
    setLists(next);
    void saveStoredLists(next);
  };

  const updateListsAndPersist = (updater: (prev: ListRecord[]) => ListRecord[]) => {
    setLists(prev => {
      const next = updater(prev);
      void saveStoredLists(next);
      return next;
    });
  };

  const reportError = (value: unknown) => {
    setError(value instanceof Error ? value.message : 'No se pudo completar la operación.');
  };

  const runRemote = async (operation: () => Promise<unknown>, successMessage: string) => {
    if (!isApiConfigured) return;
    setIsSyncing(true);
    try {
      await operation();
      setError(null);
      setLastActionMessage(successMessage);
      setFieldError(null);
    } catch (remoteError) {
      reportError(remoteError);
      if (remoteError instanceof ApiError && remoteError.field) {
        setFieldError({ field: remoteError.field, message: remoteError.message, limit: remoteError.limit });
        if (remoteError.code === 'MAX_LENGTH_EXCEEDED') {
          try {
            setValidationRules(await apiGetValidationRules());
            setValidationError(null);
          } catch (rulesError) {
            setValidationError(rulesError instanceof Error ? rulesError.message : 'No se pudieron actualizar las reglas.');
          }
        }
      }
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    async function init() {
      try {
        const [savedLists, savedPrefs] = await Promise.all([
          loadStoredLists(),
          loadStoredPreferences(),
        ]);
        if (!isMounted) return;
        setLists(savedLists);
        setPreferences(savedPrefs);
        setIsLoading(false);

        if (isApiConfigured) {
          setIsSyncing(true);
          try {
            const [remoteLists, remoteRules] = await Promise.all([
              apiGetLists(),
              apiGetValidationRules(),
            ]);
            if (isMounted) {
              setLists(remoteLists);
              setValidationRules(remoteRules);
              setValidationError(null);
              await saveStoredLists(remoteLists);
              setError(null);
            }
          } catch (remoteError) {
            if (isMounted) {
              reportError(remoteError);
              setValidationError(remoteError instanceof Error ? remoteError.message : 'No se pudieron cargar las reglas de validación.');
            }
          } finally {
            if (isMounted) setIsSyncing(false);
          }
        }
      } catch (initError) {
        console.warn('[Listly] Error inicializando estado:', initError);
        if (isMounted) {
          setError('No se pudieron cargar los datos locales.');
          setIsLoading(false);
        }
      }
    }
    void init();
    return () => {
      isMounted = false;
    };
  }, []);

  const updatePreferences = (partial: Partial<UserPreferences>) => {
    setPreferences(prev => {
      const next = { ...prev, ...partial };
      void saveStoredPreferences(next);
      return next;
    });
  };

  const syncFromApi = async (): Promise<boolean> => {
    if (!isApiConfigured) return false;
    if (syncInFlight.current) return syncInFlight.current;

    const request = (async () => {
      setIsSyncing(true);
      try {
        const [remoteLists, remoteRules] = await Promise.all([apiGetLists(), apiGetValidationRules()]);
        persistLists(remoteLists);
        setValidationRules(remoteRules);
        setValidationError(null);
        setError(null);
        return true;
      } catch (syncError) {
        reportError(syncError);
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
    if (!isApiConfigured || !session) return;

    const syncIfActive = () => {
      if (AppState.currentState === 'active') void syncFromApi();
    };

    syncIfActive();
    const interval = setInterval(syncIfActive, MOBILE_SYNC_INTERVAL_MS);
    const subscription = AppState.addEventListener('change', state => {
      if (state === 'active') syncIfActive();
    });

    return () => {
      clearInterval(interval);
      subscription.remove();
    };
  }, [session]);

  const addList = async (name: string, category: ListCategory): Promise<string> => {
    if (isApiConfigured) {
      setIsSyncing(true);
      try {
        const remoteList = await apiCreateList(name.trim(), category);
        updateListsAndPersist(prev => [remoteList, ...prev.filter(list => list.id !== remoteList.id)]);
        setLastActionMessage('Lista creada correctamente');
        setError(null);
        return remoteList.id;
      } catch (remoteError) {
        reportError(remoteError);
        if (remoteError instanceof ApiError && remoteError.field) {
          setFieldError({ field: remoteError.field, message: remoteError.message, limit: remoteError.limit });
          if (remoteError.code === 'MAX_LENGTH_EXCEEDED') {
            try {
              setValidationRules(await apiGetValidationRules());
              setValidationError(null);
            } catch (rulesError) {
              setValidationError(rulesError instanceof Error ? rulesError.message : 'No se pudieron actualizar las reglas.');
            }
          }
          return '';
        }
      } finally {
        setIsSyncing(false);
      }
    }

    const id = makeId('list');
    updateListsAndPersist(prev => [
      { id, name: name.trim(), category, createdAt: new Date().toISOString(), items: [] },
      ...prev,
    ]);
    setLastActionMessage('Lista creada correctamente');
    return id;
  };

  const updateList = (id: string, name: string, category: ListCategory): void => {
    updateListsAndPersist(prev => prev.map(list =>
      list.id === id ? { ...list, name: name.trim(), category } : list,
    ));
    void runRemote(() => apiUpdateList(id, { name: name.trim(), category }), 'Lista actualizada correctamente');
  };

  const deleteList = (id: string): void => {
    updateListsAndPersist(prev => prev.filter(list => list.id !== id));
    void runRemote(() => apiDeleteList(id), 'Lista eliminada correctamente');
  };

  const addItem = (listId: string, name: string, quantity: number): string => {
    const newItemId = makeId('item');
    const safeQty = Math.max(1, Math.floor(quantity) || 1);
    const newItem: ListItem = {
      id: newItemId,
      name: name.trim(),
      quantity: safeQty,
      completed: false,
      createdAt: new Date().toISOString(),
      completedAt: null,
    };
    updateListsAndPersist(prev => prev.map(list =>
      list.id === listId ? { ...list, items: [...list.items, newItem] } : list,
    ));
    void runRemote(async () => {
      await apiCreateTask(listId, name.trim(), safeQty);
      await syncFromApi();
    }, 'Tarea creada correctamente');
    return newItemId;
  };

  const toggleItem = (listId: string, itemId: string): void => {
    const current = lists.find(list => list.id === listId)?.items.find(item => item.id === itemId);
    if (!current) return;
    const nextCompleted = !current.completed;
    const previous = current.completed;
    updateListsAndPersist(prev => prev.map(list => list.id !== listId ? list : {
      ...list,
      items: list.items.map(item => item.id === itemId
        ? { ...item, completed: nextCompleted, completedAt: nextCompleted ? new Date().toISOString() : null }
        : item),
    }));
    void runRemote(async () => {
      try {
        await apiSetTaskCompleted(itemId, nextCompleted);
      } catch (remoteError) {
        updateListsAndPersist(prev => prev.map(list => list.id !== listId ? list : {
          ...list,
          items: list.items.map(item => item.id === itemId ? { ...item, completed: previous, completedAt: current.completedAt || null } : item),
        }));
        throw remoteError;
      }
    }, nextCompleted ? 'Tarea completada' : 'Tarea marcada como pendiente');
  };

  const editItem = (listId: string, itemId: string, name: string, quantity: number): void => {
    const safeQty = Math.max(1, Math.floor(quantity) || 1);
    updateListsAndPersist(prev => prev.map(list => list.id !== listId ? list : {
      ...list,
      items: list.items.map(item => item.id === itemId ? { ...item, name: name.trim(), quantity: safeQty } : item),
    }));
    void runRemote(() => apiUpdateTask(itemId, { name: name.trim(), quantity: safeQty }), 'Tarea actualizada correctamente');
  };

  const deleteItem = (listId: string, itemId: string): void => {
    updateListsAndPersist(prev => prev.map(list => list.id !== listId ? list : {
      ...list,
      items: list.items.filter(item => item.id !== itemId),
    }));
    void runRemote(() => apiDeleteTask(itemId), 'Tarea eliminada correctamente');
  };

  const clearCompleted = (listId: string): void => {
    const completedIds = lists.find(list => list.id === listId)?.items.filter(item => item.completed).map(item => item.id) || [];
    updateListsAndPersist(prev => prev.map(list => list.id !== listId ? list : {
      ...list,
      items: list.items.filter(item => !item.completed),
    }));
    void runRemote(() => Promise.all(completedIds.map(apiDeleteTask)), 'Tareas completadas eliminadas');
  };

  const resetToDemoData = (): void => {
    updateListsAndPersist(() => INITIAL_DEMO_LISTS);
    setLastActionMessage('Datos demo restaurados');
  };

  const clearAllData = (): void => {
    updateListsAndPersist(() => []);
    setLastActionMessage('Datos locales eliminados');
  };

  const clearBackendFeedback = () => {
    setError(null);
    setLastActionMessage(null);
    setFieldError(null);
  };

  const value = useMemo<ListContextValue>(() => ({
    lists,
    isLoading,
    isSyncing,
    error,
    lastActionMessage,
    preferences,
    updatePreferences,
    addList,
    updateList,
    deleteList,
    addItem,
    toggleItem,
    editItem,
    deleteItem,
    clearCompleted,
    resetToDemoData,
    clearAllData,
    syncFromApi,
    clearBackendFeedback,
    validationRules,
    validationError,
    fieldError,
  }), [lists, isLoading, isSyncing, error, lastActionMessage, validationRules, validationError, fieldError, preferences]);

  return <ListContext.Provider value={value}>{children}</ListContext.Provider>;
}

export function useLists(): ListContextValue {
  const context = useContext(ListContext);
  if (!context) throw new Error('useLists debe utilizarse dentro de un ListProvider');
  return context;
}

export * from './types';
