# Fix: Persistencia de Productos del Outfit

## Problema Identificado

Cuando el usuario recargaba la página, la imagen del outfit se cargaba correctamente desde `localStorage`, pero el botón "Save outfit" aparecía deshabilitado.

### Causa Raíz

El botón "Save outfit" está deshabilitado cuando:

```typescript
disabled={!outfitImageUrl || currentOutfitProducts.length === 0}
```

Al recargar la página:

- ✅ `outfitImageUrl` se cargaba correctamente desde `localStorage`
- ❌ `currentOutfitProducts` quedaba como array vacío `[]`

Esto sucedía porque solo se guardaba la **imagen** en `localStorage`, pero **no los productos** utilizados para generarlo.

## Solución Implementada

### 1. Nueva Key de Storage

Agregamos una nueva key para guardar los productos:

```typescript
const STORAGE_KEY_PRODUCTS_PREFIX = "outfit_current_products_";
```

### 2. Guardar Productos Automáticamente

Creamos una función que guarda los productos cada vez que se actualizan:

```typescript
const saveProductsToStorage = (products: Product[]) => {
  if (!userId) return;

  try {
    const productsKey = `${STORAGE_KEY_PRODUCTS_PREFIX}${userId}`;

    if (products.length > 0) {
      localStorage.setItem(productsKey, JSON.stringify(products));
    } else {
      localStorage.removeItem(productsKey);
    }
  } catch (error) {
    console.error("Error saving products to localStorage:", error);
  }
};
```

### 3. Wrapper para setCurrentOutfitProducts

Envolvimos la función para que guarde automáticamente:

```typescript
const updateCurrentOutfitProducts = (products: Product[]) => {
  setCurrentOutfitProducts(products);
  saveProductsToStorage(products);
};
```

### 4. Cargar Productos al Iniciar

Actualizamos `loadOutfitFromStorage` para cargar también los productos:

```typescript
const loadOutfitFromStorage = (currentUserId: string) => {
  try {
    const storageKey = `${STORAGE_KEY_PREFIX}${currentUserId}`;
    const productsKey = `${STORAGE_KEY_PRODUCTS_PREFIX}${currentUserId}`;

    const savedImage = localStorage.getItem(storageKey);
    const savedProducts = localStorage.getItem(productsKey);

    if (savedImage) {
      setOutfitImageUrlState(savedImage);
    }

    if (savedProducts) {
      try {
        const products = JSON.parse(savedProducts) as Product[];
        setCurrentOutfitProducts(products);
      } catch (parseError) {
        console.error("Error parsing saved products:", parseError);
        setCurrentOutfitProducts([]);
      }
    } else {
      setCurrentOutfitProducts([]);
    }
  } catch (error) {
    console.error("Error loading outfit from localStorage:", error);
  }
};
```

## Resultado

Ahora cuando el usuario recarga la página:

1. ✅ Se carga la imagen del outfit desde `localStorage`
2. ✅ Se cargan los productos usados desde `localStorage`
3. ✅ El botón "Save outfit" permanece habilitado
4. ✅ El usuario puede guardar el outfit incluso después de recargar

## Estructura en localStorage

Para cada usuario se guardan dos items:

```
localStorage:
  - outfit_current_image_{user_id}: "data:image/png;base64,..."
  - outfit_current_products_{user_id}: '[{"id":"...","name":"..."}]'
```

## Limpieza Automática

Los productos se limpian automáticamente cuando:

- El usuario presiona "Restaurar"
- El usuario cierra sesión
- El usuario cambia de cuenta

## Testing

Para verificar el fix:

1. Genera un outfit con productos
2. Verifica que el botón "Save outfit" esté habilitado
3. Recarga la página (F5)
4. Verifica que:
   - La imagen del outfit sigue visible
   - El botón "Save outfit" sigue habilitado
   - Los productos se mantienen en el contexto

## Verificación en DevTools

Puedes verificar en las DevTools del navegador:

```javascript
// Abrir Console en DevTools
const userId = "..."; // Tu user ID
localStorage.getItem(`outfit_current_image_${userId}`); // Debe mostrar la imagen base64
localStorage.getItem(`outfit_current_products_${userId}`); // Debe mostrar el array de productos
```

