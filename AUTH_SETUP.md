# Configuración de Autenticación con Google

## Pasos para configurar la autenticación con Google en Supabase

### 1. Configurar Google OAuth en Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la API de Google+
4. Ve a "Credentials" y crea un nuevo "OAuth 2.0 Client ID"
5. Configura los URIs autorizados:
   - **Authorized JavaScript origins**: `http://localhost:3000` (desarrollo)
   - **Authorized redirect URIs**: `http://localhost:3000/auth/callback` (desarrollo)
   - Para producción, agrega tu dominio real

### 2. Configurar Supabase

1. Ve a tu dashboard de Supabase
2. Navega a **Authentication** > **Providers**
3. Habilita **Google**
4. Agrega tu **Client ID** y **Client Secret** de Google
5. Configura la **Redirect URL** en Supabase: `http://localhost:3000/auth/callback`

### 3. Variables de Entorno

Asegúrate de tener estas variables en tu archivo `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase
```

### 4. Funcionalidades Implementadas

✅ **Formulario de Registro con Google**

- Botón "Continue with Google" funcional
- Estados de carga apropiados
- Manejo de errores

✅ **Formulario de Login con Google**

- Botón "Continue with Google" funcional
- Estados de carga apropiados
- Manejo de errores

✅ **Página de Callback**

- Manejo automático de la redirección después de la autenticación
- Redirección al dashboard tras autenticación exitosa
- Manejo de errores de autenticación

✅ **Middleware de Autenticación**

- Protección de rutas
- Redirecciones automáticas
- Manejo de sesiones

### 5. Flujo de Autenticación

1. Usuario hace clic en "Continue with Google"
2. Se redirige a Google para autenticación
3. Google redirige de vuelta a `/auth/callback`
4. La página de callback verifica la sesión
5. Usuario es redirigido al dashboard

### 6. Notas Importantes

- La autenticación con Google funciona tanto para registro como para login
- Los usuarios se crean automáticamente en Supabase al autenticarse con Google
- El middleware protege las rutas del dashboard
- Los errores se manejan de forma elegante con mensajes en español

### 7. Pruebas

Para probar la funcionalidad:

1. Ejecuta `npm run dev`
2. Ve a `http://localhost:3000/register`
3. Haz clic en "Continue with Google"
4. Completa la autenticación con Google
5. Deberías ser redirigido al dashboard

¡La autenticación con Google está completamente funcional!
