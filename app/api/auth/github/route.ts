import { NextRequest, NextResponse } from "next/server";

// Inicia el flujo OAuth de GitHub redirigiendo al usuario al authorize URL
export async function GET(req: NextRequest) {
  const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const returnTo = req.nextUrl.searchParams.get("returnTo") || `${baseUrl}`;

  if (!clientId) {
    return NextResponse.json(
      { error: "Falta NEXT_PUBLIC_GITHUB_CLIENT_ID" },
      { status: 500 }
    );
  }

  const callbackUrl = `${baseUrl}/api/auth/callback/github`;
  const authorizeUrl = new URL("https://github.com/login/oauth/authorize");
  authorizeUrl.searchParams.set("client_id", clientId);
  authorizeUrl.searchParams.set("redirect_uri", callbackUrl);
  authorizeUrl.searchParams.set("scope", "repo read:user");
  authorizeUrl.searchParams.set("state", encodeURIComponent(returnTo));

  return NextResponse.redirect(authorizeUrl);
}
