-- =====================================================
-- PRODUCT METRICS SYSTEM - SQL SCHEMA
-- =====================================================
-- Este script agrega el sistema de métricas para productos
-- Run this in your Supabase SQL Editor AFTER running ADMIN_SETUP.sql

-- =====================================================
-- 1. AGREGAR CAMPOS DE MÉTRICAS A LA TABLA PRODUCTS
-- =====================================================
-- Agregar contadores totales a la tabla de productos
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS total_worn_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_link_clicks INTEGER DEFAULT 0;

-- Crear índices para mejor performance en consultas de métricas
CREATE INDEX IF NOT EXISTS idx_products_total_worn ON products(total_worn_count);
CREATE INDEX IF NOT EXISTS idx_products_total_clicks ON products(total_link_clicks);

-- =====================================================
-- 2. TABLA DE EVENTOS DE PRODUCTOS (Para tracking histórico)
-- =====================================================
-- Esta tabla guarda cada evento individual para poder generar gráficos históricos
CREATE TABLE IF NOT EXISTS product_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  
  -- Tipo de evento: 'worn' (vestido) o 'link_click' (clic en link)
  event_type VARCHAR(20) NOT NULL CHECK (event_type IN ('worn', 'link_click')),
  
  -- Información del usuario (opcional, para analytics más avanzados)
  user_id UUID, -- ID del usuario si está autenticado
  
  -- Metadata adicional (opcional)
  metadata JSONB, -- Puede incluir info como dispositivo, ubicación, etc.
  
  -- Timestamp del evento
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  
  -- Fecha del evento (para facilitar agrupación por día)
  event_date DATE DEFAULT CURRENT_DATE
);

-- Índices para optimizar consultas de analytics
CREATE INDEX IF NOT EXISTS idx_product_events_product_id ON product_events(product_id);
CREATE INDEX IF NOT EXISTS idx_product_events_brand_id ON product_events(brand_id);
CREATE INDEX IF NOT EXISTS idx_product_events_type ON product_events(event_type);
CREATE INDEX IF NOT EXISTS idx_product_events_date ON product_events(event_date);
CREATE INDEX IF NOT EXISTS idx_product_events_product_date ON product_events(product_id, event_date);
CREATE INDEX IF NOT EXISTS idx_product_events_brand_date ON product_events(brand_id, event_date);

-- =====================================================
-- 3. FUNCIÓN PARA REGISTRAR EVENTOS
-- =====================================================
-- Esta función registra un evento y actualiza los contadores totales
CREATE OR REPLACE FUNCTION record_product_event(
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
  
  -- Actualizar contadores totales en la tabla products
  IF p_event_type = 'worn' THEN
    UPDATE products 
    SET total_worn_count = total_worn_count + 1
    WHERE id = p_product_id;
  ELSIF p_event_type = 'link_click' THEN
    UPDATE products 
    SET total_link_clicks = total_link_clicks + 1
    WHERE id = p_product_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 4. VISTAS PARA MÉTRICAS AGREGADAS
-- =====================================================

-- Vista: Métricas diarias por producto
CREATE OR REPLACE VIEW product_daily_metrics AS
SELECT 
  product_id,
  brand_id,
  event_date,
  COUNT(*) FILTER (WHERE event_type = 'worn') as worn_count,
  COUNT(*) FILTER (WHERE event_type = 'link_click') as link_clicks,
  COUNT(*) as total_events
FROM product_events
GROUP BY product_id, brand_id, event_date
ORDER BY event_date DESC;

-- Vista: Métricas de los últimos 30 días por producto
CREATE OR REPLACE VIEW product_metrics_last_30_days AS
SELECT 
  p.id as product_id,
  p.name as product_name,
  p.brand_id,
  p.total_worn_count,
  p.total_link_clicks,
  COALESCE(SUM(CASE WHEN pe.event_type = 'worn' THEN 1 ELSE 0 END), 0) as worn_last_30_days,
  COALESCE(SUM(CASE WHEN pe.event_type = 'link_click' THEN 1 ELSE 0 END), 0) as clicks_last_30_days
FROM products p
LEFT JOIN product_events pe ON p.id = pe.product_id 
  AND pe.event_date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY p.id, p.name, p.brand_id, p.total_worn_count, p.total_link_clicks;

-- Vista: Métricas totales por marca
CREATE OR REPLACE VIEW brand_total_metrics AS
SELECT 
  b.id as brand_id,
  b.brand_name,
  COUNT(DISTINCT p.id) as total_products,
  COALESCE(SUM(p.total_worn_count), 0) as total_worn_count,
  COALESCE(SUM(p.total_link_clicks), 0) as total_link_clicks,
  COALESCE(COUNT(pe.id) FILTER (WHERE pe.event_date = CURRENT_DATE), 0) as events_today
FROM brands b
LEFT JOIN products p ON b.id = p.brand_id
LEFT JOIN product_events pe ON b.id = pe.brand_id AND pe.event_date = CURRENT_DATE
GROUP BY b.id, b.brand_name;

-- =====================================================
-- 5. ROW LEVEL SECURITY (RLS) PARA PRODUCT_EVENTS
-- =====================================================

-- Enable RLS on product_events table
ALTER TABLE product_events ENABLE ROW LEVEL SECURITY;

-- Policy: Brands can view their own product events
CREATE POLICY "Brands can view own product events" ON product_events
  FOR SELECT
  USING (brand_id::text = auth.uid()::text);

-- Policy: Anyone can insert events (para tracking público)
CREATE POLICY "Anyone can insert product events" ON product_events
  FOR INSERT
  WITH CHECK (true);

-- Policy: Solo el sistema puede actualizar/eliminar eventos
-- (No policies for UPDATE/DELETE means only service role can do it)

-- =====================================================
-- 6. FUNCIÓN PARA OBTENER MÉTRICAS DE PRODUCTO
-- =====================================================
-- Esta función devuelve métricas detalladas de un producto para un rango de fechas
CREATE OR REPLACE FUNCTION get_product_metrics(
  p_product_id UUID,
  p_days_back INTEGER DEFAULT 30
)
RETURNS TABLE (
  event_date DATE,
  worn_count BIGINT,
  link_clicks BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pe.event_date,
    COUNT(*) FILTER (WHERE pe.event_type = 'worn') as worn_count,
    COUNT(*) FILTER (WHERE pe.event_type = 'link_click') as link_clicks
  FROM product_events pe
  WHERE pe.product_id = p_product_id
    AND pe.event_date >= CURRENT_DATE - p_days_back
  GROUP BY pe.event_date
  ORDER BY pe.event_date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 7. FUNCIÓN PARA OBTENER MÉTRICAS DE MARCA
-- =====================================================
-- Esta función devuelve métricas agregadas de todos los productos de una marca
CREATE OR REPLACE FUNCTION get_brand_metrics(
  p_brand_id UUID,
  p_days_back INTEGER DEFAULT 30
)
RETURNS TABLE (
  event_date DATE,
  worn_count BIGINT,
  link_clicks BIGINT,
  total_events BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pe.event_date,
    COUNT(*) FILTER (WHERE pe.event_type = 'worn') as worn_count,
    COUNT(*) FILTER (WHERE pe.event_type = 'link_click') as link_clicks,
    COUNT(*) as total_events
  FROM product_events pe
  WHERE pe.brand_id = p_brand_id
    AND pe.event_date >= CURRENT_DATE - p_days_back
  GROUP BY pe.event_date
  ORDER BY pe.event_date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 8. TRIGGER PARA MANTENER event_date SINCRONIZADO
-- =====================================================
-- Asegura que event_date siempre coincida con la fecha de created_at
CREATE OR REPLACE FUNCTION update_event_date()
RETURNS TRIGGER AS $$
BEGIN
  NEW.event_date = DATE(NEW.created_at);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_event_date
  BEFORE INSERT ON product_events
  FOR EACH ROW
  EXECUTE FUNCTION update_event_date();

-- =====================================================
-- 9. ÍNDICE COMPUESTO PARA CONSULTAS COMPLEJAS
-- =====================================================
-- Optimiza consultas que filtran por marca, fecha y tipo de evento
CREATE INDEX IF NOT EXISTS idx_product_events_complex 
ON product_events(brand_id, event_date DESC, event_type, product_id);

-- =====================================================
-- NOTAS DE IMPLEMENTACIÓN
-- =====================================================
-- 1. Los eventos se registran en tiempo real cuando los usuarios interactúan
-- 2. Los contadores totales (total_worn_count, total_link_clicks) se actualizan automáticamente
-- 3. La tabla product_events permite generar gráficos históricos
-- 4. Las vistas materializadas pueden agregarse para mejor performance en producción
-- 5. Considera agregar particionamiento por fecha si el volumen de eventos es muy alto

-- =====================================================
-- CONSULTAS DE EJEMPLO
-- =====================================================

-- Ver métricas de un producto específico de los últimos 7 días
-- SELECT * FROM get_product_metrics('product-uuid-here', 7);

-- Ver métricas totales de una marca
-- SELECT * FROM brand_total_metrics WHERE brand_id = 'brand-uuid-here';

-- Ver eventos de hoy para una marca
-- SELECT p.name, pe.event_type, COUNT(*) 
-- FROM product_events pe
-- JOIN products p ON pe.product_id = p.id
-- WHERE pe.brand_id = 'brand-uuid-here' 
--   AND pe.event_date = CURRENT_DATE
-- GROUP BY p.name, pe.event_type;

