import { createServerClient } from "@/lib/supabase/server";
import { LikesContent } from "@/components/card-content/LikesContent";

export default async function LikesPage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return <LikesContent isAuthenticated={!!user} />;
}
