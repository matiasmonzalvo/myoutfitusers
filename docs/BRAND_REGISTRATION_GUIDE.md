# Guía de Registro de Marcas - Outfitters

Esta guía explica cómo dar de alta nuevas marcas en el sistema Outfitters. Solo los administradores pueden registrar marcas.

## Índice

1. [Configuración Inicial](#configuración-inicial)
2. [Proceso de Registro](#proceso-de-registro)
3. [Gestión de Marcas](#gestión-de-marcas)
4. [Solución de Problemas](#solución-de-problemas)

---

## Configuración Inicial

### 1. Ejecutar el Script SQL

Primero, debes ejecutar el script SQL en tu Supabase SQL Editor:

1. Ve a tu proyecto en Supabase Dashboard
2. Navega a **SQL Editor**
3. Abre el archivo `docs/ADMIN_SETUP.sql`
4. Copia y pega el contenido completo
5. Haz clic en **Run** para ejecutar el script

Esto creará:

- Tabla `brands` (información de marcas)
- Tabla `products` (productos de las marcas)
- Índices para optimizar consultas
- Políticas de seguridad (RLS)
- Triggers para actualización automática de timestamps

### 2. Verificar las Tablas

Puedes verificar que las tablas se crearon correctamente:

```sql
SELECT * FROM brands;
SELECT * FROM products;
```

---

## Proceso de Registro

### Método 1: Registro Manual via Supabase Dashboard

#### Paso 1: Crear Usuario en Supabase Auth

1. Ve a **Authentication** → **Users** en Supabase Dashboard
2. Haz clic en **Add user** → **Create new user**
3. Completa:
   - **Email**: email de la marca (ej: `admin@nike.com`)
   - **Password**: contraseña segura
   - **Auto Confirm User**: ✅ (marca esta opción)
4. Haz clic en **Create user**
5. **IMPORTANTE**: Copia el **User UID** que aparece en la lista

#### Paso 2: Registrar la Marca en la Tabla

1. Ve a **Table Editor** → **brands**
2. Haz clic en **Insert** → **Insert row**
3. Completa los campos:

```
id: [pega el User UID del paso anterior]
brand_name: Nike
email: admin@nike.com
password_hash: handled-by-supabase-auth
description: Just Do It - Leading sportswear brand
website_url: https://www.nike.com
logo_url: https://example.com/nike-logo.png (opcional)
contact_person: John Doe (opcional)
phone: +1234567890 (opcional)
is_active: true
```

4. Haz clic en **Save**

#### Paso 3: Verificar el Registro

La marca ya puede iniciar sesión en `/admin` con:

- **Email**: admin@nike.com
- **Password**: [la contraseña que estableciste]

---

### Método 2: Registro via SQL (Recomendado para múltiples marcas)

```sql
-- Paso 1: Crear usuario en Auth (debes hacerlo manualmente en Dashboard)
-- Después de crear el usuario, obtén su UID

-- Paso 2: Insertar la marca
INSERT INTO brands (
  id,
  brand_name,
  email,
  password_hash,
  description,
  website_url,
  logo_url,
  is_active
) VALUES (
  'USER-UID-AQUI', -- Reemplaza con el UID del usuario creado
  'Nike',
  'admin@nike.com',
  'handled-by-supabase-auth',
  'Just Do It - Leading sportswear brand',
  'https://www.nike.com',
  'https://example.com/nike-logo.png',
  true
);
```

---

### Método 3: Script de Registro Automatizado (Avanzado)

Puedes crear un script Node.js para automatizar el proceso:

```javascript
// register-brand.js
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // ¡NUNCA expongas esta key!

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function registerBrand(brandData) {
  try {
    // 1. Crear usuario en Auth
    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email: brandData.email,
        password: brandData.password,
        email_confirm: true,
      });

    if (authError) throw authError;

    // 2. Insertar marca en la tabla
    const { data: brandRecord, error: brandError } = await supabase
      .from("brands")
      .insert([
        {
          id: authData.user.id,
          brand_name: brandData.brand_name,
          email: brandData.email,
          password_hash: "handled-by-supabase-auth",
          description: brandData.description,
          website_url: brandData.website_url,
          logo_url: brandData.logo_url,
          is_active: true,
        },
      ]);

    if (brandError) throw brandError;

    console.log("✅ Marca registrada exitosamente:", brandData.brand_name);
    console.log("User ID:", authData.user.id);
    return authData.user;
  } catch (error) {
    console.error("❌ Error al registrar marca:", error.message);
    throw error;
  }
}

// Uso
registerBrand({
  email: "admin@nike.com",
  password: "SecurePassword123!",
  brand_name: "Nike",
  description: "Just Do It - Leading sportswear brand",
  website_url: "https://www.nike.com",
  logo_url: "https://example.com/nike-logo.png",
});
```

Para ejecutar:

```bash
node register-brand.js
```

---

## Gestión de Marcas

### Listar Todas las Marcas

```sql
SELECT
  id,
  brand_name,
  email,
  is_active,
  created_at
FROM brands
ORDER BY created_at DESC;
```

### Desactivar una Marca

```sql
UPDATE brands
SET is_active = false
WHERE email = 'admin@nike.com';
```

### Reactivar una Marca

```sql
UPDATE brands
SET is_active = true
WHERE email = 'admin@nike.com';
```

### Actualizar Información de una Marca

```sql
UPDATE brands
SET
  brand_name = 'Nike Inc.',
  description = 'Updated description',
  website_url = 'https://www.nike.com',
  logo_url = 'https://new-logo-url.com/logo.png'
WHERE email = 'admin@nike.com';
```

### Eliminar una Marca (⚠️ Cuidado)

```sql
-- Esto eliminará la marca y TODOS sus productos (CASCADE)
DELETE FROM brands WHERE email = 'admin@nike.com';

-- También debes eliminar el usuario de Auth manualmente en Dashboard
```

### Ver Productos de una Marca

```sql
SELECT
  p.*,
  b.brand_name
FROM products p
JOIN brands b ON p.brand_id = b.id
WHERE b.email = 'admin@nike.com'
ORDER BY p.created_at DESC;
```

---

## Solución de Problemas

### Problema: "No tienes permisos para acceder al panel de administración"

**Causa**: El usuario existe en Auth pero no en la tabla `brands`.

**Solución**:

1. Obtén el User UID del usuario en Authentication → Users
2. Inserta un registro en la tabla `brands` con ese UID como `id`

### Problema: "Tu cuenta de marca está desactivada"

**Causa**: El campo `is_active` está en `false`.

**Solución**:

```sql
UPDATE brands SET is_active = true WHERE email = 'admin@nike.com';
```

### Problema: "Credenciales inválidas"

**Causa**: Email o contraseña incorrectos.

**Solución**:

1. Verifica el email en Authentication → Users
2. Si necesitas resetear la contraseña, ve a Authentication → Users → [usuario] → Reset Password

### Problema: La marca puede iniciar sesión pero no puede agregar productos

**Causa**: Problemas con Row Level Security (RLS).

**Solución**:

```sql
-- Verificar políticas
SELECT * FROM pg_policies WHERE tablename = 'products';

-- Si es necesario, recrear las políticas ejecutando el script ADMIN_SETUP.sql
```

---

## Checklist de Registro

Usa este checklist al registrar una nueva marca:

- [ ] Crear usuario en Supabase Auth
- [ ] Marcar "Auto Confirm User"
- [ ] Copiar el User UID
- [ ] Insertar registro en tabla `brands` con el UID
- [ ] Verificar que `is_active = true`
- [ ] Probar login en `/admin`
- [ ] Verificar que puede acceder a `/admin/dashboard`
- [ ] Probar creación de un producto de prueba
- [ ] Verificar que el producto aparece en HomeContent

---

## Información de Contacto

Para soporte técnico o dudas sobre el registro de marcas, contacta al administrador del sistema.

---

## Notas de Seguridad

⚠️ **IMPORTANTE**:

- Nunca compartas el `SUPABASE_SERVICE_ROLE_KEY`
- Usa contraseñas seguras para las marcas
- Mantén actualizado el sistema de autenticación
- Revisa regularmente los logs de acceso
- Desactiva marcas inactivas en lugar de eliminarlas

---

## Próximos Pasos

Después de registrar una marca:

1. La marca puede iniciar sesión en `/admin`
2. Accederá a su dashboard en `/admin/dashboard`
3. Podrá agregar, editar y eliminar productos
4. Los productos aparecerán automáticamente en el HomeContent para usuarios
