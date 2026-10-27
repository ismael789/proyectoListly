import cors from 'cors';
import express from 'express';
import { env } from './config/env.js';
import { authRouter } from './routes/auth.routes.js';
import { errorMiddleware } from './middleware/error.middleware.js';
import { notFoundMiddleware } from './middleware/not-found.middleware.js';
import { listsRouter } from './routes/lists.routes.js';
import { tasksRouter } from './routes/tasks.routes.js';
import { validationRouter } from './routes/validation.routes.js';

export const app = express();

app.disable('x-powered-by');
app.use(express.json({ limit: '100kb' }));
app.use(cors({ origin: env.corsOrigins }));

app.get('/api/health', (_req, res) => {
  res.json({ success: true, status: 'ok' });
});

app.use('/api/auth', authRouter);
app.use('/api/config/validation', validationRouter);
app.use('/api/lists', listsRouter);
app.use('/api', tasksRouter);
app.use(notFoundMiddleware);
app.use(errorMiddleware);
