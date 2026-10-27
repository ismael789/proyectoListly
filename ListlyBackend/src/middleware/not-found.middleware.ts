import { RequestHandler } from 'express';
import { AppError } from '../errors.js';

export const notFoundMiddleware: RequestHandler = (_req, _res, next) => {
  next(new AppError(404, 'ROUTE_NOT_FOUND', 'Ruta no encontrada.'));
};
