# 👤 Perfil Público de Usuarios

## 🎯 Objetivo

Crear perfiles públicos de usuarios accesibles en `/user/[username]` donde se muestre:
- Foto de perfil (outfit actual o avatar base)
- Username
- Outfits guardados del usuario
- Productos del outfit actual

## ✅ Archivos Creados

### 1. **Página del Perfil** - `app/user/[username]/page.tsx`
- Ruta pública (fuera de `(main)`)
- Accesible sin autenticación
- Busca usuario por username
- Carga outfit actual desde `avatar_history`
- Carga outfits guardados desde `outfits`

### 2. **Vista del Perfil** - `components/user-profile/user-profile-view.tsx`
- Muestra foto de perfil (outfit actual o avatar base)
- Muestra username y stats
- Muestra productos del outfit actual
- Tabs de navegación (Outfits / Saved)
- Grid de outfits guardados

### 3. **Tarjeta de Outfit** - `components/user-profile/outfit-card.tsx`
- Muestra cada outfit en el grid
- Hover overlay con nombre y cantidad de items
- Menú de opciones (solo para el dueño)
- Click para ver detalle

### 4. **Diálogo de Detalle** - `components/user-profile/outfit-detail-dialog.tsx`
- Modal con imagen grande del outfit
- Lista de productos con links
- Fecha de creación

### 5. **API de Eliminación** - `app/api/outfits/[id]/route.ts`
- DELETE endpoint para eliminar outfits
- Solo el dueño puede eliminar
- Elimina imagen del storage
- Elimina registro de la BD

### 6. **Redirección** - `app/outfits/page.tsx` (Actualizado)
- Ruta `/outfits` ahora redirige a `/user/[username]`
- Mantiene compatibilidad con links existentes

### 7. **Políticas SQL** - `docs/PUBLIC_PROFILES_POLICIES.sql`
- Políticas RLS para lectura pública
- Perfiles visibles para todos
- Outfits visibles para todos
- Avatar history visible para todos

## 🔄 Flujo de Funcionamiento

### Cuando un usuario visita `/user/leomessi`:

1. **La página busca el perfil:**
   ```typescript
   const { data: profile } = await supabase
     .from("user_profiles")
     .select("*")
     .eq("username", "leomessi")
     .single();
   ```

2. **Busca el outfit actual:**
   ```typescript
   const { data: currentOutfit } = await supabase
     .from("avatar_history")
     .select("outfit_image_url, products")
     .eq("user_id", profile.id)
     .eq("is_current", true)
     .single();
   ```

3. **Usa outfit actual o avatar base:**
   ```typescript
   const profileImageUrl = currentOutfit?.outfit_image_url || profile.avatar_url;
   ```

4. **Carga los outfits guardados:**
   ```typescript
   const { data: outfits } = await supabase
     .from("outfits")
     .select("*")
     .eq("user_id", profile.id)
     .order("created_at", { ascending: false });
   ```

5. **Determina si es el dueño:**
   ```typescript
   const isOwnProfile = currentUser?.id === profile.id;
   ```

## 📋 Pasos para Implementar

### 1. Ejecutar SQL para Políticas Públicas

En Supabase SQL Editor, ejecuta:

```sql
-- user_profiles: Lectura pública
DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
CREATE POLICY "Anyone can read public profiles"
ON user_profiles FOR SELECT USING (true);

-- outfits: Lectura pública
DROP POLICY IF EXISTS "Users can read own outfits" ON outfits;
CREATE POLICY "Anyone can read outfits"
ON outfits FOR SELECT USING (true);

-- avatar_history: Lectura pública
DROP POLICY IF EXISTS "Users can view their own avatar history" ON avatar_history;
CREATE POLICY "Anyone can read avatar history"
ON avatar_history FOR SELECT USING (true);
```

### 2. Verificar que las Políticas Funcionan

```sql
SELECT 
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE tablename IN ('user_profiles', 'outfits', 'avatar_history')
ORDER BY tablename;
```

### 3. Probar la Funcionalidad

1. **Ver perfil de otro usuario:**
   - Visita `/user/[cualquier-username]`
   - Deberías ver su perfil completo

2. **Ver tu propio perfil:**
   - Visita `/user/[tu-username]`
   - Deberías ver opciones adicionales (Settings, Delete)

3. **Sin login:**
   - Cierra sesión
   - Visita `/user/[cualquier-username]`
   - Deberías poder ver el perfil sin problemas

## 🎨 Características

### ✅ Foto de Perfil
- Muestra el **outfit actual** si existe (desde `avatar_history`)
- Si no hay outfit, muestra el **avatar base** (desde `user_profiles.avatar_url`)
- Redonda y estilo Instagram

### ✅ Información del Usuario
- Username prominente
- Stats: cantidad de outfits y productos en outfit actual
- Productos del outfit actual como badges clickeables

### ✅ Grid de Outfits
- Estilo cuadrícula responsive (1-3 columnas)
- Hover overlay con nombre y cantidad de items
- Click para ver detalle completo

### ✅ Detalle de Outfit
- Modal con imagen grande
- Lista de productos con thumbnails
- Links a cada producto
- Fecha de creación

### ✅ Opciones para el Dueño
- Botón de Settings (solo si es tu perfil)
- Botón de eliminar en cada outfit (solo tuyos)
- Tab de "Saved" (solo en tu perfil)

## 🔒 Seguridad

### Lectura Pública ✅
- Cualquiera puede ver perfiles
- Cualquiera puede ver outfits guardados
- Cualquiera puede ver el outfit actual

### Escritura Privada ✅
- Solo el dueño puede crear outfits
- Solo el dueño puede actualizar su perfil
- Solo el dueño puede eliminar sus outfits

### RLS Activado ✅
- Todas las tablas tienen RLS habilitado
- Políticas específicas por operación (SELECT, INSERT, UPDATE, DELETE)

## 📱 Responsive

- **Mobile:** Stack vertical, foto de perfil centrada
- **Desktop:** Layout horizontal, foto de perfil a la izquierda
- **Grid:** Adapta de 1 a 3 columnas según el tamaño

## 🔗 Navegación

### Desde la App:
- Click en "My outfits" → Redirige a `/user/[tu-username]`
- Click en username de otro usuario → `/user/[su-username]`

### URLs Directas:
- `/user/leomessi` → Perfil de leomessi
- `/user/cristiano` → Perfil de cristiano
- `/outfits` → Redirige a tu perfil

## 🧪 Testing

1. **Crea un outfit y guárdalo**
2. **Visita tu perfil:** `/user/[tu-username]`
3. **Verifica que se muestra:**
   - Tu outfit actual como foto de perfil
   - Tus outfits guardados en el grid
   - Productos del outfit actual
4. **Cierra sesión**
5. **Visita el mismo perfil**
6. **Verifica que puedes verlo sin login**

## 🎉 ¡Listo!

Los usuarios ahora tienen perfiles públicos donde pueden:
- Mostrar su outfit actual como foto de perfil
- Compartir sus outfits guardados
- Mostrar qué productos están usando

Cualquiera puede visitar `/user/[username]` y ver el perfil completo, incluso sin estar logueado.

