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

    // Search brands by name or username
    const { data: brands, error } = await supabase
      .from("brands")
      .select(
        "id, brand_name, brand_username, logo_url, description, website_url"
      )
      .eq("is_active", true)
      .or(`brand_name.ilike.%${query}%,brand_username.ilike.%${query}%`)
      .order("brand_name", { ascending: true })
      .limit(10);

    if (error) {
      console.error("Error searching brands:", error);
      return NextResponse.json({ brands: [] });
    }

    return NextResponse.json({ brands: brands || [] });
  } catch (error) {
    console.error("Unexpected error in search:", error);
    return NextResponse.json({ brands: [] });
  }
}
