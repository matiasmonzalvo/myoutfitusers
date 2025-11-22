"use client";

import { notFound, useSearchParams } from "next/navigation";
import { getProducts, type Product } from "@/lib/actions/products";
import Image from "next/image";
import { Globe } from "lucide-react";
import { ProductCard } from "@/components/products/product-card";
import { ProductCardSkeleton } from "@/components/products/product-card-skeleton";
import { useState, useEffect, useCallback, useRef } from "react";
import { createServerClient } from "@/lib/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Brand {
  id: string;
  brand_name: string;
  brand_username: string;
  logo_url?: string;
  description?: string;
  website_url?: string;
  created_at: string;
  is_verified_brand: boolean;
}

interface BrandProfilePageProps {
  params: Promise<{
    brand_username: string;
  }>;
}

const CATEGORIES = [
  { key: "all", label: "All Products" },
  { key: "tees", label: "T-Shirts" },
  { key: "jacket", label: "Jackets & Coats" },
  { key: "sweatshirts", label: "Hoodies & Sweaters" },
  { key: "bottoms", label: "Bottoms" },
  { key: "footwear", label: "Sneakers & Shoes" },
  { key: "accesories", label: "Accessories" },
];

const PRODUCTS_PER_PAGE = 16;

export default function BrandProfilePage({ params }: BrandProfilePageProps) {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");

  const [brand, setBrand] = useState<Brand | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>(
    categoryParam || "all"
  );

  const observerTarget = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);
  const isLoadingRef = useRef(false);

  // Cargar información de la marca (solo una vez)
  useEffect(() => {
    async function loadBrandData() {
      try {
        const supabase = createServerClient();

        // Verificar autenticación
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setIsAuthenticated(!!user);

        // Obtener brand_username de params
        const resolvedParams = await params;
        const username = resolvedParams.brand_username;

        // Obtener información de la marca
        const { data: brandData, error: brandError } = await supabase
          .from("brands")
          .select(
            "id, brand_name, brand_username, logo_url, description, website_url, created_at, is_verified_brand"
          )
          .eq("brand_username", username)
          .eq("is_active", true)
          .single();

        if (brandError || !brandData) {
          setBrand(null);
          setLoading(false);
          return;
        }

        setBrand(brandData);
      } catch (error) {
        console.error("Error loading brand data:", error);
        setBrand(null);
        setLoading(false);
      }
    }

    loadBrandData();
  }, [params]);

  // Función para cargar productos con paginación
  const loadProducts = useCallback(
    async (reset: boolean = false) => {
      if (isLoadingRef.current || !brand) return;
      if (!reset && !hasMore) return;

      isLoadingRef.current = true;
      if (reset) {
        setLoading(true);
        offsetRef.current = 0;
        setHasMore(true);
      } else {
        setLoadingMore(true);
      }

      try {
        const offset = reset ? 0 : offsetRef.current;

        // Construir parámetros para getProducts
        const params: any = {
          brandId: brand.id,
          limit: PRODUCTS_PER_PAGE,
          offset: offset,
        };

        // Agregar filtro de categoría si no es "all"
        if (selectedCategory !== "all") {
          params.category = selectedCategory;
        }

        const newProducts = await getProducts(params);

        if (reset) {
          setProducts(newProducts);
        } else {
          setProducts((prev) => [...prev, ...newProducts]);
        }

        // Actualizar offset y hasMore
        offsetRef.current = offset + newProducts.length;
        setHasMore(newProducts.length === PRODUCTS_PER_PAGE);
      } catch (error) {
        console.error("Error loading products:", error);
      } finally {
        setLoading(false);
        setLoadingMore(false);
        isLoadingRef.current = false;
      }
    },
    [brand, selectedCategory, hasMore]
  );

  // Cargar productos cuando la marca está lista o cuando cambia la categoría
  useEffect(() => {
    if (brand) {
      loadProducts(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brand, selectedCategory]);

  // Configurar IntersectionObserver para infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          loadProducts(false);
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, loadingMore, loading, loadProducts]);

  // Actualizar la URL cuando cambia el filtro
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);

    // Actualizar URL sin recargar la página
    const url = new URL(window.location.href);
    if (category === "all") {
      url.searchParams.delete("category");
    } else {
      url.searchParams.set("category", category);
    }
    window.history.pushState({}, "", url.toString());
  };

  if (loading && !brand) {
    return <></>;
  }

  if (!brand) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background -mt-2">
      {/* Header */}
      <div className="border-b border-border pb-4 sticky top-0 z-10 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center space-x-2 mb-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full overflow-hidden bg-white flex items-center justify-center">
              {brand.logo_url ? (
                <Image
                  src={brand.logo_url}
                  alt={brand.brand_name}
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-2xl font-bold text-foreground">
                  {brand.brand_name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>

            <div className="flex-1 min-w-0 flex items-center gap-1.5">
              <h1 className="text-2xl font-semibold text-foreground tracking-tighter">
                {brand.brand_name}
              </h1>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="20"
                height="20"
                color="#000000"
                fill="none"
                className="mt-[0.5px]"
              >
                <path
                  d="M18.9905 19H19M18.9905 19C18.3678 19.6175 17.2393 19.4637 16.4479 19.4637C15.4765 19.4637 15.0087 19.6537 14.3154 20.347C13.7251 20.9374 12.9337 22 12 22C11.0663 22 10.2749 20.9374 9.68457 20.347C8.99128 19.6537 8.52349 19.4637 7.55206 19.4637C6.76068 19.4637 5.63218 19.6175 5.00949 19C4.38181 18.3776 4.53628 17.2444 4.53628 16.4479C4.53628 15.4414 4.31616 14.9786 3.59938 14.2618C2.53314 13.1956 2.00002 12.6624 2 12C2.00001 11.3375 2.53312 10.8044 3.59935 9.73817C4.2392 9.09832 4.53628 8.46428 4.53628 7.55206C4.53628 6.76065 4.38249 5.63214 5 5.00944C5.62243 4.38178 6.7556 4.53626 7.55208 4.53626C8.46427 4.53626 9.09832 4.2392 9.73815 3.59937C10.8044 2.53312 11.3375 2 12 2C12.6625 2 13.1956 2.53312 14.2618 3.59937C14.9015 4.23907 15.5355 4.53626 16.4479 4.53626C17.2393 4.53626 18.3679 4.38247 18.9906 5C19.6182 5.62243 19.4637 6.75559 19.4637 7.55206C19.4637 8.55858 19.6839 9.02137 20.4006 9.73817C21.4669 10.8044 22 11.3375 22 12C22 12.6624 21.4669 13.1956 20.4006 14.2618C19.6838 14.9786 19.4637 15.4414 19.4637 16.4479C19.4637 17.2444 19.6182 18.3776 18.9905 19Z"
                  fill={brand.is_verified_brand ? "#00c950" : "#737373"}
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
            </div>

            <div className="flex space-x-3">
              {brand.website_url && (
                <a
                  href={brand.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors"
                >
                  <Globe className="w-4 h-4 mr-2" />
                  Sitio Web
                </a>
              )}
            </div>
          </div>

          {/* Filtro de categoría */}
          <div className="flex items-center">
            <Select
              value={selectedCategory}
              onValueChange={handleCategoryChange}
            >
              <SelectTrigger className="w-[200px] rounded-full border-0 bg-muted text-sm font-medium tracking-tight hover:opacity-80  transition-all h-8">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent className="bg-muted rounded-xl border-0">
                {CATEGORIES.map((category) => (
                  <SelectItem
                    key={category.key}
                    value={category.key}
                    className="cursor-pointer rounded-lg"
                  >
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto">
        {loading ? (
          <div className="py-6">
            <div className="grid grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
              {Array.from({ length: 12 }).map((_, index) => (
                <ProductCardSkeleton key={index} />
              ))}
            </div>
          </div>
        ) : products.length > 0 ? (
          <div className="py-6">
            <div className="grid grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isAuthenticated={isAuthenticated}
                />
              ))}
            </div>

            {/* Elemento observador para infinite scroll */}
            {hasMore && (
              <div ref={observerTarget} className="w-full py-8">
                {loadingMore && (
                  <div className="grid grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
                    {Array.from({ length: 8 }).map((_, index) => (
                      <ProductCardSkeleton key={`loading-${index}`} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
              <span className="text-2xl">📦</span>
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No hay productos disponibles
            </h3>
            <p className="text-muted-foreground">
              Esta marca aún no ha agregado productos
              {selectedCategory !== "all" && " en esta categoría"}.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
