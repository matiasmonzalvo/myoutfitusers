import { createServerClient } from "@/lib/supabase/server";
import { AdminEngagementView } from "@/components/admin/admin-engagement-view";

export default async function AdminEngagementPage() {
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

  return <AdminEngagementView brandId={brandData?.id || ""} />;
}

