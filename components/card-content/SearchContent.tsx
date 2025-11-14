"use client";

import { Search as SearchIcon, ExternalLink } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface Brand {
  id: string;
  brand_name: string;
  brand_username: string;
  logo_url?: string;
  description?: string;
  website_url?: string;
}

interface SearchContentProps {
  isAuthenticated: boolean;
}

export function SearchContent({ isAuthenticated }: SearchContentProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const searchBrands = useCallback(async (query: string) => {
    if (!query.trim()) {
      setBrands([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(query)}`
      );
      const data = await response.json();
      setBrands(data.brands || []);
    } catch (error) {
      console.error("Error searching brands:", error);
      setBrands([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchBrands(searchQuery);
    }, 300); // Debounce search by 300ms

    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchBrands]);

  const handleBrandClick = (brandUsername: string) => {
    router.push(`/${brandUsername}`);
  };

  return (
    <div className="px-6 pb-6 h-full flex flex-col">
      <div className="mb-4">
        <h1 className="text-4xl font-bold text-foreground tracking-tighter mb-4">
          Buscar
        </h1>
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar marcas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-muted focus:outline-none"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        )}

        {!isLoading && searchQuery && brands.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No se encontraron marcas con "{searchQuery}"
          </div>
        )}

        {!isLoading && brands.length > 0 && (
          <div className="space-y-3">
            {brands.map((brand) => (
              <div
                key={brand.id}
                onClick={() => handleBrandClick(brand.brand_username)}
                className="flex items-center p-4 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700 cursor-pointer transition-colors"
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-full overflow-hidden bg-neutral-100 dark:bg-neutral-700 flex items-center justify-center">
                  {brand.logo_url ? (
                    <Image
                      src={brand.logo_url}
                      alt={brand.brand_name}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-lg font-semibold text-neutral-600 dark:text-neutral-300">
                      {brand.brand_name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>

                <div className="ml-4 flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
                    {brand.brand_name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    @{brand.brand_username}
                  </p>
                  {brand.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                      {brand.description}
                    </p>
                  )}
                </div>

                <ExternalLink className="w-5 h-5 text-gray-400 flex-shrink-0" />
              </div>
            ))}
          </div>
        )}

        {!searchQuery && (
          <div className="text-center py-12 text-gray-500">
            <SearchIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Busca marcas para descubrir productos</p>
          </div>
        )}
      </div>
    </div>
  );
}
