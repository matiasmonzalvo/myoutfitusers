"use client";

import { notFound } from "next/navigation";
import { getProducts, type Product } from "@/lib/actions/products";
import Image from "next/image";
import { Globe } from "lucide-react";
import { ProductCard } from "@/components/products/product-card";
import { useState, useEffect } from "react";
import { createServerClient } from "@/lib/supabase/client";

interface Brand {
  id: string;
  brand_name: string;
  brand_username: string;
  logo_url?: string;
  description?: string;
  website_url?: string;
  created_at: string;
}

interface BrandProfilePageProps {
  params: Promise<{
    brand_username: string;
  }>;
}

export default function BrandProfilePage({ params }: BrandProfilePageProps) {
  const [brand, setBrand] = useState<Brand | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
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
            "id, brand_name, brand_username, logo_url, description, website_url, created_at"
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

        // Obtener productos de la marca
        const productsData = await getProducts({ brandId: brandData.id });
        setProducts(productsData);
      } catch (error) {
        console.error("Error loading brand data:", error);
        setBrand(null);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [params]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-gray-100 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!brand) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-neutral-100 -mt-2">
      {/* Header */}
      <div className="border-b border-border pb-4 sticky top-0 bg-neutral-100 z-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center space-x-2">
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
                <span className="text-2xl font-bold text-gray-600 dark:text-gray-300">
                  {brand.brand_name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-black tracking-tighter">
                {brand.brand_name}
              </h1>
            </div>

            <div className="flex space-x-3">
              {brand.website_url && (
                <a
                  href={brand.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Globe className="w-4 h-4 mr-2" />
                  Sitio Web
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto">
        {products.length > 0 ? (
          <div className="py-6">
            <div className="grid grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-5">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isAuthenticated={isAuthenticated}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <span className="text-2xl">📦</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No hay productos disponibles
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Esta marca aún no ha agregado productos.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
