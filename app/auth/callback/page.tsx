"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createServerClient } from "@/lib/supabase/client";
import { Loader } from "lucide-react";

export default function AuthCallbackPage() {
  const router = useRouter();
  const supabase = createServerClient();
  const hasHandledCallback = useRef(false);

  useEffect(() => {
    // Función para manejar la redirección según el estado del perfil
    const handleRedirect = async (userId: string) => {
      // Evitar múltiples redirecciones
      if (hasHandledCallback.current) return;
      hasHandledCallback.current = true;

      try {
        // Verificar si el usuario ha completado el onboarding
        const { data: profile } = await supabase
          .from("user_profiles")
          .select("onboarding_completed")
          .eq("id", userId)
          .single();

        // Si no tiene perfil o no ha completado el onboarding, redirigir a onboarding
        if (!profile || !profile.onboarding_completed) {
          router.replace("/onboarding");
        } else {
          router.replace("/");
        }
        router.refresh();
      } catch (error) {
        console.error("Error checking profile:", error);
        router.replace("/");
        router.refresh();
      }
    };

    // Escuchar cambios de autenticación para detectar cuando Supabase
    // procesa los tokens del OAuth callback
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event: any, session: any) => {
      console.log("Auth state change:", event, session?.user?.id);

      if (event === "SIGNED_IN" && session?.user) {
        // El usuario acaba de iniciar sesión (OAuth callback procesado)
        await handleRedirect(session.user.id);
      } else if (event === "INITIAL_SESSION" && session?.user) {
        // Sesión inicial detectada (usuario ya estaba autenticado)
        await handleRedirect(session.user.id);
      } else if (event === "INITIAL_SESSION" && !session) {
        // No hay sesión, pero esperamos un momento por si Supabase
        // aún está procesando los tokens del hash
        setTimeout(async () => {
          if (hasHandledCallback.current) return;

          // Verificar una vez más si hay sesión
          const { data } = await supabase.auth.getSession();
          if (data.session?.user) {
            await handleRedirect(data.session.user.id);
          } else {
            // Definitivamente no hay sesión, redirigir al login
            hasHandledCallback.current = true;
            router.replace("/login?error=auth_callback_failed");
          }
        }, 1000);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router, supabase]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="flex flex-col items-center space-y-4">
        <Loader className="h-8 w-8 animate-spin text-foreground" />
        <p className="text-lg font-medium">Authenticating...</p>
        <p className="text-sm text-muted-foreground">
          Please wait while we redirect you
        </p>
      </div>
    </div>
  );
}
