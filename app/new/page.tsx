import { createServerClient } from "@/lib/supabase/server";
import { NewContent } from "@/components/card-content/NewContent";

export default async function NewPage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return <NewContent isAuthenticated={!!user} />;
}
