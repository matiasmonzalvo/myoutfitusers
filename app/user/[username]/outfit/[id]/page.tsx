import { createServerClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { sortProductsByCategory } from "@/lib/utils/product-sorting";
import { OutfitDetailView } from "@/components/user-profile/outfit-detail-view";

interface PageProps {
  params: Promise<{
    username: string;
    id: string;
  }>;
}

export default async function OutfitPage({ params }: PageProps) {
  const { username, id } = await params;
  const supabase = await createServerClient();

  // Obtener el usuario loggeado (puede ser null - la página es pública)
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  // Buscar el perfil del usuario por username
  const { data: profile, error: profileError } = await supabase
    .from("user_profiles")
    .select("id, username, avatar_url")
    .eq("username", username)
    .single();

  if (profileError || !profile) {
    notFound();
  }

  // Obtener el outfit del usuario específico
  const { data: outfit, error: outfitError } = await supabase
    .from("outfits")
    .select("*")
    .eq("id", id)
    .eq("user_id", profile.id)
    .single();

  if (outfitError || !outfit) {
    notFound();
  }

  // Verificar si el usuario actual ha dado like a este outfit
  let isLiked = false;
  if (currentUser) {
    const { data: like } = await supabase
      .from("outfit_likes")
      .select("id")
      .eq("outfit_id", outfit.id)
      .eq("user_id", currentUser.id)
      .single();

    isLiked = !!like;
  }

  // Ordenar productos por categoría
  const sortedProducts = sortProductsByCategory(outfit.products || []);

  const isOwnOutfit = currentUser?.id === outfit.user_id;

  return (
    <OutfitDetailView
      outfit={outfit}
      username={username}
      sortedProducts={sortedProducts}
      isLiked={isLiked}
      isOwnOutfit={isOwnOutfit}
    />
  );
}

