"use client";

import { useState } from "react";
import { MoreVertical, Trash2, Heart, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";

interface Outfit {
  id: string;
  name: string;
  image_url: string;
  products: any[];
  created_at: string;
  likes_count: number;
}

interface OutfitCardProps {
  outfit: Outfit;
  isOwnProfile: boolean;
  isLiked: boolean;
  isAuthenticated: boolean;
  username: string;
}

export function OutfitCard({
  outfit,
  isOwnProfile,
  isLiked: initialIsLiked,
  isAuthenticated,
  username,
}: OutfitCardProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likesCount, setLikesCount] = useState(outfit.likes_count || 0);
  const [isLiking, setIsLiking] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this outfit?")) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/outfits/${outfit.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // Recargar la página para actualizar la lista
        window.location.reload();
      } else {
        alert("Error deleting outfit");
      }
    } catch (error) {
      console.error("Error deleting outfit:", error);
      alert("Error deleting outfit");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (isLiking) return;

    setIsLiking(true);
    const previousState = isLiked;
    const previousCount = likesCount;

    // Optimistic update
    setIsLiked(!isLiked);
    setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);

    try {
      const response = await fetch(`/api/outfits/${outfit.id}/like`, {
        method: isLiked ? "DELETE" : "POST",
      });

      if (!response.ok) {
        // Revertir si falla
        setIsLiked(previousState);
        setLikesCount(previousCount);
        const data = await response.json();
        console.error("Error toggling like:", data.error);
      } else {
        const data = await response.json();
        setIsLiked(data.liked);
        setLikesCount(data.likes_count);
      }
    } catch (error) {
      // Revertir si falla
      setIsLiked(previousState);
      setLikesCount(previousCount);
      console.error("Error toggling like:", error);
    } finally {
      setIsLiking(false);
    }
  };

  return (
    <div className="group relative aspect-square rounded-2xl overflow-hidden bg-muted border border-border transition-all cursor-pointer">
      {/* Imagen del outfit */}
      <div
        onClick={() => router.push(`/user/${username}/outfit/${outfit.id}`)}
        className="w-full h-full relative"
      >
        <img
          src={outfit.image_url}
          alt={outfit.name}
          className="w-full h-full object-cover"
          onContextMenu={(e) => e.preventDefault()}
        />
      </div>

      {/* Botón de like */}
      <div className="absolute bottom-2 right-2  z-10 flex items-center gap-2">
        <button
          onClick={handleLike}
          disabled={isLiking}
          className={`flex items-center cursor-pointer gap-1.5 transition-all ${
            isLiked ? " text-red-500" : "text-neutral-800"
          }`}
        >
          <Heart
            className={`w-5 h-5 transition-all ${
              isLiked ? "fill-red-500" : ""
            }`}
          />
        </button>
      </div>

      {/* Menú de opciones (solo para el dueño) */}
      {isOwnProfile && (
        <div className="absolute top-2 right-2 z-10">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="transition-all cursor-pointer"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="w-4 h-4 text-neutral-800" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-red-600 cursor-pointer"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {isDeleting ? "Deleting..." : "Delete"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );
}
