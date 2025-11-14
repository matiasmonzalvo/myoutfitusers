"use client";

import { Tick02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

const plans = [
  {
    name: "Free",
    price: 0,
    features: [
      "1 daily credit (up to 30/month)",
      "Free templates",
      "Public and private projects",
    ],
  },
  {
    name: "Pro",
    price: 10,
    extraFeatures: ["Everything in Free"],
    features: [
      "100 monthly credits",
      "Export tables",
      "Apps Integration",
      "Collaborative projects",
      "Premium templates",
    ],
  },
  {
    name: "Enterprise",
    price: 100,
    extraFeatures: ["Everything in Pro"],
    features: [
      "100 monthly credits",
      "Export tables",
      "Apps Integration",
      "Collaborative projects",
      "Premium templates",
    ],
  },
];

export default function PricingPage() {
  const router = useRouter();
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="absolute top-0 left-0 w-full h-full flex flex-col justify-center items-center z-20 bg-background">
        <h2 className="text-4xl font-semibold mb-3.5 tracking-tighter">
          We are not charging anything yet
        </h2>
        <p className="text-lg text-muted-foreground w-xl text-center tracking-tight">
          Feel free to use Tablium and enjoy the features available. We would
          love to hear your feedback so we can improve our product.
        </p>
        <button
          onClick={() => router.back()}
          className="bg-[#8e51ff] cursor-pointer text-white font-medium rounded-full px-3 py-1 mt-4"
        >
          Go back
        </button>
      </div>
      <div className="absolute top-0 left-0 w-full flex justify-center items-center z-50">
        <div className="w-5xl p-4">
          <Link href="/" className="flex items-center justify-center w-8 h-8">
            <Image
              src="/logo.png"
              alt="Tablium"
              width={100}
              height={100}
              className="w-full h-full object-cover"
            />
          </Link>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center mb-10">
        <h1 className="text-4xl font-semibold">Upgrade your plan</h1>
      </div>
      <div className="flex gap-4">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`flex flex-col items-start justify-start border border-border rounded-xl p-4 w-xs ${
              plan.name === "Pro"
                ? "bg-gradient-to-br from-[#8e51ff]/10 via-[#8e51ff]/0 to-background"
                : "bg-transparent border border-border text-foreground"
            }`}
          >
            <h2 className="text-xl font-semibold mb-4">{plan.name}</h2>
            <div className="flex items-center gap-1">
              <span className="text-4xl text-foreground font-semibold mb-4">
                ${plan.price}
              </span>
              <span className="text-sm text-muted-foreground">/month</span>
            </div>
            <button
              className={`rounded-md cursor-pointer flex text-sm justify-center items-center py-2 w-full mb-8 ${
                plan.name === "Pro"
                  ? "bg-[#8e51ff] text-white font-medium"
                  : "bg-transparent border border-border text-foreground"
              }`}
            >
              Get Started
            </button>
            {plan.extraFeatures && (
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm text-muted-foreground">
                  Everything in Free
                </span>
              </div>
            )}
            <ul className="list-disc list-inside">
              {plan.features.map((feature) => (
                <div className="flex items-center gap-2 mb-2" key={feature}>
                  <HugeiconsIcon
                    icon={Tick02Icon}
                    size={16}
                    color={"var(--foreground)"}
                    fill={"none"}
                  />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
