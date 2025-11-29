"use client";

import type React from "react";
import { createContext, useContext, useState, useCallback, useRef } from "react";
import type { Product } from "@/lib/actions/products";

interface FeedCacheState {
  products: Product[];
  filteredProducts: Product[];
  offset: number;
  hasMore: boolean;
  randomSeed: number;
  scrollPosition: number;
  isInitialized: boolean;
  lastFilter: string;
}

interface FeedCacheContextType {
  // Estado del caché
  cache: FeedCacheState;
  
  // Métodos para actualizar el caché
  setCachedProducts: (products: Product[], filteredProducts: Product[]) => void;
  appendCachedProducts: (newProducts: Product[], newFilteredProducts: Product[]) => void;
  setCachedOffset: (offset: number) => void;
  setCachedHasMore: (hasMore: boolean) => void;
  setCachedScrollPosition: (position: number) => void;
  setInitialized: (initialized: boolean) => void;
  setCachedFilter: (filter: string) => void;
  
  // Método para limpiar el caché (cuando cambia el filtro, por ejemplo)
  clearCache: () => void;
  
  // Método para obtener un nuevo random seed
  getRandomSeed: () => number;
}

const defaultCacheState: FeedCacheState = {
  products: [],
  filteredProducts: [],
  offset: 0,
  hasMore: true,
  randomSeed: Math.floor(Math.random() * 1000000),
  scrollPosition: 0,
  isInitialized: false,
  lastFilter: "all",
};

const FeedCacheContext = createContext<FeedCacheContextType | undefined>(undefined);

export function FeedCacheProvider({ children }: { children: React.ReactNode }) {
  const [cache, setCache] = useState<FeedCacheState>(defaultCacheState);
  const randomSeedRef = useRef<number>(defaultCacheState.randomSeed);

  const setCachedProducts = useCallback((products: Product[], filteredProducts: Product[]) => {
    setCache((prev) => ({
      ...prev,
      products,
      filteredProducts,
    }));
  }, []);

  const appendCachedProducts = useCallback((newProducts: Product[], newFilteredProducts: Product[]) => {
    setCache((prev) => {
      // Filtrar duplicados usando un Set
      const existingIds = new Set(prev.products.map((p) => p.id));
      const uniqueNewProducts = newProducts.filter((p) => !existingIds.has(p.id));
      
      const existingFilteredIds = new Set(prev.filteredProducts.map((p) => p.id));
      const uniqueNewFilteredProducts = newFilteredProducts.filter((p) => !existingFilteredIds.has(p.id));

      return {
        ...prev,
        products: [...prev.products, ...uniqueNewProducts],
        filteredProducts: [...prev.filteredProducts, ...uniqueNewFilteredProducts],
      };
    });
  }, []);

  const setCachedOffset = useCallback((offset: number) => {
    setCache((prev) => ({
      ...prev,
      offset,
    }));
  }, []);

  const setCachedHasMore = useCallback((hasMore: boolean) => {
    setCache((prev) => ({
      ...prev,
      hasMore,
    }));
  }, []);

  const setCachedScrollPosition = useCallback((position: number) => {
    setCache((prev) => ({
      ...prev,
      scrollPosition: position,
    }));
  }, []);

  const setInitialized = useCallback((initialized: boolean) => {
    setCache((prev) => ({
      ...prev,
      isInitialized: initialized,
    }));
  }, []);

  const setCachedFilter = useCallback((filter: string) => {
    setCache((prev) => ({
      ...prev,
      lastFilter: filter,
    }));
  }, []);

  const clearCache = useCallback(() => {
    // Generar nuevo random seed al limpiar
    randomSeedRef.current = Math.floor(Math.random() * 1000000);
    setCache({
      ...defaultCacheState,
      randomSeed: randomSeedRef.current,
    });
  }, []);

  const getRandomSeed = useCallback(() => {
    return randomSeedRef.current;
  }, []);

  return (
    <FeedCacheContext.Provider
      value={{
        cache,
        setCachedProducts,
        appendCachedProducts,
        setCachedOffset,
        setCachedHasMore,
        setCachedScrollPosition,
        setInitialized,
        setCachedFilter,
        clearCache,
        getRandomSeed,
      }}
    >
      {children}
    </FeedCacheContext.Provider>
  );
}

export function useFeedCache() {
  const context = useContext(FeedCacheContext);
  if (context === undefined) {
    throw new Error("useFeedCache must be used within a FeedCacheProvider");
  }
  return context;
}


