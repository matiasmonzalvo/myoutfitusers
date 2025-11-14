"use client";

import { Bell, Shield, Palette, User, LogOut, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createServerClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface SettingsContentProps {
  isAuthenticated: boolean;
}

export function SettingsContent({ isAuthenticated }: SettingsContentProps) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const supabase = createServerClient();
      await supabase.auth.signOut();
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="pb-6 h-auto w-full">
        <Settings className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
          Configuración
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6 text-center">
          Inicia sesión para acceder a la configuración de tu cuenta
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
    <div className="pb-6 h-auto w-full">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
          Configuración
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Personaliza tu experiencia
        </p>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="space-y-4">
          {/* Perfil */}
          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
            <div className="flex items-center space-x-3 mb-3">
              <User className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <h3 className="font-medium text-gray-700 dark:text-gray-300">
                Perfil
              </h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Gestiona tu información personal
            </p>
          </div>

          {/* Notificaciones */}
          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
            <div className="flex items-center space-x-3 mb-3">
              <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <h3 className="font-medium text-gray-700 dark:text-gray-300">
                Notificaciones
              </h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Configura cómo recibes notificaciones
            </p>
          </div>

          {/* Apariencia */}
          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
            <div className="flex items-center space-x-3 mb-3">
              <Palette className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <h3 className="font-medium text-gray-700 dark:text-gray-300">
                Apariencia
              </h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Personaliza el tema y colores
            </p>
          </div>

          {/* Privacidad */}
          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
            <div className="flex items-center space-x-3 mb-3">
              <Shield className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <h3 className="font-medium text-gray-700 dark:text-gray-300">
                Privacidad
              </h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Controla tu privacidad y seguridad
            </p>
          </div>
        </div>

        {/* Botón de Logout */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="destructive"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full"
          >
            <LogOut className="w-4 h-4 mr-2" />
            {isLoggingOut ? "Cerrando sesión..." : "Cerrar Sesión"}
          </Button>
        </div>
      </div>
    </div>
  );
}
