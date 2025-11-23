# 🔧 Solución: Likes no persisten al recargar

## 🐛 Problema

Los likes cambian cuando haces click, pero al recargar la página vuelven a 0.

## ✅ Solución

La columna `likes_count` no se creó correctamente o no tiene los valores actualizados.

## 📋 Pasos para Solucionar

### 1. Ejecutar el Script de Corrección

Ve a **Supabase → SQL Editor** y ejecuta:

```sql
-- Copiar y pegar todo el contenido de docs/FIX_LIKES_COUNT.sql
```

O ejecuta esto directamente:

```sql
-- 1. Asegurar que la columna existe
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'outfits' 
    AND column_name = 'likes_count'
  ) THEN
    ALTER TABLE outfits ADD COLUMN likes_count INTEGER DEFAULT 0 NOT NULL;
  END IF;
END $$;

-- 2. Recalcular TODOS los contadores
UPDATE outfits
SET likes_count = (
  SELECT COALESCE(COUNT(*), 0)
  FROM outfit_likes
  WHERE outfit_likes.outfit_id = outfits.id
);

-- 3. Recrear el trigger
DROP TRIGGER IF EXISTS outfit_likes_count_trigger ON outfit_likes;

CREATE TRIGGER outfit_likes_count_trigger
AFTER INSERT OR DELETE ON outfit_likes
FOR EACH ROW
EXECUTE FUNCTION update_outfit_likes_count();

-- 4. Recrear la función
CREATE OR REPLACE FUNCTION update_outfit_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE outfits
    SET likes_count = likes_count + 1
    WHERE id = NEW.outfit_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE outfits
    SET likes_count = GREATEST(likes_count - 1, 0)
    WHERE id = OLD.outfit_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;
```

### 2. Verificar que Funciona

Ejecuta esta query para verificar:

```sql
SELECT 
  o.id,
  o.name,
  o.likes_count as cached_count,
  (SELECT COUNT(*) FROM outfit_likes WHERE outfit_id = o.id) as actual_count
FROM outfits o
ORDER BY o.created_at DESC
LIMIT 10;
```

Deberías ver que `cached_count` = `actual_count`

### 3. Probar en la App

1. Recarga la página de perfil
2. Los likes deberían aparecer correctamente
3. Da like/unlike
4. Recarga la página
5. Los likes deberían persistir ✅

## 🔍 Cómo Funciona

### Flujo Correcto:

```
Usuario da LIKE
    ↓
1. POST /api/outfits/[id]/like
    ↓
2. INSERT INTO outfit_likes (outfit_id, user_id)
    ↓
3. TRIGGER se ejecuta automáticamente
    ↓
4. UPDATE outfits SET likes_count = likes_count + 1
    ↓
5. API retorna nuevo likes_count
    ↓
6. Frontend actualiza el contador
```

### Al recargar página:

```
GET /user/[username]
    ↓
SELECT * FROM outfits WHERE user_id = X
    ↓
Trae likes_count de cada outfit
    ↓
Muestra el contador correcto ✅
```

## 🎯 Por qué Funcionará Ahora

1. **Columna existe:** `likes_count` está en la tabla `outfits`
2. **Valores correctos:** Script recalcula todos los contadores
3. **Trigger funciona:** Se actualiza automáticamente al dar like/unlike
4. **Frontend lee correcto:** Trae `likes_count` directamente de la BD

## 🧪 Testing

```sql
-- 1. Ver un outfit
SELECT id, name, likes_count FROM outfits LIMIT 1;

-- 2. Dar like manualmente
INSERT INTO outfit_likes (outfit_id, user_id) 
VALUES ('OUTFIT_ID', 'USER_ID');

-- 3. Verificar que el contador subió
SELECT id, name, likes_count FROM outfits WHERE id = 'OUTFIT_ID';
-- Debería haber aumentado en 1

-- 4. Quitar like manualmente
DELETE FROM outfit_likes 
WHERE outfit_id = 'OUTFIT_ID' AND user_id = 'USER_ID';

-- 5. Verificar que el contador bajó
SELECT id, name, likes_count FROM outfits WHERE id = 'OUTFIT_ID';
-- Debería haber disminuido en 1
```

## ✅ Checklist

- [ ] Ejecutar `FIX_LIKES_COUNT.sql`
- [ ] Verificar que la columna existe
- [ ] Verificar que los contadores están correctos
- [ ] Probar dar like en la app
- [ ] Recargar página
- [ ] Verificar que el like persiste

## 🎉 ¡Listo!

Después de ejecutar el script, los likes deberían funcionar perfectamente y persistir al recargar la página.

Si aún tienes problemas, verifica:
1. Que el trigger existe: `SELECT * FROM pg_trigger WHERE tgname = 'outfit_likes_count_trigger';`
2. Que la función existe: `SELECT * FROM pg_proc WHERE proname = 'update_outfit_likes_count';`
3. Que la columna existe: `SELECT column_name FROM information_schema.columns WHERE table_name = 'outfits' AND column_name = 'likes_count';`

