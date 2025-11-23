"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Settings, Grid3x3, Bookmark } from "lucide-react";
import { OutfitCard } from "./outfit-card";
import type { Product } from "@/lib/actions/products";

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

  return (
    <div className="w-full">
      {/* Header con foto de perfil y username */}
      <div className="w-full border-b border-border bg-background">
        <div className="w-full">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* Foto de perfil (outfit actual o avatar base) */}
            <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-border bg-muted flex-shrink-0">
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
                <div className="flex items-center justify-center md:justify-start gap-4">
                  <h1 className="text-3xl font-bold tracking-tight">
                    {profile.username}
                  </h1>
                  {isOwnProfile && (
                    <Link
                      href="/settings"
                      className="p-2 hover:bg-muted rounded-lg transition-colors"
                    >
                      <Settings className="w-5 h-5" />
                    </Link>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center justify-center md:justify-start gap-8 text-sm">
                <div>
                  <span className="font-semibold">{outfits.length}</span>{" "}
                  <span className="text-muted-foreground">outfits</span>
                </div>
                {currentOutfitProducts.length > 0 && (
                  <div>
                    <span className="font-semibold">
                      {currentOutfitProducts.length}
                    </span>{" "}
                    <span className="text-muted-foreground">
                      items in current outfit
                    </span>
                  </div>
                )}
              </div>

              {/* Productos del outfit actual */}
              {currentOutfitProducts.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Current outfit:
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                    {currentOutfitProducts.map(
                      (product: any, index: number) => (
                        <Link
                          key={index}
                          href={`/product/${product.id}`}
                          className="px-3 py-1.5 bg-muted hover:bg-muted/80 rounded-full text-xs font-medium transition-colors"
                        >
                          {product.name}
                        </Link>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs de navegación */}
      <div className="w-full border-b border-border bg-background sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center justify-center gap-16">
            <button
              onClick={() => setActiveTab("outfits")}
              className={`flex items-center gap-2 py-4 border-b-2 transition-colors ${
                activeTab === "outfits"
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Grid3x3 className="w-4 h-4" />
              <span className="text-sm font-semibold uppercase tracking-wide">
                Outfits
              </span>
            </button>

            {isOwnProfile && (
              <button
                onClick={() => setActiveTab("saved")}
                className={`flex items-center gap-2 py-4 border-b-2 transition-colors ${
                  activeTab === "saved"
                    ? "border-foreground text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Bookmark className="w-4 h-4" />
                <span className="text-sm font-semibold uppercase tracking-wide">
                  Saved
                </span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Contenido - Grid de outfits */}
      <div className="max-w-5xl mx-auto px-4 py-8">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {outfits.map((outfit) => (
                  <OutfitCard
                    key={outfit.id}
                    outfit={outfit}
                    isOwnProfile={isOwnProfile}
                    isLiked={likedOutfitIds.includes(outfit.id)}
                    isAuthenticated={isAuthenticated}
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
