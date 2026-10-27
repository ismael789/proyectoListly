import { ValidationRule } from './api/validation.api';

export function validateText(value: string, label: string, rule?: ValidationRule): string | null {
  const trimmed = value.trim();
  if (!trimmed) return `${label} es obligatorio.`;
  if (rule?.maxLength !== null && rule?.maxLength !== undefined && trimmed.length > rule.maxLength) {
    return `${label} no puede superar ${rule.maxLength} caracteres.`;
  }
  return null;
}

export function validateNumber(value: number, label: string, rule?: ValidationRule): string | null {
  if (!Number.isFinite(value) || !Number.isInteger(value)) return `${label} debe ser un número entero.`;
  if (rule?.min !== null && rule?.min !== undefined && value < rule.min) return `${label} debe ser mayor o igual que ${rule.min}.`;
  if (rule?.max !== null && rule?.max !== undefined && value > rule.max) return `${label} no puede superar ${rule.max}.`;
  return null;
}
