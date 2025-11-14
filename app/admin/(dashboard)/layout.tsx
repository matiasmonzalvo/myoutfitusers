import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { AdminNav } from "@/components/admin/admin-nav";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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

  return (
    <div className="min-h-screen bg-neutral-100">
      <AdminNav brand={brandData} />
      <main className="lg:pl-[296px]">
        <div className="mx-auto p-10 w-full">{children}</div>
      </main>
    </div>
  );
}
