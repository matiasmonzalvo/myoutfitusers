"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Home,
  Search,
  Heart,
  Settings,
  X,
  ShoppingBag,
  Menu,
  CreditCard,
  UserRound,
  CircleUserRound,
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  FavouriteIcon,
  Home07Icon,
  MenuTwoLineIcon,
  Search01Icon,
  Settings01Icon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, Bookmark } from "lucide-react";
import { createServerClient } from "@/lib/supabase/client";
import type { Product } from "@/lib/actions/products";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import Image from "next/image";

interface Brand {
  id: string;
  brand_name: string;
  brand_username: string;
  logo_url?: string;
  website_url?: string;
}
import { useOutfit } from "@/lib/contexts/outfit-context";
import {
  useCategoryFilter,
  type FilterCategory,
  CATEGORY_LABELS,
} from "@/lib/contexts/category-filter-context";
import { useSearch } from "@/lib/contexts/search-context";
import Link from "next/link";

interface CardLayoutProps {
  children: React.ReactNode;
  isAuthenticated: boolean;
  onOpenSidebar?: () => void;
}

export function CardLayout({
  children,
  isAuthenticated,
  onOpenSidebar,
}: CardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { outfitImageUrl, setOutfitImageUrl, setIsGeneratingOutfit } =
    useOutfit();
  const { selectedFilter, setSelectedFilter } = useCategoryFilter();
  const { searchQuery, setSearchQuery } = useSearch();

  // Estado para detectar si es pantalla menor a lg (1024px)
  const [isLgScreen, setIsLgScreen] = useState(false);

  // Detectar tamaño de pantalla
  useEffect(() => {
    const checkScreenSize = () => {
      setIsLgScreen(window.innerWidth >= 1024);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Estados para tooltips
  const [showMenTooltip, setShowMenTooltip] = useState(false);
  const [showWomenTooltip, setShowWomenTooltip] = useState(false);
  const [showSneakersTooltip, setShowSneakersTooltip] = useState(false);
  const [showBrandsTooltip, setShowBrandsTooltip] = useState(false);
  const [showAccessoriesTooltip, setShowAccessoriesTooltip] = useState(false);

  // Estados para animación de cierre de tooltips
  const [isWomenClosing, setIsWomenClosing] = useState(false);
  const [isMenClosing, setIsMenClosing] = useState(false);
  const [isSneakersClosing, setIsSneakersClosing] = useState(false);
  const [isBrandsClosing, setIsBrandsClosing] = useState(false);
  const [isAccessoriesClosing, setIsAccessoriesClosing] = useState(false);

  // Refs para manejar los timeouts de los tooltips
  const menTooltipTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const womenTooltipTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const sneakersTooltipTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const brandsTooltipTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const accessoriesTooltipTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Refs para manejar los timeouts de animación de cierre
  const womenCloseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const menCloseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const sneakersCloseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const brandsCloseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const accessoriesCloseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Funciones para cerrar tooltips con animación
  const closeWomenTooltip = useCallback(() => {
    setIsWomenClosing(true);
    womenCloseTimeoutRef.current = setTimeout(() => {
      setShowWomenTooltip(false);
      setIsWomenClosing(false);
    }, 300);
  }, []);

  const closeMenTooltip = useCallback(() => {
    setIsMenClosing(true);
    menCloseTimeoutRef.current = setTimeout(() => {
      setShowMenTooltip(false);
      setIsMenClosing(false);
    }, 300);
  }, []);

  const closeSneakersTooltip = useCallback(() => {
    setIsSneakersClosing(true);
    sneakersCloseTimeoutRef.current = setTimeout(() => {
      setShowSneakersTooltip(false);
      setIsSneakersClosing(false);
    }, 300);
  }, []);

  const closeBrandsTooltip = useCallback(() => {
    setIsBrandsClosing(true);
    brandsCloseTimeoutRef.current = setTimeout(() => {
      setShowBrandsTooltip(false);
      setIsBrandsClosing(false);
    }, 300);
  }, []);

  const closeAccessoriesTooltip = useCallback(() => {
    setIsAccessoriesClosing(true);
    accessoriesCloseTimeoutRef.current = setTimeout(() => {
      setShowAccessoriesTooltip(false);
      setIsAccessoriesClosing(false);
    }, 300);
  }, []);

  // Funciones para abrir tooltips (cancelando cualquier animación de cierre)
  const openWomenTooltip = useCallback(() => {
    if (womenCloseTimeoutRef.current) {
      clearTimeout(womenCloseTimeoutRef.current);
    }
    setIsWomenClosing(false);
    setShowWomenTooltip(true);
  }, []);

  const openMenTooltip = useCallback(() => {
    if (menCloseTimeoutRef.current) {
      clearTimeout(menCloseTimeoutRef.current);
    }
    setIsMenClosing(false);
    setShowMenTooltip(true);
  }, []);

  const openSneakersTooltip = useCallback(() => {
    if (sneakersCloseTimeoutRef.current) {
      clearTimeout(sneakersCloseTimeoutRef.current);
    }
    setIsSneakersClosing(false);
    setShowSneakersTooltip(true);
  }, []);

  const openBrandsTooltip = useCallback(() => {
    if (brandsCloseTimeoutRef.current) {
      clearTimeout(brandsCloseTimeoutRef.current);
    }
    setIsBrandsClosing(false);
    setShowBrandsTooltip(true);
  }, []);

  const openAccessoriesTooltip = useCallback(() => {
    if (accessoriesCloseTimeoutRef.current) {
      clearTimeout(accessoriesCloseTimeoutRef.current);
    }
    setIsAccessoriesClosing(false);
    setShowAccessoriesTooltip(true);
  }, []);

  // Estados para el usuario
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const supabase = createServerClient();

  // Estados para datos pre-cargados del tooltip
  const [trendingBrandsWomen, setTrendingBrandsWomen] = useState<Brand[]>([]);
  const [trendingBrandsMen, setTrendingBrandsMen] = useState<Brand[]>([]);
  const [trendingProductsWomen, setTrendingProductsWomen] = useState<Product[]>(
    []
  );
  const [trendingProductsMen, setTrendingProductsMen] = useState<Product[]>([]);
  const [trendingSneakers, setTrendingSneakers] = useState<Product[]>([]);
  const [trendingSneakerBrands, setTrendingSneakerBrands] = useState<Brand[]>(
    []
  );
  const [trendingAccessories, setTrendingAccessories] = useState<Product[]>([]);
  const [trendingAccessoryBrands, setTrendingAccessoryBrands] = useState<
    Brand[]
  >([]);
  const [topBrands, setTopBrands] = useState<Brand[]>([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  // Pre-cargar datos para el tooltip (se ejecuta una sola vez al montar)
  useEffect(() => {
    const loadTooltipData = async () => {
      try {
        // Obtener marcas trending para mujeres basadas en total_worn_count de productos women/unisex
        const { data: productsForWomenBrands } = await supabase
          .from("products")
          .select(
            "brand_id, total_worn_count, brands(id, brand_name, brand_username, logo_url, website_url)"
          )
          .eq("is_active", true)
          .in("sex", ["women", "unisex"])
          .not("brands", "is", null);

        // Agrupar y sumar total_worn_count por marca para mujeres
        const womenBrandsMap = new Map<
          string,
          { brand: Brand; totalWorn: number }
        >();
        if (productsForWomenBrands) {
          productsForWomenBrands.forEach((product: any) => {
            if (product.brands) {
              const brandId = product.brands.id;
              const current = womenBrandsMap.get(brandId);
              if (current) {
                current.totalWorn += product.total_worn_count || 0;
              } else {
                womenBrandsMap.set(brandId, {
                  brand: product.brands as Brand,
                  totalWorn: product.total_worn_count || 0,
                });
              }
            }
          });
        }

        // Ordenar y obtener top 6 marcas para mujeres
        const topWomenBrands = Array.from(womenBrandsMap.values())
          .sort((a, b) => b.totalWorn - a.totalWorn)
          .slice(0, 6)
          .map((item) => item.brand);
        setTrendingBrandsWomen(topWomenBrands);

        // Obtener marcas trending para hombres basadas en total_worn_count de productos men/unisex
        const { data: productsForMenBrands } = await supabase
          .from("products")
          .select(
            "brand_id, total_worn_count, brands(id, brand_name, brand_username, logo_url, website_url)"
          )
          .eq("is_active", true)
          .in("sex", ["men", "unisex"])
          .not("brands", "is", null);

        // Agrupar y sumar total_worn_count por marca para hombres
        const menBrandsMap = new Map<
          string,
          { brand: Brand; totalWorn: number }
        >();
        if (productsForMenBrands) {
          productsForMenBrands.forEach((product: any) => {
            if (product.brands) {
              const brandId = product.brands.id;
              const current = menBrandsMap.get(brandId);
              if (current) {
                current.totalWorn += product.total_worn_count || 0;
              } else {
                menBrandsMap.set(brandId, {
                  brand: product.brands as Brand,
                  totalWorn: product.total_worn_count || 0,
                });
              }
            }
          });
        }

        // Ordenar y obtener top 6 marcas para hombres
        const topMenBrands = Array.from(menBrandsMap.values())
          .sort((a, b) => b.totalWorn - a.totalWorn)
          .slice(0, 6)
          .map((item) => item.brand);
        setTrendingBrandsMen(topMenBrands);

        // Obtener 6 productos de mujeres o unisex más vestidos (trending)
        const { data: productsDataWomen, error: productsErrorWomen } =
          await supabase
            .from("products")
            .select(
              `
            *,
            brands (
              id,
              brand_name,
              brand_username,
              logo_url,
              website_url
            )
          `
            )
            .eq("is_active", true)
            .in("sex", ["women", "unisex"])
            .order("total_worn_count", { ascending: false })
            .limit(6);

        if (!productsErrorWomen && productsDataWomen) {
          setTrendingProductsWomen(productsDataWomen as Product[]);
        }

        // Obtener 6 productos de hombres o unisex más vestidos (trending)
        const { data: productsDataMen, error: productsErrorMen } =
          await supabase
            .from("products")
            .select(
              `
            *,
            brands (
              id,
              brand_name,
              brand_username,
              logo_url,
              website_url
            )
          `
            )
            .eq("is_active", true)
            .in("sex", ["men", "unisex"])
            .order("total_worn_count", { ascending: false })
            .limit(6);

        if (!productsErrorMen && productsDataMen) {
          setTrendingProductsMen(productsDataMen as Product[]);
        }

        // Obtener 6 sneakers más vestidos (trending)
        const { data: sneakersData, error: sneakersError } = await supabase
          .from("products")
          .select(
            `
            *,
            brands (
              id,
              brand_name,
              brand_username,
              logo_url,
              website_url
            )
          `
          )
          .eq("is_active", true)
          .eq("category", "footwear")
          .order("total_worn_count", { ascending: false })
          .limit(6);

        if (!sneakersError && sneakersData) {
          setTrendingSneakers(sneakersData as Product[]);
        }

        // Obtener marcas trending de sneakers basadas en total_worn_count
        const { data: productsForSneakerBrands } = await supabase
          .from("products")
          .select(
            "brand_id, total_worn_count, brands(id, brand_name, brand_username, logo_url, website_url)"
          )
          .eq("is_active", true)
          .eq("category", "footwear")
          .not("brands", "is", null);

        // Agrupar y sumar total_worn_count por marca para sneakers
        const sneakerBrandsMap = new Map<
          string,
          { brand: Brand; totalWorn: number }
        >();
        if (productsForSneakerBrands) {
          productsForSneakerBrands.forEach((product: any) => {
            if (product.brands) {
              const brandId = product.brands.id;
              const current = sneakerBrandsMap.get(brandId);
              if (current) {
                current.totalWorn += product.total_worn_count || 0;
              } else {
                sneakerBrandsMap.set(brandId, {
                  brand: product.brands as Brand,
                  totalWorn: product.total_worn_count || 0,
                });
              }
            }
          });
        }

        // Ordenar y obtener top 6 marcas de sneakers
        const topSneakerBrands = Array.from(sneakerBrandsMap.values())
          .sort((a, b) => b.totalWorn - a.totalWorn)
          .slice(0, 6)
          .map((item) => item.brand);
        setTrendingSneakerBrands(topSneakerBrands);

        // Obtener top 17 marcas basadas en total_worn_count de TODOS los productos
        const { data: allProductsForBrands } = await supabase
          .from("products")
          .select(
            "brand_id, total_worn_count, brands(id, brand_name, brand_username, logo_url, website_url)"
          )
          .eq("is_active", true)
          .not("brands", "is", null);

        // Agrupar y sumar total_worn_count por marca
        const allBrandsMap = new Map<
          string,
          { brand: Brand; totalWorn: number }
        >();
        if (allProductsForBrands) {
          allProductsForBrands.forEach((product: any) => {
            if (product.brands) {
              const brandId = product.brands.id;
              const current = allBrandsMap.get(brandId);
              if (current) {
                current.totalWorn += product.total_worn_count || 0;
              } else {
                allBrandsMap.set(brandId, {
                  brand: product.brands as Brand,
                  totalWorn: product.total_worn_count || 0,
                });
              }
            }
          });
        }

        // Ordenar y obtener top 17 marcas
        const top17Brands = Array.from(allBrandsMap.values())
          .sort((a, b) => b.totalWorn - a.totalWorn)
          .slice(0, 17)
          .map((item) => item.brand);
        setTopBrands(top17Brands);

        // Obtener 6 accesorios más vestidos (trending)
        const { data: accessoriesData, error: accessoriesError } =
          await supabase
            .from("products")
            .select(
              `
            *,
            brands (
              id,
              brand_name,
              brand_username,
              logo_url,
              website_url
            )
          `
            )
            .eq("is_active", true)
            .eq("category", "accesories")
            .order("total_worn_count", { ascending: false })
            .limit(6);

        if (!accessoriesError && accessoriesData) {
          setTrendingAccessories(accessoriesData as Product[]);
        }

        // Obtener marcas trending de accesorios basadas en total_worn_count
        const { data: productsForAccessoryBrands } = await supabase
          .from("products")
          .select(
            "brand_id, total_worn_count, brands(id, brand_name, brand_username, logo_url, website_url)"
          )
          .eq("is_active", true)
          .eq("category", "accesories")
          .not("brands", "is", null);

        // Agrupar y sumar total_worn_count por marca para accesorios
        const accessoryBrandsMap = new Map<
          string,
          { brand: Brand; totalWorn: number }
        >();
        if (productsForAccessoryBrands) {
          productsForAccessoryBrands.forEach((product: any) => {
            if (product.brands) {
              const brandId = product.brands.id;
              const current = accessoryBrandsMap.get(brandId);
              if (current) {
                current.totalWorn += product.total_worn_count || 0;
              } else {
                accessoryBrandsMap.set(brandId, {
                  brand: product.brands as Brand,
                  totalWorn: product.total_worn_count || 0,
                });
              }
            }
          });
        }

        // Ordenar y obtener top 6 marcas de accesorios
        const topAccessoryBrands = Array.from(accessoryBrandsMap.values())
          .sort((a, b) => b.totalWorn - a.totalWorn)
          .slice(0, 6)
          .map((item) => item.brand);
        setTrendingAccessoryBrands(topAccessoryBrands);

        setIsDataLoaded(true);
      } catch (error) {
        console.error("Error loading tooltip data:", error);
        setIsDataLoaded(true);
      }
    };

    loadTooltipData();
  }, []);

  // Obtener información del usuario si está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      const getUser = async () => {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setUser(user);

        // Obtener la foto de perfil y username del usuario
        if (user) {
          const { data: profile } = await supabase
            .from("user_profiles")
            .select("profile_photo_url, username")
            .eq("id", user.id)
            .single();

          if (profile?.profile_photo_url) {
            setProfilePhotoUrl(profile.profile_photo_url);
          }
          if (profile?.username) {
            setUsername(profile.username);
          }
        }
      };

      getUser();

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((event: any, session: any) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          // Recargar foto de perfil y username cuando cambie la sesión
          supabase
            .from("user_profiles")
            .select("profile_photo_url, username")
            .eq("id", session.user.id)
            .single()
            .then(({ data }: { data: any }) => {
              if (data?.profile_photo_url) {
                setProfilePhotoUrl(data.profile_photo_url);
              }
              if (data?.username) {
                setUsername(data.username);
              }
            });
        } else {
          setProfilePhotoUrl(null);
          setUsername(null);
        }
      });

      return () => subscription.unsubscribe();
    } else {
      setUser(null);
      setProfilePhotoUrl(null);
      setUsername(null);
    }
  }, [isAuthenticated, supabase.auth]);

  // Función para obtener las iniciales del usuario
  const getUserInitials = (user: SupabaseUser | null) => {
    if (!user) return "U";

    // Intentar obtener el nombre del metadata o user_metadata
    const name = user.user_metadata?.name || user.user_metadata?.full_name;
    if (name) {
      const nameParts = name.split(" ");
      const initials = nameParts.map((part: string) => part.charAt(0)).join("");
      return initials.toUpperCase().slice(0, 2);
    }

    // Si no hay nombre, usar el email
    const email = user.email || "";
    return email.charAt(0).toUpperCase();
  };

  // Determinar el tab activo basado en la ruta
  const getActiveTab = () => {
    if (pathname.includes("/search")) return "search";
    if (pathname.includes("/likes")) return "likes";
    if (pathname.includes("/settings")) return "settings";
    return "home";
  };

  const [activeTab, setActiveTab] = useState(getActiveTab());

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
    // Navegar a la ruta correspondiente
    switch (tab) {
      case "home":
        router.push("/");
        break;
      case "search":
        router.push("/search");
        break;
      case "likes":
        router.push("/likes");
        break;
      case "settings":
        router.push("/settings");
        break;
    }
  };

  const getTabIcon = (tab: string) => {
    const isActive = activeTab === tab;
    const iconClass = `w-7 h-7 transition-colors ${
      isActive
        ? "text-blue-600 dark:text-blue-400"
        : "text-gray-600 dark:text-gray-400"
    }`;

    switch (tab) {
      case "home":
        return (
          <HugeiconsIcon
            icon={Home07Icon}
            className={iconClass}
            strokeWidth={2.25}
          />
        );
      case "search":
        return (
          <HugeiconsIcon
            icon={Search01Icon}
            className={iconClass}
            strokeWidth={2.25}
          />
        );
      case "likes":
        return (
          <HugeiconsIcon
            icon={FavouriteIcon}
            className={iconClass}
            strokeWidth={2.25}
          />
        );
      case "settings":
        return (
          <HugeiconsIcon
            icon={Settings01Icon}
            className={iconClass}
            strokeWidth={2.25}
          />
        );
      default:
        return (
          <HugeiconsIcon
            icon={Home07Icon}
            className={iconClass}
            strokeWidth={2.25}
          />
        );
    }
  };

  return (
    <div className=" w-full h-auto relative">
      <div className="fixed lg:sticky top-0 left-0 w-full z-50">
        {/* <div className="flex space-x-4 w-full justify-between items-center px-6 pt-6 relative">
        <button
          onClick={() => handleTabClick("home")}
          className={`w-full relative flex items-center justify-center p-3 transition-colors ${
            activeTab === "home" ? " border-blue-400" : "hover:bg-blue-400/10"
          }`}
        >
          {getTabIcon("home")}
        </button>
        <button
          onClick={() => handleTabClick("search")}
          className={`w-full relative flex items-center justify-center p-3 transition-colors ${
            activeTab === "search" ? " border-blue-400" : "hover:bg-blue-400/10"
          }`}
        >
          {getTabIcon("search")}
        </button>
        <button
          onClick={() => handleTabClick("likes")}
          className={`w-full relative flex items-center justify-center p-3 transition-colors ${
            activeTab === "likes" ? " border-blue-400" : "hover:bg-blue-400/10"
          }`}
        >
          {getTabIcon("likes")}
        </button>
        <button
          onClick={() => handleTabClick("settings")}
          className={`w-full relative flex items-center justify-center p-3 transition-colors ${
            activeTab === "settings"
              ? " border-blue-400"
              : "hover:bg-blue-400/10"
          }`}
        >
          {getTabIcon("settings")}
        </button>
      </div> */}
        <div className="relative w-full pt-1 px-4 lg:px-0 lg:pt-9.5  pb-2  2xl:pb-6 border-b border-border z-20 flex items-center justify-between gap-4 bg-background">
          <Link href="/">
            <Image
              src="/logo.png"
              alt="Outfiterz"
              width={120}
              height={120}
              className="w-10 h-10 lg:w-12 lg:h-12 dark:invert"
            />
          </Link>

          {/* Buscador de productos */}
          <div className="relative flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search for brand, product..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-full bg-muted border border-border focus:outline-none text-sm 2xl:text-base"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/about"
              className="py-1 px-2 font-medium text-foreground hover:text-foreground/80 transition-colors cursor-pointer hidden lg:flex text-sm 2xl:text-base rounded-full items-center justify-center"
            >
              About
            </Link>
            <Link
              href="/guide"
              className="py-1 px-2 font-medium text-foreground hover:text-foreground/80 transition-colors cursor-pointer hidden lg:flex text-sm 2xl:text-base rounded-full items-center justify-center"
            >
              Guide
            </Link>

            <Link
              href="/pricing"
              className="py-1 px-2 font-medium text-foreground hover:text-foreground/80 transition-colors cursor-pointer hidden lg:flex text-sm 2xl:text-base rounded-full items-center justify-center"
            >
              Pricing
            </Link>
            <Link
              href="/contact"
              className="py-1 px-2 font-medium text-foreground hover:text-foreground/80 transition-colors cursor-pointer hidden lg:flex text-sm 2xl:text-base rounded-full items-center justify-center"
            >
              Contact
            </Link>
            {!isAuthenticated ? (
              <>
                <button
                  onClick={() => router.push("/login")}
                  className="px-4 py-2 font-medium text-foreground border border-border rounded-full bg-muted hover:opacity-80 transition-all cursor-pointer hidden lg:block text-sm 2xl:text-base ml-2"
                >
                  Login
                </button>
                <button
                  onClick={() => router.push("/register")}
                  className="px-4 py-2 bg-primary text-white font-medium rounded-full hover:opacity-80 transition-all cursor-pointer hidden lg:block text-sm 2xl:text-base"
                >
                  Sign Up
                </button>
                <button onClick={onOpenSidebar} className="block lg:hidden">
                  <Menu className="w-5 h-5" />
                </button>
              </>
            ) : (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="rounded-full pl-1">
                      <Avatar className="w-[42px] h-[42px] cursor-pointer hover:opacity-80 transition-opacity bg-muted">
                        <AvatarImage
                          src={
                            profilePhotoUrl ||
                            user?.user_metadata?.avatar_url ||
                            user?.user_metadata?.picture
                          }
                          alt={
                            user?.user_metadata?.name || user?.email || "User"
                          }
                        />
                        <AvatarFallback className="bg-muted text-foreground border border-border text-sm">
                          {getUserInitials(user)}
                        </AvatarFallback>
                      </Avatar>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44">
                    <DropdownMenuItem
                      onClick={() => router.push(`/user/${username}`)}
                      className="cursor-pointer"
                    >
                      <CircleUserRound className="h-4 w-4" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => router.push("/billing")}
                      className="cursor-pointer"
                    >
                      <CreditCard className="h-4 w-4" />
                      Billing
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => router.push("/settings")}
                      className="cursor-pointer"
                    >
                      <Settings className="h-4 w-4" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleSignOut}
                      className="cursor-pointer"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </div>
        </div>
        <div className="relative z-10 bg-background border-b border-border lg:px-20">
          <div className="flex justify-between gap-2 overflow-x-auto no-scrollbar">
            <Link
              href="/"
              className={`cursor-pointer relative whitespace-nowrap ml-2 px-2 py-2 font-semibold text-base transition-colors ${"text-foreground"}`}
            >
              For you
            </Link>
            <div className="relative">
              <button
                onClick={() => router.push("/brands")}
                onMouseEnter={() => {
                  if (!isLgScreen) return;
                  if (brandsTooltipTimeoutRef.current) {
                    clearTimeout(brandsTooltipTimeoutRef.current);
                  }
                  openBrandsTooltip();
                }}
                onMouseLeave={() => {
                  if (!isLgScreen) return;
                  brandsTooltipTimeoutRef.current = setTimeout(() => {
                    closeBrandsTooltip();
                  }, 100);
                }}
                className={`cursor-pointer px-2 py-2 font-semibold text-base transition-colors ${"text-foreground"}`}
              >
                Brands
              </button>
            </div>
            <Link
              href="/new"
              className={`cursor-pointer px-2 py-2 font-semibold text-base transition-colors ${"text-foreground"}`}
            >
              New
            </Link>
            <div className="relative">
              <button
                onClick={() => router.push("/browse/men")}
                onMouseEnter={() => {
                  if (!isLgScreen) return;
                  if (menTooltipTimeoutRef.current) {
                    clearTimeout(menTooltipTimeoutRef.current);
                  }
                  openMenTooltip();
                }}
                onMouseLeave={() => {
                  if (!isLgScreen) return;
                  menTooltipTimeoutRef.current = setTimeout(() => {
                    closeMenTooltip();
                  }, 100);
                }}
                className={`cursor-pointer px-2 py-2 font-semibold text-base transition-colors ${"text-foreground"}`}
              >
                Men
              </button>
            </div>
            <div className="relative">
              <button
                onClick={() => router.push("/browse/women")}
                onMouseEnter={() => {
                  if (!isLgScreen) return;
                  if (womenTooltipTimeoutRef.current) {
                    clearTimeout(womenTooltipTimeoutRef.current);
                  }
                  openWomenTooltip();
                }}
                onMouseLeave={() => {
                  if (!isLgScreen) return;
                  womenTooltipTimeoutRef.current = setTimeout(() => {
                    closeWomenTooltip();
                  }, 100);
                }}
                className={`cursor-pointer px-2 py-2 font-semibold text-base transition-colors ${"text-foreground"}`}
              >
                Women
              </button>
            </div>
            <div className="relative">
              <Link
                href="/category/footwear"
                onMouseEnter={() => {
                  if (!isLgScreen) return;
                  if (sneakersTooltipTimeoutRef.current) {
                    clearTimeout(sneakersTooltipTimeoutRef.current);
                  }
                  openSneakersTooltip();
                }}
                onMouseLeave={() => {
                  if (!isLgScreen) return;
                  sneakersTooltipTimeoutRef.current = setTimeout(() => {
                    closeSneakersTooltip();
                  }, 100);
                }}
                className={`cursor-pointer px-2 py-2 h-full flex items-center justify-center font-semibold text-base transition-colors ${"text-foreground"}`}
              >
                Sneakers
              </Link>
            </div>
            <div className="relative">
              <Link
                href="/category/accesories"
                onMouseEnter={() => {
                  if (!isLgScreen) return;
                  if (accessoriesTooltipTimeoutRef.current) {
                    clearTimeout(accessoriesTooltipTimeoutRef.current);
                  }
                  openAccessoriesTooltip();
                }}
                onMouseLeave={() => {
                  if (!isLgScreen) return;
                  accessoriesTooltipTimeoutRef.current = setTimeout(() => {
                    closeAccessoriesTooltip();
                  }, 100);
                }}
                className={`cursor-pointer mr-2 px-2 py-2 h-full flex items-center justify-center font-semibold text-base transition-colors ${"text-foreground"}`}
              >
                Accessories
              </Link>
            </div>
            {/* {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setSelectedFilter(key as FilterCategory)}
                  className={`cursor-pointer px-4 py-2 font-semibold line-clamp-1 truncate text-base transition-colors ${
                    selectedFilter === key
                      ? "text-foreground"
                      : "hover:text-foreground text-muted-foreground"
                  }`}
                >
                  {label}
                </button>
              ))} */}
          </div>
        </div>
        {/* Contenedor para tooltips con clip-path para ocultar durante la animación */}
        <div className="relative" style={{ clipPath: "inset(0 0 -100vh 0)" }}>
          {showWomenTooltip && (
            <div
              onMouseEnter={() => {
                if (womenTooltipTimeoutRef.current) {
                  clearTimeout(womenTooltipTimeoutRef.current);
                }
                openWomenTooltip();
              }}
              onMouseLeave={() => {
                closeWomenTooltip();
              }}
              className={`absolute bg-background border-x border-b border-border rounded-b-2xl z-[5] p-6 w-full duration-300 ease-out ${
                isWomenClosing
                  ? "animate-out slide-out-to-top-full"
                  : "animate-in slide-in-from-top-full"
              }`}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Trending Products */}
                <div>
                  <h3 className="text-base font-semibold text-foreground mb-3">
                    Trending products
                  </h3>
                  <div className="space-y-4">
                    {isDataLoaded ? (
                      trendingProductsWomen.length > 0 ? (
                        trendingProductsWomen.map((product) => (
                          <Link
                            key={product.id}
                            href={`/product/${product.id}`}
                            className="flex items-center gap-2 pr-4 group w-full text-left cursor-pointer"
                          >
                            {product.images && product.images.length > 0 ? (
                              <div className="w-8 h-8 rounded-md border border-border overflow-hidden p-1 bg-white">
                                <Image
                                  src={product.images[0]}
                                  alt={product.name}
                                  width={32}
                                  height={32}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ) : (
                              <div className="w-8 h-8 rounded bg-gray-200" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-left text-sm text-muted-foreground hover:text-foreground py-1 transition-colors truncate font-medium tracking-tight">
                                {product.name}
                              </p>
                              {/* {product.brands && (
                              <p className="text-[10px] text-gray-500 truncate">
                                {product.brands.brand_name}
                              </p>
                            )} */}
                            </div>
                          </Link>
                        ))
                      ) : (
                        <p className="text-xs text-gray-500">
                          No products available
                        </p>
                      )
                    ) : (
                      <div className="flex items-center justify-center py-4">
                        <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                      </div>
                    )}
                  </div>
                </div>
                {/* Trending Brands */}
                <div>
                  <h3 className="text-base font-semibold text-foreground mb-3">
                    Trending brands
                  </h3>
                  <div className="space-y-4">
                    {isDataLoaded ? (
                      trendingBrandsWomen.length > 0 ? (
                        trendingBrandsWomen.map((brand) => (
                          <Link
                            key={brand.id}
                            href={`/${brand.brand_username}`}
                            onClick={() => setShowWomenTooltip(false)}
                            className="flex items-center gap-2 transition-colors group"
                          >
                            {brand.logo_url ? (
                              <div className="w-8 h-8 rounded-full border border-border overflow-hidden">
                                <Image
                                  src={brand.logo_url}
                                  alt={brand.brand_name}
                                  width={24}
                                  height={24}
                                  className="w-full h-full  object-cover"
                                />
                              </div>
                            ) : (
                              <div className="w-6 h-6 rounded bg-gray-200 flex items-center justify-center text-[10px] font-semibold text-gray-600">
                                {brand.brand_name.charAt(0)}
                              </div>
                            )}
                            <span className="text-left text-sm text-muted-foreground hover:text-foreground py-1 transition-colors font-medium tracking-tight truncate">
                              {brand.brand_name}
                            </span>
                          </Link>
                        ))
                      ) : (
                        <p className="text-xs text-gray-500"></p>
                      )
                    ) : (
                      <div className="flex items-center justify-center py-4">
                        <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Shop by Category */}
                <div>
                  <h3 className="text-base font-semibold text-foreground mb-3">
                    Shop by category
                  </h3>
                  <div className="space-y-2">
                    {Object.entries(CATEGORY_LABELS)
                      .filter(([key]) => key !== "all")
                      .map(([key, label]) => (
                        <Link
                          key={key}
                          href={`/category/${key}?gender=women`}
                          onClick={() => {
                            setShowWomenTooltip(false);
                          }}
                          className="block w-full text-left text-base text-muted-foreground hover:text-foreground py-1 transition-colors font-medium tracking-tight truncate"
                        >
                          {label}
                        </Link>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          )}
          {showMenTooltip && (
            <div
              onMouseEnter={() => {
                if (menTooltipTimeoutRef.current) {
                  clearTimeout(menTooltipTimeoutRef.current);
                }
                openMenTooltip();
              }}
              onMouseLeave={() => {
                closeMenTooltip();
              }}
              className={`absolute bg-background border-x border-b border-border rounded-b-2xl z-[5] p-6 w-full duration-300 ease-out ${
                isMenClosing
                  ? "animate-out slide-out-to-top-full"
                  : "animate-in slide-in-from-top-full"
              }`}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Trending Products */}
                <div>
                  <h3 className="text-base font-semibold text-foreground mb-3">
                    Trending products
                  </h3>
                  <div className="space-y-4">
                    {isDataLoaded ? (
                      trendingProductsMen.length > 0 ? (
                        trendingProductsMen.map((product) => (
                          <Link
                            key={product.id}
                            href={`/product/${product.id}`}
                            className="flex items-center gap-2 pr-4 group w-full text-left cursor-pointer"
                          >
                            {product.images && product.images.length > 0 ? (
                              <div className="w-8 h-8 rounded-md border border-border overflow-hidden p-1 bg-white">
                                <Image
                                  src={product.images[0]}
                                  alt={product.name}
                                  width={32}
                                  height={32}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ) : (
                              <div className="w-8 h-8 rounded bg-gray-200" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-left text-sm text-muted-foreground hover:text-foreground py-1 transition-colors truncate font-medium tracking-tight">
                                {product.name}
                              </p>
                            </div>
                          </Link>
                        ))
                      ) : (
                        <p className="text-xs text-gray-500">
                          No products available
                        </p>
                      )
                    ) : (
                      <div className="flex items-center justify-center py-4">
                        <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                      </div>
                    )}
                  </div>
                </div>
                {/* Trending Brands */}
                <div>
                  <h3 className="text-base font-semibold text-foreground mb-3">
                    Trending brands
                  </h3>
                  <div className="space-y-4">
                    {isDataLoaded ? (
                      trendingBrandsMen.length > 0 ? (
                        trendingBrandsMen.map((brand) => (
                          <Link
                            key={brand.id}
                            href={`/${brand.brand_username}`}
                            onClick={() => setShowMenTooltip(false)}
                            className="flex items-center gap-2 transition-colors group"
                          >
                            {brand.logo_url ? (
                              <div className="w-8 h-8 rounded-full border border-border overflow-hidden">
                                <Image
                                  src={brand.logo_url}
                                  alt={brand.brand_name}
                                  width={24}
                                  height={24}
                                  className="w-full h-full  object-cover"
                                />
                              </div>
                            ) : (
                              <div className="w-6 h-6 rounded bg-gray-200 flex items-center justify-center text-[10px] font-semibold text-gray-600">
                                {brand.brand_name.charAt(0)}
                              </div>
                            )}
                            <span className="text-left text-sm text-muted-foreground hover:text-foreground py-1 transition-colors font-medium tracking-tight truncate">
                              {brand.brand_name}
                            </span>
                          </Link>
                        ))
                      ) : (
                        <p className="text-xs text-gray-500"></p>
                      )
                    ) : (
                      <div className="flex items-center justify-center py-4">
                        <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Shop by Category */}
                <div>
                  <h3 className="text-base font-semibold text-foreground mb-3">
                    Shop by category
                  </h3>
                  <div className="space-y-2">
                    {Object.entries(CATEGORY_LABELS)
                      .filter(([key]) => key !== "all")
                      .map(([key, label]) => (
                        <Link
                          key={key}
                          href={`/category/${key}?gender=men`}
                          onClick={() => {
                            setShowMenTooltip(false);
                          }}
                          className="block w-full text-left text-base text-muted-foreground hover:text-foreground py-1 transition-colors font-medium tracking-tight truncate"
                        >
                          {label}
                        </Link>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          )}
          {showSneakersTooltip && (
            <div
              onMouseEnter={() => {
                if (sneakersTooltipTimeoutRef.current) {
                  clearTimeout(sneakersTooltipTimeoutRef.current);
                }
                openSneakersTooltip();
              }}
              onMouseLeave={() => {
                closeSneakersTooltip();
              }}
              className={`absolute bg-background border-x border-b border-border rounded-b-2xl z-[5] p-6 w-full duration-300 ease-out ${
                isSneakersClosing
                  ? "animate-out slide-out-to-top-full"
                  : "animate-in slide-in-from-top-full"
              }`}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Trending Sneakers */}
                <div>
                  <h3 className="text-base font-semibold text-foreground mb-3">
                    Trending sneakers
                  </h3>
                  <div className="space-y-4">
                    {isDataLoaded ? (
                      trendingSneakers.length > 0 ? (
                        trendingSneakers.map((product) => (
                          <Link
                            key={product.id}
                            href={`/product/${product.id}`}
                            className="flex items-center gap-2 pr-4 group w-full text-left cursor-pointer"
                          >
                            {product.images && product.images.length > 0 ? (
                              <div className="w-8 h-8 rounded-md border border-border overflow-hidden p-1 bg-white">
                                <Image
                                  src={product.images[0]}
                                  alt={product.name}
                                  width={32}
                                  height={32}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ) : (
                              <div className="w-8 h-8 rounded bg-gray-200" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-left text-sm text-muted-foreground hover:text-foreground py-1 transition-colors truncate font-medium tracking-tight">
                                {product.name}
                              </p>
                            </div>
                          </Link>
                        ))
                      ) : (
                        <p className="text-xs text-gray-500">
                          No sneakers available
                        </p>
                      )
                    ) : (
                      <div className="flex items-center justify-center py-4">
                        <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Popular Brands */}
                <div>
                  <h3 className="text-base font-semibold text-foreground mb-3">
                    Popular brands
                  </h3>
                  <div className="space-y-4">
                    {isDataLoaded ? (
                      trendingSneakerBrands.length > 0 ? (
                        trendingSneakerBrands.map((brand) => (
                          <Link
                            key={brand.id}
                            href={`/${brand.brand_username}?category=footwear`}
                            onClick={() => setShowSneakersTooltip(false)}
                            className="flex items-center gap-2 transition-colors group"
                          >
                            {brand.logo_url ? (
                              <div className="w-8 h-8 rounded-full border border-border overflow-hidden">
                                <Image
                                  src={brand.logo_url}
                                  alt={brand.brand_name}
                                  width={24}
                                  height={24}
                                  className="w-full h-full  object-cover"
                                />
                              </div>
                            ) : (
                              <div className="w-6 h-6 rounded bg-gray-200 flex items-center justify-center text-[10px] font-semibold text-gray-600">
                                {brand.brand_name.charAt(0)}
                              </div>
                            )}
                            <span className="text-left text-sm text-muted-foreground hover:text-foreground py-1 transition-colors font-medium tracking-tight truncate">
                              {brand.brand_name}
                            </span>
                          </Link>
                        ))
                      ) : (
                        <p className="text-xs text-gray-500"></p>
                      )
                    ) : (
                      <div className="flex items-center justify-center py-4">
                        <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Sneakers For */}
                <div>
                  <h3 className="text-base font-semibold text-foreground mb-3">
                    Sneakers for:
                  </h3>
                  <div className="space-y-2">
                    <Link
                      href={`/category/footwear?gender=men`}
                      onClick={() => {
                        setShowSneakersTooltip(false);
                      }}
                      className="block w-full text-left text-base text-muted-foreground hover:text-foreground py-1 transition-colors font-medium tracking-tight truncate"
                    >
                      Men
                    </Link>
                    <Link
                      href={`/category/footwear?gender=women`}
                      onClick={() => {
                        setShowSneakersTooltip(false);
                      }}
                      className="block w-full text-left text-base text-muted-foreground hover:text-foreground py-1 transition-colors font-medium tracking-tight truncate"
                    >
                      Women
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
          {showBrandsTooltip && (
            <div
              onMouseEnter={() => {
                if (brandsTooltipTimeoutRef.current) {
                  clearTimeout(brandsTooltipTimeoutRef.current);
                }
                openBrandsTooltip();
              }}
              onMouseLeave={() => {
                closeBrandsTooltip();
              }}
              className={`absolute bg-background border-x border-b border-border rounded-b-2xl z-[5] p-6 w-full duration-300 ease-out ${
                isBrandsClosing
                  ? "animate-out slide-out-to-top-full"
                  : "animate-in slide-in-from-top-full"
              }`}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Primera columna - 6 marcas */}
                <div>
                  <div className="space-y-4">
                    {isDataLoaded ? (
                      topBrands.slice(0, 6).length > 0 ? (
                        topBrands.slice(0, 6).map((brand) => (
                          <Link
                            key={brand.id}
                            href={`/${brand.brand_username}`}
                            onClick={() => setShowBrandsTooltip(false)}
                            className="flex items-center gap-2 transition-colors group"
                          >
                            {brand.logo_url ? (
                              <div className="w-8 h-8 rounded-full border border-border overflow-hidden">
                                <Image
                                  src={brand.logo_url}
                                  alt={brand.brand_name}
                                  width={24}
                                  height={24}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ) : (
                              <div className="w-6 h-6 rounded bg-gray-200 flex items-center justify-center text-[10px] font-semibold text-gray-600">
                                {brand.brand_name.charAt(0)}
                              </div>
                            )}
                            <span className="text-left text-sm text-muted-foreground hover:text-foreground py-1 transition-colors font-medium tracking-tight truncate">
                              {brand.brand_name}
                            </span>
                          </Link>
                        ))
                      ) : (
                        <p className="text-xs text-gray-500"></p>
                      )
                    ) : (
                      <div className="flex items-center justify-center py-4">
                        <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Segunda columna - 6 marcas */}
                <div>
                  <div className="space-y-4">
                    {isDataLoaded ? (
                      topBrands.slice(6, 12).length > 0 ? (
                        topBrands.slice(6, 12).map((brand) => (
                          <Link
                            key={brand.id}
                            href={`/${brand.brand_username}`}
                            onClick={() => setShowBrandsTooltip(false)}
                            className="flex items-center gap-2 transition-colors group"
                          >
                            {brand.logo_url ? (
                              <div className="w-8 h-8 rounded-full border border-border overflow-hidden">
                                <Image
                                  src={brand.logo_url}
                                  alt={brand.brand_name}
                                  width={24}
                                  height={24}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ) : (
                              <div className="w-6 h-6 rounded bg-gray-200 flex items-center justify-center text-[10px] font-semibold text-gray-600">
                                {brand.brand_name.charAt(0)}
                              </div>
                            )}
                            <span className="text-left text-sm text-muted-foreground hover:text-foreground py-1 transition-colors font-medium tracking-tight truncate">
                              {brand.brand_name}
                            </span>
                          </Link>
                        ))
                      ) : (
                        <p className="text-xs text-gray-500"></p>
                      )
                    ) : (
                      <div className="flex items-center justify-center py-4">
                        <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Tercera columna - 5 marcas + botón */}
                <div>
                  <div className="space-y-4">
                    {isDataLoaded ? (
                      topBrands.slice(12, 17).length > 0 ? (
                        <>
                          {topBrands.slice(12, 17).map((brand) => (
                            <Link
                              key={brand.id}
                              href={`/${brand.brand_username}`}
                              onClick={() => setShowBrandsTooltip(false)}
                              className="flex items-center gap-2 transition-colors group"
                            >
                              {brand.logo_url ? (
                                <div className="w-8 h-8 rounded-full border border-border overflow-hidden">
                                  <Image
                                    src={brand.logo_url}
                                    alt={brand.brand_name}
                                    width={24}
                                    height={24}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              ) : (
                                <div className="w-6 h-6 rounded bg-gray-200 flex items-center justify-center text-[10px] font-semibold text-gray-600">
                                  {brand.brand_name.charAt(0)}
                                </div>
                              )}
                              <span className="text-left text-sm text-muted-foreground hover:text-foreground py-1 transition-colors font-medium tracking-tight truncate">
                                {brand.brand_name}
                              </span>
                            </Link>
                          ))}
                          {/* Botón Explore all brands */}
                          <button
                            onClick={() => {
                              router.push("/brands");
                              setShowBrandsTooltip(false);
                            }}
                            className="mt-1 cursor-pointer text-primary font-medium rounded-full hover:opacity-90 transition-opacity text-sm"
                          >
                            Explore all brands
                          </button>
                        </>
                      ) : (
                        <p className="text-xs text-gray-500"></p>
                      )
                    ) : (
                      <div className="flex items-center justify-center py-4">
                        <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          {showAccessoriesTooltip && (
            <div
              onMouseEnter={() => {
                if (accessoriesTooltipTimeoutRef.current) {
                  clearTimeout(accessoriesTooltipTimeoutRef.current);
                }
                openAccessoriesTooltip();
              }}
              onMouseLeave={() => {
                closeAccessoriesTooltip();
              }}
              className={`absolute bg-background border-x border-b border-border rounded-b-2xl z-[5] p-6 w-full duration-300 ease-out ${
                isAccessoriesClosing
                  ? "animate-out slide-out-to-top-full"
                  : "animate-in slide-in-from-top-full"
              }`}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Trending Accessories */}
                <div>
                  <h3 className="text-base font-semibold text-foreground mb-3">
                    Trending accessories
                  </h3>
                  <div className="space-y-4">
                    {isDataLoaded ? (
                      trendingAccessories.length > 0 ? (
                        trendingAccessories.map((product) => (
                          <Link
                            key={product.id}
                            href={`/product/${product.id}`}
                            className="flex items-center gap-2 pr-4 group w-full text-left cursor-pointer"
                          >
                            {product.images && product.images.length > 0 ? (
                              <div className="w-8 h-8 rounded-md border border-border overflow-hidden p-1 bg-white">
                                <Image
                                  src={product.images[0]}
                                  alt={product.name}
                                  width={32}
                                  height={32}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ) : (
                              <div className="w-8 h-8 rounded bg-gray-200" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-left text-sm text-muted-foreground hover:text-foreground py-1 transition-colors truncate font-medium tracking-tight">
                                {product.name}
                              </p>
                            </div>
                          </Link>
                        ))
                      ) : (
                        <p className="text-xs text-gray-500"></p>
                      )
                    ) : (
                      <div className="flex items-center justify-center py-4">
                        <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Popular Brands */}
                <div>
                  <h3 className="text-base font-semibold text-foreground mb-3">
                    Popular brands
                  </h3>
                  <div className="space-y-4">
                    {isDataLoaded ? (
                      trendingAccessoryBrands.length > 0 ? (
                        trendingAccessoryBrands.map((brand) => (
                          <Link
                            key={brand.id}
                            href={`/${brand.brand_username}?category=accesories`}
                            onClick={() => setShowAccessoriesTooltip(false)}
                            className="flex items-center gap-2 transition-colors group"
                          >
                            {brand.logo_url ? (
                              <div className="w-8 h-8 rounded-full border border-border overflow-hidden">
                                <Image
                                  src={brand.logo_url}
                                  alt={brand.brand_name}
                                  width={24}
                                  height={24}
                                  className="w-full h-full  object-cover"
                                />
                              </div>
                            ) : (
                              <div className="w-6 h-6 rounded bg-gray-200 flex items-center justify-center text-[10px] font-semibold text-gray-600">
                                {brand.brand_name.charAt(0)}
                              </div>
                            )}
                            <span className="text-left text-sm text-muted-foreground hover:text-foreground py-1 transition-colors font-medium tracking-tight truncate">
                              {brand.brand_name}
                            </span>
                          </Link>
                        ))
                      ) : (
                        <p className="text-xs text-gray-500"></p>
                      )
                    ) : (
                      <div className="flex items-center justify-center py-4">
                        <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Accessories For */}
                <div>
                  <h3 className="text-base font-semibold text-foreground mb-3">
                    Accessories for:
                  </h3>
                  <div className="space-y-2">
                    <Link
                      href={`/category/accesories?gender=men`}
                      onClick={() => {
                        setShowAccessoriesTooltip(false);
                      }}
                      className="block w-full text-left text-base text-muted-foreground hover:text-foreground py-1 transition-colors font-medium tracking-tight truncate"
                    >
                      Men
                    </Link>
                    <Link
                      href={`/category/accesories?gender=women`}
                      onClick={() => {
                        setShowAccessoriesTooltip(false);
                      }}
                      className="block w-full text-left text-base text-muted-foreground hover:text-foreground py-1 transition-colors font-medium tracking-tight truncate"
                    >
                      Women
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Contenido dinámico */}
      <div className={`pb-40 pt-28 lg:pt-6 min-h-screen`}>{children}</div>
    </div>
  );
}
