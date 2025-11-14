import { createServerClient } from "@/lib/supabase/server";
import { AdminPerformanceView } from "@/components/admin/admin-performance-view";

export default async function AdminPerformancePage() {
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

  return <AdminPerformanceView brandId={brandData?.id || ""} />;
}

