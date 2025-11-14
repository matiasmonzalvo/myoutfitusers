/**
 * Utilidades para gestionar el bucket current-outfits en Supabase Storage
 * Este bucket almacena el historial de outfits de cada usuario (no el avatar base)
 */

const BUCKET_NAME = "current-outfits";

/**
 * Obtiene el nombre del archivo para un outfit específico de un usuario
 */
function getOutfitFileName(userId: string, index: number): string {
  return `${userId}/outfit-${index}.png`;
}

/**
 * Obtiene todos los archivos de outfit de un usuario desde Supabase
 */
export async function listUserOutfits(
  userId: string,
  supabase: any
): Promise<number[]> {
  const { data, error } = await supabase.storage.from(BUCKET_NAME).list(userId);

  if (error) {
    console.error("Error listing user outfits:", error);
    return [];
  }

  // Extraer los índices de los archivos outfit-X.png
  const indices = data
    .map((file: any) => {
      const match = file.name.match(/^outfit-(\d+)\.png$/);
      return match ? parseInt(match[1], 10) : null;
    })
    .filter((index: number | null) => index !== null)
    .sort((a: number, b: number) => a - b);

  return indices;
}

/**
 * Sube una nueva imagen de outfit al bucket current-outfits (SERVER-SIDE ONLY)
 * Añade el outfit al historial sin eliminar los anteriores
 *
 * @param userId - ID del usuario
 * @param imageBase64 - Imagen en formato base64 (sin el prefijo data:image/...)
 * @param supabase - Cliente de Supabase server
 * @returns Objeto con la URL pública y el índice del outfit
 */
export async function uploadCurrentOutfit(
  userId: string,
  imageBase64: string,
  supabase: any
): Promise<{ url: string; index: number }> {
  // Convertir base64 a buffer
  const buffer = Buffer.from(imageBase64, "base64");

  console.log(`[Outfit History] Uploading new outfit for user ${userId}...`);

  // Obtener el índice del último outfit
  const existingIndices = await listUserOutfits(userId, supabase);
  const nextIndex =
    existingIndices.length > 0 ? Math.max(...existingIndices) + 1 : 0;

  const fileName = getOutfitFileName(userId, nextIndex);

  console.log(`[Outfit History] Next outfit index: ${nextIndex}`);

  // Subir la nueva imagen
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(fileName, buffer, {
      contentType: "image/png",
      upsert: false, // No sobrescribir, cada outfit es único
      cacheControl: "no-cache",
    });

  if (uploadError) {
    console.error("Error uploading outfit:", uploadError);
    throw new Error(`Failed to upload outfit: ${uploadError.message}`);
  }

  console.log(`[Outfit History] Upload successful:`, uploadData);

  // Obtener la URL pública con cache-busting parameter
  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET_NAME).getPublicUrl(fileName);

  const urlWithCacheBuster = `${publicUrl}?t=${Date.now()}`;

  console.log(
    `[Outfit History] Public URL with cache buster:`,
    urlWithCacheBuster
  );

  return {
    url: urlWithCacheBuster,
    index: nextIndex,
  };
}

/**
 * Elimina el último outfit del historial (SERVER-SIDE ONLY)
 *
 * @param userId - ID del usuario
 * @param supabase - Cliente de Supabase server
 * @returns El índice del outfit anterior (o null si no hay más)
 */
export async function deleteLastOutfit(
  userId: string,
  supabase: any
): Promise<number | null> {
  const indices = await listUserOutfits(userId, supabase);

  if (indices.length === 0) {
    console.log(`[Outfit History] No outfits to delete for user ${userId}`);
    return null;
  }

  const lastIndex = Math.max(...indices);
  const fileName = getOutfitFileName(userId, lastIndex);

  console.log(
    `[Outfit History] Deleting outfit at index ${lastIndex}: ${fileName}`
  );

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([fileName]);

  if (error) {
    console.error(
      `[Outfit History] Error deleting outfit ${lastIndex}:`,
      error
    );
    throw new Error(`Failed to delete outfit: ${error.message}`);
  }

  console.log(
    `[Outfit History] Successfully deleted outfit ${lastIndex}:`,
    data
  );

  // Retornar el índice del outfit anterior (si existe)
  const remainingIndices = indices.filter((i) => i !== lastIndex);
  return remainingIndices.length > 0 ? Math.max(...remainingIndices) : null;
}

/**
 * Elimina todos los outfits de un usuario (SERVER-SIDE ONLY)
 *
 * @param userId - ID del usuario
 * @param supabase - Cliente de Supabase server
 */
export async function deleteAllOutfits(
  userId: string,
  supabase: any
): Promise<void> {
  const indices = await listUserOutfits(userId, supabase);

  if (indices.length === 0) {
    console.log(`[Outfit History] No outfits to delete for user ${userId}`);
    return;
  }

  const fileNames = indices.map((index) => getOutfitFileName(userId, index));

  console.log(
    `[Outfit History] Deleting ${fileNames.length} outfits for user ${userId}`
  );

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove(fileNames);

  if (error) {
    console.error(`[Outfit History] Error deleting outfits:`, error);
    throw new Error(`Failed to delete outfits: ${error.message}`);
  }

  console.log(`[Outfit History] Successfully deleted all outfits:`, data);
}

/**
 * Versión client-side para eliminar el último outfit
 * Útil para cuando se necesita hacer rollback desde el cliente
 */
export async function deleteLastOutfitClientSide(
  userId: string
): Promise<{ previousIndex: number | null; previousUrl: string | null }> {
  const { createServerClient } = await import("@/lib/supabase/client");
  const client = createServerClient();

  // Obtener índices actuales
  const { data, error: listError } = await client.storage
    .from(BUCKET_NAME)
    .list(userId);

  if (listError) {
    console.error("Error listing outfits (client-side):", listError);
    return { previousIndex: null, previousUrl: null };
  }

  const indices = data
    .map((file: any) => {
      const match = file.name.match(/^outfit-(\d+)\.png$/);
      return match ? parseInt(match[1], 10) : null;
    })
    .filter((index: number | null) => index !== null)
    .sort((a: number, b: number) => a - b);

  if (indices.length === 0) {
    return { previousIndex: null, previousUrl: null };
  }

  const lastIndex = Math.max(...indices);
  const fileName = getOutfitFileName(userId, lastIndex);

  // Eliminar el último outfit
  const { error } = await client.storage.from(BUCKET_NAME).remove([fileName]);

  if (error && error.message !== "Object not found") {
    console.error("Error deleting last outfit (client-side):", error);
    throw new Error(`Failed to delete last outfit: ${error.message}`);
  }

  // Obtener el índice y URL del outfit anterior
  const remainingIndices = indices.filter((i: number) => i !== lastIndex);
  if (remainingIndices.length > 0) {
    const previousIndex = Math.max(...remainingIndices);
    const previousFileName = getOutfitFileName(userId, previousIndex);
    const {
      data: { publicUrl },
    } = client.storage.from(BUCKET_NAME).getPublicUrl(previousFileName);

    return {
      previousIndex,
      previousUrl: `${publicUrl}?t=${Date.now()}`,
    };
  }

  return { previousIndex: null, previousUrl: null };
}

/**
 * Versión client-side para eliminar todos los outfits
 */
export async function deleteAllOutfitsClientSide(
  userId: string
): Promise<void> {
  const { createServerClient } = await import("@/lib/supabase/client");
  const client = createServerClient();

  const { data, error: listError } = await client.storage
    .from(BUCKET_NAME)
    .list(userId);

  if (listError) {
    console.error("Error listing outfits (client-side):", listError);
    return;
  }

  const fileNames = data
    .filter((file: any) => file.name.match(/^outfit-\d+\.png$/))
    .map((file: any) => `${userId}/${file.name}`);

  if (fileNames.length === 0) {
    return;
  }

  const { error } = await client.storage.from(BUCKET_NAME).remove(fileNames);

  if (error) {
    console.error("Error deleting all outfits (client-side):", error);
  }
}
