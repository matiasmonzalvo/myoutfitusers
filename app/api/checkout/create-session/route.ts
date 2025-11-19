import { NextResponse } from "next/server";
import { Polar } from "@polar-sh/sdk";
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

    // Obtener el product_id del body
    const { product_id } = await request.json();

    if (!product_id) {
      return NextResponse.json(
        { error: "product_id is required" },
        { status: 400 }
      );
    }

    // Verificar que tengamos el access token
    if (!process.env.POLAR_ACCESS_TOKEN) {
      console.error("POLAR_ACCESS_TOKEN not configured");
      return NextResponse.json(
        { error: "Payment system not configured" },
        { status: 500 }
      );
    }

    // Obtener el email del usuario para crear el customer
    const { data: profileData } = await supabase
      .from("user_profiles")
      .select("username")
      .eq("id", user.id)
      .single();

    // Inicializar Polar SDK con sandbox
    const polar = new Polar({
      accessToken: process.env.POLAR_ACCESS_TOKEN,
      server: "sandbox", // Usar sandbox para testing
    });

    // Crear checkout session
    // IMPORTANTE: Polar requiere "products" como array, no "productId"
    const checkout = await polar.checkouts.create({
      products: [product_id], // Array de product IDs
      // Información del cliente
      customerEmail: user.email,
      customerName: profileData?.username || user.email?.split("@")[0],
      // Metadata para identificar al usuario en el webhook
      metadata: {
        user_id: user.id,
        username: profileData?.username,
      },
      // URL de éxito (ya configurada en .env)
      successUrl: process.env.POLAR_SUCCESS_URL,
      // Permitir códigos de descuento
      allowDiscountCodes: true,
    });

    // Retornar la URL del checkout
    return NextResponse.json({
      url: checkout.url,
      checkout_id: checkout.id,
    });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to create checkout session",
      },
      { status: 500 }
    );
  }
}


