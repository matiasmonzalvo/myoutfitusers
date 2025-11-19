import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { GoogleGenAI } from "@google/genai";

// Configurar el tamaño máximo del body (10MB)
export const maxDuration = 60; // 60 seconds for Gemini API
export const dynamic = "force-dynamic";

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
      console.error("Profile error:", profileError);
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Verificar que tenga regeneraciones disponibles
    if (profile.avatar_regenerations_left <= 0) {
      return NextResponse.json(
        { error: "No regenerations left" },
        { status: 403 }
      );
    }

    // Obtener datos del body
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error("Failed to parse request body:", parseError);
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const { fullBodyImage, faceImage, additionalNotes, profileData } = body;

    console.log("Received request with images:", {
      hasFullBody: !!fullBodyImage,
      hasface: !!faceImage,
      fullBodyLength: fullBodyImage?.length,
      faceLength: faceImage?.length,
    });

    if (!fullBodyImage || !faceImage) {
      return NextResponse.json(
        { error: "Both images are required" },
        { status: 400 }
      );
    }

    // Inicializar Google GenAI
    const ai = new GoogleGenAI({
      apiKey: process.env.GOOGLE_GEMINI_API_KEY,
    });

    // Determinar el pronombre según el género
    const pronoun =
      profileData.gender === "male"
        ? "He"
        : profileData.gender === "female"
          ? "She"
          : "They";
    const pronounLower = pronoun.toLowerCase();

    // Construir el prompt para Gemini
    const systemPrompt = `Create a 1:1 aspect ratio full body shot of the person standing straight centered with a white background. ${pronoun} weighs ${profileData.weight} kg and is ${profileData.height} cm tall, respect these body proportions. ${pronoun} is wearing a regular white tee, regular black shorts and crew socks with no shoes. Regardless of the expression in the reference photos (whether smiling, laughing, or any other expression) he should have a neutral expression. The background should have no studio lighting, no shadows. Completely pure white background (#FFFFFF), no gradients, no horizon, no floor, no reflections, no textures. Only the shape of the full body of the person.`;

    const prompt = [
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: fullBodyImage,
        },
      },
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: faceImage,
        },
      },
      { text: systemPrompt },
    ];

    // Generar el avatar con Gemini
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: prompt,
      config: {
        imageConfig: {
          aspectRatio: "1:1",
        },
      },
    });

    console.log(response);

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

    // Guardar la imagen en Supabase Storage
    const buffer = Buffer.from(generatedImageData, "base64");
    const fileName = `${user.id}/avatar_${Date.now()}.png`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("user-avatars")
      .upload(fileName, buffer, {
        contentType: "image/png",
        upsert: true,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      throw new Error("Failed to upload avatar");
    }

    // Obtener la URL pública
    const {
      data: { publicUrl },
    } = supabase.storage.from("user-avatars").getPublicUrl(fileName);

    // Obtener el número de generación actual
    const { count: generationCount } = await supabase
      .from("avatar_history")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);

    const generationNumber = (generationCount || 0) + 1;

    // Guardar en el historial de avatares
    const { error: historyError } = await supabase
      .from("avatar_history")
      .insert({
        user_id: user.id,
        avatar_url: publicUrl,
        is_selected: false,
        generation_number: generationNumber,
      });

    if (historyError) {
      console.error("History insert error:", historyError);
      // No fallar si no se puede guardar el historial
    }

    // Decrementar las regeneraciones disponibles
    const { data: updatedProfile } = await supabase
      .from("user_profiles")
      .update({
        avatar_regenerations_left: profile.avatar_regenerations_left - 1,
      })
      .eq("id", user.id)
      .select("avatar_regenerations_left")
      .single();

    // Obtener todo el historial de avatares
    const { data: avatarHistory } = await supabase
      .from("avatar_history")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });

    return NextResponse.json({
      avatarUrl: publicUrl,
      regenerationsLeft: updatedProfile?.avatar_regenerations_left || 0,
      avatarHistory: avatarHistory || [],
    });
  } catch (error) {
    console.error("Error generating avatar:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to generate avatar",
      },
      { status: 500 }
    );
  }
}
