"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Settings, Grid3x3, Bookmark, ChevronDown } from "lucide-react";
import { OutfitCard } from "./outfit-card";
import type { Product } from "@/lib/actions/products";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { sortProductsByCategory } from "@/lib/utils/product-sorting";

interface UserProfile {
  id: string;
  username: string;
  avatar_url: string | null;
  created_at: string;
}

interface Outfit {
  id: string;
  name: string;
  image_url: string;
  products: any[];
  created_at: string;
  likes_count: number;
}

interface UserProfileViewProps {
  profile: UserProfile;
  profileImageUrl: string | null;
  outfits: Outfit[];
  isOwnProfile: boolean;
  currentOutfitProducts: Product[];
  likedOutfitIds: string[];
  isAuthenticated: boolean;
}

export function UserProfileView({
  profile,
  profileImageUrl,
  outfits,
  isOwnProfile,
  currentOutfitProducts,
  likedOutfitIds,
  isAuthenticated,
}: UserProfileViewProps) {
  const [activeTab, setActiveTab] = useState<"outfits" | "saved">("outfits");

  // Ordenar productos por categoría
  const sortedCurrentOutfitProducts = sortProductsByCategory(
    currentOutfitProducts
  );

  return (
    <div className="w-full">
      {/* Header con foto de perfil y username */}
      <div className="w-full bg-background">
        <div className="w-full">
          <div className="flex flex-col items-center gap-4">
            {/* Foto de perfil (outfit actual o avatar base) */}
            <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border border-border bg-muted flex-shrink-0">
              {profileImageUrl ? (
                <img
                  src={profileImageUrl}
                  alt={`${profile.username}'s profile`}
                  className="w-full h-full object-cover"
                  onContextMenu={(e) => e.preventDefault()}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted text-4xl font-bold text-muted-foreground">
                  {profile.username.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Info del usuario */}
            <div className="flex-1 text-center md:text-left space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <h1 className="text-3xl font-bold tracking-tight leading-[1] ">
                    @{profile.username}
                  </h1>
                  {isOwnProfile && (
                    <Link
                      href="/settings"
                      className="mt-1 hover:bg-muted rounded-lg transition-colors"
                    >
                      <Settings className="w-5 h-5" />
                    </Link>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center justify-center gap-8 text-base">
                <div>
                  <span className="font-semibold">{outfits.length}</span>{" "}
                  <span className="text-muted-foreground">outfits</span>
                </div>
              </div>

              {/* Dropdown del outfit actual */}
              <div className="flex items-center justify-center">
                <DropdownMenu>
                  <DropdownMenuTrigger
                    asChild
                    disabled={currentOutfitProducts.length === 0}
                  >
                    <button
                      className="w-auto rounded-full bg-muted border border-border transition-all cursor-pointer flex items-center justify-center px-3 py-2 hover:opacity-80 focus:outline-none ring-0 focus:ring-0 focus:ring-offset-0 relative disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={currentOutfitProducts.length === 0}
                    >
                      <span className="text-sm font-medium">
                        Current Outfit
                      </span>
                      {currentOutfitProducts.length > 0 && (
                        <div className="text-[10px] lg:text-[12px] mx-1 text-primary font-medium w-4.5 h-4.5 bg-primary/10 rounded-full flex items-center justify-center">
                          {currentOutfitProducts.length}
                        </div>
                      )}
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="center"
                    sideOffset={6}
                    side="bottom"
                    className="w-[266px] max-h-[400px] overflow-y-auto p-0 rounded-2xl"
                  >
                    {sortedCurrentOutfitProducts.map((product) => (
                      <DropdownMenuItem
                        key={product.id}
                        className="cursor-pointer px-3 py-3 flex items-center gap-3"
                        onClick={() => {
                          if (product.product_link) {
                            window.open(product.product_link, "_blank");
                          }
                        }}
                      >
                        <div className="w-10 h-10 rounded-lg overflow-hidden border border-border flex-shrink-0 flex justify-center items-center bg-white">
                          <img
                            src={product.images?.[0] || "/placeholder.png"}
                            alt={product.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                "/placeholder.png";
                            }}
                            onContextMenu={(e) => e.preventDefault()}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">
                            {product.name}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {product.brands?.brand_name}
                          </p>
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido - Grid de outfits */}
      <div className="w-full  py-8">
        {activeTab === "outfits" && (
          <>
            {outfits.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                  <Grid3x3 className="w-12 h-12 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No outfits yet</h3>
                <p className="text-muted-foreground">
                  {isOwnProfile
                    ? "Start creating and saving your outfits to share them here!"
                    : `${profile.username} hasn't shared any outfits yet.`}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-3 lg:grid-cols-3 gap-2">
                {outfits.map((outfit) => (
                  <OutfitCard
                    key={outfit.id}
                    outfit={outfit}
                    isOwnProfile={isOwnProfile}
                    isLiked={likedOutfitIds.includes(outfit.id)}
                    isAuthenticated={isAuthenticated}
                    username={profile.username}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === "saved" && isOwnProfile && (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <Bookmark className="w-12 h-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              Saved outfits coming soon
            </h3>
            <p className="text-muted-foreground">
              You'll be able to save and organize your favorite outfits here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
