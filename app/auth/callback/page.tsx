"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createServerClient } from "@/lib/supabase/client";
import { Loader } from "lucide-react";

export default function AuthCallbackPage() {
  const router = useRouter();
  const supabase = createServerClient();

  useEffect(() => {
    // Este componente actúa como fallback
    // El route.ts maneja el intercambio del código OAuth
    // Este useEffect verifica si ya existe una sesión (en caso de que
    // el usuario llegue a esta página directamente)
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();

      if (data.session) {
        // Ya hay sesión, verificar onboarding
        const { data: profile } = await supabase
          .from("user_profiles")
          .select("onboarding_completed")
          .eq("id", data.session.user.id)
          .single();

        if (!profile || !profile.onboarding_completed) {
          router.push("/onboarding");
        } else {
          router.push("/");
        }
      } else {
        // No hay sesión, esperar un momento y reintentar
        // (el route.ts puede estar procesando)
        setTimeout(async () => {
          const { data: retryData } = await supabase.auth.getSession();
          if (retryData.session) {
            router.push("/");
          } else {
            router.push("/login");
          }
        }, 2000);
      }
    };

    checkSession();
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
