import { NextRequest, NextResponse } from "next/server";

// Intercambia el code por access_token y guarda el token en cookie httpOnly temporalmente,
// además envía un script para persistirlo en localStorage del cliente y redirigir de vuelta.
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");

  const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  if (!code || !clientId || !clientSecret) {
    return NextResponse.json(
      { error: "Parámetros o variables de entorno faltantes" },
      { status: 400 }
    );
  }

  try {
    const tokenResp = await fetch(
      "https://github.com/login/oauth/access_token",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          code,
          redirect_uri: `${baseUrl}/api/auth/callback/github`,
        }),
      }
    );

    const tokenData = (await tokenResp.json()) as any;

    if (!tokenResp.ok || !tokenData.access_token) {
      return NextResponse.json(
        {
          error: "No se pudo obtener el access_token de GitHub",
          details: tokenData,
        },
        { status: 500 }
      );
    }

    const accessToken = tokenData.access_token as string;

    // Responder con una página mínima que guarda el token en localStorage y redirige al state (returnTo)
    const returnTo = state ? decodeURIComponent(state) : baseUrl;
    const html = `<!DOCTYPE html>
      <html lang="es"><head><meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>Conectado a GitHub</title></head>
      <body>
      <script>
        try {
          window.localStorage.setItem('githubAccessToken', ${JSON.stringify(
            accessToken
          )});
        } catch (e) {}
        window.location.replace(${JSON.stringify(returnTo)});
      </script>
      Conectado a GitHub. Redirigiendo...
      </body></html>`;

    return new NextResponse(html, {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  } catch (e) {
    return NextResponse.json(
      { error: "Error durante el intercambio de token", details: String(e) },
      { status: 500 }
    );
  }
}
