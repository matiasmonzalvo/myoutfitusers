"use client";

import { useState, useEffect } from "react";
import {
  getBrandProductsMetrics,
  getBrandDailyMetrics,
  getBrandMetricsSummary,
  getTopProducts,
  type ProductMetrics,
  type DailyMetrics,
  type BrandMetricsSummary,
} from "@/lib/actions/metrics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, ShoppingBag, TrendingUp, Package } from "lucide-react";
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

interface ProductMetricsProps {
  brandId: string;
}

export function ProductMetricsComponent({ brandId }: ProductMetricsProps) {
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
  const [selectedDays, setSelectedDays] = useState<7 | 30>(30);

  useEffect(() => {
    loadMetrics();
  }, [brandId, selectedDays]);

  const loadMetrics = async () => {
    setLoading(true);
    try {
      const [products, daily, summaryData, top] = await Promise.all([
        getBrandProductsMetrics(brandId),
        getBrandDailyMetrics(brandId, selectedDays),
        getBrandMetricsSummary(brandId),
        getTopProducts(brandId, 5, "worn"),
      ]);

      setProductsMetrics(products);
      setDailyMetrics(daily);
      setSummary(summaryData);
      setTopProducts(top);
    } catch (error) {
      console.error("Error loading metrics:", error);
    } finally {
      setLoading(false);
    }
  };

  // Formatear datos para el gráfico de líneas
  const chartData = dailyMetrics
    .map((metric) => {
      // Parsear la fecha correctamente sin conversión de zona horaria
      const [year, month, day] = metric.event_date.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      
      return {
        date: date.toLocaleDateString("es-ES", {
          month: "short",
          day: "numeric",
        }),
        Vestidos: metric.worn_count,
        "Clics en Link": metric.link_clicks,
        "Vistas": metric.product_views,
        "Descargas": metric.outfit_downloads,
        "Guardados": metric.outfit_saves,
      };
    })
    .reverse(); // Invertir para mostrar del más antiguo al más reciente

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Cargando métricas...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Productos
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.total_products}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Vestidos
            </CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.total_worn_count}</div>
            <p className="text-xs text-muted-foreground">
              Veces que se agregaron al outfit
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Clics en Links
            </CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary.total_link_clicks}
            </div>
            <p className="text-xs text-muted-foreground">
              Veces que visitaron el producto
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Vistas
            </CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary.total_product_views}
            </div>
            <p className="text-xs text-muted-foreground">
              Veces que vieron el producto
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Outfits Descargados
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary.total_outfit_downloads}
            </div>
            <p className="text-xs text-muted-foreground">
              Productos en outfits descargados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Outfits Guardados
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary.total_outfit_saves}
            </div>
            <p className="text-xs text-muted-foreground">
              Productos en outfits guardados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eventos Hoy</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.events_today}</div>
            <p className="text-xs text-muted-foreground">
              Interacciones de hoy
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different views */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="products">Por Producto</TabsTrigger>
          <TabsTrigger value="top">Top Productos</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Tendencia de Interacciones</CardTitle>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedDays(7)}
                    className={`px-3 py-1 text-sm rounded-md ${
                      selectedDays === 7
                        ? "bg-primary text-white"
                        : "bg-muted text-foreground"
                    }`}
                  >
                    7 días
                  </button>
                  <button
                    onClick={() => setSelectedDays(30)}
                    className={`px-3 py-1 text-sm rounded-md ${
                      selectedDays === 30
                        ? "bg-primary text-white"
                        : "bg-muted text-foreground"
                    }`}
                  >
                    30 días
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="Vestidos"
                      stroke="#8b5cf6"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="Clics en Link"
                      stroke="#3b82f6"
                      strokeWidth={2}
                    />
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
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  No hay datos para mostrar en este período
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Métricas por Producto</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {productsMetrics.length > 0 ? (
                  productsMetrics.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <img
                          src={product.images?.[0] || "/placeholder.png"}
                          alt={product.name}
                          className="w-16 h-16 object-cover rounded-md"
                        />
                        <div>
                          <h3 className="font-semibold">{product.name}</h3>
                          <p className="text-sm text-muted-foreground capitalize">
                            {product.category}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-4 text-sm flex-wrap">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600">
                            {product.total_worn_count}
                          </div>
                          <div className="text-muted-foreground text-xs">Vestidos</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            {product.total_link_clicks}
                          </div>
                          <div className="text-muted-foreground text-xs">Clics</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {product.total_product_views}
                          </div>
                          <div className="text-muted-foreground text-xs">Vistas</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-orange-600">
                            {product.total_outfit_downloads}
                          </div>
                          <div className="text-muted-foreground text-xs">Descargas</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-red-600">
                            {product.total_outfit_saves}
                          </div>
                          <div className="text-muted-foreground text-xs">Guardados</div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No hay productos con métricas todavía
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Top Products Tab */}
        <TabsContent value="top" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top 5 Productos Más Vestidos</CardTitle>
            </CardHeader>
            <CardContent>
              {topProducts.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={topProducts}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="name"
                      angle={-45}
                      textAnchor="end"
                      height={100}
                    />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="total_worn_count"
                      fill="#8b5cf6"
                      name="Vestidos"
                    />
                    <Bar
                      dataKey="total_link_clicks"
                      fill="#3b82f6"
                      name="Clics"
                    />
                    <Bar
                      dataKey="total_product_views"
                      fill="#10b981"
                      name="Vistas"
                    />
                    <Bar
                      dataKey="total_outfit_downloads"
                      fill="#f59e0b"
                      name="Descargas"
                    />
                    <Bar
                      dataKey="total_outfit_saves"
                      fill="#ef4444"
                      name="Guardados"
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  No hay datos suficientes para mostrar
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
