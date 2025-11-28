"use client";

import { getProducts, type Product } from "@/lib/actions/products";
import { ProductCard } from "@/components/products/product-card";
import { ProductCardSkeleton } from "@/components/products/product-card-skeleton";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useCategoryFilter } from "@/lib/contexts/category-filter-context";
import { useSearch } from "@/lib/contexts/search-context";
import { useFeedCache } from "@/lib/contexts/feed-cache-context";
import { createServerClient } from "@/lib/supabase/client";
import { AvatarHub } from "../AvatarHub";
import { WelcomeDialog } from "../WelcomeDialog";
import { usePathname } from "next/navigation";

interface HomeContentProps {
  isAuthenticated: boolean;
}

const PRODUCTS_PER_PAGE = 16;

export function HomeContent({ isAuthenticated }: HomeContentProps) {
  const pathname = usePathname();
  const {
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
  } = useFeedCache();

  // Usar productos del caché o estado vacío
  const [products, setProducts] = useState<Product[]>(cache.products);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(
    cache.filteredProducts
  );
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(!cache.isInitialized);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(cache.hasMore);
  const [searchHasMore, setSearchHasMore] = useState(true);
  const [userGender, setUserGender] = useState<
    "male" | "female" | "other" | null
  >(null);
  const [isGenderLoaded, setIsGenderLoaded] = useState(false);
  const { selectedFilter } = useCategoryFilter();
  const { searchQuery, isSearching, setIsSearching } = useSearch();

  // Refs para el scroll y la carga
  const offsetRef = useRef(cache.offset);
  const searchOffsetRef = useRef(0);
  const isLoadingRef = useRef(false);
  const isSearchLoadingRef = useRef(false);
  const randomSeedRef = useRef<number>(cache.randomSeed);
  const hasInitialLoadRef = useRef(cache.isInitialized);
  const scrollContainerRef = useRef<HTMLElement | null>(null);
  const hasMountedRef = useRef(false);

  // Función para obtener la posición actual del scroll
  const getCurrentScrollPosition = useCallback(() => {
    // En mobile, usar window.scrollY
    if (window.innerWidth < 1024) {
      return window.scrollY;
    }
    // En desktop, usar el contenedor scrollable
    if (scrollContainerRef.current) {
      return scrollContainerRef.current.scrollTop;
    }
    return 0;
  }, []);

  // Función para restaurar la posición del scroll
  const restoreScrollPosition = useCallback((position: number) => {
    if (position <= 0) return;

    // Usar requestAnimationFrame para asegurar que el DOM esté listo
    requestAnimationFrame(() => {
      if (window.innerWidth < 1024) {
        // Mobile: scroll del window
        window.scrollTo(0, position);
      } else if (scrollContainerRef.current) {
        // Desktop: scroll del contenedor
        scrollContainerRef.current.scrollTop = position;
      }
    });
  }, []);

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
          setCachedHasMore(true);
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
          setCachedHasMore(false);
        }

        if (reset) {
          setProducts(data);
          setFilteredProducts(data);
          setCachedProducts(data, data);
          offsetRef.current = PRODUCTS_PER_PAGE;
          setCachedOffset(PRODUCTS_PER_PAGE);
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
          // Actualizar el caché con los nuevos productos
          appendCachedProducts(data, data);
          offsetRef.current = currentOffset + PRODUCTS_PER_PAGE;
          setCachedOffset(currentOffset + PRODUCTS_PER_PAGE);
        }

        // Marcar como inicializado
        setInitialized(true);
        setCachedFilter(selectedFilter);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
        setLoadingMore(false);
        isLoadingRef.current = false;
      }
    },
    [
      selectedFilter,
      userGender,
      setCachedProducts,
      appendCachedProducts,
      setCachedOffset,
      setCachedHasMore,
      setInitialized,
      setCachedFilter,
    ]
  );

  // Efecto para encontrar y guardar referencia al contenedor scrollable
  useEffect(() => {
    // Buscar el contenedor scrollable del layout
    const findContainer = () => {
      // En desktop, el scroll está en el div con overflow-y-auto dentro de SidebarInset
      // Buscar todos los contenedores con overflow-y-auto que tengan scroll real
      const containers = document.querySelectorAll(".overflow-y-auto");
      for (const container of containers) {
        if (container instanceof HTMLElement) {
          // Verificar que sea un contenedor de scroll válido (tiene contenido scrollable)
          const rect = container.getBoundingClientRect();
          // Priorizar contenedores grandes que probablemente sean el contenedor principal
          if (
            rect.height > 200 &&
            container.scrollHeight > container.clientHeight
          ) {
            scrollContainerRef.current = container;
            return;
          }
        }
      }

      // Si no encontramos uno con scroll activo, buscar el más grande
      let largestContainer: HTMLElement | null = null;
      let largestHeight = 0;
      for (const container of containers) {
        if (container instanceof HTMLElement) {
          const rect = container.getBoundingClientRect();
          if (rect.height > largestHeight) {
            largestHeight = rect.height;
            largestContainer = container;
          }
        }
      }
      if (largestContainer) {
        scrollContainerRef.current = largestContainer;
      }
    };

    // Esperar a que el DOM esté listo y los productos se rendericen
    const timer = setTimeout(findContainer, 100);
    return () => clearTimeout(timer);
  }, [products.length]);

  // Efecto para restaurar la posición del scroll cuando hay productos en caché
  useEffect(() => {
    // Solo intentar restaurar una vez al montar y cuando hay productos en caché
    if (
      !cache.isInitialized ||
      cache.products.length === 0 ||
      pathname !== "/"
    ) {
      return;
    }

    // Evitar restaurar múltiples veces
    if (hasMountedRef.current) return;
    hasMountedRef.current = true;

    // Esperar a que el contenedor de scroll se encuentre y los productos se rendericen
    const attemptRestore = (attempts: number = 0) => {
      if (attempts > 10) return; // Máximo 10 intentos

      const position = cache.scrollPosition;
      if (position <= 0) return;

      // Verificar si ya tenemos el contenedor de scroll
      if (window.innerWidth >= 1024 && !scrollContainerRef.current) {
        // En desktop, esperar al contenedor
        setTimeout(() => attemptRestore(attempts + 1), 50);
        return;
      }

      restoreScrollPosition(position);
    };

    // Dar tiempo para que los productos se rendericen
    const timer = setTimeout(() => attemptRestore(), 150);
    return () => clearTimeout(timer);
  }, [
    cache.isInitialized,
    cache.products.length,
    cache.scrollPosition,
    pathname,
    restoreScrollPosition,
  ]);

  // Efecto para guardar la posición del scroll antes de navegar
  useEffect(() => {
    const handleBeforeUnload = () => {
      const position = getCurrentScrollPosition();
      setCachedScrollPosition(position);
    };

    // Guardar scroll position periódicamente mientras el usuario scrollea
    let scrollTimeout: NodeJS.Timeout;
    const handleScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const position = getCurrentScrollPosition();
        setCachedScrollPosition(position);
      }, 150);
    };

    // Agregar listeners para desktop y mobile
    if (scrollContainerRef.current) {
      scrollContainerRef.current.addEventListener("scroll", handleScroll, {
        passive: true,
      });
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      clearTimeout(scrollTimeout);
      if (scrollContainerRef.current) {
        scrollContainerRef.current.removeEventListener("scroll", handleScroll);
      }
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("beforeunload", handleBeforeUnload);

      // Guardar posición al desmontar (cuando navega a otra página)
      const position = getCurrentScrollPosition();
      setCachedScrollPosition(position);
    };
  }, [getCurrentScrollPosition, setCachedScrollPosition]);

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
  // O usar el caché si ya hay productos y el filtro no cambió
  useEffect(() => {
    if (!isGenderLoaded) return;

    // Si ya hay productos en caché y el filtro es el mismo, no recargar
    if (
      cache.isInitialized &&
      cache.products.length > 0 &&
      cache.lastFilter === selectedFilter
    ) {
      // Usar los productos del caché
      setProducts(cache.products);
      setFilteredProducts(cache.filteredProducts);
      setHasMore(cache.hasMore);
      offsetRef.current = cache.offset;
      hasInitialLoadRef.current = true;
      setLoading(false);
      return;
    }

    // Si el filtro cambió, limpiar el caché y recargar
    if (cache.isInitialized && cache.lastFilter !== selectedFilter) {
      clearCache();
      hasInitialLoadRef.current = false;
    }

    // Cargar productos si no hay caché o si el filtro cambió
    if (!hasInitialLoadRef.current) {
      hasInitialLoadRef.current = true;
      loadProducts(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isGenderLoaded, selectedFilter]);

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

  // Recargar productos cuando cambia el filtro de categoría
  // La lógica de verificación del caché ya está en el efecto de carga inicial

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
  const displayProducts = searchQuery.trim() ? searchResults : filteredProducts;

  // Determinar si mostrar skeletons de productos (carga inicial o búsqueda)
  const showProductSkeletons =
    loading ||
    isSearching ||
    (displayProducts.length === 0 && searchQuery.trim());

  return (
    <div className="pb-6 h-auto w-full overflow-hidden">
      {/* Welcome Dialog - solo aparece una vez después del onboarding */}
      <Suspense fallback={null}>
        <WelcomeDialog />
      </Suspense>

      {/* AvatarHub - siempre visible en mobile, se renderiza una sola vez */}
      <div className="lg:hidden w-auto pt-0 lg:p-10 mb-10 lg:h-screen flex flex-col items-center justify-start">
        <AvatarHub isAuthenticated={isAuthenticated} />
      </div>

      <div className="w-full mx-auto">
        {/* Mostrar skeletons mientras se cargan productos o se busca */}
        {showProductSkeletons ? (
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
