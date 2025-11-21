import { OnboardingForm } from "@/components/auth/onboarding-form";
import { LogoutButton } from "@/components/auth/logout-button";
import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default async function OnboardingPage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Si no está autenticado, redirigir al login
  if (!user) {
    redirect("/login");
  }

  // Verificar si ya completó el onboarding
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Si ya completó el onboarding, redirigir al home
  if (profile && profile.onboarding_completed) {
    redirect("/");
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-20 table-scroll">
      <div className="w-full absolute top-0 left-0 flex p-6 items-center justify-between ">
        <Link href="/" className="flex items-center justify-center w-12 h-12">
          <Image
            src="/logo.png"
            alt="Weekly"
            width={100}
            height={100}
            className="w-full h-full dark:invert"
          />
        </Link>
        <LogoutButton />
      </div>
      <OnboardingForm />
    </div>
  );
}
