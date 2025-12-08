import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const origin = requestUrl.origin;

  if (code) {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    );

    // Intercambiar el código de autorización por una sesión
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("Error exchanging code for session:", error);
      return NextResponse.redirect(
        `${origin}/login?error=auth_callback_failed`
      );
    }

    if (data.session) {
      // Verificar si el usuario ha completado el onboarding
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("onboarding_completed")
        .eq("id", data.session.user.id)
        .single();

      // Si no tiene perfil o no ha completado el onboarding, redirigir a onboarding
      if (!profile || !profile.onboarding_completed) {
        return NextResponse.redirect(`${origin}/onboarding`);
      }

      // Usuario autenticado y con onboarding completado
      return NextResponse.redirect(`${origin}/`);
    }
  }

  // Si no hay código o algo salió mal, redirigir al login
  return NextResponse.redirect(`${origin}/login`);
}
