"use client";

import type React from "react";
import { usePathname } from "next/navigation";
import { DashboardWrapper } from "@/components/DashboardWrapper";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ShoppingCartProvider } from "@/lib/contexts/shopping-cart-context";
import { OutfitProvider } from "@/lib/contexts/outfit-context";
import { CategoryFilterProvider } from "@/lib/contexts/category-filter-context";

interface AppShellProps {
  isAuthenticated: boolean;
  children: React.ReactNode;
}

export function AppShell({ isAuthenticated, children }: AppShellProps) {
  const pathname = usePathname();
  const isPricingRoute =
    pathname === "/pricing" || pathname?.startsWith("/pricing/");
  const isFeedbackRoute =
    pathname === "/feedback" || pathname?.startsWith("/feedback/");
  const isAdminRoute = pathname === "/admin" || pathname?.startsWith("/admin/");
  const isRegisterRoute =
    pathname === "/register" || pathname?.startsWith("/register/");
  const isLoginRoute = pathname === "/login" || pathname?.startsWith("/login/");
  const isOnboardingRoute =
    pathname === "/onboarding" || pathname?.startsWith("/onboarding/");

  if (
    !isPricingRoute &&
    !isFeedbackRoute &&
    !isAdminRoute &&
    !isRegisterRoute &&
    !isLoginRoute &&
    !isOnboardingRoute
  ) {
    return (
      <TooltipProvider delayDuration={0}>
        <ShoppingCartProvider>
          <OutfitProvider>
            <CategoryFilterProvider>
              <DashboardWrapper isAuthenticated={isAuthenticated}>
                {children}
              </DashboardWrapper>
            </CategoryFilterProvider>
          </OutfitProvider>
        </ShoppingCartProvider>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider delayDuration={0}>
      <ShoppingCartProvider>
        <OutfitProvider>{children}</OutfitProvider>
      </ShoppingCartProvider>
    </TooltipProvider>
  );
}
