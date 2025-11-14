"use client";

import { useState, useEffect } from "react";
import {
  calculateBrandBilling,
  getBrandDailyBilling,
  getCurrentPricePerWorn,
  type BillingCalculation,
  type DailyBilling,
} from "@/lib/actions/billing";
import {
  DollarSign,
  TrendingUp,
  Calendar,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface AdminBillingViewProps {
  brandId: string;
}

type TimeRange = "1D" | "1W" | "1M" | "ALL";

interface BillingComparison {
  current: number;
  previous: number;
  percentageChange: number;
  isPositive: boolean;
}

const TIME_RANGE_DAYS: Record<TimeRange, number | null> = {
  "1D": 1,
  "1W": 7,
  "1M": 30,
  ALL: null,
};

export function AdminBillingView({ brandId }: AdminBillingViewProps) {
  const [billing, setBilling] = useState<BillingCalculation>({
    total_worn_count: 0,
    total_link_clicks: 0,
    price_per_worn: 0,
    price_per_click: 0,
    subtotal_worn: 0,
    subtotal_clicks: 0,
    total_amount: 0,
  });
  const [dailyBilling, setDailyBilling] = useState<DailyBilling[]>([]);
  const [pricePerWorn, setPricePerWorn] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>("1M");
  const [comparison, setComparison] = useState<BillingComparison | null>(null);

  useEffect(() => {
    loadBillingData();
  }, [brandId, selectedTimeRange]);

  const calculateComparison = (
    currentBilling: DailyBilling[],
    previousBilling: DailyBilling[]
  ): BillingComparison => {
    const currentTotal = currentBilling.reduce(
      (sum, b) => sum + b.daily_total_cost,
      0
    );
    const previousTotal = previousBilling.reduce(
      (sum, b) => sum + b.daily_total_cost,
      0
    );

    const change =
      previousTotal > 0
        ? ((currentTotal - previousTotal) / previousTotal) * 100
        : 0;

    return {
      current: currentTotal,
      previous: previousTotal,
      percentageChange: change,
      isPositive: change >= 0,
    };
  };

  const loadBillingData = async () => {
    setLoading(true);
    try {
      const days = TIME_RANGE_DAYS[selectedTimeRange];
      const daysToFetch = days || 365;

      // Cargar precio actual
      const currentPrice = await getCurrentPricePerWorn();
      setPricePerWorn(currentPrice);

      // Cargar billing del período actual
      const [billingData, dailyData] = await Promise.all([
        calculateBrandBilling(brandId, days),
        getBrandDailyBilling(brandId, days === 1 ? 2 : daysToFetch),
      ]);

      // Filtrar datos diarios según el rango seleccionado
      let filteredDaily = dailyData;
      if (days) {
        const today = new Date();
        const startDate = new Date(today);
        startDate.setDate(today.getDate() - days);

        filteredDaily = dailyData.filter((metric) => {
          const metricDate = new Date(metric.event_date);
          return metricDate >= startDate;
        });
      }

      // Cargar billing del período anterior para comparación
      let previousBilling: DailyBilling[] = [];
      if (days && selectedTimeRange !== "ALL") {
        const previousStart = daysToFetch * 2;
        const allPreviousBilling = await getBrandDailyBilling(
          brandId,
          previousStart
        );

        const today = new Date();
        const previousEndDate = new Date(today);
        previousEndDate.setDate(today.getDate() - days);
        const previousStartDate = new Date(previousEndDate);
        previousStartDate.setDate(previousEndDate.getDate() - days);

        previousBilling = allPreviousBilling.filter((metric) => {
          const metricDate = new Date(metric.event_date);
          return (
            metricDate >= previousStartDate && metricDate < previousEndDate
          );
        });
      }

      setBilling(billingData);
      setDailyBilling(filteredDaily);

      // Calcular comparaciones
      if (previousBilling.length > 0 && selectedTimeRange !== "ALL") {
        const comparisonData = calculateComparison(
          filteredDaily,
          previousBilling
        );
        setComparison(comparisonData);
      } else {
        setComparison(null);
      }
    } catch (error) {
      console.error("Error loading billing data:", error);
    } finally {
      setLoading(false);
    }
  };

  const chartData = dailyBilling
    .map((billing) => {
      const [year, month, day] = billing.event_date.split("-").map(Number);
      const date = new Date(year, month - 1, day);

      return {
        date: date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        Costo: billing.daily_total_cost,
        "Worn Count": billing.worn_count,
      };
    })
    .reverse();

  // Skeleton component
  const MetricBoxSkeleton = () => (
    <div className="bg-white border border-border rounded-2xl p-6 animate-pulse">
      <div className="flex items-center justify-start gap-2 mb-3">
        <div className="w-5 h-5 bg-neutral-200 rounded" />
        <div className="h-4 w-32 bg-neutral-200 rounded" />
      </div>
      <div className="h-16 w-40 bg-neutral-200 rounded mb-3" />
      <div className="h-4 w-36 bg-neutral-200 rounded" />
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-5xl font-bold tracking-tighter">Billing</h1>

        {/* Time Range Selector */}
        <div className="flex items-center gap-4">
          {(["1D", "1W", "1M", "ALL"] as TimeRange[]).map((range) => (
            <button
              key={range}
              onClick={() => setSelectedTimeRange(range)}
              className={`text-base font-medium tracking-tight transition-colors cursor-pointer ${
                selectedTimeRange === range
                  ? "text-foreground"
                  : "text-muted-foreground/60 hover:text-foreground"
              }`}
            >
              {range === "ALL" ? "All time" : range}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {loading ? (
          <>
            <MetricBoxSkeleton />
            <MetricBoxSkeleton />
            <MetricBoxSkeleton />
          </>
        ) : (
          <>
            <div className="bg-white border border-border rounded-2xl p-6 flex flex-col">
              <div className="flex items-center justify-start gap-2 mb-3">
                <DollarSign className="h-5 w-5 text-muted-foreground" />
                <p className="text-base text-muted-foreground tracking-tight">
                  Costo Total
                </p>
              </div>
              <div className="text-6xl font-bold tracking-tighter text-green-600">
                ${billing.total_amount.toFixed(2)}
              </div>
              {comparison && (
                <div
                  className={`flex items-center gap-1 rounded-full relative self-start pl-1 pr-2 mt-3 max-w-full ${
                    comparison.isPositive
                      ? "bg-green-600/10 text-green-600"
                      : "bg-red-600/10 text-red-600"
                  }`}
                >
                  {comparison.isPositive ? (
                    <ArrowUp className="h-4 w-4 flex-shrink-0" />
                  ) : (
                    <ArrowDown className="h-4 w-4 flex-shrink-0" />
                  )}
                  <span className="text-sm font-medium tracking-tight whitespace-nowrap">
                    {Math.abs(comparison.percentageChange).toFixed(1)}%
                  </span>
                  <span className="text-sm tracking-tight truncate">
                    {comparison.isPositive
                      ? "up from previous period"
                      : "down from previous period"}
                  </span>
                </div>
              )}
            </div>

            <div className="bg-white border border-border rounded-2xl p-6 flex flex-col">
              <div className="flex items-center justify-start gap-2 mb-3">
                <TrendingUp className="h-5 w-5 text-muted-foreground" />
                <p className="text-base text-muted-foreground tracking-tight">
                  Total Vestidos
                </p>
              </div>
              <div className="text-6xl font-bold tracking-tighter">
                {billing.total_worn_count}
              </div>
              <p className="text-sm text-muted-foreground mt-3">
                ${billing.subtotal_worn.toFixed(2)} USD
              </p>
            </div>

            <div className="bg-white border border-border rounded-2xl p-6 flex flex-col">
              <div className="flex items-center justify-start gap-2 mb-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <p className="text-base text-muted-foreground tracking-tight">
                  Precio por Vestido
                </p>
              </div>
              <div className="text-6xl font-bold tracking-tighter">
                ${billing.price_per_worn.toFixed(2)}
              </div>
              <p className="text-sm text-muted-foreground mt-3">
                USD por evento
              </p>
            </div>
          </>
        )}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1">
        {/* Cost Trend Chart */}
        <div className="bg-white border border-border rounded-2xl p-6">
          {loading ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-6 w-48 bg-neutral-200 rounded mb-6" />
              <div className="h-[350px] bg-neutral-100 rounded-xl" />
            </div>
          ) : (
            <div>
              <h3 className="text-lg font-bold tracking-tight mb-6">
                Tendencia de Costos
              </h3>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date" style={{ fontSize: 12 }} />
                    <YAxis style={{ fontSize: 12 }} />
                    <Tooltip
                      formatter={(value: number) => `$${value.toFixed(2)}`}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="Costo"
                      stroke="#10b981"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[350px] text-muted-foreground tracking-tight">
                  No hay datos para mostrar en este período
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Billing Breakdown Table */}
      <div className="bg-white border border-border rounded-2xl p-6">
        {loading ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-6 w-48 bg-neutral-200 rounded mb-6" />
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-neutral-100 rounded-xl" />
              ))}
            </div>
          </div>
        ) : (
          <div>
            <h3 className="text-lg font-bold tracking-tight mb-6">
              Desglose Diario
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">
                      Fecha
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-muted-foreground">
                      Vestidos
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-muted-foreground">
                      Costo Vestidos
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-muted-foreground">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {dailyBilling.length > 0 ? (
                    dailyBilling.map((day) => (
                      <tr
                        key={day.event_date}
                        className="border-b border-border hover:bg-neutral-50 transition-colors"
                      >
                        <td className="py-3 px-4 text-sm">
                          {new Date(day.event_date).toLocaleDateString(
                            "es-ES",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }
                          )}
                        </td>
                        <td className="py-3 px-4 text-sm text-center font-medium text-purple-600">
                          {day.worn_count}
                        </td>
                        <td className="py-3 px-4 text-sm text-right font-medium">
                          ${day.daily_cost_worn.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-sm text-right font-bold text-green-600">
                          ${day.daily_total_cost.toFixed(2)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={4}
                        className="text-center py-12 text-muted-foreground"
                      >
                        No hay datos de billing para este período
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
