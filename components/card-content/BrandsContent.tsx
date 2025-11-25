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
  is_verified_brand?: boolean;
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
          .select(
            "id, brand_name, brand_username, logo_url, website_url, description, is_verified_brand"
          )
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
          {filteredBrands.length}{" "}
          {filteredBrands.length === 1 ? "brand" : "brands"} available
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
                className="flex flex-col items-center gap-3 p-4 rounded-lg group"
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
                <div className="text-center flex items-center gap-1">
                  <h3 className="font-semibold text-sm text-foreground truncate max-w-full">
                    {brand.brand_name}
                  </h3>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width="14"
                    height="14"
                    color="#000000"
                    fill="none"
                    className="mt-[1px]"
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
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
