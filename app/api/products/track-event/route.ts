import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createServerClient();
    const body = await request.json();

    const { productId, eventType, metadata } = body;

    // Validar parámetros
    if (!productId || !eventType) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Validar que el tipo de evento sea uno de los permitidos
    const validEventTypes = [
      "worn",
      "link_click",
      "product_view",
      "outfit_downloaded",
      "outfit_saved",
    ];

    if (!validEventTypes.includes(eventType)) {
      return NextResponse.json(
        {
          error: `Invalid event type. Must be one of: ${validEventTypes.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Obtener el usuario actual (si está autenticado)
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Llamar a la función de Supabase para registrar el evento
    const { error } = await supabase.rpc("record_product_event", {
      p_product_id: productId,
      p_event_type: eventType,
      p_user_id: user?.id || null,
      p_metadata: metadata || null,
    });

    if (error) {
      console.error("Error recording product event:", error);
      return NextResponse.json(
        { error: "Failed to record event" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
