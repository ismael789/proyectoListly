# Listly Watch

Aplicación de reloj para consultar listas y marcar tareas completadas. Sincroniza exclusivamente mediante `ListlyBackend`.

## Desarrollo

```powershell
Copy-Item .env.example .env
npm install
npx expo start
```

Configura `EXPO_PUBLIC_LISTLY_API_URL` en `.env`. En un reloj o emulador físico, usa una dirección del backend accesible desde ese dispositivo, no `localhost`.

Cuando la API está configurada, el reloj requiere inicio de sesión o registro con la misma cuenta que Mobile. Las credenciales pasan por el backend; el token se guarda con `expo-secure-store` en Android (AsyncStorage en web). La API solo permite leer listas propias y cambiar el estado completado.

Para crear la base de datos y configurar el backend, sigue `ListlyBackend/README.md`. La app mantiene listas demo si no se configura la URL de API.
