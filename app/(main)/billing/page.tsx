"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Package,
  TrendingUp,
  Calendar,
  Activity,
  Loader2,
  ShoppingCart,
  Check,
} from "lucide-react";
import type { BillingDashboard } from "@/lib/types/billing";
import { format } from "date-fns";

export default function BillingPage() {
  const router = useRouter();
  const [billingData, setBillingData] = useState<BillingDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBillingInfo = async () => {
      try {
        const response = await fetch("/api/billing/info");

        if (!response.ok) {
          if (response.status === 401) {
            router.push("/login");
            return;
          }
          throw new Error("Error loading billing information");
        }

        const data = await response.json();
        setBillingData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchBillingInfo();
  }, [router]);

  if (loading) {
    return <></>;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <p className="text-red-500 text-center">{error}</p>
            <Button onClick={() => router.push("/")} className="w-full mt-4">
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const {
    try_ons_left,
    stats,
    recent_purchases,
    recent_usage,
    available_packages,
  } = billingData!;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Try-ons Left - Big Card */}
        <Card className="border-border bg-white dark:bg-black/50 rounded-3xl max-w-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
              Try-ons Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-baseline gap-2">
                <span className="text-6xl font-bold">{try_ons_left}</span>
                <span className="text-2xl text-muted-foreground">
                  try-ons left
                </span>
              </div>
              {try_ons_left === 0 && (
                <div className="bg-orange-500/5 rounded-lg p-4">
                  <p className="text-sm text-orange-500">
                    <strong>You're out of try-ons!</strong> Purchase a package
                    to continue trying on products.
                  </p>
                </div>
              )}
              <Button
                onClick={() => router.push("/pricing")}
                className="mt-2 text-white font-medium rounded-lg"
                size="sm"
              >
                Get Try-ons
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Package className="w-4 h-4" />
                Total Purchased
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.total_purchased}</div>
              <p className="text-xs text-muted-foreground mt-1">
                try-ons bought
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Total Used
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.total_used}</div>
              <p className="text-xs text-muted-foreground mt-1">
                try-ons consumed
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Total Spent
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                ${stats.total_spent.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                lifetime spending
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Last Purchase
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">
                {stats.last_purchase_date
                  ? format(new Date(stats.last_purchase_date), "MMM dd, yyyy")
                  : "Never"}
              </div>
              <p className="text-xs text-muted-foreground mt-1">most recent</p>
            </CardContent>
          </Card>
        </div> */}

        {/* Purchase History */}
        <Card className="border-border bg-white dark:bg-black/50 rounded-3xl">
          <CardHeader>
            <CardTitle>Purchase History</CardTitle>
          </CardHeader>
          <CardContent>
            {recent_purchases.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Package className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>No purchases yet</p>
                <Button
                  onClick={() => router.push("/pricing")}
                  className="mt-4"
                  variant="outline"
                >
                  Buy Your First Package
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="grid grid-cols-12 gap-4 text-sm font-medium text-muted-foreground pb-2 border-b">
                  <div className="col-span-3">Date</div>
                  <div className="col-span-3">Package</div>
                  <div className="col-span-2">Try-ons</div>
                  <div className="col-span-2">Price</div>
                  <div className="col-span-2">Status</div>
                </div>
                <div className="space-y-1 max-h-[400px] overflow-y-auto">
                  {recent_purchases.map((purchase) => (
                    <div
                      key={purchase.id}
                      className="grid grid-cols-12 gap-4 text-sm py-3 hover:bg-muted/50 rounded-lg px-2 transition-colors"
                    >
                      <div className="col-span-3">
                        {format(new Date(purchase.created_at), "PP")}
                      </div>
                      <div className="col-span-3 capitalize font-medium">
                        {purchase.package_name}
                      </div>
                      <div className="col-span-2">
                        {purchase.try_ons_purchased}
                      </div>
                      <div className="col-span-2 font-medium">
                        ${purchase.price_paid.toFixed(2)}
                      </div>
                      <div className="col-span-2">
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            purchase.status === "completed"
                              ? "bg-green-100 text-green-700"
                              : purchase.status === "pending"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-red-100 text-red-700"
                          }`}
                        >
                          {purchase.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Usage History */}
        <Card className="border-border bg-white dark:bg-black/50 rounded-3xl">
          <CardHeader>
            <CardTitle>Usage History (Last 30 days)</CardTitle>
          </CardHeader>
          <CardContent>
            {recent_usage.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Activity className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>No usage history yet</p>
                <Button
                  onClick={() => router.push("/")}
                  className="mt-4"
                  variant="outline"
                >
                  Start Trying On Products
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="grid grid-cols-12 gap-4 text-sm font-medium text-muted-foreground pb-2 border-b">
                  <div className="col-span-6">Date</div>
                  <div className="col-span-3">Action</div>
                  <div className="col-span-3 text-right">Cost</div>
                </div>
                <div className="space-y-1 max-h-[400px] overflow-y-auto">
                  {recent_usage.map((usage) => (
                    <div
                      key={usage.id}
                      className="grid grid-cols-12 gap-4 text-sm py-3 hover:bg-muted/50 rounded-lg px-2 transition-colors"
                    >
                      <div className="col-span-6">
                        {format(new Date(usage.created_at), "PPpp")}
                      </div>
                      <div className="col-span-3 capitalize">
                        {usage.action.replace(/_/g, " ")}
                      </div>
                      <div className="col-span-3 text-right font-medium">
                        {usage.was_free ? (
                          <span className="text-green-600">FREE</span>
                        ) : (
                          <span>-1 try-on</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Information Card */}
        <Card className="bg-muted/50 rounded-3xl">
          <CardHeader>
            <CardTitle className="text-lg">How does it work?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              • Buy a{" "}
              <strong className="text-foreground">package of try-ons</strong>{" "}
              (Small, Medium, or Large)
            </p>
            <p>• Each time you click "Wear it", one try-on is consumed</p>
            <p>
              • Products from{" "}
              <strong className="text-green-500">
                verified brands (green badge)
              </strong>{" "}
              are FREE and don't consume try-ons
            </p>
            <p>• You can buy multiple packages - they accumulate!</p>
            <p>• No expiration date - use them whenever you want</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
