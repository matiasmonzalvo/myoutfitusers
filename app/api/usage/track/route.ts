import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { getPolarClient, POLAR_CONSTANTS } from "@/lib/polar/client";

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

    const body = await request.json();
    const { action, metadata } = body;

    if (!action) {
      return NextResponse.json(
        { error: "Action is required" },
        { status: 400 }
      );
    }

    // Obtener o crear billing info del usuario
    let { data: billing, error: billingError } = await supabase
      .from("user_billing")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (billingError && billingError.code !== "PGRST116") {
      // PGRST116 = not found
      console.error("Error fetching billing:", billingError);
      return NextResponse.json(
        { error: "Error fetching billing information" },
        { status: 500 }
      );
    }

    // Si no existe billing info, crear una
    if (!billing) {
      const { data: newBilling, error: createError } = await supabase
        .from("user_billing")
        .insert({
          user_id: user.id,
          payment_status: "active",
        })
        .select()
        .single();

      if (createError) {
        console.error("Error creating billing:", createError);
        return NextResponse.json(
          { error: "Error creating billing information" },
          { status: 500 }
        );
      }

      billing = newBilling;
    }

    // Registrar el uso en Supabase
    const { data: usage, error: usageError } = await supabase
      .from("user_usage")
      .insert({
        user_id: user.id,
        action,
        cost: POLAR_CONSTANTS.OUTFIT_GENERATION_COST,
        metadata,
      })
      .select()
      .single();

    if (usageError) {
      console.error("Error tracking usage:", usageError);
      return NextResponse.json(
        { error: "Error tracking usage" },
        { status: 500 }
      );
    }

    // Reportar el uso a Polar.sh (solo si tiene polar_customer_id)
    if (billing.polar_customer_id) {
      try {
        const polar = getPolarClient();

        // Reportar el evento de uso a Polar
        // Nota: Polar usa un sistema de metrics/meters
        // Necesitarás configurar un meter en el dashboard de Polar
        await polar.metrics.create({
          timestamp: new Date().toISOString(),
          customerId: billing.polar_customer_id,
          metricName: POLAR_CONSTANTS.USAGE_EVENT_NAME,
          value: 1,
          properties: {
            cost: POLAR_CONSTANTS.OUTFIT_GENERATION_COST,
            ...metadata,
          },
        });
      } catch (polarError) {
        // No fallar si Polar falla, pero registrar el error
        console.error("Error reporting to Polar:", polarError);
      }
    }

    return NextResponse.json({
      success: true,
      usage,
      total_spent: billing.total_spent + POLAR_CONSTANTS.OUTFIT_GENERATION_COST,
    });
  } catch (error) {
    console.error("Error in usage tracking:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to track usage",
      },
      { status: 500 }
    );
  }
}
