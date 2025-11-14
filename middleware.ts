import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Si el usuario está autenticado y no está en la página de onboarding
  // verificar si ha completado el onboarding
  if (user && !request.nextUrl.pathname.startsWith("/onboarding")) {
    // No verificar onboarding para rutas de admin, auth callback, ni API
    if (
      !request.nextUrl.pathname.startsWith("/admin") &&
      !request.nextUrl.pathname.startsWith("/auth/callback") &&
      !request.nextUrl.pathname.startsWith("/api")
    ) {
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("onboarding_completed")
        .eq("id", user.id)
        .single();

      // Si no tiene perfil o no ha completado el onboarding, redirigir a onboarding
      if (!profile || !profile.onboarding_completed) {
        return NextResponse.redirect(new URL("/onboarding", request.url));
      }
    }
  }

  // Rutas protegidas - redirigir a login si no está autenticado
  if (request.nextUrl.pathname.startsWith("/dashboard")) {
    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // Proteger rutas de admin (todas las rutas dentro del grupo dashboard)
  if (
    request.nextUrl.pathname.startsWith("/admin/home") ||
    request.nextUrl.pathname.startsWith("/admin/products") ||
    request.nextUrl.pathname.startsWith("/admin/performance") ||
    request.nextUrl.pathname.startsWith("/admin/engagement") ||
    request.nextUrl.pathname.startsWith("/admin/profile")
  ) {
    if (!user) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    // Verify user is a brand
    const { data: brandData } = await supabase
      .from("brands")
      .select("id, is_active")
      .eq("id", user.id)
      .single();

    if (!brandData || !brandData.is_active) {
      await supabase.auth.signOut();
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  }

  // Redirigir usuarios autenticados desde páginas de auth
  if (
    (request.nextUrl.pathname === "/login" ||
      request.nextUrl.pathname === "/register") &&
    user
  ) {
    // Verificar si necesita completar onboarding
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("onboarding_completed")
      .eq("id", user.id)
      .single();

    if (!profile || !profile.onboarding_completed) {
      return NextResponse.redirect(new URL("/onboarding", request.url));
    }

    return NextResponse.redirect(new URL("/", request.url));
  }

  // Permitir acceso a la página de callback de autenticación
  if (request.nextUrl.pathname === "/auth/callback") {
    return supabaseResponse;
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images, icons, etc.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
