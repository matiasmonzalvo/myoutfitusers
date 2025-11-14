import { createServerClient } from "@/lib/supabase/server";
import { BrandsContent } from "@/components/card-content/BrandsContent";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "All Brands | Outfiterz",
  description:
    "Explore all fashion brands on Outfiterz. Discover trending brands and shop the latest collections.",
};

export default async function BrandsPage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return <BrandsContent isAuthenticated={!!user} />;
}

