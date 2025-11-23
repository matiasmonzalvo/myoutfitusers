"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

interface Outfit {
  id: string;
  name: string;
  image_url: string;
  products: any[];
  created_at: string;
}

interface OutfitDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  outfit: Outfit;
}

export function OutfitDetailDialog({
  open,
  onOpenChange,
  outfit,
}: OutfitDetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{outfit.name}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Imagen del outfit */}
          <div className="w-full aspect-square rounded-lg overflow-hidden border border-border bg-muted">
            <img
              src={outfit.image_url}
              alt={outfit.name}
              className="w-full h-full object-cover"
              onContextMenu={(e) => e.preventDefault()}
            />
          </div>

          {/* Lista de productos */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-3">
                Items in this outfit ({outfit.products.length})
              </h3>
              <div className="space-y-3">
                {outfit.products.map((product: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted transition-colors"
                  >
                    {/* Imagen del producto */}
                    {product.images?.[0] && (
                      <div className="w-16 h-16 rounded-md overflow-hidden border border-border flex-shrink-0 bg-white p-2">
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-contain"
                          onContextMenu={(e) => e.preventDefault()}
                        />
                      </div>
                    )}

                    {/* Info del producto */}
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/product/${product.id}`}
                        className="font-medium text-sm hover:text-primary transition-colors line-clamp-1"
                      >
                        {product.name}
                      </Link>
                      {product.brand_name && (
                        <p className="text-xs text-muted-foreground">
                          {product.brand_name}
                        </p>
                      )}
                    </div>

                    {/* Link al producto */}
                    {product.product_link && (
                      <Link
                        href={product.product_link}
                        target="_blank"
                        className="p-2 hover:bg-muted-foreground/10 rounded-full transition-colors flex-shrink-0"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Fecha de creación */}
            <div className="pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Created on{" "}
                {new Date(outfit.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

