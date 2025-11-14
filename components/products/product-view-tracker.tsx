"use client";

import { useEffect } from "react";

interface ProductViewTrackerProps {
  productId: string;
}

export function ProductViewTracker({ productId }: ProductViewTrackerProps) {
  useEffect(() => {
    // Registrar el evento de vista del producto
    const trackProductView = async () => {
      try {
        await fetch("/api/products/track-event", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productId: productId,
            eventType: "product_view",
          }),
        });
      } catch (error) {
        console.error("Error tracking product view:", error);
      }
    };

    trackProductView();
  }, [productId]);

  return null; // Este componente no renderiza nada
}

