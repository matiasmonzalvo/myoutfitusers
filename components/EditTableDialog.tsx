"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SOLID_COLOR_OPTIONS } from "@/lib/utils/colors";
import { ChevronDownIcon } from "lucide-react";

interface EditTableData {
  title: string;
  color: string;
}

interface EditTableDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData: EditTableData;
  onSubmit: (data: EditTableData) => void;
  isSubmitting?: boolean;
}

export default function EditTableDialog({
  open,
  onOpenChange,
  initialData,
  onSubmit,
  isSubmitting = false,
}: EditTableDialogProps) {
  const [formData, setFormData] = useState<EditTableData>(initialData);

  // Actualizar el formulario cuando cambien los datos iniciales
  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  const handleInputChange = (field: keyof EditTableData, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = () => {
    if (formData.title.trim()) {
      onSubmit(formData);
    }
  };

  const handleClose = () => {
    setFormData(initialData); // Resetear a los valores originales
    onOpenChange(false);
  };

  // Obtener el color seleccionado actual
  const selectedColor =
    SOLID_COLOR_OPTIONS.find((color) => color.value === formData.color) ||
    SOLID_COLOR_OPTIONS[0];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-background w-96">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-foreground tracking-tighter">
            Editar Tabla
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Campo de título con selector de color */}
          <div className="flex gap-1">
            {/* Dropdown de colores */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild className="outline-none">
                <button className="flex items-center gap-2 p-3 px-4 aspect-square border border-border rounded-xl bg-background hover:bg-accent transition-colors">
                  <div
                    className={`w-4 h-4 ${selectedColor.bg} rounded-full`}
                  ></div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="grid grid-cols-3 gap-2"
              >
                {SOLID_COLOR_OPTIONS.map((color) => (
                  <DropdownMenuItem
                    key={color.value}
                    onClick={() => handleInputChange("color", color.value)}
                    className="flex items-center gap-3 aspect-square p-3"
                  >
                    <div className={`w-4 h-4 ${color.bg} rounded-full`}></div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Input del título */}
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="Ej: Control de Inventario 2024"
              className="focus:outline-none flex-1 p-3 border border-border rounded-xl bg-background text-foreground"
              autoFocus
            />
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <button
            onClick={handleClose}
            className="cursor-pointer flex items-center space-x-2 px-4 py-2 text-sm font-medium text-foreground bg-background border border-border rounded-lg hover:bg-accent transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={!formData.title.trim() || isSubmitting}
            className="cursor-pointer border px-4 py-2 text-sm font-medium text-background bg-foreground rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Guardar Cambios
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
