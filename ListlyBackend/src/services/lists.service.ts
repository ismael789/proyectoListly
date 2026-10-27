import { TABLES } from '../config/tables.js';
import { notFound } from '../errors.js';
import { mapDatabaseList, mapDatabaseTask } from '../mappers.js';
import { ApiList, CreateListInput, DatabaseListRow, DatabaseTaskRow, UpdateListInput } from '../types/index.js';
import { getSupabase } from './supabase.service.js';

export async function getLists(userId: string): Promise<ApiList[]> {
  const client = getSupabase();
  const [{ data: lists, error: listsError }, { data: tasks, error: tasksError }] = await Promise.all([
    client.from(TABLES.lists).select('*').eq('user_id', userId).order('created_at', { ascending: false }),
    client.from(TABLES.tasks).select('*').eq('user_id', userId).order('created_at', { ascending: true }),
  ]);
  if (listsError) throw listsError;
  if (tasksError) throw tasksError;
  const byList = new Map<string, ReturnType<typeof mapDatabaseTask>[]>();
  for (const row of (tasks || []) as DatabaseTaskRow[]) {
    const current = byList.get(row.list_id) || [];
    current.push(mapDatabaseTask(row));
    byList.set(row.list_id, current);
  }
  return ((lists || []) as DatabaseListRow[]).map(row => mapDatabaseList(row, byList.get(row.id) || []));
}

export async function getListById(id: string, userId: string): Promise<ApiList> {
  const client = getSupabase();
  const { data, error } = await client.from(TABLES.lists).select('*').eq('id', id).eq('user_id', userId).maybeSingle();
  if (error) throw error;
  if (!data) throw notFound('list');
  const { data: tasks, error: tasksError } = await client
    .from(TABLES.tasks)
    .select('*')
    .eq('list_id', id)
    .eq('user_id', userId)
    .order('created_at', { ascending: true });
  if (tasksError) throw tasksError;
  return mapDatabaseList(data as DatabaseListRow, ((tasks || []) as DatabaseTaskRow[]).map(mapDatabaseTask));
}

export async function createList(input: CreateListInput, userId: string): Promise<ApiList> {
  const client = getSupabase();
  const { data, error } = await client.from(TABLES.lists).insert({ ...input, user_id: userId }).select('*').single();
  if (error) throw error;
  return mapDatabaseList(data as DatabaseListRow);
}

export async function updateList(id: string, input: UpdateListInput, userId: string): Promise<ApiList> {
  const client = getSupabase();
  const { data, error } = await client.from(TABLES.lists).update(input).eq('id', id).eq('user_id', userId).select('*').maybeSingle();
  if (error) throw error;
  if (!data) throw notFound('list');
  return mapDatabaseList(data as DatabaseListRow);
}

export async function deleteList(id: string, userId: string): Promise<void> {
  const client = getSupabase();
  const { data, error } = await client.from(TABLES.lists).delete().eq('id', id).eq('user_id', userId).select('id').maybeSingle();
  if (error) throw error;
  if (!data) throw notFound('list');
}
