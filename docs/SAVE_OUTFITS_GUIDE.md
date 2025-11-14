# Guía de Guardado de Outfits

## Descripción General

El sistema de guardado de outfits permite a los usuarios crear, personalizar y guardar sus combinaciones de ropa generadas por IA. Los outfits se almacenan con la imagen generada y la información de los productos utilizados.

## Configuración Inicial

### 1. Ejecutar el Script SQL

Ejecuta el archivo `docs/OUTFITS_SETUP.sql` en tu editor SQL de Supabase. Este script:

- Crea el bucket de storage `outfits` (público)
- Crea la tabla `outfits` con sus políticas RLS
- Configura los triggers automáticos
- Establece las políticas de seguridad para el storage

### 2. Verificar el Bucket

Ve a la sección **Storage** en tu dashboard de Supabase y verifica que el bucket `outfits` se haya creado correctamente y sea público.

## Flujo de Funcionamiento

### 1. Generación del Outfit

1. El usuario agrega productos al carrito de compras
2. Presiona el botón "Wear it"
3. La IA genera una imagen del avatar usando los productos seleccionados
4. Los productos utilizados se guardan en el contexto `currentOutfitProducts`
5. Los productos se persisten en `localStorage` para mantenerlos después de recargar
6. El carrito se limpia automáticamente

### 2. Guardado del Outfit

1. Una vez generado el outfit, el botón "Save outfit" se habilita
2. Al presionar el botón, se abre un diálogo modal con:
   - Vista previa de la imagen del outfit
   - Input para nombrar el outfit
   - Lista de productos incluidos en el outfit
3. El usuario ingresa un nombre y presiona "Guardar outfit"
4. El sistema:
   - Convierte la imagen base64 a buffer
   - Sube la imagen al bucket `outfits` en la carpeta del usuario
   - Guarda el registro en la tabla `outfits` con:
     - Nombre del outfit
     - URL de la imagen
     - Array de productos usados (JSON)
     - Timestamps de creación/actualización

### 3. Restaurar Avatar Original

- El botón "Restaurar" limpia el outfit actual y vuelve al avatar base
- También limpia los productos del outfit actual

## Estructura de Datos

### Tabla `outfits`

```sql
{
  id: UUID,
  user_id: UUID,
  name: string,
  image_url: string,
  products: JSONB[
    {
      id: string,
      name: string,
      brand_id: string,
      brand_name: string,
      category: string,
      images: string[],
      product_link: string
    }
  ],
  created_at: timestamp,
  updated_at: timestamp
}
```

### Storage Structure

```
outfits/
  └── {user_id}/
      ├── {timestamp1}.png
      ├── {timestamp2}.png
      └── ...
```

## Componentes Principales

### 1. `SaveOutfitDialog`

- **Ubicación**: `components/SaveOutfitDialog.tsx`
- **Props**:
  - `open`: boolean - Controla la visibilidad del diálogo
  - `onOpenChange`: función - Callback para cambiar el estado
  - `outfitImageUrl`: string - URL de la imagen del outfit (base64)
  - `products`: Product[] - Array de productos usados
  - `onSave`: función opcional - Callback después de guardar

### 2. `OutfitContext` (actualizado)

- **Ubicación**: `lib/contexts/outfit-context.tsx`
- **Nuevas propiedades**:
  - `currentOutfitProducts`: Array de productos del outfit actual
  - `setCurrentOutfitProducts`: Función para actualizar los productos
- **Persistencia**:
  - Los productos se guardan en `localStorage` junto con la imagen
  - Keys: `outfit_current_products_{user_id}`
  - Se cargan automáticamente al iniciar la sesión o recargar la página

### 3. API Route

- **Ubicación**: `app/api/outfits/save/route.ts`
- **Método**: POST
- **Body**:
  ```json
  {
    "name": "Nombre del outfit",
    "imageData": "data:image/png;base64,...",
    "products": [...]
  }
  ```

## Seguridad

### Row Level Security (RLS)

Las políticas RLS garantizan que:

- Los usuarios solo pueden ver sus propios outfits
- Los usuarios solo pueden crear outfits para sí mismos
- Los usuarios solo pueden actualizar/eliminar sus propios outfits

### Storage Policies

Las políticas de storage garantizan que:

- Los usuarios solo pueden subir imágenes a su propia carpeta
- Cualquiera puede ver las imágenes (bucket público)
- Los usuarios solo pueden modificar/eliminar sus propias imágenes

## Próximas Funcionalidades (Sugerencias)

1. **Galería de Outfits**: Página para ver todos los outfits guardados
2. **Compartir Outfits**: Funcionalidad para compartir outfits con otros usuarios
3. **Editar/Eliminar Outfits**: Permitir modificar el nombre o eliminar outfits
4. **Filtros y Búsqueda**: Buscar outfits por nombre, productos o categorías
5. **Re-generar Outfit**: Volver a cargar un outfit guardado en el avatar
6. **Favoritos**: Marcar outfits como favoritos
7. **Estadísticas**: Mostrar cuántas veces se ha usado cada producto

## Troubleshooting

### Error: "Failed to upload outfit image"

- Verifica que el bucket `outfits` existe y es público
- Verifica las políticas de storage en Supabase
- Revisa los logs del servidor para más detalles

### Error: "Failed to save outfit"

- Verifica que la tabla `outfits` existe
- Verifica las políticas RLS
- Asegúrate de que el usuario esté autenticado

### Error: "Invalid image format"

- La imagen debe estar en formato base64
- Verifica que la imagen sea válida antes de enviarla

## Testing

Para probar el sistema:

1. Autentícate en la aplicación
2. Completa el onboarding si no lo has hecho
3. Navega a la página principal
4. Agrega algunos productos al carrito
5. Presiona "Wear it" para generar un outfit
6. Presiona "Save outfit" cuando esté listo
7. Ingresa un nombre y guarda
8. Verifica en Supabase:
   - Tabla `outfits`: Debe aparecer el registro
   - Storage `outfits`: Debe aparecer la imagen

## Ejemplo de Uso en Código

```typescript
import { SaveOutfitDialog } from "@/components/SaveOutfitDialog";
import { useOutfit } from "@/lib/contexts/outfit-context";

function MyComponent() {
  const { outfitImageUrl, currentOutfitProducts } = useOutfit();
  const [showDialog, setShowDialog] = useState(false);

  return (
    <>
      <button onClick={() => setShowDialog(true)}>
        Guardar Outfit
      </button>

      <SaveOutfitDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        outfitImageUrl={outfitImageUrl}
        products={currentOutfitProducts}
        onSave={() => {
          console.log("Outfit guardado!");
        }}
      />
    </>
  );
}
```
