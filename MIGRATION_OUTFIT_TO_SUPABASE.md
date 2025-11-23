# Migración de Outfit Context de localStorage a Supabase

Este documento describe el proceso de migración del sistema de outfit context desde localStorage a Supabase.

## 🎯 Objetivo

Eliminar la dependencia de localStorage para el outfit context y usar Supabase como fuente única de verdad, permitiendo que los usuarios vean el mismo outfit en diferentes dispositivos.

## 📋 Pasos de Migración

### 1. Crear la tabla en Supabase

Ejecuta el siguiente SQL en el SQL Editor de Supabase:

```sql
-- Crear tabla avatar_history
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

-- Índices para mejorar el rendimiento
CREATE INDEX idx_avatar_history_user_id ON avatar_history(user_id);
CREATE INDEX idx_avatar_history_user_current ON avatar_history(user_id, is_current) WHERE is_current = true;
CREATE INDEX idx_avatar_history_user_index ON avatar_history(user_id, outfit_index);

-- Asegurar que solo haya un outfit marcado como current por usuario
CREATE UNIQUE INDEX idx_avatar_history_one_current_per_user 
ON avatar_history(user_id) 
WHERE is_current = true;

-- RLS (Row Level Security)
ALTER TABLE avatar_history ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad
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

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_avatar_history_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at
CREATE TRIGGER avatar_history_updated_at
  BEFORE UPDATE ON avatar_history
  FOR EACH ROW
  EXECUTE FUNCTION update_avatar_history_updated_at();
```

### 2. Verificar que la tabla se creó correctamente

Ejecuta esta query para verificar:

```sql
SELECT * FROM avatar_history LIMIT 1;
```

### 3. Estructura de la tabla

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID | ID único del registro |
| `user_id` | UUID | ID del usuario (FK a auth.users) |
| `outfit_index` | INTEGER | Índice del outfit (0, 1, 2, etc.) |
| `outfit_image_url` | TEXT | URL de la imagen en Supabase Storage |
| `products` | JSONB | Array de productos del outfit |
| `is_current` | BOOLEAN | Si este es el outfit actual del usuario |
| `created_at` | TIMESTAMP | Fecha de creación |
| `updated_at` | TIMESTAMP | Fecha de última actualización |

### 4. Flujo de funcionamiento

#### Al generar un nuevo outfit:

1. La API `/api/generate-outfit` sube la imagen a `current-outfits` bucket
2. Retorna `outfitImageUrl` y `outfitIndex`
3. El contexto llama a `setCurrentOutfitProducts(products, outfitIndex)`
4. Se guarda en la tabla `avatar_history`:
   - Se marca el outfit anterior como `is_current = false`
   - Se inserta/actualiza el nuevo outfit con `is_current = true`

#### Al cargar la app:

1. El contexto consulta `avatar_history` WHERE `user_id = ? AND is_current = true`
2. Si existe, carga:
   - `outfit_image_url` → muestra la imagen
   - `products` → carga los productos del outfit
   - Carga todo el historial para el contador

#### Al hacer rollback:

1. Elimina el outfit actual de `avatar_history`
2. Elimina la imagen del bucket `current-outfits`
3. Marca el outfit anterior como `is_current = true`
4. Si no hay más outfits, vuelve al avatar base

## 🔄 Migración de datos existentes (Opcional)

Si tienes usuarios con datos en localStorage que quieres migrar, puedes usar la función helper:

```typescript
import { migrateOutfitToDatabase } from "@/lib/utils/migrate-outfit-to-database";

// Ejecutar una vez por usuario al iniciar sesión
await migrateOutfitToDatabase(userId);
```

## ✅ Ventajas de la nueva implementación

1. **Sincronización entre dispositivos**: Los usuarios ven el mismo outfit en todos sus dispositivos
2. **Backup automático**: Los datos están respaldados en Supabase
3. **Mejor escalabilidad**: No hay límites de localStorage
4. **Auditabilidad**: Se puede ver el historial completo de outfits
5. **RLS**: Seguridad a nivel de base de datos

## 🧪 Testing

Para probar la migración:

1. Crea un outfit con algunas prendas
2. Cierra sesión
3. Inicia sesión en otro navegador/dispositivo
4. Verifica que el outfit se muestra correctamente

## 📝 Notas importantes

- El campo `products` es JSONB, lo que permite queries eficientes sobre los productos
- Solo puede haber un outfit con `is_current = true` por usuario (garantizado por índice único)
- Las políticas RLS aseguran que los usuarios solo puedan ver/editar sus propios outfits
- El trigger actualiza automáticamente `updated_at` en cada modificación

## 🔧 Troubleshooting

### Error: "duplicate key value violates unique constraint"

Esto significa que ya existe un outfit marcado como current. Ejecuta:

```sql
UPDATE avatar_history 
SET is_current = false 
WHERE user_id = 'USER_ID_AQUI' AND is_current = true;
```

### Error: "permission denied for table avatar_history"

Verifica que las políticas RLS estén creadas correctamente:

```sql
SELECT * FROM pg_policies WHERE tablename = 'avatar_history';
```

## 📚 Archivos modificados

- `lib/contexts/outfit-context.tsx` - Context principal actualizado
- `lib/utils/migrate-outfit-to-database.ts` - Helper de migración
- `MIGRATION_OUTFIT_TO_SUPABASE.md` - Esta documentación

