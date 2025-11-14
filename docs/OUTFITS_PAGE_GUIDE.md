# Guía de la Página de Outfits

## Descripción General

La página `/outfits` permite a los usuarios ver, gestionar y reutilizar todos sus outfits guardados. Es una galería personal donde pueden explorar su colección de combinaciones de ropa creadas con IA.

## Acceso a la Página

### Navegación

Los usuarios autenticados pueden acceder a la página de outfits de dos formas:

1. **Botón en el header**: Icono de bookmark (📑) junto al avatar
2. **Menú del avatar**: Opción "Mis Outfits" en el dropdown

### Protección de Ruta

La página está protegida y requiere autenticación:

- Si el usuario no está autenticado → Redirige a `/login`
- Solo muestra los outfits del usuario logueado

## Características

### 1. Grid de Outfits

**Diseño Responsivo:**

- Mobile: 1 columna
- Tablet (sm): 2 columnas
- Desktop (lg): 3 columnas
- Large Desktop (xl): 4 columnas

**Cada Card Muestra:**

- Imagen del outfit
- Nombre del outfit
- Tiempo desde creación (ej: "hace 2 días")
- Número de productos incluidos
- Menú de opciones (⋮)

### 2. Interacciones con Outfits

#### Ver Detalles

- Click en "Ver detalles" o en el card
- Abre un modal con:
  - Imagen completa del outfit
  - Lista de productos con sus detalles
  - Links a los productos originales
  - Botón para usar el outfit

#### Usar Outfit (Re-Wear)

- Aplica el outfit al avatar del usuario
- Carga la imagen del outfit
- Carga los productos utilizados
- Redirige a la página principal
- Muestra notificación de éxito

#### Eliminar Outfit

- Abre diálogo de confirmación
- Elimina el outfit de la base de datos
- Elimina la imagen del storage
- Actualiza la galería automáticamente
- Muestra notificación de confirmación

### 3. Estados de la Página

#### Loading

- Muestra spinner mientras carga los outfits
- Centrado en la pantalla

#### Sin Outfits

- Mensaje amigable: "No tienes outfits guardados"
- Icono ilustrativo
- Botón para explorar productos
- Instrucciones para crear el primer outfit

#### Con Outfits

- Grid con todos los outfits
- Ordenados por fecha de creación (más recientes primero)

## Componentes

### 1. `OutfitsPage` (app/outfits/page.tsx)

- **Tipo**: Server Component
- **Función**:
  - Verifica autenticación
  - Obtiene perfil del usuario
  - Renderiza la página

### 2. `OutfitsGallery` (components/outfits/outfits-gallery.tsx)

- **Tipo**: Client Component
- **Funciones**:
  - Carga outfits desde la API
  - Gestiona estados (loading, error, empty)
  - Maneja interacciones (ver, eliminar, re-wear)
  - Muestra diálogos de confirmación

### 3. `OutfitCard` (components/outfits/outfit-card.tsx)

- **Tipo**: Client Component
- **Props**:
  - `outfit`: Datos del outfit
  - `onView`: Callback para ver detalles
  - `onDelete`: Callback para eliminar
  - `onReWear`: Callback para usar el outfit
- **Características**:
  - Hover effects
  - Overlay con acciones
  - Menú de opciones
  - Badge con número de productos

### 4. `OutfitDetailDialog` (components/outfits/outfit-detail-dialog.tsx)

- **Tipo**: Client Component
- **Props**:
  - `open`: Estado del diálogo
  - `onOpenChange`: Callback para cambiar estado
  - `outfit`: Datos del outfit
  - `onReWear`: Callback para usar el outfit
- **Muestra**:
  - Imagen grande del outfit
  - Información temporal
  - Lista detallada de productos
  - Links a productos

## API Endpoints Utilizados

### GET `/api/outfits/list`

- Obtiene todos los outfits del usuario
- Ordenados por fecha de creación
- Incluye productos en formato JSON

### DELETE `/api/outfits/delete`

- Elimina un outfit específico
- Verifica propiedad del outfit
- Elimina imagen del storage
- Elimina registro de la base de datos

## Flujo de Re-Wear

1. Usuario hace click en "Usar outfit"
2. Sistema descarga la imagen desde Supabase Storage
3. Convierte la imagen a base64
4. Aplica la imagen al avatar usando `setOutfitImageUrl`
5. Aplica los productos usando `setCurrentOutfitProducts`
6. Guarda todo en localStorage
7. Muestra notificación de éxito
8. Redirige a la página principal

## Decisión de Diseño: `/outfits` vs `/[username]`

### ¿Por qué `/outfits`?

**Problema Identificado:**

- Ya existe la ruta `/[brand_username]` para marcas
- Crear `/[username]` causaría conflictos
- Next.js no podría distinguir entre marca y usuario

**Solución Elegida:**

- Ruta específica `/outfits` para el usuario logueado
- Sin conflictos con rutas existentes
- Mejor UX: acceso directo a "mis outfits"
- Escalable: en el futuro se puede agregar `/outfits/[username]` para perfiles públicos

**Ventajas:**

- ✅ Sin conflictos de rutas
- ✅ URL clara y descriptiva
- ✅ Consistente con patrones de apps populares (Instagram: `/saved`, `/liked`)
- ✅ Fácil de proteger con autenticación
- ✅ Permite expansión futura (perfiles públicos, compartir)

## Mejoras Futuras (Sugerencias)

1. **Perfiles Públicos**: `/outfits/[username]` para ver outfits de otros usuarios
2. **Filtros**: Por categoría, fecha, productos
3. **Búsqueda**: Buscar outfits por nombre
4. **Ordenamiento**: Por fecha, nombre, popularidad
5. **Compartir**: Generar link para compartir outfit
6. **Colecciones**: Agrupar outfits en colecciones temáticas
7. **Estadísticas**: Outfit más usado, productos favoritos
8. **Editar**: Cambiar nombre del outfit
9. **Duplicar**: Crear copia de un outfit
10. **Exportar**: Descargar imagen del outfit

## Navegación

### Desde la Página Principal

```
Header → Icono Bookmark → /outfits
Header → Avatar → Dropdown → "Mis Outfits" → /outfits
```

### Desde la Página de Outfits

```
"Usar outfit" → Aplica outfit → Redirige a /
"Explorar productos" (sin outfits) → /
```

## Testing

Para probar la página:

1. Autentícate en la aplicación
2. Crea y guarda algunos outfits
3. Navega a `/outfits`
4. Verifica que se muestren todos los outfits
5. Prueba cada interacción:
   - Ver detalles
   - Usar outfit
   - Eliminar outfit
6. Verifica el estado sin outfits (elimina todos)
7. Verifica la protección de ruta (logout y accede a `/outfits`)

## Troubleshooting

### Error: "No se pudieron cargar los outfits"

- Verifica que el usuario esté autenticado
- Verifica las políticas RLS en Supabase
- Revisa los logs del servidor

### Error: "No se pudo aplicar el outfit"

- Verifica que la imagen esté accesible en Storage
- Verifica que el bucket sea público
- Revisa la consola del navegador

### Error: "No se pudo eliminar el outfit"

- Verifica las políticas RLS
- Verifica que el outfit pertenezca al usuario
- Revisa los logs del servidor

## Ejemplo de Uso en Código

```typescript
// Navegar a la página de outfits
router.push("/outfits");

// Aplicar un outfit al avatar
const handleReWear = async (outfit: Outfit) => {
  const response = await fetch(outfit.image_url);
  const blob = await response.blob();

  const reader = new FileReader();
  reader.onloadend = async () => {
    const base64data = reader.result as string;
    await setOutfitImageUrl(base64data);
    setCurrentOutfitProducts(outfit.products);
    router.push("/");
  };
  reader.readAsDataURL(blob);
};
```

## Estructura de Archivos

```
app/
  └── outfits/
      └── page.tsx                    # Página principal

components/
  └── outfits/
      ├── outfits-gallery.tsx         # Galería principal
      ├── outfit-card.tsx             # Card individual
      └── outfit-detail-dialog.tsx    # Modal de detalles

app/api/
  └── outfits/
      ├── list/
      │   └── route.ts                # GET: Listar outfits
      └── delete/
          └── route.ts                # DELETE: Eliminar outfit
```

