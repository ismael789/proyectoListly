import { Router } from 'express';
import { asyncHandler } from '../middleware/async.middleware.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import * as controller from '../controllers/validation.controller.js';

export const validationRouter = Router();

validationRouter.use(requireAuth);
validationRouter.get('/', asyncHandler(controller.getValidationConfig));
validationRouter.get('/status', asyncHandler(controller.getValidationConfigStatus));
