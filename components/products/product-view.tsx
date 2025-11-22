"use client";

import { useState, useRef, useEffect } from "react";
import { ExternalLink, Plus, Check, ChevronLeft } from "lucide-react";
import type { Product } from "@/lib/actions/products";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useShoppingCart } from "@/lib/contexts/shopping-cart-context";
import { useOutfit } from "@/lib/contexts/outfit-context";
import { AuthRequiredDialog } from "@/components/auth/auth-required-dialog";
import { ProductCard } from "./product-card";

interface ProductViewProps {
  product: Product;
  suggestedProducts: Product[];
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

export function ProductView({
  product,
  suggestedProducts,
  isAuthenticated,
}: ProductViewProps) {
  const router = useRouter();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const { addProduct, canAddProduct, selectedProducts, removeProduct } =
    useShoppingCart();
  const { currentOutfitProducts } = useOutfit();

  const isInCart = selectedProducts.some((p) => p.id === product.id);
  const canAdd = canAddProduct(product, currentOutfitProducts);

  // Verificar si la categoría ya está en el outfit actual
  const categoryInOutfit = currentOutfitProducts.some(
    (p) => p.category === product.category
  );

  // Registrar vista del producto cuando se monta el componente
  // Usar useRef para rastrear qué productos ya se han trackeado en esta sesión
  const trackedProductsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const trackView = async () => {
      // Si ya trackeamos este producto, no hacerlo de nuevo
      if (trackedProductsRef.current.has(product.id)) {
        return;
      }

      // Marcar como trackeado ANTES de hacer la llamada
      trackedProductsRef.current.add(product.id);

      try {
        await fetch("/api/products/track-event", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productId: product.id,
            eventType: "product_view",
          }),
        });
      } catch (error) {
        console.error("Error tracking product view:", error);
        // Si falla, remover del set para permitir retry
        trackedProductsRef.current.delete(product.id);
      }
    };

    trackView();
  }, [product.id]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      setShowAuthDialog(true);
      return;
    }

    if (!canAdd) return;

    const success = addProduct(product, currentOutfitProducts);
  };

  const handleRemoveFromCart = () => {
    removeProduct(product.id);
  };

  const handleViewProduct = () => {
    if (product.product_link) {
      window.open(product.product_link, "_blank");

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

      <div className="w-full min-h-screen pb-20 lg:pb-10">
        <div className="max-w-7xl mx-auto ">
          {/* Contenido principal del producto */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8 mb-16">
            {/* Galería de imágenes */}
            <div className="flex flex-col-reverse lg:flex-row gap-2">
              {/* Thumbnails */}
              {product.images && product.images.length > 0 && (
                <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-y-auto max-h-[600px] pb-2 lg:pb-0 no-scrollbar">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`flex-shrink-0 w-16 h-16 lg:w-16 lg:h-16 p-1.5 bg-white rounded-xl overflow-hidden border transition-all cursor-pointer ${
                        selectedImageIndex === index
                          ? "border-primary border-2"
                          : "border-border "
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${product.name} - ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Imagen principal */}
              <div className="flex-1 rounded-2xl overflow-hidden border border-border bg-white flex items-center justify-center p-6  aspect-square">
                <img
                  src={
                    product.images?.[selectedImageIndex] || "/placeholder.png"
                  }
                  alt={product.name}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/placeholder.png";
                  }}
                />
              </div>
            </div>

            {/* Información del producto */}
            <div className="flex flex-col gap-2">
              {/* Marca */}
              {product.brands && (
                <Link
                  href={`/${product.brands.brand_username}`}
                  className="flex items-center gap-1 w-fit hover:opacity-80 transition-opacity"
                >
                  {product.brands.logo_url && (
                    <img
                      src={product.brands.logo_url}
                      alt={product.brands.brand_name}
                      className="w-6 h-6 rounded-full border border-border"
                    />
                  )}
                  <span className="font-semibold text-lg">
                    {product.brands.brand_name}
                  </span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width="14"
                    height="14"
                    color="#000000"
                    fill="none"
                    className="mt-[0.5px]"
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
              )}

              {/* Nombre del producto */}
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-3 tracking-tight">
                  {product.name}
                </h1>

                {/* Badges de categoría y sexo */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-3 py-1 rounded-full text-sm tracking-tight border border-border font-medium bg-background">
                    {CATEGORY_LABELS[product.category] || product.category}
                  </span>
                  <span className="px-3 py-1 rounded-full text-sm tracking-tight border border-border font-medium bg-background">
                    {SEX_LABELS[product.sex] || product.sex}
                  </span>
                  {product.subcategory && (
                    <span className="px-3 py-1 rounded-full text-sm tracking-tight border border-border font-medium bg-background capitalize">
                      {product.subcategory}
                    </span>
                  )}
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex flex-col  items-stretch gap-3 pt-4">
                <button
                  onClick={handleViewProduct}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-2 rounded-full transition-colors cursor-pointer font-medium text-sm lg:text-base border border-border bg-background hover:bg-muted"
                >
                  <ExternalLink className="w-5 h-5" />
                  <span>Ver en la tienda</span>
                </button>
                <button
                  onClick={isInCart ? handleRemoveFromCart : handleAddToCart}
                  disabled={
                    !isAuthenticated && !isInCart ? false : !canAdd && !isInCart
                  }
                  title={
                    categoryInOutfit && !isInCart
                      ? `Ya tienes un producto de tipo ${CATEGORY_LABELS[product.category] || product.category} en tu outfit. Haz rollback para cambiarlo.`
                      : ""
                  }
                  className={`flex-1 flex items-center justify-center gap-2 px-6 py-2 rounded-full font-medium transition-colors cursor-pointer text-sm lg:text-base ${
                    isInCart
                      ? "bg-green-500 hover:bg-green-600 text-white"
                      : !isAuthenticated || canAdd
                        ? "bg-primary hover:bg-primary/70 text-white"
                        : "bg-gray-400 cursor-not-allowed text-white"
                  }`}
                >
                  {isInCart ? (
                    <>
                      <Check className="w-5 h-5" />
                      <span>En el outfit</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5" />
                      <span>Agregar al outfit</span>
                    </>
                  )}
                </button>
                {categoryInOutfit && !isInCart && (
                  <p className="text-sm text-muted-foreground text-center">
                    Ya tienes un producto de tipo{" "}
                    <span className="font-semibold">
                      {CATEGORY_LABELS[product.category] || product.category}
                    </span>{" "}
                    en tu outfit. Haz rollback para cambiarlo.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Productos sugeridos */}
          {suggestedProducts.length > 0 && (
            <div className="">
              <h2 className="text-2xl font-semibold tracking-tight text-foreground mb-4">
                Suggested products
              </h2>
              <div className="grid grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
                {suggestedProducts.map((suggestedProduct) => (
                  <ProductCard
                    key={suggestedProduct.id}
                    product={suggestedProduct}
                    isAuthenticated={isAuthenticated}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
