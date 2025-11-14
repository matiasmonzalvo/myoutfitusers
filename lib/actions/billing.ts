"use server";

import { createServerClient } from "@/lib/supabase/server";

export interface BillingConfig {
  id: string;
  config_key: string;
  config_value: number;
  description?: string;
  updated_at: string;
  created_at: string;
}

export interface BillingCalculation {
  total_worn_count: number;
  total_link_clicks: number;
  price_per_worn: number;
  price_per_click: number;
  subtotal_worn: number;
  subtotal_clicks: number;
  total_amount: number;
}

export interface DailyBilling {
  event_date: string;
  worn_count: number;
  link_clicks: number;
  daily_cost_worn: number;
  daily_cost_clicks: number;
  daily_total_cost: number;
}

export interface Invoice {
  id: string;
  brand_id: string;
  period_start: string;
  period_end: string;
  total_worn_count: number;
  total_link_clicks: number;
  price_per_worn: number;
  price_per_click: number;
  subtotal_worn: number;
  subtotal_clicks: number;
  total_amount: number;
  status: "pending" | "paid" | "overdue" | "cancelled";
  issued_at: string;
  due_date: string;
  paid_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Obtiene la configuración de precios actual
 */
export async function getBillingConfig(): Promise<BillingConfig[]> {
  try {
    const supabase = await createServerClient();

    const { data, error } = await supabase
      .from("billing_config")
      .select("*")
      .order("config_key", { ascending: true });

    if (error) {
      console.error("Error fetching billing config:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Unexpected error fetching billing config:", error);
    return [];
  }
}

/**
 * Obtiene el precio actual por "worn"
 */
export async function getCurrentPricePerWorn(): Promise<number> {
  try {
    const supabase = await createServerClient();

    const { data, error } = await supabase
      .from("billing_config")
      .select("config_value")
      .eq("config_key", "price_per_worn")
      .single();

    if (error) {
      console.error("Error fetching price per worn:", error);
      return 0;
    }

    return data?.config_value || 0;
  } catch (error) {
    console.error("Unexpected error fetching price per worn:", error);
    return 0;
  }
}

/**
 * Calcula el billing de una marca para un período específico
 */
export async function calculateBrandBilling(
  brandId: string,
  daysBack: number | null = null
): Promise<BillingCalculation> {
  try {
    const supabase = await createServerClient();

    // Calcular las fechas
    const endDate = new Date();
    let startDate = new Date();
    
    if (daysBack !== null) {
      startDate.setDate(endDate.getDate() - daysBack);
    } else {
      // Si no se especifica, calcular desde el inicio de los tiempos
      startDate = new Date(0);
    }

    const startDateStr = startDate.toISOString().split("T")[0];
    const endDateStr = endDate.toISOString().split("T")[0];

    const { data, error } = await supabase.rpc("calculate_brand_billing", {
      p_brand_id: brandId,
      p_start_date: startDateStr,
      p_end_date: endDateStr,
    });

    if (error) {
      console.error("Error calculating brand billing:", error);
      return {
        total_worn_count: 0,
        total_link_clicks: 0,
        price_per_worn: 0,
        price_per_click: 0,
        subtotal_worn: 0,
        subtotal_clicks: 0,
        total_amount: 0,
      };
    }

    return data[0] || {
      total_worn_count: 0,
      total_link_clicks: 0,
      price_per_worn: 0,
      price_per_click: 0,
      subtotal_worn: 0,
      subtotal_clicks: 0,
      total_amount: 0,
    };
  } catch (error) {
    console.error("Unexpected error calculating brand billing:", error);
    return {
      total_worn_count: 0,
      total_link_clicks: 0,
      price_per_worn: 0,
      price_per_click: 0,
      subtotal_worn: 0,
      subtotal_clicks: 0,
      total_amount: 0,
    };
  }
}

/**
 * Obtiene las métricas diarias de billing para una marca
 */
export async function getBrandDailyBilling(
  brandId: string,
  daysBack: number = 30
): Promise<DailyBilling[]> {
  try {
    const supabase = await createServerClient();

    const { data, error } = await supabase.rpc("get_brand_billing_daily", {
      p_brand_id: brandId,
      p_days_back: daysBack,
    });

    if (error) {
      console.error("Error fetching brand daily billing:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Unexpected error fetching brand daily billing:", error);
    return [];
  }
}

/**
 * Obtiene todas las facturas de una marca
 */
export async function getBrandInvoices(brandId: string): Promise<Invoice[]> {
  try {
    const supabase = await createServerClient();

    const { data, error } = await supabase
      .from("invoices")
      .select("*")
      .eq("brand_id", brandId)
      .order("period_end", { ascending: false });

    if (error) {
      console.error("Error fetching brand invoices:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Unexpected error fetching brand invoices:", error);
    return [];
  }
}

/**
 * Obtiene el resumen de billing de una marca (lifetime)
 */
export async function getBrandBillingSummary(brandId: string): Promise<{
  total_products: number;
  lifetime_worn_count: number;
  lifetime_link_clicks: number;
  lifetime_billing_worn: number;
  lifetime_billing_clicks: number;
  lifetime_total_billing: number;
}> {
  try {
    const supabase = await createServerClient();

    const { data, error } = await supabase
      .from("brand_billing_summary")
      .select("*")
      .eq("brand_id", brandId)
      .single();

    if (error) {
      console.error("Error fetching brand billing summary:", error);
      return {
        total_products: 0,
        lifetime_worn_count: 0,
        lifetime_link_clicks: 0,
        lifetime_billing_worn: 0,
        lifetime_billing_clicks: 0,
        lifetime_total_billing: 0,
      };
    }

    return {
      total_products: data.total_products || 0,
      lifetime_worn_count: data.lifetime_worn_count || 0,
      lifetime_link_clicks: data.lifetime_link_clicks || 0,
      lifetime_billing_worn: parseFloat(data.lifetime_billing_worn) || 0,
      lifetime_billing_clicks: parseFloat(data.lifetime_billing_clicks) || 0,
      lifetime_total_billing: parseFloat(data.lifetime_total_billing) || 0,
    };
  } catch (error) {
    console.error("Unexpected error fetching brand billing summary:", error);
    return {
      total_products: 0,
      lifetime_worn_count: 0,
      lifetime_link_clicks: 0,
      lifetime_billing_worn: 0,
      lifetime_billing_clicks: 0,
      lifetime_total_billing: 0,
    };
  }
}

