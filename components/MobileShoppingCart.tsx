"use client";

import { useShoppingCart } from "@/lib/contexts/shopping-cart-context";
import { useOutfit } from "@/lib/contexts/outfit-context";
import { Button } from "@/components/ui/button";
import { X, Loader, HelpCircle, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useState, useRef } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { BuyTryonsDialog } from "@/components/BuyTryonsDialog";

export function MobileShoppingCart() {
  const { selectedProducts, removeProduct, clearCart } = useShoppingCart();
  const {
    setOutfitImageUrl,
    setIsGeneratingOutfit,
    isGeneratingOutfit,
    currentOutfitProducts,
    setCurrentOutfitProducts,
    setFaceEnhancementUsed,
    refreshOutfitFromDatabase,
  } = useOutfit();
  const [imageDimensions, setImageDimensions] = useState<
    Record<string, { width: number; height: number }>
  >({});
  const imgRefs = useRef<Record<string, HTMLImageElement>>({});
  const [showBuyTryonsDialog, setShowBuyTryonsDialog] = useState(false);
  const [tryOnsLeft, setTryOnsLeft] = useState<number>(0);

  // Función para manejar la carga de la imagen y obtener sus dimensiones
  const handleImageLoad = (productId: string) => {
    const imgRef = imgRefs.current[productId];
    if (imgRef) {
      const { naturalWidth, naturalHeight } = imgRef;
      setImageDimensions((prev) => ({
        ...prev,
        [productId]: { width: naturalWidth, height: naturalHeight },
      }));
    }
  };

  // Determinar las clases CSS basadas en las dimensiones de la imagen
  const getImageClasses = (productId: string) => {
    const dimensions = imageDimensions[productId];
    if (!dimensions) {
      return "w-full h-full object-cover"; // Clase por defecto mientras carga
    }

    const { width, height } = dimensions;
    if (height > width) {
      // Imagen más alta que ancha
      return "h-full w-auto object-cover";
    } else {
      // Imagen más ancha que alta
      return "w-full h-auto object-cover";
    }
  };

  // Función para generar el outfit
  const handleWearIt = async () => {
    if (selectedProducts.length === 0) return;

    setIsGeneratingOutfit(true);

    try {
      // PASO 1: Verificar si el usuario tiene try-ons disponibles ANTES de generar
      console.log("Checking try-ons availability...");
      const checkResponse = await fetch("/api/check-tryons", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          products: selectedProducts,
        }),
      });

      if (!checkResponse.ok) {
        const errorData = await checkResponse.json();
        throw new Error(errorData.error || "Error checking try-ons");
      }

      const checkData = await checkResponse.json();

      // Si no puede proceder (no tiene try-ons y no es gratis), mostrar dialog
      if (!checkData.canProceed) {
        setTryOnsLeft(checkData.tryOnsLeft);
        setShowBuyTryonsDialog(true);
        setIsGeneratingOutfit(false);
        return;
      }

      console.log("Try-ons check passed. Generating outfit...");

      // PASO 2: Si puede proceder, generar el outfit
      const response = await fetch("/api/generate-outfit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          products: selectedProducts,
          currentProducts: currentOutfitProducts,
          currentOutfitImage: undefined, // En mobile no hay outfit actual visible
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();

        // Si el error es por falta de try-ons (aunque no debería pasar), mostrar dialog
        if (errorData.code === "NO_TRYONS_LEFT") {
          setTryOnsLeft(0);
          setShowBuyTryonsDialog(true);
          setIsGeneratingOutfit(false);
          return;
        }

        throw new Error(errorData.error || "Error al generar el outfit");
      }

      const data = await response.json();

      // Registrar eventos de "worn" para cada producto que se vistió
      selectedProducts.forEach(async (product) => {
        try {
          await fetch("/api/products/track-event", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              productId: product.id,
              eventType: "worn",
            }),
          });
        } catch (error) {
          console.error("Error tracking worn event:", error);
        }
      });

      // Refrescar outfit desde la base de datos
      await refreshOutfitFromDatabase();

      // Resetear el estado de face enhancement cuando se genera un nuevo outfit
      setFaceEnhancementUsed(false);

      // Limpiar el shopping cart después de generar el outfit exitosamente
      clearCart();
    } catch (error) {
      console.error("Error generating outfit:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Error al generar el outfit. Por favor intenta de nuevo."
      );
    } finally {
      setIsGeneratingOutfit(false);
    }
  };

  if (selectedProducts.length === 0) {
    return null;
  }

  return (
    <TooltipProvider>
      <div className="fixed block lg:hidden bottom-0 left-1/2 -translate-x-1/2 z-[40] w-full bg-gradient-to-b from-transparent via-background/80 to-background pb-6 pt-40 transition-opacity duration-300 ease-in-out pointer-events-none opacity-100">
        <div className="w-full px-4 mx-auto space-y-3 pointer-events-auto">
          {/* Productos seleccionados */}
          <div className="space-y-4">
            {selectedProducts.map((product) => (
              <div
                key={product.id}
                className="flex items-center gap-3 animate-in fade-in-0 slide-in-from-bottom-2 duration-300"
              >
                <div className="w-14 h-14 rounded-lg overflow-hidden border border-border flex-shrink-0 flex justify-center items-center p-2 bg-white">
                  <img
                    ref={(el) => {
                      if (el) imgRefs.current[product.id] = el;
                    }}
                    src={product.images?.[0] || "/placeholder.png"}
                    alt={product.name}
                    className={getImageClasses(product.id)}
                    onLoad={() => handleImageLoad(product.id)}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/placeholder.png";
                    }}
                    onContextMenu={(e) => e.preventDefault()}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-semibold tracking-tight text-foreground truncate">
                    {product.name}
                  </p>
                  <Link
                    href={`/${product.brands?.brand_username}`}
                    className="flex items-center gap-1 mt-1"
                  >
                    <img
                      src={product.brands?.logo_url}
                      alt={product.brands?.brand_name}
                      className="w-4 h-4 rounded-full border border-border"
                      onContextMenu={(e) => e.preventDefault()}
                    />
                    <p className="text-sm text-muted-foreground leading-[1]">
                      {product.brands?.brand_name}
                    </p>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      width="14"
                      height="14"
                      color="#000000"
                      fill="none"
                      className="mt-[2px]"
                    >
                      <path
                        d="M18.9905 19H19M18.9905 19C18.3678 19.6175 17.2393 19.4637 16.4479 19.4637C15.4765 19.4637 15.0087 19.6537 14.3154 20.347C13.7251 20.9374 12.9337 22 12 22C11.0663 22 10.2749 20.9374 9.68457 20.347C8.99128 19.6537 8.52349 19.4637 7.55206 19.4637C6.76068 19.4637 5.63218 19.6175 5.00949 19C4.38181 18.3776 4.53628 17.2444 4.53628 16.4479C4.53628 15.4414 4.31616 14.9786 3.59938 14.2618C2.53314 13.1956 2.00002 12.6624 2 12C2.00001 11.3375 2.53312 10.8044 3.59935 9.73817C4.2392 9.09832 4.53628 8.46428 4.53628 7.55206C4.53628 6.76065 4.38249 5.63214 5 5.00944C5.62243 4.38178 6.7556 4.53626 7.55208 4.53626C8.46427 4.53626 9.09832 4.2392 9.73815 3.59937C10.8044 2.53312 11.3375 2 12 2C12.6625 2 13.1956 2.53312 14.2618 3.59937C14.9015 4.23907 15.5355 4.53626 16.4479 4.53626C17.2393 4.53626 18.3679 4.38247 18.9906 5C19.6182 5.62243 19.4637 6.75559 19.4637 7.55206C19.4637 8.55858 19.6839 9.02137 20.4006 9.73817C21.4669 10.8044 22 11.3375 22 12C22 12.6624 21.4669 13.1956 20.4006 14.2618C19.6838 14.9786 19.4637 15.4414 19.4637 16.4479C19.4637 17.2444 19.6182 18.3776 18.9905 19Z"
                        fill={
                          product.brands?.is_verified_brand
                            ? "#00c950"
                            : "#737373"
                        }
                        strokeWidth="1.5"
                      />
                      <path
                        d="M9 12.8929L10.8 14.5L15 9.5"
                        stroke="var(--muted)"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </Link>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {selectedProducts.length >= 3 && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <div className="w-6 h-6 flex items-center justify-center text-black bg-yellow-500 rounded-full font-semibold text-sm">
                          !
                        </div>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        sideOffset={6}
                        className="w-[260px] shadow-[0_0_40px_0_rgba(0,0,0,0.1)] p-2.5 rounded-2xl border border-yellow-200 bg-yellow-50 flex flex-col gap-1"
                      >
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-black" />
                          <h3 className="text-base font-semibold tracking-tight text-black">
                            Warning
                          </h3>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          The model performs best when you try on 1–2 items at
                          once.
                        </p>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                  <button
                    onClick={() => removeProduct(product.id)}
                    className="w-6 h-6 border border-border bg-muted text-foreground rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors cursor-pointer flex-shrink-0"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 w-full relative flex-col">
            {/* Botón Wear it */}
            <Button
              onClick={handleWearIt}
              disabled={isGeneratingOutfit}
              className="w-full bg-primary hover:bg-primary/90 text-white font-semibold h-9 rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
            >
              {isGeneratingOutfit ? (
                <Loader className="w-5 h-5 animate-spin text-white" />
              ) : (
                <span className="text-white w-[68px]">Wear it</span>
              )}
            </Button>
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
              The model can make mistakes.{" "}
              <Link href="/guide/best-practices" className="text-primary">
                Learn how to use it here.
              </Link>
            </div>
            {/* Tooltip de ayuda */}
            {!isGeneratingOutfit && (
              <Tooltip delayDuration={0}>
                <TooltipTrigger
                  asChild
                  className="absolute ml-[38px]  left-1/2 top-4.5 -translate-x-1/2 -translate-y-1/2 z-50"
                >
                  <button className="text-white hover:text-white/80 transition-colors">
                    <HelpCircle className="w-3.5 h-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="w-[260px] shadow-[0_0_40px_0_rgba(0,0,0,0.1)] p-3 rounded-2xl border border-border bg-white flex flex-col gap-2">
                  <h3 className="text-base font-semibold tracking-tight">
                    IMPORTANTE
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    - El modelo funciona mejor con dos prendas a la vez.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    - Si la prenda tiene muchos detalles es mejor es seleccionar
                    esa sola y vestirla.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    - Para aprender a usar el modelo, puedes ver la guía de uso
                    aquí.
                  </p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>
      </div>

      {/* Buy Try-ons Dialog */}
      <BuyTryonsDialog
        open={showBuyTryonsDialog}
        onOpenChange={setShowBuyTryonsDialog}
        tryOnsLeft={tryOnsLeft}
      />
    </TooltipProvider>
  );
}
