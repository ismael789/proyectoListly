import { z } from 'zod';

export const categorySchema = z.enum([
  'Compras',
  'Universidad',
  'Hogar',
  'Viaje',
  'Trabajo',
  'Personal',
  'General',
]);

export const idSchema = z.string().uuid();

export const createListSchema = z.object({
  name: z.string().trim().min(1),
  category: categorySchema,
}).strict();

export const updateListSchema = createListSchema.partial().refine(
  value => Object.keys(value).length > 0,
  'Debe proporcionar al menos un campo editable.',
);

export const createTaskSchema = z.object({
  name: z.string().trim().min(1),
  quantity: z.number().finite().int().min(1),
}).strict();

export const updateTaskSchema = createTaskSchema.partial().refine(
  value => Object.keys(value).length > 0,
  'Debe proporcionar al menos un campo editable.',
);

export const completedSchema = z.object({ completed: z.boolean() }).strict();
