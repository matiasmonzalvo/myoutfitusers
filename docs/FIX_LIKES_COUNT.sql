-- =====================================================
-- FIX LIKES COUNT - MIGRATION SCRIPT
-- =====================================================
-- Este script corrige problemas con el contador de likes
-- Ejecuta esto si los likes no se muestran correctamente
-- =====================================================

-- =====================================================
-- 1. VERIFICAR SI LA COLUMNA EXISTE
-- =====================================================
-- Si la columna no existe, créala
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'outfits' 
    AND column_name = 'likes_count'
  ) THEN
    ALTER TABLE outfits ADD COLUMN likes_count INTEGER DEFAULT 0 NOT NULL;
    RAISE NOTICE 'Column likes_count created';
  ELSE
    RAISE NOTICE 'Column likes_count already exists';
  END IF;
END $$;

-- =====================================================
-- 2. RECALCULAR TODOS LOS CONTADORES
-- =====================================================
-- Actualizar likes_count para TODOS los outfits basándose en outfit_likes
UPDATE outfits
SET likes_count = (
  SELECT COALESCE(COUNT(*), 0)
  FROM outfit_likes
  WHERE outfit_likes.outfit_id = outfits.id
);

-- =====================================================
-- 3. VERIFICAR TRIGGER EXISTE
-- =====================================================
-- Recrear el trigger por si no existe
DROP TRIGGER IF EXISTS outfit_likes_count_trigger ON outfit_likes;

CREATE TRIGGER outfit_likes_count_trigger
AFTER INSERT OR DELETE ON outfit_likes
FOR EACH ROW
EXECUTE FUNCTION update_outfit_likes_count();

-- =====================================================
-- 4. VERIFICAR FUNCIÓN EXISTE
-- =====================================================
-- Recrear la función
CREATE OR REPLACE FUNCTION update_outfit_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Incrementar el contador
    UPDATE outfits
    SET likes_count = likes_count + 1
    WHERE id = NEW.outfit_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Decrementar el contador
    UPDATE outfits
    SET likes_count = GREATEST(likes_count - 1, 0)
    WHERE id = OLD.outfit_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 5. VERIFICAR RESULTADOS
-- =====================================================
-- Ejecuta esto para ver los contadores
SELECT 
  o.id,
  o.name,
  o.likes_count as cached_count,
  (SELECT COUNT(*) FROM outfit_likes WHERE outfit_id = o.id) as actual_count,
  CASE 
    WHEN o.likes_count = (SELECT COUNT(*) FROM outfit_likes WHERE outfit_id = o.id) 
    THEN '✅ OK' 
    ELSE '❌ MISMATCH' 
  END as status
FROM outfits o
ORDER BY o.created_at DESC
LIMIT 10;

-- =====================================================
-- 6. CREAR ÍNDICE SI NO EXISTE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_outfits_likes_count ON outfits(likes_count DESC);

-- =====================================================
-- MENSAJE FINAL
-- =====================================================
DO $$ 
BEGIN
  RAISE NOTICE '✅ Migration complete! Run the verification query above to check results.';
END $$;

