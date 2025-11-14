import { createServerClient } from "@/lib/supabase/server";
import { AdminProductsView } from "@/components/admin/admin-products-view";

export default async function AdminProductsPage() {
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

  return <AdminProductsView brandId={brandData?.id || ""} />;
}

