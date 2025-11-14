# Sistema de Autenticación de Google Drive

## Problema Resuelto

Anteriormente, cuando un usuario conectaba su cuenta de Google Drive y después de un tiempo (aproximadamente 1 hora) intentaba subir un archivo, obtenía el siguiente error:

```
403. That's an error.
We're sorry, but you do not have access to this page. That's all we know.
Failed to load resource: the server responded with a status of 403
```

Este error ocurría porque:

1. Los tokens de acceso de Google OAuth2 expiran después de ~1 hora
2. El sistema guardaba el token en `localStorage` pero no verificaba si había expirado
3. No había un mecanismo de renovación automática del token

## Solución Implementada

Se creó un **Google Auth Manager** centralizado que maneja:

### 1. Gestión Inteligente de Tokens

- Guarda el token junto con su tiempo de expiración
- Verifica automáticamente si el token está expirado antes de usarlo
- Renueva el token automáticamente cuando es necesario

### 2. Margen de Seguridad

- Los tokens se consideran expirados 5 minutos antes de su expiración real
- Esto previene errores por tokens que expiran durante una operación

### 3. Persistencia Optimizada

- Usa `localStorage` para persistir tokens entre sesiones
- Almacena tanto el token como su timestamp de expiración
- Limpia automáticamente tokens inválidos

## Arquitectura

### GoogleAuthManager (`lib/utils/googleAuthManager.ts`)

Clase singleton que centraliza toda la lógica de autenticación para múltiples servicios de Google:

```typescript
// Obtener un token válido de Drive (renovado automáticamente si expiró)
const token = await googleAuthManager.getValidToken(clientId, "drive");

// Obtener un token válido de Calendar
const calendarToken = await googleAuthManager.getValidToken(
  clientId,
  "calendar"
);

// Verificar si hay un token guardado para Drive
const hasDriveToken = googleAuthManager.hasStoredToken("drive");

// Verificar si hay un token guardado para Calendar
const hasCalendarToken = googleAuthManager.hasStoredToken("calendar");

// Forzar renovación del token de un servicio
const newToken = await googleAuthManager.forceRefreshToken(clientId, "drive");

// Desconectar un servicio específico
googleAuthManager.disconnect("drive");

// Desconectar todos los servicios
googleAuthManager.disconnect();
```

#### Servicios Soportados

- **`drive`**: Google Drive API
  - Scope: `https://www.googleapis.com/auth/drive.file`
  - Storage keys: `googleDriveAccessToken`, `googleDriveTokenExpiresAt`

- **`calendar`**: Google Calendar API
  - Scope: `https://www.googleapis.com/auth/calendar.readonly`
  - Storage keys: `googleCalendarAccessToken`, `googleCalendarTokenExpiresAt`

### Componentes Actualizados

#### 1. `GoogleDriveCell` (`app/g/components/GoogleDriveCell.tsx`)

- Usa `googleAuthManager` en lugar de gestionar tokens localmente
- El método `getValidAccessToken()` siempre devuelve un token válido
- No necesita `useEffect` para cargar el token

#### 2. `GoogleDriveItem` (`components/blocks/GoogleDriveItem.tsx`)

- Usa `googleAuthManager` para todas las operaciones con Google Drive
- Genera previews automáticamente con tokens renovados
- Maneja errores de token de forma centralizada

## Flujo de Autenticación

### Primera Conexión

```
Usuario → Click "Connect" → Google OAuth → Token guardado (con expiración)
```

### Uso Posterior (Token Válido)

```
Usuario → Click "Add file" → Verificar token → Token válido → Abrir Picker
```

### Uso Posterior (Token Expirado)

```
Usuario → Click "Add file" → Verificar token → Token expirado
  → Solicitar nuevo token automáticamente → Abrir Picker
```

## Configuración Requerida

Asegúrate de tener estas variables de entorno configuradas:

```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=tu_client_id_de_google
NEXT_PUBLIC_GOOGLE_API_KEY=tu_api_key_de_google
```

## Características Adicionales

### 1. Renovación Silenciosa

El sistema intenta renovar tokens silenciosamente usando `prompt: ""`, lo que evita mostrar el popup de Google si es posible.

### 2. Manejo de Errores

- Si la renovación falla, se limpia el token antiguo
- El usuario verá el estado "desconectado" y puede reconectar
- Los errores se registran en la consola con prefijos identificables

### 3. Compatibilidad hacia atrás

- El sistema sigue usando `localStorage` con las mismas keys
- Añade una nueva key para el timestamp de expiración
- Los tokens antiguos se migran automáticamente

## Storage Keys

### Google Drive

```typescript
googleDriveAccessToken; // El token de acceso de Drive
googleDriveTokenExpiresAt; // Timestamp de expiración de Drive (ms)
```

### Google Calendar

```typescript
googleCalendarAccessToken; // El token de acceso de Calendar
googleCalendarTokenExpiresAt; // Timestamp de expiración de Calendar (ms)
```

Cada servicio de Google mantiene su propio token independiente, lo que permite:

- Diferentes tiempos de expiración por servicio
- Renovación independiente de cada token
- Desconexión selectiva de servicios

## Mejoras Futuras Sugeridas

1. **Backend Token Management**: Mover la gestión de tokens al backend usando refresh tokens
2. **Encrypt Tokens**: Encriptar tokens en localStorage para mayor seguridad
3. **Token Pooling**: Implementar un pool de tokens para múltiples usuarios
4. **Offline Mode**: Cachear metadata de archivos para modo offline

## Testing

Para probar que el sistema funciona correctamente:

1. Conecta tu cuenta de Google Drive
2. Sube un archivo
3. Espera 1 hora (o manipula manualmente el timestamp en localStorage para simular expiración)
4. Intenta subir otro archivo
5. Debería funcionar sin mostrar el error 403

### Simular Expiración (Dev)

Abre la consola del navegador:

```javascript
// Ver estado actual
console.log(localStorage.getItem("googleDriveTokenExpiresAt"));

// Simular token expirado (establecer expiración en el pasado)
localStorage.setItem("googleDriveTokenExpiresAt", Date.now() - 1000);

// Ahora intenta subir un archivo - el token se renovará automáticamente
```

## Soporte

Si encuentras problemas:

1. Verifica que las variables de entorno estén configuradas
2. Revisa la consola del navegador para logs con prefijos `[GoogleAuthManager]`, `[GoogleDriveCell]`, `[GoogleDriveItem]`
3. Verifica que tu Google Cloud Project tenga los permisos necesarios para Drive API
