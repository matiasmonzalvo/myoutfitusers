-- =====================================================
-- TRY-ONS PACKAGES SYSTEM - SQL SCHEMA
-- =====================================================
-- Este script reemplaza el sistema de pay-per-use por paquetes prepagados
-- Run this in your Supabase SQL Editor

-- =====================================================
-- 1. ACTUALIZAR USER_PROFILES PARA INCLUIR TRY-ONS
-- =====================================================

-- Agregar columna try_ons_left a user_profiles
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS try_ons_left INTEGER DEFAULT 0;

-- Crear índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_user_profiles_try_ons ON user_profiles(try_ons_left);

-- =====================================================
-- 2. TABLA DE PAQUETES DISPONIBLES
-- =====================================================

CREATE TABLE IF NOT EXISTS tryons_packages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) NOT NULL UNIQUE, -- 'small', 'medium', 'large'
  try_ons_count INTEGER NOT NULL, -- 20, 60, 150
  price_usd DECIMAL(10, 2) NOT NULL, -- 2.00, 5.00, 10.00
  price_per_tryon DECIMAL(10, 3) NOT NULL, -- Calculado
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Insertar los paquetes
INSERT INTO tryons_packages (name, try_ons_count, price_usd, price_per_tryon)
VALUES 
  ('small', 20, 2.00, 0.100),
  ('medium', 60, 5.00, 0.083),
  ('large', 150, 10.00, 0.066)
ON CONFLICT (name) DO UPDATE SET
  try_ons_count = EXCLUDED.try_ons_count,
  price_usd = EXCLUDED.price_usd,
  price_per_tryon = EXCLUDED.price_per_tryon;

-- =====================================================
-- 3. TABLA DE COMPRAS DE PAQUETES
-- =====================================================

CREATE TABLE IF NOT EXISTS package_purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  package_id UUID NOT NULL REFERENCES tryons_packages(id),
  package_name VARCHAR(50) NOT NULL, -- Guardamos el nombre por si el paquete cambia
  try_ons_purchased INTEGER NOT NULL,
  price_paid DECIMAL(10, 2) NOT NULL,
  payment_method VARCHAR(50), -- 'stripe', 'polar', etc.
  payment_id TEXT, -- ID de la transacción
  status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_package_purchases_user_id ON package_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_package_purchases_status ON package_purchases(status);
CREATE INDEX IF NOT EXISTS idx_package_purchases_created_at ON package_purchases(created_at DESC);

-- =====================================================
-- 4. TABLA DE HISTORIAL DE USO (SIMPLIFICADA)
-- =====================================================

-- Renombrar la tabla anterior si existe o crear nueva
DROP TABLE IF EXISTS user_usage CASCADE;

CREATE TABLE IF NOT EXISTS tryons_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL DEFAULT 'generate_outfit',
  products_used JSONB, -- IDs de productos usados
  was_free BOOLEAN DEFAULT false, -- Si fue gratis (marca verificada)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_tryons_usage_user_id ON tryons_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_tryons_usage_created_at ON tryons_usage(created_at DESC);

-- =====================================================
-- 5. ELIMINAR TABLAS ANTIGUAS DEL SISTEMA PAY-PER-USE
-- =====================================================

DROP TABLE IF EXISTS user_billing CASCADE;
DROP FUNCTION IF EXISTS update_total_spent CASCADE;
DROP FUNCTION IF EXISTS initialize_user_billing CASCADE;
DROP TRIGGER IF EXISTS user_profile_initialize_billing ON user_profiles;

-- =====================================================
-- 6. FUNCIONES ÚTILES
-- =====================================================

-- Función para obtener try-ons restantes de un usuario
CREATE OR REPLACE FUNCTION get_user_tryons_left(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_tryons_left INTEGER;
BEGIN
  SELECT try_ons_left INTO v_tryons_left
  FROM user_profiles
  WHERE id = p_user_id;
  
  RETURN COALESCE(v_tryons_left, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para descontar un try-on
CREATE OR REPLACE FUNCTION use_tryon(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_tryons_left INTEGER;
BEGIN
  -- Obtener try-ons actuales
  SELECT try_ons_left INTO v_tryons_left
  FROM user_profiles
  WHERE id = p_user_id;
  
  -- Verificar si tiene try-ons disponibles
  IF v_tryons_left <= 0 THEN
    RETURN false;
  END IF;
  
  -- Descontar un try-on
  UPDATE user_profiles
  SET try_ons_left = try_ons_left - 1
  WHERE id = p_user_id;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para agregar try-ons a un usuario
CREATE OR REPLACE FUNCTION add_tryons_to_user(
  p_user_id UUID,
  p_tryons_count INTEGER
)
RETURNS INTEGER AS $$
DECLARE
  v_new_total INTEGER;
BEGIN
  UPDATE user_profiles
  SET try_ons_left = try_ons_left + p_tryons_count
  WHERE id = p_user_id
  RETURNING try_ons_left INTO v_new_total;
  
  RETURN v_new_total;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener estadísticas de un usuario
CREATE OR REPLACE FUNCTION get_user_tryons_stats(p_user_id UUID)
RETURNS TABLE (
  try_ons_left INTEGER,
  total_purchased INTEGER,
  total_used INTEGER,
  total_spent DECIMAL,
  last_purchase_date TIMESTAMP
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    up.try_ons_left,
    COALESCE(SUM(pp.try_ons_purchased), 0)::INTEGER as total_purchased,
    (SELECT COUNT(*)::INTEGER FROM tryons_usage WHERE user_id = p_user_id AND NOT was_free) as total_used,
    COALESCE(SUM(pp.price_paid), 0.00) as total_spent,
    MAX(pp.created_at) as last_purchase_date
  FROM user_profiles up
  LEFT JOIN package_purchases pp ON pp.user_id = up.id AND pp.status = 'completed'
  WHERE up.id = p_user_id
  GROUP BY up.try_ons_left;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 7. ROW LEVEL SECURITY
-- =====================================================

-- Enable RLS
ALTER TABLE tryons_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE package_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE tryons_usage ENABLE ROW LEVEL SECURITY;

-- Paquetes: todos pueden leerlos
CREATE POLICY "Anyone can view packages" ON tryons_packages
  FOR SELECT
  USING (is_active = true);

-- Compras: usuarios pueden ver sus propias compras
CREATE POLICY "Users can view own purchases" ON package_purchases
  FOR SELECT
  USING (auth.uid() = user_id);

-- Compras: solo el sistema puede insertar
-- (No policy = solo service role)

-- Usage: usuarios pueden ver su propio uso
CREATE POLICY "Users can view own usage" ON tryons_usage
  FOR SELECT
  USING (auth.uid() = user_id);

-- =====================================================
-- 8. TRIGGERS
-- =====================================================

-- Trigger para actualizar updated_at en paquetes
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tryons_packages_updated_at
  BEFORE UPDATE ON tryons_packages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 9. DATOS INICIALES PARA TESTING
-- =====================================================

-- Dar 3 try-ons gratis a usuarios existentes (opcional)
-- UPDATE user_profiles SET try_ons_left = 3 WHERE try_ons_left = 0;

-- =====================================================
-- CONSULTAS ÚTILES
-- =====================================================

-- Ver todos los paquetes disponibles
-- SELECT * FROM tryons_packages WHERE is_active = true ORDER BY price_usd;

-- Ver compras de un usuario
-- SELECT * FROM package_purchases WHERE user_id = 'uuid-here' ORDER BY created_at DESC;

-- Ver estadísticas de un usuario
-- SELECT * FROM get_user_tryons_stats('uuid-here');

-- Ver try-ons restantes de un usuario
-- SELECT try_ons_left FROM user_profiles WHERE id = 'uuid-here';

-- Ver uso de try-ons de un usuario
-- SELECT * FROM tryons_usage WHERE user_id = 'uuid-here' ORDER BY created_at DESC;

-- =====================================================
-- NOTAS IMPORTANTES
-- =====================================================
-- 1. Este sistema reemplaza completamente el anterior de pay-per-use
-- 2. Los usuarios compran paquetes de try-ons prepagados
-- 3. Cada vez que usan generate-outfit se descuenta 1 try-on
-- 4. Si los productos son de marcas verificadas, NO se descuenta (gratis)
-- 5. Los usuarios pueden comprar múltiples paquetes acumulativamente
-- 6. El sistema es más simple y predecible para los usuarios



