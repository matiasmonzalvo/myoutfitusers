-- =====================================================
-- SCRIPT DE VERIFICACIÓN - OUTFIT LIKES SYSTEM
-- =====================================================
-- Ejecuta estas queries para verificar que todo está correcto
-- =====================================================

-- 1. Verificar que la tabla outfit_likes existe
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'outfit_likes'
) as outfit_likes_exists;

-- 2. Verificar que la columna likes_count existe en outfits
SELECT EXISTS (
  SELECT FROM information_schema.columns 
  WHERE table_schema = 'public' 
  AND table_name = 'outfits'
  AND column_name = 'likes_count'
) as likes_count_column_exists;

-- 3. Ver la estructura de outfit_likes
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name = 'outfit_likes'
ORDER BY ordinal_position;

-- 4. Ver las políticas RLS de outfit_likes
SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'outfit_likes';

-- 5. Verificar que existen los triggers
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'outfit_likes';

-- 6. Ver el conteo actual de likes por outfit
SELECT 
  o.id,
  o.name,
  o.likes_count as cached_count,
  COUNT(ol.id) as actual_count
FROM outfits o
LEFT JOIN outfit_likes ol ON ol.outfit_id = o.id
GROUP BY o.id, o.name, o.likes_count
HAVING o.likes_count != COUNT(ol.id)
ORDER BY o.created_at DESC;
-- Si esta query devuelve resultados, significa que hay desincronización

-- 7. Sincronizar contadores (ejecutar solo si la query anterior mostró desincronización)
-- UPDATE outfits
-- SET likes_count = (
--   SELECT COUNT(*) 
--   FROM outfit_likes 
--   WHERE outfit_likes.outfit_id = outfits.id
-- );

-- 8. Ver algunos outfits con sus likes
SELECT 
  o.id,
  o.name,
  o.likes_count,
  u.username as owner
FROM outfits o
JOIN user_profiles u ON u.id = o.user_id
ORDER BY o.created_at DESC
LIMIT 5;

-- 9. Probar dar like manualmente (reemplaza los UUIDs)
-- INSERT INTO outfit_likes (outfit_id, user_id)
-- VALUES ('OUTFIT_ID_AQUI', 'USER_ID_AQUI');

-- 10. Ver si se actualizó el contador
-- SELECT likes_count FROM outfits WHERE id = 'OUTFIT_ID_AQUI';

