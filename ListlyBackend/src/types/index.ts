export type ListCategory =
  | 'Compras'
  | 'Universidad'
  | 'Hogar'
  | 'Viaje'
  | 'Trabajo'
  | 'Personal'
  | 'General';

export interface ApiList {
  id: string;
  name: string;
  category: ListCategory;
  createdAt: string;
  items: ApiTask[];
}

export interface ApiTask {
  id: string;
  listId: string;
  name: string;
  quantity: number;
  completed: boolean;
  createdAt: string;
  completedAt: string | null;
}

export interface DatabaseListRow {
  id: string;
  name: string;
  category: ListCategory;
  created_at?: string;
}

export interface DatabaseTaskRow {
  id: string;
  list_id: string;
  name: string;
  quantity: number;
  completed: boolean;
  created_at?: string;
  completed_at?: string | null;
}

export interface CreateListInput {
  name: string;
  category: ListCategory;
}

export interface UpdateListInput {
  name?: string;
  category?: ListCategory;
}

export interface CreateTaskInput {
  name: string;
  quantity: number;
}

export interface UpdateTaskInput {
  name?: string;
  quantity?: number;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiFailure {
  success: false;
  error: { code: string; message: string };
}
