import { getProductById, getSuggestedProducts } from "@/lib/actions/products";
import { ProductView } from "@/components/products/product-view";
import { notFound } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";

interface ProductPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;

  // Obtener el producto
  const product = await getProductById(id);

  if (!product) {
    notFound();
  }

  // Obtener productos sugeridos
  const suggestedProducts = await getSuggestedProducts(product, 8);

  // Verificar si el usuario está autenticado
  const supabase = await createServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const isAuthenticated = !!session;

  return (
    <ProductView
      product={product}
      suggestedProducts={suggestedProducts}
      isAuthenticated={isAuthenticated}
    />
  );
}

// Generar metadata dinámica para SEO
export async function generateMetadata({ params }: ProductPageProps) {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    return {
      title: "Producto no encontrado",
    };
  }

  return {
    title: `${product.name} - ${product.brands?.brand_name || "Outfiterz"}`,
    description:
      product.description ||
      `Descubre ${product.name} de ${product.brands?.brand_name || "nuestra colección"}. Pruébatelo virtualmente en tu avatar.`,
    openGraph: {
      title: `${product.name} - ${product.brands?.brand_name || "Outfiterz"}`,
      description:
        product.description ||
        `Descubre ${product.name} de ${product.brands?.brand_name || "nuestra colección"}`,
      images: product.images || [],
    },
  };
}
