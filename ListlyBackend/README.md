# ListlyBackend

API REST independiente para `ListlyMobile` y `ListlyWatch`.

```text
ListlyMobile ──HTTP──> ListlyBackend ──Supabase SDK──> Supabase
ListlyWatch  ──HTTP──> ListlyBackend ──Supabase SDK──> Supabase
```

## Base de datos Supabase

La migración inicial está en `supabase/migrations/20261024140000_create_lists_and_tasks.sql`. Crea `public.lists` y `public.tasks`, relaciones por propietario, restricciones, índices, triggers de actualización y políticas RLS.

Para aplicarla:

1. Crea un proyecto Supabase.
2. Abre **SQL Editor** en el dashboard, copia el contenido de la migración y ejecútalo una sola vez; o inicializa el directorio con `supabase init`, enlaza el proyecto (`supabase link --project-ref <PROJECT_REF>`) y ejecuta `supabase db push`.
3. En **Authentication → Providers → Email**, configura si Supabase debe exigir confirmación del correo.
4. Copia `.env.example` a `.env` y configura las claves privadas del backend.
5. Configura `DATABASE_URL` con la cadena PostgreSQL privada de Supabase para que estén disponibles validaciones y escrituras.
6. Configura `EXPO_PUBLIC_LISTLY_API_URL` en Mobile y Watch para apuntar al backend.

La migración no se ejecuta automáticamente ni se conecta a un proyecto remoto. `DATABASE_URL` es necesaria para las reglas dinámicas, escrituras de listas/tareas y el funcionamiento completo de Mobile; el backend solo puede hacer lecturas de listas sin ella.

El modelo es privado por cuenta: cada lista y tarea tiene `user_id`; la relación compuesta impide asignar una tarea de otra persona a una lista; RLS refuerza la propiedad. El backend verifica el token de Supabase Auth y filtra cada operación por ese usuario.

## Instalación

```bash
npm install
copy .env.example .env
npm run typecheck
npm run dev
```

Variables sensibles como `SUPABASE_SERVICE_ROLE_KEY` solo deben existir en `ListlyBackend/.env`. Nunca deben copiarse a ninguna app Expo ni a variables `EXPO_PUBLIC_*`.

## Arquitectura

```text
routes → controllers → services → Supabase
```

- Las rutas declaran endpoints.
- Los controladores validan entradas y respuestas HTTP.
- Los servicios contienen acceso a Supabase y restringen todas las consultas al usuario autenticado.
- El middleware verifica los tokens de Supabase Auth antes de acceder a datos o metadatos.
- El middleware devuelve errores consistentes.

El registro, inicio de sesión y renovación de sesión usan `/api/auth/*`. Las apps conservan el token de sesión localmente; nunca contienen la clave `service_role`.
