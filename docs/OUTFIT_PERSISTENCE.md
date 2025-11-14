# Persistencia de Outfits con localStorage

Este documento explica cómo funciona el sistema de persistencia de outfits generados usando localStorage del navegador.

## 📋 Descripción General

El sistema guarda automáticamente las imágenes de outfits generados en el navegador del usuario, permitiendo que persistan entre recargas de página y sesiones.

## 🔑 Características Principales

### 1. **Persistencia por Usuario**

- Cada usuario tiene su propio espacio de almacenamiento
- La clave de almacenamiento es única por usuario: `outfit_current_image_{userId}`
- Al cambiar de usuario, se carga automáticamente su outfit guardado

### 2. **Compresión Automática**

- Las imágenes mayores a 2MB se comprimen automáticamente
- Usa compresión JPEG con calidad 0.85
- Redimensiona a máximo 1024px de ancho manteniendo el aspect ratio
- Los logs en consola muestran el tamaño original y comprimido

### 3. **Manejo de Errores**

- Si localStorage está lleno, se muestra un warning en consola
- La aplicación continúa funcionando aunque falle el guardado
- Los errores de compresión no impiden guardar la imagen original

### 4. **Limpieza Automática**

- Al desloguearse, se limpia el estado del outfit
- Al presionar "Restaurar", se elimina la imagen guardada
- Al cambiar de usuario, se carga el outfit del nuevo usuario

## 🛠️ Implementación Técnica

### Contexto Principal: `OutfitProvider`

```typescript
// Guardar outfit
await setOutfitImageUrl(generatedImageUrl);

// Restaurar avatar base
await restoreAvatar();

// Obtener outfit actual
const { outfitImageUrl } = useOutfit();
```

### Utilidades de Compresión

```typescript
import {
  compressBase64Image,
  estimateBase64Size,
  formatBytes,
} from "@/lib/utils/image-compression";

// Comprimir imagen
const compressed = await compressBase64Image(base64, 0.85, 1024);

// Estimar tamaño
const size = estimateBase64Size(base64);
console.log(formatBytes(size)); // "1.5 MB"
```

## 📊 Límites de Almacenamiento

- **localStorage**: ~5-10 MB dependiendo del navegador
- **Compresión activada**: Imágenes > 2 MB
- **Formato comprimido**: JPEG con calidad 0.85
- **Tamaño máximo**: 1024px de ancho

## 🔄 Flujo de Trabajo

1. Usuario genera un outfit → Se guarda automáticamente en localStorage
2. Usuario recarga la página → Se restaura el último outfit del localStorage
3. Usuario genera otro outfit → Se actualiza el localStorage con el nuevo outfit
4. Usuario presiona "Restaurar" → Se elimina del localStorage y se vuelve al avatar base
5. Usuario se desloguea → Se limpia el estado (localStorage mantiene los datos)
6. Usuario se loguea nuevamente → Se carga el outfit guardado de ese usuario

## 🐛 Debugging

### Ver datos en consola del navegador:

```javascript
// Ver todas las imágenes guardadas
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  if (key?.startsWith("outfit_current_image_")) {
    const size = localStorage.getItem(key)?.length || 0;
    console.log(`${key}: ${(size / 1024 / 1024).toFixed(2)} MB`);
  }
}

// Limpiar todos los outfits
for (let i = localStorage.length - 1; i >= 0; i--) {
  const key = localStorage.key(i);
  if (key?.startsWith("outfit_current_image_")) {
    localStorage.removeItem(key);
  }
}
```

## ⚠️ Consideraciones

1. **Privacidad**: Los datos están en el navegador del usuario, no en el servidor
2. **Portabilidad**: Los outfits NO se sincronizan entre dispositivos
3. **Navegador privado**: Los datos se perderán al cerrar la ventana
4. **Limpieza de caché**: Limpiar datos del sitio eliminará los outfits guardados
5. **Seguridad**: localStorage es accesible por JavaScript en el mismo dominio

## 🔮 Mejoras Futuras Potenciales

- [ ] Sincronización opcional con Supabase Storage
- [ ] Historial de outfits (múltiples guardados)
- [ ] Exportar/importar outfits
- [ ] Compartir outfits por link
- [ ] IndexedDB para mayor capacidad de almacenamiento
