import { useState, useEffect } from "react";
import { createServerClient } from "@/lib/supabase/client";
import type { UserProfile } from "@/lib/types/user";
import type { User } from "@supabase/supabase-js";

export function useUserProfile() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createServerClient();

  useEffect(() => {
    let mounted = true;

    const loadUserAndProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        // Obtener usuario autenticado
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!mounted) return;

        if (user) {
          setUser(user);

          // Obtener perfil del usuario
          const { data: profileData, error: profileError } = await supabase
            .from("user_profiles")
            .select("*")
            .eq("id", user.id)
            .single();

          if (!mounted) return;

          if (profileError && profileError.code !== "PGRST116") {
            setError(profileError.message);
          } else {
            setProfile(profileData);
          }
        } else {
          setUser(null);
          setProfile(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : "Error desconocido");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadUserAndProfile();

    // Suscribirse a cambios de autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event: any, session: any) => {
      if (mounted) {
        if (session?.user) {
          setUser(session.user);
          loadUserAndProfile();
        } else {
          setUser(null);
          setProfile(null);
          setLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  return {
    user,
    profile,
    loading,
    error,
    isAuthenticated: !!user,
    hasCompletedOnboarding: profile?.onboarding_completed ?? false,
  };
}
