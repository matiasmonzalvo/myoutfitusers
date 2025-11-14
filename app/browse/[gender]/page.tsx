import { createServerClient } from "@/lib/supabase/server";
import { BrowseContent } from "@/components/card-content/BrowseContent";
import { notFound } from "next/navigation";
import { Metadata } from "next";

interface BrowsePageProps {
  params: Promise<{
    gender: string;
  }>;
}

export async function generateMetadata({
  params,
}: BrowsePageProps): Promise<Metadata> {
  const { gender } = await params;

  const titles = {
    men: "Wear items for Men | My Outfit",
    women: "Wear items for Women | My Outfit",
  };

  const descriptions = {
    men: "Wear items for Men",
    women: "Wear items for Women",
  };

  return {
    title: titles[gender as keyof typeof titles] || "Browse | My Outfit",
    description:
      descriptions[gender as keyof typeof descriptions] || "Wear your outfits",
  };
}

export default async function BrowsePage({ params }: BrowsePageProps) {
  const { gender } = await params;

  // Validar que el género sea válido
  if (gender !== "men" && gender !== "women") {
    notFound();
  }

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return <BrowseContent isAuthenticated={!!user} gender={gender} />;
}

export async function generateStaticParams() {
  return [{ gender: "men" }, { gender: "women" }];
}
