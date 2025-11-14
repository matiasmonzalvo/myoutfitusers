"use client";

import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface LikesContentProps {
  isAuthenticated: boolean;
}

export function LikesContent({ isAuthenticated }: LikesContentProps) {
  const router = useRouter();

  if (!isAuthenticated) {
    return (
      <div className="p-6 h-full flex flex-col items-center justify-center">
        <Heart className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
          Favoritos
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6 text-center">
          Inicia sesión para guardar tus productos favoritos
        </p>
        <div className="flex gap-3">
          <Button onClick={() => router.push("/register")}>Crear cuenta</Button>
          <Button onClick={() => router.push("/login")} variant="outline">
            Iniciar sesión
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
          Favoritos
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Tus elementos guardados y favoritos
        </p>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="space-y-3"></div>
      </div>
    </div>
  );
}
