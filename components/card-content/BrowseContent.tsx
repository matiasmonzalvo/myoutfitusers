"use client";

import { getProducts, type Product } from "@/lib/actions/products";
import { ProductCard } from "@/components/products/product-card";
import { ProductCardSkeleton } from "@/components/products/product-card-skeleton";
import { useState, useEffect, useCallback, useRef } from "react";
import { useSearch } from "@/lib/contexts/search-context";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BrowseContentProps {
  isAuthenticated: boolean;
  gender: string; // "men" | "women"
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

export function BrowseContent({ isAuthenticated, gender }: BrowseContentProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [searchHasMore, setSearchHasMore] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const { searchQuery, isSearching, setIsSearching } = useSearch();
  const observerTarget = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);
  const searchOffsetRef = useRef(0);
  const isLoadingRef = useRef(false);
  const isSearchLoadingRef = useRef(false);
  const randomSeedRef = useRef<number>(Math.floor(Math.random() * 1000000));

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
          category: selectedCategory !== "all" ? selectedCategory : undefined,
          sexFilter: [gender, "unisex"], // Filtrar por género + unisex
          randomSeed: randomSeedRef.current, // Orden aleatorio
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
    [selectedCategory, gender]
  );

  // Fetch inicial de productos
  useEffect(() => {
    loadProducts(true);
  }, []);

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
          `/api/search-products?q=${encodeURIComponent(query)}&gender=${gender}&limit=${PRODUCTS_PER_PAGE}&offset=${currentOffset}`
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
    [setIsSearching, gender]
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

  // Recargar productos cuando cambia el filtro de categoría
  useEffect(() => {
    if (!searchQuery.trim()) {
      loadProducts(true);
    }
  }, [selectedCategory]);

  // Configurar IntersectionObserver para infinite scroll
  useEffect(() => {
    // No observar si estamos en estado de carga inicial o búsqueda
    if (isSearching || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          !loadingMore &&
          !isSearchLoadingRef.current
        ) {
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
      { threshold: 0.1, rootMargin: "100px" }
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
    isSearching,
    searchQuery,
    loadProducts,
    searchProducts,
  ]);

  // Determinar qué productos mostrar
  const displayProducts = searchQuery.trim() ? searchResults : filteredProducts;

  // Handler para cambiar la categoría
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  // Título del género
  const genderTitle = gender === "men" ? "Men" : "Women";

  if (loading) {
    return (
      <div className="pb-6 h-auto w-full">
        {/* Header */}
        <div className="border-b border-border pb-4 mb-6">
          <h1 className="text-2xl font-semibold text-foreground tracking-tighter mb-4 leading-[1]">
            {genderTitle}
          </h1>
          <Select value={selectedCategory} onValueChange={handleCategoryChange}>
            <SelectTrigger className="w-[200px] rounded-full border-0 bg-muted text-sm font-medium tracking-tight hover:opacity-80 transition-all h-8">
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
    <div className="pb-6 h-auto w-full">
      {/* Header */}
      <div className="border-b border-border pb-4 mb-6">
        <h1 className="text-2xl font-semibold text-foreground tracking-tighter mb-4 leading-[1]">
          {genderTitle}
        </h1>
        <Select value={selectedCategory} onValueChange={handleCategoryChange}>
          <SelectTrigger className="w-[200px] rounded-full border-0 bg-muted text-sm font-medium tracking-tight hover:opacity-80 transition-all h-8">
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
            {((searchQuery.trim() && searchHasMore) ||
              (!searchQuery.trim() && hasMore)) && (
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
