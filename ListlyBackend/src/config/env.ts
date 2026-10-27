import 'dotenv/config';

export const env = {
  port: Number(process.env.PORT || 3000),
  host: process.env.HOST || '0.0.0.0',
  supabaseUrl: process.env.SUPABASE_URL || '',
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  databaseUrl: process.env.DATABASE_URL || '',
  databaseSchema: process.env.DATABASE_SCHEMA || 'public',
  metadataCacheTtlMs: Number(process.env.METADATA_CACHE_TTL_MS || 30000),
  validationStatusEnabled: process.env.NODE_ENV !== 'production' && process.env.VALIDATION_STATUS_ENABLED !== 'false',
  listsTable: process.env.SUPABASE_LISTS_TABLE || 'lists',
  tasksTable: process.env.SUPABASE_TASKS_TABLE || 'tasks',
  corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:8081')
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean),
};

export const isSupabaseConfigured = Boolean(
  env.supabaseUrl && env.supabaseServiceRoleKey,
);
