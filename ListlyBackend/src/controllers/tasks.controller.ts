import { Request, Response } from 'express';
import { AppError } from '../errors.js';
import { getAuthenticatedUserId } from '../middleware/auth.middleware.js';
import { idSchema, createTaskSchema, updateTaskSchema, completedSchema } from '../validation.js';
import * as tasksService from '../services/tasks.service.js';
import { getValidationRules, validatePayloadAgainstRules } from '../metadata/validation-rules.service.js';

function parse<T>(result: { success: boolean; data?: T; error?: { issues: Array<{ message: string }> } }): T {
  if (!result.success) {
    throw new AppError(400, 'VALIDATION_ERROR', result.error?.issues[0]?.message || 'Datos inválidos.');
  }
  return result.data as T;
}

export async function getTasksByList(req: Request, res: Response) {
  const listId = parse(idSchema.safeParse(req.params.listId));
  res.json({ success: true, data: await tasksService.getTasksByList(listId, getAuthenticatedUserId(req)) });
}

export async function getTaskById(req: Request, res: Response) {
  const id = parse(idSchema.safeParse(req.params.id));
  res.json({ success: true, data: await tasksService.getTaskById(id, getAuthenticatedUserId(req)) });
}

export async function createTask(req: Request, res: Response) {
  const listId = parse(idSchema.safeParse(req.params.listId));
  const input = parse(createTaskSchema.safeParse(req.body));
  validatePayloadAgainstRules(await getValidationRules(), 'tasks', input);
  res.status(201).json({
    success: true,
    message: 'Tarea creada correctamente',
    data: await tasksService.createTask(listId, input, getAuthenticatedUserId(req)),
  });
}

export async function updateTask(req: Request, res: Response) {
  const id = parse(idSchema.safeParse(req.params.id));
  const input = parse(updateTaskSchema.safeParse(req.body));
  validatePayloadAgainstRules(await getValidationRules(), 'tasks', input);
  res.json({
    success: true,
    message: 'Tarea actualizada correctamente',
    data: await tasksService.updateTask(id, input, getAuthenticatedUserId(req)),
  });
}

export async function setTaskCompleted(req: Request, res: Response) {
  const id = parse(idSchema.safeParse(req.params.id));
  const { completed } = parse(completedSchema.safeParse(req.body));
  validatePayloadAgainstRules(await getValidationRules(), 'tasks', { completed });
  res.json({
    success: true,
    message: completed ? 'Tarea marcada como completada' : 'Tarea marcada como pendiente',
    data: await tasksService.setTaskCompleted(id, completed, getAuthenticatedUserId(req)),
  });
}

export async function deleteTask(req: Request, res: Response) {
  const id = parse(idSchema.safeParse(req.params.id));
  await tasksService.deleteTask(id, getAuthenticatedUserId(req));
  res.status(200).json({ success: true, message: 'Tarea eliminada correctamente' });
}
