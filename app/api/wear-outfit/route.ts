import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { uploadCurrentOutfit } from "@/lib/utils/current-outfit-storage";

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

    // Obtener datos del body
    const body = await request.json();
    const { imageUrl, products } = body;

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Image URL is required" },
        { status: 400 }
      );
    }

    if (!products || products.length === 0) {
      return NextResponse.json(
        { error: "Products are required" },
        { status: 400 }
      );
    }

    console.log("[Wear Outfit] Starting for user:", user.id);
    console.log("[Wear Outfit] Image URL:", imageUrl);
    console.log("[Wear Outfit] Products count:", products.length);

    // Descargar la imagen del outfit guardado
    let imageBuffer: Buffer;
    try {
      const imageResponse = await fetch(imageUrl);
      if (!imageResponse.ok) {
        throw new Error("Failed to fetch outfit image");
      }
      const arrayBuffer = await imageResponse.arrayBuffer();
      imageBuffer = Buffer.from(arrayBuffer);
    } catch (error) {
      console.error("[Wear Outfit] Error downloading image:", error);
      return NextResponse.json(
        { error: "Failed to download outfit image" },
        { status: 400 }
      );
    }

    // Convertir a base64 para uploadCurrentOutfit
    const imageBase64 = imageBuffer.toString("base64");

    // Subir al bucket current-outfits
    const { url: outfitImageUrl, index: outfitIndex } =
      await uploadCurrentOutfit(user.id, imageBase64, supabase);

    console.log(
      "[Wear Outfit] Uploaded to current-outfits:",
      outfitImageUrl,
      "Index:",
      outfitIndex
    );

    // Marcar todos los outfits anteriores como no actuales
    await supabase
      .from("avatar_history")
      .update({ is_current: false })
      .eq("user_id", user.id);

    // Insertar el nuevo outfit como actual
    const { error: historyError } = await supabase.from("avatar_history").insert({
      user_id: user.id,
      outfit_index: outfitIndex,
      outfit_image_url: outfitImageUrl,
      products: products,
      is_current: true,
    });

    if (historyError) {
      console.error("[Wear Outfit] Error saving to avatar_history:", historyError);
      return NextResponse.json(
        { error: "Failed to save outfit to history" },
        { status: 500 }
      );
    }

    console.log("[Wear Outfit] Saved to avatar_history successfully");

    return NextResponse.json({
      success: true,
      outfitImageUrl,
      outfitIndex,
    });
  } catch (error) {
    console.error("[Wear Outfit] Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to wear outfit",
      },
      { status: 500 }
    );
  }
}




