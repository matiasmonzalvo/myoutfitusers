import { createServerClient } from "@/lib/supabase/server";
import { SearchContent } from "@/components/card-content/SearchContent";

export default async function SearchPage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return <SearchContent isAuthenticated={!!user} />;
}
