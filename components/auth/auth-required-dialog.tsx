"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface AuthRequiredDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
}

export function AuthRequiredDialog({
  open,
  onOpenChange,
  title = "Inicia sesión para continuar",
  description = "Necesitas crear una cuenta para usar esta función y crear tu avatar personalizado.",
}: AuthRequiredDialogProps) {
  const router = useRouter();

  const handleLogin = () => {
    onOpenChange(false);
    router.push("/login");
  };

  const handleRegister = () => {
    onOpenChange(false);
    router.push("/register");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg flex flex-col items-center justify-center w-full p-10">
        <div className="w-1/2 h-auto aspect-square relative">
          <img
            src="/avatar-shadow.png"
            alt="Home"
            className="w-full h-full object-cover top-0 left-0 absolute "
          />
        </div>
        <DialogHeader className="">
          <DialogTitle className="text-4xl font-bold text-foreground tracking-tighter text-center">
            {title}
          </DialogTitle>
          <DialogDescription className="text-lg text-muted-foreground text-center">
            {description}
          </DialogDescription>
        </DialogHeader>
        <div className="flex w-full gap-3">
          <Button
            onClick={handleLogin}
            variant="outline"
            className="w-full rounded-full text-base cursor-pointer"
          >
            Login
          </Button>
          <Button
            onClick={handleRegister}
            className="w-full rounded-full text-base cursor-pointer"
          >
            Sign up
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
