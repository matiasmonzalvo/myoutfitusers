"use client";

import type React from "react";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createServerClient } from "@/lib/supabase/client";

interface RedirectIfAuthenticatedProps {
  redirectTo?: string;
  children: React.ReactNode;
}

export function RedirectIfAuthenticated({
  redirectTo = "/",
  children,
}: RedirectIfAuthenticatedProps) {
  const router = useRouter();
  const supabase = createServerClient();

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        router.push(redirectTo);
      }
    };

    checkUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event: any, session: any) => {
      if (session?.user) {
        router.push(redirectTo);
      }
    });

    return () => subscription.unsubscribe();
  }, [router, redirectTo, supabase.auth]);

  return <>{children}</>;
}
