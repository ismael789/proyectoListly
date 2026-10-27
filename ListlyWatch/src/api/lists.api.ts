import { ListRecord } from '../types';
import { apiRequest } from './client';

export function getLists(): Promise<ListRecord[]> {
  return apiRequest<ListRecord[]>('/lists');
}

export function getList(id: string): Promise<ListRecord> {
  return apiRequest<ListRecord>(`/lists/${encodeURIComponent(id)}`);
}

export function getTasks(listId: string): Promise<ListRecord['items']> {
  return apiRequest<ListRecord['items']>(`/lists/${encodeURIComponent(listId)}/tasks`);
}
