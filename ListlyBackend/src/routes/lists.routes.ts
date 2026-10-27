import { Router } from 'express';
import { asyncHandler } from '../middleware/async.middleware.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import * as controller from '../controllers/lists.controller.js';

export const listsRouter = Router();

listsRouter.use(requireAuth);
listsRouter.get('/', asyncHandler(controller.getLists));
listsRouter.get('/:id', asyncHandler(controller.getListById));
listsRouter.post('/', asyncHandler(controller.createList));
listsRouter.put('/:id', asyncHandler(controller.updateList));
listsRouter.patch('/:id', asyncHandler(controller.updateList));
listsRouter.delete('/:id', asyncHandler(controller.deleteList));
