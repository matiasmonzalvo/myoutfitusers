"use client";

import { getProducts, type Product } from "@/lib/actions/products";
import { ProductCard } from "@/components/products/product-card";
import { ProductCardSkeleton } from "@/components/products/product-card-skeleton";
import { useState, useEffect, useCallback, useRef } from "react";
import { useCategoryFilter } from "@/lib/contexts/category-filter-context";
import { useSearch } from "@/lib/contexts/search-context";

interface BrowseContentProps {
  isAuthenticated: boolean;
  gender: string; // "men" | "women"
}

const PRODUCTS_PER_PAGE = 16;

export function BrowseContent({ isAuthenticated, gender }: BrowseContentProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const { selectedFilter } = useCategoryFilter();
  const { searchQuery, isSearching, setIsSearching } = useSearch();
  const observerTarget = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);
  const isLoadingRef = useRef(false);

  // Función para cargar productos filtrados por género
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

        // Obtener productos del género específico o unisex
        const data = await getProducts({
          limit: PRODUCTS_PER_PAGE,
          offset: currentOffset,
          category: selectedFilter !== "all" ? selectedFilter : undefined,
          sexFilter: [gender, "unisex"], // Filtrar por género + unisex
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
    [selectedFilter, gender]
  );

  // Fetch inicial de productos
  useEffect(() => {
    loadProducts(true);
  }, []);

  // Búsqueda de productos con debounce
  const searchProducts = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      try {
        const response = await fetch(
          `/api/search-products?q=${encodeURIComponent(query)}&gender=${gender}`
        );
        const data = await response.json();
        setSearchResults(data.products || []);
      } catch (error) {
        console.error("Error searching products:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    },
    [setIsSearching, gender]
  );

  // Debounce para la búsqueda (300ms)
  useEffect(() => {
    // Si hay query, marcar como "buscando" INMEDIATAMENTE
    if (searchQuery.trim()) {
      setIsSearching(true);
    }

    const timeoutId = setTimeout(() => {
      searchProducts(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchProducts, setIsSearching]);

  // Recargar productos cuando cambia el filtro de categoría
  useEffect(() => {
    if (!searchQuery.trim()) {
      loadProducts(true);
    }
  }, [selectedFilter]);

  // Configurar IntersectionObserver para infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          hasMore &&
          !loadingMore &&
          !loading &&
          !searchQuery.trim()
        ) {
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
  }, [hasMore, loadingMore, loading, searchQuery, loadProducts]);

  // Determinar qué productos mostrar
  const displayProducts = searchQuery.trim() ? searchResults : filteredProducts;

  if (loading) {
    return (
      <div className="pb-6 h-auto w-full">
        <div className="w-full mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
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
          <div className="grid grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
            {Array.from({ length: 12 }).map((_, index) => (
              <ProductCardSkeleton key={index} />
            ))}
          </div>
        ) : displayProducts.length === 0 && searchQuery.trim() ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
            {Array.from({ length: 12 }).map((_, index) => (
              <ProductCardSkeleton key={index} />
            ))}
          </div>
        ) : displayProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-lg text-muted-foreground">
              No products found for this category
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
              {displayProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isAuthenticated={isAuthenticated}
                />
              ))}
            </div>

            {/* Elemento observador para infinite scroll */}
            {!searchQuery.trim() && hasMore && (
              <div ref={observerTarget} className="w-full py-8">
                {loadingMore && (
                  <div className="grid grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
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
