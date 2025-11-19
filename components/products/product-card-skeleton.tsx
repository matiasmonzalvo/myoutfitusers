"use client";

import { Card, CardContent } from "@/components/ui/card";

export function ProductCardSkeleton() {
  return (
    <Card className="overflow-hidden border-none shadow-none rounded-xl bg-background animate-pulse">
      <div className="aspect-[4/3] group">
        <div className="rounded-2xl overflow-hidden  aspect-[4/3] flex items-center justify-center">
          <div className="w-full h-full bg-muted rounded-lg" />
        </div>
      </div>

      <CardContent className="p-2">
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between">
              <div className="h-5 bg-muted rounded w-[70%]" />
              <div className="flex items-center justify-center gap-1">
                <div className="w-6 h-6 bg-muted rounded-full" />
              </div>
            </div>
            <div className="flex items-center justify-between w-full mt-2">
              <div className="flex items-center justify-start gap-1">
                <div className="w-4 h-4 bg-muted rounded-full" />
                <div className="h-4 bg-muted rounded w-20" />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
