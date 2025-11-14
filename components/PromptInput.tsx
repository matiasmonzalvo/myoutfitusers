"use client";

import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  FileAddIcon,
  FileValidationIcon,
  InstagramIcon,
  Link02Icon,
  Linkedin01Icon,
  NewTwitterRectangleIcon,
  WhatsappIcon,
} from "@hugeicons/core-free-icons";
import { ArrowUp, MessageCircle, Check, X, ChevronDown } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { createServerClient } from "@/lib/supabase/client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { TableData, Column as AppColumn } from "@/lib/types/table";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Message01Icon,
  Share01Icon,
  Link01Icon,
  Chatting01Icon,
} from "@hugeicons/core-free-icons";
import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

type PromptInputProps = {
  variant: "inline" | "fixed";
};

export default function PromptInput({ variant }: PromptInputProps) {
  const [prompt, setPrompt] = useState("");
  const [generatedContent, setGeneratedContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [isNoCreditsDialogOpen, setIsNoCreditsDialogOpen] = useState(false);
  const [isChatHidden, setIsChatHidden] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);
  const [isIntegrationsDropdownOpen, setIsIntegrationsDropdownOpen] =
    useState(false);
  const [isExceedingLimit, setIsExceedingLimit] = useState(false);
  const [selectedContentType, setSelectedContentType] = useState<string | null>(
    "Auto"
  );
  const [creditsRemaining, setCreditsRemaining] = useState<
    number | null | undefined
  >(undefined);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const router = useRouter();
  const supabase = createServerClient();
  const isDisabled =
    isSubmitting ||
    !prompt.trim().length ||
    isExceedingLimit ||
    variant === "fixed";
  const DISABLE_AI_GENERATION = false;
  const pathname = usePathname();

  const selectContentType = (type: string) => {
    setSelectedContentType(type === selectedContentType ? null : type);
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError("Please enter a content idea");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedContent("");

    try {
      const response = await fetch("/api/generate-content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          contentType: selectedContentType,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate content");
      }

      const data = await response.json();
      setGeneratedContent(data.content);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!generatedContent) return;

    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch("/api/save-content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: generatedContent,
          contentType: selectedContentType,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save content");
      }

      alert("Content saved successfully!");
      setGeneratedContent("");
      setPrompt("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  const refreshCredits = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setCreditsRemaining(undefined);
        return;
      }
      const { data, error } = await supabase.rpc("get_ai_credit_status", {
        p_feature: "generate_table",
      });
      if (error) {
        setCreditsRemaining(undefined);
        return;
      }
      const remaining = (data as any)?.remaining_today;
      // remaining puede ser número o null (ilimitado)
      setCreditsRemaining(remaining);
    } catch {
      setCreditsRemaining(undefined);
    }
  };

  const aiOptionColors = [
    "red",
    "orange",
    "amber",
    "yellow",
    "lime",
    "green",
    "emerald",
    "teal",
    "cyan",
    "sky",
    "blue",
    "indigo",
    "violet",
    "purple",
    "fuchsia",
    "pink",
    "rose",
    "neutral",
  ];

  // Atajo de teclado: Ctrl + I para ocultar/mostrar (solo en variante fixed)
  useEffect(() => {
    if (variant !== "fixed") return;
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === "i" || e.key === "I")) {
        e.preventDefault();
        setIsChatHidden((prev) => !prev);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [variant]);

  // Evitar mismatches de SSR al usar portal
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Cargar estado de localStorage después de la hidratación (solo para variant fixed)
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (variant !== "fixed") {
      setIsHydrated(true);
      return;
    }
    const stored = window.localStorage.getItem("tablium-chat-hidden");
    if (stored !== null) {
      setIsChatHidden(stored === "true");
    }
    setIsHydrated(true);
  }, [variant]);

  // Cargar créditos al montar
  useEffect(() => {
    refreshCredits();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-ajuste de altura del textarea con límite máximo
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    const MAX_TEXTAREA_HEIGHT_PX = 320; // ~20rem (tailwind h-80)
    el.style.height = "auto";
    const newHeight = Math.min(el.scrollHeight, MAX_TEXTAREA_HEIGHT_PX);
    el.style.height = `${newHeight}px`;
    el.style.overflowY =
      el.scrollHeight > MAX_TEXTAREA_HEIGHT_PX ? "auto" : "hidden";
  }, [prompt]);

  // Verificar si se excede el límite de caracteres
  useEffect(() => {
    setIsExceedingLimit(prompt.length > 300);
  }, [prompt]);

  const containerBase = "w-[780px] max-w-[92vw]";
  const containerClass =
    variant === "fixed"
      ? `absolute z-[60] transform-gpu left-1/2 -translate-x-1/2 bottom-6 ${containerBase}`
      : `${containerBase} mx-auto`;

  const innerBackgroundClass =
    variant === "fixed" ? "bg-chat/90 backdrop-blur-sm shadow-sm" : "bg-chat";

  const inputCardTransitionClasses =
    "transition-all duration-300 ease-in-out" +
    (variant === "fixed"
      ? isChatHidden
        ? " opacity-0 blur-sm translate-y-1 pointer-events-none"
        : " opacity-100"
      : "");

  // No renderizar hasta que esté hidratado para evitar errores de hidratación (solo en fixed)
  if (variant === "fixed" && !isHydrated) {
    return null;
  }

  return (
    <div
      className={`${containerClass} ${
        variant === "fixed" && isChatHidden ? "pointer-events-none" : ""
      }`}
    >
      {variant === "fixed" && (
        <div
          className={`${inputCardTransitionClasses} absolute top-0 left-0 w-full h-full pointer-events-auto border rounded-3xl bg-background/0 backdrop-blur-[5px] z-50 flex flex-col justify-center items-center text-sm gap-2`}
        >
          Editing grids soon enabled
          <button
            className="text-foreground px-3 py-1 rounded-full text-xs cursor-pointer bg-background border border-border"
            onClick={() => setIsChatHidden(true)}
          >
            Hide (Ctrl + I)
          </button>
        </div>
      )}
      <div
        className={`pointer-events-auto bg-background dark:bg-muted/30 border flex flex-col justify-between rounded-3xl  ${innerBackgroundClass} ${inputCardTransitionClasses} ${
          isExceedingLimit
            ? "border-red-500"
            : "border-border dark:border-border/80"
        }`}
      >
        <div className="w-full min-h-0 p-4">
          <textarea
            placeholder={
              variant === "fixed"
                ? "Ask Tablium to edit..."
                : "Ask Tablium to build a grid that..."
            }
            className="w-full border-none outline-none resize-none text-foreground placeholder:text-muted-foreground text-sm leading-5 min-h-0 max-h-60 table-scroll"
            style={{ fontSize: "16px" }}
            ref={textareaRef}
            value={prompt}
            onChange={(e) => variant !== "fixed" && setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (variant === "fixed") return;
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (prompt.trim().length && !isSubmitting) {
                }
              }
            }}
            disabled={isSubmitting || variant === "fixed"}
            rows={variant === "inline" ? 2 : 1}
            autoFocus={variant !== "fixed"}
          />
        </div>
        <div className="w-full flex justify-between p-2">
          <div className="flex items-center gap-1">
            <DropdownMenu
              open={isIntegrationsDropdownOpen}
              onOpenChange={setIsIntegrationsDropdownOpen}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="flex items-center gap-2 cursor-pointer p-2 hover:bg-muted rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground transition-all duration-100 focus:outline-none"
                      aria-label="Add Integrations"
                    >
                      {selectedContentType === "X post" && (
                        <HugeiconsIcon
                          icon={NewTwitterRectangleIcon}
                          className="w-4 h-4"
                        />
                      )}
                      {selectedContentType === "Instagram reel" && (
                        <HugeiconsIcon
                          icon={InstagramIcon}
                          className="w-4 h-4"
                        />
                      )}
                      {selectedContentType === "LinkedIn post" && (
                        <HugeiconsIcon
                          icon={Linkedin01Icon}
                          className="w-4 h-4"
                        />
                      )}
                      {selectedContentType === "WhatsApp message" && (
                        <HugeiconsIcon
                          icon={WhatsappIcon}
                          className="w-4 h-4"
                        />
                      )}
                      {selectedContentType || "Auto"}
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent className="bg-background text-foreground border border-border rounded-xl">
                  <p className="text-xs">Content Type</p>
                </TooltipContent>
              </Tooltip>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuItem
                  onClick={() => selectContentType("Auto")}
                  onSelect={(e) => e.preventDefault()}
                  className={`flex items-center gap-2 justify-between ${
                    selectedContentType === "Auto" ? "bg-muted/60" : ""
                  }`}
                >
                  <span className="flex items-center gap-2">Auto</span>
                  {selectedContentType === "Auto" && (
                    <Check className="w-4 h-4 text-foreground" />
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => selectContentType("X post")}
                  onSelect={(e) => e.preventDefault()}
                  className={`flex items-center gap-2 justify-between ${
                    selectedContentType === "X post" ? "bg-muted/60" : ""
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <HugeiconsIcon
                      icon={NewTwitterRectangleIcon}
                      className="w-4 h-4"
                    />
                    X post
                  </span>
                  {selectedContentType === "X post" && (
                    <Check className="w-4 h-4 text-foreground" />
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => selectContentType("Instagram reel")}
                  onSelect={(e) => e.preventDefault()}
                  className={`flex items-center gap-2 justify-between ${
                    selectedContentType === "Instagram reel"
                      ? "bg-muted/60"
                      : ""
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <HugeiconsIcon icon={InstagramIcon} className="w-4 h-4" />
                    Instagram reel
                  </span>
                  {selectedContentType === "Instagram reel" && (
                    <Check className="w-4 h-4 text-foreground" />
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => selectContentType("LinkedIn post")}
                  onSelect={(e) => e.preventDefault()}
                  className={`flex items-center gap-2 justify-between ${
                    selectedContentType === "LinkedIn post" ? "bg-muted/60" : ""
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <HugeiconsIcon icon={Linkedin01Icon} className="w-4 h-4" />
                    LinkedIn post
                  </span>
                  {selectedContentType === "LinkedIn post" && (
                    <Check className="w-4 h-4 text-foreground" />
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => selectContentType("WhatsApp message")}
                  onSelect={(e) => e.preventDefault()}
                  className={`flex items-center gap-2 justify-between ${
                    selectedContentType === "WhatsApp message"
                      ? "bg-muted/60"
                      : ""
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <HugeiconsIcon icon={WhatsappIcon} className="w-4 h-4" />
                    WhatsApp message
                  </span>
                  {selectedContentType === "WhatsApp message" && (
                    <Check className="w-4 h-4 text-foreground" />
                  )}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            {/* Créditos restantes */}
            <div className="ml-2 rounded-full hidden text-xs text-foreground/80 select-none  flex-shrink-0 items-center gap-1.5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="18"
                height="18"
                color="#8e51ff"
                fill="none"
              >
                <path
                  d="M15 2L15.5387 4.39157C15.9957 6.42015 17.5798 8.00431 19.6084 8.46127L22 9L19.6084 9.53873C17.5798 9.99569 15.9957 11.5798 15.5387 13.6084L15 16L14.4613 13.6084C14.0043 11.5798 12.4202 9.99569 10.3916 9.53873L8 9L10.3916 8.46127C12.4201 8.00431 14.0043 6.42015 14.4613 4.39158L15 2Z"
                  stroke="#8e51ff"
                  fill="currentColor"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
                <path
                  d="M7 12L7.38481 13.7083C7.71121 15.1572 8.84275 16.2888 10.2917 16.6152L12 17L10.2917 17.3848C8.84275 17.7112 7.71121 18.8427 7.38481 20.2917L7 22L6.61519 20.2917C6.28879 18.8427 5.15725 17.7112 3.70827 17.3848L2 17L3.70827 16.6152C5.15725 16.2888 6.28879 15.1573 6.61519 13.7083L7 12Z"
                  stroke="#8e51ff"
                  fill="currentColor"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
              </svg>
              {creditsRemaining === undefined
                ? ""
                : creditsRemaining === null
                  ? "∞ daily credits"
                  : `${creditsRemaining} daily credits left`}
            </div>
            {variant === "fixed" && (
              <button
                type="button"
                onClick={() => setIsChatHidden(true)}
                className="cursor-pointer p-2 hover:bg-muted rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground transition-all duration-100"
                aria-label="Ocultar chat"
              >
                Hide chat (Ctrl + I)
              </button>
            )}
            <div
              className={`ml-2 text-xs font-medium text-red-500 transition-opacity duration-200 ${
                isExceedingLimit ? "opacity-100" : "opacity-0"
              }`}
            >
              Max length reached
            </div>
          </div>
          <button
            onClick={handleGenerate}
            disabled={isDisabled || isGenerating}
            className={`cursor-pointer bg-foreground text-background font-medium px-2 py-2 rounded-full transition-opacity ${
              isDisabled ? "opacity-60 cursor-not-allowed" : "hover:opacity-90"
            }`}
            aria-label="Enviar prompt"
          >
            <ArrowUp size={20} />
          </button>
        </div>
      </div>

      {variant === "fixed" && isMounted
        ? createPortal(
            <button
              type="button"
              onClick={() => setIsChatHidden(false)}
              className={`cursor-pointer fixed bottom-6 right-8 z-[65] w-12 h-12 rounded-full bg-background border border-border text-foreground flex items-center justify-center shadow-lg transition-all duration-300 ease-in-out hover:opacity-90 ${
                isChatHidden
                  ? "opacity-100"
                  : "opacity-0 blur-sm translate-y-1 pointer-events-none"
              }`}
              aria-label="Mostrar chat"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width={20}
                height={20}
                color={"#8e51ff"}
                fill={"currentColor"}
                className="mt-[0.5px]"
              >
                <path
                  d="M3 12C7.5 12 12 7.5 12 3C12 7.5 16.5 12 21 12C16.5 12 12 16.5 12 21C12 16.5 7.5 12 3 12Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinejoin="round"
                ></path>
              </svg>
            </button>,
            document.body
          )
        : null}

      {/* Dialogo de autenticación para invitados */}
      <Dialog open={isAuthDialogOpen} onOpenChange={setIsAuthDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Inicia sesión para continuar</DialogTitle>
            <DialogDescription>
              Debes iniciar sesión o crear una cuenta para crear tablas desde el
              prompt.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Sign up</Link>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialogo de créditos agotados */}
      <Dialog
        open={isNoCreditsDialogOpen}
        onOpenChange={setIsNoCreditsDialogOpen}
      >
        <DialogContent className="sm:max-w-[520px] p-2" showCloseButton={false}>
          <div className="w-full h-[282.5px] relative flex justify-center items-center rounded-xl overflow-hidden border border-border">
            <Image
              src="/credits.png"
              alt="Coming Soon"
              width={800}
              height={600}
              className="w-full h-full object-cover"
              priority
            />
          </div>
          <div className="px-3 pb-3">
            <DialogHeader>
              <DialogTitle className="text-2xl text-foreground/80 font-semibold tracking-tight">
                No credits available
              </DialogTitle>
              <DialogDescription className="text-base text-muted-foreground">
                You have run out of daily credits to generate grids with AI. Try
                creating a grid manually with the options below or come back
                tomorrow.
              </DialogDescription>
            </DialogHeader>
          </div>
          <DialogClose asChild>
            <button
              className="absolute right-3 top-3 rounded-full bg-muted p-1 opacity-70 transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none cursor-pointer"
              aria-label="Cerrar"
            >
              <X className="h-4 w-4" />
            </button>
          </DialogClose>
        </DialogContent>
      </Dialog>
    </div>
  );
}
