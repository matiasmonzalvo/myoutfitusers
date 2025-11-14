# Configuración del Bucket `current-outfits`

## 📋 Resumen de Cambios

Se ha migrado el sistema de almacenamiento de outfits actuales de **localStorage** a **Supabase Storage**. Ahora las imágenes generadas por la IA se guardan en un bucket dedicado llamado `current-outfits`.

### ✅ Ventajas de este cambio:
- **No más límites de localStorage**: Las imágenes base64 grandes ya no saturan el localStorage del navegador
- **Persistencia real**: Las imágenes se mantienen incluso si el usuario limpia el cache del navegador
- **URLs públicas**: Fácil de compartir y acceder desde cualquier dispositivo
- **Cache-busting automático**: Cada nueva imagen tiene un timestamp único para evitar problemas de cache

---

## 🔧 Configuración en Supabase

### Paso 1: Crear el Bucket

1. Ve a tu proyecto de Supabase
2. Navega a **Storage** en el menú lateral
3. Haz clic en **"Create a new bucket"**
4. Configura el bucket con los siguientes valores:
   - **Name**: `current-outfits`
   - **Public bucket**: ✅ **Activado** (las imágenes deben ser públicas)
   - **File size limit**: 10 MB (opcional, pero recomendado)
   - **Allowed MIME types**: `image/png, image/jpeg` (opcional)

### Paso 2: Configurar las Políticas de Seguridad (RLS)

Necesitas crear políticas para que los usuarios puedan:
- **Subir** sus propios outfits
- **Ver** sus propios outfits
- **Eliminar** sus propios outfits

#### Política 1: Permitir INSERT (Subir)
```sql
CREATE POLICY "Users can upload their own current outfits"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'current-outfits' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

#### Política 2: Permitir SELECT (Ver)
```sql
CREATE POLICY "Users can view their own current outfits"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'current-outfits' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

#### Política 3: Permitir DELETE (Eliminar)
```sql
CREATE POLICY "Users can delete their own current outfits"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'current-outfits' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

#### Política 4: Permitir UPDATE (Actualizar)
```sql
CREATE POLICY "Users can update their own current outfits"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'current-outfits' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

### Paso 3: Verificar la Configuración

Para verificar que todo funciona correctamente:

1. **Prueba subir un outfit**: Selecciona productos y genera un outfit
2. **Verifica en Storage**: Ve a Storage > current-outfits y deberías ver una carpeta con tu user ID
3. **Verifica la URL**: La imagen debería cargarse correctamente en el AvatarHub
4. **Prueba el cache-busting**: Genera otro outfit y verifica que la imagen se actualice inmediatamente

---

## 🏗️ Arquitectura del Sistema

### Estructura de Archivos en el Bucket

```
current-outfits/
└── {user_id}/
    └── current-outfit.png
```

Cada usuario tiene su propia carpeta identificada por su `user_id`, y dentro solo hay un archivo: `current-outfit.png`. Este archivo se sobrescribe cada vez que el usuario genera un nuevo outfit.

### Flujo de Datos

1. **Usuario selecciona productos** → AvatarHub
2. **Click en "Wear it"** → API `/api/generate-outfit`
3. **IA genera imagen** → Gemini 2.5 Flash Image
4. **Imagen se sube a Storage** → `uploadCurrentOutfit()`
   - Se elimina la imagen anterior (si existe)
   - Se sube la nueva imagen con `upsert: true`
   - Se retorna URL pública con timestamp
5. **URL se guarda en localStorage** → outfit-context
6. **Imagen se muestra** → AvatarHub

### Cache-Busting

Para evitar problemas de cache del navegador, cada URL incluye un parámetro timestamp:

```
https://[project].supabase.co/storage/v1/object/public/current-outfits/[user_id]/current-outfit.png?t=1234567890
```

El parámetro `?t=` cambia en cada generación, forzando al navegador a descargar la nueva imagen.

---

## 📝 Archivos Modificados

### Nuevos Archivos
- `lib/utils/current-outfit-storage.ts` - Utilidades para gestionar el bucket

### Archivos Modificados
- `app/api/generate-outfit/route.ts` - Ahora sube a Storage en lugar de retornar base64
- `app/api/enhance-face/route.ts` - Ahora sube a Storage en lugar de retornar base64
- `lib/contexts/outfit-context.tsx` - Guarda URLs en lugar de imágenes base64
- `components/AvatarHub.tsx` - Ya manejaba URLs correctamente (sin cambios necesarios)

### Archivos Eliminados
- `lib/utils/image-compression.ts` - Ya no es necesario comprimir imágenes para localStorage

---

## 🐛 Troubleshooting

### Problema: La imagen no se actualiza
**Solución**: Verifica que el cache-busting esté funcionando. La URL debe tener un parámetro `?t=` diferente cada vez.

### Problema: Error "Object not found"
**Solución**: Es normal la primera vez que un usuario genera un outfit. El sistema intenta eliminar la imagen anterior antes de subir la nueva.

### Problema: Error de permisos
**Solución**: Verifica que las políticas RLS estén correctamente configuradas en Supabase Storage.

### Problema: La imagen se ve borrosa
**Solución**: Verifica el `cacheControl` en `uploadCurrentOutfit()`. Debe estar en `"no-cache"` para evitar que el CDN cachee versiones antiguas.

---

## 🔍 Logs de Debugging

El sistema incluye logs detallados para facilitar el debugging:

```
[Current Outfit] Uploading new outfit for user {userId}...
[Current Outfit] Attempting to delete existing outfit: {fileName}
[Current Outfit] Successfully deleted existing outfit
[Current Outfit] Upload successful
[Current Outfit] Public URL with cache buster: {url}
```

Estos logs aparecen en la consola del servidor (terminal donde corre Next.js).

---

## 📊 Comparación: Antes vs Después

| Aspecto | Antes (localStorage) | Después (Supabase Storage) |
|---------|---------------------|---------------------------|
| Tamaño límite | ~5-10 MB total | Sin límite práctico |
| Persistencia | Se borra al limpiar cache | Permanente |
| Velocidad inicial | Rápida (local) | Rápida (CDN) |
| Compartir | Imposible | Fácil (URL pública) |
| Multi-dispositivo | No sincroniza | Sincroniza automáticamente |
| Complejidad código | Media (compresión) | Baja (URLs simples) |

---

## ✅ Checklist de Implementación

- [x] Crear archivo `current-outfit-storage.ts`
- [x] Modificar `/api/generate-outfit/route.ts`
- [x] Modificar `/api/enhance-face/route.ts`
- [x] Actualizar `outfit-context.tsx`
- [x] Eliminar `image-compression.ts`
- [x] Agregar cache-busting a URLs
- [ ] **Crear bucket `current-outfits` en Supabase**
- [ ] **Configurar políticas RLS**
- [ ] **Probar generación de outfit**
- [ ] **Probar función "Restaurar"**
- [ ] **Probar función "Fix errors"**

---

## 🚀 Próximos Pasos

Una vez configurado el bucket:

1. Haz un deploy del código actualizado
2. Prueba generar un outfit
3. Verifica que la imagen aparezca en Storage
4. Prueba restaurar el avatar base
5. Prueba generar otro outfit y verifica que se actualice

¡Listo! El sistema ahora usa Supabase Storage para los outfits actuales. 🎉







