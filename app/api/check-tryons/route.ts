import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    // Verificar autenticación
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Obtener los productos del body
    const { products } = await request.json();

    if (!products || products.length === 0) {
      return NextResponse.json(
        { error: "Products required" },
        { status: 400 }
      );
    }

    // Verificar si los productos son de marcas verificadas
    const { data: productsData, error: productsError } = await supabase
      .from("products")
      .select(`
        id,
        brands (
          is_verified_brand
        )
      `)
      .in("id", products.map((p: any) => p.id));

    if (productsError) {
      console.error("Error fetching products:", productsError);
      return NextResponse.json(
        { error: "Error checking products" },
        { status: 500 }
      );
    }

    // Verificar si TODOS los productos son de marcas verificadas
    const allProductsVerified = productsData?.every(
      (p: any) => p.brands?.is_verified_brand === true
    );

    // Si todos son de marcas verificadas, es gratis - permitir
    if (allProductsVerified) {
      return NextResponse.json({
        canProceed: true,
        isFree: true,
        tryOnsLeft: null, // No importa cuántos tiene
      });
    }

    // Si no todos son verificados, verificar try-ons disponibles
    const { data: profileData, error: profileError } = await supabase
      .from("user_profiles")
      .select("try_ons_left")
      .eq("id", user.id)
      .single();

    if (profileError || !profileData) {
      return NextResponse.json(
        { error: "Could not fetch user profile" },
        { status: 500 }
      );
    }

    const hasEnoughTryons = profileData.try_ons_left > 0;

    return NextResponse.json({
      canProceed: hasEnoughTryons,
      isFree: false,
      tryOnsLeft: profileData.try_ons_left,
    });
  } catch (error) {
    console.error("Error checking try-ons:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to check try-ons",
      },
      { status: 500 }
    );
  }
}




