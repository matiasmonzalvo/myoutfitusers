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

    // Dividir la búsqueda en palabras individuales (mínimo 2 caracteres)
    const searchWords = query
      .trim()
      .toLowerCase()
      .split(/\s+/)
      .filter((word) => word.length >= 2);

    if (searchWords.length === 0) {
      return NextResponse.json({ products: [] });
    }

    // Crear términos de búsqueda para cada palabra
    const searchTerms = searchWords.map((word) => `%${word}%`);

    // Buscar productos que coincidan con CUALQUIER palabra en el nombre
    // Usamos OR para cada palabra
    const nameOrConditions = searchWords
      .map((word) => `name.ilike.%${word}%`)
      .join(",");

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
      .or(nameOrConditions);

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
      .limit(100);

    // Búsqueda en marcas - también buscar por cada palabra
    const brandOrConditions = searchWords
      .map((word) => `brand_name.ilike.%${word}%,brand_username.ilike.%${word}%`)
      .join(",");

    const { data: brands, error: error2 } = await supabase
      .from("brands")
      .select("id")
      .or(brandOrConditions);

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
            website_url,
            is_verified_brand
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
        .limit(100);

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

    // Función para calcular cuántas palabras de búsqueda coinciden
    const calculateWordMatches = (
      text: string,
      words: string[]
    ): { matches: number; exactMatches: number; score: number } => {
      const textLower = text.toLowerCase();
      let matches = 0;
      let exactMatches = 0;

      for (const word of words) {
        if (textLower.includes(word)) {
          matches++;
          // Verificar si es una palabra completa (no parte de otra palabra)
          const regex = new RegExp(`\\b${word}\\b`, "i");
          if (regex.test(text)) {
            exactMatches++;
          }
        }
      }

      // Calcular score basado en coincidencias
      // Más peso a coincidencias exactas de palabras
      const totalWords = words.length;
      const matchRatio = matches / totalWords;
      const exactRatio = exactMatches / totalWords;

      // Score: exactMatches tienen más peso
      const score = exactRatio * 60 + matchRatio * 40;

      return { matches, exactMatches, score };
    };

    // Calcular relevancia para cada producto
    const scoredProducts = products.map((product) => {
      const nameResult = calculateWordMatches(product.name, searchWords);
      const brandNameResult = product.brands?.brand_name
        ? calculateWordMatches(product.brands.brand_name, searchWords)
        : { matches: 0, exactMatches: 0, score: 0 };
      const brandUsernameResult = product.brands?.brand_username
        ? calculateWordMatches(product.brands.brand_username, searchWords)
        : { matches: 0, exactMatches: 0, score: 0 };

      // Combinar scores: nombre del producto tiene más peso
      const nameScore = nameResult.score * 1.5;
      const brandScore = Math.max(brandNameResult.score, brandUsernameResult.score);

      // Total de palabras que coinciden (entre nombre y marca)
      const totalMatches = Math.max(
        nameResult.matches,
        brandNameResult.matches,
        brandUsernameResult.matches
      );

      // Score final: combinación de nombre y marca
      const finalScore = nameScore + brandScore * 0.5;

      // Bonus por coincidencia con todas las palabras
      const allWordsBonus = totalMatches === searchWords.length ? 20 : 0;

      return {
        ...product,
        relevanceScore: finalScore + allWordsBonus,
        matchedWords: totalMatches,
      };
    });

    // Filtrar productos que tengan al menos una palabra coincidente
    // y ordenar por relevancia
    const filteredProducts = scoredProducts
      .filter((p) => p.matchedWords > 0)
      .sort((a, b) => {
        // Primero ordenar por número de palabras coincidentes
        if (b.matchedWords !== a.matchedWords) {
          return b.matchedWords - a.matchedWords;
        }
        // Luego por score de relevancia
        return b.relevanceScore - a.relevanceScore;
      });

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
