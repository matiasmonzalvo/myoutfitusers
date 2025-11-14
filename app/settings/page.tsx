import { createServerClient } from "@/lib/supabase/server";
import { SettingsContent } from "@/components/card-content/SettingsContent";

export default async function SettingsPage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return <SettingsContent isAuthenticated={!!user} />;
}
