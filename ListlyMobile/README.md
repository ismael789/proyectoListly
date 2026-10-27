# Listly Mobile

Frontend móvil de Listly desarrollado con Expo, React Native, TypeScript y Expo Router.

## Funciones incluidas
- Inicio con resumen y listas recientes.
- Crear listas y elegir categoría.
- Abrir listas, agregar, completar, editar y eliminar artículos.
- Eliminar listas.
- Historial de listas terminadas.
- Tema claro, oscuro y automático.
- Datos de demostración en memoria (se reinician al recargar la app).

## Instalación

Requisitos: Node.js LTS, Expo SDK 57 y Android Studio si quieres usar un emulador Android.

```bash
npm install
npx expo install --fix
npx expo start
```

Para Android, pulsa `a` en la terminal de Expo o ejecuta `npm run android`.

## Nota sobre la plantilla
Si creaste el proyecto con `npx create-expo-app`, conserva el `package-lock.json` que generó npm. Copia la carpeta `app` y `src` de este proyecto sobre la plantilla existente, y adapta `package.json` si tu versión de Expo es distinta. Es preferible respetar las versiones de Expo ya instaladas en tu entorno en vez de forzar una actualización.

## Conectar con ListlyBackend

La app usa el backend REST; no se conecta directamente a Supabase. Copia `.env.example` a `.env` y configura:

```env
EXPO_PUBLIC_LISTLY_API_URL=http://localhost:3000/api
```

En un teléfono físico, sustituye `localhost` por la IP local del equipo donde se ejecuta el backend. Si la variable está configurada, la app solicita inicio de sesión o registro con email y contraseña. Las sesiones se guardan con `expo-secure-store` en Android/iOS (AsyncStorage en web); después del login, las listas se sincronizan desde el backend.

El backend requiere la migración SQL de `ListlyBackend/supabase/migrations` y sus variables privadas configuradas. Consulta `ListlyBackend/README.md` para el orden de instalación.
