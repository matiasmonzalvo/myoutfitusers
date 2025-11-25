"use client";

import { getProducts, type Product } from "@/lib/actions/products";
import { ProductCard } from "@/components/products/product-card";
import { ProductCardSkeleton } from "@/components/products/product-card-skeleton";
import { useState, useEffect, useCallback, useRef } from "react";
import { useSearch } from "@/lib/contexts/search-context";

interface NewContentProps {
  isAuthenticated: boolean;
}

const PRODUCTS_PER_PAGE = 16;

export function NewContent({ isAuthenticated }: NewContentProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [searchHasMore, setSearchHasMore] = useState(true);
  const { searchQuery, isSearching, setIsSearching } = useSearch();
  const offsetRef = useRef(0);
  const searchOffsetRef = useRef(0);
  const isLoadingRef = useRef(false);
  const isSearchLoadingRef = useRef(false);
  const hasInitialLoadRef = useRef(false);

  // Función para cargar productos ordenados por fecha (más recientes primero)
  const loadProducts = useCallback(async (reset: boolean = false) => {
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
      // Sin randomSeed ni userGender - orden por created_at descendente
      const data = await getProducts({
        limit: PRODUCTS_PER_PAGE,
        offset: currentOffset,
      });

      if (data.length < PRODUCTS_PER_PAGE) {
        setHasMore(false);
      }

      if (reset) {
        setProducts(data);
        offsetRef.current = PRODUCTS_PER_PAGE;
      } else {
        setProducts((prev) => {
          // Filtrar duplicados usando un Set
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
  }, []);

  // Cargar productos inicial (una sola vez)
  useEffect(() => {
    if (!hasInitialLoadRef.current) {
      hasInitialLoadRef.current = true;
      loadProducts(true);
    }
  }, [loadProducts]);

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
    // Si hay query, marcar como "buscando" INMEDIATAMENTE y limpiar resultados anteriores
    if (searchQuery.trim()) {
      setIsSearching(true);
      setSearchResults([]); // Limpiar resultados anteriores inmediatamente
      searchOffsetRef.current = 0;
    }

    const timeoutId = setTimeout(() => {
      searchProducts(searchQuery, true); // Reset en cada nueva búsqueda
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchProducts, setIsSearching]);

  // Referencia al observer para poder limpiarlo
  const observerRef = useRef<IntersectionObserver | null>(null);
  const observerNodeRef = useRef<HTMLDivElement | null>(null);

  // Refs para valores que el observer necesita leer (siempre actualizados)
  const searchQueryRef = useRef(searchQuery);
  const hasMoreRef = useRef(hasMore);
  const searchHasMoreRef = useRef(searchHasMore);
  const loadProductsRef = useRef(loadProducts);
  const searchProductsRef = useRef(searchProducts);

  // Mantener refs actualizados
  useEffect(() => {
    searchQueryRef.current = searchQuery;
    hasMoreRef.current = hasMore;
    searchHasMoreRef.current = searchHasMore;
    loadProductsRef.current = loadProducts;
    searchProductsRef.current = searchProducts;
  }, [searchQuery, hasMore, searchHasMore, loadProducts, searchProducts]);

  // Callback ref para el elemento observer - se ejecuta cuando el elemento aparece/desaparece del DOM
  const setObserverTarget = useCallback((node: HTMLDivElement | null) => {
    // Limpiar observer anterior
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }

    observerNodeRef.current = node;

    // Si no hay nodo, no hacer nada
    if (!node) return;

    // Crear nuevo observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        // Solo actuar si el elemento es visible y no estamos cargando
        if (
          entries[0].isIntersecting &&
          !isSearchLoadingRef.current &&
          !isLoadingRef.current
        ) {
          const currentSearchQuery = searchQueryRef.current;
          const currentSearchHasMore = searchHasMoreRef.current;
          const currentHasMore = hasMoreRef.current;

          // Si hay búsqueda activa, cargar más resultados de búsqueda
          if (currentSearchQuery.trim() && currentSearchHasMore) {
            searchProductsRef.current(currentSearchQuery, false);
          }
          // Si no hay búsqueda, cargar más productos normales
          else if (!currentSearchQuery.trim() && currentHasMore) {
            loadProductsRef.current(false);
          }
        }
      },
      { threshold: 0.1, rootMargin: "200px" }
    );

    observerRef.current.observe(node);
  }, []);

  // Limpiar observer al desmontar
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  // Determinar qué productos mostrar
  const displayProducts = searchQuery.trim() ? searchResults : products;

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
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-6">
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
              <div ref={setObserverTarget} className="w-full py-8 ">
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
