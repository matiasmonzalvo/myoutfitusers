# ❤️ Sistema de Likes para Outfits

## 🎯 Objetivo

Implementar un sistema de likes estilo Instagram para que los usuarios puedan dar like a los outfits de otros usuarios.

## ✅ Archivos Creados/Modificados

### 1. **SQL Schema** - `docs/OUTFIT_LIKES_SETUP.sql`
- Tabla `outfit_likes` con relación única (user + outfit)
- Columna `likes_count` en tabla `outfits`
- Triggers automáticos para actualizar contadores
- Políticas RLS para lectura pública
- Funciones helper

### 2. **API de Likes** - `app/api/outfits/[id]/like/route.ts`
- `POST` - Dar like a un outfit
- `DELETE` - Quitar like de un outfit
- Optimistic locking
- Validaciones de autenticación

### 3. **Página de Perfil** - `app/user/[username]/page.tsx` (Actualizado)
- Carga los outfits que el usuario ha likeado
- Pasa `likedOutfitIds` y `isAuthenticated` al componente

### 4. **Vista de Perfil** - `components/user-profile/user-profile-view.tsx` (Actualizado)
- Recibe `likedOutfitIds` y `isAuthenticated`
- Pasa props a cada `OutfitCard`

### 5. **Tarjeta de Outfit** - `components/user-profile/outfit-card.tsx` (Actualizado)
- Botón de like con contador
- Animación de corazón relleno cuando está likeado
- Optimistic UI updates
- Redirige a login si no está autenticado

## 🗄️ Estructura de la Base de Datos

### Tabla `outfit_likes`

```sql
CREATE TABLE outfit_likes (
  id UUID PRIMARY KEY,
  outfit_id UUID REFERENCES outfits(id),
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP,
  UNIQUE(outfit_id, user_id)  -- Un usuario = un like por outfit
);
```

### Tabla `outfits` (Actualizada)

```sql
ALTER TABLE outfits 
ADD COLUMN likes_count INTEGER DEFAULT 0 NOT NULL;
```

## 🔄 Flujo de Funcionamiento

### 1. Usuario da like:

```typescript
// Click en botón de like
handleLike() {
  // 1. Optimistic update (UI inmediata)
  setIsLiked(true);
  setLikesCount(likesCount + 1);
  
  // 2. POST a API
  fetch(`/api/outfits/${outfit.id}/like`, { method: 'POST' });
  
  // 3. Backend inserta en outfit_likes
  INSERT INTO outfit_likes (outfit_id, user_id);
  
  // 4. Trigger actualiza likes_count automáticamente
  UPDATE outfits SET likes_count = likes_count + 1;
  
  // 5. Retorna nuevo estado
  return { liked: true, likes_count: X };
}
```

### 2. Usuario quita like:

```typescript
// Click en botón de like (ya likeado)
handleLike() {
  // 1. Optimistic update (UI inmediata)
  setIsLiked(false);
  setLikesCount(likesCount - 1);
  
  // 2. DELETE a API
  fetch(`/api/outfits/${outfit.id}/like`, { method: 'DELETE' });
  
  // 3. Backend elimina de outfit_likes
  DELETE FROM outfit_likes WHERE outfit_id = X AND user_id = Y;
  
  // 4. Trigger actualiza likes_count automáticamente
  UPDATE outfits SET likes_count = likes_count - 1;
  
  // 5. Retorna nuevo estado
  return { liked: false, likes_count: X };
}
```

### 3. Carga de página:

```typescript
// Al cargar /user/[username]
{
  // 1. Cargar outfits del usuario
  const outfits = await getOutfits(userId);
  
  // 2. Si hay usuario loggeado, ver qué ha likeado
  const likes = await getUserLikes(currentUserId, outfitIds);
  
  // 3. Pasar a componente
  <OutfitCard 
    isLiked={likes.includes(outfit.id)}
    likesCount={outfit.likes_count}
  />
}
```

## 📋 Pasos de Implementación

### 1. Ejecutar SQL en Supabase

```sql
-- Copiar y pegar todo el contenido de docs/OUTFIT_LIKES_SETUP.sql
-- en el SQL Editor de Supabase y ejecutar
```

### 2. Verificar la tabla

```sql
SELECT * FROM outfit_likes LIMIT 1;
SELECT likes_count FROM outfits LIMIT 5;
```

### 3. Probar en la app

1. **Sin login:**
   - Ver outfit → Debería mostrar contador de likes
   - Click en like → Debería redirigir a `/login`

2. **Con login:**
   - Ver outfit → Click en like → Corazón se llena y contador sube
   - Click de nuevo → Corazón se vacía y contador baja
   - Recargar página → Estado persiste

3. **Otro usuario:**
   - User A da like al outfit de User B
   - User B ve su perfil → Contador aumentó
   - User C ve perfil de User B → Ve el mismo contador

## 🎨 Diseño del Botón de Like

### Estado NO likeado:
```
┌─────────────┐
│  🤍  123    │  ← Fondo blanco, corazón vacío
└─────────────┘
```

### Estado likeado:
```
┌─────────────┐
│  ❤️  124    │  ← Fondo rojo, corazón relleno
└─────────────┘
```

### Posición:
- Bottom left del outfit card
- Aparece siempre (no solo en hover)
- Botón flotante con sombra
- z-index alto para estar sobre la imagen

## 🔒 Seguridad

### ✅ Políticas RLS

```sql
-- Cualquiera puede ver los likes
CREATE POLICY "Anyone can read outfit likes"
ON outfit_likes FOR SELECT USING (true);

-- Solo usuarios autenticados pueden dar like
CREATE POLICY "Authenticated users can insert likes"
ON outfit_likes FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Solo puedes quitar tus propios likes
CREATE POLICY "Users can delete own likes"
ON outfit_likes FOR DELETE
USING (auth.uid() = user_id);
```

### ✅ Validaciones

- No puedes dar like dos veces (UNIQUE constraint)
- Debes estar autenticado para dar like
- Solo puedes quitar tus propios likes
- El outfit debe existir

### ✅ Integridad de Datos

- Triggers automáticos mantienen `likes_count` sincronizado
- CASCADE DELETE: Si se elimina outfit, se eliminan sus likes
- CASCADE DELETE: Si se elimina usuario, se eliminan sus likes

## 🚀 Optimistic UI

El sistema usa **Optimistic Updates** para mejor UX:

```typescript
// 1. Actualizar UI inmediatamente (no esperar respuesta)
setIsLiked(!isLiked);
setLikesCount(isLiked ? count - 1 : count + 1);

// 2. Hacer request
const response = await fetch(...);

// 3. Si falla, revertir
if (!response.ok) {
  setIsLiked(previousState);
  setLikesCount(previousCount);
}
```

**Ventajas:**
- UI responde instantáneamente
- Mejor experiencia de usuario
- Si falla, se revierte automáticamente

## 📊 Queries Útiles

### Ver likes de un outfit:
```sql
SELECT 
  u.username,
  ol.created_at
FROM outfit_likes ol
JOIN user_profiles u ON u.id = ol.user_id
WHERE ol.outfit_id = 'OUTFIT_ID'
ORDER BY ol.created_at DESC;
```

### Ver outfits más likeados:
```sql
SELECT 
  o.name,
  o.likes_count,
  u.username
FROM outfits o
JOIN user_profiles u ON u.id = o.user_id
ORDER BY o.likes_count DESC
LIMIT 10;
```

### Ver qué ha likeado un usuario:
```sql
SELECT 
  o.name,
  o.image_url,
  u.username as owner
FROM outfit_likes ol
JOIN outfits o ON o.id = ol.outfit_id
JOIN user_profiles u ON u.id = o.user_id
WHERE ol.user_id = 'USER_ID'
ORDER BY ol.created_at DESC;
```

## 🎉 Características

### ✅ Like/Unlike con un click
### ✅ Contador visible siempre
### ✅ Animación de corazón
### ✅ Optimistic updates
### ✅ Redirige a login si no autenticado
### ✅ Triggers automáticos para contadores
### ✅ RLS para seguridad
### ✅ Unique constraint (un usuario = un like)

## 🔮 Mejoras Futuras (Opcionales)

- [ ] Lista de usuarios que dieron like
- [ ] Notificaciones cuando reciben like
- [ ] Feed de outfits más likeados
- [ ] Trending outfits de la semana
- [ ] Doble tap en imagen para dar like (estilo Instagram)
- [ ] Animación del corazón al dar like

---

**¡Sistema de likes completo y funcional!** 🎊

