import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { GoogleGenAI } from "@google/genai";
import { uploadCurrentOutfit } from "@/lib/utils/current-outfit-storage";

// Orden de las categorías (de arriba hacia abajo en la imagen)
const CATEGORY_ORDER = [
  "accesories", // Arriba de todo
  "jacket", // Debajo de accesorios
  "sweatshirts", // Debajo de jacket
  "tees", // Debajo de sweatshirts
  "bottoms", // Debajo de tees
  "footwear", // Abajo de todo
];

export async function POST(request: Request) {
  try {
    // Verificar que la API Key esté configurada
    if (!process.env.GOOGLE_GEMINI_API_KEY) {
      console.error("GOOGLE_GEMINI_API_KEY is not configured");
      return NextResponse.json(
        { error: "Server configuration error: API key not found" },
        { status: 500 }
      );
    }

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

    // Obtener el perfil del usuario
    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    if (!profile.avatar_url) {
      return NextResponse.json(
        { error: "Base avatar not found. Please complete onboarding first." },
        { status: 400 }
      );
    }

    // Obtener datos del body
    const body = await request.json();
    const { products, currentOutfitImage } = body;

    if (!products || products.length === 0) {
      return NextResponse.json(
        { error: "At least one product is required" },
        { status: 400 }
      );
    }

    // Usar la imagen actual del outfit si existe, sino usar el avatar base
    const baseImageUrl = currentOutfitImage || profile.avatar_url;

    // Descargar la imagen base (outfit actual o avatar base)
    let avatarBase64: string;

    if (currentOutfitImage && currentOutfitImage.startsWith("data:image")) {
      // Si es una data URL (base64), extraer solo la parte base64
      avatarBase64 = currentOutfitImage.split(",")[1];
    } else {
      // Si es una URL normal, descargarla
      const avatarResponse = await fetch(baseImageUrl);
      if (!avatarResponse.ok) {
        throw new Error("Failed to fetch base avatar image");
      }
      const avatarBuffer = await avatarResponse.arrayBuffer();
      avatarBase64 = Buffer.from(avatarBuffer).toString("base64");
    }

    // Ordenar los productos según la jerarquía de categorías
    const sortedProducts = products.sort((a: any, b: any) => {
      const aIndex = CATEGORY_ORDER.indexOf(a.category);
      const bIndex = CATEGORY_ORDER.indexOf(b.category);
      return aIndex - bIndex;
    });

    // Crear la lista de descripciones de productos
    const productDescriptions = sortedProducts.map((product: any) => {
      return `- ${product.description || product.name}`;
    });

    // Importar canvas para crear la imagen combinada
    const { createCanvas, loadImage } = await import("canvas");

    // Descargar las imágenes de los productos
    const productImages = await Promise.all(
      sortedProducts.map(async (product: any) => {
        const imageUrl = product.images?.[0];
        if (!imageUrl) return null;

        try {
          const img = await loadImage(imageUrl);
          return img;
        } catch (error) {
          console.error(`Failed to load image for ${product.name}:`, error);
          return null;
        }
      })
    );

    // Filtrar imágenes que no se pudieron descargar
    const validProductImages = productImages.filter((img) => img !== null);

    if (validProductImages.length === 0) {
      return NextResponse.json(
        { error: "Could not download product images" },
        { status: 400 }
      );
    }

    // Crear un canvas con todas las imágenes apiladas verticalmente
    const imageWidth = 1024;
    const imageHeight = 1024;
    const canvas = createCanvas(
      imageWidth,
      imageHeight * validProductImages.length
    );
    const ctx = canvas.getContext("2d");

    // Dibujar cada imagen en el canvas
    validProductImages.forEach((img, index) => {
      if (img) {
        ctx.drawImage(img, 0, index * imageHeight, imageWidth, imageHeight);
      }
    });

    // Convertir el canvas a base64
    const canvasBuffer = canvas.toBuffer("image/png");
    const productsCanvasBase64 = canvasBuffer.toString("base64");

    // Inicializar Google GenAI
    const ai = new GoogleGenAI({
      apiKey: process.env.GOOGLE_GEMINI_API_KEY,
    });

    // Construir el prompt simplificado para Gemini
    const systemPrompt = `Dress the person in the first image with the items from the second image:

${productDescriptions.join("\n")}

IMPORTANT:
- Keep the person's original pose straight, with arms relaxed at the sides.
- Use the descriptions only to guide the shape, fit, and material of each item.
- Use the images only for the design, colors, and details.
- Do not invent or add anything that is not shown in the images.
- The clothing must look exactly like the items in the pictures.`;

    // Construir el prompt con las imágenes
    // Primera imagen: avatar base o outfit actual
    // Segunda imagen: canvas con todos los productos apilados verticalmente
    const prompt = [
      {
        inlineData: {
          mimeType: "image/png",
          data: avatarBase64,
        },
      },
      {
        inlineData: {
          mimeType: "image/png",
          data: productsCanvasBase64,
        },
      },
      { text: systemPrompt },
    ];

    console.log("Generating outfit with Gemini...");
    console.log(
      "Products order:",
      sortedProducts.map((p: any) => p.name)
    );
    console.log("System prompt:", systemPrompt);

    // Generar el outfit con Gemini
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: prompt,
      config: {
        imageConfig: {
          aspectRatio: "1:1",
        },
      },
    });

    console.log("Prompt tokens:\t ", response.usageMetadata?.promptTokenCount);
    console.log(
      "Thinking tokens:\t ",
      response.usageMetadata?.thoughtsTokenCount
    );
    console.log(
      "Output tokens:\t ",
      response.usageMetadata?.candidatesTokenCount
    );
    console.log("--------------------------------");
    console.log("Total tokens:\t ", response.usageMetadata?.totalTokenCount);
    // Extraer la imagen generada
    let generatedImageData: string | null = null;
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        generatedImageData = part.inlineData.data || null;
        break;
      }
    }

    if (!generatedImageData) {
      throw new Error("No image was generated");
    }

    // Subir la imagen generada al bucket current-outfits
    console.log("Uploading current outfit to storage...");
    const { url: outfitImageUrl, index: outfitIndex } =
      await uploadCurrentOutfit(user.id, generatedImageData, supabase);
    console.log(
      "Current outfit uploaded successfully:",
      outfitImageUrl,
      "Index:",
      outfitIndex
    );

    // Guardar en avatar_history
    console.log("Saving outfit to avatar_history...");
    
    // Combinar productos del outfit actual con los nuevos productos
    const { data: currentHistory } = await supabase
      .from("avatar_history")
      .select("products")
      .eq("user_id", user.id)
      .eq("is_current", true)
      .single();

    const previousProducts = currentHistory?.products as any[] || [];
    const allProducts = [...previousProducts, ...products];

    // Marcar todos los outfits anteriores como no actuales
    await supabase
      .from("avatar_history")
      .update({ is_current: false })
      .eq("user_id", user.id);

    // Insertar el nuevo outfit como actual
    const { error: historyError } = await supabase
      .from("avatar_history")
      .insert({
        user_id: user.id,
        outfit_index: outfitIndex,
        outfit_image_url: outfitImageUrl,
        products: allProducts,
        is_current: true,
      });

    if (historyError) {
      console.error("Error saving to avatar_history:", historyError);
      // No fallar la generación si falla el guardado en history
    } else {
      console.log("Outfit saved to avatar_history successfully");
    }

    // Sistema de try-ons prepagados
    try {
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
        console.error("Error fetching products for billing:", productsError);
      }

      // Verificar si TODOS los productos son de marcas verificadas
      const allProductsVerified = productsData?.every(
        (p: any) => p.brands?.is_verified_brand === true
      );

      if (allProductsVerified) {
        // GRATIS - Todos los productos son de marcas verificadas
        // Registrar el uso pero NO descontar try-ons
        const { error: usageError } = await supabase.from("tryons_usage").insert({
          user_id: user.id,
          action: "generate_outfit",
          products_used: products.map((p: any) => p.id),
          was_free: true,
        });

        if (usageError) {
          console.error("Error tracking free usage:", usageError);
        }
      } else {
        // PAGO - Al menos un producto NO es de marca verificada
        // Verificar que el usuario tenga try-ons disponibles
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

        if (profileData.try_ons_left <= 0) {
          return NextResponse.json(
            { 
              error: "You don't have any try-ons left. Please purchase a package to continue.",
              code: "NO_TRYONS_LEFT"
            },
            { status: 402 } // 402 Payment Required
          );
        }

        // Descontar un try-on
        const { error: updateError } = await supabase
          .from("user_profiles")
          .update({ try_ons_left: profileData.try_ons_left - 1 })
          .eq("id", user.id);

        if (updateError) {
          console.error("Error updating try-ons:", updateError);
          return NextResponse.json(
            { error: "Error processing try-on" },
            { status: 500 }
          );
        }

        // Registrar el uso
        const { error: usageError } = await supabase.from("tryons_usage").insert({
          user_id: user.id,
          action: "generate_outfit",
          products_used: products.map((p: any) => p.id),
          was_free: false,
        });

        if (usageError) {
          console.error("Error tracking usage:", usageError);
        }
      }
    } catch (trackingError) {
      console.error("Error in try-ons system:", trackingError);
      // No fallar la generación si el tracking falla
    }

    // Devolver también el canvas de productos para debug (opcional, solo para desarrollo)
    const productsCanvasDebugUrl = `data:image/png;base64,${productsCanvasBase64}`;

    return NextResponse.json({
      outfitImageUrl,
      outfitIndex,
      productsCanvasDebugUrl,
    });
  } catch (error) {
    console.error("Error generating outfit:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to generate outfit",
      },
      { status: 500 }
    );
  }
}
