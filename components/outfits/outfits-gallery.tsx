"use client";

import { useEffect, useState } from "react";
import { OutfitCard } from "./outfit-card";
import { OutfitDetailDialog } from "./outfit-detail-dialog";
import { SaveOutfitDialog } from "@/components/SaveOutfitDialog";
import { useRouter } from "next/navigation";
import { useOutfit } from "@/lib/contexts/outfit-context";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";

interface Outfit {
  id: string;
  name: string;
  image_url: string;
  products: any[];
  created_at: string;
}

interface OutfitsGalleryProps {
  userId: string;
  username?: string;
}

export function OutfitsGallery({ userId, username }: OutfitsGalleryProps) {
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOutfit, setSelectedOutfit] = useState<Outfit | null>(null);
  const [outfitToDelete, setOutfitToDelete] = useState<Outfit | null>(null);
  const [outfitToShare, setOutfitToShare] = useState<Outfit | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const { setOutfitImageUrl, setCurrentOutfitProducts } = useOutfit();
  const { toast } = useToast();

  // Cargar outfits
  useEffect(() => {
    const fetchOutfits = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/outfits/list");
        const data = await response.json();
        setOutfits(data.outfits || []);
      } catch (error) {
        console.error("Error fetching outfits:", error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los outfits",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOutfits();
  }, [toast]);

  // Ver detalles del outfit
  const handleView = (outfit: Outfit) => {
    setSelectedOutfit(outfit);
  };

  // Compartir outfit
  const handleShare = (outfit: Outfit) => {
    setOutfitToShare(outfit);
  };

  // Eliminar outfit
  const handleDeleteConfirm = async () => {
    if (!outfitToDelete) return;

    setIsDeleting(true);
    try {
      const response = await fetch("/api/outfits/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ outfitId: outfitToDelete.id }),
      });

      if (!response.ok) {
        throw new Error("Error al eliminar el outfit");
      }

      // Actualizar la lista de outfits
      setOutfits((prev) => prev.filter((o) => o.id !== outfitToDelete.id));

      toast({
        title: "Outfit eliminado",
        description: "El outfit se ha eliminado correctamente",
      });

      setOutfitToDelete(null);
    } catch (error) {
      console.error("Error deleting outfit:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el outfit",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Re-wear outfit (aplicar el outfit al avatar)
  const handleReWear = async (outfit: Outfit) => {
    try {
      // Convertir la URL pública a base64 para poder usarla
      const response = await fetch(outfit.image_url);
      const blob = await response.blob();

      // Convertir blob a base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64data = reader.result as string;

        // Aplicar la imagen del outfit
        await setOutfitImageUrl(base64data);

        // Aplicar los productos del outfit
        setCurrentOutfitProducts(outfit.products);

        toast({
          title: "¡Outfit aplicado!",
          description: "El outfit se ha aplicado a tu avatar",
        });

        // Cerrar el diálogo si está abierto
        setSelectedOutfit(null);

        // Redirigir a la página principal
        router.push("/");
      };
      reader.readAsDataURL(blob);
    } catch (error) {
      console.error("Error applying outfit:", error);
      toast({
        title: "Error",
        description: "No se pudo aplicar el outfit",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (outfits.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-12 h-12 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">
          No tienes outfits guardados
        </h3>
        <p className="text-muted-foreground mb-6 max-w-md">
          Crea tu primer outfit seleccionando productos y usando el botón "Wear
          it", luego guárdalo para verlo aquí.
        </p>
        <button
          onClick={() => router.push("/")}
          className="px-6 py-2 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors cursor-pointer"
        >
          Explorar productos
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Grid de outfits */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3  gap-6">
        {outfits.map((outfit) => (
          <OutfitCard
            key={outfit.id}
            outfit={outfit}
            onView={() => handleView(outfit)}
            onDelete={() => setOutfitToDelete(outfit)}
            onReWear={() => handleReWear(outfit)}
            onShare={() => handleShare(outfit)}
          />
        ))}
      </div>

      {/* Dialog de detalles */}
      <OutfitDetailDialog
        open={!!selectedOutfit}
        onOpenChange={(open) => !open && setSelectedOutfit(null)}
        outfit={selectedOutfit}
        onReWear={() => selectedOutfit && handleReWear(selectedOutfit)}
      />

      {/* Dialog de compartir outfit */}
      {outfitToShare && (
        <SaveOutfitDialog
          open={!!outfitToShare}
          onOpenChange={(open) => !open && setOutfitToShare(null)}
          outfitImageUrl={outfitToShare.image_url}
          products={outfitToShare.products}
          mode="share"
        />
      )}

      {/* Dialog de confirmación de eliminación */}
      <AlertDialog
        open={!!outfitToDelete}
        onOpenChange={(open) => !open && setOutfitToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar outfit?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El outfit "
              {outfitToDelete?.name}" será eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Eliminando...
                </>
              ) : (
                "Eliminar"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
