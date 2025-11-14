# Formateo de Texto en Notas

## Descripción General

El componente Note ahora soporta formateo de texto enriquecido similar a Notion. Los usuarios pueden aplicar diferentes estilos a fragmentos de texto seleccionados.

## Funcionalidades Implementadas

### Estilos de Texto

1. **Negrita** - Hace el texto más grueso
   - Atajo: `Ctrl/Cmd + B`
   - Menú: Botón con icono Bold

2. **Cursiva** - Inclina el texto
   - Atajo: `Ctrl/Cmd + I`
   - Menú: Botón con icono Italic

3. **Subrayado** - Subraya el texto
   - Atajo: `Ctrl/Cmd + U`
   - Menú: Botón con icono Underline

4. **Tachado** - Tacha el texto
   - Menú: Botón con icono Strikethrough

### Colores de Texto

El menú flotante incluye un selector de color de texto con los siguientes colores:

- Rojo, Naranja, Ámbar, Amarillo
- Lima, Verde, Esmeralda, Turquesa
- Cian, Celeste, Azul, Índigo
- Violeta, Púrpura, Fucsia, Rosa
- Rosa fuerte, Neutral

### Resaltado de Texto

Similar a los colores de texto, puedes resaltar el texto con un fondo de color usando los mismos colores disponibles.

## Cómo Usar

### Método 1: Menú Flotante

1. Selecciona el texto que deseas formatear
2. Aparecerá automáticamente un menú flotante sobre la selección
3. Haz clic en el estilo que deseas aplicar
4. El menú se cierra automáticamente y el estilo se aplica

### Método 2: Atajos de Teclado

1. Selecciona el texto
2. Presiona el atajo correspondiente:
   - `Ctrl/Cmd + B` para negrita
   - `Ctrl/Cmd + I` para cursiva
   - `Ctrl/Cmd + U` para subrayado

## Implementación Técnica

### Arquitectura

El sistema utiliza elementos `<span>` para envolver el texto seleccionado y aplicar estilos, similar a como funciona Notion.

### Componentes

1. **NoteBox.tsx** - Componente principal de la nota
   - Maneja la selección de texto
   - Detecta atajos de teclado
   - Guarda el contenido HTML en la base de datos

2. **NoteTextFormatter.tsx** - Menú flotante de formateo
   - Muestra las opciones de formateo
   - Aplica los estilos al texto seleccionado

### Almacenamiento

- El contenido se guarda como HTML en la base de datos
- Los estilos se preservan usando atributos `style` y `data-*`
- Compatible con la sincronización en tiempo real de Supabase

### Combinación de Estilos

Los estilos se pueden combinar:

- Un texto puede tener negrita + cursiva + color al mismo tiempo
- Los estilos se preservan al seleccionar texto formateado
- Se pueden aplicar nuevos estilos sobre texto ya formateado

## Colores Disponibles

Los colores están definidos en `lib/utils/colors.ts` y son los mismos que se usan en el CellContextMenu de las tablas.

### Colores de Texto

- Se aplican usando clases de Tailwind CSS (`text-{color}-500`)
- Ejemplo: `text-red-500`, `text-blue-500`

### Colores de Resaltado

- Se aplican usando clases de fondo (`bg-{color}-500/15`)
- Tienen opacidad reducida para mejor legibilidad

## Limitaciones Actuales

1. No se puede quitar un estilo una vez aplicado (toggle)
2. El menú flotante no muestra qué estilos están actualmente aplicados
3. No hay soporte para listas o enlaces (pueden agregarse en el futuro)

## Próximas Mejoras Sugeridas

1. Toggle de estilos (activar/desactivar)
2. Indicadores visuales de estilos activos en el menú
3. Soporte para enlaces
4. Soporte para código inline
5. Listas ordenadas y no ordenadas
6. Headings (H1, H2, H3)
