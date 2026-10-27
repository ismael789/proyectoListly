import { ListItem } from '../types';
import { apiRequest } from './client';

export function getTasks(listId: string): Promise<ListItem[]> {
  return apiRequest<ListItem[]>(`/lists/${encodeURIComponent(listId)}/tasks`);
}

export function createTask(listId: string, name: string, quantity: number): Promise<ListItem> {
  return apiRequest<ListItem>(`/lists/${encodeURIComponent(listId)}/tasks`, {
    method: 'POST',
    body: JSON.stringify({ name, quantity }),
  });
}

export function updateTask(id: string, input: Partial<Pick<ListItem, 'name' | 'quantity'>>): Promise<ListItem> {
  return apiRequest<ListItem>(`/tasks/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export function deleteTask(id: string): Promise<void> {
  return apiRequest<void>(`/tasks/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

export function setTaskCompleted(id: string, completed: boolean): Promise<ListItem> {
  return apiRequest<ListItem>(`/tasks/${encodeURIComponent(id)}/completed`, {
    method: 'PATCH',
    body: JSON.stringify({ completed }),
  });
}
