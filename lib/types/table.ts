export interface SelectOption {
  value: string;
  color: string;
}

export interface Column {
  id: string;
  name: string;
  type:
    | "text"
    | "id"
    | "number"
    | "tasks"
    | "status"
    | "select"
    | "multiSelect"
    | "date"
    | "personas"
    | "equipos"
    | "nota"
    | "cliente"
    | "mail"
    | "url"
    | "github"
    | "proyecto"
    | "archivo"
    | "imagen"
    | "googleDrive"
    | "googleCalendar"
    | "progress"
    | "formula";
  required: boolean;
  options?: SelectOption[];
  icon?: string;
  // Ancho persistido de la columna en píxeles
  width?: number;
  // Modo de estilo para columnas select/multiSelect
  selectStyleMode?: "chip-solid" | "dot" | "chip-soft";
}

export interface Row {
  id: string;
  data: { [columnId: string]: any };
  // Colores de fondo por celda (opcional)
  cellBgColors?: { [columnId: string]: string };
  // Estilos de texto por celda (opcional)
  cellTextStyles?: {
    [columnId: string]: {
      bold?: boolean;
      italic?: boolean;
      underline?: boolean;
      strikethrough?: boolean;
      color?: string; // clase tailwind: p.ej. "text-red-500"
    };
  };
}

export interface TableData {
  id: string;
  title: string;
  description: string;
  category: string;
  color: string;
  columns: Column[];
  rows: Row[];
  showHeader?: boolean;
  icon?: string;
  image?: string;
  createdAt: string;
  lastModified: string;

  // Optimistic UI fields
  isOptimistic?: boolean;
  isSyncing?: boolean;
  syncError?: string;
  // Optimistic delete fields
  isDeleting?: boolean;
  deleteError?: string;
  // Optimistic move fields
  isMoving?: boolean;
  moveError?: string;
  tempPosition?: { row: number; col: number };
}

export interface TableFormData {
  name: string;
  description: string;
  category: string;
  template: string;
  color: string;
}
