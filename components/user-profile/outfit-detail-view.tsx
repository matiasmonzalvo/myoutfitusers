"use client";

import Link from "next/link";
import { ArrowLeft, ExternalLink, Heart } from "lucide-react";

interface Product {
  id: string;
  name: string;
  brand_name?: string;
  images?: string[];
  product_link?: string;
}

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
}

export function OutfitDetailView({
  outfit,
  username,
  sortedProducts,
  isLiked,
  isOwnOutfit,
}: OutfitDetailViewProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header con botón de volver */}
        <div className="mb-6">
          <Link
            href={`/user/${username}`}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to @{username}</span>
          </Link>
        </div>

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

          {/* Columna derecha - Lista de productos */}
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
                <div className="space-y-3">
                  {sortedProducts.map((product, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 p-4 rounded-xl border border-border hover:bg-muted/50 transition-colors"
                    >
                      {/* Imagen del producto */}
                      {product.images?.[0] && (
                        <div className="w-20 h-20 rounded-lg overflow-hidden border border-border flex-shrink-0 bg-white p-2">
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
                        <h3 className="font-semibold text-base line-clamp-2">
                          {product.name}
                        </h3>
                        {product.brand_name && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {product.brand_name}
                          </p>
                        )}
                      </div>

                      {/* Link al producto */}
                      {product.product_link && (
                        <Link
                          href={product.product_link}
                          target="_blank"
                          className="p-3 hover:bg-muted rounded-lg transition-colors flex-shrink-0"
                          title="View product"
                        >
                          <ExternalLink className="w-5 h-5" />
                        </Link>
                      )}
                    </div>
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

