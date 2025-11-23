import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function OutfitsPage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Redirigir a login si no está autenticado
  if (!user) {
    redirect("/login");
  }

  // Obtener el username del usuario
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("username")
    .eq("id", user.id)
    .single();

  // Redirigir a la nueva ruta de perfil de usuario
  if (profile?.username) {
    redirect(`/user/${profile.username}`);
  }

  // Si no tiene username (no debería pasar), redirigir a home
  redirect("/");
}
