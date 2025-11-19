# 📡 Eventos de Webhook de Polar.sh

## Eventos Disponibles en Polar

Polar.sh ofrece muchos eventos de webhook. Aquí están los más relevantes para nuestro sistema de try-ons:

## ✅ Eventos que USAMOS

### `order.created`

**Cuándo se dispara**: Cuando se crea una orden exitosa (pago completado)

**Uso en nuestra app**: Este es el evento PRINCIPAL que usamos para agregar try-ons al usuario.

**Datos importantes**:

```typescript
{
  type: "order.created",
  data: {
    id: "order_id",
    status: "paid", // Verificar que esté "paid"
    paid: true,
    customer_id: "polar_customer_id", // ⚠️ Este es el ID interno de Polar
    product_id: "product_id",
    total_amount: 200, // Precio en centavos ($2.00)
    currency: "usd",
    metadata: {
      user_id: "tu_user_id_de_supabase", // ✅ Aquí está nuestro user ID real
      username: "johndoe"
    },
    customer: {
      id: "polar_customer_id",
      email: "user@example.com",
      external_id: "opcional", // Si lo configuras
      // ... más campos
    },
    product: { /* datos del producto */ },
    items: [ /* line items */ ],
    // ... más campos
  }
}
```

**🔑 IMPORTANTE**: Para identificar al usuario correcto:

1. Usamos `order.metadata.user_id` (lo enviamos al crear el checkout)
2. Fallback a `order.customer.external_id` (si Polar lo guarda)
3. Último fallback a `order.customer_id` (ID de Polar, menos confiable)

**Acción**: Agrega los try-ons correspondientes al usuario.

---

### `order.refunded`

**Cuándo se dispara**: Cuando se reembolsa una orden

**Uso potencial**: Restar try-ons del usuario si se reembolsa

**Estado actual**: Registramos el evento en logs, pero NO restamos try-ons automáticamente (decisión de negocio).

---

## 📋 Otros Eventos Disponibles (no los usamos ahora)

### Eventos de Checkout

- `checkout.created` - Se crea una sesión de checkout (usuario aún no pagó)
- `checkout.updated` - Se actualiza el checkout

**Por qué NO los usamos**: Estos eventos ocurren ANTES del pago. No queremos agregar try-ons hasta que el pago esté confirmado.

---

### Eventos de Customer

- `customer.created` - Nuevo cliente en Polar
- `customer.updated` - Se actualiza info del cliente
- `customer.deleted` - Se elimina un cliente
- `customer.state_changed` - Cambia el estado del cliente

**Por qué NO los usamos**: Manejamos usuarios directamente en Supabase, no necesitamos sincronizar desde Polar.

---

### Eventos de Order

- `order.updated` - Se actualiza una orden
- `order.paid` - ⚠️ Similar a `order.created` pero se dispara después

**Nota sobre `order.paid`**: Podrías usar este evento en lugar de `order.created`, pero `order.created` es suficiente para nuestro caso.

---

### Eventos de Subscription

- `subscription.created`
- `subscription.updated`
- `subscription.active`
- `subscription.canceled`
- `subscription.uncanceled`
- `subscription.revoked`

**Por qué NO los usamos**: Por ahora vendemos paquetes únicos (one-time purchase), no suscripciones recurrentes. Si en el futuro ofreces suscripciones mensuales, estos eventos serían útiles.

---

### Eventos de Refund

- `refund.created` - Se crea un reembolso
- `refund.updated` - Se actualiza el reembolso

**Por qué NO los usamos**: `order.refunded` es suficiente para nuestro caso.

---

### Eventos de Product y Benefit

- `product.created`, `product.updated`
- `benefit.created`, `benefit.updated`
- `benefit_grant.created`, `benefit_grant.cycled`, etc.

**Por qué NO los usamos**: No necesitamos sincronizar productos desde Polar, los manejamos en nuestro código.

---

## 🎯 Configuración Recomendada

Para el sistema actual de try-ons, configura tu webhook en Polar con ÚNICAMENTE estos eventos:

1. ✅ **`order.created`** (obligatorio)
2. ✅ **`order.refunded`** (opcional, recomendado)

**No necesitas más eventos por ahora.**

---

## 🔮 Eventos Futuros

Si en el futuro quieres implementar:

### Suscripciones Mensuales

Agregar:

- `subscription.created`
- `subscription.active`
- `subscription.canceled`

### Sistema de Beneficios

Agregar:

- `benefit_grant.created`
- `benefit_grant.revoked`

### Sincronización de Clientes

Agregar:

- `customer.created`
- `customer.updated`

---

## 📊 Flujo de Eventos en Nuestro Sistema

```
Usuario hace click en "Small Package" ($2)
  ↓
Creamos checkout session via API
  ↓
Usuario redirigido a Polar.sh
  ↓
[Polar dispara: checkout.created] ← NO lo escuchamos
  ↓
Usuario completa pago en Polar
  ↓
[Polar dispara: order.created] ← ✅ ESCUCHAMOS ESTE
  ↓
Nuestro webhook recibe el evento
  ↓
Verificamos product_id
  ↓
Agregamos try-ons al usuario
  ↓
Registramos compra en DB
  ↓
Usuario redirigido a /success
  ↓
Usuario puede usar sus try-ons ✨
```

---

## 🧪 Testing de Eventos

### Ver qué eventos dispara Polar

En el dashboard de Polar:

1. **Settings → Webhooks**
2. Click en tu webhook
3. Ve la pestaña **"Events"** o **"Deliveries"**
4. Verás todos los eventos enviados con sus payloads

### Simular eventos localmente

```bash
# Con ngrok corriendo
ngrok http 3000

# En otra terminal, simula un evento
curl -X POST https://tu-url.ngrok.io/api/webhooks/polar \
  -H "Content-Type: application/json" \
  -d '{
    "type": "order.created",
    "data": {
      "id": "test_order_123",
      "customer_id": "tu-user-id-de-supabase",
      "product_id": "21399a3c-4887-4027-befa-3fed1e0f86fd",
      "amount": 200,
      "currency": "usd"
    }
  }'
```

---

## 💡 Tips

1. **Idempotencia**: Polar puede enviar el mismo evento múltiples veces. Considera guardar el `order_id` en tu DB y verificar que no lo hayas procesado antes.

2. **Retries**: Si tu webhook retorna error (status 4xx o 5xx), Polar reintentará enviar el evento.

3. **Timeout**: Polar espera respuesta en ~30 segundos. Si tu procesamiento toma más, considera hacerlo async.

4. **Logs**: Siempre loguea los eventos recibidos para debugging.

---

**Resumen**: Solo necesitas escuchar `order.created` para que el sistema funcione perfectamente. 🚀
