import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { OutfitsGallery } from "@/components/outfits/outfits-gallery";

export default async function OutfitsPage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Redirigir a login si no está autenticado
  if (!user) {
    redirect("/login");
  }

  // Obtener el perfil del usuario para mostrar info
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("username, avatar_url")
    .eq("id", user.id)
    .single();

  return (
    <div className="min-h-screen bg-neu tral-100">
      <div className="w-full mx-auto">
        <div className="flex items-center gap-2 justify-start mb-6">
          <h2 className="text-4xl font-semibold tracking-tighter">
            {profile?.username}'s Outfits
          </h2>
        </div>
        {/* Gallery */}
        <OutfitsGallery userId={user.id} username={profile?.username} />
      </div>
    </div>
  );
}
