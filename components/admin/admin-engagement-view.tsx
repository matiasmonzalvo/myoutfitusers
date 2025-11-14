"use client";

import { useState, useEffect } from "react";
import {
  getBrandProductsMetrics,
  getBrandDailyMetrics,
  getBrandMetricsSummary,
  type ProductMetrics,
  type DailyMetrics,
  type BrandMetricsSummary,
} from "@/lib/actions/metrics";
import { Download, Heart, Eye } from "lucide-react";
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

interface AdminEngagementViewProps {
  brandId: string;
}

export function AdminEngagementView({ brandId }: AdminEngagementViewProps) {
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
  const [loading, setLoading] = useState(true);
  const [selectedDays, setSelectedDays] = useState<7 | 30>(30);
  const [activeTab, setActiveTab] = useState<"overview" | "products" | "downloads" | "saves">("overview");

  useEffect(() => {
    loadMetrics();
  }, [brandId, selectedDays]);

  const loadMetrics = async () => {
    setLoading(true);
    try {
      const [products, daily, summaryData] = await Promise.all([
        getBrandProductsMetrics(brandId),
        getBrandDailyMetrics(brandId, selectedDays),
        getBrandMetricsSummary(brandId),
      ]);

      setProductsMetrics(products);
      setDailyMetrics(daily);
      setSummary(summaryData);
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
        date: date.toLocaleDateString("es-ES", {
          month: "short",
          day: "numeric",
        }),
        Vistas: metric.product_views,
        Descargas: metric.outfit_downloads,
        Guardados: metric.outfit_saves,
      };
    })
    .reverse();

  const topByDownloads = [...productsMetrics]
    .sort((a, b) => b.total_outfit_downloads - a.total_outfit_downloads)
    .slice(0, 10);

  const topBySaves = [...productsMetrics]
    .sort((a, b) => b.total_outfit_saves - a.total_outfit_saves)
    .slice(0, 10);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-3 border-gray-300 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold tracking-tighter">Engagement</h1>
        <p className="text-muted-foreground mt-2 tracking-tight">
          Métricas de vistas, descargas y guardados
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-green-50 rounded-full">
              <Eye className="h-5 w-5 text-green-600" />
            </div>
          </div>
          <div className="text-3xl font-bold tracking-tighter">
            {summary.total_product_views}
          </div>
          <p className="text-sm text-muted-foreground mt-1 tracking-tight">
            Total Vistas
          </p>
        </div>

        <div className="bg-white border border-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-orange-50 rounded-full">
              <Download className="h-5 w-5 text-orange-600" />
            </div>
          </div>
          <div className="text-3xl font-bold tracking-tighter">
            {summary.total_outfit_downloads}
          </div>
          <p className="text-sm text-muted-foreground mt-1 tracking-tight">
            Outfits Descargados
          </p>
        </div>

        <div className="bg-white border border-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-red-50 rounded-full">
              <Heart className="h-5 w-5 text-red-600" />
            </div>
          </div>
          <div className="text-3xl font-bold tracking-tighter">
            {summary.total_outfit_saves}
          </div>
          <p className="text-sm text-muted-foreground mt-1 tracking-tight">
            Outfits Guardados
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border border-border rounded-2xl overflow-hidden">
        {/* Tab Headers */}
        <div className="border-b border-border p-2 flex gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2 rounded-full font-medium tracking-tight transition-colors whitespace-nowrap ${
              activeTab === "overview"
                ? "bg-primary text-white"
                : "hover:bg-neutral-100 text-foreground"
            }`}
          >
            Resumen
          </button>
          <button
            onClick={() => setActiveTab("products")}
            className={`px-4 py-2 rounded-full font-medium tracking-tight transition-colors whitespace-nowrap ${
              activeTab === "products"
                ? "bg-primary text-white"
                : "hover:bg-neutral-100 text-foreground"
            }`}
          >
            Por Producto
          </button>
          <button
            onClick={() => setActiveTab("downloads")}
            className={`px-4 py-2 rounded-full font-medium tracking-tight transition-colors whitespace-nowrap ${
              activeTab === "downloads"
                ? "bg-primary text-white"
                : "hover:bg-neutral-100 text-foreground"
            }`}
          >
            Top Descargas
          </button>
          <button
            onClick={() => setActiveTab("saves")}
            className={`px-4 py-2 rounded-full font-medium tracking-tight transition-colors whitespace-nowrap ${
              activeTab === "saves"
                ? "bg-primary text-white"
                : "hover:bg-neutral-100 text-foreground"
            }`}
          >
            Top Guardados
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === "overview" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold tracking-tight">Tendencia de Engagement</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedDays(7)}
                    className={`px-4 py-2 text-sm rounded-full font-medium tracking-tight transition-colors ${
                      selectedDays === 7
                        ? "bg-primary text-white"
                        : "bg-neutral-100 text-foreground hover:bg-neutral-200"
                    }`}
                  >
                    7 días
                  </button>
                  <button
                    onClick={() => setSelectedDays(30)}
                    className={`px-4 py-2 text-sm rounded-full font-medium tracking-tight transition-colors ${
                      selectedDays === 30
                        ? "bg-primary text-white"
                        : "bg-neutral-100 text-foreground hover:bg-neutral-200"
                    }`}
                  >
                    30 días
                  </button>
                </div>
              </div>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date" style={{ fontSize: 12 }} />
                    <YAxis style={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="Vistas"
                      stroke="#10b981"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="Descargas"
                      stroke="#f59e0b"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="Guardados"
                      stroke="#ef4444"
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

          {activeTab === "products" && (
            <div>
              <h3 className="text-lg font-bold tracking-tight mb-6">Métricas de Engagement por Producto</h3>
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
                          <h4 className="font-semibold tracking-tight truncate">{product.name}</h4>
                          <p className="text-sm text-muted-foreground capitalize tracking-tight">
                            {product.category}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-6 text-sm">
                        <div className="text-center">
                          <div className="text-xl font-bold tracking-tighter text-green-600">
                            {product.total_product_views}
                          </div>
                          <div className="text-xs text-muted-foreground tracking-tight">
                            Vistas
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-xl font-bold tracking-tighter text-orange-600">
                            {product.total_outfit_downloads}
                          </div>
                          <div className="text-xs text-muted-foreground tracking-tight">
                            Descargas
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-xl font-bold tracking-tighter text-red-600">
                            {product.total_outfit_saves}
                          </div>
                          <div className="text-xs text-muted-foreground tracking-tight">
                            Guardados
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-muted-foreground tracking-tight">
                    No hay productos con métricas todavía
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "downloads" && (
            <div>
              <h3 className="text-lg font-bold tracking-tight mb-6">Top 10 Productos Más Descargados</h3>
              {topByDownloads.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={topByDownloads}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="name"
                      angle={-45}
                      textAnchor="end"
                      height={120}
                      style={{ fontSize: 11 }}
                    />
                    <YAxis style={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="total_outfit_downloads"
                      fill="#f59e0b"
                      name="Descargas"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[400px] text-muted-foreground tracking-tight">
                  No hay datos suficientes para mostrar
                </div>
              )}
            </div>
          )}

          {activeTab === "saves" && (
            <div>
              <h3 className="text-lg font-bold tracking-tight mb-6">Top 10 Productos Más Guardados</h3>
              {topBySaves.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={topBySaves}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="name"
                      angle={-45}
                      textAnchor="end"
                      height={120}
                      style={{ fontSize: 11 }}
                    />
                    <YAxis style={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="total_outfit_saves"
                      fill="#ef4444"
                      name="Guardados"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[400px] text-muted-foreground tracking-tight">
                  No hay datos suficientes para mostrar
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
