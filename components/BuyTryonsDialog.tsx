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
import { Check, Loader, Loader2, ShoppingBag } from "lucide-react";

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
      price: "$5",
      tryOns: 60,
      savings: "",
      popular: false,
      polarProductId: "77bc8e98-468a-4a23-89b3-bc4384fd3b04", // TODO: Add when created in Polar
    },
    {
      name: "Medium",
      price: "$10",
      tryOns: 140,
      savings: "14.3%",
      popular: false,
      polarProductId: "b72b2959-c7bb-4adb-9359-997422fb30d2", // TODO: Add when created in Polar
    },
    {
      name: "Large",
      price: "$20",
      tryOns: 300,
      savings: "20%",
      popular: true,
      polarProductId: "23829530-6f2c-4151-984f-bd9a65abfc42",
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
      <DialogContent className="sm:w-sm md:w-md rounded-3xl p-6">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold tracking-tight leading-[1]">
            No try-ons left
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {tryOnsLeft === 0
              ? "Purchase a package to continue trying on products."
              : `You have ${tryOnsLeft} try-ons left.`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {tryOnPacks.map((pack) => (
            <div
              key={pack.name}
              className={`border border-border rounded-2xl p-4 bg-white dark:bg-black/50 transition-colors ${
                !pack.polarProductId ? "opacity-50" : ""
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex flex-col items-start justify-between">
                  <h3 className="text-xl font-bold tracking-tight">
                    {pack.name}
                  </h3>
                  <div className="flex items-center pt-1.5 gap-1">
                    <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                      <Check
                        className="w-4 h-4 text-primary"
                        strokeWidth={3.5}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground font-medium tracking-tight">
                      {pack.tryOns} Try-ons
                    </span>
                  </div>
                </div>

                <div className="text-xl font-bold tracking-tight flex flex-col items-end gap-1.5">
                  {pack.price}{" "}
                  <span className="text-sm text-muted-foreground font-medium">
                    {pack.savings ? (
                      <span className="text-sm text-primary font-medium">
                        Save {pack.savings}
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground font-medium">
                        Base plan
                      </span>
                    )}
                  </span>
                </div>
              </div>

              <Button
                onClick={() => handlePurchase(pack.polarProductId, pack.name)}
                disabled={isLoading === pack.name || !pack.polarProductId}
                className="w-full rounded-full text-white font-medium cursor-pointer"
                size="sm"
              >
                {isLoading === pack.name ? (
                  <Loader className="w-4 h-4 animate-spin text-foreground" />
                ) : (
                  "Get try-ons"
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

        <div className="p-3 bg-muted rounded-2xl">
          <div className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="20"
              height="20"
              color="#000000"
              fill="none"
              className="mt-[0.5px]"
            >
              <path
                d="M18.9905 19H19M18.9905 19C18.3678 19.6175 17.2393 19.4637 16.4479 19.4637C15.4765 19.4637 15.0087 19.6537 14.3154 20.347C13.7251 20.9374 12.9337 22 12 22C11.0663 22 10.2749 20.9374 9.68457 20.347C8.99128 19.6537 8.52349 19.4637 7.55206 19.4637C6.76068 19.4637 5.63218 19.6175 5.00949 19C4.38181 18.3776 4.53628 17.2444 4.53628 16.4479C4.53628 15.4414 4.31616 14.9786 3.59938 14.2618C2.53314 13.1956 2.00002 12.6624 2 12C2.00001 11.3375 2.53312 10.8044 3.59935 9.73817C4.2392 9.09832 4.53628 8.46428 4.53628 7.55206C4.53628 6.76065 4.38249 5.63214 5 5.00944C5.62243 4.38178 6.7556 4.53626 7.55208 4.53626C8.46427 4.53626 9.09832 4.2392 9.73815 3.59937C10.8044 2.53312 11.3375 2 12 2C12.6625 2 13.1956 2.53312 14.2618 3.59937C14.9015 4.23907 15.5355 4.53626 16.4479 4.53626C17.2393 4.53626 18.3679 4.38247 18.9906 5C19.6182 5.62243 19.4637 6.75559 19.4637 7.55206C19.4637 8.55858 19.6839 9.02137 20.4006 9.73817C21.4669 10.8044 22 11.3375 22 12C22 12.6624 21.4669 13.1956 20.4006 14.2618C19.6838 14.9786 19.4637 15.4414 19.4637 16.4479C19.4637 17.2444 19.6182 18.3776 18.9905 19Z"
                fill="#00c950"
                strokeWidth="1.5"
              />
              <path
                d="M9 12.8929L10.8 14.5L15 9.5"
                stroke="var(--muted)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div>
              <p className="text-sm font-medium">Partner brands are free</p>
              <p className="text-xs text-muted-foreground">
                Try-ons for verified brand products don't consume your balance
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => onOpenChange(false)}
          className="w-full text-sm text-foreground  cursor-pointer"
        >
          <span className="text-foreground hover:text-red-500">Cancel</span>
        </button>
      </DialogContent>
    </Dialog>
  );
}
