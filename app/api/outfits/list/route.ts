import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function GET() {
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

    // Obtener los outfits del usuario
    const { data: outfits, error } = await supabase
      .from("outfits")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching outfits:", error);
      return NextResponse.json(
        { error: "Failed to fetch outfits" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      outfits: outfits || [],
    });
  } catch (error) {
    console.error("Error in list outfits API:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch outfits",
      },
      { status: 500 }
    );
  }
}
