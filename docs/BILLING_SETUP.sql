-- =====================================================
-- BILLING & USAGE TRACKING TABLES - SQL SCHEMA
-- =====================================================
-- Este script crea las tablas necesarias para el sistema de billing
-- Ejecuta esto en tu Supabase SQL Editor

-- =====================================================
-- 1. USER USAGE TRACKING TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS user_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL, -- 'generate_outfit', etc.
  cost DECIMAL(10, 2) NOT NULL DEFAULT 0.05, -- Costo por acción
  polar_event_id TEXT, -- ID del evento en Polar.sh
  metadata JSONB, -- Información adicional (productos usados, etc.)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- =====================================================
-- 2. USER BILLING INFO TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS user_billing (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  polar_customer_id TEXT, -- ID del customer en Polar.sh
  polar_subscription_id TEXT, -- ID de la subscripción en Polar.sh
  total_spent DECIMAL(10, 2) DEFAULT 0.00, -- Total gastado acumulado
  last_payment_date TIMESTAMP WITH TIME ZONE,
  payment_status VARCHAR(20) DEFAULT 'active', -- 'active', 'suspended', 'cancelled'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- =====================================================
-- 3. INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_user_usage_user_id ON user_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_user_usage_action ON user_usage(action);
CREATE INDEX IF NOT EXISTS idx_user_usage_created_at ON user_usage(created_at);
CREATE INDEX IF NOT EXISTS idx_user_billing_user_id ON user_billing(user_id);
CREATE INDEX IF NOT EXISTS idx_user_billing_polar_customer_id ON user_billing(polar_customer_id);

-- =====================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on user_usage table
ALTER TABLE user_usage ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own usage
CREATE POLICY "Users can read own usage"
ON user_usage
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can read their own billing info
ALTER TABLE user_billing ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own billing"
ON user_billing
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can update their own billing info (for webhooks)
CREATE POLICY "Users can update own billing"
ON user_billing
FOR UPDATE
USING (auth.uid() = user_id);

-- =====================================================
-- 5. TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_billing_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER user_billing_updated_at
BEFORE UPDATE ON user_billing
FOR EACH ROW
EXECUTE FUNCTION update_user_billing_updated_at();

-- Function to update total_spent when new usage is added
CREATE OR REPLACE FUNCTION update_total_spent()
RETURNS TRIGGER AS $$
BEGIN
  -- Actualizar el total_spent en user_billing
  INSERT INTO user_billing (user_id, total_spent)
  VALUES (NEW.user_id, NEW.cost)
  ON CONFLICT (user_id) 
  DO UPDATE SET total_spent = user_billing.total_spent + NEW.cost;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update total_spent
CREATE TRIGGER user_usage_update_total
AFTER INSERT ON user_usage
FOR EACH ROW
EXECUTE FUNCTION update_total_spent();

-- =====================================================
-- 6. AUTO-INITIALIZE BILLING FOR NEW USERS
-- =====================================================

-- Function to automatically create billing info when user profile is created
CREATE OR REPLACE FUNCTION initialize_user_billing()
RETURNS TRIGGER AS $$
BEGIN
  -- Insertar registro de billing si no existe
  INSERT INTO user_billing (user_id, payment_status)
  VALUES (NEW.id, 'active')
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para crear billing info automáticamente cuando se crea un user_profile
CREATE TRIGGER user_profile_initialize_billing
AFTER INSERT ON user_profiles
FOR EACH ROW
EXECUTE FUNCTION initialize_user_billing();

-- =====================================================
-- 6.1. MIGRAR USUARIOS EXISTENTES
-- =====================================================
-- Este script crea billing info para todos los usuarios existentes que no la tienen

INSERT INTO user_billing (user_id, payment_status)
SELECT id, 'active'
FROM user_profiles
WHERE id NOT IN (SELECT user_id FROM user_billing);

-- =====================================================
-- 7. FUNCTIONS FOR BILLING QUERIES
-- =====================================================

-- Function to get user's total usage count
CREATE OR REPLACE FUNCTION get_user_usage_count(p_user_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*) 
    FROM user_usage 
    WHERE user_id = p_user_id AND action = 'generate_outfit'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's total spent
CREATE OR REPLACE FUNCTION get_user_total_spent(p_user_id UUID)
RETURNS DECIMAL AS $$
BEGIN
  RETURN (
    SELECT COALESCE(total_spent, 0.00)
    FROM user_billing 
    WHERE user_id = p_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's usage in a date range
CREATE OR REPLACE FUNCTION get_user_usage_range(
  p_user_id UUID, 
  p_start_date TIMESTAMP, 
  p_end_date TIMESTAMP
)
RETURNS TABLE (
  action VARCHAR,
  cost DECIMAL,
  created_at TIMESTAMP
) AS $$
BEGIN
  RETURN QUERY
  SELECT u.action, u.cost, u.created_at
  FROM user_usage u
  WHERE u.user_id = p_user_id 
    AND u.created_at >= p_start_date 
    AND u.created_at <= p_end_date
  ORDER BY u.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
