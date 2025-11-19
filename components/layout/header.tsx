"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createServerClient } from "@/lib/supabase/client";
import { User, LogOut, Settings, Triangle, Table, DollarSign } from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import Image from "next/image";

export function Header() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createServerClient();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event: any, session: any) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full lg:w-[calc(100%)] bg-gradient-to-b from-background to-transparent flex justify-center">
      <div className="w-full 2xl:w-full flex h-16 items-center lg:px-20 2xl:px-40 px-4">
        <div className="flex items-center space-x-6">
          <Link href="/" className="flex items-center space-x-1.5 mr-10 ">
            <div className="flex items-center w-6 h-6">
              <Image
                src="/logo.png"
                alt="Tablium"
                width={100}
                height={100}
                className="w-full h-full invert"
              />
            </div>
            <span className="font-[600] tracking-tighter text-2xl text-foreground leading-[1]">
              Tablium
            </span>
          </Link>
          <div className="items-center space-x-4 hidden sm:flex mt-1">
            <button
              onClick={() => {
                const element = document.getElementById("ai");
                if (element) {
                  const headerHeight = 32; // 16 * 4 = 64px (h-16)
                  const elementPosition = element.offsetTop - headerHeight;
                  window.scrollTo({
                    top: elementPosition,
                    behavior: "smooth",
                  });
                }
              }}
              className="cursor-pointer text-sm text-muted-foreground leading-[1] hover:text-foreground transition-colors"
            >
              AI
            </button>
            <button
              onClick={() => {
                const element = document.getElementById("features");
                if (element) {
                  const headerHeight = 32; // 16 * 4 = 64px (h-16)
                  const elementPosition = element.offsetTop - headerHeight;
                  window.scrollTo({
                    top: elementPosition,
                    behavior: "smooth",
                  });
                }
              }}
              className="cursor-pointer text-sm text-muted-foreground leading-[1] hover:text-foreground transition-colors"
            >
              Features
            </button>
            <button
              onClick={() => {
                const element = document.getElementById("blocks");
                if (element) {
                  const headerHeight = 32; // 16 * 4 = 64px (h-16)
                  const elementPosition = element.offsetTop - headerHeight;
                  window.scrollTo({
                    top: elementPosition,
                    behavior: "smooth",
                  });
                }
              }}
              className="cursor-pointer text-sm text-muted-foreground leading-[1] hover:text-foreground transition-colors"
            >
              Blocks
            </button>
            <button
              onClick={() => {
                const element = document.getElementById("feedback");
                if (element) {
                  const headerHeight = 32; // 16 * 4 = 64px (h-16)
                  const elementPosition = element.offsetTop - headerHeight;
                  window.scrollTo({
                    top: elementPosition,
                    behavior: "smooth",
                  });
                }
              }}
              className="cursor-pointer text-sm text-muted-foreground leading-[1] hover:text-foreground transition-colors"
            >
              Feedback
            </button>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-end space-x-4">
          {loading ? (
            <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {user.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{user.email}</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard">
                    <User className="mr-2 h-4 w-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/billing">
                    <DollarSign className="mr-2 h-4 w-4" />
                    Billing
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center space-x-1.5">
              <Link
                href="/login"
                className="py-1.5 px-4 text-sm text-foreground font-semibold tracking-tight"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="py-1.5 px-4 text-sm bg-blue text-white font-semibold rounded-full tracking-tight"
              >
                Try Tablium
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
