"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, ShoppingBag, Shirt, ArrowRight, Heart } from "lucide-react";
import Image from "next/image";

export function WelcomeDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const welcomeParam = searchParams.get("welcome");
    const hasSeenWelcome = localStorage.getItem("hasSeenWelcome");

    // Solo mostrar si viene del onboarding y no lo ha visto antes
    if (welcomeParam === "true" && !hasSeenWelcome) {
      setIsOpen(true);
      // Marcar como visto
      localStorage.setItem("hasSeenWelcome", "true");
      // Limpiar el parámetro de la URL sin recargar
      const url = new URL(window.location.href);
      url.searchParams.delete("welcome");
      router.replace(url.pathname, { scroll: false });
    }
  }, [searchParams, router]);

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleNavigateToGuide = () => {
    router.push("/guide/start-wearing");
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent
        className="sm:max-w-md p-0 overflow-hidden border-0 space-y-0 gap-0 rounded-3xl"
        showCloseButton={false}
      >
        <div className="w-full aspect-[5/3]">
          <img
            src="/og-image-v2.png"
            alt="Welcome to My Outfit"
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
        <div className="relative text-center px-6 py-2  pt-4">
          <div className="relative">
            <DialogHeader>
              <DialogTitle className="text-3xl font-semibold text-foreground tracking-tighter leading-[1]">
                Welcome to My Outfit
              </DialogTitle>
              <DialogDescription className="text-foreground/80 text-base mt-1 leading-[1.4]">
                We highly recommend you to read the guide to get the most out of
                your experience. You can find it in the guide section of the
                website or by clicking the button below.
              </DialogDescription>
            </DialogHeader>
          </div>
        </div>

        {/* Contenido */}
        <div className="px-6 pb-6 space-y-4 mt-2 lg:mt-0">
          <button
            className="text-base font-medium cursor-pointer text-center w-full text-primary hover:text-primary/80 transition-colors"
            onClick={handleClose}
          >
            I'll read it later
          </button>
          {/* CTA */}
          <Button
            onClick={handleNavigateToGuide}
            className="w-full rounded-full h-12 text-base font-medium text-white group cursor-pointer"
          >
            Read the guide
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
