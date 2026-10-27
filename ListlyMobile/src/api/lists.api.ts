import { ListCategory, ListRecord } from '../types';
import { apiRequest } from './client';

export function getLists(): Promise<ListRecord[]> {
  return apiRequest<ListRecord[]>('/lists');
}

export function getList(id: string): Promise<ListRecord> {
  return apiRequest<ListRecord>(`/lists/${encodeURIComponent(id)}`);
}

export function createList(name: string, category: ListCategory): Promise<ListRecord> {
  return apiRequest<ListRecord>('/lists', {
    method: 'POST',
    body: JSON.stringify({ name, category }),
  });
}

export function updateList(id: string, input: Partial<Pick<ListRecord, 'name' | 'category'>>): Promise<ListRecord> {
  return apiRequest<ListRecord>(`/lists/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export function deleteList(id: string): Promise<void> {
  return apiRequest<void>(`/lists/${encodeURIComponent(id)}`, { method: 'DELETE' });
}
