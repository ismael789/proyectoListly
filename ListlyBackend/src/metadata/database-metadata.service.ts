import { Pool } from 'pg';
import { env } from '../config/env.js';
import { AppError } from '../errors.js';
import { DatabaseCheckConstraint, DatabaseColumnMetadata } from './metadata.types.js';

let pool: Pool | null = null;

function getPool(): Pool {
  if (!env.databaseUrl) {
    throw new AppError(503, 'DATABASE_SCHEMA_NOT_READY', 'La estructura de base de datos todavía no está disponible.');
  }
  if (!pool) {
    pool = new Pool({ connectionString: env.databaseUrl, max: 2 });
  }
  return pool;
}

export async function readDatabaseColumns(): Promise<DatabaseColumnMetadata[]> {
  const database = getPool();
  const result = await database.query<{
    table_name: string;
    column_name: string;
    data_type: string;
    udt_name: string;
    character_maximum_length: number | null;
    numeric_precision: number | null;
    numeric_scale: number | null;
    is_nullable: 'YES' | 'NO';
    column_default: string | null;
  }>(
    `SELECT table_name, column_name, data_type, udt_name,
            character_maximum_length, numeric_precision, numeric_scale,
            is_nullable, column_default
       FROM information_schema.columns
      WHERE table_schema = $1
        AND table_name = ANY($2::text[])
      ORDER BY table_name, ordinal_position`,
    [env.databaseSchema, [env.listsTable, env.tasksTable]],
  );

  if (!result.rows.some(row => row.table_name === env.listsTable) ||
      !result.rows.some(row => row.table_name === env.tasksTable)) {
    throw new AppError(503, 'DATABASE_SCHEMA_NOT_READY', 'La estructura de base de datos todavía no está disponible.');
  }

  return result.rows.map(row => ({
    tableName: row.table_name,
    columnName: row.column_name,
    dataType: row.data_type,
    udtName: row.udt_name,
    characterMaximumLength: row.character_maximum_length,
    numericPrecision: row.numeric_precision,
    numericScale: row.numeric_scale,
    isNullable: row.is_nullable === 'YES',
    columnDefault: row.column_default,
  }));
}

export async function readDatabaseCheckConstraints(): Promise<DatabaseCheckConstraint[]> {
  const database = getPool();
  const result = await database.query<{ table_name: string; constraint_name: string; definition: string }>(
    `SELECT cls.relname AS table_name,
            con.conname AS constraint_name,
            pg_get_constraintdef(con.oid) AS definition
       FROM pg_constraint con
       JOIN pg_class cls ON cls.oid = con.conrelid
       JOIN pg_namespace ns ON ns.oid = cls.relnamespace
      WHERE ns.nspname = $1
        AND cls.relname = ANY($2::text[])
        AND con.contype = 'c'`,
    [env.databaseSchema, [env.listsTable, env.tasksTable]],
  );

  return result.rows.map(row => ({
    tableName: row.table_name,
    name: row.constraint_name,
    definition: row.definition,
  }));
}
