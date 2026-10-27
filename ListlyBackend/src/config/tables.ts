import { env } from './env.js';

/** Nombres provisionales centralizados; no representan todavía el esquema físico definitivo. */
export const TABLES = {
  lists: env.listsTable,
  tasks: env.tasksTable,
} as const;
