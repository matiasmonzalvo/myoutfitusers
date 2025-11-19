-- =====================================================
-- BRANDS VERIFICATION SYSTEM
-- =====================================================
-- Este script agrega el sistema de verificación de marcas
-- para diferenciar entre productos de catálogo general (azul)
-- y productos de marcas oficiales (verde)

-- =====================================================
-- 1. AGREGAR COLUMNA is_verified_brand A LA TABLA brands
-- =====================================================

-- Agregar columna para indicar si la marca es verificada (oficial de la plataforma)
ALTER TABLE brands 
ADD COLUMN IF NOT EXISTS is_verified_brand BOOLEAN DEFAULT false;

-- Crear índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_brands_is_verified ON brands(is_verified_brand);

-- =====================================================
-- 2. ACTUALIZAR PRODUCTOS EXISTENTES
-- =====================================================

-- Por defecto, todos los productos son del catálogo general (no verificados)
-- Esto significa que todos tendrán badge azul hasta que manualmente marques marcas como verificadas

-- =====================================================
-- 3. FUNCIÓN PARA VERIFICAR SI UN PRODUCTO ES GRATIS PARA USUARIOS
-- =====================================================

CREATE OR REPLACE FUNCTION is_product_free_for_user(p_product_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_is_verified BOOLEAN;
BEGIN
  SELECT b.is_verified_brand INTO v_is_verified
  FROM products p
  JOIN brands b ON p.brand_id = b.id
  WHERE p.id = p_product_id;
  
  RETURN COALESCE(v_is_verified, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 4. COMENTARIOS Y DOCUMENTACIÓN
-- =====================================================

COMMENT ON COLUMN brands.is_verified_brand IS 
'Indica si la marca es verificada (oficial de la plataforma). 
- true = Badge verde, try-ons GRATIS para usuarios (marca asume el costo)
- false = Badge azul, try-ons cuestan $0.05 para usuarios';

-- =====================================================
-- 5. EJEMPLO: MARCAR UNA MARCA COMO VERIFICADA
-- =====================================================

-- Para marcar una marca como verificada (esto lo harás manualmente):
-- UPDATE brands SET is_verified_brand = true WHERE brand_username = 'nike';

-- Para ver todas las marcas verificadas:
-- SELECT * FROM brands WHERE is_verified_brand = true;

-- Para ver cuántos productos hay de cada tipo:
-- SELECT 
--   b.is_verified_brand,
--   CASE 
--     WHEN b.is_verified_brand THEN 'Marca Verificada (Badge Verde - Gratis)'
--     ELSE 'Catálogo General (Badge Azul - $0.05)'
--   END as tipo,
--   COUNT(p.id) as total_productos
-- FROM brands b
-- LEFT JOIN products p ON p.brand_id = b.id
-- GROUP BY b.is_verified_brand;


