"use client";

import Link from "next/link";
import { ArrowLeft, Heart } from "lucide-react";
import { ProductCard } from "@/components/products/product-card";
import type { Product } from "@/lib/actions/products";

interface Outfit {
  id: string;
  name: string;
  image_url: string;
  likes_count: number;
  created_at: string;
}

interface OutfitDetailViewProps {
  outfit: Outfit;
  username: string;
  sortedProducts: Product[];
  isLiked: boolean;
  isOwnOutfit: boolean;
  isAuthenticated: boolean;
}

export function OutfitDetailView({
  outfit,
  username,
  sortedProducts,
  isLiked,
  isOwnOutfit,
  isAuthenticated,
}: OutfitDetailViewProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="">
        {/* Grid principal - Outfit y productos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Columna izquierda - Imagen del outfit */}
          <div className="space-y-4">
            <div className="w-full aspect-square rounded-2xl overflow-hidden border border-border bg-muted">
              <img
                src={outfit.image_url}
                alt={outfit.name}
                className="w-full h-full object-cover"
                onContextMenu={(e) => e.preventDefault()}
              />
            </div>

            {/* Info del outfit */}
            <div className="space-y-3">
              <h1 className="text-3xl font-bold">{outfit.name}</h1>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Heart
                    className={`w-5 h-5 ${
                      isLiked
                        ? "fill-red-500 text-red-500"
                        : "text-muted-foreground"
                    }`}
                  />
                  <span className="text-sm text-muted-foreground">
                    {outfit.likes_count || 0}{" "}
                    {outfit.likes_count === 1 ? "like" : "likes"}
                  </span>
                </div>
              </div>

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

          {/* Columna derecha - Grid de productos */}
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-semibold mb-4">
                Items in this outfit ({sortedProducts.length})
              </h2>

              {sortedProducts.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No products in this outfit
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {sortedProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      isAuthenticated={isAuthenticated}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
