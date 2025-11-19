# 📦 Sistema de Paquetes de Try-ons - Guía Completa

## 🎯 Resumen del Cambio

El sistema ha cambiado de **pay-per-use** (pagar $0.05 por cada try-on) a **paquetes prepagados** de try-ons.

### Antes (Pay-per-Use)
- Usuario pagaba $0.05 por cada "Wear it"
- Se cobraba automáticamente cada vez
- Sistema más complejo con Polar.sh

### Ahora (Paquetes Prepagados)
- Usuario compra paquetes de try-ons (Small: 20, Medium: 60, Large: 150)
- Cada "Wear it" consume 1 try-on del balance
- Sistema más simple y predecible
- **Excepción**: Productos de marcas verificadas (badge verde) son GRATIS

## 📊 Paquetes Disponibles

| Paquete | Try-ons | Precio | Precio/Try-on |
|---------|---------|--------|---------------|
| Small   | 20      | $2.00  | $0.100        |
| Medium  | 60      | $5.00  | $0.083        |
| Large   | 150     | $10.00 | $0.066        |

## 🚀 Implementación Completada

### 1. Base de Datos (SQL)

**Archivo**: `docs/TRYONS_PACKAGES_SETUP.sql`

#### Nuevas Tablas

**`tryons_packages`**
```sql
- id: UUID
- name: VARCHAR(50) -- 'small', 'medium', 'large'
- try_ons_count: INTEGER -- 20, 60, 150
- price_usd: DECIMAL(10, 2)
- price_per_tryon: DECIMAL(10, 3)
- is_active: BOOLEAN
```

**`package_purchases`**
```sql
- id: UUID
- user_id: UUID
- package_id: UUID
- package_name: VARCHAR(50)
- try_ons_purchased: INTEGER
- price_paid: DECIMAL(10, 2)
- payment_method: VARCHAR(50)
- payment_id: TEXT
- status: VARCHAR(20) -- 'pending', 'completed', 'failed', 'refunded'
- created_at: TIMESTAMP
```

**`tryons_usage`**
```sql
- id: UUID
- user_id: UUID
- action: VARCHAR(50)
- products_used: JSONB
- was_free: BOOLEAN
- created_at: TIMESTAMP
```

#### user_profiles Actualizado

```sql
-- Nueva columna agregada
ALTER TABLE user_profiles 
ADD COLUMN try_ons_left INTEGER DEFAULT 0;
```

#### Funciones SQL Útiles

```sql
-- Obtener try-ons restantes
SELECT get_user_tryons_left('user-uuid');

-- Usar un try-on (retorna true si exitoso)
SELECT use_tryon('user-uuid');

-- Agregar try-ons
SELECT add_tryons_to_user('user-uuid', 20);

-- Obtener estadísticas completas
SELECT * FROM get_user_tryons_stats('user-uuid');
```

### 2. Backend (APIs)

#### `/api/generate-outfit` (Modificado)

Ahora:
1. Verifica si los productos son de marcas verificadas
2. Si **TODOS** son verificados → GRATIS (no descuenta)
3. Si **AL MENOS UNO** no es verificado → Descuenta 1 try-on
4. Si no hay try-ons → Retorna error 402 (Payment Required)

```typescript
// Respuesta cuando no hay try-ons
{
  error: "You don't have any try-ons left. Please purchase a package to continue.",
  code: "NO_TRYONS_LEFT"
}
// Status: 402
```

#### `/api/billing/info` (Completamente Reescrito)

Retorna:
```typescript
{
  try_ons_left: number,
  stats: {
    try_ons_left: number,
    total_purchased: number,
    total_used: number,
    total_spent: number,
    last_purchase_date: string | null
  },
  recent_purchases: PackagePurchase[],
  recent_usage: TryonsUsage[],
  available_packages: TryonsPackage[]
}
```

### 3. Frontend

#### `/billing` (Página Completamente Nueva)

Muestra:
- **Try-ons Balance** (Grande y prominente)
- **Estadísticas**: Total comprado, usado, gastado
- **Paquetes Disponibles**: Cards de Small, Medium, Large
- **Historial de Compras**: Tabla con todas las compras
- **Historial de Uso**: Últimos 30 días con indicador FREE/PAID

#### `/pricing` (Ya Actualizada por Ti)

Muestra los 3 paquetes con su información.

### 4. TypeScript Types

**Archivo**: `lib/types/billing.ts`

```typescript
export interface TryonsPackage {
  id: string;
  name: string;
  try_ons_count: number;
  price_usd: number;
  price_per_tryon: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PackagePurchase {
  id: string;
  user_id: string;
  package_id: string;
  package_name: string;
  try_ons_purchased: number;
  price_paid: number;
  payment_method: string | null;
  payment_id: string | null;
  status: "pending" | "completed" | "failed" | "refunded";
  created_at: string;
}

export interface TryonsUsage {
  id: string;
  user_id: string;
  action: string;
  products_used: string[] | null;
  was_free: boolean;
  created_at: string;
}

export interface UserTryonsStats {
  try_ons_left: number;
  total_purchased: number;
  total_used: number;
  total_spent: number;
  last_purchase_date: string | null;
}

export interface BillingDashboard {
  try_ons_left: number;
  stats: UserTryonsStats;
  recent_purchases: PackagePurchase[];
  recent_usage: TryonsUsage[];
  available_packages: TryonsPackage[];
}
```

## 🔄 Flujo de Usuario

### Flujo Normal (Productos NO Verificados)

```
1. Usuario selecciona productos (badge azul)
2. Click en "Wear it"
3. Sistema verifica try_ons_left en user_profiles
4. Si try_ons_left > 0:
   - Genera outfit
   - Descuenta 1 try-on
   - Registra en tryons_usage (was_free: false)
5. Si try_ons_left = 0:
   - Retorna error 402
   - Frontend muestra mensaje: "Buy more try-ons"
```

### Flujo Gratis (Productos Verificados)

```
1. Usuario selecciona productos (badge verde)
2. Click en "Wear it"
3. Sistema verifica que TODOS sean verificados
4. Genera outfit SIN descontar try-ons
5. Registra en tryons_usage (was_free: true)
```

### Flujo de Compra (Pendiente de Implementar)

```
1. Usuario va a /pricing
2. Selecciona un paquete (Small/Medium/Large)
3. Click en "Buy Now" → Redirige a Polar/Stripe
4. Pago exitoso → Webhook
5. Backend:
   - Inserta en package_purchases
   - Agrega try-ons a user_profiles.try_ons_left
6. Usuario puede usar sus try-ons
```

## 📝 Pasos para Activar

### 1. Ejecutar SQL en Supabase

```sql
-- En SQL Editor de Supabase
-- Ejecuta todo el contenido de:
docs/TRYONS_PACKAGES_SETUP.sql
```

Este script:
- ✅ Crea las nuevas tablas
- ✅ Agrega `try_ons_left` a `user_profiles`
- ✅ Elimina las tablas antiguas del sistema pay-per-use
- ✅ Crea funciones útiles
- ✅ Configura RLS policies

### 2. (Opcional) Dar Try-ons de Bienvenida

```sql
-- Dar 3 try-ons gratis a todos los usuarios existentes
UPDATE user_profiles 
SET try_ons_left = 3 
WHERE try_ons_left = 0;
```

### 3. Verificar que Todo Funcione

```sql
-- Ver paquetes disponibles
SELECT * FROM tryons_packages WHERE is_active = true;

-- Ver un usuario específico
SELECT 
  id,
  username,
  try_ons_left
FROM user_profiles 
WHERE id = 'tu-uuid-aqui';

-- Ver estadísticas de un usuario
SELECT * FROM get_user_tryons_stats('tu-uuid-aqui');
```

## 🧪 Testing

### Test 1: Verificar Try-ons Iniciales

```sql
-- Dar try-ons a tu usuario de prueba
UPDATE user_profiles 
SET try_ons_left = 10 
WHERE username = 'tu-username';
```

### Test 2: Probar Generate Outfit

1. Selecciona productos (no verificados)
2. Click "Wear it"
3. Verifica que se descontó 1 try-on:

```sql
SELECT try_ons_left FROM user_profiles WHERE username = 'tu-username';
```

### Test 3: Probar Productos Gratis

1. Marca una marca como verificada:

```sql
UPDATE brands 
SET is_verified_brand = true 
WHERE brand_username = 'nike';
```

2. Selecciona SOLO productos de esa marca
3. Click "Wear it"
4. Verifica que NO se descontó try-on:

```sql
SELECT try_ons_left FROM user_profiles WHERE username = 'tu-username';
-- Debería ser el mismo número
```

### Test 4: Sin Try-ons

1. Pon try-ons en 0:

```sql
UPDATE user_profiles 
SET try_ons_left = 0 
WHERE username = 'tu-username';
```

2. Intenta "Wear it"
3. Deberías ver error: "You don't have any try-ons left"

## 💡 Próximos Pasos (Para Implementar)

### 1. Integración de Pagos

Necesitas decidir el proveedor:
- **Stripe**: Más popular, fácil de integrar
- **Polar.sh**: Ya tienes configurado
- **PayPal**: Alternativa

### 2. Crear API de Compra

```typescript
// app/api/packages/purchase/route.ts
POST /api/packages/purchase
Body: {
  package_id: string,
  payment_method: string,
  payment_id: string
}
```

### 3. Webhooks

Para recibir confirmación de pago y agregar try-ons automáticamente.

### 4. UI de Compra

Mejorar la página `/pricing` con:
- Botones de compra reales
- Integración con Stripe/Polar
- Loading states
- Success/Error messages

## 📊 Consultas Útiles

```sql
-- Ver top usuarios por try-ons usados
SELECT 
  up.username,
  up.try_ons_left,
  COUNT(tu.id) as total_used
FROM user_profiles up
LEFT JOIN tryons_usage tu ON tu.user_id = up.id
GROUP BY up.id, up.username, up.try_ons_left
ORDER BY total_used DESC
LIMIT 10;

-- Ver revenue total
SELECT 
  SUM(price_paid) as total_revenue,
  COUNT(*) as total_purchases,
  SUM(try_ons_purchased) as total_tryons_sold
FROM package_purchases
WHERE status = 'completed';

-- Ver uso gratis vs pagado
SELECT 
  was_free,
  COUNT(*) as total_uses,
  CASE 
    WHEN was_free THEN 'FREE (Verified Brands)'
    ELSE 'PAID (Regular Products)'
  END as type
FROM tryons_usage
GROUP BY was_free;
```

## ⚠️ Diferencias Clave vs Sistema Anterior

| Aspecto | Antes (Pay-per-Use) | Ahora (Paquetes) |
|---------|---------------------|------------------|
| **Modelo** | Pagar por cada uso | Comprar paquetes prepagados |
| **Precio** | $0.05 fijo | $0.066 - $0.100 (según paquete) |
| **Usuario** | Paga después de usar | Paga antes de usar |
| **Tracking** | user_billing con total_spent | try_ons_left en perfil |
| **Complejidad** | Alta (Polar, webhooks, etc.) | Media (más simple) |
| **Predictibilidad** | Menos predecible | Muy predecible |
| **UX** | "¿Cuánto voy a pagar?" | "¿Cuántos me quedan?" |

## 🎉 Beneficios del Nuevo Sistema

1. **Más Simple**: Los usuarios saben exactamente cuántos try-ons tienen
2. **Mejor UX**: No hay sorpresas en el cobro
3. **Incentiva Compra Anticipada**: Paquetes grandes son más baratos
4. **Más Revenue**: Los usuarios compran en bulk
5. **Menos Infraestructura**: No necesitas webhooks complejos de pago recurrente

---

**El sistema está listo para usar!** Solo falta implementar la parte de pagos (Stripe/Polar). 🚀



