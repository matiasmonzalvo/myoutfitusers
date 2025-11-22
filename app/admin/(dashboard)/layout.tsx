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
    <div className="min-h-screen bg-neutral-100 dark:bg-black/50 h-screen overflow-hidden">
      <AdminNav brand={brandData} />
      <main className="lg:pl-[296px] p-4 h-screen">
        <div className="w-full h-[calc(100vh-32px)] overflow-y-auto bg-background border border-border rounded-2xl p-20">
          {children}
        </div>
      </main>
    </div>
  );
}
