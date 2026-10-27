import { ApiList, ApiTask, DatabaseListRow, DatabaseTaskRow } from './types/index.js';

export function mapDatabaseTask(row: DatabaseTaskRow): ApiTask {
  return {
    id: row.id,
    listId: row.list_id,
    name: row.name,
    quantity: row.quantity,
    completed: Boolean(row.completed),
    createdAt: row.created_at || new Date(0).toISOString(),
    completedAt: row.completed_at || null,
  };
}

export function mapDatabaseList(row: DatabaseListRow, items: ApiTask[] = []): ApiList {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    createdAt: row.created_at || new Date(0).toISOString(),
    items,
  };
}

export function mapListToDatabase(input: Record<string, unknown>) {
  return input;
}

export function mapTaskToDatabase(input: Record<string, unknown>) {
  return input;
}
