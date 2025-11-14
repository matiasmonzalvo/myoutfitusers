"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  MoreVertical,
  Trash2,
  Eye,
  MoreHorizontal,
  Share,
  Shirt,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface OutfitCardProps {
  outfit: {
    id: string;
    name: string;
    image_url: string;
    products: any[];
    created_at: string;
  };
  onView: () => void;
  onDelete: () => void;
  onReWear: () => void;
  onShare: () => void;
}

export function OutfitCard({
  outfit,
  onView,
  onDelete,
  onReWear,
  onShare,
}: OutfitCardProps) {
  const timeAgo = formatDistanceToNow(new Date(outfit.created_at), {
    addSuffix: true,
    locale: es,
  });

  return (
    <Card className="  shadow-none border-none rounded-2xl bg-neutral-100 group relative">
      {/* Imagen del outfit */}
      <div className="relative aspect-square overflow-hidden  border border-border rounded-2xl">
        <img
          src={outfit.image_url}
          alt={outfit.name}
          className="w-full h-full object-cover"
        />

        {/* Overlay con acciones al hacer hover */}
        <div className="absolute  flex items-center justify-center gap-2">
          <Button
            onClick={onView}
            size="sm"
            variant="secondary"
            className="rounded-full bg-white hover:bg-neutral-100"
          >
            <Eye className="w-4 h-4 mr-2" />
            Ver detalles
          </Button>
          <Button
            onClick={onReWear}
            size="sm"
            className="rounded-full bg-primary hover:bg-primary/90 text-white"
          >
            Usar outfit
          </Button>
        </div>

        {/* Badge con número de productos */}
        {/* <div className="absolute bottom-2 left-2">
          <div className="bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-medium">
            {outfit.products.length}{" "}
            {outfit.products.length === 1 ? "producto" : "productos"}
          </div>
        </div> */}
      </div>

      {/* Info del outfit */}
      <div className="px-3 py-2 flex items-center justify-between">
        <h3 className="font-semibold text-lg text-foreground truncate">
          {outfit.name}
        </h3>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                variant="secondary"
                className="rounded-full w-7 h-7 p-0 border border-border bg-white"
              >
                <MoreHorizontal className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={onReWear}
                className="cursor-pointer pr-10"
              >
                <Shirt className="w-4 h-4" />
                Vestir outfit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={onView}
                className="cursor-pointer pr-10"
              >
                <Eye className="w-4 h-4" />
                Ver detalles
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={onDelete}
                className="text-red-600 cursor-pointer pr-10"
              >
                <Trash2 className="w-4 h-4" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            onClick={onShare}
            size="sm"
            variant="secondary"
            className="rounded-full w-7 h-7 p-0 bg-primary text-white hover:bg-primary/90"
          >
            <Share className="w-3 h-3 text-white" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
