"use client";

import { useState, useEffect } from "react";
import {
  getBrandProductsMetrics,
  getBrandDailyMetrics,
  getBrandMetricsSummary,
  getTopProducts,
  getBrandProductsMetricsFiltered,
  getTopProductsFiltered,
  type ProductMetrics,
  type DailyMetrics,
  type BrandMetricsSummary,
} from "@/lib/actions/metrics";
import { ShoppingBag, Eye, TrendingUp, ArrowUp, ArrowDown } from "lucide-react";
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

interface AdminPerformanceViewProps {
  brandId: string;
}

type TimeRange = "1D" | "1W" | "1M" | "ALL";

interface MetricComparison {
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

export function AdminPerformanceView({ brandId }: AdminPerformanceViewProps) {
  const [productsMetrics, setProductsMetrics] = useState<ProductMetrics[]>([]);
  const [dailyMetrics, setDailyMetrics] = useState<DailyMetrics[]>([]);
  const [summary, setSummary] = useState<BrandMetricsSummary>({
    total_products: 0,
    total_worn_count: 0,
    total_link_clicks: 0,
    total_product_views: 0,
    total_outfit_downloads: 0,
    total_outfit_saves: 0,
    events_today: 0,
  });
  const [topProducts, setTopProducts] = useState<ProductMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>("1W");
  const [comparisons, setComparisons] = useState<{
    worn: MetricComparison;
    clicks: MetricComparison;
    rate: MetricComparison;
  } | null>(null);

  useEffect(() => {
    loadMetrics();
  }, [brandId, selectedTimeRange]);

  const calculateComparisons = (
    currentMetrics: DailyMetrics[],
    previousMetrics: DailyMetrics[]
  ) => {
    const currentWorn = currentMetrics.reduce(
      (sum, m) => sum + m.worn_count,
      0
    );
    const currentClicks = currentMetrics.reduce(
      (sum, m) => sum + m.link_clicks,
      0
    );
    const previousWorn = previousMetrics.reduce(
      (sum, m) => sum + m.worn_count,
      0
    );
    const previousClicks = previousMetrics.reduce(
      (sum, m) => sum + m.link_clicks,
      0
    );

    const currentRate =
      currentWorn > 0 ? (currentClicks / currentWorn) * 100 : 0;
    const previousRate =
      previousWorn > 0 ? (previousClicks / previousWorn) * 100 : 0;

    const wornChange =
      previousWorn > 0
        ? ((currentWorn - previousWorn) / previousWorn) * 100
        : 0;
    const clicksChange =
      previousClicks > 0
        ? ((currentClicks - previousClicks) / previousClicks) * 100
        : 0;
    const rateChange =
      previousRate > 0
        ? ((currentRate - previousRate) / previousRate) * 100
        : 0;

    return {
      worn: {
        current: currentWorn,
        previous: previousWorn,
        percentageChange: wornChange,
        isPositive: wornChange >= 0,
      },
      clicks: {
        current: currentClicks,
        previous: previousClicks,
        percentageChange: clicksChange,
        isPositive: clicksChange >= 0,
      },
      rate: {
        current: currentRate,
        previous: previousRate,
        percentageChange: rateChange,
        isPositive: rateChange >= 0,
      },
    };
  };

  const loadMetrics = async () => {
    setLoading(true);
    try {
      const days = TIME_RANGE_DAYS[selectedTimeRange];
      const daysToFetch = days || 365; // For "ALL", we take 1 year

      // For the chart, if it's 1D, we fetch 2 days to be able to show a line
      const daysForChart = days === 1 ? 2 : daysToFetch;

      // Load metrics from the current period
      const [products, daily, summaryData, top] = await Promise.all([
        getBrandProductsMetricsFiltered(brandId, days),
        getBrandDailyMetrics(brandId, daysForChart),
        getBrandMetricsSummary(brandId),
        getTopProductsFiltered(brandId, 10, "worn", days),
      ]);

      // Filter metrics according to the selected range
      let filteredDaily = daily;
      if (days) {
        const today = new Date();
        const startDate = new Date(today);

        // For the chart, if it's 1D, we include the previous day
        if (days === 1) {
          startDate.setDate(today.getDate() - 2);
        } else {
          startDate.setDate(today.getDate() - days);
        }

        filteredDaily = daily.filter((metric) => {
          const metricDate = new Date(metric.event_date);
          return metricDate >= startDate;
        });
      }

      // Load metrics from the previous period for comparison
      let previousMetrics: DailyMetrics[] = [];
      if (days && selectedTimeRange !== "ALL") {
        const previousStart = daysToFetch * 2;
        const allPreviousMetrics = await getBrandDailyMetrics(
          brandId,
          previousStart
        );

        const today = new Date();
        const previousEndDate = new Date(today);
        previousEndDate.setDate(today.getDate() - days);
        const previousStartDate = new Date(previousEndDate);
        previousStartDate.setDate(previousEndDate.getDate() - days);

        previousMetrics = allPreviousMetrics.filter((metric) => {
          const metricDate = new Date(metric.event_date);
          return (
            metricDate >= previousStartDate && metricDate < previousEndDate
          );
        });
      }

      setProductsMetrics(products);
      setDailyMetrics(filteredDaily);
      setSummary(summaryData);
      setTopProducts(top);

      // Calculate comparisons
      if (previousMetrics.length > 0 && selectedTimeRange !== "ALL") {
        const comparisonData = calculateComparisons(
          filteredDaily,
          previousMetrics
        );
        setComparisons(comparisonData);
      } else {
        setComparisons(null);
      }
    } catch (error) {
      console.error("Error loading metrics:", error);
    } finally {
      setLoading(false);
    }
  };

  const chartData = dailyMetrics
    .map((metric) => {
      const [year, month, day] = metric.event_date.split("-").map(Number);
      const date = new Date(year, month - 1, day);

      return {
        date: date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        Outfits: metric.worn_count,
        "Link Clicks": metric.link_clicks,
      };
    })
    .reverse();

  // Skeleton component for the boxes
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
        <h1 className="text-5xl font-bold tracking-tighter">Performance</h1>

        {/* Time Range Selector */}
        <div className="flex items-center gap-4">
          {(["1D", "1W", "1M", "ALL"] as TimeRange[]).map((range) => (
            <button
              key={range}
              onClick={() => setSelectedTimeRange(range)}
              className={`text-base font-medium tracking-tight transition-colors cursor-pointer  ${
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
            <div className="bg-muted border border-border rounded-2xl p-6 flex flex-col">
              <div className="flex items-center justify-start gap-2 mb-3">
                <ShoppingBag className="h-5 w-5 text-muted-foreground" />
                <p className="text-base text-muted-foreground tracking-tight">
                  Total Outfits
                </p>
              </div>
              <div className="text-6xl font-bold tracking-tighter">
                {comparisons?.worn.current ??
                  dailyMetrics.reduce((sum, m) => sum + m.worn_count, 0)}
              </div>
              {comparisons && (
                <div
                  className={`flex items-center gap-1 rounded-full relative self-start pl-1 pr-2 mt-3 max-w-full ${comparisons.worn.isPositive ? "bg-green-600/10 text-green-600" : "bg-red-600/10 text-red-600"}`}
                >
                  {comparisons.worn.isPositive ? (
                    <ArrowUp className="h-4 w-4 flex-shrink-0" />
                  ) : (
                    <ArrowDown className="h-4 w-4 flex-shrink-0" />
                  )}
                  <span className="text-sm font-medium tracking-tight whitespace-nowrap">
                    {Math.abs(comparisons.worn.percentageChange).toFixed(1)}%
                  </span>
                  <span className="text-sm tracking-tight truncate">
                    {comparisons.worn.isPositive
                      ? "up from previous period"
                      : "down from previous period"}
                  </span>
                </div>
              )}
            </div>

            <div className="bg-muted border border-border rounded-2xl p-6 flex flex-col">
              <div className="flex items-center justify-start gap-2 mb-3">
                <Eye className="h-5 w-5 text-muted-foreground" />
                <p className="text-base text-muted-foreground tracking-tight">
                  Total Link Clicks
                </p>
              </div>
              <div className="text-6xl font-bold tracking-tighter">
                {comparisons?.clicks.current ??
                  dailyMetrics.reduce((sum, m) => sum + m.link_clicks, 0)}
              </div>
              {comparisons && (
                <div
                  className={`flex items-center gap-1 rounded-full relative self-start pl-1 pr-2 mt-3 max-w-full ${comparisons.clicks.isPositive ? "bg-green-600/10 text-green-600" : "bg-red-600/10 text-red-600"}`}
                >
                  {comparisons.clicks.isPositive ? (
                    <ArrowUp className="h-4 w-4 flex-shrink-0" />
                  ) : (
                    <ArrowDown className="h-4 w-4 flex-shrink-0" />
                  )}
                  <span className="text-sm font-medium tracking-tight whitespace-nowrap">
                    {Math.abs(comparisons.clicks.percentageChange).toFixed(1)}%
                  </span>
                  <span className="text-sm tracking-tight truncate">
                    {comparisons.clicks.isPositive
                      ? "up from previous period"
                      : "down from previous period"}
                  </span>
                </div>
              )}
            </div>

            <div className="bg-muted border border-border rounded-2xl p-6 flex flex-col">
              <div className="flex items-center justify-start gap-2 mb-3">
                <TrendingUp className="h-5 w-5 text-muted-foreground" />
                <p className="text-base text-muted-foreground tracking-tight">
                  Conversion Rate
                </p>
              </div>
              <div className="text-6xl font-bold tracking-tighter">
                {comparisons?.rate.current.toFixed(1) ??
                  (dailyMetrics.reduce((sum, m) => sum + m.worn_count, 0) > 0
                    ? (
                        (dailyMetrics.reduce(
                          (sum, m) => sum + m.link_clicks,
                          0
                        ) /
                          dailyMetrics.reduce(
                            (sum, m) => sum + m.worn_count,
                            0
                          )) *
                        100
                      ).toFixed(1)
                    : "0")}
                %
              </div>
              {comparisons && (
                <div
                  className={`flex items-center gap-1 rounded-full relative self-start pl-1 pr-2 mt-3 max-w-full ${comparisons.rate.isPositive ? "bg-green-600/10 text-green-600" : "bg-red-600/10 text-red-600"}`}
                >
                  {comparisons.rate.isPositive ? (
                    <ArrowUp className="h-4 w-4 flex-shrink-0" />
                  ) : (
                    <ArrowDown className="h-4 w-4 flex-shrink-0" />
                  )}
                  <span className="text-sm font-medium tracking-tight whitespace-nowrap">
                    {Math.abs(comparisons.rate.percentageChange).toFixed(1)}%
                  </span>
                  <span className="text-sm tracking-tight truncate">
                    {comparisons.rate.isPositive
                      ? "up from previous period"
                      : "down from previous period"}
                  </span>
                </div>
              )}
            </div>
          </>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Performance Trend Chart */}
        <div className="bg-muted border border-border rounded-2xl p-6">
          {loading ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-6 w-48 bg-neutral-200 rounded mb-6" />
              <div className="h-[350px] bg-neutral-100 rounded-xl" />
            </div>
          ) : (
            <div>
              <h3 className="text-lg font-bold tracking-tight mb-6">
                Performance Trend
              </h3>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#737373" />
                    <XAxis dataKey="date" style={{ fontSize: 12 }} />
                    <YAxis style={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="Outfits"
                      stroke="#8b5cf6"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="Link Clicks"
                      stroke="#3b82f6"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[350px] text-muted-foreground tracking-tight">
                  No data to display for this period
                </div>
              )}
            </div>
          )}
        </div>
        <div className="bg-muted border border-border rounded-2xl p-6">
          {loading ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-6 w-48 bg-neutral-200 rounded mb-6" />
              <div className="h-[400px] bg-neutral-100 rounded-xl" />
            </div>
          ) : (
            <div>
              <h3 className="text-lg font-bold tracking-tight mb-6">
                Top 10 Most Worn Products
              </h3>
              {topProducts.length > 0 ? (
                <ResponsiveContainer width="100%" height={440}>
                  <BarChart data={topProducts}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#737373" />
                    <XAxis
                      dataKey="name"
                      angle={-45}
                      textAnchor="end"
                      height={120}
                      style={{ fontSize: 8 }}
                    />
                    <YAxis style={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="total_worn_count"
                      fill="#8b5cf6"
                      name="Worn"
                      radius={[8, 8, 0, 0]}
                    />
                    <Bar
                      dataKey="total_link_clicks"
                      fill="#3b82f6"
                      name="Clicks"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[400px] text-muted-foreground tracking-tight">
                  Not enough data to display
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      {/* Product Metrics */}
      <div className="bg-muted border border-border rounded-2xl p-6">
        {loading ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-6 w-48 bg-neutral-200 rounded mb-6" />
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-neutral-100 rounded-xl" />
              ))}
            </div>
          </div>
        ) : (
          <div>
            <h3 className="text-lg font-bold tracking-tight mb-6">
              Product Metrics
            </h3>
            <div className="space-y-3">
              {productsMetrics.length > 0 ? (
                productsMetrics.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-4 bg-neutral-50 border border-border rounded-xl"
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-14 h-14 rounded-xl overflow-hidden border border-border bg-white p-2 flex-shrink-0">
                        <img
                          src={product.images?.[0] || "/placeholder.png"}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-semibold tracking-tight truncate">
                          {product.name}
                        </h4>
                        <p className="text-sm text-muted-foreground capitalize tracking-tight">
                          {product.category}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-6 text-sm">
                      <div className="text-center">
                        <div className="text-xl font-bold tracking-tighter text-purple-600">
                          {product.total_worn_count}
                        </div>
                        <div className="text-xs text-muted-foreground tracking-tight">
                          Worn
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold tracking-tighter text-blue-600">
                          {product.total_link_clicks}
                        </div>
                        <div className="text-xs text-muted-foreground tracking-tight">
                          Clicks
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold tracking-tighter text-green-600">
                          {product.total_worn_count > 0
                            ? (
                                (product.total_link_clicks /
                                  product.total_worn_count) *
                                100
                              ).toFixed(0)
                            : "0"}
                          %
                        </div>
                        <div className="text-xs text-muted-foreground tracking-tight">
                          Rate
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-muted-foreground tracking-tight">
                  No products with metrics yet
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Top 10 Most Worn Products */}
    </div>
  );
}
