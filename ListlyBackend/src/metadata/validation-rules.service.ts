import { AppError } from '../errors.js';
import { env } from '../config/env.js';
import { readDatabaseCheckConstraints, readDatabaseColumns } from './database-metadata.service.js';
import { DatabaseCheckConstraint, DatabaseColumnMetadata, ValidationRule, ValidationRules } from './metadata.types.js';

interface CachedRules {
  rules: ValidationRules;
  cachedAt: string;
  expiresAt: number;
}

let cache: CachedRules | null = null;

function getRuleType(column: DatabaseColumnMetadata): ValidationRule['type'] {
  if (['character varying', 'character', 'text'].includes(column.dataType)) return 'string';
  if (['smallint', 'integer', 'bigint', 'numeric', 'decimal', 'real', 'double precision'].includes(column.dataType)) return 'number';
  if (column.dataType === 'boolean') return 'boolean';
  return 'unknown';
}

function numericBounds(constraints: DatabaseCheckConstraint[], columnName: string) {
  let min: number | null = null;
  let max: number | null = null;
  const escapedColumn = columnName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const expression = new RegExp(`(?:\\"?${escapedColumn}\\"?)\\s*(>=|<=|>|<)\\s*(-?\\d+(?:\\.\\d+)?)`, 'gi');
  for (const constraint of constraints) {
    let match: RegExpExecArray | null;
    while ((match = expression.exec(constraint.definition)) !== null) {
      const value = Number(match[2]);
      if (!Number.isFinite(value)) continue;
      if (match[1] === '>=' || match[1] === '>') min = min === null ? value : Math.max(min, value);
      if (match[1] === '<=' || match[1] === '<') max = max === null ? value : Math.min(max, value);
    }
  }
  return { min, max };
}

function buildRule(column: DatabaseColumnMetadata, constraints: DatabaseCheckConstraint[]): ValidationRule {
  const bounds = numericBounds(constraints.filter(item => item.tableName === column.tableName), column.columnName);
  return {
    type: getRuleType(column),
    required: !column.isNullable,
    maxLength: column.characterMaximumLength,
    min: bounds.min,
    max: bounds.max,
    precision: column.numericPrecision,
    scale: column.numericScale,
  };
}

export async function getValidationRules(forceRefresh = false): Promise<ValidationRules> {
  if (!forceRefresh && cache && cache.expiresAt > Date.now()) return cache.rules;
  const [columns, constraints] = await Promise.all([
    readDatabaseColumns(),
    readDatabaseCheckConstraints(),
  ]);
  const forTable = (tableName: string) => Object.fromEntries(
    columns
      .filter(column => column.tableName === tableName)
      .map(column => [column.columnName, buildRule(column, constraints)]),
  );
  const rules: ValidationRules = {
    source: 'postgresql',
    generatedAt: new Date().toISOString(),
    lists: forTable(env.listsTable),
    tasks: forTable(env.tasksTable),
  };
  const cachedAt = new Date().toISOString();
  cache = { rules, cachedAt, expiresAt: Date.now() + Math.max(1000, env.metadataCacheTtlMs) };
  return rules;
}

export function clearValidationRulesCache() {
  cache = null;
}

export function getValidationStatus() {
  return {
    metadataAvailable: Boolean(cache),
    cachedAt: cache?.cachedAt || null,
    expiresAt: cache ? new Date(cache.expiresAt).toISOString() : null,
    tables: [env.listsTable, env.tasksTable],
    rules: cache?.rules || null,
  };
}

function invalid(field: string, message: string, limit?: number): never {
  throw new AppError(400, limit === undefined ? 'INVALID_DATA' : 'MAX_LENGTH_EXCEEDED', message, { field, limit });
}

export function validatePayloadAgainstRules(
  rules: ValidationRules,
  section: 'lists' | 'tasks',
  payload: Record<string, unknown>,
) {
  const sectionRules = rules[section];
  for (const [field, value] of Object.entries(payload)) {
    const rule = sectionRules[field];
    if (!rule) {
      throw new AppError(503, 'DATABASE_SCHEMA_NOT_READY', `No existe una regla de BD para el campo ${field}.`);
    }
    if (value === undefined || value === null) continue;
    if (rule.type === 'string') {
      if (typeof value !== 'string' || value.trim().length === 0) invalid(field, `El campo ${field} debe ser texto.`);
      if (rule.maxLength !== null && (value as string).length > rule.maxLength) invalid(field, `El campo ${field} no puede superar ${rule.maxLength} caracteres.`, rule.maxLength);
    }
    if (rule.type === 'number') {
      if (typeof value !== 'number' || !Number.isFinite(value)) invalid(field, `El campo ${field} debe ser numérico.`);
      if (rule.scale === 0 && !Number.isInteger(value)) invalid(field, `El campo ${field} debe ser entero.`);
      if (rule.min !== null && value < rule.min) invalid(field, `El campo ${field} debe ser mayor o igual que ${rule.min}.`);
      if (rule.max !== null && value > rule.max) invalid(field, `El campo ${field} no puede superar ${rule.max}.`);
    }
    if (rule.type === 'boolean' && typeof value !== 'boolean') invalid(field, `El campo ${field} debe ser booleano.`);
  }
}
