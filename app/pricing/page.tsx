"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Check,
  Sparkles,
  Building2,
  ArrowRight,
  Mail,
  Loader2,
  Loader,
  Verified,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { AuthRequiredDialog } from "@/components/auth/auth-required-dialog";
import { useUserProfile } from "@/hooks/use-user-profile";

export default function PricingPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const { isAuthenticated } = useUserProfile();

  // Polar Product IDs - Replace with your actual product IDs from Polar.sh
  const tryOnPacks = [
    {
      name: "Small",
      price: "$2",
      tryOns: 20,
      pricePerTryOn: "$0.1",
      popular: false,
      polarProductId: "211d365b-b5de-4072-8690-1b25fd97ad3d", // Your $2 product
    },
    {
      name: "Medium",
      price: "$5",
      tryOns: 60,
      pricePerTryOn: "$0.083",
      popular: true,
      polarProductId: "ccd87a31-f6ba-44b7-989d-1effa9de9437", // TODO: Add when created in Polar
    },
    {
      name: "Large",
      price: "$10",
      tryOns: 150,
      pricePerTryOn: "$0.066",
      popular: false,
      polarProductId: "9b883ae1-b120-4226-ad88-2ca5f19d3078", // TODO: Add when created in Polar
    },
  ];

  const handlePurchase = async (
    polarProductId: string | null,
    packageName: string
  ) => {
    if (!isAuthenticated) {
      setShowAuthDialog(true);
      return;
    }

    if (!polarProductId) {
      alert("This package is not available yet. Please try another one.");
      return;
    }

    setIsLoading(packageName);

    try {
      // Create checkout session
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

      // Redirect to Polar checkout
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

  const userFeatures = [
    "Try on any product of the platform",
    "Explore trending products and brands",
    "Save & Download your favorite outfits",
    "Only pay for non-partner brands products",
    "Personalized feed based on your preferences",
    "3 onboarding regenerations included",
  ];

  const brandFeatures = [
    "Free try-on of your products for users",
    "Redirect link to your product page",
    "Analytics of best performing products",
    "Tracking of outfits brand engagement",
    "Own brand page at www.myout.fit/yourbrand",
    "Verified brand badge (green)",
  ];

  return (
    <>
      <AuthRequiredDialog
        open={showAuthDialog}
        onOpenChange={setShowAuthDialog}
        title="Wear yout outfits"
        description="Create your account to start wearing your outfits"
      />
      <div className="bg-background py-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tighter mb-4">
              We're just starting
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Pay only for items that aren’t from partner brands on the
              platform.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid gap-4 max-w-6xl mx-auto">
            {/* User Plan Card */}
            <Card className="relative overflow-hidden border border-border shadow-none rounded-3xl bg-white dark:bg-black/50 flex divide-x divide-border">
              <div className="w-1/2 flex flex-col p-2 relative">
                <CardHeader className="pb-2 relative">
                  <div className="flex flex-col items-start">
                    <CardTitle className="text-2xl font-bold tracking-tight mb-2">
                      Users
                    </CardTitle>
                    <CardDescription className="text-lg text-muted-foreground font-medium tracking-tight leading-tight w-[70%]">
                      Pay only for items that aren't from partner brands on the
                      platform.
                      <br /> Choose your try-ons package.
                    </CardDescription>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6 flex-1 flex flex-col min-h-0">
                  {/* Features */}
                  <div className="space-y-3 pt-4">
                    {userFeatures.map((feature, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                          <Check
                            className="w-4 h-4 text-primary"
                            strokeWidth={3.5}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground font-medium">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="relative w-full flex-1 min-h-0 flex flex-col justify-center gap-6">
                    <div className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
                      <Image
                        src="https://mohyrbuvfktjlxzpxbwb.supabase.co/storage/v1/object/public/brand-logos/551608484_18567162979020081_1135468084872726555_n.jpg"
                        alt="Brand A"
                        width={36}
                        height={36}
                        className="rounded-full object-contain border border-border"
                      />
                      Brand A{" "}
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
                          fill={"#00c950"}
                          strokeWidth="1.5"
                        />
                        <path
                          d="M9 12.8929L10.8 14.5L15 9.5"
                          stroke="#ffffff"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span className="ml-2 text-xl text-[#00c950] font-medium tracking-tight">
                        (Free)
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
                      <Image
                        src="https://mohyrbuvfktjlxzpxbwb.supabase.co/storage/v1/object/public/brand-logos/564201508_18563819479045765_7618693513437726799_n.jpg"
                        alt="Brand A"
                        width={36}
                        height={36}
                        className="rounded-full object-contain border border-border"
                      />
                      Brand B{" "}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        width="20"
                        height="20"
                        color="var(--muted-foreground)"
                        fill="none"
                        className="mt-[0.5px]"
                      >
                        <path
                          d="M18.9905 19H19M18.9905 19C18.3678 19.6175 17.2393 19.4637 16.4479 19.4637C15.4765 19.4637 15.0087 19.6537 14.3154 20.347C13.7251 20.9374 12.9337 22 12 22C11.0663 22 10.2749 20.9374 9.68457 20.347C8.99128 19.6537 8.52349 19.4637 7.55206 19.4637C6.76068 19.4637 5.63218 19.6175 5.00949 19C4.38181 18.3776 4.53628 17.2444 4.53628 16.4479C4.53628 15.4414 4.31616 14.9786 3.59938 14.2618C2.53314 13.1956 2.00002 12.6624 2 12C2.00001 11.3375 2.53312 10.8044 3.59935 9.73817C4.2392 9.09832 4.53628 8.46428 4.53628 7.55206C4.53628 6.76065 4.38249 5.63214 5 5.00944C5.62243 4.38178 6.7556 4.53626 7.55208 4.53626C8.46427 4.53626 9.09832 4.2392 9.73815 3.59937C10.8044 2.53312 11.3375 2 12 2C12.6625 2 13.1956 2.53312 14.2618 3.59937C14.9015 4.23907 15.5355 4.53626 16.4479 4.53626C17.2393 4.53626 18.3679 4.38247 18.9906 5C19.6182 5.62243 19.4637 6.75559 19.4637 7.55206C19.4637 8.55858 19.6839 9.02137 20.4006 9.73817C21.4669 10.8044 22 11.3375 22 12C22 12.6624 21.4669 13.1956 20.4006 14.2618C19.6838 14.9786 19.4637 15.4414 19.4637 16.4479C19.4637 17.2444 19.6182 18.3776 18.9905 19Z"
                          fill={"currentColor"}
                          strokeWidth="1.5"
                        />
                        <path
                          d="M9 12.8929L10.8 14.5L15 9.5"
                          stroke="#ffffff"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span className="ml-2 text-xl text-muted-foreground font-medium tracking-tight">
                        (Try-ons usage)
                      </span>
                    </div>
                  </div>
                </CardContent>
              </div>

              {/* Try-On Packs */}
              <div className="w-1/2 flex flex-col divide-y divide-border">
                {tryOnPacks.map((pack, index) => (
                  <div
                    key={index}
                    className={`flex-1 p-8 flex flex-col justify-between relative transition-colors cursor-pointer group ${
                      !pack.polarProductId
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    } ${pack.popular ? "bg-primary/5" : ""}`}
                  >
                    {isLoading === pack.name && (
                      <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-lg z-10">
                        <Loader className="w-4 h-4 animate-spin text-foreground" />
                      </div>
                    )}
                    <div className="flex items-start justify-between">
                      <div className="flex flex-col items-start justify-between">
                        <h3 className="text-2xl font-bold tracking-tight">
                          {pack.name}
                        </h3>
                        <div className="flex items-center pt-1.5 gap-1">
                          <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                            <Check
                              className="w-4 h-4 text-primary"
                              strokeWidth={3.5}
                            />
                          </div>
                          <span className="text-base text-muted-foreground font-medium tracking-tight">
                            {pack.tryOns} Try-ons
                          </span>
                        </div>
                      </div>

                      <div className="text-[42px] font-bold tracking-tight flex flex-col items-end gap-2 leading-[1]">
                        {pack.price}{" "}
                        <span className="text-base text-muted-foreground font-medium">
                          ({pack.pricePerTryOn} / try-on)
                        </span>
                      </div>
                    </div>
                    <button
                      className={`mt-4 text-base cursor-pointer rounded-full font-medium tracking-tight py-2 transition-all ${pack.popular ? "bg-primary text-white hover:opacity-80" : "border border-border text-foreground hover:bg-background"}`}
                      onClick={() =>
                        handlePurchase(pack.polarProductId, pack.name)
                      }
                    >
                      Get try-ons
                    </button>
                  </div>
                ))}
              </div>
            </Card>

            {/* Brand Plan Card */}
            <Card className="relative overflow-hidden border border-border shadow-none rounded-3xl bg-white dark:bg-black/50 divide-x divide-border">
              <div className="w-1/2 flex flex-col p-2">
                <CardHeader className="pb-[13px] relative">
                  <div className="flex flex-col items-start">
                    <CardTitle className="text-2xl font-bold tracking-tight mb-2">
                      Brands
                    </CardTitle>
                    <CardDescription className="text-lg text-muted-foreground font-medium tracking-tight leading-tight w-[65%]">
                      Add your products to the platform, track every single stat
                      and increase your sales.
                    </CardDescription>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Features */}
                  <div className="space-y-3 pt-4">
                    {brandFeatures.map((feature, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                          <Check
                            className="w-4 h-4 text-green-500"
                            strokeWidth={3.5}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground font-medium">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>

                  <Button
                    onClick={() => router.push("/register")}
                    className="w-full h-11 text-lg tracking-tight font-medium rounded-full bg-foreground text-background cursor-pointer hover:opacity-80 hover:bg-foreground transition-all"
                    size="lg"
                  >
                    Talk to sales
                  </Button>
                </CardContent>
              </div>
              <div className="w-1/2 flex flex-col divide-y divide-border"></div>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
