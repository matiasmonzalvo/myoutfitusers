"use server";

import { createServerClient } from "@/lib/supabase/server";

export interface Product {
  id: string;
  brand_id: string;
  name: string;
  description?: string;
  images: string[];
  product_link?: string;
  category: string;
  subcategory?: string;
  sex: string;
  is_active: boolean;
  created_at: string;
  brands?: {
    id: string;
    brand_name: string;
    brand_username: string;
    logo_url?: string;
    website_url?: string;
  };
}

export interface GetProductsParams {
  category?: string;
  brandId?: string;
  sex?: string;
  sexFilter?: string[]; // Para filtrar por múltiples géneros (e.g., ["men", "unisex"])
  limit?: number;
  offset?: number;
  randomSeed?: number; // Para orden aleatorio consistente
  userGender?: "male" | "female" | "other" | null; // Género del usuario para personalización
}

export async function getProducts(
  params?: GetProductsParams
): Promise<Product[]> {
  try {
    const supabase = await createServerClient();

    let query = supabase
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
      .eq("is_active", true);

    // Aplicar filtro de género basado en el usuario
    if (params?.userGender) {
      if (params.userGender === "male") {
        query = query.in("sex", ["men", "unisex"]);
      } else if (params.userGender === "female") {
        query = query.in("sex", ["women", "unisex"]);
      }
      // Si es "other", no aplicar filtro de sexo (mostrar todo)
    }

    // Filter by category if provided
    if (params?.category) {
      query = query.eq("category", params.category);
    }

    // Filter by brand if provided
    if (params?.brandId) {
      query = query.eq("brand_id", params.brandId);
    }

    // Filter by sex if provided (esto sobreescribe el filtro de userGender)
    if (params?.sex) {
      query = query.eq("sex", params.sex);
    }

    // Filter by multiple sex values if provided (esto sobreescribe el filtro de userGender)
    if (params?.sexFilter && params.sexFilter.length > 0) {
      query = query.in("sex", params.sexFilter);
    }

    // Para orden aleatorio con paginación efectiva
    if (params?.randomSeed !== undefined) {
      // Primero traer TODOS los productos que cumplan los filtros (para poder hacer shuffle global)
      // Esto es necesario para mantener consistencia en el orden aleatorio entre páginas
      const { data: allData, error: allError } = await query;
      
      if (allError) {
        console.error("Error fetching products for shuffle:", allError);
        return [];
      }

      let allProducts = allData || [];

      if (allProducts.length === 0) {
        return [];
      }

      // Implementar Fisher-Yates shuffle con seed para orden aleatorio consistente
      const seededRandom = (seed: number) => {
        let state = seed;
        return () => {
          state = (state * 1664525 + 1013904223) % 4294967296;
          return state / 4294967296;
        };
      };

      const rng = seededRandom(params.randomSeed);
      const shuffled = [...allProducts];
      
      // Shuffle completo de todos los productos
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }

      // Aplicar paginación después del shuffle
      const offset = params.offset || 0;
      const limit = params.limit || 16;
      return shuffled.slice(offset, offset + limit);
    } else {
      // Orden normal por fecha de creación
      query = query.order("created_at", { ascending: false });
      
      // Apply pagination using range if offset is provided, otherwise use limit
      if (params?.offset !== undefined) {
        const limit = params.limit || 10;
        query = query.range(params.offset, params.offset + limit - 1);
      } else if (params?.limit) {
        query = query.limit(params.limit);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching products:", error);
        return [];
      }

      return data || [];
    }
  } catch (error) {
    console.error("Unexpected error fetching products:", error);
    return [];
  }
}

export async function getProductsByCategory() {
  try {
    const supabase = await createServerClient();

    const { data, error } = await supabase
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
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching products:", error);
      return {
        tees: [],
        jacket: [],
        sweatshirts: [],
        bottoms: [],
        footwear: [],
        accesories: [],
      };
    }

    // Group products by category
    const productsByCategory = {
      tees: data.filter((p) => p.category === "tees"),
      jacket: data.filter((p) => p.category === "jacket"),
      sweatshirts: data.filter((p) => p.category === "sweatshirts"),
      bottoms: data.filter((p) => p.category === "bottoms"),
      footwear: data.filter((p) => p.category === "footwear"),
      accesories: data.filter((p) => p.category === "accesories"),
    };

    return productsByCategory;
  } catch (error) {
    console.error("Unexpected error:", error);
    return {
      tees: [],
      jacket: [],
      sweatshirts: [],
      bottoms: [],
      footwear: [],
      accesories: [],
    };
  }
}

export async function getBrands() {
  try {
    const supabase = await createServerClient();

    const { data, error } = await supabase
      .from("brands")
      .select(
        "id, brand_name, brand_username, logo_url, description, website_url"
      )
      .eq("is_active", true)
      .order("brand_name", { ascending: true });

    if (error) {
      console.error("Error fetching brands:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Unexpected error fetching brands:", error);
    return [];
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    const supabase = await createServerClient();

    const { data, error } = await supabase
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
      .eq("id", id)
      .eq("is_active", true)
      .single();

    if (error) {
      console.error("Error fetching product:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Unexpected error fetching product:", error);
    return null;
  }
}

export async function getSuggestedProducts(
  currentProduct: Product,
  limit: number = 8
): Promise<Product[]> {
  try {
    const supabase = await createServerClient();

    // Algoritmo inteligente de sugerencias:
    // 1. Prioridad: Misma categoría + mismo sexo + misma marca (excluyendo el producto actual)
    // 2. Secundaria: Misma categoría + mismo sexo (diferente marca)
    // 3. Terciaria: Misma categoría (cualquier sexo)
    // 4. Cuaternaria: Mismo sexo (diferente categoría)

    const suggestions: Product[] = [];
    const addedIds = new Set<string>([currentProduct.id]); // Excluir el producto actual

    // 1. Misma categoría + mismo sexo + misma marca
    const { data: sameBrand } = await supabase
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
      .eq("category", currentProduct.category)
      .eq("sex", currentProduct.sex)
      .eq("brand_id", currentProduct.brand_id)
      .neq("id", currentProduct.id)
      .order("created_at", { ascending: false })
      .limit(3);

    if (sameBrand) {
      sameBrand.forEach((p) => {
        if (!addedIds.has(p.id)) {
          suggestions.push(p as Product);
          addedIds.add(p.id);
        }
      });
    }

    // 2. Misma categoría + mismo sexo (diferente marca)
    if (suggestions.length < limit) {
      const { data: sameCategorySex } = await supabase
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
        .eq("category", currentProduct.category)
        .eq("sex", currentProduct.sex)
        .neq("brand_id", currentProduct.brand_id)
        .neq("id", currentProduct.id)
        .order("created_at", { ascending: false })
        .limit(limit - suggestions.length);

      if (sameCategorySex) {
        sameCategorySex.forEach((p) => {
          if (!addedIds.has(p.id)) {
            suggestions.push(p as Product);
            addedIds.add(p.id);
          }
        });
      }
    }

    // 3. Misma categoría (cualquier sexo compatible)
    if (suggestions.length < limit) {
      const compatibleSexes =
        currentProduct.sex === "unisex"
          ? ["men", "women", "unisex", "kids"]
          : ["unisex", currentProduct.sex];

      const { data: sameCategory } = await supabase
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
        .eq("category", currentProduct.category)
        .in("sex", compatibleSexes)
        .neq("id", currentProduct.id)
        .order("created_at", { ascending: false })
        .limit(limit - suggestions.length);

      if (sameCategory) {
        sameCategory.forEach((p) => {
          if (!addedIds.has(p.id)) {
            suggestions.push(p as Product);
            addedIds.add(p.id);
          }
        });
      }
    }

    // 4. Mismo sexo (diferente categoría) - complementarios
    if (suggestions.length < limit) {
      const { data: sameSex } = await supabase
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
        .eq("sex", currentProduct.sex)
        .neq("category", currentProduct.category)
        .neq("id", currentProduct.id)
        .order("created_at", { ascending: false })
        .limit(limit - suggestions.length);

      if (sameSex) {
        sameSex.forEach((p) => {
          if (!addedIds.has(p.id)) {
            suggestions.push(p as Product);
            addedIds.add(p.id);
          }
        });
      }
    }

    return suggestions.slice(0, limit);
  } catch (error) {
    console.error("Unexpected error fetching suggested products:", error);
    return [];
  }
}