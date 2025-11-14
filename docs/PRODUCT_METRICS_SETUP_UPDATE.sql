-- =====================================================
-- PRODUCT METRICS SYSTEM - ACTUALIZACIÓN DE NUEVAS MÉTRICAS
-- =====================================================
-- Este script agrega tres nuevas métricas al sistema existente
-- IMPORTANTE: Copia y pega TODO este script en el SQL Editor de Supabase y ejecútalo
-- =====================================================

-- =====================================================
-- 1. AGREGAR NUEVOS CAMPOS DE MÉTRICAS A LA TABLA PRODUCTS
-- =====================================================
-- Agregar contadores para las nuevas métricas
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS total_product_views INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_outfit_downloads INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_outfit_saves INTEGER DEFAULT 0;

-- Crear índices para mejor performance en consultas de métricas
CREATE INDEX IF NOT EXISTS idx_products_total_views ON products(total_product_views);
CREATE INDEX IF NOT EXISTS idx_products_outfit_downloads ON products(total_outfit_downloads);
CREATE INDEX IF NOT EXISTS idx_products_outfit_saves ON products(total_outfit_saves);

-- =====================================================
-- 2. ACTUALIZAR EL CHECK CONSTRAINT DE product_events
-- =====================================================
-- Primero eliminar el constraint existente
ALTER TABLE product_events 
DROP CONSTRAINT IF EXISTS product_events_event_type_check;

-- Agregar el nuevo constraint con los tipos de eventos actualizados
ALTER TABLE product_events
ADD CONSTRAINT product_events_event_type_check 
CHECK (event_type IN ('worn', 'link_click', 'product_view', 'outfit_downloaded', 'outfit_saved'));

-- =====================================================
-- 3. ELIMINAR VISTAS Y FUNCIONES EXISTENTES
-- =====================================================
-- Eliminar las vistas existentes (CASCADE elimina dependencias)
DROP VIEW IF EXISTS product_daily_metrics CASCADE;
DROP VIEW IF EXISTS product_metrics_last_30_days CASCADE;
DROP VIEW IF EXISTS brand_total_metrics CASCADE;

-- Eliminar las funciones existentes
DROP FUNCTION IF EXISTS get_product_metrics(UUID, INTEGER);
DROP FUNCTION IF EXISTS get_brand_metrics(UUID, INTEGER);
DROP FUNCTION IF EXISTS record_product_event(UUID, VARCHAR, UUID, JSONB);

-- =====================================================
-- 4. RECREAR LA FUNCIÓN record_product_event
-- =====================================================
-- Función actualizada para soportar los nuevos tipos de eventos
CREATE FUNCTION record_product_event(
  p_product_id UUID,
  p_event_type VARCHAR(20),
  p_user_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
  v_brand_id UUID;
BEGIN
  -- Obtener el brand_id del producto
  SELECT brand_id INTO v_brand_id
  FROM products
  WHERE id = p_product_id;
  
  IF v_brand_id IS NULL THEN
    RAISE EXCEPTION 'Product not found';
  END IF;
  
  -- Insertar el evento
  INSERT INTO product_events (product_id, brand_id, event_type, user_id, metadata)
  VALUES (p_product_id, v_brand_id, p_event_type, p_user_id, p_metadata);
  
  -- Actualizar contadores totales en la tabla products según el tipo de evento
  IF p_event_type = 'worn' THEN
    UPDATE products 
    SET total_worn_count = total_worn_count + 1
    WHERE id = p_product_id;
  ELSIF p_event_type = 'link_click' THEN
    UPDATE products 
    SET total_link_clicks = total_link_clicks + 1
    WHERE id = p_product_id;
  ELSIF p_event_type = 'product_view' THEN
    UPDATE products 
    SET total_product_views = total_product_views + 1
    WHERE id = p_product_id;
  ELSIF p_event_type = 'outfit_downloaded' THEN
    UPDATE products 
    SET total_outfit_downloads = total_outfit_downloads + 1
    WHERE id = p_product_id;
  ELSIF p_event_type = 'outfit_saved' THEN
    UPDATE products 
    SET total_outfit_saves = total_outfit_saves + 1
    WHERE id = p_product_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 5. RECREAR VISTAS CON NUEVAS MÉTRICAS
-- =====================================================

-- Vista: Métricas diarias por producto
CREATE VIEW product_daily_metrics AS
SELECT 
  product_id,
  brand_id,
  event_date,
  COUNT(*) FILTER (WHERE event_type = 'worn') as worn_count,
  COUNT(*) FILTER (WHERE event_type = 'link_click') as link_clicks,
  COUNT(*) FILTER (WHERE event_type = 'product_view') as product_views,
  COUNT(*) FILTER (WHERE event_type = 'outfit_downloaded') as outfit_downloads,
  COUNT(*) FILTER (WHERE event_type = 'outfit_saved') as outfit_saves,
  COUNT(*) as total_events
FROM product_events
GROUP BY product_id, brand_id, event_date
ORDER BY event_date DESC;

-- Vista: Métricas de los últimos 30 días por producto
CREATE VIEW product_metrics_last_30_days AS
SELECT 
  p.id as product_id,
  p.name as product_name,
  p.brand_id,
  p.total_worn_count,
  p.total_link_clicks,
  p.total_product_views,
  p.total_outfit_downloads,
  p.total_outfit_saves,
  COALESCE(SUM(CASE WHEN pe.event_type = 'worn' THEN 1 ELSE 0 END), 0) as worn_last_30_days,
  COALESCE(SUM(CASE WHEN pe.event_type = 'link_click' THEN 1 ELSE 0 END), 0) as clicks_last_30_days,
  COALESCE(SUM(CASE WHEN pe.event_type = 'product_view' THEN 1 ELSE 0 END), 0) as views_last_30_days,
  COALESCE(SUM(CASE WHEN pe.event_type = 'outfit_downloaded' THEN 1 ELSE 0 END), 0) as downloads_last_30_days,
  COALESCE(SUM(CASE WHEN pe.event_type = 'outfit_saved' THEN 1 ELSE 0 END), 0) as saves_last_30_days
FROM products p
LEFT JOIN product_events pe ON p.id = pe.product_id 
  AND pe.event_date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY p.id, p.name, p.brand_id, p.total_worn_count, p.total_link_clicks, 
         p.total_product_views, p.total_outfit_downloads, p.total_outfit_saves;

-- Vista: Métricas totales por marca
CREATE VIEW brand_total_metrics AS
SELECT 
  b.id as brand_id,
  b.brand_name,
  COUNT(DISTINCT p.id) as total_products,
  COALESCE(SUM(p.total_worn_count), 0) as total_worn_count,
  COALESCE(SUM(p.total_link_clicks), 0) as total_link_clicks,
  COALESCE(SUM(p.total_product_views), 0) as total_product_views,
  COALESCE(SUM(p.total_outfit_downloads), 0) as total_outfit_downloads,
  COALESCE(SUM(p.total_outfit_saves), 0) as total_outfit_saves,
  COALESCE(COUNT(pe.id) FILTER (WHERE pe.event_date = CURRENT_DATE), 0) as events_today
FROM brands b
LEFT JOIN products p ON b.id = p.brand_id
LEFT JOIN product_events pe ON b.id = pe.brand_id AND pe.event_date = CURRENT_DATE
GROUP BY b.id, b.brand_name;

-- =====================================================
-- 6. RECREAR FUNCIONES CON NUEVAS MÉTRICAS
-- =====================================================

-- Función: Obtener métricas de producto
CREATE FUNCTION get_product_metrics(
  p_product_id UUID,
  p_days_back INTEGER DEFAULT 30
)
RETURNS TABLE (
  event_date DATE,
  worn_count BIGINT,
  link_clicks BIGINT,
  product_views BIGINT,
  outfit_downloads BIGINT,
  outfit_saves BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pe.event_date,
    COUNT(*) FILTER (WHERE pe.event_type = 'worn') as worn_count,
    COUNT(*) FILTER (WHERE pe.event_type = 'link_click') as link_clicks,
    COUNT(*) FILTER (WHERE pe.event_type = 'product_view') as product_views,
    COUNT(*) FILTER (WHERE pe.event_type = 'outfit_downloaded') as outfit_downloads,
    COUNT(*) FILTER (WHERE pe.event_type = 'outfit_saved') as outfit_saves
  FROM product_events pe
  WHERE pe.product_id = p_product_id
    AND pe.event_date >= CURRENT_DATE - p_days_back
  GROUP BY pe.event_date
  ORDER BY pe.event_date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función: Obtener métricas de marca
CREATE FUNCTION get_brand_metrics(
  p_brand_id UUID,
  p_days_back INTEGER DEFAULT 30
)
RETURNS TABLE (
  event_date DATE,
  worn_count BIGINT,
  link_clicks BIGINT,
  product_views BIGINT,
  outfit_downloads BIGINT,
  outfit_saves BIGINT,
  total_events BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pe.event_date,
    COUNT(*) FILTER (WHERE pe.event_type = 'worn') as worn_count,
    COUNT(*) FILTER (WHERE pe.event_type = 'link_click') as link_clicks,
    COUNT(*) FILTER (WHERE pe.event_type = 'product_view') as product_views,
    COUNT(*) FILTER (WHERE pe.event_type = 'outfit_downloaded') as outfit_downloads,
    COUNT(*) FILTER (WHERE pe.event_type = 'outfit_saved') as outfit_saves,
    COUNT(*) as total_events
  FROM product_events pe
  WHERE pe.brand_id = p_brand_id
    AND pe.event_date >= CURRENT_DATE - p_days_back
  GROUP BY pe.event_date
  ORDER BY pe.event_date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 7. VERIFICACIÓN
-- =====================================================
-- Las siguientes consultas son para verificar que todo se creó correctamente
-- Puedes ejecutarlas después para confirmar

-- Verificar que las columnas se agregaron correctamente
-- SELECT column_name, data_type, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'products' 
-- AND column_name IN ('total_product_views', 'total_outfit_downloads', 'total_outfit_saves');

-- Verificar el constraint actualizado
-- SELECT constraint_name, check_clause 
-- FROM information_schema.check_constraints 
-- WHERE constraint_name = 'product_events_event_type_check';

-- Verificar que las vistas existen
-- SELECT table_name 
-- FROM information_schema.views 
-- WHERE table_name IN ('product_daily_metrics', 'product_metrics_last_30_days', 'brand_total_metrics');

-- Verificar que las funciones existen
-- SELECT routine_name, routine_type 
-- FROM information_schema.routines 
-- WHERE routine_name IN ('get_product_metrics', 'get_brand_metrics', 'record_product_event');

-- =====================================================
-- ✅ SCRIPT COMPLETADO
-- =====================================================
-- Si no hubo errores, las nuevas métricas están listas para usar!
