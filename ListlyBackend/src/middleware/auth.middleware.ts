import { NextFunction, Request, Response } from 'express';
import { getSupabase } from '../services/supabase.service.js';
import { AppError } from '../errors.js';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const authorization = req.header('authorization');
  const token = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) {
    throw new AppError(401, 'UNAUTHORIZED', 'Debes iniciar sesión para continuar.');
  }

  const { data, error } = await getSupabase().auth.getUser(token);
  if (error || !data.user) {
    throw new AppError(401, 'UNAUTHORIZED', 'La sesión no es válida o ha caducado.');
  }

  req.userId = data.user.id;
  next();
}

export function getAuthenticatedUserId(req: Request): string {
  if (!req.userId) {
    throw new AppError(401, 'UNAUTHORIZED', 'Debes iniciar sesión para continuar.');
  }
  return req.userId;
}
