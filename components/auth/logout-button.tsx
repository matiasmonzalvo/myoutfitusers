"use client";

import { createServerClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  const supabase = createServerClient();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <button
      className="px-3 leading-[1] bg-muted rounded-full relative cursor-pointer flex items-center justify-center gap-2 h-8"
      onClick={handleLogout}
    >
      <LogOut className="w-4 h-4" />
      Logout
    </button>
  );
}
