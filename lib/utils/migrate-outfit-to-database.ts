/**
 * Utilidad para migrar outfits desde localStorage a la base de datos
 * Esta función se puede ejecutar una sola vez para migrar datos existentes
 */

import { createServerClient } from "@/lib/supabase/client";
import type { Product } from "@/lib/actions/products";

export async function migrateOutfitToDatabase(userId: string) {
  const supabase = createServerClient();

  try {
    // Intentar cargar datos del localStorage
    const urlKey = `outfit_current_url_${userId}`;
    const historyKey = `outfit_history_${userId}`;

    const savedUrl = localStorage.getItem(urlKey);
    const savedHistory = localStorage.getItem(historyKey);

    if (!savedUrl || !savedHistory) {
      console.log("No outfit data to migrate");
      return { success: true, message: "No data to migrate" };
    }

    // Parsear el historial
    const history = JSON.parse(savedHistory) as Array<{
      products: Product[];
      index: number;
    }>;

    if (history.length === 0) {
      console.log("No outfit history to migrate");
      return { success: true, message: "No history to migrate" };
    }

    // Migrar cada outfit del historial
    for (const outfit of history) {
      const { error } = await supabase.from("avatar_history").upsert(
        {
          user_id: userId,
          outfit_index: outfit.index,
          outfit_image_url: savedUrl,
          products: outfit.products,
          is_current: outfit.index === history[history.length - 1].index, // El último es el actual
        },
        {
          onConflict: "user_id,outfit_index",
        }
      );

      if (error) {
        console.error("Error migrating outfit:", error);
        return { success: false, error: error.message };
      }
    }

    console.log("Outfit data migrated successfully");

    // Opcional: Limpiar localStorage después de migrar
    // localStorage.removeItem(urlKey);
    // localStorage.removeItem(historyKey);

    return { success: true, message: "Migration completed successfully" };
  } catch (error) {
    console.error("Error during migration:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

