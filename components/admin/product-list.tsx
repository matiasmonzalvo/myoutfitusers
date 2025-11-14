"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, ExternalLink } from "lucide-react";

interface Product {
  id: string;
  name: string;
  description?: string;
  price?: number;
  images: string[];
  product_link?: string;
  category: string;
  subcategory?: string;
  sex: string;
  is_active: boolean;
  created_at: string;
}

interface ProductListProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  upper: "Upper",
  lower: "Lower",
  foot: "Calzado",
  accessory: "Accesorio",
};

const SEX_LABELS: Record<string, string> = {
  men: "Hombre",
  women: "Mujer",
  kids: "Niños",
  unisex: "Unisex",
};

export function ProductList({ products, onEdit, onDelete }: ProductListProps) {
  if (products.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">
            No hay productos aún. ¡Agrega tu primer producto!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {products.map((product) => (
        <div key={product.id} className="overflow-hidden">
          <div className="relative aspect-square border border-border rounded-2xl overflow-hidden p-4 bg-white">
            <img
              src={product.images[0] || "/placeholder.png"}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/placeholder.png";
              }}
            />
            {product.images.length > 1 && (
              <div className="absolute top-2 left-2">
                <Badge
                  variant="secondary"
                  className="bg-background/80 backdrop-blur-sm"
                >
                  +{product.images.length - 1}
                </Badge>
              </div>
            )}
            {!product.is_active && (
              <div className="absolute top-2 right-2">
                <Badge variant="secondary">Inactivo</Badge>
              </div>
            )}
          </div>
          <div className="p-4">
            <div className="space-y-2">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg line-clamp-1">
                    {product.name}
                  </h3>
                  {product.subcategory && (
                    <p className="text-sm text-muted-foreground">
                      {product.subcategory}
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <Badge variant="outline">
                    {CATEGORY_LABELS[product.category] || product.category}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {SEX_LABELS[product.sex] || product.sex}
                  </Badge>
                </div>
              </div>

              {product.price && (
                <p className="text-lg font-bold text-foreground">
                  ${product.price.toFixed(2)}
                </p>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => onEdit(product)}
                  className="flex-1 flex items-center justify-center gap-2 bg-primary/10 text-primary text-sm font-medium tracking-tight rounded-full px-4 py-2 cursor-pointer hover:opacity-90 transition-all"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Editar
                </button>
                {product.product_link && (
                  <button
                    onClick={() => window.open(product.product_link, "_blank")}
                    className="rounded-full flex items-center justify-center w-9 h-9 border border-border bg-white cursor-pointer hover:opacity-60 transition-all"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </button>
                )}
                <button
                  onClick={() => onDelete(product.id)}
                  className="rounded-full flex items-center justify-center w-9 h-9 border border-border bg-white cursor-pointer hover:opacity-60 transition-all"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
