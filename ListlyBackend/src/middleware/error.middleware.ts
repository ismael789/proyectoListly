import { ErrorRequestHandler } from 'express';
import { AppError } from '../errors.js';

export const errorMiddleware: ErrorRequestHandler = (error, _req, res, _next) => {
  const isExpected = error instanceof AppError;
  const status = isExpected ? error.statusCode : 500;
  const code = isExpected ? error.code : 'INTERNAL_SERVER_ERROR';
  const message = isExpected ? error.message : 'Ocurrió un error interno.';

  if (!isExpected) console.error('[ListlyBackend]', error);

  const details = isExpected && (error.field || error.limit !== undefined)
    ? { field: error.field, limit: error.limit }
    : undefined;

  res.status(status).json({
    success: false,
    error: { code, message, ...(details || {}) },
  });
};
