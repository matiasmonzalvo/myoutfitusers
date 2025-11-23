"use client";

import { useState } from "react";
import { MoreVertical, Trash2, Heart } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { OutfitDetailDialog } from "./outfit-detail-dialog";
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
}

export function OutfitCard({
  outfit,
  isOwnProfile,
  isLiked: initialIsLiked,
  isAuthenticated,
}: OutfitCardProps) {
  const router = useRouter();
  const [showDetail, setShowDetail] = useState(false);
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
    <>
      <div className="group relative aspect-square rounded-lg overflow-hidden bg-muted border border-border hover:border-primary transition-all cursor-pointer">
        {/* Imagen del outfit */}
        <div
          onClick={() => setShowDetail(true)}
          className="w-full h-full relative"
        >
          <img
            src={outfit.image_url}
            alt={outfit.name}
            className="w-full h-full object-cover"
            onContextMenu={(e) => e.preventDefault()}
          />

          {/* Overlay con info al hacer hover */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-4 text-white">
            <h3 className="text-lg font-semibold text-center mb-2 line-clamp-2">
              {outfit.name}
            </h3>
            <p className="text-sm text-white/80">
              {outfit.products.length} items
            </p>
          </div>
        </div>

        {/* Botón de like */}
        <div className="absolute bottom-3 left-3 z-10 flex items-center gap-2">
          <button
            onClick={handleLike}
            disabled={isLiking}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full shadow-lg transition-all ${
              isLiked
                ? "bg-red-500 text-white"
                : "bg-white/90 hover:bg-white text-gray-900"
            }`}
          >
            <Heart
              className={`w-4 h-4 transition-all ${
                isLiked ? "fill-current" : ""
              }`}
            />
            <span className="text-sm font-medium">{likesCount}</span>
          </button>
        </div>

        {/* Menú de opciones (solo para el dueño) */}
        {isOwnProfile && (
          <div className="absolute top-2 right-2 z-10">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="p-2 rounded-full bg-white/90 hover:bg-white shadow-md transition-all"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="w-4 h-4" />
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

      {/* Dialog de detalle */}
      <OutfitDetailDialog
        open={showDetail}
        onOpenChange={setShowDetail}
        outfit={outfit}
      />
    </>
  );
}

