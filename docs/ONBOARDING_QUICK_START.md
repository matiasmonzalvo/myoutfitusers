# 🚀 Quick Start - Sistema de Onboarding

## ⚡ Setup en 3 Pasos (2 minutos)

### 1️⃣ Ejecutar SQL en Supabase (1 min)

```bash
1. Abre Supabase Dashboard
2. Ve a SQL Editor
3. Copia todo de docs/USER_PROFILES_SETUP.sql
4. Pega y ejecuta (botón "Run")
```

### 2️⃣ Verificar la Tabla (30 seg)

```sql
-- Ejecuta esto en SQL Editor para verificar
SELECT * FROM user_profiles;
```

Deberías ver una tabla vacía con estas columnas:

- id
- username
- age
- gender
- height
- weight
- body_type
- avatar_url
- onboarding_completed
- created_at
- updated_at

### 3️⃣ Probar (30 seg)

```bash
1. Crea un nuevo usuario en /register
2. Deberías ser redirigido automáticamente a /onboarding
3. Completa el formulario
4. Serás redirigido a la página principal
5. ¡Listo! El usuario ya tiene su perfil creado
```

---

## 🎯 ¿Qué hace este sistema?

### Flujo del Usuario

```
NUEVO USUARIO
    ↓
Registro (/register)
    ↓
[AUTOMÁTICO] → Redirige a /onboarding
    ↓
Completa formulario:
  • Username único
  • Edad
  • Género
  • Altura (cm)
  • Peso (kg)
  • Tipo de cuerpo
    ↓
Guarda perfil en DB
    ↓
[AUTOMÁTICO] → Redirige a home (/)
    ↓
Usuario puede usar la app normalmente
```

### Protección Automática

El middleware protege TODAS las rutas:

- ✅ Usuario con perfil completo → Acceso normal
- ❌ Usuario sin perfil → Redirige a /onboarding
- ❌ Usuario no autenticado → Redirige a /login

---

## 📊 Datos del Perfil

| Campo       | Descripción                                      | Ejemplo       |
| ----------- | ------------------------------------------------ | ------------- |
| `username`  | Único, 3-50 chars, lowercase                     | `johndoe_123` |
| `age`       | 13-120 años                                      | `25`          |
| `gender`    | male, female, non-binary, etc.                   | `male`        |
| `height`    | En centímetros                                   | `175.5`       |
| `weight`    | En kilogramos                                    | `70.0`        |
| `body_type` | underweight, slim, average, athletic, overweight | `athletic`    |

---

## 🛠️ Uso en tu Código

### En componentes del Cliente (Client Components)

```typescript
import { useUserProfile } from "@/hooks/use-user-profile";

export function MyComponent() {
  const { user, profile, loading, hasCompletedOnboarding } = useUserProfile();

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Not authenticated</div>;

  return (
    <div>
      <h1>Welcome @{profile?.username}</h1>
      <p>Age: {profile?.age}</p>
      <p>Body Type: {profile?.body_type}</p>
    </div>
  );
}
```

### En páginas del Servidor (Server Components)

```typescript
import { getUserProfile } from "@/lib/utils/get-user-profile";

export default async function MyPage() {
  const { user, profile, hasCompletedOnboarding } = await getUserProfile();

  if (!user) {
    return <div>Please log in</div>;
  }

  return (
    <div>
      <h1>Welcome @{profile?.username}</h1>
      <p>Height: {profile?.height} cm</p>
      <p>Weight: {profile?.weight} kg</p>
    </div>
  );
}
```

---

## 🔧 Archivos Creados

### SQL

- `docs/USER_PROFILES_SETUP.sql` - Script para crear la tabla

### Componentes

- `components/auth/onboarding-form.tsx` - Formulario de onboarding
- `app/onboarding/page.tsx` - Página de onboarding

### Tipos

- `lib/types/user.ts` - Tipos TypeScript

### Utilidades

- `hooks/use-user-profile.ts` - Hook para cliente
- `lib/utils/get-user-profile.ts` - Utilidad para servidor

### Configuración

- `middleware.ts` - Actualizado con verificación de onboarding
- `app/auth/callback/page.tsx` - Actualizado con redirección

### Documentación

- `docs/ONBOARDING_SETUP.md` - Guía completa
- `docs/ONBOARDING_QUICK_START.md` - Esta guía

---

## ✅ Checklist de Instalación

- [ ] Ejecutar `USER_PROFILES_SETUP.sql` en Supabase
- [ ] Verificar que la tabla `user_profiles` existe
- [ ] Probar registro de nuevo usuario
- [ ] Verificar redirección a `/onboarding`
- [ ] Completar formulario de onboarding
- [ ] Verificar redirección al home
- [ ] Confirmar que el perfil está en la DB

---

## 🐛 Troubleshooting

### Usuario no es redirigido a onboarding

**Solución:** Verifica que ejecutaste el SQL correctamente

### Error "permission denied" al guardar perfil

**Solución:** Verifica que RLS está habilitado y las políticas están creadas

### Username ya existe pero muestra disponible

**Solución:** Verifica el índice en la columna username

---

## 🎨 Próximos Pasos

Una vez que el onboarding funcione, podrás:

1. **Integrar generación de avatar con IA**
   - Enviar datos del perfil a API de IA
   - Recibir URL del avatar 3D
   - Guardar en `avatar_url`

2. **Mostrar avatares en la app**
   - Componente de visualización 3D
   - Galería de avatares
   - Preview antes de confirmar

3. **Permitir edición de perfil**
   - Página de settings
   - Actualizar datos
   - Regenerar avatar

---

## 📞 ¿Necesitas Ayuda?

Si algo no funciona:

1. Revisa los logs de Supabase Dashboard
2. Abre la consola del navegador (F12)
3. Verifica los logs del servidor Next.js
4. Consulta `docs/ONBOARDING_SETUP.md` para más detalles
