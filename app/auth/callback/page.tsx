"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createServerClient } from "@/lib/supabase/client";
import { Loader, Loader2 } from "lucide-react";

export default function AuthCallbackPage() {
  const router = useRouter();
  const supabase = createServerClient();

  useEffect(() => {
    const handleAuthCallback = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error("Error during auth callback:", error);
        router.push("/login?error=auth_callback_failed");
        return;
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
          router.push("/onboarding");
        } else {
          router.push("/");
        }
        router.refresh();
      } else {
        // No hay sesión, redirigir al login
        router.push("/login");
      }
    };

    handleAuthCallback();
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
