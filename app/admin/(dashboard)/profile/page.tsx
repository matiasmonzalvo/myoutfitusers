import { createServerClient } from "@/lib/supabase/server";
import { AdminProfileView } from "@/components/admin/admin-profile-view";

export default async function AdminProfilePage() {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: brandData } = await supabase
    .from("brands")
    .select("*")
    .eq("id", user.id)
    .single();

  return <AdminProfileView brand={brandData} />;
}

