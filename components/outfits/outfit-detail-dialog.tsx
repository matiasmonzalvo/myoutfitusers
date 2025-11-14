"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ExternalLink, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import Link from "next/link";

interface Product {
  id: string;
  name: string;
  brand_id: string;
  brand_name?: string;
  category: string;
  images?: string[];
  product_link?: string;
}

interface OutfitDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  outfit: {
    id: string;
    name: string;
    image_url: string;
    products: Product[];
    created_at: string;
  } | null;
  onReWear: () => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  tees: "Camisetas",
  jacket: "Chaquetas",
  sweatshirts: "Sudaderas",
  bottoms: "Pantalones",
  footwear: "Calzado",
  accesories: "Accesorios",
};

export function OutfitDetailDialog({
  open,
  onOpenChange,
  outfit,
  onReWear,
}: OutfitDetailDialogProps) {
  if (!outfit) return null;

  const timeAgo = formatDistanceToNow(new Date(outfit.created_at), {
    addSuffix: true,
    locale: es,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{outfit.name}</DialogTitle>
          <p className="text-sm text-muted-foreground">Creado {timeAgo}</p>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Imagen del outfit */}
          <div className="w-full aspect-square rounded-xl overflow-hidden border border-border bg-white">
            <img
              src={outfit.image_url}
              alt={outfit.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Botón para usar el outfit */}
          <Button
            onClick={onReWear}
            className="w-full bg-primary hover:bg-primary/90 text-white font-semibold rounded-full"
          >
            Usar este outfit
          </Button>

          {/* Lista de productos */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">
              Productos ({outfit.products.length})
            </h3>
            <div className="space-y-3">
              {outfit.products.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center gap-4 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  {/* Imagen del producto */}
                  <div className="w-16 h-16 rounded-lg overflow-hidden border border-border flex-shrink-0 bg-white">
                    <img
                      src={product.images?.[0] || "/placeholder.png"}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/placeholder.png";
                      }}
                    />
                  </div>

                  {/* Info del producto */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-base text-foreground truncate">
                      {product.name}
                    </h4>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {product.brand_name && <span>{product.brand_name}</span>}
                      {product.brand_name && product.category && <span>•</span>}
                      {product.category && (
                        <span>
                          {CATEGORY_LABELS[product.category] ||
                            product.category}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Link al producto */}
                  {product.product_link && (
                    <Link
                      href={product.product_link}
                      target="_blank"
                      className="flex-shrink-0"
                    >
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-full"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
