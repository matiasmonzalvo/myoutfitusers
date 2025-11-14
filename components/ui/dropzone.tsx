"use client";

import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, Image as ImageIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface DropzoneProps {
  onFileSelect: (file: File) => void;
  onFileRemove?: () => void;
  preview?: string | null;
  accept?: {
    [key: string]: string[];
  };
  maxSize?: number;
  disabled?: boolean;
  placeholder?: string;
  description?: string;
  className?: string;
  type: "face" | "body";
}

export function Dropzone({
  onFileSelect,
  onFileRemove,
  preview,
  accept = { "image/*": [".png", ".jpg", ".jpeg", ".webp"] },
  maxSize = 10 * 1024 * 1024, // 10MB por defecto
  disabled = false,
  placeholder = "Arrastra una imagen aquí o haz clic para seleccionar",
  description = "PNG, JPG, WEBP hasta 10MB",
  className = "",
  type,
}: DropzoneProps) {
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      setError(null);

      // Manejar archivos rechazados
      if (rejectedFiles.length > 0) {
        const rejection = rejectedFiles[0];
        if (rejection.errors[0]?.code === "file-too-large") {
          setError("El archivo es demasiado grande. Máximo 10MB.");
        } else if (rejection.errors[0]?.code === "file-invalid-type") {
          setError("Tipo de archivo no válido. Solo se permiten imágenes.");
        } else {
          setError("Error al cargar el archivo.");
        }
        return;
      }

      // Manejar archivos aceptados
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];

        // Validaciones adicionales
        if (file.size > maxSize) {
          setError(
            `El archivo es demasiado grande. Máximo ${Math.round(maxSize / (1024 * 1024))}MB.`
          );
          return;
        }

        if (!file.type.startsWith("image/")) {
          setError("Por favor selecciona una imagen válida.");
          return;
        }

        onFileSelect(file);
      }
    },
    [onFileSelect, maxSize]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } =
    useDropzone({
      onDrop,
      accept,
      maxSize,
      multiple: false,
      disabled,
    });

  const getDropzoneContent = () => {
    if (preview) {
      return (
        <div className="relative">
          <Image
            src={preview}
            alt={`${type} preview`}
            width={400}
            height={400}
            className="w-full h-64 object-cover rounded-lg"
          />
          {onFileRemove && (
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2"
              onClick={onFileRemove}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        {type === "body" ? (
          <img
            src="/inputbody.png"
            alt="Upload body"
            className="w-32 h-32 self-center mb-4"
          />
        ) : (
          <img
            src="/inputface.png"
            alt="Upload face"
            className="w-32 h-32 self-center mb-4"
          />
        )}
        <p className="text-base font-medium mb-2">
          {isDragActive
            ? isDragReject
              ? "Tipo de archivo no válido"
              : "Suelta la imagen aquí"
            : placeholder}
        </p>
        <p className="text-xs text-muted-foreground">{description}</p>
        {error && <p className="text-xs text-destructive mt-2">{error}</p>}
      </div>
    );
  };

  return (
    <div
      {...getRootProps()}
      className={`
        border-2 border-dashed rounded-lg transition-colors cursor-pointer
        ${
          isDragActive && !isDragReject
            ? "border-primary bg-primary/5"
            : isDragReject
              ? "border-destructive bg-destructive/5"
              : "border-border hover:border-primary"
        }
        ${preview ? "border-solid" : ""}
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        ${className}
      `}
    >
      <input {...getInputProps()} />
      {getDropzoneContent()}
    </div>
  );
}
