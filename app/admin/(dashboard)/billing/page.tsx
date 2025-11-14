import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { AdminBillingView } from "@/components/admin/admin-billing-view";

export default async function BillingPage() {
  const supabase = await createServerClient();

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin");
  }

  // Verify user is a brand
  const { data: brandData, error } = await supabase
    .from("brands")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error || !brandData || !brandData.is_active) {
    redirect("/admin");
  }

  return <AdminBillingView brandId={brandData.id} />;
}

