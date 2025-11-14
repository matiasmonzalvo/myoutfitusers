# 📊 Implementación de Nuevas Métricas de Productos

## Resumen

Se han agregado **3 nuevas métricas** al sistema de tracking de productos:

1. **`product_view`** - Vista de Producto: Se registra cada vez que un usuario visita la página de detalle de un producto (`/product/[id]`)

2. **`outfit_downloaded`** - Outfit Descargado: Se registra para cada producto que forma parte de un outfit cuando el usuario descarga la imagen

3. **`outfit_saved`** - Outfit Guardado: Se registra para cada producto que forma parte de un outfit cuando el usuario guarda el outfit en su colección

---

## 🗄️ Paso 1: Ejecutar el Script SQL en Supabase

### Instrucciones:

1. Ve a tu proyecto de Supabase
2. Abre el **SQL Editor**
3. Copia y pega el contenido del archivo `PRODUCT_METRICS_SETUP_UPDATE.sql`
4. Ejecuta el script

### ¿Qué hace este script?

- ✅ Agrega 3 nuevas columnas a la tabla `products`:
  - `total_product_views`
  - `total_outfit_downloads`
  - `total_outfit_saves`

- ✅ Actualiza la función `record_product_event()` para manejar los nuevos tipos de eventos

- ✅ Actualiza el constraint de `product_events` para permitir los nuevos tipos de eventos

- ✅ Recrea las vistas (`product_daily_metrics`, `product_metrics_last_30_days`, `brand_total_metrics`) con las nuevas métricas

- ✅ Actualiza las funciones `get_product_metrics()` y `get_brand_metrics()` para incluir las nuevas métricas

---

## 📝 Archivos Modificados

### 1. **`lib/actions/metrics.ts`**
- ✅ Actualizado `ProductMetrics` interface con las 3 nuevas métricas
- ✅ Actualizado `DailyMetrics` interface con las 3 nuevas métricas
- ✅ Actualizado `BrandMetricsSummary` interface con las 3 nuevas métricas
- ✅ Todas las funciones ahora consultan y retornan las nuevas métricas

### 2. **`components/products/product-view.tsx`**
- ✅ El tracking de vista de producto ya existía pero usaba `"view"` como eventType
- ✅ Actualizado a `"product_view"` para coincidir con el schema SQL

### 3. **`components/SaveOutfitDialog.tsx`**
- ✅ Agregado tracking de `outfit_downloaded` cuando el usuario descarga un outfit
- ✅ Agregado tracking de `outfit_saved` cuando el usuario guarda un outfit
- ✅ Ambos eventos se registran para **cada producto** que forma parte del outfit

### 4. **`components/admin/product-metrics.tsx`**
- ✅ Agregadas 3 nuevas tarjetas de resumen en el dashboard:
  - Total Vistas
  - Outfits Descargados
  - Outfits Guardados
- ✅ Actualizado el gráfico de líneas para mostrar las 5 métricas
- ✅ Actualizada la tabla de productos para mostrar todas las métricas
- ✅ Actualizado el gráfico de barras de "Top Productos" para incluir las nuevas métricas

---

## 🎨 Colores Usados en los Gráficos

Para mantener consistencia visual:

- 🟣 **Vestidos**: `#8b5cf6` (Púrpura)
- 🔵 **Clics en Link**: `#3b82f6` (Azul)
- 🟢 **Vistas**: `#10b981` (Verde)
- 🟠 **Descargas**: `#f59e0b` (Naranja)
- 🔴 **Guardados**: `#ef4444` (Rojo)

---

## 🔍 Cómo Funcionan las Métricas

### 1. Product View (Vista de Producto)
```typescript
// Se registra automáticamente cuando el componente ProductView se monta
useEffect(() => {
  fetch("/api/products/track-event", {
    method: "POST",
    body: JSON.stringify({
      productId: product.id,
      eventType: "product_view",
    }),
  });
}, [product.id]);
```

### 2. Outfit Downloaded (Outfit Descargado)
```typescript
// Se registra cuando el usuario descarga la imagen del outfit
products.forEach(async (product) => {
  await fetch("/api/products/track-event", {
    method: "POST",
    body: JSON.stringify({
      productId: product.id,
      eventType: "outfit_downloaded",
    }),
  });
});
```

### 3. Outfit Saved (Outfit Guardado)
```typescript
// Se registra cuando el usuario guarda el outfit en su colección
products.forEach(async (product) => {
  await fetch("/api/products/track-event", {
    method: "POST",
    body: JSON.stringify({
      productId: product.id,
      eventType: "outfit_saved",
    }),
  });
});
```

---

## 📊 Panel de Admin Actualizado

El dashboard de métricas ahora muestra:

### Tarjetas de Resumen (7 tarjetas en total)
1. Total Productos
2. Total Vestidos
3. Total Clics en Links
4. **Total Vistas** ⭐ NUEVO
5. **Outfits Descargados** ⭐ NUEVO
6. **Outfits Guardados** ⭐ NUEVO
7. Eventos Hoy

### Gráfico de Tendencias
- Muestra las 5 métricas en un gráfico de líneas
- Filtrable por 7 o 30 días

### Tabla de Productos
- Muestra todas las métricas para cada producto
- Incluye imagen, nombre, categoría y las 5 métricas

### Top 5 Productos
- Gráfico de barras con las 5 métricas
- Ordenado por productos más vestidos

---

## ✅ Verificación

Para verificar que todo está funcionando correctamente:

1. **Verifica las columnas en Supabase**:
```sql
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'products' 
AND column_name IN ('total_product_views', 'total_outfit_downloads', 'total_outfit_saves');
```

2. **Prueba cada métrica**:
   - Visita una página de producto → Debería registrar `product_view`
   - Descarga un outfit → Debería registrar `outfit_downloaded` para cada producto
   - Guarda un outfit → Debería registrar `outfit_saved` para cada producto

3. **Verifica en el panel de admin**:
   - Ve al panel de admin de una marca
   - Haz clic en la pestaña "Métricas"
   - Deberías ver las 7 tarjetas de resumen con datos

---

## 🚀 Próximos Pasos (Opcional)

Posibles mejoras futuras:

1. **Métricas de conversión**:
   - Tasa de conversión de vistas a clics
   - Tasa de conversión de vestidos a guardados

2. **Análisis de engagement**:
   - Tiempo promedio en la página del producto
   - Productos más compartidos

3. **Métricas de marca**:
   - Comparación entre marcas
   - Ranking de productos por categoría

---

## 📞 Soporte

Si tienes algún problema con la implementación:

1. Verifica que ejecutaste el script SQL correctamente
2. Revisa la consola del navegador para errores de tracking
3. Verifica que el endpoint `/api/products/track-event` esté funcionando
4. Comprueba los logs de Supabase para errores en las funciones SQL

---

## 📄 Archivos Relacionados

- `docs/PRODUCT_METRICS_SETUP_UPDATE.sql` - Script SQL para ejecutar en Supabase
- `docs/PRODUCT_METRICS_SETUP.sql` - Script original (para referencia)
- `lib/actions/metrics.ts` - Funciones de métricas actualizadas
- `components/admin/product-metrics.tsx` - Panel de admin actualizado
- `components/SaveOutfitDialog.tsx` - Tracking de descargas y guardados
- `components/products/product-view.tsx` - Tracking de vistas

---

**Última actualización**: Noviembre 2025

