"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createServerClient } from "@/lib/supabase/client";
import {
  Home,
  Package,
  TrendingUp,
  Heart,
  User,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Chart03Icon,
  FavouriteIcon,
  Home07Icon,
  MenuSquareIcon,
  Invoice01Icon,
  CreditCardIcon,
  Settings02Icon,
} from "@hugeicons/core-free-icons";

interface Brand {
  id: string;
  brand_name: string;
  brand_username: string;
  email: string;
  logo_url?: string;
  description?: string;
  website_url?: string;
}

interface AdminNavProps {
  brand: Brand;
}

const navItems = [
  {
    name: "Home",
    href: "/admin/home",
    icon: (
      <HugeiconsIcon
        icon={Home07Icon}
        className="text-foreground w-5 h-5"
        strokeWidth={2}
      />
    ),
  },

  {
    name: "Performance",
    href: "/admin/performance",
    icon: (
      <HugeiconsIcon
        icon={Chart03Icon}
        className="text-foreground w-5 h-5"
        strokeWidth={2}
      />
    ),
  },

  {
    name: "Engagement",
    href: "/admin/engagement",
    icon: (
      <HugeiconsIcon
        icon={FavouriteIcon}
        className="text-foreground w-5 h-5"
        strokeWidth={2}
      />
    ),
  },
  {
    name: "Billing",
    href: "/admin/billing",
    icon: (
      <HugeiconsIcon
        icon={CreditCardIcon}
        className="text-foreground w-5 h-5"
        strokeWidth={2}
      />
    ),
  },
  {
    name: "Products",
    href: "/admin/products",
    icon: (
      <HugeiconsIcon
        icon={MenuSquareIcon}
        className="text-foreground w-5 h-5"
        strokeWidth={2}
      />
    ),
  },
  {
    name: "Settings",
    href: "/admin/settings",
    icon: (
      <HugeiconsIcon
        icon={Settings02Icon}
        className="text-foreground w-5 h-5"
        strokeWidth={2}
      />
    ),
  },
];

export function AdminNav({ brand }: AdminNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createServerClient();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/admin");
    router.refresh();
  };

  return (
    <div className="bg-neutral-100 dark:bg-black/0 p-4 fixed top-0 left-0 bottom-0">
      {/* Mobile Header */}
      <div className="lg:hidden  z-50 bg-neutral-100 dark:bg-black/0 border-b border-border">
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            {brand.logo_url && (
              <img
                src={brand.logo_url}
                alt={brand.brand_name}
                className="w-10 h-10 object-cover rounded-full border border-border dark:invert"
              />
            )}
            <h1 className="text-lg font-bold tracking-tight">
              {brand.brand_name}
            </h1>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-background border-b border-border shadow-lg">
            <nav className="px-3 py-3">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-full mb-1 transition-colors font-medium tracking-tight ${
                      isActive
                        ? "bg-primary text-white"
                        : "hover:bg-neutral-100 text-foreground"
                    }`}
                  >
                    {item.icon}
                    <span className="text-sm">{item.name}</span>
                  </Link>
                );
              })}
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 rounded-full mb-1 w-full text-left hover:bg-neutral-100 text-foreground font-medium tracking-tight transition-colors"
              >
                <LogOut size={18} />
                <span className="text-sm">Cerrar Sesión</span>
              </button>
            </nav>
          </div>
        )}
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block h-full  w-64 bg-neutral-100 dark:bg-black/0 ">
        <div className="flex flex-col h-full">
          {/* Brand Header */}
          <div className="p-4">
            <div>
              <div className="w-8 h-8 mb-2">
                <Image
                  src="/logo.png"
                  alt="My Outfit Brands"
                  width={100}
                  height={100}
                  className="w-full h-full object-cover dark:invert"
                />
              </div>
              <h1 className="text-2xl font-bold tracking-tighter truncate leading-[1]">
                My Outfit
                <span className="text-green-500 ml-1 text-base"> Brands</span>
              </h1>
            </div>
            {/* <div className="flex items-center gap-3">
              {brand.logo_url && (
                <img
                  src={brand.logo_url}
                  alt={brand.brand_name}
                  className="w-12 h-12 object-cover rounded-full border border-border"
                />
              )}
              <div className="flex-1 min-w-0">
                <h1 className="text-lg font-bold tracking-tight truncate">
                  {brand.brand_name}
                </h1>
                <p className="text-xs text-muted-foreground tracking-tight truncate">
                  @{brand.brand_username}
                </p>
              </div>
            </div> */}
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-2.5 py-2 rounded-full transition-colors font-medium tracking-tight ${
                    isActive
                      ? "bg-muted text-foreground"
                      : "hover:bg-muted text-foreground"
                  }`}
                >
                  {item.icon}
                  <span className="text-sm">{item.name}</span>
                </Link>
              );
            })}
            <Link
              href={"/admin/profile"}
              className={`flex items-center gap-2 px-2.5 py-2 rounded-full transition-colors font-medium tracking-tight ${
                pathname === "/admin/profile"
                  ? "bg-muted text-foreground"
                  : "hover:bg-muted text-foreground"
              }`}
            >
              {brand.logo_url ? (
                <Image
                  src={brand.logo_url}
                  alt={brand.brand_name}
                  width={20}
                  height={20}
                  className="w-5 h-5 object-cover rounded-full"
                />
              ) : (
                <User size={18} />
              )}
              <span className="text-sm">My Brand</span>
            </Link>
          </nav>

          {/* Logout Button */}
          <div className="p-4 border-t border-border">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 rounded-full w-full text-left hover:bg-neutral-100 text-foreground font-medium tracking-tight transition-colors"
            >
              <LogOut size={18} />
              <span className="text-sm">Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
