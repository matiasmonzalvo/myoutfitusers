import { createServerClient } from "@/lib/supabase/server";
import { AdminHomeView } from "@/components/admin/admin-home-view";

export default async function AdminHomePage() {
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

  return <AdminHomeView brandId={brandData?.id || ""} />;
}

