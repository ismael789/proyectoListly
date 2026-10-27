import { Request, Response } from 'express';
import { AppError } from '../errors.js';
import { getSupabase } from '../services/supabase.service.js';
import { z } from 'zod';

const credentialsSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8),
}).strict();

const refreshSchema = z.object({
  refreshToken: z.string().min(1),
}).strict();

function parse<T>(result: { success: boolean; data?: T; error?: { issues: Array<{ message: string }> } }): T {
  if (!result.success) {
    throw new AppError(400, 'VALIDATION_ERROR', result.error?.issues[0]?.message || 'Datos inválidos.');
  }
  return result.data as T;
}

export async function register(req: Request, res: Response) {
  const { email, password } = parse(credentialsSchema.safeParse(req.body));
  const { data, error } = await getSupabase().auth.signUp({ email, password });
  if (error) throw new AppError(400, 'AUTH_ERROR', error.message);
  res.status(201).json({
    success: true,
    data: {
      session: data.session,
      user: data.user ? { id: data.user.id, email: data.user.email } : null,
      requiresEmailConfirmation: !data.session,
    },
  });
}

export async function login(req: Request, res: Response) {
  const { email, password } = parse(credentialsSchema.safeParse(req.body));
  const { data, error } = await getSupabase().auth.signInWithPassword({ email, password });
  if (error) throw new AppError(401, 'AUTH_ERROR', 'Correo o contraseña incorrectos.');
  res.json({
    success: true,
    data: {
      session: data.session,
      user: { id: data.user.id, email: data.user.email },
    },
  });
}

export async function refresh(req: Request, res: Response) {
  const { refreshToken } = parse(refreshSchema.safeParse(req.body));
  const { data, error } = await getSupabase().auth.refreshSession({ refresh_token: refreshToken });
  if (error || !data.session) {
    throw new AppError(401, 'UNAUTHORIZED', 'La sesión venció. Inicia sesión nuevamente.');
  }
  res.json({
    success: true,
    data: {
      session: data.session,
      user: { id: data.user?.id, email: data.user?.email },
    },
  });
}
