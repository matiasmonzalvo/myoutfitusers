"use client";

import { useState, useEffect } from "react";
import { getBrandMetricsSummary, getTopProducts, type BrandMetricsSummary, type ProductMetrics } from "@/lib/actions/metrics";
import { Package, ShoppingBag, Eye, Download, Heart, TrendingUp, ArrowRight } from "lucide-react";
import Link from "next/link";

interface AdminHomeViewProps {
  brandId: string;
}

export function AdminHomeView({ brandId }: AdminHomeViewProps) {
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

  useEffect(() => {
    loadData();
  }, [brandId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [summaryData, top] = await Promise.all([
        getBrandMetricsSummary(brandId),
        getTopProducts(brandId, 3, "worn"),
      ]);

      setSummary(summaryData);
      setTopProducts(top);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

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
        <h1 className="text-4xl font-bold tracking-tighter text-foreground">Panel de Control</h1>
        <p className="text-muted-foreground mt-2 tracking-tight">
          Resumen general de tu marca en MyOutfit
        </p>
      </div>

      {/* Métricas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white border border-border rounded-2xl p-6 hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-neutral-100 rounded-full">
              <Package className="h-5 w-5 text-foreground" />
            </div>
          </div>
          <div className="text-3xl font-bold tracking-tighter">{summary.total_products}</div>
          <p className="text-sm text-muted-foreground mt-1 tracking-tight">
            Productos activos en catálogo
          </p>
        </div>

        <div className="bg-white border border-border rounded-2xl p-6 hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-purple-50 rounded-full">
              <ShoppingBag className="h-5 w-5 text-purple-600" />
            </div>
          </div>
          <div className="text-3xl font-bold tracking-tighter">{summary.total_worn_count}</div>
          <p className="text-sm text-muted-foreground mt-1 tracking-tight">
            Veces agregados a outfits
          </p>
        </div>

        <div className="bg-white border border-border rounded-2xl p-6 hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-blue-50 rounded-full">
              <Eye className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <div className="text-3xl font-bold tracking-tighter">{summary.total_link_clicks}</div>
          <p className="text-sm text-muted-foreground mt-1 tracking-tight">
            Visitas a tus productos
          </p>
        </div>

        <div className="bg-white border border-border rounded-2xl p-6 hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-green-50 rounded-full">
              <Eye className="h-5 w-5 text-green-600" />
            </div>
          </div>
          <div className="text-3xl font-bold tracking-tighter">{summary.total_product_views}</div>
          <p className="text-sm text-muted-foreground mt-1 tracking-tight">
            Visualizaciones de productos
          </p>
        </div>

        <div className="bg-white border border-border rounded-2xl p-6 hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-orange-50 rounded-full">
              <Download className="h-5 w-5 text-orange-600" />
            </div>
          </div>
          <div className="text-3xl font-bold tracking-tighter">{summary.total_outfit_downloads}</div>
          <p className="text-sm text-muted-foreground mt-1 tracking-tight">
            Outfits descargados
          </p>
        </div>

        <div className="bg-white border border-border rounded-2xl p-6 hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-red-50 rounded-full">
              <Heart className="h-5 w-5 text-red-600" />
            </div>
          </div>
          <div className="text-3xl font-bold tracking-tighter">{summary.total_outfit_saves}</div>
          <p className="text-sm text-muted-foreground mt-1 tracking-tight">
            Outfits guardados
          </p>
        </div>
      </div>

      {/* Actividad de Hoy */}
      <div className="bg-white border border-border rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-neutral-100 rounded-full">
            <TrendingUp className="h-5 w-5" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">Actividad de Hoy</h2>
        </div>
        <div className="text-4xl font-bold tracking-tighter">{summary.events_today}</div>
        <p className="text-sm text-muted-foreground mt-2 tracking-tight">
          Interacciones totales en las últimas 24 horas
        </p>
      </div>

      {/* Top 3 Productos */}
      <div className="bg-white border border-border rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold tracking-tight">Top 3 Productos Más Vestidos</h2>
          <Link 
            href="/admin/performance"
            className="text-sm text-primary hover:underline font-medium tracking-tight flex items-center gap-1"
          >
            Ver todo
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {topProducts.length > 0 ? (
          <div className="space-y-3">
            {topProducts.map((product, index) => (
              <div
                key={product.id}
                className="flex items-center gap-4 p-4 bg-neutral-50 border border-border rounded-xl hover:bg-neutral-100 transition-colors"
              >
                <div className="text-2xl font-bold tracking-tighter text-muted-foreground w-8">
                  #{index + 1}
                </div>
                <div className="w-16 h-16 rounded-xl overflow-hidden border border-border bg-white p-2">
                  <img
                    src={product.images?.[0] || "/placeholder.png"}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold tracking-tight truncate">{product.name}</h3>
                  <p className="text-sm text-muted-foreground capitalize tracking-tight">
                    {product.category}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold tracking-tighter text-purple-600">
                    {product.total_worn_count}
                  </div>
                  <div className="text-xs text-muted-foreground tracking-tight">vestidos</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <p className="tracking-tight">No hay datos suficientes todavía</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/admin/products">
          <div className="bg-white border border-border rounded-2xl p-6 hover:shadow-md hover:border-primary transition-all cursor-pointer group">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-neutral-100 rounded-full group-hover:bg-primary/10 transition-colors">
                <Package className="h-5 w-5 group-hover:text-primary transition-colors" />
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <h3 className="text-lg font-bold tracking-tight mb-2">Gestionar Productos</h3>
            <p className="text-sm text-muted-foreground tracking-tight">
              Agregar, editar o eliminar productos de tu catálogo
            </p>
          </div>
        </Link>

        <Link href="/admin/performance">
          <div className="bg-white border border-border rounded-2xl p-6 hover:shadow-md hover:border-primary transition-all cursor-pointer group">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-neutral-100 rounded-full group-hover:bg-primary/10 transition-colors">
                <TrendingUp className="h-5 w-5 group-hover:text-primary transition-colors" />
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <h3 className="text-lg font-bold tracking-tight mb-2">Ver Performance</h3>
            <p className="text-sm text-muted-foreground tracking-tight">
              Analiza el rendimiento de tus productos
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}
