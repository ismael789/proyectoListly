import { ListItem } from '../types';
import { apiRequest } from './client';

export function setTaskCompleted(id: string, completed: boolean): Promise<ListItem> {
  return apiRequest<ListItem>(`/tasks/${encodeURIComponent(id)}/completed`, {
    method: 'PATCH',
    body: JSON.stringify({ completed }),
  });
}
