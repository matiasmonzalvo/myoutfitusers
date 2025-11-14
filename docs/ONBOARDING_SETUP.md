# Sistema de Onboarding - Tablium

## 📋 Resumen

Este sistema gestiona el proceso de onboarding de nuevos usuarios, recolectando información necesaria para crear avatares personalizados con IA.

## 🚀 Instalación

### 1. Ejecutar SQL en Supabase

1. Ve a tu proyecto en **Supabase Dashboard**
2. Navega a **SQL Editor**
3. Abre el archivo `docs/USER_PROFILES_SETUP.sql`
4. Copia y pega el contenido completo
5. Haz clic en **Run** para ejecutar el script

Este script creará:

- Tabla `user_profiles` con todos los campos necesarios
- Índices para optimizar consultas
- Políticas de seguridad (RLS)
- Triggers para actualización automática de timestamps
- Función para verificar disponibilidad de usernames

### 2. Verificar la Tabla

Puedes verificar que la tabla se creó correctamente:

```sql
SELECT * FROM user_profiles;
```

## 🔄 Flujo de Onboarding

### Flujo Completo

```
1. Usuario se registra/inicia sesión
   ↓
2. Sistema verifica si tiene perfil completado
   ↓
3. Si NO tiene perfil → Redirige a /onboarding
   ↓
4. Usuario completa el formulario:
   - Username (único)
   - Age
   - Gender
   - Height (cm)
   - Weight (kg)
   - Body Type
   ↓
5. Sistema guarda el perfil en user_profiles
   ↓
6. Usuario es redirigido a la página principal
```

### Rutas Afectadas

- **`/onboarding`**: Página donde se completa el onboarding
- **`/login`**: Redirige a `/onboarding` si el usuario no tiene perfil
- **`/register`**: Redirige a `/onboarding` después del registro exitoso
- **`/auth/callback`**: Verifica el perfil después de OAuth (Google)
- **Todas las rutas**: El middleware verifica el onboarding antes de permitir acceso

### Excepciones

Estas rutas NO verifican el onboarding:

- `/admin/*` - Panel de administración de marcas
- `/auth/callback` - Callback de autenticación
- `/login` y `/register` - Páginas de autenticación
- `/onboarding` - La página misma

## 📊 Estructura de Datos

### Tabla: `user_profiles`

| Campo                  | Tipo         | Descripción                      | Validación                                                   |
| ---------------------- | ------------ | -------------------------------- | ------------------------------------------------------------ |
| `id`                   | UUID         | ID del usuario (FK a auth.users) | PRIMARY KEY                                                  |
| `username`             | VARCHAR(50)  | Nombre de usuario único          | UNIQUE, lowercase, alphanumeric + underscore                 |
| `age`                  | INTEGER      | Edad del usuario                 | 13-120                                                       |
| `gender`               | VARCHAR(20)  | Género                           | 'male', 'female', 'non-binary', 'prefer-not-to-say', 'other' |
| `height`               | DECIMAL(5,2) | Altura en centímetros            | > 0                                                          |
| `weight`               | DECIMAL(5,2) | Peso en kilogramos               | > 0                                                          |
| `body_type`            | VARCHAR(20)  | Tipo de cuerpo                   | 'underweight', 'slim', 'average', 'athletic', 'overweight'   |
| `avatar_url`           | TEXT         | URL del avatar generado          | NULL por defecto                                             |
| `onboarding_completed` | BOOLEAN      | Si completó el onboarding        | true por defecto                                             |
| `created_at`           | TIMESTAMP    | Fecha de creación                | Auto                                                         |
| `updated_at`           | TIMESTAMP    | Última actualización             | Auto                                                         |

## 🔒 Seguridad (RLS)

Las políticas de Row Level Security garantizan que:

- Los usuarios solo pueden ver su propio perfil
- Los usuarios solo pueden crear/editar su propio perfil
- Los usuarios solo pueden eliminar su propio perfil

## 🎨 Componentes

### `OnboardingForm` (`components/auth/onboarding-form.tsx`)

Formulario interactivo que:

- Valida el username en tiempo real
- Verifica disponibilidad del username
- Valida todos los campos antes de enviar
- Muestra mensajes de error claros
- Previene envíos duplicados

### Características del Username

- Mínimo 3 caracteres
- Máximo 50 caracteres
- Solo letras minúsculas, números y guiones bajos
- Verificación de disponibilidad en tiempo real
- Indicador visual de disponibilidad (✓ o ✕)

## 🔧 Middleware

El middleware (`middleware.ts`) se encarga de:

1. Verificar si el usuario está autenticado
2. Comprobar si ha completado el onboarding
3. Redirigir a `/onboarding` si es necesario
4. Permitir excepciones para rutas específicas

## 📝 Uso en el Código

### Verificar si un usuario ha completado el onboarding

```typescript
import { createServerClient } from "@/lib/supabase/server";

const supabase = await createServerClient();
const {
  data: { user },
} = await supabase.auth.getUser();

if (user) {
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profile && profile.onboarding_completed) {
    // Usuario ha completado el onboarding
  }
}
```

### Obtener el perfil de un usuario

```typescript
const { data: profile, error } = await supabase
  .from("user_profiles")
  .select("*")
  .eq("id", user.id)
  .single();

console.log(profile.username);
console.log(profile.body_type);
```

## 🚧 Próximos Pasos

Una vez completado el onboarding, los siguientes pasos incluirán:

1. **Generación de Avatar con IA**
   - Enviar los datos del perfil a un servicio de IA
   - Generar el avatar 3D personalizado
   - Guardar la URL del avatar en `avatar_url`

2. **Visualización del Avatar**
   - Mostrar el avatar en el perfil del usuario
   - Permitir la visualización 3D del avatar
   - Integrar con el sistema de prueba de ropa virtual

3. **Edición del Perfil**
   - Permitir que los usuarios actualicen su información
   - Regenerar el avatar si cambian datos físicos

## 🐛 Solución de Problemas

### El usuario no es redirigido al onboarding

1. Verifica que ejecutaste el SQL correctamente
2. Revisa que las políticas RLS estén habilitadas
3. Comprueba los logs del navegador para errores

### Error al crear el perfil

1. Verifica que el username no esté en uso
2. Comprueba que todos los campos cumplan las validaciones
3. Revisa los permisos RLS en Supabase

### El middleware causa loops infinitos

1. Asegúrate de que `/onboarding` esté excluido de la verificación
2. Verifica que `onboarding_completed` sea `true` después de completar el formulario

## 📞 Soporte

Si encuentras problemas con el sistema de onboarding, revisa:

1. Los logs de Supabase en el Dashboard
2. La consola del navegador
3. Los logs del servidor Next.js
