import { TABLES } from '../config/tables.js';
import { notFound } from '../errors.js';
import { mapDatabaseTask } from '../mappers.js';
import { ApiTask, CreateTaskInput, DatabaseTaskRow, UpdateTaskInput } from '../types/index.js';
import { getSupabase } from './supabase.service.js';

export async function getTasksByList(listId: string, userId: string): Promise<ApiTask[]> {
  const client = getSupabase();
  const { data, error } = await client
    .from(TABLES.tasks)
    .select('*')
    .eq('list_id', listId)
    .eq('user_id', userId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return ((data || []) as DatabaseTaskRow[]).map(mapDatabaseTask);
}

export async function getTaskById(id: string, userId: string): Promise<ApiTask> {
  const client = getSupabase();
  const { data, error } = await client.from(TABLES.tasks).select('*').eq('id', id).eq('user_id', userId).maybeSingle();
  if (error) throw error;
  if (!data) throw notFound('task');
  return mapDatabaseTask(data as DatabaseTaskRow);
}

export async function createTask(listId: string, input: CreateTaskInput, userId: string): Promise<ApiTask> {
  const client = getSupabase();
  const { data: list, error: listError } = await client
    .from(TABLES.lists)
    .select('id')
    .eq('id', listId)
    .eq('user_id', userId)
    .maybeSingle();
  if (listError) throw listError;
  if (!list) throw notFound('list');
  const { data, error } = await client
    .from(TABLES.tasks)
    .insert({ list_id: listId, user_id: userId, name: input.name, quantity: input.quantity, completed: false, completed_at: null })
    .select('*')
    .single();
  if (error) throw error;
  return mapDatabaseTask(data as DatabaseTaskRow);
}

export async function updateTask(id: string, input: UpdateTaskInput, userId: string): Promise<ApiTask> {
  const client = getSupabase();
  const { data, error } = await client.from(TABLES.tasks).update(input).eq('id', id).eq('user_id', userId).select('*').maybeSingle();
  if (error) throw error;
  if (!data) throw notFound('task');
  return mapDatabaseTask(data as DatabaseTaskRow);
}

export async function setTaskCompleted(id: string, completed: boolean, userId: string): Promise<ApiTask> {
  const client = getSupabase();
  const { data, error } = await client
    .from(TABLES.tasks)
    .update({ completed, completed_at: completed ? new Date().toISOString() : null })
    .eq('id', id)
    .eq('user_id', userId)
    .select('*')
    .maybeSingle();
  if (error) throw error;
  if (!data) throw notFound('task');
  return mapDatabaseTask(data as DatabaseTaskRow);
}

export async function deleteTask(id: string, userId: string): Promise<void> {
  const client = getSupabase();
  const { data, error } = await client.from(TABLES.tasks).delete().eq('id', id).eq('user_id', userId).select('id').maybeSingle();
  if (error) throw error;
  if (!data) throw notFound('task');
}
