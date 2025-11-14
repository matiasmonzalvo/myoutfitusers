"use client";

import type React from "react";

interface LoadingScreenProps {
  message?: string;
}

export default function LoadingScreen({ message }: LoadingScreenProps) {
  return (
    <div className="flex items-center justify-center h-full w-full p-6 bg-red-500">
      <div className="flex flex-col items-center gap-3 text-center">
        <div
          className="h-8 w-8 rounded-full border-2 border-muted-foreground/0 border-t-foreground animate-spin"
          aria-label="Cargando"
          role="status"
        />
        {message && <p className="text-sm text-muted-foreground">{message}</p>}
      </div>
    </div>
  );
}
