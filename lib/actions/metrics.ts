"use server";

import { createServerClient } from "@/lib/supabase/server";

export interface ProductMetrics {
  id: string;
  name: string;
  total_worn_count: number;
  total_link_clicks: number;
  total_product_views: number;
  total_outfit_downloads: number;
  total_outfit_saves: number;
  images: string[];
  category: string;
}

export interface DailyMetrics {
  event_date: string;
  worn_count: number;
  link_clicks: number;
  product_views: number;
  outfit_downloads: number;
  outfit_saves: number;
}

export interface BrandMetricsSummary {
  total_products: number;
  total_worn_count: number;
  total_link_clicks: number;
  total_product_views: number;
  total_outfit_downloads: number;
  total_outfit_saves: number;
  events_today: number;
}

/**
 * Obtiene las métricas de todos los productos de una marca
 */
export async function getBrandProductsMetrics(
  brandId: string
): Promise<ProductMetrics[]> {
  try {
    const supabase = await createServerClient();

    const { data, error } = await supabase
      .from("products")
      .select("id, name, total_worn_count, total_link_clicks, total_product_views, total_outfit_downloads, total_outfit_saves, images, category")
      .eq("brand_id", brandId)
      .order("total_worn_count", { ascending: false });

    if (error) {
      console.error("Error fetching brand products metrics:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Unexpected error fetching brand products metrics:", error);
    return [];
  }
}

/**
 * Obtiene las métricas diarias de un producto específico
 */
export async function getProductDailyMetrics(
  productId: string,
  daysBack: number = 30
): Promise<DailyMetrics[]> {
  try {
    const supabase = await createServerClient();

    const { data, error } = await supabase.rpc("get_product_metrics", {
      p_product_id: productId,
      p_days_back: daysBack,
    });

    if (error) {
      console.error("Error fetching product daily metrics:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Unexpected error fetching product daily metrics:", error);
    return [];
  }
}

/**
 * Obtiene las métricas diarias agregadas de toda una marca
 */
export async function getBrandDailyMetrics(
  brandId: string,
  daysBack: number = 30
): Promise<DailyMetrics[]> {
  try {
    const supabase = await createServerClient();

    const { data, error } = await supabase.rpc("get_brand_metrics", {
      p_brand_id: brandId,
      p_days_back: daysBack,
    });

    if (error) {
      console.error("Error fetching brand daily metrics:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Unexpected error fetching brand daily metrics:", error);
    return [];
  }
}

/**
 * Obtiene el resumen de métricas totales de una marca
 */
export async function getBrandMetricsSummary(
  brandId: string
): Promise<BrandMetricsSummary> {
  try {
    const supabase = await createServerClient();

    // Obtener totales de productos
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("total_worn_count, total_link_clicks, total_product_views, total_outfit_downloads, total_outfit_saves")
      .eq("brand_id", brandId);

    if (productsError) {
      console.error("Error fetching products for summary:", productsError);
      return {
        total_products: 0,
        total_worn_count: 0,
        total_link_clicks: 0,
        total_product_views: 0,
        total_outfit_downloads: 0,
        total_outfit_saves: 0,
        events_today: 0,
      };
    }

    // Calcular totales
    const total_products = products.length;
    const total_worn_count = products.reduce(
      (sum, p) => sum + (p.total_worn_count || 0),
      0
    );
    const total_link_clicks = products.reduce(
      (sum, p) => sum + (p.total_link_clicks || 0),
      0
    );
    const total_product_views = products.reduce(
      (sum, p) => sum + (p.total_product_views || 0),
      0
    );
    const total_outfit_downloads = products.reduce(
      (sum, p) => sum + (p.total_outfit_downloads || 0),
      0
    );
    const total_outfit_saves = products.reduce(
      (sum, p) => sum + (p.total_outfit_saves || 0),
      0
    );

    // Obtener eventos de hoy
    const today = new Date().toISOString().split("T")[0];
    const { count: todayCount, error: todayError } = await supabase
      .from("product_events")
      .select("*", { count: "exact", head: true })
      .eq("brand_id", brandId)
      .eq("event_date", today);

    const events_today = todayError ? 0 : todayCount || 0;

    return {
      total_products,
      total_worn_count,
      total_link_clicks,
      total_product_views,
      total_outfit_downloads,
      total_outfit_saves,
      events_today,
    };
  } catch (error) {
    console.error("Unexpected error fetching brand metrics summary:", error);
    return {
      total_products: 0,
      total_worn_count: 0,
      total_link_clicks: 0,
      total_product_views: 0,
      total_outfit_downloads: 0,
      total_outfit_saves: 0,
      events_today: 0,
    };
  }
}

/**
 * Obtiene los productos más populares de una marca (top performers)
 */
export async function getTopProducts(
  brandId: string,
  limit: number = 5,
  metric: "worn" | "clicks" = "worn"
): Promise<ProductMetrics[]> {
  try {
    const supabase = await createServerClient();

    const orderBy =
      metric === "worn" ? "total_worn_count" : "total_link_clicks";

    const { data, error } = await supabase
      .from("products")
      .select("id, name, total_worn_count, total_link_clicks, total_product_views, total_outfit_downloads, total_outfit_saves, images, category")
      .eq("brand_id", brandId)
      .order(orderBy, { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching top products:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Unexpected error fetching top products:", error);
    return [];
  }
}

/**
 * Obtiene las métricas de productos filtradas por rango de días
 * Calcula los totales desde product_events en lugar de usar los contadores acumulativos
 */
export async function getBrandProductsMetricsFiltered(
  brandId: string,
  daysBack: number | null = null
): Promise<ProductMetrics[]> {
  try {
    const supabase = await createServerClient();

    // Primero, obtenemos todos los productos de la marca
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("id, name, images, category")
      .eq("brand_id", brandId);

    if (productsError) {
      console.error("Error fetching products:", productsError);
      return [];
    }

    if (!products || products.length === 0) {
      return [];
    }

    // Ahora calculamos las métricas desde product_events
    let query = supabase
      .from("product_events")
      .select("product_id, event_type")
      .eq("brand_id", brandId);

    // Si hay un filtro de días, lo aplicamos
    if (daysBack !== null) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysBack);
      const startDateStr = startDate.toISOString().split("T")[0];
      
      query = query.gte("event_date", startDateStr);
    }

    const { data: events, error: eventsError } = await query;

    if (eventsError) {
      console.error("Error fetching events:", eventsError);
      return [];
    }

    // Agregamos los eventos por producto
    const metricsMap = new Map<string, { worn: number; clicks: number }>();
    
    products.forEach(product => {
      metricsMap.set(product.id, { worn: 0, clicks: 0 });
    });

    if (events) {
      events.forEach(event => {
        const metrics = metricsMap.get(event.product_id);
        if (metrics) {
          if (event.event_type === "worn") {
            metrics.worn++;
          } else if (event.event_type === "link_click") {
            metrics.clicks++;
          }
        }
      });
    }

    // Construimos el resultado
    const result: ProductMetrics[] = products.map(product => {
      const metrics = metricsMap.get(product.id) || { worn: 0, clicks: 0 };
      return {
        id: product.id,
        name: product.name,
        total_worn_count: metrics.worn,
        total_link_clicks: metrics.clicks,
        total_product_views: 0, // No filtramos views por período
        total_outfit_downloads: 0,
        total_outfit_saves: 0,
        images: product.images || [],
        category: product.category || "",
      };
    });

    // Ordenamos por worn_count descendente
    result.sort((a, b) => b.total_worn_count - a.total_worn_count);

    return result;
  } catch (error) {
    console.error("Unexpected error fetching filtered products metrics:", error);
    return [];
  }
}

/**
 * Obtiene el top de productos filtrado por rango de días
 */
export async function getTopProductsFiltered(
  brandId: string,
  limit: number = 10,
  metric: "worn" | "clicks" = "worn",
  daysBack: number | null = null
): Promise<ProductMetrics[]> {
  try {
    const allProducts = await getBrandProductsMetricsFiltered(brandId, daysBack);
    
    // Ordenamos según la métrica solicitada
    const sorted = allProducts.sort((a, b) => {
      if (metric === "worn") {
        return b.total_worn_count - a.total_worn_count;
      } else {
        return b.total_link_clicks - a.total_link_clicks;
      }
    });

    return sorted.slice(0, limit);
  } catch (error) {
    console.error("Unexpected error fetching top products filtered:", error);
    return [];
  }
}

