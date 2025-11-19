# 💰 Sistema de Billing Pay-per-Use con Polar.sh

Este documento explica cómo funciona el sistema de facturación por uso implementado en la aplicación.

## 📋 Resumen

- **Modelo de pricing**: Pay-per-Use (Pago por uso)
- **Costo**: $0.05 USD por cada generación de outfit
- **Proveedor de pagos**: Polar.sh
- **Base de datos**: Supabase

## 🚀 Configuración Inicial

### 1. Ejecutar el Script SQL en Supabase

1. Abre el **SQL Editor** en tu panel de Supabase
2. Ejecuta el archivo completo `docs/BILLING_SETUP.sql`
3. Esto creará:
   - Tabla `user_usage` para rastrear cada uso
   - Tabla `user_billing` para información de facturación
   - Triggers automáticos para actualizar totales
   - Funciones SQL para consultas
   - Políticas RLS (Row Level Security)
   - **Migración automática** de usuarios existentes

### 2. Configurar Polar.sh

#### 2.1. Crear una Cuenta en Polar.sh

1. Ve a [polar.sh](https://polar.sh)
2. Crea una cuenta o inicia sesión
3. Ve a **Settings** → **API Keys**
4. Copia tu **Access Token**

#### 2.2. Crear el Producto en Polar.sh

1. En el dashboard de Polar, ve a **Products**
2. Crea un nuevo producto:
   - **Name**: "Outfit Generation" o "Generación de Outfit"
   - **Description**: "Generación de outfit virtual con IA"
   - **Pricing Type**: **Usage-based** (Basado en uso)
   - **Price per unit**: $0.05
   - **Billing Period**: Monthly (mensual)

3. Configura el **Usage Meter**:
   - **Meter Name**: `generate_outfit`
   - **Unit**: "generation" o "generación"
   - **Aggregation**: Sum (suma)

4. Guarda el **Product ID** (lo necesitarás más adelante)

#### 2.3. Configurar Variables de Entorno

Agrega estas variables a tu archivo `.env.local`:

```env
# Polar.sh Configuration
POLAR_ACCESS_TOKEN=tu_access_token_aquí
POLAR_SUCCESS_URL=http://localhost:3000/success?checkout_id={CHECKOUT_ID}
POLAR_PRODUCT_ID=tu_product_id_aquí

# (En producción, actualiza la URL)
# POLAR_SUCCESS_URL=https://tudominio.com/success?checkout_id={CHECKOUT_ID}
```

### 3. Verificar que las Tablas estén Pobladas

Después de ejecutar el script SQL, verifica en Supabase:

1. Ve a **Table Editor**
2. Busca la tabla `user_billing`
3. Deberías ver un registro por cada usuario existente en `user_profiles`
4. Si está vacía, ejecuta manualmente:

```sql
INSERT INTO user_billing (user_id, payment_status)
SELECT id, 'active'
FROM user_profiles
WHERE id NOT IN (SELECT user_id FROM user_billing);
```

## 🔄 Cómo Funciona

### Flujo de Usuario

1. **Registro/Onboarding**
   - El usuario se registra y completa el onboarding
   - Se crea automáticamente un registro en `user_profiles`
   - **TRIGGER AUTOMÁTICO**: Se crea un registro en `user_billing` con status "active"

2. **Uso de la Aplicación**
   - El usuario selecciona productos y hace clic en "Wear It"
   - Se ejecuta `/api/generate-outfit`
   - Se genera el outfit con IA
   - **AUTOMÁTICAMENTE** se registra en `user_usage`:
     - `action: "generate_outfit"`
     - `cost: 0.05`
     - `metadata: { products_count, product_ids }`
   - **TRIGGER AUTOMÁTICO**: Se actualiza `user_billing.total_spent`

3. **Visualización de Billing**
   - El usuario puede ir a `/billing` para ver:
     - Total gastado
     - Uso del mes actual
     - Historial de los últimos 30 días
     - Estadísticas de uso

### Estructura de Datos

#### Tabla `user_usage`
```sql
- id: UUID (PK)
- user_id: UUID (FK → auth.users)
- action: VARCHAR(50) -- 'generate_outfit'
- cost: DECIMAL(10, 2) -- 0.05
- polar_event_id: TEXT -- Para integración con Polar
- metadata: JSONB -- Información adicional
- created_at: TIMESTAMP
```

#### Tabla `user_billing`
```sql
- id: UUID (PK)
- user_id: UUID (FK → auth.users, UNIQUE)
- polar_customer_id: TEXT
- polar_subscription_id: TEXT
- total_spent: DECIMAL(10, 2) -- Actualizado automáticamente
- last_payment_date: TIMESTAMP
- payment_status: VARCHAR(20) -- 'active', 'suspended', 'cancelled'
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

## 🛠️ Endpoints de API

### `/api/generate-outfit` (POST)
- **Función**: Genera un outfit y registra el uso
- **Tracking**: Automático al finalizar la generación
- **Costo**: $0.05 por llamada exitosa

### `/api/usage/track` (POST)
- **Función**: Registra manualmente un evento de uso
- **Body**: 
  ```json
  {
    "action": "generate_outfit",
    "metadata": { "products_count": 2 }
  }
  ```

### `/api/billing/info` (GET)
- **Función**: Obtiene información de billing del usuario
- **Respuesta**:
  ```json
  {
    "billing": { ... },
    "usage_stats": {
      "total_count": 10,
      "total_spent": 0.50,
      "this_month_count": 5,
      "this_month_spent": 0.25,
      "last_30_days": [ ... ]
    }
  }
  ```

### `/api/checkout` (GET)
- **Función**: Inicia el proceso de checkout con Polar.sh
- **Uso**: Para configurar método de pago (implementación futura)

## 📊 Página de Billing (`/billing`)

Muestra al usuario:
- 💵 **Total Gastado**: Suma de todo el uso histórico
- 📅 **Este Mes**: Uso y gasto del mes actual
- 📈 **Promedio por Uso**: $0.05 fijo
- 🕐 **Últimos 30 Días**: Conteo de uso
- 📜 **Historial**: Lista detallada de cada generación

## 🔐 Seguridad

### Row Level Security (RLS)

Todas las tablas tienen RLS habilitado:

- Los usuarios **solo pueden leer** su propio `user_usage`
- Los usuarios **solo pueden leer** su propio `user_billing`
- Los usuarios **no pueden modificar** directamente los registros
- Solo los triggers del servidor pueden insertar/actualizar

### Políticas Implementadas

```sql
-- user_usage
- "Users can read own usage" (SELECT)

-- user_billing  
- "Users can read own billing" (SELECT)
- "Users can update own billing" (UPDATE)
```

## 🧪 Testing

### 1. Probar el Tracking Manual

```bash
curl -X POST http://localhost:3000/api/usage/track \
  -H "Content-Type: application/json" \
  -d '{
    "action": "generate_outfit",
    "metadata": { "test": true }
  }'
```

### 2. Verificar en Supabase

```sql
-- Ver todo el uso
SELECT * FROM user_usage ORDER BY created_at DESC;

-- Ver billing
SELECT * FROM user_billing;

-- Verificar que los totales coinciden
SELECT 
  ub.user_id,
  ub.total_spent,
  (SELECT SUM(cost) FROM user_usage WHERE user_id = ub.user_id) as calculated_total
FROM user_billing ub;
```

### 3. Probar la Página de Billing

1. Inicia sesión en la aplicación
2. Ve a `/billing`
3. Genera algunos outfits
4. Refresca la página de billing
5. Deberías ver los nuevos usos reflejados

## 📝 Próximos Pasos (Implementación Futura)

1. **Integración Completa con Polar.sh**
   - Configurar webhooks de Polar
   - Sincronizar eventos de uso con Polar
   - Gestionar pagos automáticos

2. **Límites y Cuotas**
   - Implementar límite de uso gratuito
   - Requerir método de pago después de X generaciones
   - Suspender servicio si no hay método de pago

3. **Notificaciones**
   - Email cuando alcance ciertos umbrales de gasto
   - Alertas de pago pendiente
   - Resumen mensual de uso

4. **Dashboard de Admin**
   - Ver todos los usuarios y su uso
   - Estadísticas globales
   - Gestión de facturación

## 🐛 Troubleshooting

### Las tablas están vacías

**Solución**: Ejecuta el script de migración:
```sql
INSERT INTO user_billing (user_id, payment_status)
SELECT id, 'active'
FROM user_profiles
WHERE id NOT IN (SELECT user_id FROM user_billing);
```

### No se registra el uso

**Verificar**:
1. Que el usuario esté autenticado
2. Que exista en `user_billing`
3. Que RLS esté configurado correctamente
4. Revisar logs de la consola del servidor

### Los totales no coinciden

**Solución**: Recalcular totales manualmente:
```sql
UPDATE user_billing ub
SET total_spent = (
  SELECT COALESCE(SUM(cost), 0)
  FROM user_usage
  WHERE user_id = ub.user_id
);
```

## 📞 Soporte

Para más información sobre Polar.sh:
- [Documentación de Polar](https://docs.polar.sh)
- [Guía de Usage-Based Billing](https://docs.polar.sh/features/usage-based-billing)

---

**Última actualización**: 16 de Noviembre, 2025






