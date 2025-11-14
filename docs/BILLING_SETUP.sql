-- =====================================================
-- BILLING SYSTEM - SQL SCHEMA
-- =====================================================
-- Este script agrega el sistema de facturación para marcas
-- Run this in your Supabase SQL Editor AFTER running PRODUCT_METRICS_SETUP.sql

-- =====================================================
-- 1. TABLA DE CONFIGURACIÓN DE PRECIOS
-- =====================================================
-- Esta tabla guarda la configuración global de precios
CREATE TABLE IF NOT EXISTS billing_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_key VARCHAR(100) UNIQUE NOT NULL,
  config_value NUMERIC(10, 2) NOT NULL,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Insertar el precio por "worn" (precio por cada vez que se viste un producto)
INSERT INTO billing_config (config_key, config_value, description)
VALUES 
  ('price_per_worn', 0.06, 'Precio en USD por cada vez que un producto es vestido (worn event)'),
  ('price_per_click', 0, 'Precio en USD por cada clic en el link del producto (opcional)')
ON CONFLICT (config_key) DO NOTHING;

-- =====================================================
-- 2. TABLA DE FACTURAS (INVOICES)
-- =====================================================
-- Esta tabla guarda las facturas generadas para cada marca
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  
  -- Período de facturación
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  
  -- Métricas del período
  total_worn_count INTEGER DEFAULT 0,
  total_link_clicks INTEGER DEFAULT 0,
  
  -- Cálculos de costos
  price_per_worn NUMERIC(10, 2) NOT NULL, -- Precio que se usó en esta factura
  price_per_click NUMERIC(10, 2) DEFAULT 0, -- Precio por click (opcional)
  
  subtotal_worn NUMERIC(10, 2) DEFAULT 0, -- total_worn_count * price_per_worn
  subtotal_clicks NUMERIC(10, 2) DEFAULT 0, -- total_link_clicks * price_per_click
  total_amount NUMERIC(10, 2) DEFAULT 0, -- subtotal_worn + subtotal_clicks
  
  -- Estado de la factura
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
  
  -- Fechas
  issued_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  due_date DATE,
  paid_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata adicional
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_invoices_brand_id ON invoices(brand_id);
CREATE INDEX IF NOT EXISTS idx_invoices_period ON invoices(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);

-- =====================================================
-- 3. FUNCIÓN PARA OBTENER EL PRECIO ACTUAL
-- =====================================================
CREATE OR REPLACE FUNCTION get_current_price(p_config_key VARCHAR)
RETURNS NUMERIC AS $$
DECLARE
  v_price NUMERIC;
BEGIN
  SELECT config_value INTO v_price
  FROM billing_config
  WHERE config_key = p_config_key;
  
  RETURN COALESCE(v_price, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 4. FUNCIÓN PARA CALCULAR EL COSTO DE UNA MARCA
-- =====================================================
-- Esta función calcula el costo total para una marca en un período específico
CREATE OR REPLACE FUNCTION calculate_brand_billing(
  p_brand_id UUID,
  p_start_date DATE,
  p_end_date DATE
)
RETURNS TABLE (
  total_worn_count BIGINT,
  total_link_clicks BIGINT,
  price_per_worn NUMERIC,
  price_per_click NUMERIC,
  subtotal_worn NUMERIC,
  subtotal_clicks NUMERIC,
  total_amount NUMERIC
) AS $$
DECLARE
  v_worn_count BIGINT;
  v_click_count BIGINT;
  v_price_worn NUMERIC;
  v_price_click NUMERIC;
BEGIN
  -- Obtener precios actuales
  v_price_worn := get_current_price('price_per_worn');
  v_price_click := get_current_price('price_per_click');
  
  -- Contar eventos en el período
  SELECT 
    COUNT(*) FILTER (WHERE event_type = 'worn'),
    COUNT(*) FILTER (WHERE event_type = 'link_click')
  INTO v_worn_count, v_click_count
  FROM product_events
  WHERE brand_id = p_brand_id
    AND event_date >= p_start_date
    AND event_date <= p_end_date;
  
  -- Calcular totales
  RETURN QUERY SELECT
    v_worn_count,
    v_click_count,
    v_price_worn,
    v_price_click,
    (v_worn_count * v_price_worn)::NUMERIC(10, 2) as subtotal_worn,
    (v_click_count * v_price_click)::NUMERIC(10, 2) as subtotal_clicks,
    ((v_worn_count * v_price_worn) + (v_click_count * v_price_click))::NUMERIC(10, 2) as total_amount;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 5. FUNCIÓN PARA GENERAR UNA FACTURA
-- =====================================================
CREATE OR REPLACE FUNCTION generate_invoice(
  p_brand_id UUID,
  p_start_date DATE,
  p_end_date DATE
)
RETURNS UUID AS $$
DECLARE
  v_invoice_id UUID;
  v_billing_data RECORD;
BEGIN
  -- Calcular los datos de facturación
  SELECT * INTO v_billing_data
  FROM calculate_brand_billing(p_brand_id, p_start_date, p_end_date);
  
  -- Crear la factura
  INSERT INTO invoices (
    brand_id,
    period_start,
    period_end,
    total_worn_count,
    total_link_clicks,
    price_per_worn,
    price_per_click,
    subtotal_worn,
    subtotal_clicks,
    total_amount,
    due_date,
    status
  )
  VALUES (
    p_brand_id,
    p_start_date,
    p_end_date,
    v_billing_data.total_worn_count,
    v_billing_data.total_link_clicks,
    v_billing_data.price_per_worn,
    v_billing_data.price_per_click,
    v_billing_data.subtotal_worn,
    v_billing_data.subtotal_clicks,
    v_billing_data.total_amount,
    p_end_date + INTERVAL '30 days', -- Due date: 30 días después del fin del período
    'pending'
  )
  RETURNING id INTO v_invoice_id;
  
  RETURN v_invoice_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 6. VISTA DE BILLING POR MARCA
-- =====================================================
-- Esta vista muestra el resumen de billing para cada marca
CREATE OR REPLACE VIEW brand_billing_summary AS
SELECT 
  b.id as brand_id,
  b.brand_name,
  b.email,
  COUNT(DISTINCT p.id) as total_products,
  COALESCE(SUM(p.total_worn_count), 0) as lifetime_worn_count,
  COALESCE(SUM(p.total_link_clicks), 0) as lifetime_link_clicks,
  (COALESCE(SUM(p.total_worn_count), 0) * get_current_price('price_per_worn'))::NUMERIC(10, 2) as lifetime_billing_worn,
  (COALESCE(SUM(p.total_link_clicks), 0) * get_current_price('price_per_click'))::NUMERIC(10, 2) as lifetime_billing_clicks,
  (
    (COALESCE(SUM(p.total_worn_count), 0) * get_current_price('price_per_worn')) +
    (COALESCE(SUM(p.total_link_clicks), 0) * get_current_price('price_per_click'))
  )::NUMERIC(10, 2) as lifetime_total_billing
FROM brands b
LEFT JOIN products p ON b.id = p.brand_id
GROUP BY b.id, b.brand_name, b.email;

-- =====================================================
-- 7. ROW LEVEL SECURITY
-- =====================================================

-- Enable RLS on billing tables
ALTER TABLE billing_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Policy: Solo admins pueden ver/modificar billing_config (requiere service role)
-- No policies = solo service role puede acceder

-- Policy: Brands pueden ver sus propias facturas
CREATE POLICY "Brands can view own invoices" ON invoices
  FOR SELECT
  USING (brand_id::text = auth.uid()::text);

-- Policy: Solo el sistema puede crear facturas (service role)
-- No INSERT policy = solo service role puede crear

-- =====================================================
-- 8. TRIGGER PARA ACTUALIZAR updated_at
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_billing_config_updated_at
  BEFORE UPDATE ON billing_config
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 9. FUNCIÓN PARA OBTENER MÉTRICAS DIARIAS DE BILLING
-- =====================================================
CREATE OR REPLACE FUNCTION get_brand_billing_daily(
  p_brand_id UUID,
  p_days_back INTEGER DEFAULT 30
)
RETURNS TABLE (
  event_date DATE,
  worn_count BIGINT,
  link_clicks BIGINT,
  daily_cost_worn NUMERIC,
  daily_cost_clicks NUMERIC,
  daily_total_cost NUMERIC
) AS $$
DECLARE
  v_price_worn NUMERIC;
  v_price_click NUMERIC;
BEGIN
  -- Obtener precios actuales
  v_price_worn := get_current_price('price_per_worn');
  v_price_click := get_current_price('price_per_click');
  
  RETURN QUERY
  SELECT 
    pe.event_date,
    COUNT(*) FILTER (WHERE pe.event_type = 'worn') as worn_count,
    COUNT(*) FILTER (WHERE pe.event_type = 'link_click') as link_clicks,
    (COUNT(*) FILTER (WHERE pe.event_type = 'worn') * v_price_worn)::NUMERIC(10, 2) as daily_cost_worn,
    (COUNT(*) FILTER (WHERE pe.event_type = 'link_click') * v_price_click)::NUMERIC(10, 2) as daily_cost_clicks,
    (
      (COUNT(*) FILTER (WHERE pe.event_type = 'worn') * v_price_worn) +
      (COUNT(*) FILTER (WHERE pe.event_type = 'link_click') * v_price_click)
    )::NUMERIC(10, 2) as daily_total_cost
  FROM product_events pe
  WHERE pe.brand_id = p_brand_id
    AND pe.event_date >= CURRENT_DATE - p_days_back
  GROUP BY pe.event_date
  ORDER BY pe.event_date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- CONSULTAS DE EJEMPLO Y ADMINISTRACIÓN
-- =====================================================

-- Ver la configuración actual de precios
-- SELECT * FROM billing_config;

-- Actualizar el precio por "worn" (solo ejecutar con service role o como admin)
-- UPDATE billing_config SET config_value = 0.15 WHERE config_key = 'price_per_worn';

-- Calcular el billing actual de una marca (últimos 30 días)
-- SELECT * FROM calculate_brand_billing('brand-uuid-here', CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE);

-- Ver el resumen de billing de todas las marcas
-- SELECT * FROM brand_billing_summary ORDER BY lifetime_total_billing DESC;

-- Generar una factura para una marca (por ejemplo, del mes pasado)
-- SELECT generate_invoice(
--   'brand-uuid-here',
--   DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')::DATE,
--   (DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 day')::DATE
-- );

-- Ver todas las facturas de una marca
-- SELECT * FROM invoices WHERE brand_id = 'brand-uuid-here' ORDER BY period_end DESC;

-- Ver métricas diarias de billing
-- SELECT * FROM get_brand_billing_daily('brand-uuid-here', 30);

-- =====================================================
-- NOTAS IMPORTANTES
-- =====================================================
-- 1. El precio por "worn" se guarda en billing_config y puede ser modificado fácilmente
-- 2. Cada factura guarda el precio que se usó en ese momento (histórico)
-- 3. Las facturas se pueden generar automáticamente con un cron job
-- 4. Las marcas solo pueden ver sus propias facturas (RLS)
-- 5. Solo tú (con service role) puedes modificar precios y generar facturas
-- 6. El sistema está preparado para cobrar también por clicks si lo deseas en el futuro

