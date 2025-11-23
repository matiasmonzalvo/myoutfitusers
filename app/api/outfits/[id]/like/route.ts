import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
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

    // Verificar que el outfit existe
    const { data: outfit, error: outfitError } = await supabase
      .from("outfits")
      .select("id")
      .eq("id", params.id)
      .single();

    if (outfitError || !outfit) {
      return NextResponse.json({ error: "Outfit not found" }, { status: 404 });
    }

    // Intentar dar like
    const { error: likeError } = await supabase
      .from("outfit_likes")
      .insert({
        outfit_id: params.id,
        user_id: user.id,
      });

    if (likeError) {
      // Si ya existe el like (violación de constraint UNIQUE)
      if (likeError.code === "23505") {
        return NextResponse.json(
          { error: "You already liked this outfit" },
          { status: 400 }
        );
      }
      throw likeError;
    }

    // Obtener el nuevo conteo de likes
    const { data: likesData } = await supabase
      .from("outfits")
      .select("likes_count")
      .eq("id", params.id)
      .single();

    return NextResponse.json({
      success: true,
      liked: true,
      likes_count: likesData?.likes_count || 0,
    });
  } catch (error) {
    console.error("Error liking outfit:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to like outfit",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
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

    // Eliminar el like
    const { error: unlikeError } = await supabase
      .from("outfit_likes")
      .delete()
      .eq("outfit_id", params.id)
      .eq("user_id", user.id);

    if (unlikeError) {
      throw unlikeError;
    }

    // Obtener el nuevo conteo de likes
    const { data: likesData } = await supabase
      .from("outfits")
      .select("likes_count")
      .eq("id", params.id)
      .single();

    return NextResponse.json({
      success: true,
      liked: false,
      likes_count: likesData?.likes_count || 0,
    });
  } catch (error) {
    console.error("Error unliking outfit:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to unlike outfit",
      },
      { status: 500 }
    );
  }
}

