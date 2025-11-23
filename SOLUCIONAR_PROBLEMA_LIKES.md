# 🔧 Solución: Problema de Likes volviendo a 0

## 🐛 Problemas Identificados y Solucionados

### 1. ✅ Error de TypeScript (SOLUCIONADO)
**Error:** `Type "{ params: { id: string; }; }" is not a valid type`

**Causa:** Next.js 15 requiere que `params` sea un `Promise`

**Solución aplicada:**
```typescript
// ANTES (❌)
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  // usar params.id directamente
}

// DESPUÉS (✅)
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  // usar id
}
```

### 2. ❓ Likes vuelven a 0 al recargar

**Posibles causas:**

#### A) La columna `likes_count` no existe en la tabla
**Verificar:**
```sql
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'outfits' AND column_name = 'likes_count';
```

**Solución si no existe:**
```sql
ALTER TABLE outfits 
ADD COLUMN likes_count INTEGER DEFAULT 0 NOT NULL;
```

#### B) El trigger no está funcionando
**Verificar:**
```sql
SELECT trigger_name 
FROM information_schema.triggers 
WHERE event_object_table = 'outfit_likes';
```

**Solución si no existe:**
```sql
-- Crear la función
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

-- Crear el trigger
CREATE TRIGGER outfit_likes_count_trigger
AFTER INSERT OR DELETE ON outfit_likes
FOR EACH ROW
EXECUTE FUNCTION update_outfit_likes_count();
```

#### C) Los contadores están desincronizados
**Verificar:**
```sql
SELECT 
  o.id,
  o.name,
  o.likes_count as cached_count,
  COUNT(ol.id) as actual_count
FROM outfits o
LEFT JOIN outfit_likes ol ON ol.outfit_id = o.id
GROUP BY o.id, o.name, o.likes_count
HAVING o.likes_count != COUNT(ol.id);
```

**Solución:**
```sql
UPDATE outfits
SET likes_count = (
  SELECT COUNT(*) 
  FROM outfit_likes 
  WHERE outfit_likes.outfit_id = outfits.id
);
```

## 📋 Pasos para Resolver

### Paso 1: Verificar que el SQL se ejecutó correctamente

1. Abre Supabase SQL Editor
2. Ejecuta el archivo `docs/VERIFY_LIKES_SETUP.sql`
3. Revisa los resultados

### Paso 2: Si falta algo, ejecutar el SQL completo

```sql
-- Ejecuta todo el contenido de docs/OUTFIT_LIKES_SETUP.sql
```

### Paso 3: Sincronizar contadores existentes

```sql
UPDATE outfits
SET likes_count = (
  SELECT COUNT(*) 
  FROM outfit_likes 
  WHERE outfit_likes.outfit_id = outfits.id
);
```

### Paso 4: Probar manualmente

```sql
-- 1. Ver un outfit
SELECT id, name, likes_count FROM outfits LIMIT 1;

-- 2. Dar like (reemplaza los IDs)
INSERT INTO outfit_likes (outfit_id, user_id)
VALUES ('OUTFIT_ID', 'USER_ID');

-- 3. Verificar que el contador aumentó
SELECT id, name, likes_count FROM outfits WHERE id = 'OUTFIT_ID';
-- Debería haber aumentado en 1

-- 4. Quitar like
DELETE FROM outfit_likes 
WHERE outfit_id = 'OUTFIT_ID' AND user_id = 'USER_ID';

-- 5. Verificar que el contador disminuyó
SELECT id, name, likes_count FROM outfits WHERE id = 'OUTFIT_ID';
-- Debería haber disminuido en 1
```

### Paso 5: Probar en la aplicación

1. Abre la app en el navegador
2. Ve a un perfil: `/user/[username]`
3. Da like a un outfit
4. Verifica que el número sube
5. Recarga la página (F5)
6. **El número debe mantenerse** ✅

## 🔍 Debugging

### Ver todos los likes en la base de datos:
```sql
SELECT 
  o.name as outfit_name,
  u.username as liked_by,
  ol.created_at
FROM outfit_likes ol
JOIN outfits o ON o.id = ol.outfit_id
JOIN user_profiles u ON u.id = ol.user_id
ORDER BY ol.created_at DESC;
```

### Ver un outfit específico:
```sql
SELECT 
  o.id,
  o.name,
  o.likes_count,
  COUNT(ol.id) as actual_likes
FROM outfits o
LEFT JOIN outfit_likes ol ON ol.outfit_id = o.id
WHERE o.id = 'OUTFIT_ID_AQUI'
GROUP BY o.id, o.name, o.likes_count;
```

### Verificar RLS:
```sql
-- Ver políticas
SELECT * FROM pg_policies WHERE tablename = 'outfit_likes';

-- Probar sin autenticación (debería funcionar para SELECT)
SET request.jwt.claim.sub = NULL;
SELECT * FROM outfit_likes LIMIT 1;
```

## ✅ Checklist de Verificación

- [ ] Tabla `outfit_likes` existe
- [ ] Columna `likes_count` existe en tabla `outfits`
- [ ] Trigger `outfit_likes_count_trigger` existe
- [ ] Función `update_outfit_likes_count()` existe
- [ ] Políticas RLS están activas
- [ ] Los contadores están sincronizados
- [ ] Dar like aumenta el contador
- [ ] Quitar like disminuye el contador
- [ ] El contador persiste al recargar la página

## 🎯 Si Sigue Sin Funcionar

1. **Revisa los logs de Supabase:**
   - Dashboard → Logs
   - Busca errores relacionados con `outfit_likes`

2. **Verifica permisos:**
   ```sql
   SELECT * FROM pg_policies WHERE tablename IN ('outfits', 'outfit_likes');
   ```

3. **Prueba la API directamente:**
   ```bash
   # Dar like
   curl -X POST http://localhost:3000/api/outfits/OUTFIT_ID/like \
     -H "Cookie: tu-cookie-de-sesion"
   
   # Ver resultado
   curl http://localhost:3000/api/outfits/OUTFIT_ID
   ```

4. **Revisa la consola del navegador:**
   - F12 → Console
   - Network → Busca las peticiones a `/api/outfits/[id]/like`
   - Verifica las respuestas

## 📞 Contacto

Si el problema persiste después de seguir todos estos pasos, comparte:
- Screenshot de los resultados de `VERIFY_LIKES_SETUP.sql`
- Logs de Supabase
- Errores de la consola del navegador

