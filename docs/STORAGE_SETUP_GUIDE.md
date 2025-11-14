# Guía de Configuración de Supabase Storage - Outfitters

Esta guía te explica cómo configurar los buckets de almacenamiento en Supabase para logos de marcas e imágenes de productos.

## 📋 Resumen

El sistema utiliza **Supabase Storage** para almacenar:

- **Logos de marcas** en el bucket `brand-logos`
- **Imágenes de productos** en el bucket `product-images`

## 🚀 Configuración Paso a Paso

### Paso 1: Crear los Buckets

1. Ve a tu proyecto en **Supabase Dashboard**
2. Navega a **Storage** en el menú lateral
3. Haz clic en **New bucket**

#### Crear bucket para logos de marcas:

- **Name**: `brand-logos`
- **Public bucket**: ✅ Activado
- **File size limit**: 5 MB (recomendado)
- **Allowed MIME types**: `image/jpeg, image/png, image/webp`
- Haz clic en **Create bucket**

#### Crear bucket para imágenes de productos:

- **Name**: `product-images`
- **Public bucket**: ✅ Activado
- **File size limit**: 5 MB (recomendado)
- **Allowed MIME types**: `image/jpeg, image/png, image/webp`
- Haz clic en **Create bucket**

### Paso 2: Configurar Políticas de Seguridad

Las políticas ya están incluidas en el script `ADMIN_SETUP.sql`. Si ya ejecutaste ese script, las políticas deberían estar activas.

Para verificar o crear manualmente:

1. Ve a **Storage** → Selecciona el bucket → **Policies**
2. Las políticas necesarias son:

#### Para `brand-logos`:

```sql
-- Permitir a marcas subir sus propios logos
CREATE POLICY "Brands can upload own logos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'brand-logos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Permitir a marcas actualizar sus logos
CREATE POLICY "Brands can update own logos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'brand-logos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Permitir a marcas eliminar sus logos
CREATE POLICY "Brands can delete own logos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'brand-logos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Permitir acceso público para ver logos
CREATE POLICY "Anyone can view brand logos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'brand-logos');
```

#### Para `product-images`:

```sql
-- Permitir a marcas subir imágenes de productos
CREATE POLICY "Brands can upload product images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'product-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Permitir a marcas actualizar imágenes
CREATE POLICY "Brands can update product images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'product-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Permitir a marcas eliminar imágenes
CREATE POLICY "Brands can delete product images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'product-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Permitir acceso público para ver imágenes
CREATE POLICY "Anyone can view product images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'product-images');
```

### Paso 3: Verificar la Configuración

#### Verificar que los buckets existen:

1. Ve a **Storage** en Supabase Dashboard
2. Deberías ver ambos buckets: `brand-logos` y `product-images`
3. Ambos deberían estar marcados como **Public**

#### Verificar las políticas:

```sql
-- Ver políticas del bucket brand-logos
SELECT * FROM storage.policies WHERE bucket_id = 'brand-logos';

-- Ver políticas del bucket product-images
SELECT * FROM storage.policies WHERE bucket_id = 'product-images';
```

Deberías ver 4 políticas para cada bucket (INSERT, UPDATE, DELETE, SELECT).

## 📁 Estructura de Carpetas

El sistema organiza las imágenes de la siguiente manera:

```
brand-logos/
├── {brand-id-1}/
│   └── logo-abc123.png
├── {brand-id-2}/
│   └── logo-def456.png
└── ...

product-images/
├── {brand-id-1}/
│   ├── product-xyz789.jpg
│   ├── product-abc123.jpg
│   └── ...
├── {brand-id-2}/
│   ├── product-def456.jpg
│   └── ...
└── ...
```

Cada marca tiene su propia carpeta identificada por su `brand_id` (que es el mismo que su `user_id` de Auth).

## 🔐 Seguridad

### Cómo Funcionan las Políticas

1. **Autenticación**: Las marcas deben estar autenticadas para subir/editar/eliminar
2. **Aislamiento**: Cada marca solo puede acceder a su propia carpeta (`auth.uid()`)
3. **Acceso Público**: Cualquiera puede VER las imágenes (necesario para mostrarlas en la app)
4. **Sin Acceso Cruzado**: Una marca NO puede modificar/eliminar imágenes de otra marca

### Validaciones en el Frontend

El sistema también valida en el frontend:

- **Tipo de archivo**: Solo JPG, PNG, WEBP
- **Tamaño máximo**: 5MB por imagen
- **Formato correcto**: Verifica que sea una imagen válida

## 🧪 Probar el Sistema

### 1. Probar Subida de Imagen de Producto

1. Inicia sesión como una marca en `/admin`
2. Ve a `/admin/dashboard`
3. Haz clic en **Agregar Producto**
4. Completa el formulario y sube una imagen
5. Guarda el producto

#### Verificar en Supabase:

1. Ve a **Storage** → `product-images`
2. Deberías ver una carpeta con el ID de la marca
3. Dentro, la imagen subida

### 2. Verificar URL Pública

Las URLs de las imágenes siguen este formato:

```
https://[tu-proyecto].supabase.co/storage/v1/object/public/product-images/[brand-id]/[filename]
```

Puedes abrir esta URL en el navegador para verificar que la imagen es accesible públicamente.

### 3. Verificar Permisos

Intenta:

- ✅ Subir una imagen como marca A
- ✅ Ver la imagen en el navegador
- ❌ Eliminar la imagen de marca A desde marca B (debería fallar)

## 🐛 Troubleshooting

### Error: "new row violates row-level security policy"

**Causa**: Las políticas de RLS no están configuradas correctamente.

**Solución**:

1. Verifica que ejecutaste el script `ADMIN_SETUP.sql` completo
2. Verifica las políticas con:
   ```sql
   SELECT * FROM storage.policies;
   ```
3. Si faltan, créalas manualmente (ver Paso 2)

### Error: "Bucket not found"

**Causa**: Los buckets no existen.

**Solución**:

1. Ve a **Storage** en Supabase Dashboard
2. Crea los buckets manualmente (ver Paso 1)

### Error: "File size exceeds limit"

**Causa**: La imagen es muy grande (>5MB).

**Solución**:

- Comprime la imagen antes de subirla
- O aumenta el límite en la configuración del bucket

### Las imágenes no se muestran

**Causa**: El bucket no es público o las políticas SELECT no existen.

**Solución**:

1. Verifica que el bucket esté marcado como **Public**
2. Verifica la política SELECT:
   ```sql
   SELECT * FROM storage.policies
   WHERE bucket_id = 'product-images'
   AND operation = 'SELECT';
   ```

### Error: "Invalid image URL"

**Causa**: La URL de la imagen no tiene el formato correcto.

**Solución**:

- Las URLs deben seguir el formato:
  `https://[proyecto].supabase.co/storage/v1/object/public/[bucket]/[path]`
- Verifica que el sistema esté generando URLs correctas

## 📊 Monitoreo

### Ver Uso de Storage

1. Ve a **Storage** en Supabase Dashboard
2. Haz clic en un bucket
3. Verás:
   - Número total de archivos
   - Tamaño total usado
   - Archivos recientes

### Limpiar Imágenes Huérfanas

Si eliminas productos pero las imágenes quedan en Storage:

```sql
-- Este script identifica imágenes que no están en la tabla products
-- (Ejecutar manualmente cuando sea necesario)

-- Ver imágenes huérfanas (solo para referencia)
SELECT name FROM storage.objects
WHERE bucket_id = 'product-images'
AND name NOT IN (
  SELECT unnest(images) FROM products
);
```

## 🎯 Mejores Prácticas

1. **Optimiza las imágenes antes de subir**:
   - Usa formatos modernos (WEBP)
   - Comprime las imágenes
   - Dimensiones recomendadas: 1200x1200px para productos

2. **Nombres de archivo únicos**:
   - El sistema genera nombres automáticamente
   - Incluyen timestamp para evitar colisiones

3. **Limpieza periódica**:
   - Revisa imágenes huérfanas mensualmente
   - Elimina productos inactivos y sus imágenes

4. **Backups**:
   - Supabase hace backups automáticos
   - Considera backups adicionales para imágenes críticas

## ✅ Checklist de Configuración

- [ ] Bucket `brand-logos` creado y público
- [ ] Bucket `product-images` creado y público
- [ ] Políticas de Storage ejecutadas (4 por bucket)
- [ ] Probado: Subir imagen como marca
- [ ] Probado: Ver imagen en navegador
- [ ] Probado: Eliminar imagen propia
- [ ] Verificado: No se pueden eliminar imágenes de otras marcas
- [ ] Productos se muestran con imágenes en HomeContent

## 🎉 ¡Listo!

Ahora tu sistema está completamente configurado para manejar imágenes con Supabase Storage. Las marcas pueden:

- Subir múltiples imágenes por producto
- Ver previews antes de guardar
- Eliminar imágenes individuales
- Todo se guarda automáticamente en Storage

¡Disfruta de Outfitters! 🚀
