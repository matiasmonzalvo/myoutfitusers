import { createServerClient } from "@/lib/supabase/server";
import { HomeContent } from "@/components/card-content/HomeContent";

export default async function HomePage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Siempre mostrar el contenido de la app, pero pasar el estado de autenticación
  return <HomeContent isAuthenticated={!!user} />;
}
