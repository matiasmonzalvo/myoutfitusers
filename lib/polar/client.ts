import { Polar } from "@polar-sh/sdk";

// Cliente singleton de Polar
let polarClient: Polar | null = null;

export function getPolarClient(): Polar {
  if (!polarClient) {
    if (!process.env.POLAR_ACCESS_TOKEN) {
      throw new Error("POLAR_ACCESS_TOKEN is not configured");
    }

    polarClient = new Polar({
      accessToken: process.env.POLAR_ACCESS_TOKEN,
    });
  }

  return polarClient;
}

// Constantes de Polar
export const POLAR_CONSTANTS = {
  // Precio por generación de outfit (en centavos)
  OUTFIT_GENERATION_COST: 0.05,
  // Nombre del evento de uso
  USAGE_EVENT_NAME: "generate_outfit",
  // Intervalo de billing
  BILLING_INTERVAL: "month" as const,
} as const;






