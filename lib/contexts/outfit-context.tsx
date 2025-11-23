"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { createServerClient } from "@/lib/supabase/client";
import {
  deleteLastOutfitClientSide,
  deleteAllOutfitsClientSide,
} from "@/lib/utils/current-outfit-storage";
import type { Product } from "@/lib/actions/products";

interface OutfitContextType {
  outfitImageUrl: string | null;
  setOutfitImageUrl: (url: string | null) => void;
  isGeneratingOutfit: boolean;
  setIsGeneratingOutfit: (loading: boolean) => void;
  rollbackOutfit: () => Promise<void>;
  currentOutfitProducts: Product[];
  setCurrentOutfitProducts: (products: Product[]) => void;
  faceEnhancementUsed: boolean;
  setFaceEnhancementUsed: (used: boolean) => void;
  outfitHistoryCount: number;
  refreshOutfitFromDatabase: () => Promise<void>;
}

const OutfitContext = createContext<OutfitContextType | undefined>(undefined);

export function OutfitProvider({ children }: { children: ReactNode }) {
  const [outfitImageUrl, setOutfitImageUrlState] = useState<string | null>(
    null
  );
  const [isGeneratingOutfit, setIsGeneratingOutfit] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [currentOutfitProducts, setCurrentOutfitProducts] = useState<Product[]>(
    []
  );
  const [faceEnhancementUsed, setFaceEnhancementUsedState] = useState(false);
  const [outfitHistoryCount, setOutfitHistoryCount] = useState(0);
  const supabase = createServerClient();

  // Obtener el ID del usuario actual
  useEffect(() => {
    const getUserId = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };

    getUserId();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event: any, session: any) => {
      const newUserId = session?.user?.id || null;

      // Si el usuario cambió, limpiar el outfit actual y cargar el del nuevo usuario
      if (newUserId !== userId) {
        setUserId(newUserId);
        setOutfitImageUrlState(null);
        setCurrentOutfitProducts([]);
        setFaceEnhancementUsedState(false);

        if (newUserId) {
          loadOutfitFromDatabase(newUserId);
        }
      } else if (!newUserId) {
        // Si el usuario se deslogueó, limpiar todo
        setUserId(null);
        setOutfitImageUrlState(null);
        setCurrentOutfitProducts([]);
        setFaceEnhancementUsedState(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth, userId]);

  // Función para cargar el outfit desde la base de datos
  const loadOutfitFromDatabase = async (currentUserId: string) => {
    try {
      // Obtener el outfit actual del usuario desde la base de datos
      const { data: currentOutfit, error } = await supabase
        .from("avatar_history")
        .select("*")
        .eq("user_id", currentUserId)
        .eq("is_current", true)
        .single();

      if (error && error.code !== "PGRST116") {
        // PGRST116 es "no rows returned", lo cual es válido
        console.error("Error loading outfit from database:", error);
        return;
      }

      if (currentOutfit) {
        // Cargar el outfit actual
        setOutfitImageUrlState(currentOutfit.outfit_image_url);
        setCurrentOutfitProducts(currentOutfit.products as Product[]);

        // Contar el historial
        const { count } = await supabase
          .from("avatar_history")
          .select("*", { count: "exact", head: true })
          .eq("user_id", currentUserId);

        setOutfitHistoryCount(count || 0);
      } else {
        // No hay outfit actual, resetear todo
        setOutfitImageUrlState(null);
        setCurrentOutfitProducts([]);
        setOutfitHistoryCount(0);
      }

      setFaceEnhancementUsedState(false);
    } catch (error) {
      console.error("Error loading outfit from database:", error);
    }
  };

  // Cargar la imagen desde la base de datos al montar el componente
  useEffect(() => {
    if (userId) {
      loadOutfitFromDatabase(userId);
    }
    setIsHydrated(true);
  }, [userId]);

  // Función simple para setear la URL (solo para el estado local)
  const setOutfitImageUrl = (url: string | null) => {
    setOutfitImageUrlState(url);
  };

  // Función para actualizar el estado de face enhancement
  const setFaceEnhancementUsed = (used: boolean) => {
    setFaceEnhancementUsedState(used);
  };

  // Función para refrescar desde la base de datos
  const refreshOutfitFromDatabase = async () => {
    if (!userId) return;
    await loadOutfitFromDatabase(userId);
  };

  // Función para hacer rollback al outfit anterior
  const rollbackOutfit = async () => {
    if (!userId) return;

    try {
      // Obtener el outfit actual desde la BD
      const { data: currentOutfit } = await supabase
        .from("avatar_history")
        .select("*")
        .eq("user_id", userId)
        .eq("is_current", true)
        .single();

      if (!currentOutfit) {
        // Si no hay outfit actual, no hay nada que hacer
        console.log("No current outfit to rollback");
        return;
      }

      // Eliminar la imagen del storage
      await deleteLastOutfitClientSide(userId);

      // Eliminar el outfit actual de la BD
      await supabase
        .from("avatar_history")
        .delete()
        .eq("user_id", userId)
        .eq("outfit_index", currentOutfit.outfit_index);

      // Buscar el outfit anterior (el de mayor índice que quede)
      const { data: previousOutfit } = await supabase
        .from("avatar_history")
        .select("*")
        .eq("user_id", userId)
        .order("outfit_index", { ascending: false })
        .limit(1)
        .single();

      if (previousOutfit) {
        // Marcar el outfit anterior como actual
        await supabase
          .from("avatar_history")
          .update({ is_current: true })
          .eq("user_id", userId)
          .eq("outfit_index", previousOutfit.outfit_index);

        // Actualizar el estado local
        setOutfitImageUrl(previousOutfit.outfit_image_url);
        setCurrentOutfitProducts(previousOutfit.products as Product[]);
      } else {
        // No hay más outfits, volver al avatar base
        setOutfitImageUrl(null);
        setCurrentOutfitProducts([]);
      }

      // Actualizar el contador
      const { count } = await supabase
        .from("avatar_history")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId);

      setOutfitHistoryCount(count || 0);
      setFaceEnhancementUsed(false);
    } catch (error) {
      console.error("Error during rollback:", error);
      alert("Error al hacer rollback. Por favor intenta de nuevo.");
    }
  };

  return (
    <OutfitContext.Provider
      value={{
        outfitImageUrl: isHydrated ? outfitImageUrl : null,
        setOutfitImageUrl,
        isGeneratingOutfit,
        setIsGeneratingOutfit,
        rollbackOutfit,
        currentOutfitProducts,
        setCurrentOutfitProducts,
        faceEnhancementUsed,
        setFaceEnhancementUsed,
        outfitHistoryCount,
        refreshOutfitFromDatabase,
      }}
    >
      {children}
    </OutfitContext.Provider>
  );
}

export function useOutfit() {
  const context = useContext(OutfitContext);
  if (context === undefined) {
    throw new Error("useOutfit must be used within an OutfitProvider");
  }
  return context;
}
