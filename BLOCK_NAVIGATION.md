# Navegación a Blocks Específicos

## Descripción

Esta funcionalidad permite navegar directamente a un block específico dentro de un grid usando parámetros de URL. Es útil para:

1. **Navegación desde la sidebar**: Al hacer clic en un block de un proyecto diferente, se abre el proyecto y se hace scroll automáticamente al block seleccionado.
2. **Enlaces compartibles**: Se pueden compartir URLs que apunten directamente a un block específico.
3. **Navegación programática**: Otros componentes pueden navegar a blocks específicos usando la URL.

## Formato de URL

```
/g/{layoutId}?block={blockType}-{blockId}
```

### Ejemplos:

- `/g/layout123?block=table-abc456` - Navega al layout123 y hace scroll a la tabla con ID abc456
- `/g/layout456?block=note-def789` - Navega al layout456 y hace scroll a la nota con ID def789
- `/g/layout789?block=todo-ghi123` - Navega al layout789 y hace scroll a la lista de tareas con ID ghi123

## Tipos de Block Soportados

| Tipo de Block | Parámetro URL | Prefijo data-block-id |
| ------------- | ------------- | --------------------- |
| Table         | `table`       | `table`               |
| Note/Page     | `note`        | `note`                |
| Todo List     | `todo`        | `todo`                |
| TradingView   | `tradingView` | `tv`                  |
| Google Drive  | `googleDrive` | `gd`                  |
| GitHub        | `github`      | `gh`                  |
| Figma         | `figma`       | `fig`                 |

## Implementación

### 1. Hook useBlockScroll

El hook `useBlockScroll` proporciona las siguientes funciones:

- `performScrollToBlock(blockType, blockId)`: Realiza el scroll hacia un block específico
- `processBlockParam()`: Procesa el parámetro de block desde la URL actual
- `useAutoScroll(isReady)`: Hook que activa el scroll automático cuando la página está lista
- `hasBlockParam`: Boolean que indica si hay un parámetro de block en la URL

### 2. Sidebar Integration

La función `scrollToBlock` en la sidebar ahora:

1. Construye la URL con el parámetro de block
2. Navega al layout correspondiente
3. El hook `useBlockScroll` detecta automáticamente el parámetro y hace el scroll

### 3. Página del Grid

La página del grid (`/app/g/[id]/page.tsx`) usa el hook `useAutoScroll` para detectar automáticamente cuando debe hacer scroll a un block específico.

## Comportamiento

### Navegación Exitosa

1. Se navega a la URL con el parámetro de block
2. La página se carga y se hidrata
3. El hook detecta el parámetro de block
4. Se busca el elemento en el DOM
5. Se hace scroll suave hacia el elemento
6. Se aplica un highlight temporal (anillo azul) por 2.5 segundos con transición suave de entrada y salida usando CSS inline para garantizar compatibilidad

### Manejo de Errores

- Si el block no se encuentra inmediatamente, se reintenta después de 500ms
- Si aún no se encuentra, se hace un último intento después de 1000ms
- Se registran mensajes de error en la consola para debugging

### Fallbacks

- Si no se encuentra el contenedor de scroll principal (`.table-scroll-layout`), se usa `scrollIntoView`
- Si el parámetro de block es inválido, se registra una advertencia pero no se interrumpe la carga de la página

## Uso Programático

```typescript
import { useBlockScroll } from '@/lib/hooks/useBlockScroll';

function MyComponent() {
  const { performScrollToBlock } = useBlockScroll();

  const handleScrollToTable = () => {
    performScrollToBlock('table', 'abc123');
  };

  return (
    <button onClick={handleScrollToTable}>
      Scroll to Table
    </button>
  );
}
```

## Consideraciones de Rendimiento

- El hook usa `setTimeout` con delays mínimos para evitar problemas de rendering
- Se implementan múltiples reintentos para manejar casos donde el DOM no está completamente listo
- El scroll es suave (`behavior: "smooth"`) para una mejor experiencia de usuario
- El highlight se limpia automáticamente para evitar memory leaks

## Testing

Para probar la funcionalidad:

1. Crear un proyecto con múltiples blocks
2. Expandir el proyecto en la sidebar
3. Hacer clic en un block desde otro proyecto
4. Verificar que se navega y hace scroll correctamente
5. Compartir la URL resultante y verificar que funciona al abrirla en una nueva pestaña
