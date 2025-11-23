# 🚀 Pasos para Implementar la Migración

## Paso 1: Ejecutar SQL en Supabase

1. Abre tu proyecto en Supabase
2. Ve a **SQL Editor** (en el menú lateral)
3. Copia y pega este SQL:

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
CREATE INDEX idx_avatar_history_user_index ON avatar_history(user_id, outfit_index);
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

CREATE OR REPLACE FUNCTION update_avatar_history_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER avatar_history_updated_at
  BEFORE UPDATE ON avatar_history
  FOR EACH ROW
  EXECUTE FUNCTION update_avatar_history_updated_at();
```

4. Click **Run** (o presiona Ctrl + Enter)
5. Verifica que dice "Success. No rows returned"

## Paso 2: Verificar que la tabla se creó

Ejecuta esta query:

```sql
SELECT * FROM avatar_history LIMIT 1;
```

Deberías ver las columnas aunque no haya datos todavía.

## Paso 3: Deploy del código

Los archivos ya están modificados. Solo necesitas hacer commit y push:

```bash
git add .
git commit -m "feat: migrate outfit storage from localStorage to Supabase"
git push
```

## Paso 4: Probar en desarrollo

1. **Genera un outfit:**
   - Login en la app
   - Selecciona 1-2 productos
   - Click "Wear it"
   - Espera a que se genere

2. **Verifica en Supabase:**
   - Ve a Table Editor → avatar_history
   - Deberías ver un registro con:
     - `user_id`: Tu ID de usuario
     - `outfit_index`: 0
     - `outfit_image_url`: URL del storage
     - `products`: Array de productos
     - `is_current`: true

3. **Verifica sincronización:**
   - Recarga la página → Debería mostrar el outfit
   - Abre en modo incógnito o en otro navegador
   - Login con la misma cuenta
   - Debería mostrar el mismo outfit

4. **Prueba rollback:**
   - Genera otro outfit (outfit-1)
   - Click en "Rollback"
   - Debería volver al outfit-0
   - En la tabla `avatar_history` deberías ver que outfit-1 fue eliminado

## Paso 5: Queries útiles para debugging

### Ver todos los outfits de un usuario:

```sql
SELECT
  outfit_index,
  is_current,
  jsonb_array_length(products) as num_products,
  created_at
FROM avatar_history
WHERE user_id = 'PONER_USER_ID_AQUI'
ORDER BY outfit_index;
```

### Ver el outfit actual:

```sql
SELECT * FROM avatar_history
WHERE user_id = 'PONER_USER_ID_AQUI'
  AND is_current = true;
```

### Limpiar todos los outfits de un usuario (para testing):

```sql
DELETE FROM avatar_history
WHERE user_id = 'PONER_USER_ID_AQUI';
```

## ⚠️ Notas Importantes

- **localStorage:** Ya no se usa para guardar outfits. Los usuarios que tenían datos ahí simplemente empezarán de nuevo.
- **Sincronización:** Los cambios se ven inmediatamente en todos los dispositivos al recargar.
- **is_current:** Solo puede haber UN outfit marcado como actual por usuario (garantizado por índice único).
- **Rollback:** Elimina tanto de la tabla como del storage.

## 🎉 ¡Listo!

Si todo funciona correctamente, tus usuarios podrán:

- Ver sus outfits en cualquier dispositivo
- Los outfits persisten después de cerrar sesión
- El historial se mantiene en la base de datos

## 🐛 Troubleshooting

### Error: "duplicate key value violates unique constraint"

```sql
-- Ejecuta esto para limpiar estados duplicados
UPDATE avatar_history
SET is_current = false
WHERE user_id = 'USER_ID_AQUI';
```

### El outfit no se muestra después de generar

1. Abre la consola del navegador (F12)
2. Busca errores
3. Verifica que la tabla `avatar_history` tenga el registro
4. Verifica que el `outfit_image_url` sea accesible

### Las políticas RLS no funcionan

```sql
-- Verifica que las políticas estén activas
SELECT * FROM pg_policies WHERE tablename = 'avatar_history';
```

## 📞 Contacto

Si tienes problemas, revisa:

1. Los logs de Supabase (Dashboard → Logs)
2. La consola del navegador
3. El archivo `RESUMEN_SIMPLIFICADO.md` para entender el flujo
