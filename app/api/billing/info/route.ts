import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
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

    // Obtener try-ons restantes del perfil
    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .select("try_ons_left")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error("Error fetching profile:", profileError);
      return NextResponse.json(
        { error: "Error fetching profile" },
        { status: 500 }
      );
    }

    // Obtener estadísticas usando la función SQL
    const { data: stats, error: statsError } = await supabase
      .rpc("get_user_tryons_stats", { p_user_id: user.id })
      .single();

    if (statsError) {
      console.error("Error fetching stats:", statsError);
    }

    // Obtener paquetes disponibles
    const { data: packages, error: packagesError } = await supabase
      .from("tryons_packages")
      .select("*")
      .eq("is_active", true)
      .order("price_usd", { ascending: true });

    if (packagesError) {
      console.error("Error fetching packages:", packagesError);
    }

    // Obtener compras recientes
    const { data: purchases, error: purchasesError } = await supabase
      .from("package_purchases")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "completed")
      .order("created_at", { ascending: false })
      .limit(10);

    if (purchasesError) {
      console.error("Error fetching purchases:", purchasesError);
    }

    // Obtener uso reciente (últimos 30 días)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: usage, error: usageError } = await supabase
      .from("tryons_usage")
      .select("*")
      .eq("user_id", user.id)
      .gte("created_at", thirtyDaysAgo.toISOString())
      .order("created_at", { ascending: false })
      .limit(50);

    if (usageError) {
      console.error("Error fetching usage:", usageError);
    }

    return NextResponse.json({
      try_ons_left: profile?.try_ons_left || 0,
      stats: stats || {
        try_ons_left: 0,
        total_purchased: 0,
        total_used: 0,
        total_spent: 0,
        last_purchase_date: null,
      },
      recent_purchases: purchases || [],
      recent_usage: usage || [],
      available_packages: packages || [],
    });
  } catch (error) {
    console.error("Error in billing info:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch billing information",
      },
      { status: 500 }
    );
  }
}






