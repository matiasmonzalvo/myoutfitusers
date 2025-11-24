import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Crear cliente de Supabase con service role para operaciones privilegiadas
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const event = await request.json();

    console.log("Polar webhook received:", event.type);

    // Manejar el evento de orden creada (order.created se dispara cuando el pago es exitoso)
    if (event.type === "order.created") {
      const order = event.data;

      // Extraer información de la orden
      // Intentar obtener el user_id de múltiples fuentes:
      // 1. metadata.user_id (lo que enviamos nosotros)
      // 2. customer.external_id (si Polar lo guarda)
      // 3. customer_id (fallback, aunque es el ID de Polar)
      const userId =
        order.metadata?.user_id ||
        order.customer?.external_id ||
        order.customer_id;

      const productId = order.product_id;
      const totalAmount = order.total_amount; // Monto total en centavos
      const orderId = order.id;
      const status = order.status; // Verificar que esté "paid"

      console.log("Processing order:", {
        userId,
        productId,
        totalAmount,
        orderId,
        status,
        customerEmail: order.customer?.email,
        metadata: order.metadata,
      });

      // Verificar que la orden esté pagada
      if (status !== "paid" || !order.paid) {
        console.log("Order not paid yet, skipping...");
        return NextResponse.json({ received: true, skipped: "not_paid" });
      }

      // Verificar que tengamos el user ID
      if (!userId) {
        console.error(
          "No user ID found in order. Tried metadata.user_id, customer.external_id, and customer_id"
        );
        return NextResponse.json(
          { error: "No user ID in order" },
          { status: 400 }
        );
      }

      // Mapear product_id a nombre de paquete y try-ons
      const packageMapping: Record<
        string,
        { name: string; tryOns: number; price: number }
      > = {
        "77bc8e98-468a-4a23-89b3-bc4384fd3b04": {
          name: "small",
          tryOns: 60,
          price: 5.0,
        },
        "b72b2959-c7bb-4adb-9359-997422fb30d2": {
          name: "medium",
          tryOns: 140,
          price: 10.0,
        },
        "23829530-6f2c-4151-984f-bd9a65abfc42": {
          name: "large",
          tryOns: 300,
          price: 20.0,
        },
      };

      const packageInfo = packageMapping[productId];

      if (!packageInfo) {
        console.error("Unknown product ID:", productId);
        return NextResponse.json({ error: "Unknown product" }, { status: 400 });
      }

      // 1. Obtener el paquete de la base de datos
      const { data: packageData, error: packageError } = await supabaseAdmin
        .from("tryons_packages")
        .select("id")
        .eq("name", packageInfo.name)
        .single();

      if (packageError || !packageData) {
        console.error("Error fetching package:", packageError);
        return NextResponse.json(
          { error: "Package not found" },
          { status: 500 }
        );
      }

      // 2. Registrar la compra en package_purchases
      const { error: purchaseError } = await supabaseAdmin
        .from("package_purchases")
        .insert({
          user_id: userId,
          package_id: packageData.id,
          package_name: packageInfo.name,
          try_ons_purchased: packageInfo.tryOns,
          price_paid: packageInfo.price,
          payment_method: "polar",
          payment_id: orderId,
          status: "completed",
        });

      if (purchaseError) {
        console.error("Error recording purchase:", purchaseError);
        return NextResponse.json(
          { error: "Error recording purchase" },
          { status: 500 }
        );
      }

      // 3. Agregar try-ons al usuario
      const { data: profileData, error: profileError } = await supabaseAdmin
        .from("user_profiles")
        .select("try_ons_left")
        .eq("id", userId)
        .single();

      if (profileError || !profileData) {
        console.error("Error fetching profile:", profileError);
        return NextResponse.json(
          { error: "User profile not found" },
          { status: 500 }
        );
      }

      const newBalance = (profileData.try_ons_left || 0) + packageInfo.tryOns;

      const { error: updateError } = await supabaseAdmin
        .from("user_profiles")
        .update({ try_ons_left: newBalance })
        .eq("id", userId);

      if (updateError) {
        console.error("Error updating try-ons:", updateError);
        return NextResponse.json(
          { error: "Error updating try-ons" },
          { status: 500 }
        );
      }

      console.log(
        `Successfully added ${packageInfo.tryOns} try-ons to user ${userId}. New balance: ${newBalance}`
      );

      return NextResponse.json({
        success: true,
        message: "Purchase processed successfully",
        new_balance: newBalance,
      });
    }

    // Otros eventos que podrías querer manejar
    if (event.type === "order.refunded") {
      console.log("Order refunded:", event.data.id);
      // Aquí podrías restar try-ons si el usuario pidió reembolso
    }

    if (
      event.type === "subscription.created" ||
      event.type === "subscription.active"
    ) {
      console.log("Subscription event:", event.type, event.data.id);
      // Por si en el futuro ofreces suscripciones
    }

    // Retornar 200 para otros eventos que no manejamos
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Webhook processing failed",
      },
      { status: 500 }
    );
  }
}
