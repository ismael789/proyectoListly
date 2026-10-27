import { Request, Response } from 'express';
import { AppError } from '../errors.js';
import { getAuthenticatedUserId } from '../middleware/auth.middleware.js';
import { createListSchema, idSchema, updateListSchema } from '../validation.js';
import * as listsService from '../services/lists.service.js';
import { getValidationRules, validatePayloadAgainstRules } from '../metadata/validation-rules.service.js';

function parse<T>(result: { success: boolean; data?: T; error?: { issues: Array<{ message: string }> } }): T {
  if (!result.success) {
    throw new AppError(400, 'VALIDATION_ERROR', result.error?.issues[0]?.message || 'Datos inválidos.');
  }
  return result.data as T;
}

export async function getLists(req: Request, res: Response) {
  res.json({ success: true, data: await listsService.getLists(getAuthenticatedUserId(req)) });
}

export async function getListById(req: Request, res: Response) {
  const id = parse(idSchema.safeParse(req.params.id));
  res.json({ success: true, data: await listsService.getListById(id, getAuthenticatedUserId(req)) });
}

export async function createList(req: Request, res: Response) {
  const input = parse(createListSchema.safeParse(req.body));
  validatePayloadAgainstRules(await getValidationRules(), 'lists', input);
  res.status(201).json({
    success: true,
    message: 'Lista creada correctamente',
    data: await listsService.createList(input, getAuthenticatedUserId(req)),
  });
}

export async function updateList(req: Request, res: Response) {
  const id = parse(idSchema.safeParse(req.params.id));
  const input = parse(updateListSchema.safeParse(req.body));
  validatePayloadAgainstRules(await getValidationRules(), 'lists', input);
  res.json({
    success: true,
    message: 'Lista actualizada correctamente',
    data: await listsService.updateList(id, input, getAuthenticatedUserId(req)),
  });
}

export async function deleteList(req: Request, res: Response) {
  const id = parse(idSchema.safeParse(req.params.id));
  await listsService.deleteList(id, getAuthenticatedUserId(req));
  res.status(200).json({ success: true, message: 'Lista eliminada correctamente' });
}
