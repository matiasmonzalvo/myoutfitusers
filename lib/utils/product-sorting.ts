import type { Product } from "@/lib/actions/products";

/**
 * Ordena productos por categoría según el orden especificado:
 * 1. accesories
 * 2. jacket
 * 3. sweatshirts
 * 4. tees
 * 5. bottoms
 * 6. footwear
 */
export const sortProductsByCategory = (products: Product[]) => {
  const categoryOrder: Record<string, number> = {
    accesories: 1,
    jacket: 2,
    sweatshirts: 3,
    tees: 4,
    bottoms: 5,
    footwear: 6,
  };

  return [...products].sort((a, b) => {
    const orderA = categoryOrder[a.category] || 999;
    const orderB = categoryOrder[b.category] || 999;
    return orderA - orderB;
  });
};
