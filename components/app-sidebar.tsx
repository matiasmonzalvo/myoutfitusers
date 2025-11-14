import React from "react";
import { useState, useEffect, useCallback } from "react";
import {
  PanelLeftClose,
  PanelLeftOpen,
  MessageSquare,
  History,
  Settings,
  User,
  Plus,
  Search,
  Archive,
  Trash2,
  Table,
  MoreHorizontal,
  Share,
  Edit,
  Trash,
  X,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  AddSquareIcon,
  GrinningIcon,
  Logout02Icon,
  Settings01Icon,
  StarsIcon,
  LayoutTable02Icon,
  StickyNote03Icon,
  CheckmarkSquare02Icon,
  SourceCodeIcon,
  CollectionsBookmarkIcon,
  Calendar04Icon,
  Home07Icon,
} from "@hugeicons/core-free-icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { SidebarMenuButton } from "./ui/sidebar";
import { Avatar, AvatarFallback } from "./ui/avatar";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { createServerClient } from "@/lib/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { usePathname, useRouter } from "next/navigation";
import { SOLID_COLOR_OPTIONS } from "@/lib/utils/colors";
import EditTableDialog from "./EditTableDialog";
import DeleteLayoutDialog from "./DeleteLayoutDialog";
import Image from "next/image";

interface LayoutFormData {
  name: string;
  description: string;
  category: string;
  template: string;
  color: string;
}

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle }) => {
  const [showText, setShowText] = useState(!isCollapsed);
  const [textOpacity, setTextOpacity] = useState(!isCollapsed);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createServerClient();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState<LayoutFormData>({
    name: "",
    description: "",
    category: "other",
    template: "default",
    color: "blue",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdatingLayout, setIsUpdatingLayout] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [shareTargetTitle, setShareTargetTitle] = useState<string | null>(null);
  const [showFeedbackCard, setShowFeedbackCard] = useState(true);
  const [isFeedbackCardHidden, setIsFeedbackCardHidden] = useState(false);
  const [expandedLayouts, setExpandedLayouts] = useState<Set<string>>(
    new Set()
  );

  // Sincroniza el estado del dialog con el hash de la URL
  useEffect(() => {
    const checkHash = () => {
      setIsSettingsOpen(window.location.hash === "#settings");
    };
    window.addEventListener("hashchange", checkHash);
    checkHash();
    return () => window.removeEventListener("hashchange", checkHash);
  }, []);

  const openSettings = () => {
    window.location.hash = "settings";
  };
  const closeSettings = () => {
    // Quita el hash sin recargar la página
    history.pushState(
      "",
      document.title,
      window.location.pathname + window.location.search
    );
    setIsSettingsOpen(false);
  };

  // Cargar estado de localStorage después de la hidratación
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem("tablium-sidebar-collapsed");
    if (stored !== null) {
      const storedCollapsed = stored === "true";
      if (storedCollapsed !== isCollapsed) {
        // Solo actualizar si el estado es diferente
        onToggle();
      }
    }
  }, []); // Solo ejecutar una vez al montar

  // Guardar estado de visibilidad de la sidebar en localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(
        "tablium-sidebar-collapsed",
        isCollapsed.toString()
      );
    }
  }, [isCollapsed]);

  useEffect(() => {
    if (isCollapsed) {
      // Cuando se colapsa, primero hacer fade out del texto, luego ocultarlo
      setTextOpacity(false);
      const timer = setTimeout(() => {
        setShowText(false);
      }, 200); // Esperar a que termine la transición de opacidad
      return () => clearTimeout(timer);
    } else {
      // Cuando se expande, mostrar el texto primero, luego hacer fade in
      setShowText(true);
      const timer = setTimeout(() => {
        setTextOpacity(true);
      }, 150); // La mitad de la duración de la transición de width
      return () => clearTimeout(timer);
    }
  }, [isCollapsed]);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event: any, session: any) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const handleShareTable = (tableId: string) => {
    setIsShareDialogOpen(true);
  };

  const handleEditTable = (layoutId: string) => {
    setIsEditDialogOpen(true);
  };

  return (
    <div
      className={`bg-background text-white h-[100svh] md:h-screen flex flex-col items-end pr-10 justify-center transition-all duration-300 ease-in-out  ${
        isCollapsed ? "w-[53.5px]" : "w-64"
      } flex-shrink-0 ${isCollapsed ? "hover:cursor-ew-resize cursor-pointer" : ""}`}
      onClick={(e) => {
        if (isCollapsed) {
          // Solo expandir si el click NO es en un botón
          const isButton = (e.target as HTMLElement).closest("button");
          if (!isButton) {
            onToggle();
          }
        }
      }}
      // Evita que el click en el botón de toggle propague y dispare dos veces
      onMouseDown={(e) => {
        if (isCollapsed && (e.target as HTMLElement).closest("button")) {
          e.stopPropagation();
        }
      }}
    ></div>
  );
};
