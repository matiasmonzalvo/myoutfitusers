-- =====================================================
-- OUTFIT LIKES SYSTEM - SQL SCHEMA
-- =====================================================
-- Este script crea el sistema de likes para outfits
-- Run this in your Supabase SQL Editor
-- =====================================================

-- =====================================================
-- 1. OUTFIT LIKES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS outfit_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  outfit_id UUID NOT NULL REFERENCES outfits(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  
  -- Un usuario solo puede dar like una vez a un outfit
  UNIQUE(outfit_id, user_id)
);

-- =====================================================
-- 2. INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_outfit_likes_outfit_id ON outfit_likes(outfit_id);
CREATE INDEX IF NOT EXISTS idx_outfit_likes_user_id ON outfit_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_outfit_likes_created_at ON outfit_likes(created_at DESC);

-- =====================================================
-- 3. ADD LIKES COUNT TO OUTFITS TABLE
-- =====================================================
-- Agregar columna para cachear el conteo de likes
ALTER TABLE outfits 
ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0 NOT NULL;

-- Índice para ordenar por likes
CREATE INDEX IF NOT EXISTS idx_outfits_likes_count ON outfits(likes_count DESC);

-- =====================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on outfit_likes table
ALTER TABLE outfit_likes ENABLE ROW LEVEL SECURITY;

-- Policy: Todos pueden ver los likes
CREATE POLICY "Anyone can read outfit likes"
ON outfit_likes
FOR SELECT
USING (true);

-- Policy: Usuarios autenticados pueden dar like
CREATE POLICY "Authenticated users can insert likes"
ON outfit_likes
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Usuarios pueden eliminar sus propios likes
CREATE POLICY "Users can delete own likes"
ON outfit_likes
FOR DELETE
USING (auth.uid() = user_id);

-- =====================================================
-- 5. FUNCTIONS
-- =====================================================

-- Función para actualizar el contador de likes
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
-- 6. TRIGGERS
-- =====================================================

-- Trigger para actualizar likes_count automáticamente
CREATE TRIGGER outfit_likes_count_trigger
AFTER INSERT OR DELETE ON outfit_likes
FOR EACH ROW
EXECUTE FUNCTION update_outfit_likes_count();

-- =====================================================
-- 7. HELPER FUNCTIONS
-- =====================================================

-- Función para verificar si un usuario dio like a un outfit
CREATE OR REPLACE FUNCTION user_liked_outfit(p_outfit_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM outfit_likes 
    WHERE outfit_id = p_outfit_id AND user_id = p_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener el conteo de likes de un outfit
CREATE OR REPLACE FUNCTION get_outfit_likes_count(p_outfit_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (SELECT COUNT(*) FROM outfit_likes WHERE outfit_id = p_outfit_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 8. INICIALIZAR CONTADORES EXISTENTES (solo primera vez)
-- =====================================================
-- Actualizar likes_count para outfits existentes
UPDATE outfits
SET likes_count = (
  SELECT COUNT(*) 
  FROM outfit_likes 
  WHERE outfit_likes.outfit_id = outfits.id
);

-- =====================================================
-- VERIFICAR
-- =====================================================
-- Ejecuta esto para verificar que todo está correcto:

SELECT 
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE tablename = 'outfit_likes'
ORDER BY policyname;

