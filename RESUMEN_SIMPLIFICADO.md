# ✅ Migración de Outfit a Supabase - SIMPLIFICADO

## 🎯 Objetivo
Guardar los outfits en Supabase en lugar de localStorage para sincronización entre dispositivos.

## 📍 Dos Momentos Clave

### 1️⃣ GUARDAR: Cuando se genera el outfit (botón "Wear it")

**Archivo:** `app/api/generate-outfit/route.ts`

**Qué hace:**
```typescript
// Después de subir la imagen al storage...

// 1. Obtener productos del outfit anterior (si existe)
const { data: currentHistory } = await supabase
  .from("avatar_history")
  .select("products")
  .eq("user_id", user.id)
  .eq("is_current", true)
  .single();

const previousProducts = currentHistory?.products as any[] || [];
const allProducts = [...previousProducts, ...products]; // Combinar con nuevos

// 2. Marcar todos los outfits anteriores como no actuales
await supabase
  .from("avatar_history")
  .update({ is_current: false })
  .eq("user_id", user.id);

// 3. Guardar el nuevo outfit como actual
await supabase
  .from("avatar_history")
  .insert({
    user_id: user.id,
    outfit_index: outfitIndex,
    outfit_image_url: outfitImageUrl,
    products: allProducts,
    is_current: true,
  });
```

### 2️⃣ CARGAR: Cuando se muestra el AvatarHub

**Archivo:** `lib/contexts/outfit-context.tsx`

**Qué hace:**
```typescript
const loadOutfitFromDatabase = async (currentUserId: string) => {
  // Obtener el outfit actual (is_current = true)
  const { data: currentOutfit } = await supabase
    .from("avatar_history")
    .select("*")
    .eq("user_id", currentUserId)
    .eq("is_current", true)
    .single();

  if (currentOutfit) {
    // Cargar imagen y productos
    setOutfitImageUrlState(currentOutfit.outfit_image_url);
    setCurrentOutfitProducts(currentOutfit.products as Product[]);
    
    // Contar el historial
    const { count } = await supabase
      .from("avatar_history")
      .select("*", { count: "exact", head: true })
      .eq("user_id", currentUserId);

    setOutfitHistoryCount(count || 0);
  }
};
```

**Y después de generar, refrescamos:**
```typescript
// En AvatarHub.tsx y MobileShoppingCart.tsx
await refreshOutfitFromDatabase(); // ← Esto llama a loadOutfitFromDatabase()
```

## 🗄️ Estructura de la tabla `avatar_history`

```sql
CREATE TABLE avatar_history (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  outfit_index INTEGER,           -- 0, 1, 2, etc.
  outfit_image_url TEXT,          -- URL del storage
  products JSONB,                 -- Array de productos
  is_current BOOLEAN,             -- Solo UNO puede ser true por usuario
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

## 🔄 Flujo Completo

```
Usuario selecciona productos → Click "Wear it"
    ↓
POST /api/generate-outfit
    ↓
1. Gemini genera la imagen
2. Sube imagen al storage (current-outfits/outfit-0, outfit-1, etc.)
3. GUARDA en avatar_history:
   - user_id
   - outfit_index
   - outfit_image_url
   - products (combina anteriores + nuevos)
   - is_current = true
    ↓
Retorna a AvatarHub
    ↓
refreshOutfitFromDatabase()
    ↓
CARGA desde avatar_history:
   - outfit_image_url → Muestra la imagen
   - products → Muestra los productos en el dropdown
```

## 📝 SQL para crear la tabla

```sql
CREATE TABLE IF NOT EXISTS avatar_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  outfit_index INTEGER NOT NULL,
  outfit_image_url TEXT NOT NULL,
  products JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_current BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX idx_avatar_history_user_id ON avatar_history(user_id);
CREATE INDEX idx_avatar_history_user_current ON avatar_history(user_id, is_current) WHERE is_current = true;
CREATE UNIQUE INDEX idx_avatar_history_one_current_per_user ON avatar_history(user_id) WHERE is_current = true;

ALTER TABLE avatar_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own avatar history"
  ON avatar_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own avatar history"
  ON avatar_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own avatar history"
  ON avatar_history FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own avatar history"
  ON avatar_history FOR DELETE
  USING (auth.uid() = user_id);
```

## ✅ Archivos Modificados

1. `app/api/generate-outfit/route.ts` - Guarda en BD después de generar
2. `lib/contexts/outfit-context.tsx` - Carga desde BD al iniciar
3. `components/AvatarHub.tsx` - Refresca después de generar
4. `components/MobileShoppingCart.tsx` - Refresca después de generar

## 🧪 Testing

1. Ejecuta el SQL en Supabase
2. Genera un outfit
3. Verifica en Table Editor que se guardó en `avatar_history`
4. Recarga la página → Debería mostrar el mismo outfit
5. Abre en otro navegador → Debería mostrar el mismo outfit

## 🎉 ¡Listo!

Ahora los outfits se sincronizan entre dispositivos porque todo está en Supabase.

