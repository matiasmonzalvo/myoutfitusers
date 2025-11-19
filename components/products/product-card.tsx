"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ExternalLink,
  Plus,
  ShoppingBag,
  Check,
  ArrowUpRight,
} from "lucide-react";
import type { Product } from "@/lib/actions/products";
import Link from "next/link";
import { useShoppingCart } from "@/lib/contexts/shopping-cart-context";
import { useOutfit } from "@/lib/contexts/outfit-context";
import { useState, useRef, useEffect } from "react";
import { AuthRequiredDialog } from "@/components/auth/auth-required-dialog";

interface ProductCardProps {
  product: Product;
  isAuthenticated: boolean;
}

const CATEGORY_LABELS: Record<string, string> = {
  tees: "T-Shirts",
  jacket: "Jackets & Coats",
  sweatshirts: "Hoodies & Sweaters",
  bottoms: "Bottoms",
  footwear: "Sneakers & Shoes",
  accesories: "Accesories",
};

const SEX_LABELS: Record<string, string> = {
  men: "Hombre",
  women: "Mujer",
  kids: "Niños",
  unisex: "Unisex",
};

export function ProductCard({ product, isAuthenticated }: ProductCardProps) {
  const { addProduct, canAddProduct, selectedProducts, removeProduct } =
    useShoppingCart();
  const { currentOutfitProducts } = useOutfit();
  const [isAdding, setIsAdding] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [imageDimensions, setImageDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const isInCart = selectedProducts.some((p) => p.id === product.id);
  const canAdd = canAddProduct(product, currentOutfitProducts);

  // Verificar si la categoría ya está en el outfit actual
  const categoryInOutfit = currentOutfitProducts.some(
    (p) => p.category === product.category
  );

  // Función para manejar la carga de la imagen y obtener sus dimensiones
  const handleImageLoad = () => {
    if (imgRef.current) {
      const { naturalWidth, naturalHeight } = imgRef.current;
      setImageDimensions({ width: naturalWidth, height: naturalHeight });
    }
  };

  // Determinar las clases CSS basadas en las dimensiones de la imagen
  const getImageClasses = () => {
    if (!imageDimensions) {
      return "w-full h-auto object-cover"; // Clase por defecto mientras carga
    }

    const { width, height } = imageDimensions;
    if (height > width) {
      // Imagen más alta que ancha
      return "h-full w-auto object-cover";
    } else {
      // Imagen más ancha que alta
      return "w-full h-auto object-cover";
    }
  };

  const handleAddToCart = async () => {
    // Si no está autenticado, mostrar el dialog
    if (!isAuthenticated) {
      setShowAuthDialog(true);
      return;
    }

    if (!canAdd) return;

    setIsAdding(true);
    const success = addProduct(product, currentOutfitProducts);

    if (success) {
      // Show success feedback
      setTimeout(() => setIsAdding(false), 1000);
    } else {
      setIsAdding(false);
    }
  };

  const handleRemoveFromCart = () => {
    removeProduct(product.id);
  };

  const handleTryOn = () => {
    // TODO: Implement try-on functionality with avatar
    console.log("Try on product:", product.id);
  };

  const handleViewProduct = () => {
    if (product.product_link) {
      // Registrar evento de "clic en link" de forma asíncrona (fire and forget)
      fetch("/api/products/track-event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          eventType: "link_click",
        }),
      }).catch((error) => {
        console.error("Error tracking link click event:", error);
      });
    }
  };

  return (
    <>
      <AuthRequiredDialog
        open={showAuthDialog}
        onOpenChange={setShowAuthDialog}
        title="Wear your outfits"
        description="Create your account to start wearing your outfits"
      />
      <Card className="overflow-hidden border-none shadow-none bg-background">
        <div>
          <div className="aspect-[4/3] group relative">
            <Link
              href={product.product_link || ""}
              target="_blank"
              onClick={(e) => {
                handleViewProduct();
              }}
              className="absolute top-2 right-2 p-1 rounded-full cursor-pointer z-10"
            >
              <ArrowUpRight className="w-4 h-4 text-neutral-900" />
            </Link>
            <Link
              href={`/product/${product.id}`}
              className="rounded-2xl overflow-hidden border border-border aspect-[4/3] flex items-center justify-center bg-white px-12 transition-all relative"
            >
              <img
                ref={imgRef}
                src={product.images?.[0] || "/placeholder.png"}
                alt={product.name}
                className={getImageClasses()}
                onLoad={handleImageLoad}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/placeholder.png";
                }}
              />
            </Link>
            {/* <div className="absolute top-2 right-2">
          <Badge
            variant="secondary"
            className="bg-background/80 backdrop-blur-sm"
          >
            {CATEGORY_LABELS[product.category] || product.category}
          </Badge>
        </div> */}
          </div>
        </div>

        <CardContent className="p-2">
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <Link
                  href={`/product/${product.id}`}
                  className="flex-1 min-w-0"
                >
                  <h3 className="font-semibold text-[15px]  truncate text-foreground ">
                    {product.name}
                  </h3>
                </Link>
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={isInCart ? handleRemoveFromCart : handleAddToCart}
                    disabled={
                      !isAuthenticated && !isInCart
                        ? false
                        : !canAdd && !isInCart
                    }
                    title={
                      categoryInOutfit && !isInCart
                        ? `Ya tienes un producto de tipo ${CATEGORY_LABELS[product.category] || product.category} en tu outfit. Haz rollback para cambiarlo.`
                        : ""
                    }
                    className={`p-1 rounded-full cursor-pointer transition-colors ${
                      isInCart
                        ? "bg-green-500 hover:bg-green-600"
                        : !isAuthenticated || canAdd
                          ? "bg-primary hover:bg-primary/90"
                          : "bg-neutral-300 dark:bg-neutral-800 cursor-not-allowed"
                    }`}
                  >
                    {isInCart ? (
                      <Check className="w-4 h-4 text-white" />
                    ) : (
                      <Plus className="w-4 h-4 text-white" />
                    )}
                  </button>
                </div>
              </div>
              {/* {product.subcategory && (
              <p className="text-sm text-muted-foreground capitalize">
                {product.subcategory}
              </p>
            )} */}
              <div className="flex items-center justify-between w-full">
                <Link
                  href={`/${product.brands?.brand_username}`}
                  className="flex items-center justify-start gap-1 self-start mt-0.5"
                >
                  <img
                    src={product.brands?.logo_url}
                    alt={product.brands?.brand_name}
                    className="w-4 h-4 rounded-full border border-border"
                  />
                  <p className="text-[13px] leading-[1] text-muted-foreground font-medium capitalize">
                    {product.brands?.brand_name}
                  </p>
                  {/* Badge - Verde si es marca verificada, Azul si es catálogo general */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width="13"
                    height="13"
                    color="#000000"
                    fill="none"
                    className="mt-[0.5px]"
                  >
                    <path
                      d="M18.9905 19H19M18.9905 19C18.3678 19.6175 17.2393 19.4637 16.4479 19.4637C15.4765 19.4637 15.0087 19.6537 14.3154 20.347C13.7251 20.9374 12.9337 22 12 22C11.0663 22 10.2749 20.9374 9.68457 20.347C8.99128 19.6537 8.52349 19.4637 7.55206 19.4637C6.76068 19.4637 5.63218 19.6175 5.00949 19C4.38181 18.3776 4.53628 17.2444 4.53628 16.4479C4.53628 15.4414 4.31616 14.9786 3.59938 14.2618C2.53314 13.1956 2.00002 12.6624 2 12C2.00001 11.3375 2.53312 10.8044 3.59935 9.73817C4.2392 9.09832 4.53628 8.46428 4.53628 7.55206C4.53628 6.76065 4.38249 5.63214 5 5.00944C5.62243 4.38178 6.7556 4.53626 7.55208 4.53626C8.46427 4.53626 9.09832 4.2392 9.73815 3.59937C10.8044 2.53312 11.3375 2 12 2C12.6625 2 13.1956 2.53312 14.2618 3.59937C14.9015 4.23907 15.5355 4.53626 16.4479 4.53626C17.2393 4.53626 18.3679 4.38247 18.9906 5C19.6182 5.62243 19.4637 6.75559 19.4637 7.55206C19.4637 8.55858 19.6839 9.02137 20.4006 9.73817C21.4669 10.8044 22 11.3375 22 12C22 12.6624 21.4669 13.1956 20.4006 14.2618C19.6838 14.9786 19.4637 15.4414 19.4637 16.4479C19.4637 17.2444 19.6182 18.3776 18.9905 19Z"
                      fill={
                        product.brands?.is_verified_brand
                          ? "#10b981"
                          : "#0095f6"
                      }
                      strokeWidth="1.5"
                    />
                    <path
                      d="M9 12.8929L10.8 14.5L15 9.5"
                      stroke="#ffffff"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Link>
              </div>
            </div>

            <div className="flex gap-2 pt-1"></div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
