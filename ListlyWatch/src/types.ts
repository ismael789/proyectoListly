export type ListCategory =
  | 'Compras'
  | 'Universidad'
  | 'Hogar'
  | 'Viaje'
  | 'Trabajo'
  | 'Personal'
  | 'General';

export interface ListItem {
  id: string;
  name: string;
  quantity: number;
  completed: boolean;
  createdAt?: string;
  completedAt?: string | null;
}

export interface ListRecord {
  id: string;
  name: string;
  category: ListCategory;
  createdAt: string;
  items: ListItem[];
}

export type ThemeMode = 'dark' | 'light';
