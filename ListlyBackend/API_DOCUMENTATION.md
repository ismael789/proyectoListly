# API REST de Listly

Base local de desarrollo: `http://localhost:3000/api`.

Las respuestas exitosas usan:

```json
{ "success": true, "data": {} }
```

Los errores usan:

```json
{
  "success": false,
  "error": { "code": "VALIDATION_ERROR", "message": "Datos inválidos." }
}
```

## Autenticación

Registro, inicio de sesión y renovación no requieren encabezado de autorización:

| Método | Endpoint | Cuerpo |
|---|---|---|
| POST | `/api/auth/register` | `{"email":"persona@ejemplo.com","password":"mínimo 8 caracteres"}` |
| POST | `/api/auth/login` | `{"email":"persona@ejemplo.com","password":"mínimo 8 caracteres"}` |
| POST | `/api/auth/refresh` | `{"refreshToken":"<refresh_token>"}` |

Si Supabase exige confirmar el correo, el registro devuelve `requiresEmailConfirmation: true` sin una sesión. Después de confirmar, la persona puede iniciar sesión.

Todas las demás rutas, excepto `/api/health`, requieren `Authorization: Bearer <access_token>`. El backend verifica la sesión y filtra las operaciones por el usuario autenticado.

## Endpoints

| Método | Endpoint | Mobile | Watch | Función |
|---|---|---:|---:|---|
| GET | `/api/health` | Sí | Sí | Comprobar que la API está activa |
| POST | `/api/auth/register` | Sí | Sí | Crear cuenta con email y contraseña |
| POST | `/api/auth/login` | Sí | Sí | Iniciar sesión |
| POST | `/api/auth/refresh` | Sí | Sí | Renovar sesión expirada |
| GET | `/api/lists` | Sí | Sí | Consultar listas |
| GET | `/api/lists/:id` | Sí | Sí | Consultar una lista con sus tareas |
| POST | `/api/lists` | Sí | No | Crear lista |
| PUT/PATCH | `/api/lists/:id` | Sí | No | Editar lista |
| DELETE | `/api/lists/:id` | Sí | No | Eliminar lista |
| GET | `/api/lists/:listId/tasks` | Sí | Sí | Consultar tareas |
| POST | `/api/lists/:listId/tasks` | Sí | No | Crear tarea |
| GET | `/api/tasks/:id` | Sí | Sí | Consultar tarea |
| PUT/PATCH | `/api/tasks/:id` | Sí | No | Editar nombre/cantidad |
| DELETE | `/api/tasks/:id` | Sí | No | Eliminar tarea |
| PATCH | `/api/tasks/:id/completed` | Sí | Sí | Completar/descompletar |
| GET | `/api/config/validation` | Sí | No | Consultar reglas actuales de PostgreSQL |
| GET | `/api/config/validation/status` | Desarrollo | No | Diagnosticar caché de metadatos |

## Cuerpos

### Crear lista

```json
{ "name": "Compras", "category": "Compras" }
```

### Editar lista

```json
{ "name": "Supermercado semanal" }
```

### Crear tarea

```json
{ "name": "Leche", "quantity": 2 }
```

### Editar tarea

```json
{ "name": "Leche deslactosada", "quantity": 2 }
```

### Completar desde el reloj

```json
{ "completed": true }
```

La ruta `/completed` acepta únicamente `completed` como booleano. No acepta nombre, cantidad ni otros campos.

## Reglas dinámicas de validación

`GET /api/config/validation` devuelve las reglas derivadas del esquema real de PostgreSQL. Mobile utiliza `maxLength` en sus inputs cuando existe. El reloj no consulta esta configuración porque no crea ni edita texto.

Si la base de datos aún no tiene las tablas configuradas, la respuesta es `503` con el código `DATABASE_SCHEMA_NOT_READY`. El backend no sustituye las reglas faltantes por límites manuales.

## Códigos HTTP

- `200`: consulta o actualización correcta;
- `201`: creación correcta;
- `204`: eliminación correcta sin cuerpo;
- `400`: datos inválidos;
- `404`: recurso o ruta inexistente;
- `503`: Supabase no configurado;
- `500`: error interno no expuesto al cliente.
