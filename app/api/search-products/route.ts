import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q");
    const gender = searchParams.get("gender"); // "men" | "women" | null
    const category = searchParams.get("category"); // category filter
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    if (!query || query.trim().length === 0) {
      return NextResponse.json({ products: [] });
    }

    const supabase = await createServerClient();

    // Búsqueda optimizada - primero buscamos productos por nombre
    // Luego buscaremos por marca en una consulta separada
    const searchTerm = `%${query}%`;

    // Construir query base para nombre de producto
    let productsByNameQuery = supabase
      .from("products")
      .select(
        `
        *,
        brands (
          id,
          brand_name,
          brand_username,
          logo_url,
          website_url,
          is_verified_brand
        )
      `
      )
      .eq("is_active", true)
      .ilike("name", searchTerm);

    // Aplicar filtro de género si existe
    if (gender === "men" || gender === "women") {
      productsByNameQuery = productsByNameQuery.in("sex", [gender, "unisex"]);
    }

    // Aplicar filtro de categoría si existe
    if (category) {
      productsByNameQuery = productsByNameQuery.eq("category", category);
    }

    const { data: productsByName, error: error1 } = await productsByNameQuery
      .order("created_at", { ascending: false })
      .limit(50);

    // Búsqueda en marcas
    const { data: brands, error: error2 } = await supabase
      .from("brands")
      .select("id")
      .or(`brand_name.ilike.${searchTerm},brand_username.ilike.${searchTerm}`);

    const brandIds = brands?.map((b) => b.id) || [];

    let productsByBrand: any[] = [];
    if (brandIds.length > 0) {
      let productsByBrandQuery = supabase
        .from("products")
        .select(
          `
          *,
          brands (
            id,
            brand_name,
            brand_username,
            logo_url,
            website_url
          )
        `
        )
        .eq("is_active", true)
        .in("brand_id", brandIds);

      // Aplicar filtro de género si existe
      if (gender === "men" || gender === "women") {
        productsByBrandQuery = productsByBrandQuery.in("sex", [
          gender,
          "unisex",
        ]);
      }

      // Aplicar filtro de categoría si existe
      if (category) {
        productsByBrandQuery = productsByBrandQuery.eq("category", category);
      }

      const { data, error: error3 } = await productsByBrandQuery
        .order("created_at", { ascending: false })
        .limit(50);

      productsByBrand = data || [];
    }

    // Combinar resultados y eliminar duplicados
    const productMap = new Map();
    [...(productsByName || []), ...productsByBrand].forEach((product) => {
      if (!productMap.has(product.id)) {
        productMap.set(product.id, product);
      }
    });

    const products = Array.from(productMap.values());

    if (error1 && error2) {
      console.error("Error searching products:", error1);
      return NextResponse.json({ products: [] });
    }

    // Implementar fuzzy matching en el lado del servidor para mejor precisión
    const fuzzyMatch = (text: string, searchTerm: string): number => {
      const textLower = text.toLowerCase();
      const searchLower = searchTerm.toLowerCase();

      // Coincidencia exacta
      if (textLower === searchLower) return 100;

      // Comienza con el término
      if (textLower.startsWith(searchLower)) return 90;

      // Contiene el término
      if (textLower.includes(searchLower)) return 80;

      // Fuzzy matching básico (Levenshtein simplificado)
      let matches = 0;
      let searchIndex = 0;

      for (
        let i = 0;
        i < textLower.length && searchIndex < searchLower.length;
        i++
      ) {
        if (textLower[i] === searchLower[searchIndex]) {
          matches++;
          searchIndex++;
        }
      }

      const ratio = matches / searchLower.length;
      return ratio > 0.6 ? ratio * 70 : 0;
    };

    // Ordenar por relevancia
    const scoredProducts =
      products?.map((product) => {
        const nameScore = fuzzyMatch(product.name, query);
        const brandNameScore = product.brands?.brand_name
          ? fuzzyMatch(product.brands.brand_name, query)
          : 0;
        const brandUsernameScore = product.brands?.brand_username
          ? fuzzyMatch(product.brands.brand_username, query)
          : 0;

        const maxScore = Math.max(
          nameScore,
          brandNameScore,
          brandUsernameScore
        );

        return {
          ...product,
          relevanceScore: maxScore,
        };
      }) || [];

    // Filtrar productos con score mínimo y ordenar por relevancia
    const filteredProducts = scoredProducts
      .filter((p) => p.relevanceScore > 30)
      .sort((a, b) => b.relevanceScore - a.relevanceScore);

    // Aplicar paginación
    const paginatedProducts = filteredProducts.slice(offset, offset + limit);

    return NextResponse.json({ products: paginatedProducts });
  } catch (error) {
    console.error("Unexpected error in search:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
