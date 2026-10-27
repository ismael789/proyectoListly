import { Request, Response } from 'express';
import { env } from '../config/env.js';
import { AppError } from '../errors.js';
import { getValidationRules, getValidationStatus } from '../metadata/validation-rules.service.js';

export async function getValidationConfig(_req: Request, res: Response) {
  const rules = await getValidationRules();
  res.json({ success: true, message: 'Reglas de validación obtenidas correctamente', data: rules });
}

export async function getValidationConfigStatus(_req: Request, res: Response) {
  if (!env.validationStatusEnabled) {
    throw new AppError(404, 'ROUTE_NOT_FOUND', 'Ruta no encontrada.');
  }
  res.json({ success: true, data: getValidationStatus() });
}
