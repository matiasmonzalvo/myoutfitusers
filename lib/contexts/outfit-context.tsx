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
  setOutfitImageUrl: (url: string | null) => Promise<void>;
  isGeneratingOutfit: boolean;
  setIsGeneratingOutfit: (loading: boolean) => void;
  rollbackOutfit: () => Promise<void>;
  currentOutfitProducts: Product[];
  setCurrentOutfitProducts: (products: Product[], outfitIndex?: number) => void;
  faceEnhancementUsed: boolean;
  setFaceEnhancementUsed: (used: boolean) => void;
  outfitHistoryCount: number;
  outfitHistory: Array<{ products: Product[]; index: number }>;
}

const OutfitContext = createContext<OutfitContextType | undefined>(undefined);

// Guardamos el historial de outfits en localStorage
// Las imágenes se guardan en Supabase Storage (bucket: current-outfits)
const STORAGE_KEY_OUTFIT_URL_PREFIX = "outfit_current_url_";
const STORAGE_KEY_HISTORY_PREFIX = "outfit_history_";
const STORAGE_KEY_FACE_ENHANCEMENT_PREFIX = "outfit_face_enhancement_";

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
  const [outfitHistory, setOutfitHistory] = useState<
    Array<{ products: Product[]; index: number }>
  >([]);
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
        setOutfitHistory([]);
        setFaceEnhancementUsedState(false);

        if (newUserId) {
          loadOutfitFromStorage(newUserId);
        }
      } else if (!newUserId) {
        // Si el usuario se deslogueó, limpiar todo
        setUserId(null);
        setOutfitImageUrlState(null);
        setCurrentOutfitProducts([]);
        setOutfitHistory([]);
        setFaceEnhancementUsedState(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth, userId]);

  // Función para cargar el outfit del localStorage
  const loadOutfitFromStorage = (currentUserId: string) => {
    try {
      const urlKey = `${STORAGE_KEY_OUTFIT_URL_PREFIX}${currentUserId}`;
      const historyKey = `${STORAGE_KEY_HISTORY_PREFIX}${currentUserId}`;
      const faceEnhancementKey = `${STORAGE_KEY_FACE_ENHANCEMENT_PREFIX}${currentUserId}`;

      // Cargar la URL del outfit (ahora es una URL de Supabase Storage, no base64)
      const savedUrl = localStorage.getItem(urlKey);
      if (savedUrl) {
        setOutfitImageUrlState(savedUrl);
      }

      // Cargar historial de outfits
      const savedHistory = localStorage.getItem(historyKey);
      if (savedHistory) {
        try {
          const history = JSON.parse(savedHistory) as Array<{
            products: Product[];
            index: number;
          }>;
          setOutfitHistory(history);

          // El outfit actual es el último del historial
          if (history.length > 0) {
            const lastOutfit = history[history.length - 1];
            setCurrentOutfitProducts(lastOutfit.products);
          } else {
            setCurrentOutfitProducts([]);
          }
        } catch (parseError) {
          console.error("Error parsing saved history:", parseError);
          setOutfitHistory([]);
          setCurrentOutfitProducts([]);
        }
      } else {
        setOutfitHistory([]);
        setCurrentOutfitProducts([]);
      }

      // Cargar estado de face enhancement
      const savedFaceEnhancement = localStorage.getItem(faceEnhancementKey);
      if (savedFaceEnhancement) {
        setFaceEnhancementUsedState(savedFaceEnhancement === "true");
      } else {
        setFaceEnhancementUsedState(false);
      }
    } catch (error) {
      console.error("Error loading outfit from localStorage:", error);
    }
  };

  // Cargar la imagen del localStorage al montar el componente
  useEffect(() => {
    if (userId) {
      loadOutfitFromStorage(userId);
    }
    setIsHydrated(true);
  }, [userId]);

  // Escuchar cambios en los productos del outfit (para cuando se completa el onboarding)
  useEffect(() => {
    if (!userId) return;

    const handleProductsUpdated = (e: CustomEvent) => {
      if (e.detail?.products) {
        setCurrentOutfitProducts(e.detail.products);
      }
    };

    // Agregar listener para el evento personalizado
    window.addEventListener(
      "outfitProductsUpdated",
      handleProductsUpdated as EventListener
    );

    return () => {
      window.removeEventListener(
        "outfitProductsUpdated",
        handleProductsUpdated as EventListener
      );
    };
  }, [userId]);

  // Función wrapper para guardar la URL del outfit en localStorage
  // La imagen ya está en Supabase Storage, solo guardamos la URL
  const setOutfitImageUrl = async (url: string | null) => {
    setOutfitImageUrlState(url);

    if (!userId) return;

    try {
      const urlKey = `${STORAGE_KEY_OUTFIT_URL_PREFIX}${userId}`;

      if (url) {
        // Guardar solo la URL (mucho más ligero que base64)
        localStorage.setItem(urlKey, url);
      } else {
        localStorage.removeItem(urlKey);
      }
    } catch (error) {
      console.error("Error saving outfit URL to localStorage:", error);
    }
  };

  // Función para guardar historial en localStorage
  const saveHistoryToStorage = (
    history: Array<{ products: Product[]; index: number }>
  ) => {
    if (!userId) return;

    try {
      const historyKey = `${STORAGE_KEY_HISTORY_PREFIX}${userId}`;

      if (history.length > 0) {
        localStorage.setItem(historyKey, JSON.stringify(history));
      } else {
        localStorage.removeItem(historyKey);
      }
    } catch (error) {
      console.error("Error saving history to localStorage:", error);
    }
  };

  // Wrapper para setCurrentOutfitProducts que también actualiza el historial
  const updateCurrentOutfitProducts = (
    products: Product[],
    outfitIndex?: number
  ) => {
    setCurrentOutfitProducts(products);

    // Si se proporciona un índice, actualizar el historial
    if (outfitIndex !== undefined) {
      const newHistory = [...outfitHistory, { products, index: outfitIndex }];
      setOutfitHistory(newHistory);
      saveHistoryToStorage(newHistory);
    }
  };

  // Función para actualizar el estado de face enhancement
  const setFaceEnhancementUsed = (used: boolean) => {
    setFaceEnhancementUsedState(used);

    if (!userId) return;

    try {
      const faceEnhancementKey = `${STORAGE_KEY_FACE_ENHANCEMENT_PREFIX}${userId}`;
      if (used) {
        localStorage.setItem(faceEnhancementKey, "true");
      } else {
        localStorage.removeItem(faceEnhancementKey);
      }
    } catch (error) {
      console.error(
        "Error saving face enhancement state to localStorage:",
        error
      );
    }
  };

  // Función para hacer rollback al outfit anterior
  const rollbackOutfit = async () => {
    if (!userId) return;

    try {
      // Si no hay historial, eliminar todos los outfits y volver al avatar base
      if (outfitHistory.length === 0) {
        await deleteAllOutfitsClientSide(userId);
        await setOutfitImageUrl(null);
        setCurrentOutfitProducts([]);
        setOutfitHistory([]);
        saveHistoryToStorage([]);
        setFaceEnhancementUsed(false);
        return;
      }

      // Eliminar el último outfit del storage y obtener el anterior
      const { previousUrl } = await deleteLastOutfitClientSide(userId);

      // Actualizar el historial eliminando el último
      const newHistory = outfitHistory.slice(0, -1);
      setOutfitHistory(newHistory);
      saveHistoryToStorage(newHistory);

      // Si hay un outfit anterior, mostrarlo
      if (previousUrl && newHistory.length > 0) {
        const previousOutfit = newHistory[newHistory.length - 1];
        await setOutfitImageUrl(previousUrl);
        setCurrentOutfitProducts(previousOutfit.products);
      } else {
        // Si no hay más outfits, volver al avatar base
        await setOutfitImageUrl(null);
        setCurrentOutfitProducts([]);
      }

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
        setCurrentOutfitProducts: updateCurrentOutfitProducts,
        faceEnhancementUsed,
        setFaceEnhancementUsed,
        outfitHistoryCount: outfitHistory.length,
        outfitHistory,
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
