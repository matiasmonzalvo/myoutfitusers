"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Loader2, ShoppingBag } from "lucide-react";

interface BuyTryonsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tryOnsLeft?: number;
}

export function BuyTryonsDialog({
  open,
  onOpenChange,
  tryOnsLeft = 0,
}: BuyTryonsDialogProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const tryOnPacks = [
    {
      name: "Small",
      price: "$2",
      tryOns: 20,
      pricePerTryOn: "$0.1",
      polarProductId: "211d365b-b5de-4072-8690-1b25fd97ad3d",
    },
    {
      name: "Medium",
      price: "$5",
      tryOns: 60,
      pricePerTryOn: "$0.083",
      polarProductId: "ccd87a31-f6ba-44b7-989d-1effa9de9437",
    },
    {
      name: "Large",
      price: "$10",
      tryOns: 150,
      pricePerTryOn: "$0.066",
      polarProductId: "9b883ae1-b120-4226-ad88-2ca5f19d3078",
    },
  ];

  const handlePurchase = async (
    polarProductId: string | null,
    packageName: string
  ) => {
    if (!polarProductId) {
      alert("This package is not available yet. Please try another one.");
      return;
    }

    setIsLoading(packageName);

    try {
      const response = await fetch("/api/checkout/create-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          product_id: polarProductId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create checkout session");
      }

      const data = await response.json();
      window.location.href = data.url;
    } catch (error) {
      console.error("Error purchasing package:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to start checkout. Please try again."
      );
      setIsLoading(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-3xl p-6">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold tracking-tight">
            No try-ons left
          </DialogTitle>
          <DialogDescription className="text-base text-muted-foreground">
            {tryOnsLeft === 0
              ? "You don't have any try-ons. Purchase a package to continue."
              : `You have ${tryOnsLeft} try-ons left.`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 mt-4">
          {tryOnPacks.map((pack) => (
            <div
              key={pack.name}
              className={`border border-border rounded-2xl p-4 hover:bg-muted/50 transition-colors ${
                !pack.polarProductId ? "opacity-50" : ""
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="text-lg font-bold">{pack.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {pack.tryOns} try-ons
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{pack.price}</p>
                  <p className="text-xs text-muted-foreground">
                    {pack.pricePerTryOn}/try-on
                  </p>
                </div>
              </div>

              <Button
                onClick={() => handlePurchase(pack.polarProductId, pack.name)}
                disabled={isLoading === pack.name || !pack.polarProductId}
                className="w-full rounded-full"
                size="sm"
              >
                {isLoading === pack.name ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    Buy {pack.name}
                  </>
                )}
              </Button>

              {!pack.polarProductId && (
                <p className="text-xs text-yellow-600 mt-2 text-center">
                  Coming soon
                </p>
              )}
            </div>
          ))}
        </div>

        <div className="mt-4 p-3 bg-muted rounded-2xl">
          <div className="flex items-start gap-2">
            <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium">Partner brands are free</p>
              <p className="text-xs text-muted-foreground">
                Try-ons for verified brand products don't consume your balance
              </p>
            </div>
          </div>
        </div>

        <Button
          onClick={() => onOpenChange(false)}
          variant="ghost"
          className="w-full"
        >
          Cancel
        </Button>
      </DialogContent>
    </Dialog>
  );
}

