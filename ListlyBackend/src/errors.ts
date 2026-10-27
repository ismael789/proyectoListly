export class AppError extends Error {
  statusCode: number;
  code: string;
  field?: string;
  limit?: number;

  constructor(statusCode: number, code: string, message: string, details?: { field?: string; limit?: number }) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.field = details?.field;
    this.limit = details?.limit;
  }
}

export function notConfigured(): AppError {
  return new AppError(503, 'BACKEND_NOT_CONFIGURED', 'Supabase no está configurado.');
}

export function notFound(resource: string): AppError {
  return new AppError(404, `${resource.toUpperCase()}_NOT_FOUND`, `${resource} no encontrado.`);
}
