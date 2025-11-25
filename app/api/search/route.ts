import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query || query.trim().length === 0) {
      return NextResponse.json({ brands: [] });
    }

    const supabase = await createServerClient();

    // Dividir la búsqueda en palabras individuales (mínimo 2 caracteres)
    const searchWords = query
      .trim()
      .toLowerCase()
      .split(/\s+/)
      .filter((word) => word.length >= 2);

    if (searchWords.length === 0) {
      return NextResponse.json({ brands: [] });
    }

    // Crear condiciones OR para cada palabra en nombre y username
    const orConditions = searchWords
      .map((word) => `brand_name.ilike.%${word}%,brand_username.ilike.%${word}%`)
      .join(",");

    // Search brands by name or username (cualquier palabra debe coincidir)
    const { data: brands, error } = await supabase
      .from("brands")
      .select(
        "id, brand_name, brand_username, logo_url, description, website_url"
      )
      .eq("is_active", true)
      .or(orConditions)
      .order("brand_name", { ascending: true })
      .limit(20);

    if (error) {
      console.error("Error searching brands:", error);
      return NextResponse.json({ brands: [] });
    }

    // Calcular relevancia para ordenar mejor los resultados
    const calculateRelevance = (brand: any): number => {
      const nameLower = brand.brand_name.toLowerCase();
      const usernameLower = brand.brand_username.toLowerCase();
      let score = 0;
      let matchedWords = 0;

      for (const word of searchWords) {
        if (nameLower.includes(word) || usernameLower.includes(word)) {
          matchedWords++;
          // Bonus por coincidencia exacta de palabra
          const nameRegex = new RegExp(`\\b${word}\\b`, "i");
          if (nameRegex.test(brand.brand_name)) {
            score += 20;
          }
          if (nameRegex.test(brand.brand_username)) {
            score += 15;
          }
          // Bonus si el nombre empieza con la palabra
          if (nameLower.startsWith(word)) {
            score += 10;
          }
        }
      }

      // Bonus por coincidir con todas las palabras
      if (matchedWords === searchWords.length) {
        score += 30;
      }

      return score + matchedWords * 10;
    };

    // Ordenar por relevancia
    const sortedBrands = (brands || [])
      .map((brand) => ({
        ...brand,
        relevance: calculateRelevance(brand),
      }))
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 10);

    return NextResponse.json({ brands: sortedBrands });
  } catch (error) {
    console.error("Unexpected error in search:", error);
    return NextResponse.json({ brands: [] });
  }
}
