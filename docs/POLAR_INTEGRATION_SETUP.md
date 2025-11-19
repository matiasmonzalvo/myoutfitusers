# 🎯 Integración de Polar.sh - Guía Completa

## ✅ Lo que se ha Implementado

### 1. API Route para Crear Checkout Session

**Archivo**: `app/api/checkout/create-session/route.ts`

Esta ruta:

- Recibe el `product_id` de Polar.sh
- Crea una checkout session usando el SDK de Polar
- Usa el `user.id` como `customer_id` para reconciliación
- Retorna la URL del checkout para redirigir al usuario

### 2. Página de Pricing Actualizada

**Archivo**: `app/pricing/page.tsx`

Ahora incluye:

- Product ID de Polar para el paquete Small ($2)
- Función `handlePurchase()` que crea checkout session y redirige
- Loading states mientras se crea la sesión
- Indicador de "Coming soon" para paquetes sin Product ID

### 3. Página de Success

**Archivo**: `app/success/page.tsx`

Muestra:

- Confirmación de pago exitoso
- Botón para empezar a usar try-ons
- Botón para ver balance
- Checkout ID para referencia

### 4. Webhook Handler

**Archivo**: `app/api/webhooks/polar/route.ts`

Procesa:

- `order.created` - Cuando se completa un pago exitoso
- Verifica que `status === "paid"`
- Extrae `user_id` de `metadata` (más confiable)
- Registra la compra en `package_purchases`
- Actualiza `user_profiles.try_ons_left`

## 🚀 Configuración Paso a Paso

### Paso 1: Variables de Entorno

Ya tienes en tu `.env.local`:

```env
POLAR_ACCESS_TOKEN=tu_token_sandbox
POLAR_SUCCESS_URL=http://localhost:3000/success?checkout_id={CHECKOUT_ID}
```

Necesitas agregar:

```env
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
```

**⚠️ IMPORTANTE - Sandbox vs Production:**

- **Para Testing (Sandbox)**: Usa el token de tu organización en **Sandbox** de Polar
  - Crea el token en: `https://sandbox.polar.sh/dashboard/tu-org/settings`
  - El SDK automáticamente usará: `https://sandbox-api.polar.sh/v1`
- **Para Producción**: Cambia el token y actualiza el código:
  - Token de: `https://polar.sh/dashboard/tu-org/settings`
  - En `app/api/checkout/create-session/route.ts` cambia `server: "sandbox"` a `server: "production"` (o elimínalo)

**Dónde encontrar el Service Role Key de Supabase:**

1. Ve a tu proyecto en Supabase
2. Settings → API
3. Copia el `service_role` key (NO el `anon` key)

### Paso 2: Ejecutar el SQL

Si no lo has hecho:

```sql
-- En Supabase SQL Editor, ejecuta:
docs/TRYONS_PACKAGES_SETUP.sql
```

### Paso 3: Configurar Webhook en Polar.sh

**⚠️ IMPORTANTE**: Configura el webhook en el entorno correcto:

- **Sandbox**: `https://sandbox.polar.sh/dashboard/tu-org/settings/webhooks`
- **Production**: `https://polar.sh/dashboard/tu-org/settings/webhooks`

1. **Ve a Polar.sh Dashboard** (Sandbox o Production según tu entorno)
2. **Settings → Webhooks**
3. **Add Webhook**:
   - **URL**: `https://tudominio.com/api/webhooks/polar` (producción)
   - **URL Local** (testing): Usa ngrok o similar
   - **Events**: Selecciona estos eventos:
     - ✅ **`order.created`** (cuando se completa un pago)
     - ✅ **`order.refunded`** (opcional, para manejar reembolsos)
   - **Secret**: Guárdalo (opcional pero recomendado)

<Warning>
Los webhooks de **Sandbox** y **Production** son independientes. Necesitas configurarlos por separado en cada entorno.
</Warning>

#### Testing Local con ngrok

```bash
# Instala ngrok si no lo tienes
npm install -g ngrok

# Inicia tu app
npm run dev

# En otra terminal, expone el puerto 3000
ngrok http 3000

# Copia la URL de ngrok (ej: https://abc123.ngrok.io)
# En Polar webhook URL pon: https://abc123.ngrok.io/api/webhooks/polar
```

### Paso 4: Crear los otros Productos en Polar.sh

Actualmente solo tienes el producto de $2. Para los otros:

1. **Ve a Polar.sh Dashboard**
2. **Products → Create Product**

**Medium Package ($5, 60 try-ons):**

- Name: "Medium Try-ons Package"
- Price: $5.00
- Description: "60 try-ons to use on the platform"

**Large Package ($10, 150 try-ons):**

- Name: "Large Try-ons Package"
- Price: $10.00
- Description: "150 try-ons to use on the platform"

3. **Copia los Product IDs**
4. **Actualiza `app/pricing/page.tsx`:**

```typescript
const tryOnPacks = [
  {
    name: "Small",
    price: "$2",
    tryOns: 20,
    pricePerTryOn: "$0.1",
    popular: false,
    polarProductId: "211d365b-b5de-4072-8690-1b25fd97ad3d",
  },
  {
    name: "Medium",
    price: "$5",
    tryOns: 60,
    pricePerTryOn: "$0.083",
    popular: true,
    polarProductId: "ccd87a31-f6ba-44b7-989d-1effa9de9437",
  },
  {
    name: "Large",
    price: "$10",
    tryOns: 150,
    pricePerTryOn: "$0.066",
    popular: false,
    polarProductId: "9b883ae1-b120-4226-ad88-2ca5f19d3078",
  },
];
```

5. **Actualiza el webhook handler** en `app/api/webhooks/polar/route.ts`:

```typescript
const packageMapping: Record<
  string,
  { name: string; tryOns: number; price: number }
> = {
  "211d365b-b5de-4072-8690-1b25fd97ad3d": {
    name: "small",
    tryOns: 20,
    price: 2.0,
  },
  "ccd87a31-f6ba-44b7-989d-1effa9de9437": {
    name: "medium",
    tryOns: 60,
    price: 5.0,
  },
  "9b883ae1-b120-4226-ad88-2ca5f19d3078": {
    name: "large",
    tryOns: 150,
    price: 10.0,
  },
};
```

## 🧪 Testing

### Test 1: Crear Checkout Session

1. Ve a `/pricing`
2. Click en el paquete "Small"
3. Deberías ser redirigido a Polar checkout
4. Completa el pago (usa modo test)
5. Deberías regresar a `/success?checkout_id=...`

### Test 2: Verificar Try-ons Agregados

```sql
-- Después de completar un pago, verifica:
SELECT username, try_ons_left
FROM user_profiles
WHERE username = 'tu-username';

-- Deberías ver +20 try-ons
```

### Test 3: Verificar Compra Registrada

```sql
SELECT * FROM package_purchases
WHERE user_id = 'tu-user-id'
ORDER BY created_at DESC;
```

### Test 4: Usar un Try-on

1. Ve a la app principal
2. Selecciona productos (no verificados)
3. Click "Wear it"
4. Deberías tener 19 try-ons restantes

```sql
SELECT try_ons_left FROM user_profiles WHERE id = 'tu-user-id';
-- Debería mostrar 19
```

## 🔍 Monitoreo

### Ver Logs del Webhook

```bash
# Durante desarrollo
npm run dev

# Los logs del webhook aparecerán en la consola cuando Polar envíe eventos
```

### Ver Estado de Webhooks en Polar

1. Polar Dashboard → Webhooks
2. Click en tu webhook
3. Ve el historial de entregas y respuestas

### Consultas SQL Útiles

```sql
-- Ver todas las compras
SELECT
  pp.*,
  up.username
FROM package_purchases pp
JOIN user_profiles up ON up.id = pp.user_id
ORDER BY pp.created_at DESC;

-- Ver balance de try-ons de todos los usuarios
SELECT
  username,
  try_ons_left,
  (SELECT SUM(try_ons_purchased) FROM package_purchases WHERE user_id = up.id AND status = 'completed') as total_purchased
FROM user_profiles up
ORDER BY try_ons_left DESC;

-- Ver revenue total
SELECT
  SUM(price_paid) as total_revenue,
  COUNT(*) as total_purchases,
  AVG(price_paid) as avg_purchase
FROM package_purchases
WHERE status = 'completed';
```

## 🔐 Seguridad

### Validar Webhooks (Recomendado)

Polar envía un header `X-Polar-Signature` para verificar que el webhook viene realmente de Polar:

```typescript
// En app/api/webhooks/polar/route.ts
import crypto from "crypto";

export async function POST(request: Request) {
  // Obtener el signature header
  const signature = request.headers.get("x-polar-signature");
  const body = await request.text();

  // Verificar signature
  const secret = process.env.POLAR_WEBHOOK_SECRET!;
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");

  if (signature !== expectedSignature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(body);
  // ... resto del código
}
```

### Variables de Entorno en Producción

Cuando despliegues a producción:

```env
# .env.production
POLAR_ACCESS_TOKEN=tu_token_de_produccion
POLAR_SUCCESS_URL=https://tudominio.com/success?checkout_id={CHECKOUT_ID}
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
POLAR_WEBHOOK_SECRET=tu_webhook_secret (opcional)
```

## ⚠️ Troubleshooting

### "Authentication required" al crear checkout

**Problema**: El usuario no está autenticado  
**Solución**: Asegúrate de estar logged in antes de comprar

### Webhook no se dispara

**Problema**: Los try-ons no se agregan después del pago  
**Solución**:

1. Verifica que la URL del webhook esté correcta en Polar
2. Revisa los logs de Polar para ver si hay errores
3. Si estás en local, asegúrate de tener ngrok corriendo

### "Package not found" en webhook

**Problema**: El nombre del paquete no coincide  
**Solución**: Verifica que el mapping en el webhook usa los nombres exactos de la tabla `tryons_packages` ('small', 'medium', 'large')

### Try-ons no se actualizan

**Problema**: El webhook se ejecuta pero no actualiza el perfil  
**Solución**:

1. Verifica que `SUPABASE_SERVICE_ROLE_KEY` esté configurado
2. Revisa los logs del webhook
3. Verifica RLS policies en Supabase

## 📈 Próximos Pasos

1. **Emails de Confirmación**
   - Enviar email cuando se complete una compra
   - Recordatorio cuando queden pocos try-ons

2. **Descuentos y Promociones**
   - Códigos de descuento para primeros usuarios
   - Ofertas especiales en paquetes grandes

3. **Analytics**
   - Dashboard de métricas de venta
   - Conversión rate
   - Paquete más popular

4. **Referral Program**
   - Dar try-ons gratis por referir amigos
   - Tracking de referidos

---

**¡El sistema está listo para usar!** 🚀

Ahora cuando un usuario:

1. Click en un paquete → Redirige a Polar
2. Completa el pago → Polar envía webhook
3. Webhook agrega try-ons → Usuario puede usarlos inmediatamente
