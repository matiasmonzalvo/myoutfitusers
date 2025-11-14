import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

interface ProductData {
  id: string;
  name: string;
  brand_id: string;
  brand_name?: string;
  category: string;
  images?: string[];
  product_link?: string;
}

interface RequestBody {
  name: string;
  imageData: string; // base64 image
  products: ProductData[];
}

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
    const body: RequestBody = await request.json();
    const { name, imageData, products } = body;

    // Validaciones
    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Outfit name is required" },
        { status: 400 }
      );
    }

    if (!imageData) {
      return NextResponse.json(
        { error: "Outfit image is required" },
        { status: 400 }
      );
    }

    if (!products || products.length === 0) {
      return NextResponse.json(
        { error: "At least one product is required" },
        { status: 400 }
      );
    }

    // Descargar la imagen desde la URL de Supabase (current-outfits bucket)
    let imageBuffer: Buffer;
    try {
      if (imageData.startsWith("http")) {
        // Si es una URL (de Supabase), descargarla
        const imageResponse = await fetch(imageData);
        if (!imageResponse.ok) {
          throw new Error("Failed to fetch outfit image from URL");
        }
        const arrayBuffer = await imageResponse.arrayBuffer();
        imageBuffer = Buffer.from(arrayBuffer);
      } else {
        // Si es base64 (legacy), convertirla
        const base64Data = imageData.includes("base64,")
          ? imageData.split("base64,")[1]
          : imageData;
        imageBuffer = Buffer.from(base64Data, "base64");
      }
    } catch (error) {
      console.error("Error converting image:", error);
      return NextResponse.json(
        { error: "Invalid image format" },
        { status: 400 }
      );
    }

    // Generar nombre único para el archivo
    const timestamp = Date.now();
    const fileName = `${user.id}/${timestamp}.png`;

    // Subir la imagen al bucket de outfits
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("outfits")
      .upload(fileName, imageBuffer, {
        contentType: "image/png",
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("Error uploading image:", uploadError);
      return NextResponse.json(
        { error: "Failed to upload outfit image" },
        { status: 500 }
      );
    }

    // Obtener la URL pública de la imagen
    const {
      data: { publicUrl },
    } = supabase.storage.from("outfits").getPublicUrl(fileName);

    // Guardar el outfit en la base de datos
    const { data: outfitData, error: insertError } = await supabase
      .from("outfits")
      .insert({
        user_id: user.id,
        name: name.trim(),
        image_url: publicUrl,
        products: products,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error saving outfit:", insertError);

      // Si falla el insert, intentar eliminar la imagen subida
      await supabase.storage.from("outfits").remove([fileName]);

      return NextResponse.json(
        { error: "Failed to save outfit" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      outfit: outfitData,
    });
  } catch (error) {
    console.error("Error in save outfit API:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to save outfit",
      },
      { status: 500 }
    );
  }
}
