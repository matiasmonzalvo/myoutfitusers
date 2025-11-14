import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function DELETE(request: Request) {
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

    // Obtener el ID del outfit del body
    const { outfitId } = await request.json();

    if (!outfitId) {
      return NextResponse.json(
        { error: "Outfit ID is required" },
        { status: 400 }
      );
    }

    // Obtener el outfit para verificar que pertenece al usuario y obtener la URL de la imagen
    const { data: outfit, error: fetchError } = await supabase
      .from("outfits")
      .select("image_url, user_id")
      .eq("id", outfitId)
      .single();

    if (fetchError || !outfit) {
      return NextResponse.json({ error: "Outfit not found" }, { status: 404 });
    }

    // Verificar que el outfit pertenece al usuario
    if (outfit.user_id !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Extraer el path de la imagen desde la URL
    // La URL es algo como: https://xxx.supabase.co/storage/v1/object/public/outfits/user_id/timestamp.png
    const imageUrl = outfit.image_url;
    const urlParts = imageUrl.split("/outfits/");
    const imagePath = urlParts.length > 1 ? urlParts[1] : null;

    // Eliminar el registro de la base de datos
    const { error: deleteError } = await supabase
      .from("outfits")
      .delete()
      .eq("id", outfitId);

    if (deleteError) {
      console.error("Error deleting outfit:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete outfit" },
        { status: 500 }
      );
    }

    // Intentar eliminar la imagen del storage
    if (imagePath) {
      const { error: storageError } = await supabase.storage
        .from("outfits")
        .remove([imagePath]);

      if (storageError) {
        console.error("Error deleting image from storage:", storageError);
        // No retornar error aquí, el outfit ya fue eliminado de la DB
      }
    }

    return NextResponse.json({
      success: true,
      message: "Outfit deleted successfully",
    });
  } catch (error) {
    console.error("Error in delete outfit API:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to delete outfit",
      },
      { status: 500 }
    );
  }
}

