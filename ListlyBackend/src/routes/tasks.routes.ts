import { Router } from 'express';
import { asyncHandler } from '../middleware/async.middleware.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import * as controller from '../controllers/tasks.controller.js';

export const tasksRouter = Router();

tasksRouter.use(requireAuth);
tasksRouter.get('/lists/:listId/tasks', asyncHandler(controller.getTasksByList));
tasksRouter.post('/lists/:listId/tasks', asyncHandler(controller.createTask));
tasksRouter.get('/tasks/:id', asyncHandler(controller.getTaskById));
tasksRouter.put('/tasks/:id', asyncHandler(controller.updateTask));
tasksRouter.patch('/tasks/:id', asyncHandler(controller.updateTask));
tasksRouter.patch('/tasks/:id/completed', asyncHandler(controller.setTaskCompleted));
tasksRouter.delete('/tasks/:id', asyncHandler(controller.deleteTask));
