import { apiRequest } from './client';

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

export function getValidationRules(): Promise<ValidationRules> {
  return apiRequest<ValidationRules>('/config/validation');
}
