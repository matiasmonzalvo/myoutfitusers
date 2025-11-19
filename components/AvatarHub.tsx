"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useUserProfile } from "@/hooks/use-user-profile";
import { useOutfit } from "@/lib/contexts/outfit-context";
import { useShoppingCart } from "@/lib/contexts/shopping-cart-context";
import Image from "next/image";
import {
  Bookmark,
  Download,
  RotateCcw,
  X,
  ChevronDown,
  Sparkles,
  Image as ImageIcon,
  HelpCircle,
  Loader,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { SaveOutfitDialog } from "@/components/SaveOutfitDialog";
import { BuyTryonsDialog } from "@/components/BuyTryonsDialog";
import { useState, useRef, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { HugeiconsIcon } from "@hugeicons/react";
import { Share03Icon } from "@hugeicons/core-free-icons";
import { sortProductsByCategory } from "@/lib/utils/product-sorting";
import Link from "next/link";

interface AvatarHubProps {
  isAuthenticated: boolean;
}

export function AvatarHub({ isAuthenticated }: AvatarHubProps) {
  const router = useRouter();
  const { profile, loading } = useUserProfile();
  const {
    outfitImageUrl,
    rollbackOutfit,
    isGeneratingOutfit,
    setOutfitImageUrl,
    setIsGeneratingOutfit,
    currentOutfitProducts,
    setCurrentOutfitProducts,
    faceEnhancementUsed,
    setFaceEnhancementUsed,
    outfitHistoryCount,
  } = useOutfit();
  const { selectedProducts, removeProduct, clearCart } = useShoppingCart();
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [isEnhancingFace, setIsEnhancingFace] = useState(false);
  const [showProductsCanvas, setShowProductsCanvas] = useState(false);
  const [productsCanvasUrl, setProductsCanvasUrl] = useState<string | null>(
    null
  );
  const [productsCanvasDebugUrl, setProductsCanvasDebugUrl] = useState<
    string | null
  >(null);
  const [showDebugCanvas, setShowDebugCanvas] = useState(false);
  const [imageDimensions, setImageDimensions] = useState<
    Record<string, { width: number; height: number }>
  >({});
  const imgRefs = useRef<Record<string, HTMLImageElement>>({});
  const [isLargeScreen, setIsLargeScreen] = useState(false);
  const [isAvatarLoading, setIsAvatarLoading] = useState(true);
  const [showBuyTryonsDialog, setShowBuyTryonsDialog] = useState(false);
  const [tryOnsLeft, setTryOnsLeft] = useState<number>(0);

  // Detectar el tamaño de la pantalla
  useEffect(() => {
    const checkScreenSize = () => {
      setIsLargeScreen(window.innerWidth >= 1024); // lg breakpoint
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Resetear estado de carga cuando cambie el avatar
  useEffect(() => {
    setIsAvatarLoading(true);
  }, [outfitImageUrl, profile?.avatar_url]);

  // Ordenar productos por categoría
  const sortedCurrentOutfitProducts = sortProductsByCategory(
    currentOutfitProducts
  );

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
          products: selectedProducts, // Productos nuevos seleccionados
          currentProducts: currentOutfitProducts, // Productos del outfit actual
          currentOutfitImage: outfitImageUrl, // Imagen actual del outfit si existe
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
      await setOutfitImageUrl(data.outfitImageUrl);

      // Guardar el canvas de debug
      if (data.productsCanvasDebugUrl) {
        setProductsCanvasDebugUrl(data.productsCanvasDebugUrl);
      }

      // Combinar productos del outfit actual con los nuevos productos
      // Ya no permitimos reemplazar productos de la misma categoría,
      // solo agregar nuevas categorías
      const updatedProducts = [...currentOutfitProducts, ...selectedProducts];

      // Guardar los productos actualizados del outfit con el índice
      setCurrentOutfitProducts(updatedProducts, data.outfitIndex);

      // Registrar eventos de "worn" para cada producto que se vistió
      // Solo registramos los productos que se agregaron en esta acción (selectedProducts)
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

  // Función para mejorar el outfit
  const handleEnhanceFace = async () => {
    if (
      !outfitImageUrl ||
      faceEnhancementUsed ||
      currentOutfitProducts.length === 0
    )
      return;

    setIsEnhancingFace(true);

    try {
      const response = await fetch("/api/enhance-face", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          products: currentOutfitProducts,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al mejorar el outfit");
      }

      const data = await response.json();
      await setOutfitImageUrl(data.enhancedImageUrl);
      setProductsCanvasUrl(data.productsCanvasUrl); // Recibir el canvas del backend

      // Actualizar el historial con el nuevo outfit mejorado
      setCurrentOutfitProducts(currentOutfitProducts, data.outfitIndex);

      setFaceEnhancementUsed(true);
    } catch (error) {
      console.error("Error enhancing outfit:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Error al mejorar el outfit. Por favor intenta de nuevo."
      );
    } finally {
      setIsEnhancingFace(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="w-full lg:w-auto lg:p-10 lg:h-screen relative flex items-center justify-start">
        <div className="w-full lg:w-auto lg:h-full border border-border rounded-[30px] overflow-hidden relative flex flex-col items-center justify-center bg-white dark:bg-black/50">
          <img
            src="/myoutfitgif2.gif"
            alt="Home"
            className="w-[20%] lg:w-[35%] 2xl:w-[30%] h-auto object-cover "
          />
          <div className="w-full h-auto relative flex flex-col items-center justify-center px-4 p-0 lg:p-8 gap-3 lg:gap-6">
            <div className="text-center space-y-3">
              <h3 className="text-2xl lg:text-4xl 2xl:text-5xl font-bold text-foreground tracking-tight">
                Wear your outfits
              </h3>
              <p className="text-base 2xl:text-lg text-muted-foreground">
                Your real self, dressed in real products.
              </p>
            </div>
            <div className="flex  gap-3 w-full max-w-[80%] sm:max-w-sm">
              <button
                onClick={() => router.push("/login")}
                className="w-full rounded-full border border-border cursor-pointer py-1.5 lg:py-2 text-sm 2xl:text-base"
              >
                Login
              </button>
              <button
                onClick={() => router.push("/register")}
                className="w-full text-white rounded-full bg-primary cursor-pointer py-1.5 lg:py-2 text-sm 2xl:text-base"
              >
                Sign up
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Mostrar loading state mientras carga el perfil o genera outfit
  // if (loading || isGeneratingOutfit) {
  //   return (
  //     <div className="w-auto aspect-square h-full relative flex items-center justify-start">
  //       <div className="w-auto aspect-square h-full border border-border rounded-[20px] overflow-hidden relative flex items-center justify-center bg-white">
  //         <div className="w-full h-full relative flex items-center justify-center">
  //           <div className="animate-pulse bg-muted w-full h-full" />
  //           {isGeneratingOutfit && (
  //             <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90">
  //               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-3"></div>
  //               <p className="text-sm font-medium text-foreground">
  //                 Generando tu outfit...
  //               </p>
  //             </div>
  //           )}
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  // Usar el outfit generado o el avatar base del usuario
  const avatarUrl = outfitImageUrl || profile?.avatar_url;
  const showRestoreButton = !!outfitImageUrl;

  return (
    <TooltipProvider>
      <div className="w-full pb-4 lg:pb-10 lg:h-screen p-0 lg:p-10 flex flex-col items-center justify-start my-auto xl:my-0 relative ">
        <div className="flex items-start relative justify-between w-full px-3 gap-2 lg:gap-2 lg:px-4 2xl:px-10 pb-3 self-start">
          {/* Botón de rollback cuando hay un outfit aplicado */}
          <div className="flex items-center justify-start gap-2 w-1/3">
            <button
              onClick={rollbackOutfit}
              disabled={!showRestoreButton}
              className="rounded-full bg-muted border border-border transition-all cursor-pointer flex items-center justify-center gap-2 px-2.5 lg:px-3 py-2.5 hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="text-sm">Rollback</span>
            </button>

            {/* {outfitImageUrl &&
              !faceEnhancementUsed &&
              currentOutfitProducts.length > 0 && (
                <button
                  onClick={handleEnhanceFace}
                  disabled={isEnhancingFace}
                  className="rounded-full w-[42px] lg:w-32 h-[42px]  text-sm flex items-center justify-center gap-2 bg-white border hover:bg-pink-50 border-pink-200 text-pink-500 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isEnhancingFace ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span className="text-xs lg:text-sm hidden lg:block">
                        Fix errors
                      </span>
                    </>
                  )}
                </button>
              )} */}
          </div>
          <div className="flex items-center justify-center gap-2 w-auto">
            <DropdownMenu>
              <DropdownMenuTrigger
                asChild
                disabled={currentOutfitProducts.length === 0}
              >
                <button className="w-auto rounded-full bg-muted border border-border transition-all cursor-pointer flex items-center justify-center  px-3 py-2.5 hover:opacity-80 focus:outline-none ring-0 focus:ring-0 focus:ring-offset-0 relative disabled:opacity-50 disabled:cursor-not-allowed">
                  <span className="text-sm font-medium">Outfit</span>
                  <div className="text-[10px] lg:text-[12px] mx-1 text-primary font-medium w-4.5 h-4.5 bg-primary/10 rounded-full flex items-center justify-center">
                    {currentOutfitProducts.length}
                  </div>
                  <ChevronDown className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align={isLargeScreen ? "start" : "center"}
                sideOffset={6}
                side="bottom"
                className="w-[266px] max-h-[400px] overflow-y-auto p-0 rounded-2xl"
              >
                {sortedCurrentOutfitProducts.map((product) => (
                  <DropdownMenuItem
                    key={product.id}
                    className="cursor-pointer px-3 py-3 flex items-center gap-3 "
                    onClick={() => {
                      if (product.product_link) {
                        window.open(product.product_link, "_blank");
                      }
                    }}
                  >
                    <div className="w-10 h-10 rounded-lg overflow-hidden border border-border flex-shrink-0 flex justify-center items-center bg-white">
                      <img
                        src={product.images?.[0] || "/placeholder.png"}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "/placeholder.png";
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {product.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {product.brands?.brand_name}
                      </p>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            {/* {productsCanvasUrl && (
              <button
                onClick={() => setShowProductsCanvas(true)}
                className="rounded-full px-2 lg:px-3 py-2.5 text-sm flex items-center justify-center gap-2 bg-white hover:bg-neutral-100 border border-border text-foreground transition-all cursor-pointer"
              >
                <ImageIcon className="w-4 h-4" />
                <span className="text-xs lg:text-sm hidden lg:block">
                  Ver referencia
                </span>
              </button>
            )}
            {productsCanvasDebugUrl && (
              <button
                onClick={() => setShowDebugCanvas(true)}
                className="rounded-full px-2 lg:px-3 py-2.5 text-sm flex items-center justify-center gap-2 bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-600 transition-all cursor-pointer"
              >
                <ImageIcon className="w-4 h-4" />
                <span className="text-xs lg:text-sm hidden lg:block">
                  Debug
                </span>
              </button>
            )} */}
            <button
              onClick={() => setShowSaveDialog(true)}
              disabled={!outfitImageUrl || currentOutfitProducts.length === 0}
              className="rounded-full bg-primary text-white transition-all cursor-pointer flex items-center justify-center gap-2 px-3 lg:px-5 py-2.5 hover:opacity-80"
            >
              <HugeiconsIcon
                icon={Share03Icon}
                className="w-4 h-4"
                strokeWidth={2.5}
              />
              <span className="text-sm font-medium">Share</span>
            </button>
          </div>
        </div>
        <div className="w-full h-auto lg:h-full border border-border rounded-[24px] overflow-hidden relative flex items-center justify-center bg-white">
          {avatarUrl && (
            <img
              src={avatarUrl}
              alt="User Avatar"
              className="object-cover w-full h-full"
              onLoad={() => setIsAvatarLoading(false)}
              onError={() => setIsAvatarLoading(false)}
            />
          )}

          {/* Shopping Cart */}
          <div
            className={`fixed hidden lg:block lg:absolute bottom-0 left-1/2 -translate-x-1/2 z-[40] w-full bg-gradient-to-b from-transparent via-background/80 to-background rounded-[20px] pb-3.5 pt-40 transition-opacity duration-300 ease-in-out pointer-events-auto ${
              selectedProducts.length > 0 ? "opacity-100" : "opacity-0 "
            }`}
          >
            <div className="max-w-sm mx-auto space-y-3">
              {/* Productos seleccionados */}
              <div className="space-y-2">
                {selectedProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center gap-3 animate-in fade-in-0 slide-in-from-bottom-2 duration-300"
                  >
                    <div className="w-16 h-16 rounded-lg overflow-hidden border border-border flex-shrink-0 flex justify-center items-center p-2 bg-white">
                      <img
                        ref={(el) => {
                          if (el) imgRefs.current[product.id] = el;
                        }}
                        src={product.images?.[0] || "/placeholder.png"}
                        alt={product.name}
                        className={getImageClasses(product.id)}
                        onLoad={() => handleImageLoad(product.id)}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "/placeholder.png";
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-semibold tracking-tight text-foreground truncate">
                        {product.name}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <img
                          src={product.brands?.logo_url}
                          alt={product.brands?.brand_name}
                          className="w-4 h-4 rounded-full border border-border"
                        />
                        <p className="text-sm text-muted-foreground leading-[1]">
                          {product.brands?.brand_name}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {selectedProducts.length >= 3 && (
                        <Tooltip delayDuration={0}>
                          <TooltipTrigger asChild>
                            <div className="w-6 h-6 flex items-center justify-center text-black bg-yellow-500 rounded-full font-semibold text-sm">
                              !
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className="w-[260px] shadow-[0_0_40px_0_rgba(0,0,0,0.1)] p-3 rounded-2xl border border-yellow-200 bg-yellow-50 flex flex-col gap-1.5">
                            <div className="flex items-center gap-2">
                              <AlertCircle className="w-4 h-4 text-black" />
                              <h3 className="text-base font-semibold tracking-tight text-black">
                                Warning
                              </h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              The model performs best when you try on 1–2 items
                              at once.
                            </p>
                          </TooltipContent>
                        </Tooltip>
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
                  className="w-full bg-primary hover:bg-primary/90 text-white font-semibold h-9  rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
                >
                  {isGeneratingOutfit ? (
                    <Loader className="w-5 h-5 animate-spin text-white" />
                  ) : (
                    <span className="text-white w-[68px]">Wear it</span>
                  )}
                </Button>

                <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  The model can make mistakes.{" "}
                  <Link href="/guide" className="text-primary">
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
                        - Si la prenda tiene muchos detalles es mejor es
                        seleccionar esa sola y vestirla.
                      </p>
                      <p className="text-xs text-muted-foreground">
                        - Para aprender a usar el modelo, puedes ver la guía de
                        uso aquí.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
            </div>
          </div>
        </div>
        <div
          className={`fixed block lg:hidden lg:absolute bottom-0 left-1/2 -translate-x-1/2 z-[40] w-full bg-gradient-to-b from-transparent via-background/80 to-background rounded-[20px] pb-6 pt-40 transition-opacity duration-300 ease-in-out pointer-events-auto ${
            selectedProducts.length > 0 ? "opacity-100" : "opacity-0 "
          }`}
        >
          <div className="max-w-sm mx-auto space-y-3">
            {/* Productos seleccionados */}
            <div className="space-y-2">
              {selectedProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center gap-3 animate-in fade-in-0 slide-in-from-bottom-2 duration-300"
                >
                  <div className="w-16 h-16 rounded-lg overflow-hidden border border-border flex-shrink-0 flex justify-center items-center p-2 bg-white">
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
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-semibold tracking-tight text-foreground truncate">
                      {product.name}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <img
                        src={product.brands?.logo_url}
                        alt={product.brands?.brand_name}
                        className="w-4 h-4 rounded-full border border-border"
                      />
                      <p className="text-sm text-muted-foreground leading-[1]">
                        {product.brands?.brand_name}
                      </p>
                    </div>
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
                <Link href="/guide" className="text-primary">
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
                      - Si la prenda tiene muchos detalles es mejor es
                      seleccionar esa sola y vestirla.
                    </p>
                    <p className="text-xs text-muted-foreground">
                      - Para aprender a usar el modelo, puedes ver la guía de
                      uso aquí.
                    </p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>
        </div>
        {/* Save Outfit Dialog */}
        {outfitImageUrl && (
          <SaveOutfitDialog
            open={showSaveDialog}
            onOpenChange={setShowSaveDialog}
            outfitImageUrl={outfitImageUrl}
            products={currentOutfitProducts}
            onSave={() => {
              // Opcional: Hacer algo después de guardar
              console.log("Outfit saved successfully");
            }}
          />
        )}

        {/* Buy Try-ons Dialog */}
        <BuyTryonsDialog
          open={showBuyTryonsDialog}
          onOpenChange={setShowBuyTryonsDialog}
          tryOnsLeft={tryOnsLeft}
        />

        {/* Products Canvas Dialog */}
        {showProductsCanvas && productsCanvasUrl && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            onClick={() => setShowProductsCanvas(false)}
          >
            <div
              className="relative max-w-md w-full bg-white rounded-3xl p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Referencia de productos</h3>
                <button
                  onClick={() => setShowProductsCanvas(false)}
                  className="rounded-full p-2 hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="border border-border rounded-2xl overflow-hidden">
                <img
                  src={productsCanvasUrl}
                  alt="Products canvas"
                  className="w-full h-auto"
                />
              </div>
              <p className="text-sm text-muted-foreground mt-4 text-center">
                Orden de productos (de arriba hacia abajo)
              </p>
            </div>
          </div>
        )}

        {/* Debug Canvas Dialog */}
        {showDebugCanvas && productsCanvasDebugUrl && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            onClick={() => setShowDebugCanvas(false)}
          >
            <div
              className="relative max-w-md w-full bg-white rounded-3xl p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Canvas enviado a la IA</h3>
                <button
                  onClick={() => setShowDebugCanvas(false)}
                  className="rounded-full p-2 hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="border border-border rounded-2xl overflow-hidden">
                <img
                  src={productsCanvasDebugUrl}
                  alt="Debug canvas"
                  className="w-full h-auto"
                />
              </div>
              <p className="text-sm text-muted-foreground mt-4 text-center">
                Imagen combinada de productos enviada a Gemini
              </p>
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
