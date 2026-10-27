import { Router } from 'express';
import { asyncHandler } from '../middleware/async.middleware.js';
import * as controller from '../controllers/auth.controller.js';

export const authRouter = Router();

authRouter.post('/register', asyncHandler(controller.register));
authRouter.post('/login', asyncHandler(controller.login));
authRouter.post('/refresh', asyncHandler(controller.refresh));
