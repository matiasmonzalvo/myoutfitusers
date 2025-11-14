"use client";

import { getProducts, type Product } from "@/lib/actions/products";
import { ProductCard } from "@/components/products/product-card";
import { ProductCardSkeleton } from "@/components/products/product-card-skeleton";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect, useCallback, useRef } from "react";
import { useCategoryFilter } from "@/lib/contexts/category-filter-context";
import { useSearch } from "@/lib/contexts/search-context";
import { createServerClient } from "@/lib/supabase/client";

interface HomeContentProps {
  isAuthenticated: boolean;
}

const PRODUCTS_PER_PAGE = 16;

export function HomeContent({ isAuthenticated }: HomeContentProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [searchHasMore, setSearchHasMore] = useState(true);
  const [userGender, setUserGender] = useState<
    "male" | "female" | "other" | null
  >(null);
  const [isGenderLoaded, setIsGenderLoaded] = useState(false);
  const { selectedFilter } = useCategoryFilter();
  const { searchQuery, isSearching, setIsSearching } = useSearch();
  const observerTarget = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);
  const searchOffsetRef = useRef(0);
  const isLoadingRef = useRef(false);
  const isSearchLoadingRef = useRef(false);
  const randomSeedRef = useRef<number>(Math.floor(Math.random() * 1000000));
  const hasInitialLoadRef = useRef(false);

  // Función para cargar productos con recomendación personalizada
  const loadProducts = useCallback(
    async (reset: boolean = false) => {
      // Prevenir múltiples cargas simultáneas
      if (isLoadingRef.current) return;

      isLoadingRef.current = true;

      try {
        if (reset) {
          setLoading(true);
          offsetRef.current = 0;
          setHasMore(true);
        } else {
          setLoadingMore(true);
        }

        const currentOffset = reset ? 0 : offsetRef.current;
        const data = await getProducts({
          limit: PRODUCTS_PER_PAGE,
          offset: currentOffset,
          category: selectedFilter !== "all" ? selectedFilter : undefined,
          randomSeed: randomSeedRef.current, // Orden aleatorio
          userGender: userGender, // Filtro personalizado basado en género
        });

        if (data.length < PRODUCTS_PER_PAGE) {
          setHasMore(false);
        }

        if (reset) {
          setProducts(data);
          setFilteredProducts(data);
          offsetRef.current = PRODUCTS_PER_PAGE;
        } else {
          setProducts((prev) => {
            // Filtrar duplicados usando un Set
            const existingIds = new Set(prev.map((p) => p.id));
            const newProducts = data.filter((p) => !existingIds.has(p.id));
            return [...prev, ...newProducts];
          });
          setFilteredProducts((prev) => {
            const existingIds = new Set(prev.map((p) => p.id));
            const newProducts = data.filter((p) => !existingIds.has(p.id));
            return [...prev, ...newProducts];
          });
          offsetRef.current = currentOffset + PRODUCTS_PER_PAGE;
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
        setLoadingMore(false);
        isLoadingRef.current = false;
      }
    },
    [selectedFilter, userGender]
  );

  // Obtener género del usuario si está autenticado
  useEffect(() => {
    const fetchUserGender = async () => {
      if (!isAuthenticated) {
        // Si no está autenticado, establecer como null
        setUserGender(null);
        setIsGenderLoaded(true);
        return;
      }

      try {
        const supabase = createServerClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const { data: profile } = await supabase
            .from("user_profiles")
            .select("gender")
            .eq("id", user.id)
            .single();

          if (profile) {
            setUserGender(profile.gender as "male" | "female" | "other");
          } else {
            // Si no hay perfil, cargar sin filtro de género
            setUserGender(null);
          }
        } else {
          setUserGender(null);
        }
      } catch (error) {
        console.error("Error fetching user gender:", error);
        setUserGender(null);
      } finally {
        setIsGenderLoaded(true);
      }
    };

    fetchUserGender();
  }, [isAuthenticated]);

  // Cargar productos inicial SOLO cuando el género está cargado (una sola vez)
  useEffect(() => {
    if (isGenderLoaded && !hasInitialLoadRef.current) {
      hasInitialLoadRef.current = true;
      loadProducts(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isGenderLoaded]);

  // Búsqueda de productos con paginación
  const searchProducts = useCallback(
    async (query: string, reset: boolean = false) => {
      if (!query.trim()) {
        setSearchResults([]);
        setIsSearching(false);
        setSearchHasMore(true);
        searchOffsetRef.current = 0;
        return;
      }

      // Prevenir múltiples cargas simultáneas
      if (isSearchLoadingRef.current) return;

      isSearchLoadingRef.current = true;

      try {
        if (reset) {
          setIsSearching(true);
          searchOffsetRef.current = 0;
          setSearchHasMore(true);
        } else {
          setLoadingMore(true);
        }

        const currentOffset = reset ? 0 : searchOffsetRef.current;
        const response = await fetch(
          `/api/search-products?q=${encodeURIComponent(query)}&limit=${PRODUCTS_PER_PAGE}&offset=${currentOffset}`
        );
        const data = await response.json();
        const results = data.products || [];

        if (results.length < PRODUCTS_PER_PAGE) {
          setSearchHasMore(false);
        }

        if (reset) {
          setSearchResults(results);
          searchOffsetRef.current = PRODUCTS_PER_PAGE;
        } else {
          setSearchResults((prev) => {
            const existingIds = new Set(prev.map((p) => p.id));
            const newProducts = results.filter(
              (p: Product) => !existingIds.has(p.id)
            );
            return [...prev, ...newProducts];
          });
          searchOffsetRef.current = currentOffset + PRODUCTS_PER_PAGE;
        }
      } catch (error) {
        console.error("Error searching products:", error);
        if (reset) {
          setSearchResults([]);
        }
      } finally {
        setIsSearching(false);
        setLoadingMore(false);
        isSearchLoadingRef.current = false;
      }
    },
    [setIsSearching]
  );

  // Debounce para la búsqueda (300ms)
  useEffect(() => {
    // Si hay query, marcar como "buscando" INMEDIATAMENTE
    if (searchQuery.trim()) {
      setIsSearching(true);
    }

    const timeoutId = setTimeout(() => {
      searchProducts(searchQuery, true); // Reset en cada nueva búsqueda
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchProducts, setIsSearching]);

  // Recargar productos cuando cambia el filtro de categoría
  useEffect(() => {
    // Solo recargar si ya se hizo la carga inicial y no hay búsqueda activa
    if (hasInitialLoadRef.current && !searchQuery.trim()) {
      loadProducts(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFilter]);

  // Configurar IntersectionObserver para infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingMore && !loading) {
          // Si hay búsqueda activa, cargar más resultados de búsqueda
          if (searchQuery.trim() && searchHasMore) {
            searchProducts(searchQuery, false);
          }
          // Si no hay búsqueda, cargar más productos normales
          else if (!searchQuery.trim() && hasMore) {
            loadProducts(false);
          }
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
  }, [
    hasMore,
    searchHasMore,
    loadingMore,
    loading,
    searchQuery,
    loadProducts,
    searchProducts,
  ]);

  // Determinar qué productos mostrar
  const displayProducts = searchQuery.trim() ? searchResults : filteredProducts;
  const isLoadingState = loading || isSearching;

  if (loading) {
    return (
      <div className="pb-6 h-auto w-full">
        <div className="w-full mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 2xl:grid-cols-4 gap-4">
            {Array.from({ length: 12 }).map((_, index) => (
              <ProductCardSkeleton key={index} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-6 h-auto w-full overflow-hidden">
      <div className="w-full mx-auto">
        {/* Mostrar skeletons mientras se busca */}
        {isSearching ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 2xl:grid-cols-4 gap-4">
            {Array.from({ length: 12 }).map((_, index) => (
              <ProductCardSkeleton key={index} />
            ))}
          </div>
        ) : displayProducts.length === 0 && searchQuery.trim() ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 2xl:grid-cols-4 gap-4">
            {Array.from({ length: 12 }).map((_, index) => (
              <ProductCardSkeleton key={index} />
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 2xl:grid-cols-4 gap-6">
              {displayProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isAuthenticated={isAuthenticated}
                />
              ))}
            </div>

            {/* Elemento observador para infinite scroll */}
            {((searchQuery.trim() && searchHasMore) ||
              (!searchQuery.trim() && hasMore)) && (
              <div ref={observerTarget} className="w-full py-8 ">
                {loadingMore && (
                  <div className="grid grid-cols-2 lg:grid-cols-4 2xl:grid-cols-4 gap-4">
                    {Array.from({ length: 8 }).map((_, index) => (
                      <ProductCardSkeleton key={`loading-${index}`} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
