import { createServerClient } from "@/lib/supabase/server";
import { CategoryContent } from "@/components/card-content/CategoryContent";
import { notFound } from "next/navigation";
import { Metadata } from "next";

interface CategoryPageProps {
  params: Promise<{
    category: string;
  }>;
  searchParams: Promise<{
    gender?: string;
  }>;
}

const VALID_CATEGORIES = [
  "tees",
  "jacket",
  "sweatshirts",
  "bottoms",
  "footwear",
  "accesories",
];

const CATEGORY_NAMES: Record<string, string> = {
  tees: "T-Shirts",
  jacket: "Jackets & Coats",
  sweatshirts: "Hoodies & Sweaters",
  bottoms: "Bottoms",
  footwear: "Sneakers & Shoes",
  accesories: "Accessories",
};

export async function generateMetadata({
  params,
  searchParams,
}: CategoryPageProps): Promise<Metadata> {
  const { category } = await params;
  const { gender } = await searchParams;

  const categoryName = CATEGORY_NAMES[category] || category;
  const genderText = gender
    ? gender === "men"
      ? "Men's"
      : "Women's"
    : "";

  return {
    title: `${genderText} ${categoryName} | Outfiterz`,
    description: `Shop ${genderText.toLowerCase()} ${categoryName.toLowerCase()} from top brands. Find the latest trends and styles.`,
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const { category } = await params;
  const { gender } = await searchParams;

  // Validar que la categoría sea válida
  if (!VALID_CATEGORIES.includes(category)) {
    notFound();
  }

  // Validar género si está presente
  if (gender && gender !== "men" && gender !== "women") {
    notFound();
  }

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <CategoryContent
      isAuthenticated={!!user}
      category={category}
      gender={gender}
    />
  );
}

export async function generateStaticParams() {
  // Pre-generar las rutas más comunes
  const categories = VALID_CATEGORIES;
  return categories.map((category) => ({
    category,
  }));
}

