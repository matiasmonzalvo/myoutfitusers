import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
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

    // Obtener el outfit para verificar que pertenece al usuario y obtener la URL de la imagen
    const { data: outfit, error: fetchError } = await supabase
      .from("outfits")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !outfit) {
      return NextResponse.json({ error: "Outfit not found" }, { status: 404 });
    }

    // Extraer el path del archivo de la URL
    const urlParts = outfit.image_url.split("/outfits/");
    if (urlParts.length === 2) {
      const filePath = urlParts[1];
      
      // Eliminar la imagen del storage
      const { error: deleteStorageError } = await supabase.storage
        .from("outfits")
        .remove([filePath]);

      if (deleteStorageError) {
        console.error("Error deleting image from storage:", deleteStorageError);
        // No fallar si no se puede eliminar la imagen
      }
    }

    // Eliminar el outfit de la base de datos
    const { error: deleteError } = await supabase
      .from("outfits")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (deleteError) {
      console.error("Error deleting outfit:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete outfit" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
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

