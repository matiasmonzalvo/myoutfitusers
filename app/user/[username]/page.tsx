import { createServerClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { UserProfileView } from "@/components/user-profile/user-profile-view";

interface PageProps {
  params: Promise<{
    username: string;
  }>;
}

export default async function UserProfilePage({ params }: PageProps) {
  const { username } = await params;
  const supabase = await createServerClient();

  // Obtener el usuario loggeado (puede ser null - la página es pública)
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  // Buscar el perfil del usuario por username (sin autenticación requerida)
  const { data: profile, error: profileError } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("username", username)
    .single();

  if (profileError || !profile) {
    notFound();
  }

  // Obtener el outfit actual desde avatar_history
  const { data: currentOutfit } = await supabase
    .from("avatar_history")
    .select("outfit_image_url, products")
    .eq("user_id", profile.id)
    .eq("is_current", true)
    .single();

  // Usar el outfit actual si existe, sino el avatar base
  const profileImageUrl = currentOutfit?.outfit_image_url || profile.avatar_url;

  // Obtener los outfits guardados del usuario
  const { data: outfits, error: outfitsError } = await supabase
    .from("outfits")
    .select("*")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false });

  const userOutfits = outfitsError ? [] : outfits;

  // Si hay un usuario loggeado, obtener qué outfits ha likeado
  let likedOutfitIds: string[] = [];
  if (currentUser && userOutfits.length > 0) {
    const { data: likes } = await supabase
      .from("outfit_likes")
      .select("outfit_id")
      .eq("user_id", currentUser.id)
      .in(
        "outfit_id",
        userOutfits.map((o) => o.id)
      );

    likedOutfitIds = likes?.map((like) => like.outfit_id) || [];
  }

  // Verificar si el usuario loggeado es el dueño del perfil
  const isOwnProfile = currentUser?.id === profile.id;

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full mx-auto">
        <UserProfileView
          profile={profile}
          profileImageUrl={profileImageUrl}
          outfits={userOutfits}
          isOwnProfile={isOwnProfile}
          currentOutfitProducts={(currentOutfit?.products as any[]) || []}
          likedOutfitIds={likedOutfitIds}
          isAuthenticated={!!currentUser}
        />
      </div>
    </div>
  );
}
