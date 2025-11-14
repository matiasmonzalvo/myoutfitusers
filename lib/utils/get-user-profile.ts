import { createServerClient } from "@/lib/supabase/server";
import type { UserProfile } from "@/lib/types/user";

/**
 * Obtiene el usuario autenticado y su perfil desde el servidor
 * @returns Un objeto con el usuario y su perfil, o null si no está autenticado
 */
export async function getUserProfile() {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      user: null,
      profile: null,
      isAuthenticated: false,
      hasCompletedOnboarding: false,
    };
  }

  const { data: profile, error } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("Error fetching user profile:", error);
  }

  return {
    user,
    profile: profile as UserProfile | null,
    isAuthenticated: true,
    hasCompletedOnboarding: profile?.onboarding_completed ?? false,
  };
}
