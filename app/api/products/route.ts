import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  try {
    const supabase = await createServerClient();
    const { searchParams } = new URL(request.url);

    const category = searchParams.get("category");
    const brandId = searchParams.get("brandId");
    const limit = searchParams.get("limit");

    let query = supabase
      .from("products")
      .select(
        `
        *,
        brands (
          id,
          brand_name,
          logo_url,
          website_url
        )
      `
      )
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    // Filter by category if provided
    if (category) {
      query = query.eq("category", category);
    }

    // Filter by brand if provided
    if (brandId) {
      query = query.eq("brand_id", brandId);
    }

    // Limit results if provided
    if (limit) {
      query = query.limit(parseInt(limit));
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching products:", error);
      return NextResponse.json(
        { error: "Failed to fetch products" },
        { status: 500 }
      );
    }

    return NextResponse.json({ products: data || [] });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
