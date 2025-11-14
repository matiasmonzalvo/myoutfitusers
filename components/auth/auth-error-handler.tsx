"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function AuthErrorHandler() {
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam) {
      switch (errorParam) {
        case "auth_callback_failed":
          setError(
            "Error durante la autenticación. Por favor intenta de nuevo."
          );
          break;
        case "access_denied":
          setError("Acceso denegado. Por favor intenta de nuevo.");
          break;
        default:
          setError("Ocurrió un error inesperado. Por favor intenta de nuevo.");
      }
    }
  }, [searchParams]);

  if (!error) return null;

  return (
    <Alert variant="destructive">
      <AlertDescription>{error}</AlertDescription>
    </Alert>
  );
}
