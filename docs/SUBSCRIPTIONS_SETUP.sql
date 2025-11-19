-- =====================================================
-- SUBSCRIPTIONS & USAGE TRACKING - SQL SCHEMA
-- =====================================================
-- Este script crea las tablas necesarias para el sistema de suscripciones con Polar.sh
-- Ejecutar en el SQL Editor de Supabase después de USER_PROFILES_SETUP.sql

-- =====================================================
-- 1. TABLA DE SUSCRIPCIONES
-- =====================================================
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Datos de Polar.sh
  polar_subscription_id VARCHAR(255) UNIQUE,
  polar_customer_id VARCHAR(255) NOT NULL,
  polar_product_id VARCHAR(255) NOT NULL,
  polar_price_id VARCHAR(255) NOT NULL,
  
  -- Plan del usuario
  plan_type VARCHAR(20) NOT NULL CHECK (plan_type IN ('basic', 'pro', 'ultra')),
  
  -- Estado de la suscripción
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'incomplete', 'trialing')),
  
  -- Fechas importantes
  current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  cancel_at_period_end BOOLEAN DEFAULT false,
  canceled_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  
  -- Constraint: Un usuario solo puede tener una suscripción activa
  CONSTRAINT one_active_subscription_per_user UNIQUE (user_id)
);

-- =====================================================
-- 2. TABLA DE HISTORIAL DE USO
-- =====================================================
CREATE TABLE IF NOT EXISTS usage_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES user_subscriptions(id) ON DELETE SET NULL,
  
  -- Tipo de acción
  action_type VARCHAR(50) NOT NULL DEFAULT 'generate_outfit',
  
  -- Costos
  unit_cost DECIMAL(10, 4) NOT NULL, -- Costo por unidad en USD
  quantity INTEGER NOT NULL DEFAULT 1,
  total_cost DECIMAL(10, 2) NOT NULL, -- Costo total = unit_cost * quantity
  
  -- Período de facturación
  billing_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  billing_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- =====================================================
-- 3. TABLA DE RESUMEN DE USO MENSUAL
-- =====================================================
CREATE TABLE IF NOT EXISTS monthly_usage_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES user_subscriptions(id) ON DELETE SET NULL,
  
  -- Período
  year INTEGER NOT NULL,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  
  -- Contadores
  total_generations INTEGER NOT NULL DEFAULT 0,
  included_generations INTEGER NOT NULL DEFAULT 0, -- Generaciones incluidas en el plan fijo
  overage_generations INTEGER NOT NULL DEFAULT 0, -- Generaciones extra (metered)
  
  -- Costos
  fixed_cost DECIMAL(10, 2) NOT NULL DEFAULT 0, -- Costo fijo del plan
  overage_cost DECIMAL(10, 2) NOT NULL DEFAULT 0, -- Costo por uso excedente
  total_cost DECIMAL(10, 2) NOT NULL DEFAULT 0, -- Costo total
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  
  -- Constraint: Una fila por usuario por mes
  CONSTRAINT unique_user_month UNIQUE (user_id, year, month)
);

-- =====================================================
-- 4. INDEXES PARA PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_polar_id ON user_subscriptions(polar_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_usage_records_user_id ON usage_records(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_records_subscription_id ON usage_records(subscription_id);
CREATE INDEX IF NOT EXISTS idx_usage_records_created_at ON usage_records(created_at);
CREATE INDEX IF NOT EXISTS idx_monthly_summary_user_id ON monthly_usage_summary(user_id);
CREATE INDEX IF NOT EXISTS idx_monthly_summary_period ON monthly_usage_summary(year, month);

-- =====================================================
-- 5. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_usage_summary ENABLE ROW LEVEL SECURITY;

-- Políticas para user_subscriptions
CREATE POLICY "Users can read own subscription"
ON user_subscriptions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscription"
ON user_subscriptions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription"
ON user_subscriptions
FOR UPDATE
USING (auth.uid() = user_id);

-- Políticas para usage_records
CREATE POLICY "Users can read own usage records"
ON usage_records
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own usage records"
ON usage_records
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Políticas para monthly_usage_summary
CREATE POLICY "Users can read own monthly summary"
ON monthly_usage_summary
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own monthly summary"
ON monthly_usage_summary
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own monthly summary"
ON monthly_usage_summary
FOR UPDATE
USING (auth.uid() = user_id);

-- =====================================================
-- 6. TRIGGERS
-- =====================================================

-- Trigger para actualizar updated_at en subscriptions
CREATE OR REPLACE FUNCTION update_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER subscriptions_updated_at
BEFORE UPDATE ON user_subscriptions
FOR EACH ROW
EXECUTE FUNCTION update_subscriptions_updated_at();

-- Trigger para actualizar updated_at en monthly_usage_summary
CREATE TRIGGER monthly_summary_updated_at
BEFORE UPDATE ON monthly_usage_summary
FOR EACH ROW
EXECUTE FUNCTION update_subscriptions_updated_at();

-- =====================================================
-- 7. FUNCIONES ÚTILES
-- =====================================================

-- Función para obtener el plan activo de un usuario
CREATE OR REPLACE FUNCTION get_user_active_subscription(p_user_id UUID)
RETURNS TABLE (
  subscription_id UUID,
  plan_type VARCHAR,
  status VARCHAR,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  polar_subscription_id VARCHAR,
  polar_customer_id VARCHAR
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    id,
    user_subscriptions.plan_type,
    user_subscriptions.status,
    user_subscriptions.current_period_start,
    user_subscriptions.current_period_end,
    user_subscriptions.polar_subscription_id,
    user_subscriptions.polar_customer_id
  FROM user_subscriptions
  WHERE user_id = p_user_id 
    AND user_subscriptions.status = 'active'
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener el uso del período actual
CREATE OR REPLACE FUNCTION get_current_period_usage(p_user_id UUID)
RETURNS TABLE (
  total_generations BIGINT,
  overage_generations BIGINT,
  total_cost NUMERIC
) AS $$
DECLARE
  v_subscription RECORD;
  v_included_limit INTEGER;
BEGIN
  -- Obtener la suscripción activa
  SELECT * INTO v_subscription
  FROM user_subscriptions
  WHERE user_id = p_user_id AND status = 'active'
  LIMIT 1;
  
  IF v_subscription IS NULL THEN
    -- Sin suscripción activa, retornar ceros
    RETURN QUERY SELECT 0::BIGINT, 0::BIGINT, 0::NUMERIC;
    RETURN;
  END IF;
  
  -- Determinar límite incluido según el plan
  CASE v_subscription.plan_type
    WHEN 'basic' THEN v_included_limit := 0;
    WHEN 'pro' THEN v_included_limit := 300;
    WHEN 'ultra' THEN v_included_limit := 1000;
    ELSE v_included_limit := 0;
  END CASE;
  
  -- Calcular el uso
  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT as total_gens,
    GREATEST(COUNT(*) - v_included_limit, 0)::BIGINT as overage_gens,
    COALESCE(SUM(ur.total_cost), 0)::NUMERIC as total
  FROM usage_records ur
  WHERE ur.user_id = p_user_id
    AND ur.billing_period_start >= v_subscription.current_period_start
    AND ur.billing_period_end <= v_subscription.current_period_end;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para verificar si un usuario puede generar outfit
CREATE OR REPLACE FUNCTION can_user_generate_outfit(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_subscription RECORD;
BEGIN
  -- Obtener la suscripción activa
  SELECT * INTO v_subscription
  FROM user_subscriptions
  WHERE user_id = p_user_id AND status = 'active'
  LIMIT 1;
  
  -- Si no tiene suscripción activa, no puede generar
  IF v_subscription IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Si tiene suscripción activa, puede generar (se cobrará según el plan)
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

