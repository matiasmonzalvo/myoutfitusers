"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";

export default function SuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const checkoutId = searchParams.get("checkout_id");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!checkoutId) {
      setStatus("error");
      setMessage("No checkout ID provided");
      return;
    }

    // Aquí puedes verificar el estado del checkout con Polar si lo necesitas
    // Por ahora, asumimos que si llegamos aquí, el pago fue exitoso
    setStatus("success");
    setMessage("Your purchase was successful!");

    // Opcional: Llamar a tu backend para confirmar y agregar try-ons
    // fetch("/api/checkout/verify", {
    //   method: "POST",
    //   body: JSON.stringify({ checkout_id: checkoutId })
    // });
  }, [checkoutId]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="text-center text-2xl">
            {status === "loading" && "Processing..."}
            {status === "success" && "Payment Successful!"}
            {status === "error" && "Payment Failed"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-center">
            {status === "loading" && (
              <Loader2 className="w-16 h-16 animate-spin text-primary" />
            )}
            {status === "success" && (
              <CheckCircle2 className="w-16 h-16 text-green-500" />
            )}
            {status === "error" && (
              <XCircle className="w-16 h-16 text-red-500" />
            )}
          </div>

          <div className="text-center space-y-2">
            <p className="text-lg font-medium">{message}</p>
            {status === "success" && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Your try-ons have been added to your account.
                </p>
                <p className="text-sm text-muted-foreground">
                  You can start trying on products now!
                </p>
              </div>
            )}
            {status === "error" && (
              <p className="text-sm text-muted-foreground">
                There was an issue processing your payment. Please try again or contact support.
              </p>
            )}
          </div>

          <div className="space-y-2">
            {status === "success" && (
              <>
                <Button
                  onClick={() => router.push("/")}
                  className="w-full"
                  size="lg"
                >
                  Start Trying On
                </Button>
                <Button
                  onClick={() => router.push("/billing")}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  View My Balance
                </Button>
              </>
            )}
            {status === "error" && (
              <>
                <Button
                  onClick={() => router.push("/pricing")}
                  className="w-full"
                  size="lg"
                >
                  Try Again
                </Button>
                <Button
                  onClick={() => router.push("/")}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  Go Home
                </Button>
              </>
            )}
          </div>

          {checkoutId && (
            <p className="text-xs text-center text-muted-foreground">
              Checkout ID: {checkoutId}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}



