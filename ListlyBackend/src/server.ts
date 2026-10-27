import { app } from './app.js';
import { env } from './config/env.js';

app.listen(env.port, env.host, () => {
  console.log(`[ListlyBackend] API escuchando en todas las interfaces, puerto ${env.port}`);
  console.log(`[ListlyBackend] Prueba local: http://localhost:${env.port}/api/health`);
});
