export interface DatabaseColumnMetadata {
  tableName: string;
  columnName: string;
  dataType: string;
  udtName: string;
  characterMaximumLength: number | null;
  numericPrecision: number | null;
  numericScale: number | null;
  isNullable: boolean;
  columnDefault: string | null;
}

export interface DatabaseCheckConstraint {
  tableName: string;
  name: string;
  definition: string;
}

export type ValidationRuleType = 'string' | 'number' | 'boolean' | 'unknown';

export interface ValidationRule {
  type: ValidationRuleType;
  required: boolean;
  maxLength: number | null;
  min: number | null;
  max: number | null;
  precision: number | null;
  scale: number | null;
}

export interface ValidationRules {
  source: 'postgresql';
  generatedAt: string;
  lists: Record<string, ValidationRule>;
  tasks: Record<string, ValidationRule>;
}
