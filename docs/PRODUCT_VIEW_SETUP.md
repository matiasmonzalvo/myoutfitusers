# 🛠️ Configuración de la Vista de Producto

## Errores Corregidos

### 1. ✅ Error de Next.js 15 - Async Params
**Problema:** En Next.js 15, los `params` en rutas dinámicas ahora son una Promise y deben ser "awaited".

**Solución aplicada:**
```typescript
// ❌ Antes (causaba error)
export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = params;
  ...
}

// ✅ Ahora (correcto)
export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  ...
}
```

### 2. ⚠️ Error de Base de Datos - Constraint de event_type

**Problema:** La tabla `product_events` tiene un constraint que solo permite los valores `'worn'` y `'link_click'`, pero la aplicación intenta insertar eventos de tipo `'view'`.

**Mensaje de error:**
```
new row for relation "product_events" violates check constraint "product_events_event_type_check"
```

## 📋 Pasos para Completar la Configuración

### Paso 1: Ejecutar el Script SQL

1. Ve a tu **Supabase Dashboard**
2. Abre el **SQL Editor**
3. Ejecuta el archivo: `docs/ADD_VIEW_EVENT_TYPE.sql`

Este script hará lo siguiente:
- ✅ Actualiza el constraint para permitir eventos `'view'`
- ✅ Agrega columna `total_views` a la tabla `products`
- ✅ Actualiza la función `record_product_event()` para manejar vistas
- ✅ Actualiza todas las vistas y funciones de métricas

### Paso 2: Verificar la Configuración

Después de ejecutar el script, verifica que todo funcione:

```sql
-- Verificar que el constraint está actualizado
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conname = 'product_events_event_type_check';

-- Debería mostrar: CHECK (event_type IN ('worn', 'link_click', 'view'))
```

### Paso 3: Reiniciar el Servidor de Desarrollo

```bash
# Detén el servidor si está corriendo (Ctrl+C)
# Luego reinícialo
npm run dev
```

## 🎯 Funcionalidades Ahora Disponibles

Una vez completada la configuración, el sistema rastreará:

1. **👁️ Views (Vistas)**: Cada vez que un usuario visita la página de un producto
2. **🔗 Link Clicks**: Cuando se hace clic en "Ver producto" (link externo)
3. **👕 Worn**: Cuando un usuario viste un producto en su avatar

## 📊 Consultas de Ejemplo

```sql
-- Ver todas las vistas de un producto específico
SELECT * FROM product_events 
WHERE product_id = 'tu-product-id-aqui' 
AND event_type = 'view'
ORDER BY created_at DESC;

-- Ver métricas totales de un producto
SELECT 
  name,
  total_views,
  total_link_clicks,
  total_worn_count
FROM products
WHERE id = 'tu-product-id-aqui';

-- Ver productos más vistos en los últimos 7 días
SELECT 
  p.name,
  COUNT(*) as views
FROM product_events pe
JOIN products p ON pe.product_id = p.id
WHERE pe.event_type = 'view'
  AND pe.event_date >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY p.id, p.name
ORDER BY views DESC
LIMIT 10;
```

## ⚡ Optimizaciones Implementadas

- ✅ Índices creados para consultas rápidas
- ✅ Vistas materializadas para analytics
- ✅ Tracking asíncrono (no bloquea la UI)
- ✅ Manejo de errores silencioso (no afecta la experiencia del usuario)

## 🚨 Notas Importantes

1. **El tracking de vistas NO bloqueará la página** si falla
2. **Los eventos se registran de forma asíncrona** para mejor rendimiento
3. **Los contadores totales se actualizan automáticamente** mediante triggers
4. **Las métricas son accesibles desde el panel de admin** (si está configurado)

## 🐛 Solución de Problemas

### Si aún ves errores después de ejecutar el script:

1. **Verifica que el script se ejecutó correctamente:**
   ```sql
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'products' 
   AND column_name = 'total_views';
   ```
   Debería retornar una fila con `total_views | integer`

2. **Limpia la caché de Next.js:**
   ```bash
   rm -rf .next
   npm run dev
   ```

3. **Verifica los logs de Supabase** en el dashboard para ver errores detallados

## ✅ Checklist de Verificación

- [ ] Script SQL ejecutado en Supabase
- [ ] Constraint actualizado (permite 'view')
- [ ] Columna `total_views` agregada a `products`
- [ ] Servidor de desarrollo reiniciado
- [ ] Navegación a `/product/[id]` funciona sin errores
- [ ] Los eventos 'view' se registran correctamente en `product_events`

---

Si necesitas ayuda adicional, revisa los logs de Supabase o la consola del navegador para más detalles.

