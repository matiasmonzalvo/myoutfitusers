"use client";

import { useState, useEffect } from "react";
import { createServerClient } from "@/lib/supabase/client";
import Link from "next/link";
import Image from "next/image";
import { useSearch } from "@/lib/contexts/search-context";

interface Brand {
  id: string;
  brand_name: string;
  brand_username: string;
  logo_url?: string;
  website_url?: string;
  description?: string;
}

interface BrandsContentProps {
  isAuthenticated: boolean;
}

export function BrandsContent({ isAuthenticated }: BrandsContentProps) {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [filteredBrands, setFilteredBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const { searchQuery } = useSearch();
  const supabase = createServerClient();

  // Cargar todas las marcas
  useEffect(() => {
    const loadBrands = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("brands")
          .select("id, brand_name, brand_username, logo_url, website_url, description")
          .eq("is_active", true)
          .order("brand_name", { ascending: true });

        if (error) {
          console.error("Error fetching brands:", error);
          setBrands([]);
        } else {
          setBrands(data || []);
          setFilteredBrands(data || []);
        }
      } catch (error) {
        console.error("Error loading brands:", error);
        setBrands([]);
      } finally {
        setLoading(false);
      }
    };

    loadBrands();
  }, []);

  // Filtrar marcas por búsqueda
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredBrands(brands);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = brands.filter(
      (brand) =>
        brand.brand_name.toLowerCase().includes(query) ||
        brand.brand_username.toLowerCase().includes(query)
    );
    setFilteredBrands(filtered);
  }, [searchQuery, brands]);

  if (loading) {
    return (
      <div className="pb-6 h-auto w-full">
        <div className="w-full mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8">All Brands</h1>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {Array.from({ length: 20 }).map((_, index) => (
              <div
                key={index}
                className="flex flex-col items-center gap-3 p-4 rounded-lg border border-border bg-white animate-pulse"
              >
                <div className="w-20 h-20 rounded-full bg-gray-200" />
                <div className="w-24 h-4 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-6 h-auto w-full overflow-y-auto">
      <div className="w-full mx-auto px-4">
        <h1 className="text-3xl font-bold mb-2">All Brands</h1>
        <p className="text-muted-foreground mb-8">
          {filteredBrands.length} {filteredBrands.length === 1 ? "brand" : "brands"} available
        </p>

        {filteredBrands.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-lg text-muted-foreground">
              {searchQuery.trim()
                ? "No brands found matching your search"
                : "No brands available"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredBrands.map((brand) => (
              <Link
                key={brand.id}
                href={`/${brand.brand_username}`}
                className="flex flex-col items-center gap-3 p-4 rounded-lg border border-border bg-white hover:shadow-md transition-shadow group"
              >
                {brand.logo_url ? (
                  <div className="w-20 h-20 rounded-full border border-border overflow-hidden">
                    <Image
                      src={brand.logo_url}
                      alt={brand.brand_name}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-2xl font-semibold text-gray-600">
                    {brand.brand_name.charAt(0)}
                  </div>
                )}
                <div className="text-center">
                  <h3 className="font-semibold text-sm text-neutral-800 group-hover:text-black transition-colors truncate max-w-full">
                    {brand.brand_name}
                  </h3>
                  {brand.description && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {brand.description}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

