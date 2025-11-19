import { Checkout } from "@polar-sh/nextjs";

// Ruta de checkout para Polar.sh
// Esta ruta se usará para iniciar el proceso de checkout
export const GET = Checkout({
  accessToken: process.env.POLAR_ACCESS_TOKEN,
  successUrl: process.env.POLAR_SUCCESS_URL,
});






