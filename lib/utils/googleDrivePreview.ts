"use client";

import html2canvas from "html2canvas";

export interface DriveFileInfo {
  id: string;
  name: string;
  mimeType?: string;
}

// Función para generar preview usando Google Drive API thumbnails
async function tryGetGoogleDriveThumbnail(
  fileId: string,
  accessToken: string
): Promise<string | null> {
  try {
    // Intentar obtener metadata del archivo con thumbnailLink
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?fields=thumbnailLink,mimeType`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      console.warn("No se pudo obtener metadata del archivo:", response.status);
      return null;
    }

    const data = await response.json();

    if (data.thumbnailLink) {
      // Intentar obtener una versión más grande del thumbnail
      const thumbnailUrl = data.thumbnailLink.replace(/=s\d+/, "=s400");

      // Verificar que el thumbnail sea accesible
      const thumbnailResponse = await fetch(thumbnailUrl);
      if (thumbnailResponse.ok) {
        return thumbnailUrl;
      }
    }

    return null;
  } catch (error) {
    console.warn("Error obteniendo thumbnail de Google Drive:", error);
    return null;
  }
}

// Función para capturar iframe como imagen usando html2canvas
async function captureIframeAsImage(fileId: string): Promise<string | null> {
  try {
    // Crear un iframe temporal para la captura
    const iframe = document.createElement("iframe");
    iframe.src = `https://drive.google.com/file/d/${fileId}/preview`;
    iframe.style.width = "800px";
    iframe.style.height = "600px";
    iframe.style.position = "absolute";
    iframe.style.left = "-9999px";
    iframe.style.border = "none";

    document.body.appendChild(iframe);

    // Esperar a que el iframe cargue
    await new Promise((resolve, reject) => {
      iframe.onload = resolve;
      iframe.onerror = reject;

      // Timeout después de 10 segundos
      setTimeout(() => reject(new Error("Timeout")), 10000);
    });

    // Esperar un poco más para que el contenido se renderice
    await new Promise((resolve) => setTimeout(resolve, 2000));

    try {
      // Intentar capturar el contenido del iframe
      const canvas = await html2canvas(iframe, {
        allowTaint: true,
        useCORS: true,
        scale: 0.5, // Reducir escala para archivos más pequeños
        width: 800,
        height: 600,
      });

      // Convertir canvas a base64
      const base64Image = canvas.toDataURL("image/jpeg", 0.8);

      // Limpiar el iframe temporal
      document.body.removeChild(iframe);

      return base64Image;
    } catch (captureError) {
      console.warn("Error capturando iframe:", captureError);
      document.body.removeChild(iframe);
      return null;
    }
  } catch (error) {
    console.warn("Error creando iframe para captura:", error);
    return null;
  }
}

// Función para generar preview usando export de Google Drive (para docs, sheets, slides)
async function tryExportAsImage(
  fileId: string,
  accessToken: string,
  mimeType?: string
): Promise<string | null> {
  if (!mimeType) return null;

  try {
    let exportMimeType = "";

    // Determinar el tipo de export según el tipo de archivo
    if (mimeType.includes("document")) {
      exportMimeType = "image/png";
    } else if (mimeType.includes("spreadsheet")) {
      exportMimeType = "image/png";
    } else if (mimeType.includes("presentation")) {
      exportMimeType = "image/png";
    } else {
      return null; // No es un tipo exportable
    }

    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=${encodeURIComponent(exportMimeType)}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      console.warn("No se pudo exportar archivo como imagen:", response.status);
      return null;
    }

    const blob = await response.blob();

    // Convertir blob a base64
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.warn("Error exportando archivo como imagen:", error);
    return null;
  }
}

// Función principal para generar preview de un archivo de Google Drive
export async function generateGoogleDrivePreview(
  fileInfo: DriveFileInfo,
  accessToken: string
): Promise<string | null> {
  const { id: fileId, mimeType } = fileInfo;

  console.log("Generando preview para:", fileInfo.name, "Tipo:", mimeType);

  // Estrategia 1: Intentar obtener thumbnail de Google Drive API
  const thumbnail = await tryGetGoogleDriveThumbnail(fileId, accessToken);
  if (thumbnail) {
    console.log("✓ Preview generado usando thumbnail de Google Drive API");
    return thumbnail;
  }

  // Estrategia 2: Para Google Docs/Sheets/Slides, intentar export como imagen
  if (
    mimeType &&
    (mimeType.includes("document") ||
      mimeType.includes("spreadsheet") ||
      mimeType.includes("presentation"))
  ) {
    const exportedImage = await tryExportAsImage(fileId, accessToken, mimeType);
    if (exportedImage) {
      console.log("✓ Preview generado usando export de Google Drive");
      return exportedImage;
    }
  }

  // Estrategia 3: Capturar iframe como imagen (fallback)
  const capturedImage = await captureIframeAsImage(fileId);
  if (capturedImage) {
    console.log("✓ Preview generado capturando iframe");
    return capturedImage;
  }

  console.warn("✗ No se pudo generar preview para:", fileInfo.name);
  return null;
}

// Función para generar preview de una imagen directamente desde Google Drive
export async function generateImagePreview(
  fileId: string,
  accessToken: string
): Promise<string | null> {
  try {
    // Para imágenes, podemos usar directamente la URL de descarga
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      return null;
    }

    const blob = await response.blob();

    // Convertir blob a base64
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.warn("Error obteniendo imagen de Google Drive:", error);
    return null;
  }
}

// Función para determinar si un archivo es una imagen
export function isImageFile(mimeType?: string): boolean {
  return mimeType ? mimeType.startsWith("image/") : false;
}

// Función para determinar si un archivo es un documento de Google
export function isGoogleDocument(mimeType?: string): boolean {
  if (!mimeType) return false;

  return (
    mimeType.includes("google-apps.document") ||
    mimeType.includes("google-apps.spreadsheet") ||
    mimeType.includes("google-apps.presentation")
  );
}

