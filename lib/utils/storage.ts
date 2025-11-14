"use client";

import { createServerClient } from "@/lib/supabase/client";

/**
 * Upload an image to Supabase Storage
 * @param file - The file to upload
 * @param bucket - The storage bucket name
 * @param folder - The folder path within the bucket
 * @returns The public URL of the uploaded image
 */
export async function uploadImage(
  file: File,
  bucket: "brand-logos" | "product-images",
  folder: string
): Promise<string> {
  const supabase = createServerClient();

  // Generate unique filename
  const fileExt = file.name.split(".").pop();
  const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
  const filePath = `${folder}/${fileName}`;

  // Upload file
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    console.error("Error uploading image:", error);
    throw new Error(`Error al subir imagen: ${error.message}`);
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(filePath);

  return publicUrl;
}

/**
 * Upload multiple images to Supabase Storage
 * @param files - Array of files to upload
 * @param bucket - The storage bucket name
 * @param folder - The folder path within the bucket
 * @returns Array of public URLs of the uploaded images
 */
export async function uploadMultipleImages(
  files: File[],
  bucket: "brand-logos" | "product-images",
  folder: string
): Promise<string[]> {
  const uploadPromises = files.map((file) => uploadImage(file, bucket, folder));
  return Promise.all(uploadPromises);
}

/**
 * Delete an image from Supabase Storage
 * @param url - The public URL of the image to delete
 * @param bucket - The storage bucket name
 */
export async function deleteImage(
  url: string,
  bucket: "brand-logos" | "product-images"
): Promise<void> {
  const supabase = createServerClient();

  // Extract file path from URL
  const urlParts = url.split(`/storage/v1/object/public/${bucket}/`);
  if (urlParts.length < 2) {
    throw new Error("Invalid image URL");
  }

  const filePath = urlParts[1];

  const { error } = await supabase.storage.from(bucket).remove([filePath]);

  if (error) {
    console.error("Error deleting image:", error);
    throw new Error(`Error al eliminar imagen: ${error.message}`);
  }
}

/**
 * Delete multiple images from Supabase Storage
 * @param urls - Array of public URLs of images to delete
 * @param bucket - The storage bucket name
 */
export async function deleteMultipleImages(
  urls: string[],
  bucket: "brand-logos" | "product-images"
): Promise<void> {
  const deletePromises = urls.map((url) => deleteImage(url, bucket));
  await Promise.all(deletePromises);
}

/**
 * Validate image file
 * @param file - The file to validate
 * @param maxSizeMB - Maximum file size in MB (default: 5MB)
 * @returns true if valid, throws error if invalid
 */
export function validateImageFile(file: File, maxSizeMB: number = 5): boolean {
  // Check file type
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    throw new Error(
      "Tipo de archivo no permitido. Solo se permiten: JPG, PNG, WEBP"
    );
  }

  // Check file size
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    throw new Error(`El archivo es muy grande. Máximo: ${maxSizeMB}MB`);
  }

  return true;
}

/**
 * Get image dimensions
 * @param file - The image file
 * @returns Promise with width and height
 */
export function getImageDimensions(
  file: File
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.width, height: img.height });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Error al cargar la imagen"));
    };

    img.src = url;
  });
}

/**
 * Compress image before upload (optional utility)
 * @param file - The image file to compress
 * @param maxWidth - Maximum width in pixels
 * @param quality - Quality from 0 to 1
 * @returns Compressed image as Blob
 */
export async function compressImage(
  file: File,
  maxWidth: number = 1920,
  quality: number = 0.8
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    img.onload = () => {
      let { width, height } = img;

      // Calculate new dimensions
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Error al comprimir imagen"));
          }
        },
        file.type,
        quality
      );
    };

    img.onerror = () => reject(new Error("Error al cargar imagen"));
    img.src = URL.createObjectURL(file);
  });
}
