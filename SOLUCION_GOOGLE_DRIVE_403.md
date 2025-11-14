# Solución al Error 403 de Google Drive

## Resumen del Problema

Tu aplicación tenía un problema donde después de conectar Google Drive, cuando pasaba un tiempo o se recargaba la página y se intentaba subir un archivo nuevamente, aparecía el siguiente error:

```
403. That's an error.
We're sorry, but you do not have access to this page. That's all we know.
Failed to load resource: the server responded with a status of 403
```

## Causa Raíz

El problema se debía a que:

1. Los tokens de acceso de Google OAuth2 **expiran después de aproximadamente 1 hora**
2. Tu implementación guardaba el token en `localStorage` pero **no verificaba si había expirado**
3. **No existía un mecanismo de renovación automática** del token

Cuando intentabas usar un token expirado, Google API respondía con 403.

## Solución Implementada

Se ha creado un sistema robusto de gestión de tokens de Google que:

### ✅ 1. Gestión Centralizada de Tokens

Se creó `GoogleAuthManager` (`lib/utils/googleAuthManager.ts`), un singleton que centraliza toda la lógica de autenticación:

- **Guarda tokens con timestamp de expiración**: Cada token se guarda junto con su fecha de vencimiento
- **Verifica automáticamente la validez**: Antes de usar un token, verifica si está expirado
- **Renueva automáticamente**: Si el token expiró, solicita uno nuevo de forma transparente
- **Margen de seguridad**: Considera tokens inválidos 5 minutos antes de su expiración real

### ✅ 2. Soporte Multi-Servicio

El sistema soporta múltiples servicios de Google (Drive, Calendar, etc.), cada uno con su propio token:

```typescript
// Para Google Drive
const token = await googleAuthManager.getValidToken(clientId, "drive");

// Para Google Calendar
const token = await googleAuthManager.getValidToken(clientId, "calendar");
```

### ✅ 3. Componentes Actualizados

Se actualizaron los siguientes componentes para usar el nuevo sistema:

#### `GoogleDriveCell` (`app/g/components/GoogleDriveCell.tsx`)

- Eliminado el manejo local de tokens
- Usa `googleAuthManager.getValidToken()` para obtener tokens válidos
- Ya no necesita `useState` ni `useEffect` para tokens

#### `GoogleDriveItem` (`components/blocks/GoogleDriveItem.tsx`)

- Actualizado para usar `googleAuthManager`
- Los previews de archivos ahora usan tokens renovados automáticamente
- Mejor manejo de errores con logs identificables

## ¿Cómo Funciona?

### Primera Vez (Usuario Conecta)

```
Usuario → Click "Connect Google Drive"
  → Google OAuth Popup
  → Token guardado con timestamp de expiración
  → Usuario puede subir archivos
```

### Uso Normal (Token Válido)

```
Usuario → Click "Add Google Drive file"
  → googleAuthManager verifica token
  → Token válido ✓
  → Abre Google Picker
  → Usuario selecciona archivo
```

### Después de 1+ Hora (Token Expirado)

```
Usuario → Click "Add Google Drive file"
  → googleAuthManager verifica token
  → Token expirado ✗
  → Solicita nuevo token automáticamente
  → Nuevo token guardado
  → Abre Google Picker
  → Usuario selecciona archivo (sin ver el error 403!)
```

## Archivos Modificados

### Nuevos Archivos

- ✨ `lib/utils/googleAuthManager.ts` - Sistema de gestión de tokens
- ✨ `docs/GOOGLE_DRIVE_AUTH.md` - Documentación técnica completa

### Archivos Actualizados

- 🔧 `app/g/components/GoogleDriveCell.tsx` - Usa googleAuthManager
- 🔧 `components/blocks/GoogleDriveItem.tsx` - Usa googleAuthManager

## Beneficios

### Para el Usuario

- ✅ **No más errores 403**: El token se renueva automáticamente
- ✅ **Experiencia sin interrupciones**: No necesita reconectar su cuenta
- ✅ **Funciona después de recargas**: Los tokens persisten correctamente

### Para el Desarrollo

- ✅ **Código más limpio**: Lógica centralizada en un solo lugar
- ✅ **Más fácil de mantener**: Un solo punto de gestión de tokens
- ✅ **Escalable**: Fácil agregar más servicios de Google
- ✅ **Mejor debugging**: Logs claros con prefijos identificables

## Storage

### Antes

```
localStorage:
  - googleDriveAccessToken: "ya29.a0..."
```

### Ahora

```
localStorage:
  - googleDriveAccessToken: "ya29.a0..."
  - googleDriveTokenExpiresAt: "1734567890123"  ← NUEVO
  - googleCalendarAccessToken: "ya29.a0..."
  - googleCalendarTokenExpiresAt: "1734567890456"  ← NUEVO
```

## Testing

Para verificar que funciona:

1. **Conecta tu Google Drive** en la app
2. **Sube un archivo** - debe funcionar normalmente
3. **Simula token expirado** (abre DevTools Console):
   ```javascript
   localStorage.setItem("googleDriveTokenExpiresAt", Date.now() - 1000);
   ```
4. **Intenta subir otro archivo** - debería funcionar sin error 403
5. **Verifica en console** que se renovó el token:
   ```
   [GoogleAuthManager] Token expirado, solicitando nuevo token...
   ```

## Migración Automática

El sistema es **100% compatible hacia atrás**:

- Si ya tienes un `googleDriveAccessToken` guardado, funcionará
- La primera vez que uses el nuevo sistema, se agregará el timestamp de expiración
- No necesitas limpiar localStorage ni pedir a usuarios que reconecten

## Próximos Pasos (Opcional)

Para mejorar aún más el sistema en el futuro:

1. **Refresh Tokens en Backend**: Implementar refresh tokens para renovación más robusta
2. **Encriptación**: Encriptar tokens en localStorage
3. **Rate Limiting**: Implementar throttling para solicitudes de token
4. **Telemetría**: Agregar métricas para monitorear renovaciones de token

## Soporte

Si encuentras algún problema:

1. **Revisa la consola del navegador** para ver logs con prefijos:
   - `[GoogleAuthManager]`
   - `[GoogleDriveCell]`
   - `[GoogleDriveItem]`

2. **Verifica las variables de entorno**:

   ```env
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=...
   NEXT_PUBLIC_GOOGLE_API_KEY=...
   ```

3. **Verifica tu Google Cloud Console**:
   - Drive API debe estar habilitada
   - OAuth credentials configurados correctamente

---

## Conclusión

✅ **Problema resuelto**: El error 403 ya no debería aparecer  
✅ **Tokens renovados automáticamente**: Sin intervención del usuario  
✅ **Sistema robusto**: Maneja múltiples servicios de Google  
✅ **Compatible hacia atrás**: No rompe funcionalidad existente  
✅ **Bien documentado**: Documentación completa en `docs/GOOGLE_DRIVE_AUTH.md`

La integración con Supabase permanece intacta. El sistema de tokens solo afecta la comunicación con las APIs de Google, no el almacenamiento de datos en Supabase.
