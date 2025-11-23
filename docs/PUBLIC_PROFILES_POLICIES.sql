-- =====================================================
-- POLÍTICAS PÚBLICAS PARA PERFILES Y OUTFITS
-- =====================================================
-- Este script actualiza las políticas RLS para permitir
-- lectura pública de perfiles y outfits de usuarios
-- =====================================================

-- =====================================================
-- 1. POLÍTICAS PARA USER_PROFILES (Lectura Pública)
-- =====================================================

-- Eliminar la política antigua de lectura (solo propio perfil)
DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;

-- Crear nueva política: Todos pueden leer perfiles públicos
CREATE POLICY "Anyone can read public profiles"
ON user_profiles
FOR SELECT
USING (true);

-- Las demás políticas siguen igual (insert, update, delete solo el dueño)

-- =====================================================
-- 2. POLÍTICAS PARA OUTFITS (Lectura Pública)
-- =====================================================

-- Eliminar la política antigua de lectura (solo propios outfits)
DROP POLICY IF EXISTS "Users can read own outfits" ON outfits;

-- Crear nueva política: Todos pueden leer outfits de cualquier usuario
CREATE POLICY "Anyone can read outfits"
ON outfits
FOR SELECT
USING (true);

-- Las demás políticas siguen igual (insert, update, delete solo el dueño)

-- =====================================================
-- 3. POLÍTICAS PARA AVATAR_HISTORY (Lectura Pública)
-- =====================================================

-- Eliminar la política antigua de lectura (solo propio historial)
DROP POLICY IF EXISTS "Users can view their own avatar history" ON avatar_history;

-- Crear nueva política: Todos pueden leer el historial de avatares
CREATE POLICY "Anyone can read avatar history"
ON avatar_history
FOR SELECT
USING (true);

-- Las demás políticas siguen igual (insert, update, delete solo el dueño)

-- =====================================================
-- VERIFICAR POLÍTICAS
-- =====================================================
-- Ejecuta esto para verificar que las políticas están correctas:

SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename IN ('user_profiles', 'outfits', 'avatar_history')
ORDER BY tablename, policyname;

