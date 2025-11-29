"use client";

import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, Loader, Loader2 } from "lucide-react";
import type { Product } from "@/lib/actions/products";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "./ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { sortProductsByCategory } from "@/lib/utils/product-sorting";

interface SaveOutfitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  outfitImageUrl: string;
  products: Product[];
  onSave?: () => void;
  mode?: "save" | "share"; // Modo: save (guardar nuevo outfit) o share (compartir outfit existente)
}

type AspectRatio = "1:1" | "9:16" | "3:4";

export function SaveOutfitDialog({
  open,
  onOpenChange,
  outfitImageUrl,
  products,
  onSave,
  mode = "save",
}: SaveOutfitDialogProps) {
  const [outfitName, setOutfitName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Estados para los controles de descarga
  const [showProducts, setShowProducts] = useState(true);
  const [showProductNames, setShowProductNames] = useState(true);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("1:1");

  // Ordenar productos por categoría
  const sortedProducts = sortProductsByCategory(products);

  // Control de dimensiones de la imagen principal del outfit
  const outfitImgRef = useRef<HTMLImageElement>(null);
  const [outfitImageDimensions, setOutfitImageDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);

  const handleOutfitImageLoad = () => {
    if (outfitImgRef.current) {
      const { naturalWidth, naturalHeight } = outfitImgRef.current;
      setOutfitImageDimensions({ width: naturalWidth, height: naturalHeight });
    }
  };

  // Obtener el aspect ratio para el contenedor de la imagen
  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case "1:1":
        return "aspect-square";
      case "9:16":
        return "aspect-[9/16]";
      case "3:4":
        return "aspect-[3/4]";
      default:
        return "aspect-square";
    }
  };

  const handleSave = async () => {
    if (!outfitName.trim()) {
      setError("Por favor ingresa un nombre para el outfit");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch("/api/outfits/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: outfitName.trim(),
          imageData: outfitImageUrl,
          products: products.map((p) => ({
            id: p.id,
            name: p.name,
            brand_id: p.brand_id,
            brand_name: p.brands?.brand_name,
            category: p.category,
            images: p.images,
            product_link: p.product_link,
          })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al guardar el outfit");
      }

      // Registrar evento de "outfit_saved" para cada producto en el outfit
      products.forEach(async (product) => {
        try {
          await fetch("/api/products/track-event", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              productId: product.id,
              eventType: "outfit_saved",
            }),
          });
        } catch (error) {
          console.error("Error tracking outfit save event:", error);
        }
      });

      // Limpiar el formulario
      setOutfitName("");

      // Cerrar el dialog
      onOpenChange(false);

      // Mostrar mensaje de éxito
      toast({
        title: "¡Outfit guardado!",
        description: "Tu outfit se ha guardado exitosamente en tu colección.",
      });

      // Callback opcional
      if (onSave) {
        onSave();
      }
    } catch (err) {
      console.error("Error saving outfit:", err);
      setError(
        err instanceof Error ? err.message : "Error al guardar el outfit"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!isSaving) {
      onOpenChange(newOpen);
      if (!newOpen) {
        // Limpiar el formulario al cerrar
        setOutfitName("");
        setError(null);
      }
    }
  };

  const handleDownload = async () => {
    try {
      // Obtener dimensiones según el aspect ratio
      // La imagen original es 1024x1024, ajustamos el canvas según el aspect ratio
      const getDimensions = () => {
        const originalSize = 1024; // Tamaño original de la imagen (cuadrada)

        switch (aspectRatio) {
          case "1:1":
            return { width: 1024, height: 1024 };
          case "9:16":
            // Para 9:16, el alto es el original (1024), el ancho es 9/16 del alto
            return { width: Math.round(1024 * (9 / 16)), height: 1024 };
          case "3:4":
            // Para 3:4, el alto es el original (1024), el ancho es 3/4 del alto
            return { width: Math.round(1024 * (3 / 4)), height: 1024 };
          default:
            return { width: 1024, height: 1024 };
        }
      };

      const { width, height } = getDimensions();

      // Crear canvas con las dimensiones finales (recortadas)
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        throw new Error("No se pudo crear el contexto del canvas");
      }

      // Fondo blanco
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);

      // Cargar y dibujar la imagen principal del outfit
      const outfitImg = await loadImage(outfitImageUrl);

      // La imagen original es 1024x1024
      const originalSize = 1024;

      // Calcular el crop desde la imagen original (centrado horizontalmente)
      const sourceX = (originalSize - width) / 2; // Desde dónde empezar a recortar en X
      const sourceY = 0; // Desde arriba (no recortamos verticalmente)
      const sourceWidth = width; // Cuánto recortar de ancho
      const sourceHeight = height; // Cuánto recortar de alto

      // Dibujar la porción recortada de la imagen en el canvas
      ctx.drawImage(
        outfitImg,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight, // source (de dónde recortar)
        0,
        0,
        width,
        height // destination (dónde poner en el canvas)
      );

      // Si se deben mostrar los productos, dibujarlos (ordenados por categoría)
      if (showProducts && sortedProducts.length > 0) {
        const productListX = 16; // padding de 16px desde el borde izquierdo
        const productListY = 80; // top desde arriba
        const productItemHeight = 32; // altura de cada item (igual al tamaño de la imagen)
        const productGap = 8; // gap entre items
        const productImageContainerSize = 32; // tamaño del contenedor de la imagen
        const productImagePadding = 3; // padding interno de la imagen
        const productImageSize =
          productImageContainerSize - productImagePadding * 2; // tamaño real de la imagen
        const borderRadius = 6; // border radius para la imagen

        for (let i = 0; i < sortedProducts.length; i++) {
          const product = sortedProducts[i];
          const y = productListY + i * (productItemHeight + productGap);

          // Cargar imagen del producto
          try {
            const productImg = await loadImage(
              product.images?.[0] || "/placeholder.png"
            );

            // Dibujar el contenedor de la imagen con fondo blanco, borde y border radius
            const imgContainerX = productListX;
            const imgContainerY = y;

            // Guardar el contexto para aplicar border radius
            ctx.save();

            // Crear un path con border radius para el contenedor de la imagen
            ctx.beginPath();
            ctx.moveTo(imgContainerX + borderRadius, imgContainerY);
            ctx.lineTo(
              imgContainerX + productImageContainerSize - borderRadius,
              imgContainerY
            );
            ctx.quadraticCurveTo(
              imgContainerX + productImageContainerSize,
              imgContainerY,
              imgContainerX + productImageContainerSize,
              imgContainerY + borderRadius
            );
            ctx.lineTo(
              imgContainerX + productImageContainerSize,
              imgContainerY + productImageContainerSize - borderRadius
            );
            ctx.quadraticCurveTo(
              imgContainerX + productImageContainerSize,
              imgContainerY + productImageContainerSize,
              imgContainerX + productImageContainerSize - borderRadius,
              imgContainerY + productImageContainerSize
            );
            ctx.lineTo(
              imgContainerX + borderRadius,
              imgContainerY + productImageContainerSize
            );
            ctx.quadraticCurveTo(
              imgContainerX,
              imgContainerY + productImageContainerSize,
              imgContainerX,
              imgContainerY + productImageContainerSize - borderRadius
            );
            ctx.lineTo(imgContainerX, imgContainerY + borderRadius);
            ctx.quadraticCurveTo(
              imgContainerX,
              imgContainerY,
              imgContainerX + borderRadius,
              imgContainerY
            );
            ctx.closePath();

            // Fondo blanco con opacidad
            ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
            ctx.fill();

            // Borde
            ctx.strokeStyle = "rgba(0, 0, 0, 0.1)";
            ctx.lineWidth = 1;
            ctx.stroke();

            // Clip para que la imagen también tenga border radius
            ctx.clip();

            // Dibujar la imagen del producto con padding interno
            ctx.drawImage(
              productImg,
              imgContainerX + productImagePadding,
              imgContainerY + productImagePadding,
              productImageSize,
              productImageSize
            );

            // Restaurar el contexto
            ctx.restore();

            // Si se debe mostrar el nombre, dibujarlo (SIN fondo ni borde)
            if (showProductNames) {
              ctx.fillStyle = "#000000";
              ctx.font = "600 13px system-ui, -apple-system, sans-serif";
              ctx.textBaseline = "middle";

              const textX = productListX + productImageContainerSize + 8;
              const textY = y + productImageContainerSize / 2;

              // Truncar texto si es muy largo
              const maxTextWidth =
                width * 0.35 - productImageContainerSize - 16;
              let displayText = product.name;
              let textWidth = ctx.measureText(displayText).width;

              if (textWidth > maxTextWidth) {
                while (textWidth > maxTextWidth && displayText.length > 0) {
                  displayText = displayText.slice(0, -1);
                  textWidth = ctx.measureText(displayText + "...").width;
                }
                displayText += "...";
              }

              ctx.fillText(displayText, textX, textY);
            }
          } catch (err) {
            console.error(
              `Error loading product image for ${product.name}:`,
              err
            );
          }
        }
      }

      // Convertir canvas a blob y descargar
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `outfit-${aspectRatio.replace(":", "x")}-${Date.now()}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);

          // Registrar evento de "outfit_downloaded" para cada producto en el outfit
          products.forEach(async (product) => {
            try {
              await fetch("/api/products/track-event", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  productId: product.id,
                  eventType: "outfit_downloaded",
                }),
              });
            } catch (error) {
              console.error("Error tracking outfit download event:", error);
            }
          });

          toast({
            title: "¡Descarga exitosa!",
            description: "Tu outfit se ha descargado correctamente.",
          });
        }
      }, "image/png");
    } catch (err) {
      console.error("Error downloading outfit:", err);
      toast({
        title: "Error al descargar",
        description: "No se pudo descargar el outfit. Intenta de nuevo.",
        variant: "destructive",
      });
    }
  };

  // Función helper para cargar imágenes
  const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:w-[436px] p-4" showCloseButton={true}>
        <DialogTitle className="absolute mb-0"></DialogTitle>
        <div className="space-y-4">
          {/* Imagen del outfit */}
          <div
            className={`h-[100px] sm:h-[200px] 2xl:h-[400px] relative ${getAspectRatioClass()} rounded-2xl overflow-hidden border border-border bg-white flex items-center justify-center mx-auto`}
          >
            <img
              ref={outfitImgRef}
              src={outfitImageUrl}
              alt="Outfit preview"
              className="h-full w-full object-cover"
              onLoad={handleOutfitImageLoad}
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/placeholder.png";
              }}
            />
            {showProducts && (
              <div className="absolute top-4 left-0 overflow-y-auto space-y-1 p-2 w-[40%] max-h-[80%]">
                {sortedProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center text-xs gap-1"
                  >
                    <div className="w-4.5 h-4.5 overflow-hidden flex-shrink-0 border border-border rounded-md p-0.5 bg-white">
                      <img
                        src={product.images?.[0] || "/placeholder.png"}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {showProductNames && (
                      <span className="text-[6px] text-black truncate font-medium tracking-tight">
                        {product.name}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="w-full border border-border rounded-2xl p-3 space-y-2">
            <h3 className="text-lg font-semibold tracking-tight">
              Download outfit
            </h3>
            <div className="flex flex-col gap-3 w-full justify-between">
              {/* Checkbox 1: Mostrar productos */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="show-products"
                  checked={showProducts}
                  onCheckedChange={(checked) => {
                    setShowProducts(checked === true);
                    // Si desactivamos los productos, también desactivamos los nombres
                    if (!checked) {
                      setShowProductNames(false);
                    }
                  }}
                />
                <label
                  htmlFor="show-products"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  Show products
                </label>
              </div>

              {/* Checkbox 2: Mostrar nombres (dependiente del primero) */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="show-names"
                  checked={showProductNames}
                  disabled={!showProducts}
                  onCheckedChange={(checked) =>
                    setShowProductNames(checked === true)
                  }
                />
                <label
                  htmlFor="show-names"
                  className={`text-sm font-medium leading-none cursor-pointer ${
                    !showProducts ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  Show names
                </label>
              </div>

              {/* Select: Aspect ratio */}
              <div className="flex items-center gap-2">
                <Select
                  value={aspectRatio}
                  onValueChange={(value) =>
                    setAspectRatio(value as AspectRatio)
                  }
                >
                  <SelectTrigger id="aspect-ratio" className="w-full">
                    <SelectValue placeholder="Select aspect ratio" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1:1">1:1 (Square)</SelectItem>
                    <SelectItem value="9:16">9:16 (Vertical)</SelectItem>
                    <SelectItem value="3:4">3:4 (Portrait)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <button
              className="w-full flex items-center justify-center rounded-md mt-4 bg-[#0095f618] text-sm py-2 text-primary hover:bg-primary/20 cursor-pointer"
              onClick={handleDownload}
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </button>
          </div>

          {/* Sección de guardar - solo visible en modo "save" */}
          {mode === "save" && (
            <div className="w-full border border-border rounded-2xl p-3 space-y-2">
              <h3 className="text-lg font-semibold tracking-tight">
                Save outfit
              </h3>
              <Input
                id="outfit-name"
                placeholder="Example: Summer casual outfit"
                value={outfitName}
                onChange={(e) => setOutfitName(e.target.value)}
                disabled={isSaving}
                maxLength={100}
              />

              {/* Error message */}
              {error && (
                <div className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                  {error}
                </div>
              )}
              <button
                className="w-full flex items-center justify-center rounded-md mt-4 bg-[#0095f6] text-sm h-9 text-white hover:opacity-80 cursor-pointer"
                onClick={handleSave}
                disabled={isSaving || !outfitName.trim()}
              >
                {isSaving ? (
                  <Loader className="h-4 w-4 animate-spin" />
                ) : (
                  "Save outfit"
                )}
              </button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
