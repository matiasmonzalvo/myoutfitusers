"use client";

import type React from "react";
import { useEffect, useRef, useState } from "react";
import { Sidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { CardLayout } from "@/components/CardLayout";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "./ui/dropdown-menu";
import {
  ChevronDown,
  Share,
  Menu,
  LayoutDashboard,
  Crown,
  Check,
} from "lucide-react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  AiSheetsIcon,
  MenuTwoLineIcon,
  MoreIcon,
  TokenSquareIcon,
} from "@hugeicons/core-free-icons";
import Link from "next/link";
import { usePathname } from "next/navigation";
import PromptInput from "./PromptInput";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Jelly, Quantum } from "ldrs/react";
import "ldrs/react/Jelly.css";
import { AvatarHub } from "./AvatarHub";
import { SearchProvider } from "@/lib/contexts/search-context";
import { MobileShoppingCart } from "./MobileShoppingCart";
import Image from "next/image";

interface DashboardWrapperProps {
  children: React.ReactNode;
  isAuthenticated: boolean;
}

export function DashboardWrapper({
  children,
  isAuthenticated,
}: DashboardWrapperProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const pathname = usePathname();
  const insetRef = useRef<HTMLDivElement | null>(null);
  const [showCreatingOverlay, setShowCreatingOverlay] = useState(false);
  const [showEditingOverlay, setShowEditingOverlay] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<0 | 1 | 2>(0);
  const [isStepVisible, setIsStepVisible] = useState(false);
  const stepTimeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<"tablium" | "pro">(
    "tablium"
  );

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  // Ya no calculamos el centro manualmente; usaremos centrado por CSS del contenedor relativo.

  // Cierra la side sheet al cambiar de ruta
  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [pathname]);

  // Hacer scroll al inicio cuando cambia la ruta
  useEffect(() => {
    if (insetRef.current) {
      const scrollContainer =
        insetRef.current.querySelector(".overflow-y-auto");
      if (scrollContainer) {
        scrollContainer.scrollTo(0, 0);
      }
    }
  }, [pathname]);

  // Secuencia de textos con transiciones (2s, 4s y luego permanente)
  useEffect(() => {
    const clearAll = () => {
      stepTimeoutsRef.current.forEach((id) => clearTimeout(id));
      stepTimeoutsRef.current = [];
    };
    clearAll();

    if (!showCreatingOverlay) {
      setCurrentStep(0);
      setIsStepVisible(false);
      return;
    }

    // Mostrar primer paso
    setCurrentStep(0);
    setIsStepVisible(true);

    // Tras 2s ocultar, cambiar a paso 2 y mostrar
    const t1 = setTimeout(() => {
      setIsStepVisible(false);
      const t1b = setTimeout(() => {
        setCurrentStep(1);
        setIsStepVisible(true);

        // Tras 4s ocultar, cambiar a paso 3 y dejar visible permanentemente
        const t2 = setTimeout(() => {
          setIsStepVisible(false);
          const t2b = setTimeout(() => {
            setCurrentStep(2);
            setIsStepVisible(true);
          }, 300); // coincidir con duración de transición
          stepTimeoutsRef.current.push(t2b);
        }, 4000);
        stepTimeoutsRef.current.push(t2);
      }, 300); // coincidir con duración de transición
      stepTimeoutsRef.current.push(t1b);
    }, 3000);
    stepTimeoutsRef.current.push(t1);

    return () => {
      clearAll();
    };
  }, [showCreatingOverlay]);

  return (
    <SearchProvider>
      <div className="flex lg:h-screen overflow-hidden">
        <SidebarProvider>
          {/* Sidebar fija solo en desktop */}

          {/* Sheet de sidebar en mobile */}
          <Sheet
            open={isMobileSidebarOpen}
            onOpenChange={setIsMobileSidebarOpen}
          >
            <SheetContent
              side="left"
              className="p-0 w-64 max-w-none bg-background border-r border-border"
            >
              <SheetTitle className="sr-only">Sidebar</SheetTitle>
              <div className="flex flex-col h-full p-4">
                <div className="space-y-1">
                  <Link href="/" className="block py-3">
                    <Image
                      src="/logo.png"
                      alt="Outfiterz"
                      width={120}
                      height={120}
                      className="w-10 h-10 lg:w-12 lg:h-12 dark:invert"
                    />
                  </Link>
                  <Link
                    href="/about"
                    className="block py-3 rounded-lg font-medium text-foreground hover:bg-muted transition-colors cursor-pointer"
                    onClick={() => setIsMobileSidebarOpen(false)}
                  >
                    About
                  </Link>
                  <Link
                    href="/guide"
                    className="block py-3 rounded-lg font-medium text-foreground hover:bg-muted transition-colors cursor-pointer"
                    onClick={() => setIsMobileSidebarOpen(false)}
                  >
                    Guide
                  </Link>
                  <Link
                    href="/pricing"
                    className="block py-3 rounded-lg font-medium text-foreground hover:bg-muted transition-colors cursor-pointer"
                    onClick={() => setIsMobileSidebarOpen(false)}
                  >
                    Pricing
                  </Link>
                  <Link
                    href="/contact"
                    className="block py-3 rounded-lg font-medium text-foreground hover:bg-muted transition-colors cursor-pointer"
                    onClick={() => setIsMobileSidebarOpen(false)}
                  >
                    Contact
                  </Link>
                </div>

                {!isAuthenticated && (
                  <div className="space-y-3 pt-4">
                    <Link
                      href="/login"
                      className="block w-full py-2 px-4 text-center font-medium text-foreground border border-border rounded-full bg-muted hover:opacity-80 transition-all cursor-pointer"
                      onClick={() => setIsMobileSidebarOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      href="/register"
                      className="block w-full py-2 px-4 text-center bg-primary text-white font-medium rounded-full hover:opacity-80 transition-all cursor-pointer"
                      onClick={() => setIsMobileSidebarOpen(false)}
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
          <SidebarInset ref={insetRef} className="relative flex-1 min-w-0 z-50">
            <div
              className={
                "relative min-h-screen w-full transition-all duration-700 ease-in-out bg-background overflow-y-auto " +
                (false ? "blur-sm opacity-0" : "opacity-100")
              }
            >
              <div className="w-full lg:hidden bg-background p-4">
                <CardLayout
                  isAuthenticated={isAuthenticated}
                  onOpenSidebar={() => setIsMobileSidebarOpen(true)}
                >
                  {children}
                </CardLayout>
                {/* Mobile Shopping Cart - visible en toda la app en mobile */}
                <MobileShoppingCart />
              </div>
              <div className="hidden lg:flex flex-row bg-background">
                <div className="lg:w-[55%] xl:w-[65%] 2xl:w-[60%] relative flex items-start justify-end bg-background pl-10 pb-10">
                  <CardLayout
                    isAuthenticated={isAuthenticated}
                    onOpenSidebar={() => setIsMobileSidebarOpen(true)}
                  >
                    {children}
                  </CardLayout>
                </div>
                <div className="lg:w-[45%] xl:w-[35%] 2xl:w-[40%] lg:h-screen sticky top-0 flex flex-col items-center justify-start">
                  <AvatarHub isAuthenticated={isAuthenticated} />
                </div>
              </div>
            </div>

            <div
              className={
                "absolute inset-0 z-[70] flex items-center justify-center transition-opacity duration-300 " +
                (showCreatingOverlay
                  ? "opacity-100"
                  : "opacity-0 pointer-events-none")
              }
            >
              <div className=" flex flex-col items-center gap-6 -mt-32 opacity-90">
                <Jelly size="80" speed="2" color="var(--foreground)" />
                <h3
                  className={
                    "text-4xl md:text-6xl leading-[1] font-semibold text-foreground tracking-tighter transition-all duration-300 ease-in-out " +
                    (isStepVisible
                      ? "opacity-100"
                      : "opacity-0 blur-xs translate-y-1 pointer-events-none")
                  }
                >
                  {currentStep === 0
                    ? "I'm reading your prompt"
                    : currentStep === 1
                      ? "Defining types of blocks"
                      : "Creating your grid"}
                </h3>
              </div>
            </div>

            {/* Overlay de edición */}
            <div
              className={
                "absolute inset-0 z-[70] bg-background/10 backdrop-blur-sm flex items-center justify-center transition-opacity duration-300 " +
                (showEditingOverlay
                  ? "opacity-100"
                  : "opacity-0 pointer-events-none")
              }
            >
              <div className="bg-background border border-border rounded-xl py-6 w-sm shadow-lg flex flex-col items-center gap-6">
                <Quantum size="45" speed="1.8" color="var(--foreground)" />
                <p className="text-lg font-medium text-foreground">
                  Editing your table...
                </p>
              </div>
            </div>
          </SidebarInset>
        </SidebarProvider>
      </div>
    </SearchProvider>
  );
}
